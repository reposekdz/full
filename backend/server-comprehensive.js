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

// Create all upload directories
const uploadDirs = [
  'uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets',
  'uploads/leadership', 'uploads/students', 'uploads/teachers', 'uploads/staff',
  'uploads/gallery', 'uploads/events', 'uploads/certificates', 'uploads/documents',
  'uploads/library', 'uploads/hostel', 'uploads/transport', 'uploads/sports',
  'uploads/profiles', 'uploads/admissions', 'uploads/alumni', 'uploads/services',
  'uploads/trades', 'uploads/cms', 'uploads/carousel', 'uploads/news'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Load all routes dynamically
const routes = {
  // Core Authentication & Users
  auth: './routes/auth',
  users: './routes/users',
  'user-auth': './routes/user-auth',
  'student-auth': './routes/student-auth',
  'staff-auth': './routes/staff-auth',
  roles: './routes/roles',
  'role-auth': './routes/role-auth',
  
  // Comprehensive Database APIs
  'comprehensive-db': './routes/comprehensive-database',
  'comprehensive-api': './routes/comprehensiveApi',
  'comprehensive-academic': './routes/comprehensive-academic-api',
  'comprehensive-attendance': './routes/comprehensive-attendance-grades-assignments-api',
  'comprehensive-finance': './routes/comprehensive-finance-api',
  'comprehensive-knowledge': './routes/comprehensive-knowledge-notifications-admissions-exams-api',
  'comprehensive-library': './routes/comprehensive-library-hostel-transport-sports-communication-api',
  'comprehensive-stock': './routes/comprehensive-stock-api',
  'comprehensive-users': './routes/comprehensive-users-api',
  
  // Academic Management
  academics: './routes/academics',
  'advanced-academics': './routes/advancedAcademics',
  courses: './routes/courses',
  assignments: './routes/assignments',
  'advanced-assignments': './routes/advanced-assignments',
  grades: './routes/grades',
  exams: './routes/exams',
  'exam-scheduling': './routes/exam-scheduling',
  quizzes: './routes/quizzes',
  homework: './routes/homework',
  timetable: './routes/timetable',
  attendance: './routes/attendance',
  
  // Student Management
  students: './routes/students',
  'student-management': './routes/student-management',
  'student-sheets': './routes/student-sheets',
  'student-competitions': './routes/student-competitions',
  admissions: './routes/admissions',
  alumni: './routes/alumni',
  
  // Teacher & Staff Management
  teachers: './routes/teachers',
  'teacher-portal': './routes/teacher-portal',
  staff: './routes/staff',
  leadership: './routes/leadership',
  
  // DOS & Admin Management
  dos: './routes/dos',
  'dos-management': './routes/dos-management',
  'dos-advanced': './routes/dos-advanced',
  'dos-updated': './routes/dos-updated',
  'enhanced-dos': './routes/enhanced-dos',
  admin: './routes/admin',
  'admin-management': './routes/admin-management',
  'admin-advanced': './routes/admin-advanced',
  advisor: './routes/advisor',
  discipline: './routes/discipline',
  
  // Finance & Accounting
  finance: './routes/finance',
  accountant: './routes/accountant',
  stock: './routes/stock',
  
  // Class Management
  'class-management': './routes/class-management',
  'class-sheets': './routes/class-sheets',
  'class-sheets-api': './routes/class-sheets-api',
  
  // Communication & Support
  contact: './routes/contact',
  support: './routes/support',
  'support-enhanced': './routes/support-enhanced',
  'advanced-support': './routes/advanced-support',
  messages: './routes/messages',
  messaging: './routes/messaging',
  'live-chat': './routes/live-chat',
  notifications: './routes/notifications',
  'realtime-notifications': './routes/realtime-notifications',
  
  // Parent Portal
  parents: './routes/parents',
  'parent-dashboard': './routes/parent-dashboard',
  'parent-linking': './routes/parent-linking',
  'parent-monitoring': './routes/parent-monitoring',
  
  // Content Management
  cms: './routes/cms',
  'cms-unified': './routes/cms-unified',
  content: './routes/content',
  'dynamic-content': './routes/dynamicContent',
  dynamic: './routes/dynamic',
  homepage: './routes/homepage',
  'home-content': './routes/home-content',
  hero: './routes/hero',
  gallery: './routes/gallery',
  events: './routes/events',
  
  // Services & Facilities
  services: './routes/services',
  'services-advanced': './routes/services-advanced',
  trades: './routes/trades',
  library: './routes/library',
  hostel: './routes/hostel',
  transport: './routes/transport',
  
  // Sports & Teams
  sports: './routes/sports',
  'sports-management': './routes/sports-management',
  'sports-advanced': './routes/sports-advanced',
  'sports-players': './routes/sports-players',
  teams: './routes/teams',
  
  // Advanced Features
  gamification: './routes/gamification',
  analytics: './routes/analytics',
  'smart-analytics': './routes/smartAnalyticsApis',
  'ai-grading': './routes/aiGrading',
  'adaptive-learning': './routes/adaptiveLearning',
  collaboration: './routes/collaboration',
  'peer-review': './routes/peerReview',
  'live-study': './routes/liveStudy',
  'intelligent-systems': './routes/intelligentSystems',
  'modern-tech': './routes/modernTechApis',
  'modern-technology': './routes/modernTechnologyApis',
  'advanced-features': './routes/advancedFeatures',
  'advanced-operations': './routes/advancedOperations',
  'advanced-security': './routes/advancedSecurityApis',
  'powerful-apis': './routes/powerfulApisCollection',
  'powerful-school': './routes/powerfulSchoolApis',
  
  // Utilities
  search: './routes/search',
  'advanced-search': './routes/advanced-search',
  reporting: './routes/reporting',
  dashboards: './routes/dashboards',
  certificates: './routes/certificates',
  'knowledge-base': './routes/knowledge-base',
  docs: './routes/docs',
  uploads: './routes/uploads',
  'system-updates': './routes/system-updates',
  'holiday-packages': './routes/holidayPackages',
  developers: './routes/developers'
};

// Mount all routes with error handling
const mountedRoutes = [];
const failedRoutes = [];

Object.entries(routes).forEach(([path, routePath]) => {
  try {
    const route = require(routePath);
    app.use(`/api/${path}`, route);
    mountedRoutes.push(path);
  } catch (e) {
    failedRoutes.push({ path, error: e.message });
  }
});

// Health check with system status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System - Comprehensive API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    routes: {
      total: Object.keys(routes).length,
      mounted: mountedRoutes.length,
      failed: failedRoutes.length
    },
    features: [
      'Comprehensive Database Integration',
      'Advanced Academic Management',
      'Real-time Notifications',
      'AI-Powered Grading',
      'Adaptive Learning',
      'Gamification System',
      'Smart Analytics',
      'Parent Monitoring',
      'Multi-role Authentication',
      'Content Management System',
      'Advanced Search',
      'Live Chat Support',
      'Document Management',
      'Financial Management',
      'Sports & Teams Management',
      'Library & Hostel Management',
      'Transport Management',
      'Event Management',
      'Certificate Generation',
      'Reporting & Dashboards'
    ]
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Garden TVET School Management System API',
    version: '3.0.0',
    description: 'Comprehensive school management system with advanced features',
    routes: mountedRoutes.sort().map(route => ({
      path: `/api/${route}`,
      status: 'active'
    })),
    failedRoutes: failedRoutes.length > 0 ? failedRoutes : undefined
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
    message: 'Route not found',
    availableRoutes: `/api/docs`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM - COMPREHENSIVE API');
  console.log('='.repeat(80));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'school_management'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📡 API Status:`);
  console.log(`   ✅ Active Routes: ${mountedRoutes.length}`);
  console.log(`   ⚠️  Failed Routes: ${failedRoutes.length}`);
  console.log(`\n🔥 Key Features:`);
  console.log(`   • Comprehensive Database Integration`);
  console.log(`   • Multi-role Authentication System`);
  console.log(`   • Advanced Academic Management`);
  console.log(`   • Real-time Notifications & Chat`);
  console.log(`   • AI-Powered Grading & Analytics`);
  console.log(`   • Gamification & Adaptive Learning`);
  console.log(`   • Parent Monitoring Portal`);
  console.log(`   • Financial & Stock Management`);
  console.log(`   • Sports, Library, Hostel, Transport`);
  console.log(`   • CMS & Dynamic Content`);
  console.log(`\n📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n✅ All systems operational');
  console.log('='.repeat(80) + '\n');
  
  if (failedRoutes.length > 0) {
    console.log('⚠️  Warning: Some routes failed to load:');
    failedRoutes.forEach(({ path }) => console.log(`   - ${path}`));
    console.log('');
  }
});

module.exports = app;
