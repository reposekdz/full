const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const socketIO = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize Cron Jobs
require('./services/cronJobs');

const app = express();
const server = http.createServer(app);
const { initializeSocket } = require('./services/socketService');
const io = initializeSocket(server);

// Import middleware
const { generalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeMiddleware } = require('./middleware/validation');
const { cacheMiddleware, getCacheStats } = require('./middleware/cache');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers - Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; media-src 'self' blob:;"
  );
  next();
});

// Security middleware
// app.use(generalLimiter); // DISABLED for high-load testing
app.use(sanitizeMiddleware);

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
  comprehensiveAuth: loadRoute('./routes/comprehensive-auth', 'Comprehensive Auth'),
  roleAuth: loadRoute('./routes/role-auth', 'Role Auth'),
  staffAuth: loadRoute('./routes/staff-auth', 'Staff Auth'),
  userAuth: loadRoute('./routes/user-auth', 'User Auth'),
  
  // User Management
  users: loadRoute('./routes/users', 'Users'),
  students: loadRoute('./routes/students', 'Students'),
  teachers: loadRoute('./routes/teachers', 'Teachers'),
  parents: loadRoute('./routes/parents', 'Parents'),
  staff: loadRoute('./routes/staff', 'Staff'),
  staffAdvanced: loadRoute('./routes/staff-advanced', 'Staff Advanced'),
  roles: loadRoute('./routes/roles', 'Roles'),
  serialCodes: loadRoute('./routes/serial-codes', 'Serial Codes'),
  
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
  
  // NEW COMPREHENSIVE SYSTEMS
  academicSystem: loadRoute('./routes/academic-system', 'Academic System'),
  admissionSystem: loadRoute('./routes/admission-system', 'Admission System'),
  alumniSystem: loadRoute('./routes/alumni-system', 'Alumni System'),
  cafeteriaSystem: loadRoute('./routes/cafeteria-system', 'Cafeteria System'),
  certificateSystem: loadRoute('./routes/certificate-system', 'Certificate System'),
  counselingSystem: loadRoute('./routes/counseling-system', 'Counseling System'),
  medicalSystem: loadRoute('./routes/medical-system', 'Medical System'),
  hostelSystem: loadRoute('./routes/hostel-system', 'Hostel System'),
  librarySystem: loadRoute('./routes/library-system', 'Library System'),
  workshopSystem: loadRoute('./routes/workshop-system', 'Workshop System'),
  financialSystem: loadRoute('./routes/financial-system', 'Financial System'),
  
  // Finance & Stock
  finance: loadRoute('./routes/finance', 'Finance'),
  stock: loadRoute('./routes/stock', 'Stock'),
  
  // Discipline & DOS
  discipline: loadRoute('./routes/discipline', 'Discipline'),
  disciplineManagement: loadRoute('./routes/discipline-management', 'Discipline Management'),
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
  globalStudentSheets: loadRoute('./routes/global-student-sheets', 'Global Student Sheets'),
  studentCompetitions: loadRoute('./routes/student-competitions', 'Student Competitions'),
  studentAdvanced: loadRoute('./routes/student-advanced', 'Student Advanced'),
  
  // Teacher Features
  teacherPortal: loadRoute('./routes/teacher-portal', 'Teacher Portal'),
  teacherAdvanced: loadRoute('./routes/teacher-advanced', 'Teacher Advanced'),
  marksManagement: loadRoute('./routes/marks-management', 'Marks Management'),
  
  // Staff Features
  staffDashboard: loadRoute('./routes/staff-dashboard', 'Staff Dashboard'),
  comprehensiveManagement: loadRoute('./routes/comprehensive-management', 'Comprehensive Management'),
  
  // Communication
  messages: loadRoute('./routes/messages', 'Messages'),
  notifications: loadRoute('./routes/notifications', 'Notifications'),
  liveChat: loadRoute('./routes/live-chat', 'Live Chat'),
  comprehensiveMessaging: loadRoute('./routes/comprehensive-messaging', 'Comprehensive Messaging'),
  automatedNotifications: loadRoute('./routes/automated-notifications', 'Automated Notifications'),
  
  // Content & Dynamic
  content: loadRoute('./routes/content', 'Content'),
  dynamic: loadRoute('./routes/dynamic', 'Dynamic'),
  dynamicContent: loadRoute('./routes/dynamicContent', 'Dynamic Content'),
  homepage: loadRoute('./routes/homepage', 'Homepage'),
  news: loadRoute('./routes/news', 'News'),
  homeContent: loadRoute('./routes/home-content', 'Home Content'),
  hero: loadRoute('./routes/hero', 'Hero'),
  gallery: loadRoute('./routes/gallery', 'Gallery'),
  articleInteractions: loadRoute('./routes/article-interactions', 'Article Interactions'),
  
  // Sports & Teams
  sports: loadRoute('./routes/sports', 'Sports'),
  sportsPlayers: loadRoute('./routes/sports-players', 'Sports Players'),
  sportsAdvanced: loadRoute('./routes/sports-advanced', 'Sports Advanced'),
  sportsManagement: loadRoute('./routes/sports-management', 'Sports Management'),
  sportsComprehensive: loadRoute('./routes/sports-comprehensive', 'Sports Comprehensive'),
  teams: loadRoute('./routes/teams', 'Teams'),
  
  // Trades & Services
  trades: loadRoute('./routes/trades', 'Trades'),
  tradesCourses: loadRoute('./routes/trades-courses', 'Trades Courses'),
  tradeImages: loadRoute('./routes/trade-images', 'Trade Images'),
  levels: loadRoute('./routes/levels', 'Levels'),
  services: loadRoute('./routes/services', 'Services'),
  servicesAdvanced: loadRoute('./routes/services-advanced', 'Services Advanced'),
  
  // Support & Contact
  contact: loadRoute('./routes/contact', 'Contact'),
  support: loadRoute('./routes/support', 'Support'),
  
  // Advanced Management APIs
  hrManagement: loadRoute('./routes/hr-management', 'HR Management'),
  advancedAnalytics: loadRoute('./routes/advanced-analytics', 'Advanced Analytics'),
  inventoryManagement: loadRoute('./routes/inventory-management', 'Inventory Management'),
  eventManagement: loadRoute('./routes/event-management', 'Event Management'),
  communicationHub: loadRoute('./routes/communication-hub', 'Communication Hub'),
  advancedReports: loadRoute('./routes/advanced-reports', 'Advanced Reports'),
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
  developersApi: loadRoute('./routes/developers-api', 'Developers API'),
  advisor: loadRoute('./routes/advisor', 'Advisor'),
  search: loadRoute('./routes/search', 'Search'),
  advancedSearch: loadRoute('./routes/advanced-search', 'Advanced Search'),
  uploads: loadRoute('./routes/uploads', 'Uploads'),
  admin: loadRoute('./routes/admin', 'Admin'),
  adminManagement: loadRoute('./routes/admin-management', 'Admin Management'),
  adminAdvanced: loadRoute('./routes/admin-advanced', 'Admin Advanced'),
  accountant: loadRoute('./routes/accountant', 'Accountant'),
  studentPayments: loadRoute('./routes/studentPayments', 'Student Payments'),
  paymentAnalytics: loadRoute('./routes/paymentAnalytics', 'Payment Analytics'),
  accountantManagement: loadRoute('./routes/accountantManagement', 'Accountant Management'),
  accountantAdvanced: loadRoute('./routes/accountant-advanced', 'Accountant Advanced'),
  paymentProofs: loadRoute('./routes/payment-proofs', 'Payment Proofs'),
  classes: loadRoute('./routes/classes', 'Classes'),
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
  sms: loadRoute('./routes/sms', 'SMS'),
  parentMessages: loadRoute('./routes/parent-messages', 'Parent Messages'),
  parentPortal: loadRoute('./routes/parent-portal', 'Parent Portal'),
  
  // Admin Management
  adminComprehensive: loadRoute('./routes/admin-comprehensive', 'Admin Comprehensive'),
  contentManagement: loadRoute('./routes/content-management', 'Content Management'),
  reports: loadRoute('./routes/reports', 'Reports'),
  sportsHeroManagement: loadRoute('./routes/sports-hero-management', 'Sports & Hero Management'),
  unifiedContent: loadRoute('./routes/unified-content', 'Unified Content'),
  comprehensiveStaff: loadRoute('./routes/comprehensive-staff', 'Comprehensive Staff'),
  
  // Comprehensive Full-Stack APIs (Production-Ready)
  comprehensiveUsers: loadRoute('./routes/comprehensive-users-api', 'Comprehensive Users API'),
  comprehensiveAcademic: loadRoute('./routes/comprehensive-academic-api', 'Comprehensive Academic API'),
  comprehensiveFinance: loadRoute('./routes/comprehensive-finance-api', 'Comprehensive Finance API'),
  comprehensiveStock: loadRoute('./routes/comprehensive-stock-api', 'Comprehensive Stock API'),
  comprehensiveKnowledgeNotifications: loadRoute('./routes/comprehensive-knowledge-notifications-admissions-exams-api', 'Comprehensive Knowledge & Notifications API'),
  comprehensiveAttendanceGrades: loadRoute('./routes/comprehensive-attendance-grades-assignments-api', 'Comprehensive Attendance & Grades API'),
  comprehensiveLibraryServices: loadRoute('./routes/comprehensive-library-hostel-transport-sports-communication-api', 'Comprehensive Library & Services API'),
  
  // Unified Integration API (Master Integration)
  unifiedIntegration: loadRoute('./routes/unified-integration-api', 'Unified Integration API'),
  
  // DOD Comprehensive System
  dodComprehensive: loadRoute('./routes/dod-comprehensive', 'DOD Comprehensive'),
  dodAdvanced: loadRoute('./routes/dod-advanced', 'DOD Advanced'),
  dodComplete: loadRoute('./routes/dod-complete', 'DOD Complete'),
  dodProfile: loadRoute('./routes/dod-profile', 'DOD Profile'),
  dodActions: loadRoute('./routes/dod-actions', 'DOD Actions'),
  dod: loadRoute('./routes/dod', 'DOD Management'),
  staffManagement: loadRoute('./routes/staff-management', 'Staff Management'),
  
  // DOS Comprehensive Management
  dosComprehensiveManagement: loadRoute('./routes/dos-comprehensive-management', 'DOS Comprehensive Management'),
  dosAdvancedManagement: loadRoute('./routes/dos-advanced-management', 'DOS Advanced Management'),
  
  // NEW MISSING ROUTES - Full Feature Set
  curriculum: loadRoute('./routes/curriculum', 'Curriculum'),
  budgets: loadRoute('./routes/budgets', 'Budgets'),
  announcements: loadRoute('./routes/announcements', 'Announcements'),
  clubs: loadRoute('./routes/clubs', 'Clubs'),
  backups: loadRoute('./routes/backups', 'Backups'),
  systemSettings: loadRoute('./routes/system-settings', 'System Settings'),
  testimonials: loadRoute('./routes/testimonials', 'Testimonials'),
  expenses: loadRoute('./routes/expenses', 'Expenses'),
  salaries: loadRoute('./routes/salaries', 'Salaries'),
  emergencyContacts: loadRoute('./routes/emergency-contacts', 'Emergency Contacts'),
  invoices: loadRoute('./routes/invoices', 'Invoices'),
  events: loadRoute('./routes/events', 'Events'),
  forums: loadRoute('./routes/forums', 'Forums'),
  advancedRoleFeatures: loadRoute('./routes/advanced-role-features', 'Advanced Role Features'),
  
  // COMPREHENSIVE ADVANCED FEATURES
  universalStaffManagement: loadRoute('./routes/universal-staff-management', 'Universal Staff Management'),
  adminDashboardAdvanced: loadRoute('./routes/admin-dashboard-advanced', 'Admin Dashboard Advanced'),
  accountantComprehensive: loadRoute('./routes/accountant-comprehensive', 'Accountant Comprehensive'),
  stockManagementAdvanced: loadRoute('./routes/stock-management-advanced', 'Stock Management Advanced'),
  teacherPortalAdvanced: loadRoute('./routes/teacher-portal-advanced', 'Teacher Portal Advanced'),
  studentPortalComprehensive: loadRoute('./routes/student-portal-comprehensive', 'Student Portal Comprehensive'),
  parentPortalComprehensive: loadRoute('./routes/parent-portal-comprehensive', 'Parent Portal Comprehensive'),
  
  // NEW COMPREHENSIVE GLOBAL SYSTEM
  globalStudentManagement: loadRoute('./routes/global-student-management', 'Global Student Management'),
  comprehensiveStaffActions: loadRoute('./routes/comprehensive-staff-actions', 'Comprehensive Staff Actions'),
  analyticsAISystem: loadRoute('./routes/analytics-ai-system', 'Analytics AI System'),
  
  // SCHOOL OWNER - Supreme Access
  schoolOwner: loadRoute('./routes/school-owner', 'School Owner'),
  patronMatronComprehensive: loadRoute('./routes/patron-matron-comprehensive', 'Patron Matron Comprehensive'),
  
  // ULTRA-COMPREHENSIVE STAFF PORTALS (Full-Featured)
  parentPortalUltra: loadRoute('./routes/parent-portal-ultra', 'Parent Portal Ultra'),
  studentPortalUltra: loadRoute('./routes/student-portal-ultra', 'Student Portal Ultra'),
  accountantUltra: loadRoute('./routes/accountant-ultra', 'Accountant Ultra'),
  teacherPortalUltra: loadRoute('./routes/teacher-portal-ultra', 'Teacher Portal Ultra'),
  adminHeadmasterUltra: loadRoute('./routes/admin-headmaster-ultra', 'Admin Headmaster Ultra'),
  stockManagerUltra: loadRoute('./routes/stock-manager-ultra', 'Stock Manager Ultra'),
  advisorUltra: loadRoute('./routes/advisor-ultra', 'Advisor Ultra'),
  dosUltra: loadRoute('./routes/dos-ultra', 'DOS Ultra'),
  dodUltra: loadRoute('./routes/dod-ultra', 'DOD Ultra'),
  dodUltraAdvanced: loadRoute('./routes/dod-ultra-advanced', 'DOD Ultra Advanced'),
  
  // ULTRA-ADVANCED ROUTES (Feature-Complete, Modern, Production-Ready)
  dosUltraAdvanced: loadRoute('./routes/dos-ultra-advanced', 'DOS Ultra Advanced'),
  timetableUltraAdvanced: loadRoute('./routes/timetable-ultra-advanced', 'Timetable Ultra Advanced'),
  studentUltraAdvanced: loadRoute('./routes/student-ultra-advanced', 'Student Ultra Advanced'),
  accountantUltraAdvanced: loadRoute('./routes/accountant-ultra-advanced', 'Accountant Ultra Advanced'),
  stockUltraAdvanced: loadRoute('./routes/stock-ultra-advanced', 'Stock Ultra Advanced'),
  serialCodeSystem: loadRoute('./routes/serial-code-system', 'Serial Code System'),
  teacherStudentMarks: loadRoute('./routes/teacher-student-marks', 'Teacher Student Marks'),
};

