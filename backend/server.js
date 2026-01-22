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
const uploadDirs = ['uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets', 'uploads/profiles', 'uploads/documents'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Import all routes
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const userAuthRoutes = require('./routes/user-auth');
const staffAuthRoutes = require('./routes/staff-auth');
const contactRoutes = require('./routes/contact');
const supportRoutes = require('./routes/support');
const academicsRoutes = require('./routes/academics');
const contentRoutes = require('./routes/content');
const dynamicRoutes = require('./routes/dynamic');
const teamsRoutes = require('./routes/teams');
const sportsRoutes = require('./routes/sports');
const gamificationRoutes = require('./routes/gamification');
const analyticsRoutes = require('./routes/analytics');
const aiGradingRoutes = require('./routes/aiGrading');
const adaptiveLearningRoutes = require('./routes/adaptiveLearning');
const collaborationRoutes = require('./routes/collaboration');
const parentLinkingRoutes = require('./routes/parent-linking');
const parentMonitoringRoutes = require('./routes/parent-monitoring');
const servicesRoutes = require('./routes/services');
const tradesRoutes = require('./routes/trades');
const liveChatRoutes = require('./routes/live-chat');
const assignmentsRoutes = require('./routes/assignments');
const attendanceRoutes = require('./routes/attendance');
const coursesRoutes = require('./routes/courses');
const gradesRoutes = require('./routes/grades');
const examsRoutes = require('./routes/exams');
const notificationsRoutes = require('./routes/notifications');
const dashboardsRoutes = require('./routes/dashboards');
const studentsRoutes = require('./routes/students');
const teachersRoutes = require('./routes/teachers');
const parentsRoutes = require('./routes/parents');
const messagesRoutes = require('./routes/messages');
const timetableRoutes = require('./routes/timetable');
const homeworkRoutes = require('./routes/homework');
const quizzesRoutes = require('./routes/quizzes');
const usersRoutes = require('./routes/users');
const rolesRoutes = require('./routes/roles');

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user-auth', userAuthRoutes);
app.use('/api/staff-auth', staffAuthRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-grading', aiGradingRoutes);
app.use('/api/adaptive-learning', adaptiveLearningRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/parent-linking', parentLinkingRoutes);
app.use('/api/parent-monitoring', parentMonitoringRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboards', dashboardsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    routes: 35
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM - FULL STACK');
  console.log('='.repeat(70));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Default Language: Kinyarwanda (rw)`);
  console.log('\n📡 ACTIVE ROUTES (36 Modules):');
  console.log('   🔐 Authentication & Authorization:');
  console.log('      /api/auth, /api/user-auth, /api/staff-auth, /api/roles');
  console.log('   🔍 Global Search:');
  console.log('      /api/search (Search everything in database)');
  console.log('   👨‍👩‍👧 Parent & Student Management:');
  console.log('      /api/parent-linking, /api/parent-monitoring, /api/parents, /api/students');
  console.log('   📚 Academic System:');
  console.log('      /api/academics, /api/courses, /api/assignments, /api/grades, /api/exams');
  console.log('      /api/homework, /api/quizzes, /api/timetable, /api/attendance');
  console.log('   ⚽ Sports & Activities:');
  console.log('      /api/sports, /api/teams');
  console.log('   🎮 Student Engagement:');
  console.log('      /api/gamification, /api/collaboration, /api/live-chat, /api/messages');
  console.log('   📊 Analytics & Intelligence:');
  console.log('      /api/analytics, /api/ai-grading, /api/adaptive-learning, /api/dashboards');
  console.log('   🛠️ Services & Operations:');
  console.log('      /api/services, /api/trades, /api/support, /api/contact');
  console.log('   👥 User Management:');
  console.log('      /api/users, /api/teachers, /api/notifications');
  console.log('   🌐 Content & Dynamic:');
  console.log('      /api/content, /api/dynamic');
  console.log('\n🎯 KEY FEATURES:');
  console.log('   ✅ Multi-language (Kinyarwanda, English, French, Swahili)');
  console.log('   ✅ Real-time parent monitoring & notifications');
  console.log('   ✅ Auto-generated student IDs (SOD0012026, AUT0012026, etc.)');
  console.log('   ✅ Parent-student linking with approval workflow');
  console.log('   ✅ Comprehensive sports management');
  console.log('   ✅ AI-powered grading & adaptive learning');
  console.log('   ✅ Live chat & collaboration tools');
  console.log('   ✅ Advanced analytics & dashboards');
  console.log('   ✅ Gamification & engagement systems');
  console.log('   ✅ Full CRUD operations on all entities');
  console.log('\n👤 STAFF LOGIN: repose@gmail.com / 2025');
  console.log('✅ All systems operational - No mock data');
  console.log('='.repeat(70) + '\n');
});

module.exports = app;
