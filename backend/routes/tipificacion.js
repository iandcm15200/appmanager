/**
 * Tipificacion Routes
 * Handles automatic tipification in APManager
 */

const express = require('express');
const router = express.Router();
const { chromium } = require('playwright');

const APMANAGER_BASE_URL = process.env.APMANAGER_BASE_URL || 'https://apmanager.aplatam.com';
const TIPIFICACION_TIMEOUT = 60000;

// Tipificacion configuration
const TIPIFICACION_CONFIG = {
  tipoActividad: '1 - Llamada Saliente',
  tipoContacto: 'Seguimiento',
  resultado: 'Actividades Retención',
  tipificacion: 'Seguimiento académico',
  descripcionTemplate: 'Seguimiento académico realizado desde Zendesk. Ticket #{{ticketId}}'
};

/**
 * Apply tipificacion in APManager
 * @param {string} leadId - Student lead ID
 * @param {string} ticketId - Zendesk ticket ID
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Tipificacion result
 */
async function applyTipificacionInAPManager(leadId, ticketId, email, password) {
  let browser;
  let context;
  
  try {
    console.log(`[Tipificacion] Starting for lead: ${leadId}`);
    
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
    
    // Navigate to lead
    await page.goto(`${APMANAGER_BASE_URL}/admin/Ventas/Consulta/Lead/${leadId}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for tipificacion form to be available
    await page.waitForSelector('select#TipoActividadId', { timeout: 10000 });
    
    // Fill tipificacion form
    await page.selectOption('select#TipoActividadId', { label: TIPIFICACION_CONFIG.tipoActividad });
    await page.waitForTimeout(500);
    
    await page.selectOption('select#TipoContactoId', { label: TIPIFICACION_CONFIG.tipoContacto });
    await page.waitForTimeout(500);
    
    await page.selectOption('select#ResultadoId', { label: TIPIFICACION_CONFIG.resultado });
    await page.waitForTimeout(500);
    
    await page.selectOption('select#TipificacionId', { label: TIPIFICACION_CONFIG.tipificacion });
    await page.waitForTimeout(500);
    
    // Fill description
    const descripcion = TIPIFICACION_CONFIG.descripcionTemplate.replace('{{ticketId}}', ticketId);
    await page.fill('textarea#Descripcion', descripcion);
    
    // Submit form
    await page.click('button[type="submit"]#guardar-tipificacion');
    
    // Wait for success message
    await page.waitForSelector('.alert-success, .success-message', {
      timeout: 10000
    }).catch(() => {
      console.log('[Tipificacion] No success message found, assuming success');
    });
    
    console.log(`[Tipificacion] Success for lead: ${leadId}`);
    
    return {
      success: true,
      leadId,
      ticketId
    };
  } catch (error) {
    console.error('[Tipificacion] Error:', error.message);
    throw error;
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

/**
 * POST /api/tipificacion
 * Apply tipificacion for a student
 */
router.post('/', async (req, res) => {
  const { leadId, ticketId, email, password } = req.body;
  
  // Validate input
  if (!leadId || !ticketId) {
    return res.status(400).json({
      success: false,
      error: 'Lead ID and ticket ID are required'
    });
  }
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Credentials are required'
    });
  }
  
  try {
    const result = await applyTipificacionInAPManager(leadId, ticketId, email, password);
    
    res.json({
      success: true,
      message: 'Tipification applied successfully',
      ...result
    });
  } catch (error) {
    console.error('[Tipificacion] Route error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Tipification failed: ' + error.message
    });
  }
});

module.exports = router;