// Mount routes
let mountedRoutes = 0;

// Authentication & Authorization
app.use('/api/fee-reminders', require('./routes/fee-reminders')); mountedRoutes++;
app.use('/api/messaging', require('./routes/unified-messaging')); mountedRoutes++;
if (routes.auth) { app.use('/api/auth', routes.auth); mountedRoutes++; }
if (routes.authEnhanced) { app.use('/api/auth-enhanced', require('./routes/auth-enhanced')); mountedRoutes++; }
if (routes.comprehensiveAuth) { app.use('/api/comprehensive-auth', routes.comprehensiveAuth); mountedRoutes++; }
if (routes.roleAuth) { app.use('/api/role-auth', routes.roleAuth); mountedRoutes++; }
if (routes.staffAuth) { app.use('/api/staff-auth', routes.staffAuth); mountedRoutes++; }
if (routes.userAuth) { app.use('/api/user-auth', routes.userAuth); mountedRoutes++; }

// User Management
if (routes.users) { app.use('/api/users', routes.users); mountedRoutes++; }
if (routes.students) { app.use('/api/students', routes.students); mountedRoutes++; }
if (routes.serialCodes) { app.use('/api/serial-codes', routes.serialCodes); mountedRoutes++; }
if (routes.teachers) { app.use('/api/teachers', routes.teachers); mountedRoutes++; }
if (routes.teacherAdvanced) { app.use('/api/teacher-advanced', routes.teacherAdvanced); mountedRoutes++; }
if (routes.parents) { app.use('/api/parents', routes.parents); mountedRoutes++; }
if (routes.staff) { app.use('/api/staff', routes.staff); mountedRoutes++; }
if (routes.staffAdvanced) { app.use('/api/staff-advanced', routes.staffAdvanced); mountedRoutes++; }
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

