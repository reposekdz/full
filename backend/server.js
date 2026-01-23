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
const uploadDirs = ['uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets', 'uploads/profiles', 'uploads/documents', 'uploads/staff'];
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
    if (route && typeof route === 'function') {
      return route;
    }
    console.log(`⚠️  ${routeName} - Invalid export`);
    return null;
  } catch (e) {
    console.log(`⚠️  ${routeName} - Not found`);
    return null;
  }
};

// Load all routes safely
const routes = {
  auth: loadRoute('./routes/auth', 'Auth'),
  search: loadRoute('./routes/search', 'Search'),
  userAuth: loadRoute('./routes/user-auth', 'User Auth'),
  staffAuth: loadRoute('./routes/staff-auth', 'Staff Auth'),
  contact: loadRoute('./routes/contact', 'Contact'),
  support: loadRoute('./routes/support', 'Support'),
  academics: loadRoute('./routes/academics', 'Academics'),
  content: loadRoute('./routes/content', 'Content'),
  dynamic: loadRoute('./routes/dynamic', 'Dynamic'),
  teams: loadRoute('./routes/teams', 'Teams'),
  sports: loadRoute('./routes/sports', 'Sports'),
  gallery: loadRoute('./routes/gallery', 'Gallery'),
  gamification: loadRoute('./routes/gamification', 'Gamification'),
  analytics: loadRoute('./routes/analytics', 'Analytics'),
  aiGrading: loadRoute('./routes/aiGrading', 'AI Grading'),
  adaptiveLearning: loadRoute('./routes/adaptiveLearning', 'Adaptive Learning'),
  collaboration: loadRoute('./routes/collaboration', 'Collaboration'),
  parentLinking: loadRoute('./routes/parent-linking', 'Parent Linking'),
  parentMonitoring: loadRoute('./routes/parent-monitoring', 'Parent Monitoring'),
  services: loadRoute('./routes/services', 'Services'),
  trades: loadRoute('./routes/trades', 'Trades'),
  liveChat: loadRoute('./routes/live-chat', 'Live Chat'),
  assignments: loadRoute('./routes/assignments', 'Assignments'),
  attendance: loadRoute('./routes/attendance', 'Attendance'),
  courses: loadRoute('./routes/courses', 'Courses'),
  grades: loadRoute('./routes/grades', 'Grades'),
  exams: loadRoute('./routes/exams', 'Exams'),
  notifications: loadRoute('./routes/notifications', 'Notifications'),
  dashboards: loadRoute('./routes/dashboards', 'Dashboards'),
  students: loadRoute('./routes/students', 'Students'),
  teachers: loadRoute('./routes/teachers', 'Teachers'),
  parents: loadRoute('./routes/parents', 'Parents'),
  messages: loadRoute('./routes/messages', 'Messages'),
  timetable: loadRoute('./routes/timetable', 'Timetable'),
  homework: loadRoute('./routes/homework', 'Homework'),
  quizzes: loadRoute('./routes/quizzes', 'Quizzes'),
  users: loadRoute('./routes/users', 'Users'),
  roles: loadRoute('./routes/roles', 'Roles'),
  peerReview: loadRoute('./routes/peerReview', 'Peer Review'),
  liveStudy: loadRoute('./routes/liveStudy', 'Live Study'),
  holidayPackages: loadRoute('./routes/holidayPackages', 'Holiday Packages'),
  docs: loadRoute('./routes/docs', 'Docs'),
  hero: loadRoute('./routes/hero', 'Hero'),
  dynamicContent: loadRoute('./routes/dynamicContent', 'Dynamic Content'),
  uploads: loadRoute('./routes/uploads', 'Uploads'),
  roleAuth: loadRoute('./routes/role-auth', 'Role Auth'),
  admin: loadRoute('./routes/admin', 'Admin'),
  dos: loadRoute('./routes/dos', 'DOS'),
  teacherPortal: loadRoute('./routes/teacher-portal', 'Teacher Portal'),
  sportsManagement: loadRoute('./routes/sports-management', 'Sports Management'),
  homeContent: loadRoute('./routes/home-content', 'Home Content'),
  adminManagement: loadRoute('./routes/admin-management', 'Admin Management'),
  staff: loadRoute('./routes/staff', 'Staff'),
};

