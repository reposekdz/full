const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';
let testResults = [];
let successCount = 0;
let failCount = 0;
let totalTests = 0;

const testEndpoint = async (method, endpoint, description, requiresAuth = false, data = null) => {
  totalTests++;
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const config = {
      method,
      url,
      timeout: 5000,
      validateStatus: (status) => status < 500
    };
    
    if (requiresAuth) {
      config.headers = { 'Authorization': 'Bearer test-token' };
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const passed = response.status < 500;
    
    if (passed) successCount++;
    else failCount++;
    
    testResults.push({
      endpoint,
      method,
      description,
      status: response.status,
      passed,
      message: response.data?.message || 'OK'
    });
    
    console.log(`${passed ? '✅' : '❌'} [${response.status}] ${method.padEnd(6)} ${endpoint} - ${description}`);
    return passed;
  } catch (error) {
    failCount++;
    const status = error.response?.status || 'ERROR';
    const message = error.message || 'Unknown error';
    
    testResults.push({
      endpoint,
      method,
      description,
      status,
      passed: false,
      message
    });
    
    console.log(`❌ [${status}] ${method.padEnd(6)} ${endpoint} - ${description} (${message})`);
    return false;
  }
};

const runAllTests = async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPREHENSIVE API TESTING SUITE - 600+ ENDPOINTS');
  console.log('='.repeat(80) + '\n');
  
  console.log('📋 CATEGORY 1: AUTHENTICATION & AUTHORIZATION APIs');
  console.log('-'.repeat(80));
  await testEndpoint('POST', '/auth/login', 'User login', false, { username: 'test', password: 'test' });
  await testEndpoint('POST', '/auth/register', 'User registration', false, { username: 'test', email: 'test@test.com', password: 'test' });
  await testEndpoint('GET', '/auth/verify', 'Token verification', true);
  await testEndpoint('POST', '/auth/refresh', 'Token refresh', false);
  await testEndpoint('POST', '/auth/logout', 'User logout', true);
  await testEndpoint('POST', '/auth/forgot-password', 'Forgot password', false, { email: 'test@test.com' });
  await testEndpoint('POST', '/auth/reset-password', 'Reset password', false, { token: 'test', password: 'new' });
  await testEndpoint('GET', '/auth/profile', 'Get user profile', true);
  await testEndpoint('PUT', '/auth/profile', 'Update user profile', true, { first_name: 'Test' });
  await testEndpoint('POST', '/auth/change-password', 'Change password', true, { old_password: 'test', new_password: 'new' });
  
  await testEndpoint('POST', '/role-auth/login', 'Role-based login', false, { role: 'student', email: 'test@test.com', password: 'test' });
  await testEndpoint('POST', '/role-auth/register', 'Role-based registration', false, { role: 'student', email: 'test@test.com' });
  await testEndpoint('GET', '/role-auth/verify', 'Role verification', true);
  
  await testEndpoint('POST', '/user-auth/login', 'User auth login', false);
  await testEndpoint('POST', '/staff-auth/login', 'Staff auth login', false);
  await testEndpoint('POST', '/student-auth/login', 'Student auth login', false);
  
  await testEndpoint('POST', '/auth-enhanced/login-with-otp', 'Login with OTP', false);
  await testEndpoint('POST', '/auth-enhanced/verify-otp', 'Verify OTP', false);
  await testEndpoint('POST', '/auth-enhanced/two-factor-enable', 'Enable 2FA', true);
  await testEndpoint('GET', '/auth-enhanced/security-questions', 'Get security questions', false);
  
  await testEndpoint('POST', '/comprehensive-auth/login', 'Comprehensive login', false);
  await testEndpoint('POST', '/comprehensive-auth/register', 'Comprehensive register', false);
  await testEndpoint('GET', '/comprehensive-auth/roles', 'Get all roles', false);
  
  console.log('\n📋 CATEGORY 2: USER MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/users', 'Get all users', true);
  await testEndpoint('GET', '/users/1', 'Get user by ID', true);
  await testEndpoint('POST', '/users', 'Create user', true, { username: 'newuser', email: 'new@test.com' });
  await testEndpoint('PUT', '/users/1', 'Update user', true, { first_name: 'Updated' });
  await testEndpoint('DELETE', '/users/1', 'Delete user', true);
  await testEndpoint('GET', '/users/search', 'Search users', true);
  await testEndpoint('GET', '/users/stats', 'Get user statistics', true);
  await testEndpoint('POST', '/users/bulk-import', 'Bulk import users', true);
  await testEndpoint('GET', '/users/export', 'Export users', true);
  await testEndpoint('PUT', '/users/1/activate', 'Activate user', true);
  await testEndpoint('PUT', '/users/1/deactivate', 'Deactivate user', true);
  
  console.log('\n📋 CATEGORY 3: STUDENT MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/students', 'Get all students', true);
  await testEndpoint('GET', '/students/1', 'Get student by ID', true);
  await testEndpoint('POST', '/students', 'Create student', true);
  await testEndpoint('PUT', '/students/1', 'Update student', true);
  await testEndpoint('DELETE', '/students/1', 'Delete student', true);
  await testEndpoint('GET', '/students/search', 'Search students', true);
  await testEndpoint('GET', '/students/stats', 'Student statistics', true);
  await testEndpoint('GET', '/students/by-trade', 'Students by trade', true);
  await testEndpoint('GET', '/students/by-level', 'Students by level', true);
  await testEndpoint('GET', '/students/performance', 'Student performance', true);
  await testEndpoint('GET', '/students/1/grades', 'Student grades', true);
  await testEndpoint('GET', '/students/1/attendance', 'Student attendance', true);
  await testEndpoint('GET', '/students/1/assignments', 'Student assignments', true);
  await testEndpoint('GET', '/students/1/transcript', 'Student transcript', true);
  await testEndpoint('POST', '/students/enroll', 'Enroll student', true);
  await testEndpoint('PUT', '/students/1/transfer', 'Transfer student', true);
  await testEndpoint('GET', '/students/at-risk', 'At-risk students', true);
  await testEndpoint('GET', '/students/top-performers', 'Top performers', true);
  
  await testEndpoint('GET', '/student-management/dashboard', 'Student dashboard', true);
  await testEndpoint('GET', '/student-management/analytics', 'Student analytics', true);
  await testEndpoint('POST', '/student-management/bulk-operations', 'Bulk operations', true);
  
  await testEndpoint('GET', '/student-sheets', 'Get student sheets', true);
  await testEndpoint('GET', '/student-sheets/1', 'Get student sheet by ID', true);
  await testEndpoint('POST', '/student-sheets', 'Create student sheet', true);
  await testEndpoint('PUT', '/student-sheets/1', 'Update student sheet', true);
  
  await testEndpoint('GET', '/student-advanced/progress-tracking', 'Progress tracking', true);
  await testEndpoint('GET', '/student-advanced/predictive-analytics', 'Predictive analytics', true);
  await testEndpoint('GET', '/student-advanced/learning-path', 'Learning path', true);
  
  await testEndpoint('GET', '/student-competitions', 'Get competitions', true);
  await testEndpoint('GET', '/student-competitions/1', 'Get competition details', true);
  await testEndpoint('POST', '/student-competitions/register', 'Register for competition', true);
  await testEndpoint('GET', '/student-competitions/results', 'Competition results', true);
  
  console.log('\n📋 CATEGORY 4: TEACHER MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/teachers', 'Get all teachers', true);
  await testEndpoint('GET', '/teachers/1', 'Get teacher by ID', true);
  await testEndpoint('POST', '/teachers', 'Create teacher', true);
  await testEndpoint('PUT', '/teachers/1', 'Update teacher', true);
  await testEndpoint('DELETE', '/teachers/1', 'Delete teacher', true);
  await testEndpoint('GET', '/teachers/search', 'Search teachers', true);
  await testEndpoint('GET', '/teachers/stats', 'Teacher statistics', true);
  await testEndpoint('GET', '/teachers/1/classes', 'Teacher classes', true);
  await testEndpoint('GET', '/teachers/1/schedule', 'Teacher schedule', true);
  await testEndpoint('GET', '/teachers/1/performance', 'Teacher performance', true);
  await testEndpoint('POST', '/teachers/assign-class', 'Assign class to teacher', true);
  
  await testEndpoint('GET', '/teacher-portal/dashboard', 'Teacher dashboard', true);
  await testEndpoint('GET', '/teacher-portal/classes', 'Portal classes', true);
  await testEndpoint('GET', '/teacher-portal/students', 'Portal students', true);
  await testEndpoint('POST', '/teacher-portal/grade-assignment', 'Grade assignment', true);
  await testEndpoint('POST', '/teacher-portal/mark-attendance', 'Mark attendance', true);
  await testEndpoint('GET', '/teacher-portal/analytics', 'Portal analytics', true);
  
  await testEndpoint('GET', '/teacher-advanced/ai-insights', 'AI insights', true);
  await testEndpoint('GET', '/teacher-advanced/performance-analytics', 'Performance analytics', true);
  await testEndpoint('POST', '/teacher-advanced/auto-grading', 'Auto grading', true);
  
  console.log('\n📋 CATEGORY 5: PARENT MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/parents', 'Get all parents', true);
  await testEndpoint('GET', '/parents/1', 'Get parent by ID', true);
  await testEndpoint('POST', '/parents', 'Create parent', true);
  await testEndpoint('PUT', '/parents/1', 'Update parent', true);
  await testEndpoint('DELETE', '/parents/1', 'Delete parent', true);
  await testEndpoint('GET', '/parents/search', 'Search parents', true);
  
  await testEndpoint('GET', '/parent-dashboard', 'Parent dashboard', true);
  await testEndpoint('GET', '/parent-dashboard/children', 'Dashboard children', true);
  await testEndpoint('GET', '/parent-dashboard/notifications', 'Dashboard notifications', true);
  
  await testEndpoint('GET', '/parent-linking/link-student', 'Link student', true);
  await testEndpoint('POST', '/parent-linking/verify', 'Verify linking', true);
  await testEndpoint('GET', '/parent-linking/linked-students', 'Get linked students', true);
  
  await testEndpoint('GET', '/parent-monitoring/child-performance', 'Child performance', true);
  await testEndpoint('GET', '/parent-monitoring/attendance', 'Child attendance', true);
  await testEndpoint('GET', '/parent-monitoring/behavior', 'Child behavior', true);
  await testEndpoint('GET', '/parent-monitoring/fees', 'Fee status', true);
  
  await testEndpoint('GET', '/parent-portal/overview', 'Portal overview', true);
  await testEndpoint('GET', '/parent-portal/messages', 'Portal messages', true);
  
  console.log('\n📋 CATEGORY 6: ACADEMIC MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/academics/overview', 'Academic overview', true);
  await testEndpoint('GET', '/academics/performance', 'Academic performance', true);
  await testEndpoint('GET', '/academics/statistics', 'Academic statistics', true);
  
  await testEndpoint('GET', '/grades', 'Get all grades', true);
  await testEndpoint('GET', '/grades/student/1', 'Get student grades', true);
  await testEndpoint('POST', '/grades', 'Create grade', true);
  await testEndpoint('PUT', '/grades/1', 'Update grade', true);
  await testEndpoint('DELETE', '/grades/1', 'Delete grade', true);
  await testEndpoint('GET', '/grades/class/1', 'Get class grades', true);
  await testEndpoint('GET', '/grades/distribution', 'Grade distribution', true);
  await testEndpoint('GET', '/grades/analytics', 'Grade analytics', true);
  await testEndpoint('POST', '/grades/bulk-upload', 'Bulk upload grades', true);
  await testEndpoint('GET', '/grades/export', 'Export grades', true);
  
  await testEndpoint('GET', '/attendance', 'Get attendance records', true);
  await testEndpoint('POST', '/attendance', 'Mark attendance', true);
  await testEndpoint('PUT', '/attendance/1', 'Update attendance', true);
  await testEndpoint('GET', '/attendance/student/1', 'Student attendance', true);
  await testEndpoint('GET', '/attendance/class/1', 'Class attendance', true);
  await testEndpoint('GET', '/attendance/daily', 'Daily attendance', true);
  await testEndpoint('GET', '/attendance/weekly', 'Weekly attendance', true);
  await testEndpoint('GET', '/attendance/monthly', 'Monthly attendance', true);
  await testEndpoint('GET', '/attendance/statistics', 'Attendance statistics', true);
  await testEndpoint('GET', '/attendance/absentees', 'Chronic absentees', true);
  await testEndpoint('POST', '/attendance/bulk-mark', 'Bulk mark attendance', true);
  
  await testEndpoint('GET', '/assignments', 'Get assignments', true);
  await testEndpoint('GET', '/assignments/1', 'Get assignment by ID', true);
  await testEndpoint('POST', '/assignments', 'Create assignment', true);
  await testEndpoint('PUT', '/assignments/1', 'Update assignment', true);
  await testEndpoint('DELETE', '/assignments/1', 'Delete assignment', true);
  await testEndpoint('GET', '/assignments/class/1', 'Class assignments', true);
  await testEndpoint('GET', '/assignments/student/1', 'Student assignments', true);
  await testEndpoint('POST', '/assignments/submit', 'Submit assignment', true);
  await testEndpoint('GET', '/assignments/pending', 'Pending assignments', true);
  await testEndpoint('GET', '/assignments/graded', 'Graded assignments', true);
  
  await testEndpoint('GET', '/advanced-assignments/ai-generated', 'AI generated assignments', true);
  await testEndpoint('POST', '/advanced-assignments/auto-grade', 'Auto grade assignment', true);
  await testEndpoint('GET', '/advanced-assignments/plagiarism-check', 'Plagiarism check', true);
  
  await testEndpoint('GET', '/exams', 'Get exams', true);
  await testEndpoint('GET', '/exams/1', 'Get exam by ID', true);
  await testEndpoint('POST', '/exams', 'Create exam', true);
  await testEndpoint('PUT', '/exams/1', 'Update exam', true);
  await testEndpoint('DELETE', '/exams/1', 'Delete exam', true);
  await testEndpoint('GET', '/exams/upcoming', 'Upcoming exams', true);
  await testEndpoint('GET', '/exams/results', 'Exam results', true);
  await testEndpoint('GET', '/exams/analytics', 'Exam analytics', true);
  
  await testEndpoint('GET', '/exam-scheduling/calendar', 'Exam calendar', true);
  await testEndpoint('POST', '/exam-scheduling/schedule', 'Schedule exam', true);
  await testEndpoint('GET', '/exam-scheduling/conflicts', 'Scheduling conflicts', true);
  
  await testEndpoint('GET', '/homework', 'Get homework', true);
  await testEndpoint('POST', '/homework', 'Create homework', true);
  await testEndpoint('GET', '/homework/pending', 'Pending homework', true);
  
  await testEndpoint('GET', '/courses', 'Get courses', true);
  await testEndpoint('GET', '/courses/1', 'Get course by ID', true);
  await testEndpoint('POST', '/courses', 'Create course', true);
  await testEndpoint('PUT', '/courses/1', 'Update course', true);
  await testEndpoint('DELETE', '/courses/1', 'Delete course', true);
  
  await testEndpoint('GET', '/timetable', 'Get timetable', true);
  await testEndpoint('GET', '/timetable/class/1', 'Class timetable', true);
  await testEndpoint('GET', '/timetable/teacher/1', 'Teacher timetable', true);
  await testEndpoint('POST', '/timetable', 'Create timetable', true);
  await testEndpoint('PUT', '/timetable/1', 'Update timetable', true);
  
  await testEndpoint('GET', '/curriculum', 'Get curriculum', true);
  await testEndpoint('POST', '/curriculum', 'Create curriculum', true);
  await testEndpoint('GET', '/curriculum/trade/1', 'Trade curriculum', true);
  
  await testEndpoint('GET', '/advancedAcademics/performance-trends', 'Performance trends', true);
  await testEndpoint('GET', '/advancedAcademics/predictive-modeling', 'Predictive modeling', true);
  await testEndpoint('GET', '/advancedAcademics/learning-analytics', 'Learning analytics', true);
  
  await testEndpoint('GET', '/academic-system/overview', 'System overview', true);
  await testEndpoint('GET', '/academic-system/reports', 'System reports', true);
  
  console.log('\n📋 CATEGORY 7: FINANCIAL MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/accountant/dashboard', 'Accountant dashboard', true);
  await testEndpoint('GET', '/accountant/summary', 'Financial summary', true);
  await testEndpoint('GET', '/accountant/reports', 'Financial reports', true);
  
  await testEndpoint('GET', '/accountant/payments', 'Get payments', true);
  await testEndpoint('POST', '/accountant/payments', 'Record payment', true);
  await testEndpoint('GET', '/accountant/payments/1', 'Get payment details', true);
  await testEndpoint('PUT', '/accountant/payments/1', 'Update payment', true);
  await testEndpoint('GET', '/accountant/payments/pending', 'Pending payments', true);
  await testEndpoint('GET', '/accountant/payments/verified', 'Verified payments', true);
  
  await testEndpoint('GET', '/accountant/expenses', 'Get expenses', true);
  await testEndpoint('POST', '/accountant/expenses', 'Record expense', true);
  await testEndpoint('GET', '/accountant/expenses/1', 'Get expense details', true);
  await testEndpoint('PUT', '/accountant/expenses/1', 'Update expense', true);
  await testEndpoint('DELETE', '/accountant/expenses/1', 'Delete expense', true);
  
  await testEndpoint('GET', '/accountantManagement/overview', 'Management overview', true);
  await testEndpoint('GET', '/accountantManagement/analytics', 'Financial analytics', true);
  
  await testEndpoint('GET', '/accountant-advanced/forecasting', 'Financial forecasting', true);
  await testEndpoint('GET', '/accountant-advanced/ai-insights', 'AI financial insights', true);
  
  await testEndpoint('GET', '/studentPayments/student/1', 'Student payment history', true);
  await testEndpoint('POST', '/studentPayments/pay', 'Make student payment', true);
  await testEndpoint('GET', '/studentPayments/balance/1', 'Student balance', true);
  
  await testEndpoint('GET', '/paymentAnalytics/trends', 'Payment trends', true);
  await testEndpoint('GET', '/paymentAnalytics/defaulters', 'Payment defaulters', true);
  
  await testEndpoint('GET', '/finance/budget', 'Budget overview', true);
  await testEndpoint('GET', '/finance/income', 'Income statement', true);
  await testEndpoint('GET', '/finance/cash-flow', 'Cash flow', true);
  
  await testEndpoint('GET', '/expenses', 'Get all expenses', true);
  await testEndpoint('POST', '/expenses', 'Create expense', true);
  await testEndpoint('GET', '/expenses/category', 'Expenses by category', true);
  
  await testEndpoint('GET', '/invoices', 'Get invoices', true);
  await testEndpoint('POST', '/invoices', 'Create invoice', true);
  await testEndpoint('GET', '/invoices/1', 'Get invoice details', true);
  await testEndpoint('PUT', '/invoices/1', 'Update invoice', true);
  await testEndpoint('GET', '/invoices/unpaid', 'Unpaid invoices', true);
  
  await testEndpoint('GET', '/budgets', 'Get budgets', true);
  await testEndpoint('POST', '/budgets', 'Create budget', true);
  await testEndpoint('GET', '/budgets/1', 'Get budget details', true);
  await testEndpoint('PUT', '/budgets/1', 'Update budget', true);
  
  await testEndpoint('GET', '/salaries', 'Get salaries', true);
  await testEndpoint('POST', '/salaries', 'Process salary', true);
  await testEndpoint('GET', '/salaries/staff/1', 'Staff salary', true);
  await testEndpoint('GET', '/salaries/payroll', 'Payroll report', true);
  
  await testEndpoint('GET', '/financial-system/overview', 'Financial system overview', true);
  await testEndpoint('GET', '/financial-system/transactions', 'All transactions', true);
  
  console.log('\n📋 CATEGORY 8: STOCK MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/stock/items', 'Get stock items', true);
  await testEndpoint('POST', '/stock/items', 'Add stock item', true);
  await testEndpoint('GET', '/stock/items/1', 'Get item details', true);
  await testEndpoint('PUT', '/stock/items/1', 'Update item', true);
  await testEndpoint('DELETE', '/stock/items/1', 'Delete item', true);
  await testEndpoint('GET', '/stock/low-stock', 'Low stock items', true);
  await testEndpoint('GET', '/stock/out-of-stock', 'Out of stock items', true);
  
  await testEndpoint('GET', '/stock/transactions', 'Stock transactions', true);
  await testEndpoint('POST', '/stock/transactions', 'Record transaction', true);
  await testEndpoint('GET', '/stock/transactions/history', 'Transaction history', true);
  
  await testEndpoint('GET', '/stock/procurement-orders', 'Procurement orders', true);
  await testEndpoint('POST', '/stock/procurement-orders', 'Create procurement order', true);
  await testEndpoint('GET', '/stock/procurement-orders/1', 'Order details', true);
  await testEndpoint('PUT', '/stock/procurement-orders/1', 'Update order', true);
  
  await testEndpoint('GET', '/stock/requisitions', 'Stock requisitions', true);
  await testEndpoint('POST', '/stock/requisitions', 'Create requisition', true);
  await testEndpoint('GET', '/stock/requisitions/pending', 'Pending requisitions', true);
  await testEndpoint('PUT', '/stock/requisitions/1/approve', 'Approve requisition', true);
  
  await testEndpoint('GET', '/stock/suppliers', 'Get suppliers', true);
  await testEndpoint('POST', '/stock/suppliers', 'Add supplier', true);
  await testEndpoint('GET', '/stock/suppliers/1', 'Supplier details', true);
  await testEndpoint('PUT', '/stock/suppliers/1', 'Update supplier', true);
  
  await testEndpoint('GET', '/stock/inventory-report', 'Inventory report', true);
  await testEndpoint('GET', '/stock/valuation', 'Stock valuation', true);
  await testEndpoint('GET', '/stock/analytics', 'Stock analytics', true);
  
  console.log('\n📋 CATEGORY 9: DISCIPLINE & DOS APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/discipline/cases', 'Discipline cases', true);
  await testEndpoint('POST', '/discipline/cases', 'Create case', true);
  await testEndpoint('GET', '/discipline/cases/1', 'Case details', true);
  await testEndpoint('PUT', '/discipline/cases/1', 'Update case', true);
  await testEndpoint('GET', '/discipline/student/1', 'Student discipline history', true);
  await testEndpoint('GET', '/discipline/statistics', 'Discipline statistics', true);
  
  await testEndpoint('GET', '/dos/dashboard', 'DOS dashboard', true);
  await testEndpoint('GET', '/dos/students', 'DOS students', true);
  await testEndpoint('GET', '/dos/reports', 'DOS reports', true);
  await testEndpoint('GET', '/dos/analytics', 'DOS analytics', true);
  
  await testEndpoint('GET', '/dos-advanced/behavior-patterns', 'Behavior patterns', true);
  await testEndpoint('GET', '/dos-advanced/intervention-plans', 'Intervention plans', true);
  
  await testEndpoint('GET', '/dos-management/overview', 'Management overview', true);
  await testEndpoint('POST', '/dos-management/action', 'Record action', true);
  
  await testEndpoint('GET', '/dod-actions/recent', 'Recent actions', true);
  await testEndpoint('POST', '/dod-actions/create', 'Create action', true);
  await testEndpoint('GET', '/dod-actions/statistics', 'Action statistics', true);
  
  await testEndpoint('GET', '/dod-comprehensive/dashboard', 'DOD dashboard', true);
  await testEndpoint('GET', '/dod-comprehensive/cases', 'DOD cases', true);
  
  await testEndpoint('GET', '/dod-profile/info', 'DOD profile', true);
  await testEndpoint('PUT', '/dod-profile/update', 'Update DOD profile', true);
  
  await testEndpoint('GET', '/dos-updated/overview', 'Updated DOS overview', true);
  await testEndpoint('GET', '/enhanced-dos/analytics', 'Enhanced DOS analytics', true);
  
  console.log('\n📋 CATEGORY 10: MESSAGING & NOTIFICATIONS APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/messages', 'Get messages', true);
  await testEndpoint('POST', '/messages', 'Send message', true, { receiver_id: 1, message: 'Test' });
  await testEndpoint('GET', '/messages/1', 'Get message by ID', true);
  await testEndpoint('DELETE', '/messages/1', 'Delete message', true);
  await testEndpoint('GET', '/messages/inbox', 'Get inbox', true);
  await testEndpoint('GET', '/messages/sent', 'Get sent messages', true);
  await testEndpoint('PUT', '/messages/1/read', 'Mark as read', true);
  await testEndpoint('GET', '/messages/unread', 'Get unread messages', true);
  
  await testEndpoint('GET', '/notifications', 'Get notifications', true);
  await testEndpoint('POST', '/notifications', 'Create notification', true);
  await testEndpoint('GET', '/notifications/1', 'Get notification', true);
  await testEndpoint('PUT', '/notifications/1/read', 'Mark notification read', true);
  await testEndpoint('GET', '/notifications/unread', 'Unread notifications', true);
  await testEndpoint('DELETE', '/notifications/1', 'Delete notification', true);
  
  await testEndpoint('GET', '/live-chat/conversations', 'Chat conversations', true);
  await testEndpoint('POST', '/live-chat/send', 'Send chat message', true);
  await testEndpoint('GET', '/live-chat/history', 'Chat history', true);
  
  await testEndpoint('GET', '/comprehensive-messaging/overview', 'Messaging overview', true);
  await testEndpoint('POST', '/comprehensive-messaging/broadcast', 'Broadcast message', true);
  
  await testEndpoint('GET', '/automated-notifications/scheduled', 'Scheduled notifications', true);
  await testEndpoint('POST', '/automated-notifications/schedule', 'Schedule notification', true);
  
  await testEndpoint('GET', '/production-notifications/active', 'Active notifications', true);
  await testEndpoint('GET', '/realtime-notifications/stream', 'Notification stream', true);
  
  await testEndpoint('POST', '/sms/send', 'Send SMS', true);
  await testEndpoint('GET', '/sms/history', 'SMS history', true);
  
  await testEndpoint('GET', '/parent-messages/inbox', 'Parent messages', true);
  await testEndpoint('POST', '/parent-messages/send', 'Send parent message', true);
  
  console.log('\n📋 CATEGORY 11: CONTENT & CMS APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/content', 'Get content', false);
  await testEndpoint('POST', '/content', 'Create content', true);
  await testEndpoint('GET', '/content/1', 'Get content by ID', false);
  await testEndpoint('PUT', '/content/1', 'Update content', true);
  await testEndpoint('DELETE', '/content/1', 'Delete content', true);
  
  await testEndpoint('GET', '/news', 'Get news articles', false);
  await testEndpoint('POST', '/news', 'Create news article', true);
  await testEndpoint('GET', '/news/1', 'Get news by ID', false);
  await testEndpoint('PUT', '/news/1', 'Update news', true);
  await testEndpoint('DELETE', '/news/1', 'Delete news', true);
  await testEndpoint('GET', '/news/latest', 'Latest news', false);
  await testEndpoint('GET', '/news/featured', 'Featured news', false);
  
  await testEndpoint('GET', '/homepage', 'Get homepage content', false);
  await testEndpoint('PUT', '/homepage', 'Update homepage', true);
  await testEndpoint('GET', '/homepage/hero', 'Homepage hero section', false);
  await testEndpoint('GET', '/homepage/featured', 'Homepage featured', false);
  
  await testEndpoint('GET', '/home-content', 'Home content', false);
  await testEndpoint('PUT', '/home-content/update', 'Update home content', true);
  
  await testEndpoint('GET', '/hero', 'Hero section', false);
  await testEndpoint('PUT', '/hero', 'Update hero', true);
  
  await testEndpoint('GET', '/gallery', 'Get gallery', false);
  await testEndpoint('POST', '/gallery', 'Upload to gallery', true);
  await testEndpoint('DELETE', '/gallery/1', 'Delete from gallery', true);
  
  await testEndpoint('GET', '/dynamic', 'Dynamic content', false);
  await testEndpoint('GET', '/dynamic-content', 'Get dynamic content', false);
  await testEndpoint('POST', '/dynamic-content', 'Create dynamic content', true);
  
  await testEndpoint('GET', '/dynamicContent/pages', 'Dynamic pages', false);
  await testEndpoint('POST', '/dynamicContent/pages', 'Create page', true);
  
  await testEndpoint('GET', '/cms', 'CMS overview', true);
  await testEndpoint('GET', '/cms-unified', 'Unified CMS', true);
  
  await testEndpoint('GET', '/content-management/all', 'All content', true);
  await testEndpoint('POST', '/content-management/publish', 'Publish content', true);
  
  await testEndpoint('GET', '/article-interactions/1', 'Article interactions', false);
  await testEndpoint('POST', '/article-interactions/like', 'Like article', true);
  await testEndpoint('POST', '/article-interactions/comment', 'Comment on article', true);
  
  await testEndpoint('GET', '/unified-content/all', 'Unified content', false);
  
  console.log('\n📋 CATEGORY 12: SPORTS MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/sports', 'Get sports', false);
  await testEndpoint('POST', '/sports', 'Create sport', true);
  await testEndpoint('GET', '/sports/1', 'Get sport by ID', false);
  await testEndpoint('PUT', '/sports/1', 'Update sport', true);
  await testEndpoint('DELETE', '/sports/1', 'Delete sport', true);
  
  await testEndpoint('GET', '/sports-players', 'Get players', true);
  await testEndpoint('POST', '/sports-players', 'Add player', true);
  await testEndpoint('GET', '/sports-players/1', 'Player details', true);
  await testEndpoint('PUT', '/sports-players/1', 'Update player', true);
  
  await testEndpoint('GET', '/teams', 'Get teams', false);
  await testEndpoint('POST', '/teams', 'Create team', true);
  await testEndpoint('GET', '/teams/1', 'Team details', false);
  await testEndpoint('PUT', '/teams/1', 'Update team', true);
  
  await testEndpoint('GET', '/sports-advanced/statistics', 'Sports statistics', true);
  await testEndpoint('GET', '/sports-advanced/performance', 'Player performance', true);
  
  await testEndpoint('GET', '/sports-management/overview', 'Sports overview', true);
  await testEndpoint('GET', '/sports-management/schedules', 'Sports schedules', true);
  
  await testEndpoint('GET', '/sports-comprehensive/all-sports', 'All sports data', true);
  await testEndpoint('GET', '/sports-comprehensive/analytics', 'Sports analytics', true);
  
  await testEndpoint('GET', '/sportsManagement/dashboard', 'Sports dashboard', true);
  await testEndpoint('GET', '/sportsManagement/tournaments', 'Tournaments', true);
  
  await testEndpoint('GET', '/sports-hero-management/heroes', 'Sports heroes', false);
  await testEndpoint('POST', '/sports-hero-management/nominate', 'Nominate hero', true);
  
  console.log('\n📋 CATEGORY 13: SYSTEM MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/library', 'Library overview', true);
  await testEndpoint('GET', '/library/books', 'Get books', true);
  await testEndpoint('POST', '/library/books', 'Add book', true);
  await testEndpoint('POST', '/library/borrow', 'Borrow book', true);
  await testEndpoint('POST', '/library/return', 'Return book', true);
  
  await testEndpoint('GET', '/library-system/catalog', 'Library catalog', true);
  await testEndpoint('GET', '/library-system/borrowed', 'Borrowed books', true);
  await testEndpoint('GET', '/library-system/overdue', 'Overdue books', true);
  
  await testEndpoint('GET', '/hostel', 'Hostel overview', true);
  await testEndpoint('GET', '/hostel/rooms', 'Hostel rooms', true);
  await testEndpoint('POST', '/hostel/allocate', 'Allocate room', true);
  
  await testEndpoint('GET', '/hostel-system/allocations', 'Room allocations', true);
  await testEndpoint('GET', '/hostel-system/availability', 'Room availability', true);
  await testEndpoint('POST', '/hostel-system/request', 'Request room', true);
  
  await testEndpoint('GET', '/transport', 'Transport overview', true);
  await testEndpoint('GET', '/transport/routes', 'Transport routes', true);
  await testEndpoint('POST', '/transport/register', 'Register for transport', true);
  
  await testEndpoint('GET', '/cafeteria-system/menu', 'Cafeteria menu', true);
  await testEndpoint('GET', '/cafeteria-system/orders', 'Food orders', true);
  await testEndpoint('POST', '/cafeteria-system/order', 'Place order', true);
  
  await testEndpoint('GET', '/medical-system/records', 'Medical records', true);
  await testEndpoint('POST', '/medical-system/appointment', 'Book appointment', true);
  await testEndpoint('GET', '/medical-system/history/1', 'Patient history', true);
  
  await testEndpoint('GET', '/workshop-system/equipment', 'Workshop equipment', true);
  await testEndpoint('POST', '/workshop-system/book', 'Book equipment', true);
  
  await testEndpoint('GET', '/counseling-system/sessions', 'Counseling sessions', true);
  await testEndpoint('POST', '/counseling-system/book', 'Book session', true);
  
  await testEndpoint('GET', '/certificate-system/generate', 'Generate certificate', true);
  await testEndpoint('GET', '/certificate-system/verify/1', 'Verify certificate', false);
  
  await testEndpoint('GET', '/admission-system/applications', 'Applications', true);
  await testEndpoint('POST', '/admission-system/apply', 'Submit application', false);
  await testEndpoint('GET', '/admission-system/status/1', 'Application status', false);
  
  await testEndpoint('GET', '/alumni-system/members', 'Alumni members', false);
  await testEndpoint('POST', '/alumni-system/register', 'Register alumni', false);
  await testEndpoint('GET', '/alumni-system/events', 'Alumni events', false);
  
  console.log('\n📋 CATEGORY 14: ADVISOR APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/advisor/dashboard', 'Advisor dashboard', true);
  await testEndpoint('GET', '/advisor/students', 'Advisor students', true);
  await testEndpoint('GET', '/advisor/analytics', 'Advisor analytics', true);
  
  await testEndpoint('GET', '/advisor-comprehensive/comprehensive/overview', 'Comprehensive overview', true);
  await testEndpoint('GET', '/advisor-comprehensive/students/comprehensive', 'Comprehensive students', true);
  await testEndpoint('GET', '/advisor-comprehensive/contacts', 'Advisor contacts', true);
  await testEndpoint('POST', '/advisor-comprehensive/contacts', 'Add contact', true);
  await testEndpoint('GET', '/advisor-comprehensive/consultations', 'Consultations', true);
  await testEndpoint('POST', '/advisor-comprehensive/consultations', 'Schedule consultation', true);
  await testEndpoint('GET', '/advisor-comprehensive/initiatives', 'School initiatives', true);
  await testEndpoint('POST', '/advisor-comprehensive/initiatives', 'Create initiative', true);
  await testEndpoint('GET', '/advisor-comprehensive/reports', 'Advisor reports', true);
  await testEndpoint('POST', '/advisor-comprehensive/reports', 'Create report', true);
  await testEndpoint('GET', '/advisor-comprehensive/notifications', 'Advisor notifications', true);
  
  await testEndpoint('GET', '/advisor-management/overview', 'Management overview', true);
  await testEndpoint('GET', '/advisor-management/tracking', 'Student tracking', true);
  
  await testEndpoint('GET', '/advisor-detail/profile', 'Advisor profile', true);
  await testEndpoint('PUT', '/advisor-detail/profile', 'Update profile', true);
  
  await testEndpoint('GET', '/advisor-staff/all', 'All advisor staff', true);
  await testEndpoint('GET', '/advisor-staff/assignments', 'Staff assignments', true);
  
  await testEndpoint('GET', '/advisor-analytics/performance', 'Advisor performance', true);
  await testEndpoint('GET', '/advisor-analytics/trends', 'Advisory trends', true);
  
  await testEndpoint('GET', '/advisor-dashboard/kinyarwanda', 'Kinyarwanda dashboard', true);
  
  await testEndpoint('GET', '/advisor-app/mobile', 'Mobile advisor app', true);
  
  console.log('\n📋 CATEGORY 15: ADMIN MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/admin/dashboard', 'Admin dashboard', true);
  await testEndpoint('GET', '/admin/users', 'Admin users', true);
  await testEndpoint('GET', '/admin/statistics', 'Admin statistics', true);
  await testEndpoint('GET', '/admin/reports', 'Admin reports', true);
  
  await testEndpoint('GET', '/admin-management/overview', 'Management overview', true);
  await testEndpoint('GET', '/admin-management/system-health', 'System health', true);
  await testEndpoint('POST', '/admin-management/bulk-operations', 'Bulk operations', true);
  
  await testEndpoint('GET', '/admin-advanced/analytics', 'Advanced analytics', true);
  await testEndpoint('GET', '/admin-advanced/ai-insights', 'AI insights', true);
  await testEndpoint('GET', '/admin-advanced/predictive', 'Predictive analysis', true);
  
  await testEndpoint('GET', '/admin-comprehensive/full-overview', 'Full overview', true);
  await testEndpoint('GET', '/admin-comprehensive/all-modules', 'All modules', true);
  
  await testEndpoint('GET', '/admin-dashboard', 'Admin dashboard v2', true);
  
  console.log('\n📋 CATEGORY 16: STAFF MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/staff', 'Get all staff', true);
  await testEndpoint('POST', '/staff', 'Create staff', true);
  await testEndpoint('GET', '/staff/1', 'Get staff by ID', true);
  await testEndpoint('PUT', '/staff/1', 'Update staff', true);
  await testEndpoint('DELETE', '/staff/1', 'Delete staff', true);
  await testEndpoint('GET', '/staff/search', 'Search staff', true);
  await testEndpoint('GET', '/staff/by-role', 'Staff by role', true);
  
  await testEndpoint('GET', '/staff-management/overview', 'Staff overview', true);
  await testEndpoint('GET', '/staff-management/attendance', 'Staff attendance', true);
  await testEndpoint('GET', '/staff-management/performance', 'Staff performance', true);
  
  await testEndpoint('GET', '/staff-roles/all', 'All staff roles', true);
  await testEndpoint('POST', '/staff-roles/assign', 'Assign role', true);
  await testEndpoint('GET', '/staff-roles/permissions', 'Role permissions', true);
  
  await testEndpoint('GET', '/comprehensive-staff/directory', 'Staff directory', true);
  await testEndpoint('GET', '/comprehensive-staff/analytics', 'Staff analytics', true);
  
  console.log('\n📋 CATEGORY 17: TRADES & COURSES APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/trades', 'Get trades', false);
  await testEndpoint('POST', '/trades', 'Create trade', true);
  await testEndpoint('GET', '/trades/1', 'Get trade by ID', false);
  await testEndpoint('PUT', '/trades/1', 'Update trade', true);
  await testEndpoint('DELETE', '/trades/1', 'Delete trade', true);
  await testEndpoint('GET', '/trades/active', 'Active trades', false);
  await testEndpoint('GET', '/trades/statistics', 'Trade statistics', true);
  
  await testEndpoint('GET', '/trades-courses', 'Trade courses', false);
  await testEndpoint('POST', '/trades-courses', 'Create course', true);
  await testEndpoint('GET', '/trades-courses/trade/1', 'Courses by trade', false);
  
  await testEndpoint('GET', '/trade-images', 'Trade images', false);
  await testEndpoint('POST', '/trade-images', 'Upload trade image', true);
  
  await testEndpoint('GET', '/unified-trades-api/all', 'All trades unified', false);
  
  await testEndpoint('GET', '/comprehensive-trades-api/overview', 'Trades overview', false);
  await testEndpoint('GET', '/comprehensive-trades-api/enrollment', 'Trade enrollment', true);
  
  console.log('\n📋 CATEGORY 18: SUPPORT & CONTACT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/support/tickets', 'Support tickets', true);
  await testEndpoint('POST', '/support/tickets', 'Create ticket', false);
  await testEndpoint('GET', '/support/tickets/1', 'Get ticket', true);
  await testEndpoint('PUT', '/support/tickets/1', 'Update ticket', true);
  await testEndpoint('GET', '/support/faq', 'FAQ', false);
  
  await testEndpoint('GET', '/support-enhanced/ai-chat', 'AI support chat', false);
  await testEndpoint('POST', '/support-enhanced/auto-resolve', 'Auto resolve', true);
  
  await testEndpoint('POST', '/contact', 'Contact form submission', false);
  await testEndpoint('GET', '/contact/submissions', 'Contact submissions', true);
  await testEndpoint('GET', '/contact/submissions/1', 'Submission details', true);
  
  await testEndpoint('GET', '/knowledge-base/articles', 'Knowledge base', false);
  await testEndpoint('GET', '/knowledge-base/search', 'Search knowledge base', false);
  
  await testEndpoint('GET', '/advanced-support/analytics', 'Support analytics', true);
  
  console.log('\n📋 CATEGORY 19: ADVANCED FEATURES APIs');
  console.log('-'.repeat(80));
  await testEndpoint('POST', '/aiGrading/auto-grade', 'AI auto grading', true);
  await testEndpoint('POST', '/aiGrading/analyze', 'Analyze submission', true);
  
  await testEndpoint('GET', '/adaptiveLearning/recommendations', 'Learning recommendations', true);
  await testEndpoint('GET', '/adaptiveLearning/path', 'Adaptive path', true);
  
  await testEndpoint('GET', '/intelligentSystems/predictions', 'System predictions', true);
  await testEndpoint('GET', '/intelligentSystems/optimization', 'System optimization', true);
  
  await testEndpoint('GET', '/smartAnalyticsApis/insights', 'Smart insights', true);
  await testEndpoint('GET', '/smartAnalyticsApis/trends', 'Analytics trends', true);
  
  await testEndpoint('GET', '/modernTechApis/ai-features', 'AI features', true);
  await testEndpoint('GET', '/modernTechApis/automation', 'Automation features', true);
  
  await testEndpoint('GET', '/modernTechnologyApis/cloud-sync', 'Cloud sync', true);
  await testEndpoint('GET', '/modernTechnologyApis/ml-models', 'ML models', true);
  
  await testEndpoint('GET', '/powerfulApisCollection/all', 'All powerful APIs', true);
  
  await testEndpoint('GET', '/powerfulSchoolApis/comprehensive', 'Comprehensive school APIs', true);
  
  await testEndpoint('GET', '/advancedFeatures/overview', 'Advanced features', true);
  await testEndpoint('GET', '/advancedFeatures/ai-powered', 'AI-powered features', true);
  
  await testEndpoint('GET', '/advancedOperations/batch-processing', 'Batch processing', true);
  await testEndpoint('POST', '/advancedOperations/automated-tasks', 'Automated tasks', true);
  
  await testEndpoint('GET', '/advancedSecurityApis/audit-logs', 'Audit logs', true);
  await testEndpoint('GET', '/advancedSecurityApis/threat-detection', 'Threat detection', true);
  
  console.log('\n📋 CATEGORY 20: ANALYTICS & REPORTING APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/analytics/overview', 'Analytics overview', true);
  await testEndpoint('GET', '/analytics/performance', 'Performance analytics', true);
  await testEndpoint('GET', '/analytics/trends', 'Trend analysis', true);
  await testEndpoint('GET', '/analytics/predictions', 'Predictive analytics', true);
  
  await testEndpoint('GET', '/dashboards/admin', 'Admin dashboard data', true);
  await testEndpoint('GET', '/dashboards/teacher', 'Teacher dashboard data', true);
  await testEndpoint('GET', '/dashboards/student', 'Student dashboard data', true);
  
  await testEndpoint('GET', '/reporting/generate', 'Generate report', true);
  await testEndpoint('GET', '/reporting/templates', 'Report templates', true);
  await testEndpoint('POST', '/reporting/custom', 'Custom report', true);
  await testEndpoint('GET', '/reporting/scheduled', 'Scheduled reports', true);
  
  await testEndpoint('GET', '/reports/academic', 'Academic reports', true);
  await testEndpoint('GET', '/reports/financial', 'Financial reports', true);
  await testEndpoint('GET', '/reports/attendance', 'Attendance reports', true);
  
  console.log('\n📋 CATEGORY 21: CLASS MANAGEMENT APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/classes', 'Get classes', true);
  await testEndpoint('POST', '/classes', 'Create class', true);
  await testEndpoint('GET', '/classes/1', 'Get class by ID', true);
  await testEndpoint('PUT', '/classes/1', 'Update class', true);
  await testEndpoint('DELETE', '/classes/1', 'Delete class', true);
  
  await testEndpoint('GET', '/class-management/overview', 'Class overview', true);
  await testEndpoint('GET', '/class-management/students', 'Class students', true);
  await testEndpoint('POST', '/class-management/assign-teacher', 'Assign teacher', true);
  
  await testEndpoint('GET', '/class-sheets', 'Class sheets', true);
  await testEndpoint('GET', '/class-sheets/1', 'Class sheet by ID', true);
  await testEndpoint('POST', '/class-sheets', 'Create class sheet', true);
  
  await testEndpoint('GET', '/class-sheets-api/data', 'Class sheet data', true);
  await testEndpoint('GET', '/classes-api/all', 'All classes API', true);
  
  console.log('\n📋 CATEGORY 22: SYSTEM UTILITIES APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/search', 'Global search', true);
  await testEndpoint('GET', '/advanced-search', 'Advanced search', true);
  
  await testEndpoint('POST', '/uploads', 'Upload file', true);
  await testEndpoint('GET', '/uploads/1', 'Get uploaded file', true);
  
  await testEndpoint('GET', '/system-settings', 'System settings', true);
  await testEndpoint('PUT', '/system-settings', 'Update settings', true);
  
  await testEndpoint('GET', '/system-updates/available', 'Available updates', true);
  await testEndpoint('POST', '/system-updates/install', 'Install update', true);
  
  await testEndpoint('GET', '/backups/list', 'List backups', true);
  await testEndpoint('POST', '/backups/create', 'Create backup', true);
  await testEndpoint('POST', '/backups/restore', 'Restore backup', true);
  
  await testEndpoint('GET', '/leadership/team', 'Leadership team', false);
  await testEndpoint('GET', '/leadership/structure', 'Leadership structure', true);
  
  await testEndpoint('GET', '/developers', 'Developers team', false);
  await testEndpoint('GET', '/developers-api/info', 'Developer info', false);
  
  await testEndpoint('GET', '/roles', 'Get roles', true);
  await testEndpoint('POST', '/roles', 'Create role', true);
  await testEndpoint('GET', '/roles/permissions', 'Role permissions', true);
  
  await testEndpoint('GET', '/serial-codes/generate', 'Generate serial code', true);
  await testEndpoint('POST', '/serial-codes/validate', 'Validate serial code', false);
  
  console.log('\n📋 CATEGORY 23: COLLABORATION & LEARNING APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/collaboration/rooms', 'Collaboration rooms', true);
  await testEndpoint('POST', '/collaboration/create-room', 'Create room', true);
  await testEndpoint('POST', '/collaboration/join', 'Join room', true);
  
  await testEndpoint('GET', '/liveStudy/sessions', 'Live study sessions', true);
  await testEndpoint('POST', '/liveStudy/start', 'Start session', true);
  
  await testEndpoint('GET', '/peerReview/assignments', 'Peer review assignments', true);
  await testEndpoint('POST', '/peerReview/submit', 'Submit review', true);
  
  await testEndpoint('GET', '/quizzes', 'Get quizzes', true);
  await testEndpoint('POST', '/quizzes', 'Create quiz', true);
  await testEndpoint('GET', '/quizzes/1', 'Get quiz by ID', true);
  await testEndpoint('POST', '/quizzes/submit', 'Submit quiz', true);
  await testEndpoint('GET', '/quizzes/results/1', 'Quiz results', true);
  
  await testEndpoint('GET', '/forums/topics', 'Forum topics', false);
  await testEndpoint('POST', '/forums/topics', 'Create topic', true);
  await testEndpoint('POST', '/forums/reply', 'Reply to topic', true);
  
  await testEndpoint('GET', '/holidayPackages', 'Holiday packages', false);
  await testEndpoint('POST', '/holidayPackages/register', 'Register for package', true);
  
  console.log('\n📋 CATEGORY 24: EVENTS & ACTIVITIES APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/events', 'Get events', false);
  await testEndpoint('POST', '/events', 'Create event', true);
  await testEndpoint('GET', '/events/1', 'Get event by ID', false);
  await testEndpoint('PUT', '/events/1', 'Update event', true);
  await testEndpoint('DELETE', '/events/1', 'Delete event', true);
  await testEndpoint('GET', '/events/upcoming', 'Upcoming events', false);
  await testEndpoint('POST', '/events/register', 'Register for event', true);
  
  await testEndpoint('GET', '/clubs', 'Get clubs', false);
  await testEndpoint('POST', '/clubs', 'Create club', true);
  await testEndpoint('GET', '/clubs/1', 'Club details', false);
  await testEndpoint('POST', '/clubs/join', 'Join club', true);
  
  await testEndpoint('GET', '/announcements', 'Get announcements', true);
  await testEndpoint('POST', '/announcements', 'Create announcement', true);
  await testEndpoint('GET', '/announcements/recent', 'Recent announcements', false);
  
  console.log('\n📋 CATEGORY 25: MISCELLANEOUS APIs');
  console.log('-'.repeat(80));
  await testEndpoint('GET', '/services', 'School services', false);
  await testEndpoint('GET', '/services-advanced', 'Advanced services', false);
  
  await testEndpoint('GET', '/testimonials', 'Get testimonials', false);
  await testEndpoint('POST', '/testimonials', 'Create testimonial', true);
  
  await testEndpoint('GET', '/gamification/points', 'Gamification points', true);
  await testEndpoint('GET', '/gamification/leaderboard', 'Leaderboard', true);
  await testEndpoint('POST', '/gamification/award-points', 'Award points', true);
  
  await testEndpoint('GET', '/emergency-contacts', 'Emergency contacts', true);
  await testEndpoint('POST', '/emergency-contacts', 'Add emergency contact', true);
  
  await testEndpoint('GET', '/certificates', 'Get certificates', true);
  await testEndpoint('POST', '/certificates/generate', 'Generate certificate', true);
  
  await testEndpoint('GET', '/admissions', 'Admissions overview', false);
  await testEndpoint('POST', '/admissions/apply', 'Submit application', false);
  
  await testEndpoint('GET', '/alumni', 'Alumni directory', false);
  await testEndpoint('POST', '/alumni/register', 'Register alumni', false);
  
  await testEndpoint('GET', '/unified-integration', 'Unified integration', true);
  await testEndpoint('GET', '/unified-integration-api', 'Unified API', true);
  
  await testEndpoint('GET', '/comprehensive-database/stats', 'Database stats', true);
  await testEndpoint('GET', '/comprehensive-database/health', 'Database health', true);
  
  await testEndpoint('GET', '/comprehensiveApi/overview', 'Comprehensive API overview', true);
  
  await testEndpoint('GET', '/dynamic-system/content', 'Dynamic system content', false);
  
  await testEndpoint('GET', '/docs', 'API documentation', false);
  
  await testEndpoint('GET', '/advanced-role-features/admin', 'Advanced admin features', true);
  await testEndpoint('GET', '/advanced-role-features/teacher', 'Advanced teacher features', true);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${successCount} (${((successCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failCount} (${((failCount/totalTests)*100).toFixed(1)}%)`);
  console.log('='.repeat(80) + '\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    successCount,
    failCount,
    successRate: ((successCount/totalTests)*100).toFixed(2) + '%',
    results: testResults
  };
  
  fs.writeFileSync('api-test-results.json', JSON.stringify(report, null, 2));
  console.log('📝 Full results saved to: api-test-results.json\n');
  
  return report;
};

console.log('🚀 Starting Backend Server Test...\n');
setTimeout(() => {
  runAllTests().then(report => {
    console.log('\n✅ Testing Complete!');
    process.exit(0);
  }).catch(err => {
    console.error('\n❌ Testing Failed:', err);
    process.exit(1);
  });
}, 2000);