// NEW COMPREHENSIVE SYSTEMS
if (routes.academicSystem) { app.use('/api/academic-system', routes.academicSystem); mountedRoutes++; }
if (routes.admissionSystem) { app.use('/api/admission-system', routes.admissionSystem); mountedRoutes++; }
if (routes.alumniSystem) { app.use('/api/alumni-system', routes.alumniSystem); mountedRoutes++; }
if (routes.cafeteriaSystem) { app.use('/api/cafeteria-system', routes.cafeteriaSystem); mountedRoutes++; }
if (routes.certificateSystem) { app.use('/api/certificate-system', routes.certificateSystem); mountedRoutes++; }
if (routes.counselingSystem) { app.use('/api/counseling-system', routes.counselingSystem); mountedRoutes++; }
if (routes.medicalSystem) { app.use('/api/medical-system', routes.medicalSystem); mountedRoutes++; }
if (routes.hostelSystem) { app.use('/api/hostel-system', routes.hostelSystem); mountedRoutes++; }
if (routes.librarySystem) { app.use('/api/library-system', routes.librarySystem); mountedRoutes++; }
if (routes.workshopSystem) { app.use('/api/workshop-system', routes.workshopSystem); mountedRoutes++; }
if (routes.financialSystem) { app.use('/api/financial-system', routes.financialSystem); mountedRoutes++; }

