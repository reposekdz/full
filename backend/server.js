const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories
const uploadDirs = ['uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets', 'uploads/profiles', 'uploads/documents', 'uploads/staff', 'uploads/leadership', 'uploads/services', 'uploads/trades', 'uploads/sports', 'uploads/system'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Safe route loader
const loadRoute = (routePath, routeName) => {
  try {
    const route = require(routePath);
    if (route && typeof route === 'function') return route;
    console.log(`⚠️  ${routeName} - Invalid export`);
    return null;
  } catch (e) {
    console.log(`⚠️  ${routeName} - Not found`);
    return null;
  }
};

// Load all routes
const routes = {
  auth: loadRoute('./routes/auth', 'Auth'),
  roleAuth: loadRoute('./routes/role-auth', 'Role Auth'),
  staffAuth: loadRoute('./routes/staff-auth', 'Staff Auth'),
  contact: loadRoute('./routes/contact', 'Contact'),
  support: loadRoute('./routes/support', 'Support'),
  academics: loadRoute('./routes/academics', 'Academics'),
  content: loadRoute('./routes/content', 'Content'),
  dynamic: loadRoute('./routes/dynamic', 'Dynamic'),
  teams: loadRoute('./routes/teams', 'Teams'),
  trades: loadRoute('./routes/trades', 'Trades'),
  sports: loadRoute('./routes/sports', 'Sports'),
  gamification: loadRoute('./routes/gamification', 'Gamification'),
  analytics: loadRoute('./routes/analytics', 'Analytics'),
  aiGrading: loadRoute('./routes/aiGrading', 'AI Grading'),
  adaptiveLearning: loadRoute('./routes/adaptiveLearning', 'Adaptive Learning'),
  collaboration: loadRoute('./routes/collaboration', 'Collaboration'),
  developers: loadRoute('./routes/developers', 'Developers'),
  leadership: loadRoute('./routes/leadership', 'Leadership'),
  services: loadRoute('./routes/services', 'Services'),
  servicesAdvanced: loadRoute('./routes/services-advanced', 'Services Advanced'),
  sportsPlayers: loadRoute('./routes/sports-players', 'Sports Players'),
  sportsAdvanced: loadRoute('./routes/sports-advanced', 'Sports Advanced'),
  systemUpdates: loadRoute('./routes/system-updates', 'System Updates'),
  supportEnhanced: loadRoute('./routes/support-enhanced', 'Support Enhanced'),
  advisor: loadRoute('./routes/advisor', 'Advisor'),
};

// Mount routes
let mountedRoutes = 0;
if (routes.auth) { app.use('/api/auth', routes.auth); mountedRoutes++; }
if (routes.roleAuth) { app.use('/api/role-auth', routes.roleAuth); mountedRoutes++; }
if (routes.staffAuth) { app.use('/api/staff-auth', routes.staffAuth); mountedRoutes++; }
if (routes.contact) { app.use('/api/contact', routes.contact); mountedRoutes++; }
if (routes.support) { app.use('/api/support', routes.support); mountedRoutes++; }
if (routes.academics) { app.use('/api/academics', routes.academics); mountedRoutes++; }
if (routes.content) { app.use('/api/content', routes.content); mountedRoutes++; }
if (routes.dynamic) { app.use('/api/dynamic', routes.dynamic); mountedRoutes++; }
if (routes.teams) { app.use('/api/teams', routes.teams); mountedRoutes++; }
if (routes.trades) { app.use('/api/trades', routes.trades); mountedRoutes++; }
if (routes.sports) { app.use('/api/sports', routes.sports); mountedRoutes++; }
if (routes.gamification) { app.use('/api/gamification', routes.gamification); mountedRoutes++; }
if (routes.analytics) { app.use('/api/analytics', routes.analytics); mountedRoutes++; }
if (routes.aiGrading) { app.use('/api/ai-grading', routes.aiGrading); mountedRoutes++; }
if (routes.adaptiveLearning) { app.use('/api/adaptive-learning', routes.adaptiveLearning); mountedRoutes++; }
if (routes.collaboration) { app.use('/api/collaboration', routes.collaboration); mountedRoutes++; }
if (routes.developers) { app.use('/api/developers', routes.developers); mountedRoutes++; }
if (routes.leadership) { app.use('/api/leadership', routes.leadership); mountedRoutes++; }
if (routes.services) { app.use('/api/services', routes.services); mountedRoutes++; }
if (routes.servicesAdvanced) { app.use('/api/services-advanced', routes.servicesAdvanced); mountedRoutes++; }
if (routes.sportsPlayers) { app.use('/api/sports-players', routes.sportsPlayers); mountedRoutes++; }
if (routes.sportsAdvanced) { app.use('/api/sports-advanced-mgmt', routes.sportsAdvanced); mountedRoutes++; }
if (routes.systemUpdates) { app.use('/api/system-updates', routes.systemUpdates); mountedRoutes++; }
if (routes.supportEnhanced) { app.use('/api/support-enhanced', routes.supportEnhanced); mountedRoutes++; }
if (routes.advisor) { app.use('/api/advisor', routes.advisor); mountedRoutes++; }

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System API',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    mountedRoutes
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM');
  console.log('='.repeat(80));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'school_management'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Mounted ${mountedRoutes} route modules`);
  console.log('\n📡 API Endpoints:');
  console.log('   /api/auth              - Authentication');
  console.log('   /api/developers        - Developers Team');
  console.log('   /api/leadership        - School Leadership');
  console.log('   /api/trades            - School Trades');
  console.log('   /api/services          - School Services');
  console.log('   /api/services-advanced - Advanced Services & Coaches');
  console.log('   /api/sports            - Sports & Teams');
  console.log('   /api/sports-players    - Players & Goals');
  console.log('   /api/system-updates    - System Management');
  console.log('   /api/advisor           - Advisor Dashboard');
  console.log('\n✅ All systems operational');
  console.log('='.repeat(80) + '\n');
});

module.exports = app;
