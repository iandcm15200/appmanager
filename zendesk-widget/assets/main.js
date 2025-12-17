/**
 * APManager Student Search Widget for Zendesk
 * Clean Code Architecture with SOLID Principles
 */

// ==================== CONSTANTS AND CONFIGURATION ====================

const CONFIG = {
  APMANAGER_BASE_URL: 'https://apmanager.aplatam.com',
  SEARCH_TIMEOUT_MS: 80000,
  ANIMATION_DURATION: 600,
  TIPIFICACION_CONFIG: {
    tipoActividad: '1 - Llamada Saliente',
    tipoContacto: 'Seguimiento',
    resultado: 'Actividades Retención',
    tipificacion: 'Seguimiento académico'
  }
};

// ==================== STATE MANAGEMENT ====================

const state = {
  client: null,
  apiUrl: null,
  credentials: null,
  currentStudent: null,
  ticketData: null,
  translations: {}
};

// ==================== INITIALIZATION ====================

/**
 * Initialize the Zendesk widget
 */
async function init() {
  try {
    state.client = ZAFClient.init();
    
    // Get API URL from settings
    const settings = await state.client.metadata();
    state.apiUrl = settings.settings.api_url || 'http://localhost:3000';
    
    // Load translations
    await loadTranslations();
    
    // Replace translation placeholders
    replaceTranslationPlaceholders();
    
    // Check for stored credentials
    const storedCredentials = getStoredCredentials();
    
    if (storedCredentials) {
      state.credentials = storedCredentials;
      await showMainContent();
      await performAutoSearch();
    } else {
      showAuthModal();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Resize app
    resizeApp();
  } catch (error) {
    console.error('Initialization error:', error);
    showError(t('errors.init_error'), error.message);
  }
}

/**
 * Load translations from Zendesk
 */
async function loadTranslations() {
  try {
    const locale = await state.client.get('currentUser.locale');
    const userLocale = locale['currentUser.locale'] || 'es';
    
    // Translations are already loaded by Zendesk framework
    // We just need to store the locale
    state.locale = userLocale;
  } catch (error) {
    console.error('Error loading translations:', error);
    state.locale = 'es';
  }
}

/**
 * Translation helper function
 * @param {string} key - Translation key
 * @param {Object} params - Parameters for interpolation
 * @returns {string} Translated text
 */
function t(key, params = {}) {
  try {
    let text = state.client.get(`i18n.${key}`);
    
    // Simple interpolation
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    
    return text;
  } catch (error) {
    return key;
  }
}

/**
 * Replace translation placeholders in HTML
 */
function replaceTranslationPlaceholders() {
  // This is handled by Zendesk's framework automatically
  // when using {{t "key"}} syntax in HTML
}

// ==================== AUTHENTICATION ====================

/**
 * Show authentication modal with animation
 */
function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.style.display = 'flex';
  
  // Animate modal entrance
  anime({
    targets: '#auth-modal .modal-content',
    opacity: [0, 1],
    scale: [0.8, 1],
    translateY: [-50, 0],
    duration: CONFIG.ANIMATION_DURATION,
    easing: 'easeOutElastic(1, .8)'
  });
  
  resizeApp();
}

/**
 * Hide authentication modal with animation
 */