// Finance & Stock
if (routes.finance) { app.use('/api/finance', routes.finance); mountedRoutes++; }
if (routes.stock) { app.use('/api/stock', routes.stock); mountedRoutes++; }

// Discipline & DOS
if (routes.discipline) { app.use('/api/discipline', routes.discipline); mountedRoutes++; }
if (routes.disciplineManagement) { app.use('/api/discipline-management', routes.disciplineManagement); mountedRoutes++; }
app.use('/api/discipline-management/leave', require('./routes/leave-management')); mountedRoutes++;
if (routes.dos) { app.use('/api/dos', routes.dos); mountedRoutes++; }
if (routes.dosAdvanced) { app.use('/api/dos-advanced', routes.dosAdvanced); mountedRoutes++; }
if (routes.dosManagement) { app.use('/api/dos-management', routes.dosManagement); mountedRoutes++; }

// Parent Features
if (routes.parentDashboard) { app.use('/api/parent-dashboard', routes.parentDashboard); mountedRoutes++; }
if (routes.parentLinking) { app.use('/api/parent-linking', routes.parentLinking); mountedRoutes++; }
if (routes.parentMonitoring) { app.use('/api/parent-monitoring', routes.parentMonitoring); mountedRoutes++; }

// Parent Payment Portal - GT Bank, BPR, Equity Bank Integration
app.use('/api/parent-payment-portal', require('./routes/parent-payment-portal')); mountedRoutes++;

// Class Management
if (routes.classManagement) { app.use('/api/class-management', routes.classManagement); mountedRoutes++; }
if (routes.classSheets) { app.use('/api/class-sheets', routes.classSheets); mountedRoutes++; }
if (routes.classSheetsApi) { app.use('/api/class-sheets-api', routes.classSheetsApi); mountedRoutes++; }