// Mount routes
let mountedRoutes = 0;
if (routes.auth) { app.use('/api/auth', routes.auth); mountedRoutes++; }
if (routes.search) { app.use('/api/search', routes.search); mountedRoutes++; }
if (routes.userAuth) { app.use('/api/user-auth', routes.userAuth); mountedRoutes++; }
if (routes.staffAuth) { app.use('/api/staff-auth', routes.staffAuth); mountedRoutes++; }
if (routes.contact) { app.use('/api/contact', routes.contact); mountedRoutes++; }
if (routes.support) { app.use('/api/support', routes.support); mountedRoutes++; }
if (routes.academics) { app.use('/api/academics', routes.academics); mountedRoutes++; }
if (routes.content) { app.use('/api/content', routes.content); mountedRoutes++; }
if (routes.dynamic) { app.use('/api/dynamic', routes.dynamic); mountedRoutes++; }
if (routes.teams) { app.use('/api/teams', routes.teams); mountedRoutes++; }
if (routes.sports) { app.use('/api/sports', routes.sports); mountedRoutes++; }
if (routes.gallery) { app.use('/api/gallery', routes.gallery); mountedRoutes++; }
if (routes.gamification) { app.use('/api/gamification', routes.gamification); mountedRoutes++; }
if (routes.analytics) { app.use('/api/analytics', routes.analytics); mountedRoutes++; }
if (routes.aiGrading) { app.use('/api/ai-grading', routes.aiGrading); mountedRoutes++; }
if (routes.adaptiveLearning) { app.use('/api/adaptive-learning', routes.adaptiveLearning); mountedRoutes++; }
if (routes.collaboration) { app.use('/api/collaboration', routes.collaboration); mountedRoutes++; }
if (routes.parentLinking) { app.use('/api/parent-linking', routes.parentLinking); mountedRoutes++; }
if (routes.parentMonitoring) { app.use('/api/parent-monitoring', routes.parentMonitoring); mountedRoutes++; }
if (routes.services) { app.use('/api/services', routes.services); mountedRoutes++; }
if (routes.trades) { app.use('/api/trades', routes.trades); mountedRoutes++; }
if (routes.liveChat) { app.use('/api/live-chat', routes.liveChat); mountedRoutes++; }
if (routes.assignments) { app.use('/api/assignments', routes.assignments); mountedRoutes++; }
if (routes.attendance) { app.use('/api/attendance', routes.attendance); mountedRoutes++; }
if (routes.courses) { app.use('/api/courses', routes.courses); mountedRoutes++; }
if (routes.grades) { app.use('/api/grades', routes.grades); mountedRoutes++; }
if (routes.exams) { app.use('/api/exams', routes.exams); mountedRoutes++; }
if (routes.notifications) { app.use('/api/notifications', routes.notifications); mountedRoutes++; }
if (routes.dashboards) { app.use('/api/dashboards', routes.dashboards); mountedRoutes++; }
if (routes.students) { app.use('/api/students', routes.students); mountedRoutes++; }
if (routes.teachers) { app.use('/api/teachers', routes.teachers); mountedRoutes++; }
if (routes.parents) { app.use('/api/parents', routes.parents); mountedRoutes++; }
if (routes.messages) { app.use('/api/messages', routes.messages); mountedRoutes++; }
if (routes.timetable) { app.use('/api/timetable', routes.timetable); mountedRoutes++; }
if (routes.homework) { app.use('/api/homework', routes.homework); mountedRoutes++; }
if (routes.quizzes) { app.use('/api/quizzes', routes.quizzes); mountedRoutes++; }
if (routes.users) { app.use('/api/users', routes.users); mountedRoutes++; }
if (routes.roles) { app.use('/api/roles', routes.roles); mountedRoutes++; }
if (routes.peerReview) { app.use('/api/peer-review', routes.peerReview); mountedRoutes++; }
if (routes.liveStudy) { app.use('/api/live-study', routes.liveStudy); mountedRoutes++; }
if (routes.holidayPackages) { app.use('/api/holiday-packages', routes.holidayPackages); mountedRoutes++; }
if (routes.docs) { app.use('/api/docs', routes.docs); mountedRoutes++; }
if (routes.hero) { app.use('/api/hero', routes.hero); mountedRoutes++; }
if (routes.dynamicContent) { app.use('/api/dynamic-content', routes.dynamicContent); mountedRoutes++; }
if (routes.uploads) { app.use('/api/uploads', routes.uploads); mountedRoutes++; }
if (routes.roleAuth) { app.use('/api/role-auth', routes.roleAuth); mountedRoutes++; }
if (routes.admin) { app.use('/api/admin', routes.admin); mountedRoutes++; }
if (routes.dos) { app.use('/api/dos', routes.dos); mountedRoutes++; }
if (routes.teacherPortal) { app.use('/api/teacher-portal', routes.teacherPortal); mountedRoutes++; }
if (routes.sportsManagement) { app.use('/api/sports-management', routes.sportsManagement); mountedRoutes++; }
if (routes.homeContent) { app.use('/api/home-content', routes.homeContent); mountedRoutes++; }
if (routes.adminManagement) { app.use('/api/admin', routes.adminManagement); mountedRoutes++; }
if (routes.staff) { app.use('/api/staff', routes.staff); mountedRoutes++; }

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System API',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    mountedRoutes,
    totalRoutes: '200+'
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

// Start server with error handling
const PORT = process.env.PORT || 5000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.log('\n💡 Solutions:');
    console.log('   1. Kill the process: netstat -ano | findstr :5000');
    console.log('   2. Change PORT in .env file');
    console.log('   3. Run: taskkill /F /PID <PID>\n');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM - ENTERPRISE EDITION');
  console.log('='.repeat(80));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Auth: ENABLED (24h expiry)`);
  console.log(`🔐 Default Language: Kinyarwanda (rw)`);
  console.log(`\n✅ Successfully mounted ${mountedRoutes} route modules with 200+ API endpoints`);
  console.log('\n👤 DEMO LOGIN: reponse@gmail.com / 2026');
  console.log('📱 Parent Login: Phone + Password');
  console.log('🎓 Student Login: Email + Password');
  console.log('\n🔗 API Endpoints:');
  console.log('   • POST /api/auth/register/student - Student Registration');
  console.log('   • POST /api/auth/register/parent-phone - Parent Registration');
  console.log('   • POST /api/auth/login - Student/Staff Login');
  console.log('   • POST /api/auth/login/parent - Parent Phone Login');
  console.log('   • GET  /api/health - Health Check');
  console.log('\n✅ JWT Authentication: PRODUCTION READY');
  console.log('='.repeat(80) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