function hideAuthModal() {
  anime({
    targets: '#auth-modal .modal-content',
    opacity: [1, 0],
    scale: [1, 0.8],
    translateY: [0, -50],
    duration: 300,
    easing: 'easeInCubic',
    complete: () => {
      document.getElementById('auth-modal').style.display = 'none';
    }
  });
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Validate credentials
  if (!validateCredentials(email, password)) {
    return;
  }
  
  const loginBtn = document.getElementById('login-btn');
  setButtonLoading(loginBtn, true);
  
  try {
    const response = await authenticateUser(email, password);
    
    if (response.success) {
      state.credentials = { email, password };
      storeCredentials(email, password);
      
      hideAuthModal();
      await showMainContent();
      await performAutoSearch();
    } else {
      await state.client.invoke('notify', t('errors.invalid_credentials'), 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    await state.client.invoke('notify', t('errors.invalid_credentials'), 'error');
  } finally {
    setButtonLoading(loginBtn, false);
  }
}

/**
 * Validate user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} Validation result
 */
function validateCredentials(email, password) {
  if (!email || !password) {
    state.client.invoke('notify', t('errors.auth_required'), 'error');
    return false;
  }
  
  if (!isEmailValid(email)) {
    state.client.invoke('notify', t('errors.invalid_email'), 'error');
    return false;
  }
  
  return true;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Validation result
 */
function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Authenticate user with backend
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication response
 */
async function authenticateUser(email, password) {
  const response = await fetch(`${state.apiUrl}/api/auth/microsoft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  return await response.json();
}

/**
 * Store credentials in localStorage
 * @param {string} email - User email
 * @param {string} password - User password
 */
function storeCredentials(email, password) {
  const credentials = btoa(JSON.stringify({ email, password }));
  localStorage.setItem('apmanager_credentials', credentials);
}

/**
 * Get stored credentials from localStorage
 * @returns {Object|null} Stored credentials or null
 */
function getStoredCredentials() {
  try {
    const stored = localStorage.getItem('apmanager_credentials');
    if (!stored) return null;
    
    return JSON.parse(atob(stored));
  } catch (error) {
    console.error('Error reading credentials:', error);
    return null;
  }
}

/**
 * Clear stored credentials
 */
function clearCredentials() {
  localStorage.removeItem('apmanager_credentials');
  state.credentials = null;
}

/**
 * Handle logout
 */
function handleLogout() {
  clearCredentials();
  document.getElementById('main-content').style.display = 'none';
  showAuthModal();
}

// ==================== MAIN CONTENT ====================

/**
 * Show main content with animation
 */
async function showMainContent() {
  const mainContent = document.getElementById('main-content');
  mainContent.style.display = 'block';
  
  anime({
    targets: '#main-content',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 400,
    easing: 'easeOutCubic'
  });
  
  resizeApp();
}

// ==================== SEARCH FUNCTIONALITY ====================

/**
 * Perform automatic search on ticket load
 */
async function performAutoSearch() {
  try {
    // Extract ticket data
    state.ticketData = await extractTicketData();
    
    if (!state.ticketData || (!state.ticketData.email && !state.ticketData.phone)) {
      showError(t('errors.title'), t('search.no_data'));
      return;
    }
    
    // Determine search term
    const searchTerm = state.ticketData.email || state.ticketData.phone;
    
    // Show search status
    showSearchStatus(searchTerm);
    
    // Perform search
    const result = await searchStudent(searchTerm);
    
    if (result && result.success && result.student) {
      state.currentStudent = result.student;
      showResults(result.student);
    } else {
      showError(t('errors.title'), t('errors.message', { term: searchTerm }));
    }
  } catch (error) {
    console.error('Search error:', error);
    showError(t('errors.title'), t('errors.search_error'));
  }
}

/**
 * Extract ticket data using ZAF SDK
 * @returns {Promise<Object>} Ticket data
 */
async function extractTicketData() {
  const data = await state.client.get([
    'ticket.requester.email',
    'ticket.requester.phone',
    'ticket.id',
    'ticket.requester.name'
  ]);
  
  return {
    email: data['ticket.requester.email'],
    phone: data['ticket.requester.phone'],
    ticketId: data['ticket.id'],
    name: data['ticket.requester.name']
  };
}

/**
 * Search for student in database and APManager
 * @param {string} searchTerm - Email or phone to search
 * @returns {Promise<Object>} Search result
 */
async function searchStudent(searchTerm) {
  const response = await fetch(`${state.apiUrl}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      searchTerm,
      email: state.credentials.email,
      password: state.credentials.password
    })
  });
  
  return await response.json();
}

/**
 * Show search status with animation
 * @param {string} searchTerm - Search term being used
 */
function showSearchStatus(searchTerm) {
  const statusContainer = document.getElementById('search-status');
  const statusText = document.querySelector('.status-text');
  
  statusText.textContent = t('search.status_searching_term', { term: searchTerm });
  statusContainer.style.display = 'block';
  
  // Hide other containers
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('error-container').style.display = 'none';
  
  // Animate progress bar
  anime({
    targets: '.progress-fill',
    width: ['0%', '100%'],
    duration: 2000,
    easing: 'easeInOutQuad',
    loop: true
  });
  
  anime({
    targets: '.status-icon',
    scale: [1, 1.2, 1],
    duration: 2000,
    easing: 'easeInOutQuad',
    loop: true
  });
  
  resizeApp();
}

/**
 * Hide search status
 */
function hideSearchStatus() {
  document.getElementById('search-status').style.display = 'none';
}

// ==================== RESULTS DISPLAY ====================

/**
 * Show search results with animation
 * @param {Object} student - Student data
 */