// Student Features
if (routes.studentManagement) { app.use('/api/student-management', routes.studentManagement); mountedRoutes++; }
app.use('/api/management', require('./routes/student-sheets-advanced')); mountedRoutes++;
if (routes.studentSheets) { app.use('/api/student-sheets', routes.studentSheets); mountedRoutes++; }
if (routes.globalStudentSheets) { app.use('/api/global-sheets', routes.globalStudentSheets); mountedRoutes++; }
if (routes.studentCompetitions) { app.use('/api/student-competitions', routes.studentCompetitions); mountedRoutes++; }
if (routes.studentAdvanced) { app.use('/api/student-advanced', routes.studentAdvanced); mountedRoutes++; }

// Teacher Features
if (routes.teacherPortal) { app.use('/api/teacher-portal', routes.teacherPortal); mountedRoutes++; }
if (routes.teacherAdvanced) { app.use('/api/teacher-advanced', routes.teacherAdvanced); mountedRoutes++; }
app.use('/api/teacher-content', require('./routes/teacher-content-management')); mountedRoutes++;
if (routes.marksManagement) { app.use('/api/marks-management', routes.marksManagement); mountedRoutes++; }
if (routes.staffDashboard) { app.use('/api/staff', routes.staffDashboard); mountedRoutes++; }
if (routes.comprehensiveManagement) { app.use('/api/management', routes.comprehensiveManagement); mountedRoutes++; }

// Communication
if (routes.messages) { app.use('/api/messages', routes.messages(io)); mountedRoutes++; }
if (routes.notifications) { app.use('/api/notifications', routes.notifications); mountedRoutes++; }
if (routes.liveChat) { app.use('/api/live-chat', routes.liveChat); mountedRoutes++; }
if (routes.comprehensiveMessaging) { app.use('/api/comprehensive-messaging', routes.comprehensiveMessaging); mountedRoutes++; }
if (routes.automatedNotifications) { app.use('/api/automated-notifications', routes.automatedNotifications); mountedRoutes++; }

// Content & Dynamic
if (routes.content) { app.use('/api/content', routes.content); mountedRoutes++; }
if (routes.dynamic) { app.use('/api/dynamic', routes.dynamic); mountedRoutes++; }
if (routes.dynamicContent) { app.use('/api/dynamic-content', routes.dynamicContent); mountedRoutes++; }
if (routes.homepage) { app.use('/api/homepage', routes.homepage); mountedRoutes++; }
if (routes.news) { app.use('/api/news', routes.news); mountedRoutes++; }
if (routes.homeContent) { app.use('/api/home-content', routes.homeContent); mountedRoutes++; }
if (routes.hero) { app.use('/api/hero', routes.hero); mountedRoutes++; }
if (routes.gallery) { app.use('/api/gallery', routes.gallery); mountedRoutes++; }
if (routes.articleInteractions) { app.use('/api/article-interactions', routes.articleInteractions); mountedRoutes++; }

// Sports & Teams
if (routes.sports) { app.use('/api/sports', routes.sports); mountedRoutes++; }
if (routes.sportsPlayers) { app.use('/api/sports-players', routes.sportsPlayers); mountedRoutes++; }
if (routes.sportsAdvanced) { app.use('/api/sports-advanced', routes.sportsAdvanced); mountedRoutes++; }
if (routes.sportsManagement) { app.use('/api/sports-management', routes.sportsManagement); mountedRoutes++; }
if (routes.sportsComprehensive) { app.use('/api/sports-comprehensive', routes.sportsComprehensive); mountedRoutes++; }
if (routes.teams) { app.use('/api/teams', routes.teams); mountedRoutes++; }

// Trades & Services (Unified: trades + courses + classes)
if (routes.trades) { app.use('/api/trades', routes.trades); mountedRoutes++; }
if (routes.tradesCourses) { app.use('/api/trades-courses', routes.tradesCourses); mountedRoutes++; }
app.use('/api/trade-courses-api', require('./routes/trade-courses-api')); mountedRoutes++;
if (routes.tradeImages) { app.use('/api/trade-images', routes.tradeImages); mountedRoutes++; }
if (routes.levels) { app.use('/api/levels', routes.levels); mountedRoutes++; }
app.use('/api/trades-levels', require('./routes/trades-levels')); mountedRoutes++;
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
app.use('/api/advisor', require('./routes/advisor')); mountedRoutes++;
app.use('/api/advisor-staff', require('./routes/advisor-staff')); mountedRoutes++;
app.use('/api/advisor-management', require('./routes/advisor-management')); mountedRoutes++;
app.use('/api/advisor-detail', require('./routes/advisor-detail')); mountedRoutes++;
app.use('/api/advisor-comprehensive', require('./routes/advisor-comprehensive')); mountedRoutes++;
app.use('/api/advisor-dashboard', require('./routes/advisor-dashboard-kinyarwanda')); mountedRoutes++;
app.use('/api/staff-roles', require('./routes/staff-roles')); mountedRoutes++;
app.use('/api/staff-credentials', require('./routes/staff-credentials')); mountedRoutes++;
app.use('/api/dynamic-sheets', require('./routes/dynamic-student-sheets')); mountedRoutes++;
app.use('/api/staff-dynamic-sheets', require('./routes/staff-dynamic-sheets')); mountedRoutes++;
app.use('/api/timetable-generator', require('./routes/timetable-generator')); mountedRoutes++;
if (routes.developers) { app.use('/api/developers', routes.developers); mountedRoutes++; }
if (routes.developersApi) { app.use('/api/developers-api', routes.developersApi); mountedRoutes++; }
if (routes.advisor) { app.use('/api/advisor', routes.advisor); mountedRoutes++; }

