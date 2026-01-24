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
  // Authentication & Authorization
  auth: loadRoute('./routes/auth', 'Auth'),
  roleAuth: loadRoute('./routes/role-auth', 'Role Auth'),
  staffAuth: loadRoute('./routes/staff-auth', 'Staff Auth'),
  userAuth: loadRoute('./routes/user-auth', 'User Auth'),
  studentAuth: loadRoute('./routes/student-auth', 'Student Auth'),
  
  // User Management
  users: loadRoute('./routes/users', 'Users'),
  students: loadRoute('./routes/students', 'Students'),
  teachers: loadRoute('./routes/teachers', 'Teachers'),
  parents: loadRoute('./routes/parents', 'Parents'),
  staff: loadRoute('./routes/staff', 'Staff'),
  roles: loadRoute('./routes/roles', 'Roles'),
  
  // Academic Management
  academics: loadRoute('./routes/academics', 'Academics'),
  courses: loadRoute('./routes/courses', 'Courses'),
  attendance: loadRoute('./routes/attendance', 'Attendance'),
  grades: loadRoute('./routes/grades', 'Grades'),
  exams: loadRoute('./routes/exams', 'Exams'),
  assignments: loadRoute('./routes/assignments', 'Assignments'),
  homework: loadRoute('./routes/homework', 'Homework'),
  timetable: loadRoute('./routes/timetable', 'Timetable'),
  
  // Advanced Academic Features
  advancedAcademics: loadRoute('./routes/advancedAcademics', 'Advanced Academics'),
  advancedAssignments: loadRoute('./routes/advanced-assignments', 'Advanced Assignments'),
  aiGrading: loadRoute('./routes/aiGrading', 'AI Grading'),
  adaptiveLearning: loadRoute('./routes/adaptiveLearning', 'Adaptive Learning'),
  
  // Finance & Stock
  finance: loadRoute('./routes/finance', 'Finance'),
  stock: loadRoute('./routes/stock', 'Stock'),
  
  // Discipline & DOS
  discipline: loadRoute('./routes/discipline', 'Discipline'),
  dos: loadRoute('./routes/dos', 'Director of Studies'),
  dosAdvanced: loadRoute('./routes/dos-advanced', 'DOS Advanced'),
  dosManagement: loadRoute('./routes/dos-management', 'DOS Management'),
  
  // Parent Features
  parentDashboard: loadRoute('./routes/parent-dashboard', 'Parent Dashboard'),
  parentLinking: loadRoute('./routes/parent-linking', 'Parent Linking'),
  parentMonitoring: loadRoute('./routes/parent-monitoring', 'Parent Monitoring'),
  
  // Class Management
  classManagement: loadRoute('./routes/class-management', 'Class Management'),
  classSheets: loadRoute('./routes/class-sheets', 'Class Sheets'),
  classSheetsApi: loadRoute('./routes/class-sheets-api', 'Class Sheets API'),
  
  // Student Features
  studentManagement: loadRoute('./routes/student-management', 'Student Management'),
  studentSheets: loadRoute('./routes/student-sheets', 'Student Sheets'),
  studentCompetitions: loadRoute('./routes/student-competitions', 'Student Competitions'),
  
  // Teacher Features
  teacherPortal: loadRoute('./routes/teacher-portal', 'Teacher Portal'),
  
  // Communication
  messages: loadRoute('./routes/messages', 'Messages'),
  notifications: loadRoute('./routes/notifications', 'Notifications'),
  liveChat: loadRoute('./routes/live-chat', 'Live Chat'),
  
  // Content & Dynamic
  content: loadRoute('./routes/content', 'Content'),
  dynamic: loadRoute('./routes/dynamic', 'Dynamic'),
  dynamicContent: loadRoute('./routes/dynamicContent', 'Dynamic Content'),
  homepage: loadRoute('./routes/homepage', 'Homepage'),
  homeContent: loadRoute('./routes/home-content', 'Home Content'),
  hero: loadRoute('./routes/hero', 'Hero'),
  gallery: loadRoute('./routes/gallery', 'Gallery'),
  
  // Sports & Teams
  sports: loadRoute('./routes/sports', 'Sports'),
  sportsPlayers: loadRoute('./routes/sports-players', 'Sports Players'),
  sportsAdvanced: loadRoute('./routes/sports-advanced', 'Sports Advanced'),
  sportsManagement: loadRoute('./routes/sports-management', 'Sports Management'),
  teams: loadRoute('./routes/teams', 'Teams'),
  
  // Trades & Services
  trades: loadRoute('./routes/trades', 'Trades'),
  services: loadRoute('./routes/services', 'Services'),
  servicesAdvanced: loadRoute('./routes/services-advanced', 'Services Advanced'),
  
  // Support & Contact
  contact: loadRoute('./routes/contact', 'Contact'),
  support: loadRoute('./routes/support', 'Support'),
  supportEnhanced: loadRoute('./routes/support-enhanced', 'Support Enhanced'),
  
  // Learning Features
  collaboration: loadRoute('./routes/collaboration', 'Collaboration'),
  liveStudy: loadRoute('./routes/liveStudy', 'Live Study'),
  peerReview: loadRoute('./routes/peerReview', 'Peer Review'),
  quizzes: loadRoute('./routes/quizzes', 'Quizzes'),
  holidayPackages: loadRoute('./routes/holidayPackages', 'Holiday Packages'),
  
  // Analytics & Dashboards
  analytics: loadRoute('./routes/analytics', 'Analytics'),
  dashboards: loadRoute('./routes/dashboards', 'Dashboards'),
  gamification: loadRoute('./routes/gamification', 'Gamification'),
  
  // System & Admin
  systemUpdates: loadRoute('./routes/system-updates', 'System Updates'),
  leadership: loadRoute('./routes/leadership', 'Leadership'),
  developers: loadRoute('./routes/developers', 'Developers'),
  advisor: loadRoute('./routes/advisor', 'Advisor'),
  search: loadRoute('./routes/search', 'Search'),
  advancedSearch: loadRoute('./routes/advanced-search', 'Advanced Search'),
  uploads: loadRoute('./routes/uploads', 'Uploads'),
  admin: loadRoute('./routes/admin', 'Admin'),
  adminManagement: loadRoute('./routes/admin-management', 'Admin Management'),
  adminAdvanced: loadRoute('./routes/admin-advanced', 'Admin Advanced'),
  accountant: loadRoute('./routes/accountant', 'Accountant'),
  docs: loadRoute('./routes/docs', 'Documentation'),
  
  // Library & Hostel
  library: loadRoute('./routes/library', 'Library'),
  hostel: loadRoute('./routes/hostel', 'Hostel'),
  transport: loadRoute('./routes/transport', 'Transport'),
  
  // Advanced APIs
  comprehensiveDatabase: loadRoute('./routes/comprehensive-database', 'Comprehensive Database'),
  comprehensiveApi: loadRoute('./routes/comprehensiveApi', 'Comprehensive API'),
  advancedFeatures: loadRoute('./routes/advancedFeatures', 'Advanced Features'),
  advancedOperations: loadRoute('./routes/advancedOperations', 'Advanced Operations'),
  intelligentSystems: loadRoute('./routes/intelligentSystems', 'Intelligent Systems'),
  smartAnalytics: loadRoute('./routes/smartAnalyticsApis', 'Smart Analytics'),
  modernTech: loadRoute('./routes/modernTechApis', 'Modern Tech APIs'),
  modernTechnology: loadRoute('./routes/modernTechnologyApis', 'Modern Technology APIs'),
  powerfulApis: loadRoute('./routes/powerfulApisCollection', 'Powerful APIs'),
  powerfulSchool: loadRoute('./routes/powerfulSchoolApis', 'Powerful School APIs'),
  advancedSecurity: loadRoute('./routes/advancedSecurityApis', 'Advanced Security'),
  advancedSupport: loadRoute('./routes/advanced-support', 'Advanced Support'),
  dosUpdated: loadRoute('./routes/dos-updated', 'DOS Updated'),
  enhancedDos: loadRoute('./routes/enhanced-dos', 'Enhanced DOS'),
  
  // New Advanced Features
  knowledgeBase: loadRoute('./routes/knowledge-base', 'Knowledge Base'),
  realtimeNotifications: loadRoute('./routes/realtime-notifications', 'Realtime Notifications'),
  admissions: loadRoute('./routes/admissions', 'Admissions'),
  examScheduling: loadRoute('./routes/exam-scheduling', 'Exam Scheduling'),
  certificates: loadRoute('./routes/certificates', 'Certificates'),
  alumni: loadRoute('./routes/alumni', 'Alumni'),
  messaging: loadRoute('./routes/messaging', 'Messaging'),
  reporting: loadRoute('./routes/reporting', 'Reporting'),
  cms: loadRoute('./routes/cms-unified', 'CMS'),
  
  // Comprehensive Full-Stack APIs (Production-Ready)
  comprehensiveUsers: loadRoute('./routes/comprehensive-users-api', 'Comprehensive Users API'),
  comprehensiveAcademic: loadRoute('./routes/comprehensive-academic-api', 'Comprehensive Academic API'),
  comprehensiveFinance: loadRoute('./routes/comprehensive-finance-api', 'Comprehensive Finance API'),
  comprehensiveStock: loadRoute('./routes/comprehensive-stock-api', 'Comprehensive Stock API'),
  comprehensiveKnowledgeNotifications: loadRoute('./routes/comprehensive-knowledge-notifications-admissions-exams-api', 'Comprehensive Knowledge & Notifications API'),
  comprehensiveAttendanceGrades: loadRoute('./routes/comprehensive-attendance-grades-assignments-api', 'Comprehensive Attendance & Grades API'),
  comprehensiveLibraryServices: loadRoute('./routes/comprehensive-library-hostel-transport-sports-communication-api', 'Comprehensive Library & Services API'),
};

