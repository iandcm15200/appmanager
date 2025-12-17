/**
 * Search Routes
 * Handles student search in SQLite DB and APManager
 */

const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const { chromium } = require('playwright');
const path = require('path');

const APMANAGER_BASE_URL = process.env.APMANAGER_BASE_URL || 'https://apmanager.aplatam.com';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../estudiantes.db');
const SEARCH_TIMEOUT = 80000;

/**
 * Generate phone variations for search
 * @param {string} phone - Original phone number
 * @returns {Array<string>} Phone variations
 */
function generatePhoneVariations(phone) {
  if (!phone) return [];
  
  const cleanPhone = phone.replace(/\D/g, '');
  const variations = [
    cleanPhone,
    cleanPhone.slice(-9),
    `593${cleanPhone.slice(-9)}`,
    `+593${cleanPhone.slice(-9)}`
  ];
  
  return [...new Set(variations)];
}

/**
 * Search student in SQLite database
 * @param {string} searchTerm - Email or phone
 * @returns {Object|null} Student data or null
 */
function searchInDatabase(searchTerm) {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // Try email search first
    if (searchTerm.includes('@')) {
      const stmt = db.prepare('SELECT * FROM estudiantes WHERE email = ? LIMIT 1');
      const result = stmt.get(searchTerm);
      db.close();
      return result || null;
    }
    
    // Phone search with variations
    const phoneVariations = generatePhoneVariations(searchTerm);
    for (const variation of phoneVariations) {
      const stmt = db.prepare('SELECT * FROM estudiantes WHERE telefono LIKE ? LIMIT 1');
      const result = stmt.get(`%${variation}%`);
      if (result) {
        db.close();
        return result;
      }
    }
    
    db.close();
    return null;
  } catch (error) {
    console.error('[DB Search] Error:', error.message);
    return null;
  }
}

/**
 * Search student in APManager via Playwright
 * @param {string} searchTerm - Email or phone
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} Student data or null
 */
async function searchInAPManager(searchTerm, email, password) {
  let browser;
  let context;
  
  try {
    console.log(`[APManager Search] Starting search for: ${searchTerm}`);
    
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();
    
    // Login
    await page.goto(`${APMANAGER_BASE_URL}/admin/account/login`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.click('button:has-text("Microsoft")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', email);
    await page.click('input[type="submit"]');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', password);
    await page.click('input[type="submit"]');
    await page.waitForURL(url => !url.includes('/login'), { timeout: 60000 });
    
    // Navigate to student search
    await page.goto(`${APMANAGER_BASE_URL}/admin/Retencion/lead/agente`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Select institution
    await page.selectOption('select#InstitucionId', { label: 'UDLA Maestrías' });
    
    // Go to student search
    await page.goto(`${APMANAGER_BASE_URL}/admin/Alumno/Consulta/Index`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Set date range
    await page.fill('input#FechaInicio', '01/01/2020');
    
    // Open search panel
    await page.click('#busquedabtn');
    await page.waitForTimeout(1000);
    
    // Determine search type
    const isEmail = searchTerm.includes('@');
    if (isEmail) {
      await page.check('input[type="radio"][value="email"]');
      await page.fill('input#searchEmail', searchTerm);
    } else {
      await page.check('input[type="radio"][value="telefono"]');
      await page.fill('input#searchTelefono', searchTerm);
    }
    
    // Submit search
    await page.press(isEmail ? 'input#searchEmail' : 'input#searchTelefono', 'Enter');
    await page.waitForTimeout(3000);
    
    // Extract results
    const studentData = await page.evaluate(() => {
      const table = document.querySelector('#GridLead tbody');
      if (!table) return null;
      
      const row = table.querySelector('tr');
      if (!row) return null;
      
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return null;
      
      return {
        lead_id: cells[0].textContent.trim(),
        nombre: cells[1].textContent.trim(),
        email: cells[2].textContent.trim(),
        telefono: cells[3].textContent.trim(),
        programa: cells[4].textContent.trim(),
        matricula: cells[5]?.textContent.trim() || 'N/A',
        estado: 'activo'
      };
    });
    
    if (studentData) {
      console.log(`[APManager Search] Found: ${studentData.lead_id}`);
      
      // Save to database for caching
      try {
        const db = new Database(DB_PATH);
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO estudiantes 
          (lead_id, programa, email, telefono, nombre, matricula, estado, fuente, fecha_importacion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        stmt.run(
          studentData.lead_id,
          studentData.programa,
          studentData.email,
          studentData.telefono,
          studentData.nombre,
          studentData.matricula,
          studentData.estado,
          'apmanager_search'
        );
        db.close();
        console.log(`[DB] Cached student: ${studentData.lead_id}`);
      } catch (dbError) {
        console.error('[DB] Cache error:', dbError.message);
      }
    }
    
    return studentData;
  } catch (error) {
    console.error('[APManager Search] Error:', error.message);
    return null;
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

/**
 * POST /api/search
 * Search for student in DB and APManager
 */
router.post('/', async (req, res) => {
  const { searchTerm, email, password } = req.body;
  
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      error: 'Search term is required'
    });
  }
  
  try {
    console.log(`[Search] Starting search for: ${searchTerm}`);
    
    // Step 1: Search in database
    let student = searchInDatabase(searchTerm);
    
    if (student) {
      console.log(`[Search] Found in DB: ${student.lead_id}`);
      return res.json({
        success: true,
        student,
        source: 'database'
      });
    }
    
    // Step 2: Search in APManager
    console.log(`[Search] Not in DB, searching APManager...`);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Credentials required for APManager search'
      });
    }
    
    student = await searchInAPManager(searchTerm, email, password);
    
    if (student) {
      return res.json({
        success: true,
        student,
        source: 'apmanager'
      });
    }
    
    // No results found
    console.log(`[Search] No results for: ${searchTerm}`);
    res.json({
      success: false,
      error: 'Student not found'
    });
  } catch (error) {
    console.error('[Search] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed: ' + error.message
    });
  }
});

module.exports = router;