// Advanced Management APIs
if (routes.hrManagement) { app.use('/api/hr-management', routes.hrManagement); mountedRoutes++; }
if (routes.advancedAnalytics) { app.use('/api/advanced-analytics', routes.advancedAnalytics); mountedRoutes++; }
if (routes.inventoryManagement) { app.use('/api/inventory-management', routes.inventoryManagement); mountedRoutes++; }
if (routes.eventManagement) { app.use('/api/event-management', routes.eventManagement); mountedRoutes++; }
if (routes.communicationHub) { app.use('/api/communication-hub', routes.communicationHub); mountedRoutes++; }
if (routes.advancedReports) { app.use('/api/advanced-reports', routes.advancedReports); mountedRoutes++; }
if (routes.search) { app.use('/api/search', routes.search); mountedRoutes++; }
if (routes.advancedSearch) { app.use('/api/advanced-search', routes.advancedSearch); mountedRoutes++; }
if (routes.uploads) { app.use('/api/uploads', routes.uploads); mountedRoutes++; }
if (routes.admin) { app.use('/api/admin', routes.admin); mountedRoutes++; }
if (routes.adminManagement) { app.use('/api/admin-management', routes.adminManagement); mountedRoutes++; }
if (routes.adminAdvanced) { app.use('/api/admin-advanced', routes.adminAdvanced); mountedRoutes++; }
if (routes.accountant) { app.use('/api/accountant', routes.accountant); mountedRoutes++; }
if (routes.studentPayments) { app.use('/api/accountant', routes.studentPayments); mountedRoutes++; }
if (routes.paymentAnalytics) { app.use('/api/accountant', routes.paymentAnalytics); mountedRoutes++; }
if (routes.accountantManagement) { app.use('/api/accountant', routes.accountantManagement); mountedRoutes++; }
if (routes.accountantAdvanced) { app.use('/api/accountant-advanced', routes.accountantAdvanced); mountedRoutes++; }
if (routes.paymentProofs) { app.use('/api/payment-proofs', routes.paymentProofs); mountedRoutes++; }
if (routes.classes) { app.use('/api/classes', routes.classes); mountedRoutes++; }
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
if (routes.sms) { app.use('/api/sms', routes.sms); mountedRoutes++; }
if (routes.parentMessages) { app.use('/api/parents', routes.parentMessages); mountedRoutes++; }
if (routes.parentPortal) { app.use('/api/parent-dashboard', routes.parentPortal); mountedRoutes++; }

// Admin Management
if (routes.adminComprehensive) { app.use('/api/admin', routes.adminComprehensive); mountedRoutes++; }
if (routes.contentManagement) { app.use('/api/content-management', routes.contentManagement); mountedRoutes++; }
if (routes.reports) { app.use('/api/reports', routes.reports); mountedRoutes++; }
if (routes.sportsHeroManagement) { app.use('/api/sports-hero', routes.sportsHeroManagement); mountedRoutes++; }
if (routes.unifiedContent) { app.use('/api/unified-content', routes.unifiedContent); mountedRoutes++; }
if (routes.comprehensiveStaff) { app.use('/api/comprehensive-staff', routes.comprehensiveStaff); mountedRoutes++; }

// Comprehensive Full-Stack APIs (Production-Ready)
if (routes.comprehensiveUsers) { app.use('/api/v1/users', routes.comprehensiveUsers); mountedRoutes++; }
if (routes.comprehensiveAcademic) { app.use('/api/v1/academic', routes.comprehensiveAcademic); mountedRoutes++; }
if (routes.comprehensiveFinance) { app.use('/api/v1/finance', routes.comprehensiveFinance); mountedRoutes++; }
if (routes.comprehensiveStock) { app.use('/api/v1/stock', routes.comprehensiveStock); mountedRoutes++; }
if (routes.comprehensiveKnowledgeNotifications) { app.use('/api/v1/knowledge', routes.comprehensiveKnowledgeNotifications); mountedRoutes++; }
if (routes.comprehensiveAttendanceGrades) { app.use('/api/v1/academics-tracking', routes.comprehensiveAttendanceGrades); mountedRoutes++; }
if (routes.comprehensiveLibraryServices) { app.use('/api/v1/services', routes.comprehensiveLibraryServices); mountedRoutes++; }

// Unified Integration API (Master Integration)
if (routes.unifiedIntegration) { app.use('/api/unified-integration', routes.unifiedIntegration); mountedRoutes++; }