// Mount routes
let mountedRoutes = 0;

// Authentication & Authorization
if (routes.auth) { app.use('/api/auth', routes.auth); mountedRoutes++; }
if (routes.roleAuth) { app.use('/api/role-auth', routes.roleAuth); mountedRoutes++; }
if (routes.staffAuth) { app.use('/api/staff-auth', routes.staffAuth); mountedRoutes++; }
if (routes.userAuth) { app.use('/api/user-auth', routes.userAuth); mountedRoutes++; }
if (routes.studentAuth) { app.use('/api/student-auth', routes.studentAuth); mountedRoutes++; }

// User Management
if (routes.users) { app.use('/api/users', routes.users); mountedRoutes++; }
if (routes.students) { app.use('/api/students', routes.students); mountedRoutes++; }
if (routes.teachers) { app.use('/api/teachers', routes.teachers); mountedRoutes++; }
if (routes.parents) { app.use('/api/parents', routes.parents); mountedRoutes++; }
if (routes.staff) { app.use('/api/staff', routes.staff); mountedRoutes++; }
if (routes.roles) { app.use('/api/roles', routes.roles); mountedRoutes++; }

// Academic Management
if (routes.academics) { app.use('/api/academics', routes.academics); mountedRoutes++; }
if (routes.courses) { app.use('/api/courses', routes.courses); mountedRoutes++; }
if (routes.attendance) { app.use('/api/attendance', routes.attendance); mountedRoutes++; }
if (routes.grades) { app.use('/api/grades', routes.grades); mountedRoutes++; }
if (routes.exams) { app.use('/api/exams', routes.exams); mountedRoutes++; }
if (routes.assignments) { app.use('/api/assignments', routes.assignments); mountedRoutes++; }
if (routes.homework) { app.use('/api/homework', routes.homework); mountedRoutes++; }
if (routes.timetable) { app.use('/api/timetable', routes.timetable); mountedRoutes++; }

