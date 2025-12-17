/**
 * APManager Widget Backend Server
 * Express.js API for Zendesk Widget Integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const tipificacionRoutes = require('./routes/tipificacion');

// Constants
const PORT = process.env.PORT || 3000;
const APMANAGER_BASE_URL = process.env.APMANAGER_BASE_URL || 'https://apmanager.aplatam.com';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apmanagerUrl: APMANAGER_BASE_URL
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tipificacion', tipificacionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`APManager Widget Backend running on port ${PORT}`);
  console.log(`APManager URL: ${APMANAGER_BASE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