// DOD Comprehensive System
if (routes.dodComprehensive) { app.use('/api/dod-comprehensive', routes.dodComprehensive); mountedRoutes++; }
if (routes.dodAdvanced) { app.use('/api/dod-advanced', routes.dodAdvanced); mountedRoutes++; }
if (routes.dodComplete) { app.use('/api/dod-complete', routes.dodComplete); mountedRoutes++; }
if (routes.dodProfile) { app.use('/api/dod-profile', routes.dodProfile); mountedRoutes++; }
if (routes.dodActions) { app.use('/api/dod-actions', routes.dodActions); mountedRoutes++; }

// Prefer the global-student-sheet powered DOD
if (routes.dodUltraAdvanced) {
  app.use('/api/dod', routes.dodUltraAdvanced); mountedRoutes++;
} else if (routes.dodUltra) {
  app.use('/api/dod', routes.dodUltra); mountedRoutes++;
} else {
  app.use('/api/dod', require('./routes/dod')); mountedRoutes++;
}
// Keep legacy endpoints for compatibility
app.use('/api/dod-legacy', require('./routes/dod')); mountedRoutes++;
if (routes.staffManagement) { app.use('/api/staff-management', routes.staffManagement); mountedRoutes++; }

// DOS Comprehensive Management
app.use('/api/dos-management', require('./routes/dos-management')); mountedRoutes++;
if (routes.dosComprehensiveManagement) { app.use('/api/dos-comprehensive', routes.dosComprehensiveManagement); mountedRoutes++; }
if (routes.dosAdvancedManagement) { app.use('/api/dos-advanced', routes.dosAdvancedManagement); mountedRoutes++; }

// Parent Linking & Access Control
app.use('/api/parent-linking', require('./routes/parent-linking')); mountedRoutes++;

// SMS Routes (African Talking)
app.use('/api/sms', require('./routes/sms')); mountedRoutes++;

// NEW MISSING ROUTES - Full Feature Set
if (routes.curriculum) { app.use('/api/curriculum', routes.curriculum); mountedRoutes++; }
if (routes.budgets) { app.use('/api/budgets', routes.budgets); mountedRoutes++; }
if (routes.announcements) { app.use('/api/announcements', routes.announcements); mountedRoutes++; }
if (routes.clubs) { app.use('/api/clubs', routes.clubs); mountedRoutes++; }
if (routes.backups) { app.use('/api/backups', routes.backups); mountedRoutes++; }
if (routes.systemSettings) { app.use('/api/system-settings', routes.systemSettings); mountedRoutes++; }
if (routes.testimonials) { app.use('/api/testimonials', routes.testimonials); mountedRoutes++; }
if (routes.expenses) { app.use('/api/expenses', routes.expenses); mountedRoutes++; }
if (routes.salaries) { app.use('/api/salaries', routes.salaries); mountedRoutes++; }
if (routes.emergencyContacts) { app.use('/api/emergency-contacts', routes.emergencyContacts); mountedRoutes++; }
if (routes.invoices) { app.use('/api/invoices', routes.invoices); mountedRoutes++; }
if (routes.events) { app.use('/api/events', routes.events); mountedRoutes++; }
if (routes.forums) { app.use('/api/forums', routes.forums); mountedRoutes++; }
if (routes.advancedRoleFeatures) { app.use('/api/advanced-role-features', routes.advancedRoleFeatures); mountedRoutes++; }

// COMPREHENSIVE ADVANCED FEATURES
if (routes.universalStaffManagement) { app.use('/api/universal-management', routes.universalStaffManagement); mountedRoutes++; }
if (routes.adminDashboardAdvanced) { app.use('/api/admin-dashboard-advanced', routes.adminDashboardAdvanced); mountedRoutes++; }
if (routes.accountantComprehensive) { app.use('/api/accountant-comprehensive', routes.accountantComprehensive); mountedRoutes++; }
if (routes.stockManagementAdvanced) { app.use('/api/stock-advanced', routes.stockManagementAdvanced); mountedRoutes++; }
if (routes.teacherPortalAdvanced) { app.use('/api/teacher-portal-advanced', routes.teacherPortalAdvanced); mountedRoutes++; }
if (routes.studentPortalComprehensive) { app.use('/api/student-portal-comprehensive', routes.studentPortalComprehensive); mountedRoutes++; }
if (routes.parentPortalComprehensive) { app.use('/api/parent-portal-comprehensive', routes.parentPortalComprehensive); mountedRoutes++; }

// SCHOOL OWNER - Supreme Access
if (routes.schoolOwner) { app.use('/api/school-owner', routes.schoolOwner); mountedRoutes++; }
if (routes.patronMatronComprehensive) { app.use('/api/patron-matron', routes.patronMatronComprehensive); mountedRoutes++; }