function showResults(student) {
  hideSearchStatus();
  
  const resultsContainer = document.getElementById('results-container');
  const errorContainer = document.getElementById('error-container');
  
  // Hide error, show results
  errorContainer.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  // Populate student data
  document.querySelector('.student-name').textContent = student.nombre || t('results.no_name');
  document.querySelector('.student-id').textContent = t('results.student_id', { id: student.lead_id });
  document.querySelector('.student-email').textContent = student.email || t('results.no_data');
  document.querySelector('.student-phone').textContent = student.telefono || t('results.no_data');
  document.querySelector('.student-program').textContent = student.programa || t('results.no_data');
  document.querySelector('.student-registration').textContent = student.matricula || t('results.no_data');
  document.querySelector('.student-status').textContent = student.estado || t('results.no_data');
  
  // Set APManager link
  const apmanagerLink = document.getElementById('apmanager-link');
  apmanagerLink.href = `${CONFIG.APMANAGER_BASE_URL}/admin/Ventas/Consulta/Lead/${student.lead_id}`;
  
  // Animate result card
  anime({
    targets: '.result-card',
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    easing: 'easeOutCubic'
  });
  
  resizeApp();
}

// ==================== ERROR HANDLING ====================

/**
 * Show error message with animation
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function showError(title, message) {
  hideSearchStatus();
  
  const resultsContainer = document.getElementById('results-container');
  const errorContainer = document.getElementById('error-container');
  
  // Hide results, show error
  resultsContainer.style.display = 'none';
  errorContainer.style.display = 'block';
  
  // Set error content
  document.querySelector('.error-title').textContent = title;
  document.querySelector('.error-message').textContent = message;
  
  // Animate error card
  anime({
    targets: '.error-card',
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 400,
    easing: 'easeOutBack'
  });
  
  resizeApp();
}

// ==================== TIPIFICACION ====================

/**
 * Handle tipificacion button click
 */
async function handleTipificacion() {
  if (!state.currentStudent || !state.ticketData) {
    await state.client.invoke('notify', t('notifications.no_student_data'), 'error');
    return;
  }
  
  const tipificacionBtn = document.getElementById('tipificacion-btn');
  setButtonLoading(tipificacionBtn, true);
  
  try {
    const response = await applyTipificacion(
      state.currentStudent.lead_id,
      state.ticketData.ticketId
    );
    
    if (response.success) {
      await state.client.invoke('notify', t('notifications.tipificacion_success'), 'success');
      
      // Animate button completion
      anime({
        targets: '#tipificacion-btn',
        scale: [1, 1.1, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      await state.client.invoke('notify', t('notifications.tipificacion_error'), 'error');
    }
  } catch (error) {
    console.error('Tipificacion error:', error);
    await state.client.invoke('notify', t('notifications.tipificacion_error'), 'error');
  } finally {
    setButtonLoading(tipificacionBtn, false);
  }
}

/**
 * Apply tipificacion via backend
 * @param {string} leadId - Student lead ID
 * @param {string} ticketId - Zendesk ticket ID
 * @returns {Promise<Object>} Tipificacion response
 */
async function applyTipificacion(leadId, ticketId) {
  const response = await fetch(`${state.apiUrl}/api/tipificacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      leadId,
      ticketId,
      email: state.credentials.email,
      password: state.credentials.password
    })
  });
  
  return await response.json();
}

// ==================== UI UTILITIES ====================

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 */
function setButtonLoading(button, isLoading) {
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');
  
  if (isLoading) {
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    button.disabled = true;
    
    // Animate loader
    anime({
      targets: btnLoader,
      rotate: '1turn',
      duration: 1000,
      easing: 'linear',
      loop: true
    });
  } else {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    button.disabled = false;
  }
}

/**
 * Resize app iframe to fit content
 */
function resizeApp() {
  if (state.client) {
    state.client.invoke('resize', { width: '100%', height: '600px' });
  }
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Auth form
  document.getElementById('auth-form').addEventListener('submit', handleLogin);
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Retry button
  document.getElementById('retry-btn').addEventListener('click', performAutoSearch);
  
  // Tipificacion button
  document.getElementById('tipificacion-btn').addEventListener('click', handleTipificacion);
  
  // Button hover animations
  setupButtonHoverAnimations();
}

/**
 * Setup button hover animations
 */
function setupButtonHoverAnimations() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
      if (!button.disabled) {
        anime({
          targets: e.currentTarget,
          scale: 1.05,
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    });
    
    button.addEventListener('mouseleave', (e) => {
      anime({
        targets: e.currentTarget,
        scale: 1,
        duration: 300,
        easing: 'easeOutQuad'
      });
    });
  });
}

// ==================== INITIALIZATION ====================

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