// Advanced Academic Features
if (routes.advancedAcademics) { app.use('/api/advanced-academics', routes.advancedAcademics); mountedRoutes++; }
if (routes.advancedAssignments) { app.use('/api/advanced-assignments', routes.advancedAssignments); mountedRoutes++; }
if (routes.aiGrading) { app.use('/api/ai-grading', routes.aiGrading); mountedRoutes++; }
if (routes.adaptiveLearning) { app.use('/api/adaptive-learning', routes.adaptiveLearning); mountedRoutes++; }

// Finance & Stock
if (routes.finance) { app.use('/api/finance', routes.finance); mountedRoutes++; }
if (routes.stock) { app.use('/api/stock', routes.stock); mountedRoutes++; }

// Discipline & DOS
if (routes.discipline) { app.use('/api/discipline', routes.discipline); mountedRoutes++; }
if (routes.dos) { app.use('/api/dos', routes.dos); mountedRoutes++; }
if (routes.dosAdvanced) { app.use('/api/dos-advanced', routes.dosAdvanced); mountedRoutes++; }
if (routes.dosManagement) { app.use('/api/dos-management', routes.dosManagement); mountedRoutes++; }

// Parent Features
if (routes.parentDashboard) { app.use('/api/parent-dashboard', routes.parentDashboard); mountedRoutes++; }
if (routes.parentLinking) { app.use('/api/parent-linking', routes.parentLinking); mountedRoutes++; }
if (routes.parentMonitoring) { app.use('/api/parent-monitoring', routes.parentMonitoring); mountedRoutes++; }

// Class Management
if (routes.classManagement) { app.use('/api/class-management', routes.classManagement); mountedRoutes++; }
if (routes.classSheets) { app.use('/api/class-sheets', routes.classSheets); mountedRoutes++; }
if (routes.classSheetsApi) { app.use('/api/class-sheets-api', routes.classSheetsApi); mountedRoutes++; }