// ULTRA-COMPREHENSIVE STAFF PORTALS (Full-Featured, Database-Integrated)
if (routes.parentPortalUltra) { app.use('/api/parent-portal-ultra', routes.parentPortalUltra); mountedRoutes++; }
if (routes.studentPortalUltra) { app.use('/api/student-portal-ultra', routes.studentPortalUltra); mountedRoutes++; }
if (routes.accountantUltra) { app.use('/api/accountant-ultra', routes.accountantUltra); mountedRoutes++; }
if (routes.teacherPortalUltra) { app.use('/api/teacher-portal-ultra', routes.teacherPortalUltra); mountedRoutes++; }
if (routes.adminHeadmasterUltra) { app.use('/api/admin-headmaster-ultra', routes.adminHeadmasterUltra); mountedRoutes++; }
if (routes.stockManagerUltra) { app.use('/api/stock-manager-ultra', routes.stockManagerUltra); mountedRoutes++; }
if (routes.advisorUltra) { app.use('/api/advisor-ultra', routes.advisorUltra); mountedRoutes++; }
if (routes.dosUltra) { app.use('/api/dos-ultra', routes.dosUltra); mountedRoutes++; }
if (routes.dodUltra) { app.use('/api/dod-ultra', routes.dodUltra); mountedRoutes++; }

// ULTRA-ADVANCED ROUTES (Modern, Feature-Complete, Production-Ready)
if (routes.dosUltraAdvanced) { app.use('/api/dos-ultra-advanced', routes.dosUltraAdvanced); mountedRoutes++; }
if (routes.timetableUltraAdvanced) { app.use('/api/timetable-ultra-advanced', routes.timetableUltraAdvanced); mountedRoutes++; }
if (routes.studentUltraAdvanced) { app.use('/api/student-ultra-advanced', routes.studentUltraAdvanced); mountedRoutes++; }
if (routes.accountantUltraAdvanced) { app.use('/api/accountant-ultra-advanced', routes.accountantUltraAdvanced); mountedRoutes++; }
if (routes.stockUltraAdvanced) { app.use('/api/stock-ultra-advanced', routes.stockUltraAdvanced); mountedRoutes++; }
if (routes.serialCodeSystem) { app.use('/api/serial-code-system', routes.serialCodeSystem); mountedRoutes++; }
if (routes.teacherStudentMarks) { app.use('/api/teacher-student-marks', routes.teacherStudentMarks); mountedRoutes++; }

  // COMPREHENSIVE ROLE-BASED API (All 8 Roles Unified)
  app.use('/api/comprehensive-roles', require('./routes/comprehensive-roles-api')); mountedRoutes++;

// Headmaster Applications Management
app.use('/api/headmaster-applications', require('./routes/headmaster-applications')); mountedRoutes++;

// DOS Applications Management
app.use('/api/dos-applications', require('./routes/dos-applications')); mountedRoutes++;

// DOS Dashboard Ultra Advanced API
app.use('/api/dos-dashboard', require('./routes/dos-dashboard-api')); mountedRoutes++;

// Location System
app.use('/api/locations', require('./routes/locations')); mountedRoutes++;
app.use('/api/rwanda-locations', require('./routes/rwanda-locations')); mountedRoutes++;

// Student Applications System
app.use('/api/student-applications', require('./routes/student-applications')); mountedRoutes++;
app.use('/api/student-applications-production', require('./routes/student-applications-production')); mountedRoutes++;

// Force Credential Change
app.use('/api/auth', require('./routes/force-credential-change')); mountedRoutes++;

// Staff Access Codes Management
app.use('/api/staff-access-codes', require('./routes/staff-access-codes')); mountedRoutes++;

// Admin Content Management
if (routes.adminContent) { app.use('/api/admin-content', routes.adminContent); mountedRoutes++; }
else { app.use('/api/admin-content', require('./routes/admin-content')); mountedRoutes++; }

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

// Start server with dynamic port selection
const PORT = process.env.PORT || 5000;
const startServer = (port) => {
  server.listen(port, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM');
  console.log('='.repeat(80));
    console.log(`🚀 Server: http://localhost:${port}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'school_management'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Mounted ${mountedRoutes} route modules`);
    console.log('\n📡 API Endpoints:');
    console.log('   /api/auth                    - Authentication');
    console.log('   /api/unified-integration     - 🌟 Master Integration API');
    console.log('   /api/developers              - Developers Team');
    console.log('   /api/leadership              - School Leadership');
    console.log('   /api/trades                  - School Trades');
    console.log('   /api/services                - School Services');
    console.log('   /api/services-advanced       - Advanced Services & Coaches');
    console.log('   /api/sports                  - Sports & Teams');
    console.log('   /api/sports-players          - Players & Goals');
    console.log('   /api/news                    - News Articles');
    console.log('   /api/search                  - Global Search');
    console.log('   /api/comprehensive-staff     - Staff Management');
    console.log('   /api/student-applications    - Student Applications');
    console.log('   /api/student-applications    - Student Applications');
    console.log('   /api/locations               - Rwanda Location Data');
    console.log('   /api/rwanda-locations        - Rwanda Provinces/Districts/Sectors/Cells/Villages');
    console.log('   /api/advisor                 - Advisor Dashboard');
    console.log('   /api/discipline-management   - DOD/Matron/Patron Management');
    console.log('\n✅ All systems operational - Unified Integration Active');
    console.log('='.repeat(80) + '\n');
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
};

startServer(PORT);

module.exports = app;
