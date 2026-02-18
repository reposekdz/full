const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Test credentials (update with actual test users)
const testUsers = {
  student: { username: 'student1', password: 'password123' },
  teacher: { username: 'teacher1', password: 'password123' },
  parent: { username: 'parent1', password: 'password123' },
  dos: { username: 'dos1', password: 'password123' },
  dod: { username: 'dod1', password: 'password123' },
  headmaster: { username: 'headmaster', password: 'password123' },
  accountant: { username: 'accountant1', password: 'password123' },
  admin: { username: 'admin', password: 'password123' }
};

async function login(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error(`${colors.red}✗ Login failed for ${username}${colors.reset}`);
    return null;
  }
}

async function testEndpoint(name, method, url, token, data = null) {
  testResults.total++;
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.data.success) {
      console.log(`${colors.green}✓${colors.reset} ${name}`);
      testResults.passed++;
      return true;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${name} - ${response.data.message}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name} - ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function runTests() {
  console.log(`\n${colors.blue}========================================`);
  console.log('  TESTING ENHANCED DASHBOARD APIS');
  console.log(`========================================${colors.reset}\n`);

  // Test Universal Dashboard API
  console.log(`${colors.blue}[1] Testing Universal Dashboard API${colors.reset}`);
  
  for (const [role, credentials] of Object.entries(testUsers)) {
    const token = await login(credentials.username, credentials.password);
    if (token) {
      await testEndpoint(
        `Universal Stats - ${role}`,
        'GET',
        '/api/dashboard-enhanced/universal/stats',
        token
      );
      
      await testEndpoint(
        `Notifications - ${role}`,
        'GET',
        '/api/dashboard-enhanced/universal/notifications',
        token
      );
      
      await testEndpoint(
        `Activities - ${role}`,
        'GET',
        '/api/dashboard-enhanced/universal/activities',
        token
      );
      
      await testEndpoint(
        `Quick Actions - ${role}`,
        'GET',
        '/api/dashboard-enhanced/universal/quick-actions',
        token
      );
    }
  }

  // Test Student Dashboard
  console.log(`\n${colors.blue}[2] Testing Student Dashboard API${colors.reset}`);
  const studentToken = await login(testUsers.student.username, testUsers.student.password);
  
  if (studentToken) {
    await testEndpoint('Student Dashboard', 'GET', '/api/student-enhanced/dashboard', studentToken);
    await testEndpoint('Student Marks', 'GET', '/api/student-enhanced/marks', studentToken);
    await testEndpoint('Student Attendance', 'GET', '/api/student-enhanced/attendance', studentToken);
    await testEndpoint('Student Timetable', 'GET', '/api/student-enhanced/timetable', studentToken);
    await testEndpoint('Student Exams', 'GET', '/api/student-enhanced/exams', studentToken);
    await testEndpoint('Student Conduct', 'GET', '/api/student-enhanced/conduct', studentToken);
    await testEndpoint('Student Report Cards', 'GET', '/api/student-enhanced/report-cards', studentToken);
    await testEndpoint('Student Leave Requests', 'GET', '/api/student-enhanced/leave-requests', studentToken);
    await testEndpoint('Student Profile', 'GET', '/api/student-enhanced/profile', studentToken);
  }

  // Test Teacher Portal
  console.log(`\n${colors.blue}[3] Testing Teacher Portal API${colors.reset}`);
  const teacherToken = await login(testUsers.teacher.username, testUsers.teacher.password);
  
  if (teacherToken) {
    await testEndpoint('Teacher Dashboard', 'GET', '/api/teacher-portal-advanced/dashboard', teacherToken);
    await testEndpoint('Teacher Classes', 'GET', '/api/teacher-portal-advanced/classes', teacherToken);
    await testEndpoint('Teacher Conduct Records', 'GET', '/api/teacher-portal-advanced/conduct', teacherToken);
  }

  // Test Parent Dashboard
  console.log(`\n${colors.blue}[4] Testing Parent Dashboard API${colors.reset}`);
  const parentToken = await login(testUsers.parent.username, testUsers.parent.password);
  
  if (parentToken) {
    await testEndpoint('Parent Dashboard', 'GET', '/api/parent-enhanced/dashboard', parentToken);
    await testEndpoint('Parent SMS History', 'GET', '/api/parent-enhanced/sms-history', parentToken);
  }

  // Test DOS Dashboard
  console.log(`\n${colors.blue}[5] Testing DOS Dashboard API${colors.reset}`);
  const dosToken = await login(testUsers.dos.username, testUsers.dos.password);
  
  if (dosToken) {
    await testEndpoint('DOS Dashboard Stats', 'GET', '/api/dos-dashboard/dashboard/stats', dosToken);
    await testEndpoint('DOS Students', 'GET', '/api/dos-dashboard/students', dosToken);
    await testEndpoint('DOS Teachers', 'GET', '/api/dos-dashboard/teachers', dosToken);
    await testEndpoint('DOS Exams', 'GET', '/api/dos-dashboard/exams', dosToken);
    await testEndpoint('DOS Timetables', 'GET', '/api/dos-dashboard/timetables', dosToken);
    await testEndpoint('DOS Report Cards', 'GET', '/api/dos-dashboard/report-cards', dosToken);
  }

  // Test Admin Dashboard
  console.log(`\n${colors.blue}[6] Testing Admin Dashboard API${colors.reset}`);
  const adminToken = await login(testUsers.admin.username, testUsers.admin.password);
  
  if (adminToken) {
    await testEndpoint('Admin Overview', 'GET', '/api/admin-dashboard-advanced/overview', adminToken);
    await testEndpoint('Admin Users', 'GET', '/api/admin-dashboard-advanced/users', adminToken);
    await testEndpoint('Admin Settings', 'GET', '/api/admin-dashboard-advanced/settings', adminToken);
    await testEndpoint('Admin Logs', 'GET', '/api/admin-dashboard-advanced/logs', adminToken);
    await testEndpoint('Enrollment Trends', 'GET', '/api/admin-dashboard-advanced/analytics/enrollment-trends', adminToken);
    await testEndpoint('Financial Analytics', 'GET', '/api/admin-dashboard-advanced/analytics/financial', adminToken);
    await testEndpoint('Academic Performance', 'GET', '/api/admin-dashboard-advanced/analytics/academic-performance', adminToken);
    await testEndpoint('Attendance Analytics', 'GET', '/api/admin-dashboard-advanced/analytics/attendance', adminToken);
  }

  // Print Results
  console.log(`\n${colors.blue}========================================`);
  console.log('  TEST RESULTS');
  console.log(`========================================${colors.reset}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  console.log(`Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}✓ ALL TESTS PASSED!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠ Some tests failed. Check the output above.${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test execution error:${colors.reset}`, error);
  process.exit(1);
});