// Student Features
if (routes.studentManagement) { app.use('/api/student-management', routes.studentManagement); mountedRoutes++; }
if (routes.studentSheets) { app.use('/api/student-sheets', routes.studentSheets); mountedRoutes++; }
if (routes.studentCompetitions) { app.use('/api/student-competitions', routes.studentCompetitions); mountedRoutes++; }

// Teacher Features
if (routes.teacherPortal) { app.use('/api/teacher-portal', routes.teacherPortal); mountedRoutes++; }

// Communication
if (routes.messages) { app.use('/api/messages', routes.messages); mountedRoutes++; }
if (routes.notifications) { app.use('/api/notifications', routes.notifications); mountedRoutes++; }
if (routes.liveChat) { app.use('/api/live-chat', routes.liveChat); mountedRoutes++; }

// Content & Dynamic
if (routes.content) { app.use('/api/content', routes.content); mountedRoutes++; }
if (routes.dynamic) { app.use('/api/dynamic', routes.dynamic); mountedRoutes++; }
if (routes.dynamicContent) { app.use('/api/dynamic-content', routes.dynamicContent); mountedRoutes++; }
if (routes.homepage) { app.use('/api/homepage', routes.homepage); mountedRoutes++; }
if (routes.homeContent) { app.use('/api/home-content', routes.homeContent); mountedRoutes++; }
if (routes.hero) { app.use('/api/hero', routes.hero); mountedRoutes++; }
if (routes.gallery) { app.use('/api/gallery', routes.gallery); mountedRoutes++; }

// Sports & Teams
if (routes.sports) { app.use('/api/sports', routes.sports); mountedRoutes++; }
if (routes.sportsPlayers) { app.use('/api/sports-players', routes.sportsPlayers); mountedRoutes++; }
if (routes.sportsAdvanced) { app.use('/api/sports-advanced', routes.sportsAdvanced); mountedRoutes++; }
if (routes.sportsManagement) { app.use('/api/sports-management', routes.sportsManagement); mountedRoutes++; }
if (routes.teams) { app.use('/api/teams', routes.teams); mountedRoutes++; }

// Trades & Services
if (routes.trades) { app.use('/api/trades', routes.trades); mountedRoutes++; }
if (routes.services) { app.use('/api/services', routes.services); mountedRoutes++; }
if (routes.servicesAdvanced) { app.use('/api/services-advanced', routes.servicesAdvanced); mountedRoutes++; }

// Support & Contact
if (routes.contact) { app.use('/api/contact', routes.contact); mountedRoutes++; }
if (routes.support) { app.use('/api/support', routes.support); mountedRoutes++; }
if (routes.supportEnhanced) { app.use('/api/support-enhanced', routes.supportEnhanced); mountedRoutes++; }

// Learning Features
if (routes.collaboration) { app.use('/api/collaboration', routes.collaboration); mountedRoutes++; }
if (routes.liveStudy) { app.use('/api/live-study', routes.liveStudy); mountedRoutes++; }
if (routes.peerReview) { app.use('/api/peer-review', routes.peerReview); mountedRoutes++; }
if (routes.quizzes) { app.use('/api/quizzes', routes.quizzes); mountedRoutes++; }
if (routes.holidayPackages) { app.use('/api/holiday-packages', routes.holidayPackages); mountedRoutes++; }

// Analytics & Dashboards
if (routes.analytics) { app.use('/api/analytics', routes.analytics); mountedRoutes++; }
if (routes.dashboards) { app.use('/api/dashboards', routes.dashboards); mountedRoutes++; }
if (routes.gamification) { app.use('/api/gamification', routes.gamification); mountedRoutes++; }

// System & Admin
if (routes.systemUpdates) { app.use('/api/system-updates', routes.systemUpdates); mountedRoutes++; }
if (routes.leadership) { app.use('/api/leadership', routes.leadership); mountedRoutes++; }
if (routes.developers) { app.use('/api/developers', routes.developers); mountedRoutes++; }
if (routes.advisor) { app.use('/api/advisor', routes.advisor); mountedRoutes++; }
if (routes.search) { app.use('/api/search', routes.search); mountedRoutes++; }
if (routes.advancedSearch) { app.use('/api/advanced-search', routes.advancedSearch); mountedRoutes++; }
if (routes.uploads) { app.use('/api/uploads', routes.uploads); mountedRoutes++; }
if (routes.admin) { app.use('/api/admin', routes.admin); mountedRoutes++; }
if (routes.adminManagement) { app.use('/api/admin-management', routes.adminManagement); mountedRoutes++; }
if (routes.adminAdvanced) { app.use('/api/admin-advanced', routes.adminAdvanced); mountedRoutes++; }
if (routes.accountant) { app.use('/api/accountant', routes.accountant); mountedRoutes++; }
if (routes.docs) { app.use('/api/docs', routes.docs); mountedRoutes++; }

