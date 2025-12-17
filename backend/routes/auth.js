/**
 * Authentication Routes
 * Handles Microsoft authentication via Playwright
 */

const express = require('express');
const router = express.Router();
const { chromium } = require('playwright');

const APMANAGER_BASE_URL = process.env.APMANAGER_BASE_URL || 'https://apmanager.aplatam.com';
const LOGIN_TIMEOUT = 60000;

/**
 * POST /api/auth/microsoft
 * Authenticate user with Microsoft credentials
 */
router.post('/microsoft', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  let browser;
  let context;
  
  try {
    console.log(`[Auth] Attempting login for: ${email}`);
    
    // Launch browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to APManager login
    await page.goto(`${APMANAGER_BASE_URL}/admin/account/login`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Click Microsoft login button
    await page.click('button:has-text("Microsoft")', { timeout: 10000 });
    
    // Wait for Microsoft login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Enter email
    await page.fill('input[type="email"]', email);
    await page.click('input[type="submit"]');
    
    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    // Enter password
    await page.fill('input[type="password"]', password);
    await page.click('input[type="submit"]');
    
    // Wait for redirect to APManager (not login page)
    await page.waitForURL(url => !url.includes('/login'), {
      timeout: LOGIN_TIMEOUT
    });
    
    // Check if we're logged in
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes('/login') && currentUrl.includes('apmanager');
    
    if (isLoggedIn) {
      console.log(`[Auth] Login successful for: ${email}`);
      res.json({
        success: true,
        message: 'Authentication successful',
        user: { email }
      });
    } else {
      console.log(`[Auth] Login failed for: ${email}`);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('[Auth] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed: ' + error.message
    });
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
});

module.exports = router;
