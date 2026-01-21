const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.ensureDirSync(uploadsDir);
  console.log('✅ Uploads directory created');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/users', require('./controllers/userController'));
app.use('/api/academics', require('./controllers/academicController'));
app.use('/api/finance', require('./controllers/financeController'));
app.use('/api/stock', require('./controllers/stockController'));
app.use('/api/parents', require('./routes/parents'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/students', require('./routes/students'));
app.use('/api/dos', require('./routes/dos'));
app.use('/api/dos', require('./controllers/dosController'));
app.use('/api/dos-enhanced', require('./routes/enhanced-dos'));
app.use('/api/role-auth', require('./routes/role-auth'));
app.use('/', require('./routes/docs'));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'School Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Redirect root to docs
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/docs`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log('📚 Available endpoints:');
      console.log('  - /api/auth - Authentication');
      console.log('  - /api/admin - Admin management');
      console.log('  - /api/content - Content management');
      console.log('  - /api/users - User management');
      console.log('  - /api/academics - Academic management');
      console.log('  - /api/finance - Financial management');
      console.log('  - /api/stock - Stock management');
      console.log('  - /api/dos - DOS management (students, conduct, analytics)');
      console.log('  - /api/dos-enhanced - Enhanced DOS features with advanced analytics');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