// Library, Hostel & Transport
if (routes.library) { app.use('/api/library', routes.library); mountedRoutes++; }
if (routes.hostel) { app.use('/api/hostel', routes.hostel); mountedRoutes++; }
if (routes.transport) { app.use('/api/transport', routes.transport); mountedRoutes++; }

// Advanced APIs
if (routes.comprehensiveDatabase) { app.use('/api/comprehensive-db', routes.comprehensiveDatabase); mountedRoutes++; }
if (routes.comprehensiveApi) { app.use('/api/comprehensive', routes.comprehensiveApi); mountedRoutes++; }
if (routes.advancedFeatures) { app.use('/api/advanced-features', routes.advancedFeatures); mountedRoutes++; }
if (routes.advancedOperations) { app.use('/api/advanced-operations', routes.advancedOperations); mountedRoutes++; }
if (routes.intelligentSystems) { app.use('/api/intelligent-systems', routes.intelligentSystems); mountedRoutes++; }
if (routes.smartAnalytics) { app.use('/api/smart-analytics', routes.smartAnalytics); mountedRoutes++; }
if (routes.modernTech) { app.use('/api/modern-tech', routes.modernTech); mountedRoutes++; }
if (routes.modernTechnology) { app.use('/api/modern-technology', routes.modernTechnology); mountedRoutes++; }
if (routes.powerfulApis) { app.use('/api/powerful-apis', routes.powerfulApis); mountedRoutes++; }
if (routes.powerfulSchool) { app.use('/api/powerful-school', routes.powerfulSchool); mountedRoutes++; }
if (routes.advancedSecurity) { app.use('/api/advanced-security', routes.advancedSecurity); mountedRoutes++; }
if (routes.advancedSupport) { app.use('/api/advanced-support', routes.advancedSupport); mountedRoutes++; }
if (routes.dosUpdated) { app.use('/api/dos-updated', routes.dosUpdated); mountedRoutes++; }
if (routes.enhancedDos) { app.use('/api/enhanced-dos', routes.enhancedDos); mountedRoutes++; }

// New Advanced Features
if (routes.knowledgeBase) { app.use('/api/knowledge-base', routes.knowledgeBase); mountedRoutes++; }
if (routes.realtimeNotifications) { app.use('/api/realtime-notifications', routes.realtimeNotifications); mountedRoutes++; }
if (routes.admissions) { app.use('/api/admissions', routes.admissions); mountedRoutes++; }
if (routes.examScheduling) { app.use('/api/exam-scheduling', routes.examScheduling); mountedRoutes++; }
if (routes.certificates) { app.use('/api/certificates', routes.certificates); mountedRoutes++; }
if (routes.alumni) { app.use('/api/alumni', routes.alumni); mountedRoutes++; }
if (routes.messaging) { app.use('/api/messaging', routes.messaging); mountedRoutes++; }
if (routes.reporting) { app.use('/api/reporting', routes.reporting); mountedRoutes++; }
if (routes.cms) { app.use('/api/cms', routes.cms); mountedRoutes++; }

// Comprehensive Full-Stack APIs (Production-Ready)
if (routes.comprehensiveUsers) { app.use('/api/v1/users', routes.comprehensiveUsers); mountedRoutes++; }
if (routes.comprehensiveAcademic) { app.use('/api/v1/academic', routes.comprehensiveAcademic); mountedRoutes++; }
if (routes.comprehensiveFinance) { app.use('/api/v1/finance', routes.comprehensiveFinance); mountedRoutes++; }
if (routes.comprehensiveStock) { app.use('/api/v1/stock', routes.comprehensiveStock); mountedRoutes++; }
if (routes.comprehensiveKnowledgeNotifications) { app.use('/api/v1/knowledge', routes.comprehensiveKnowledgeNotifications); mountedRoutes++; }
if (routes.comprehensiveAttendanceGrades) { app.use('/api/v1/academics-tracking', routes.comprehensiveAttendanceGrades); mountedRoutes++; }
if (routes.comprehensiveLibraryServices) { app.use('/api/v1/services', routes.comprehensiveLibraryServices); mountedRoutes++; }

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
const PORT = process.env.PORT || 5000;
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
