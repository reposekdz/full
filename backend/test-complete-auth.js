const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let studentToken = '';
let parentToken = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logSection(message) {
  console.log('\n' + '='.repeat(80));
  log(message, 'yellow');
  console.log('='.repeat(80) + '\n');
}

async function testAPI(name, method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    logSuccess(`${name}: ${response.data.message || 'Success'}`);
    return response.data;
  } catch (error) {
    logError(`${name}: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  logSection('🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM - API TESTS');

  // Test 1: Health Check
  logSection('1️⃣  HEALTH CHECK');
  await testAPI('Health Check', 'GET', '/health');

  // Test 2: Get Available Trades
  logSection('2️⃣  GET AVAILABLE TRADES');
  const trades = await testAPI('Get Trades', 'GET', '/auth/registration/trades');
  if (trades && trades.trades) {
    logInfo(`Found ${trades.trades.length} trade levels`);
  }

  // Test 3: Check Email Availability
  logSection('3️⃣  CHECK EMAIL AVAILABILITY');
  await testAPI('Check Email', 'POST', '/auth/check-email', {
    email: 'newstudent@test.com'
  });

  // Test 4: Student Registration
  logSection('4️⃣  STUDENT REGISTRATION');
  const studentData = {
    first_name: 'John',
    last_name: 'Doe',
    email: `student${Date.now()}@test.com`,
    phone: `078${Math.floor(Math.random() * 10000000)}`,
    password: 'student123',
    date_of_birth: '2005-05-15',
    gender: 'Male',
    trade_code: 'SOD',
    level_number: 4,
    level_suffix: 'A',
    address: 'Kigali, Rwanda',
    emergency_contact: '0788999999',
    parent_info: {
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '0788888888',
      email: `parent${Date.now()}@test.com`
    }
  };

  const studentReg = await testAPI('Student Registration', 'POST', '/auth/register/student', studentData);
  if (studentReg && studentReg.token) {
    studentToken = studentReg.token;
    logInfo(`Student ID: ${studentReg.user.student_id}`);
    logInfo(`Token: ${studentToken.substring(0, 20)}...`);
  }

  // Test 5: Student Login
  logSection('5️⃣  STUDENT LOGIN');
  if (studentReg) {
    const studentLogin = await testAPI('Student Login', 'POST', '/auth/login', {
      username: studentReg.user.email,
      password: 'student123'
    });
    if (studentLogin && studentLogin.token) {
      studentToken = studentLogin.token;
      logInfo(`Logged in as: ${studentLogin.user.first_name} ${studentLogin.user.last_name}`);
    }
  }

  // Test 6: Parent Registration (Phone-based)
  logSection('6️⃣  PARENT REGISTRATION (PHONE-BASED)');
  const parentData = {
    phone: `078${Math.floor(Math.random() * 10000000)}`,
    password: 'parent123',
    first_name: 'Mary',
    last_name: 'Smith',
    email: `parent${Date.now()}@test.com`,
    address: 'Kigali, Rwanda'
  };

  const parentReg = await testAPI('Parent Registration', 'POST', '/auth/register/parent-phone', parentData);
  if (parentReg && parentReg.token) {
    parentToken = parentReg.token;
    logInfo(`Parent Phone: ${parentReg.user.phone}`);
    logInfo(`Token: ${parentToken.substring(0, 20)}...`);
  }

  // Test 7: Parent Login (Phone-based)
  logSection('7️⃣  PARENT LOGIN (PHONE-BASED)');
  if (parentReg) {
    const parentLogin = await testAPI('Parent Login', 'POST', '/auth/login/parent', {
      phone: parentReg.user.phone,
      password: 'parent123'
    });
    if (parentLogin && parentLogin.token) {
      parentToken = parentLogin.token;
      logInfo(`Logged in as: ${parentLogin.user.first_name} ${parentLogin.user.last_name}`);
    }
  }

  // Test 8: Get Current User (Student)
  logSection('8️⃣  GET CURRENT USER (STUDENT)');
  if (studentToken) {
    await testAPI('Get Student Profile', 'GET', '/auth/me', null, studentToken);
  }

  // Test 9: Get Current User (Parent)
  logSection('9️⃣  GET CURRENT USER (PARENT)');
  if (parentToken) {
    await testAPI('Get Parent Profile', 'GET', '/auth/me', null, parentToken);
  }

  // Test 10: Student Dashboard
  logSection('🔟 STUDENT DASHBOARD');
  if (studentToken) {
    const dashboard = await testAPI('Student Dashboard', 'GET', '/students/dashboard', null, studentToken);
    if (dashboard) {
      logInfo(`Enrollments: ${dashboard.data?.enrollments?.length || 0}`);
      logInfo(`Recent Grades: ${dashboard.data?.recent_grades?.length || 0}`);
    }
  }

  // Test 11: Parent Get Children
  logSection('1️⃣1️⃣  PARENT GET CHILDREN');
  if (parentToken) {
    const children = await testAPI('Get Children', 'GET', '/parents/children', null, parentToken);
    if (children) {
      logInfo(`Linked Children: ${children.children?.length || 0}`);
    }
  }

  // Test 12: Update Profile
  logSection('1️⃣2️⃣  UPDATE PROFILE');
  if (studentToken) {
    await testAPI('Update Student Profile', 'PUT', '/auth/profile', {
      phone: '0788111111',
      address: 'Updated Address, Kigali'
    }, studentToken);
  }

  // Test 13: Change Password
  logSection('1️⃣3️⃣  CHANGE PASSWORD');
  if (studentToken) {
    await testAPI('Change Password', 'PUT', '/auth/change-password', {
      currentPassword: 'student123',
      newPassword: 'newpassword123'
    }, studentToken);
  }

  // Test 14: Admin Login
  logSection('1️⃣4️⃣  ADMIN LOGIN');
  const adminLogin = await testAPI('Admin Login', 'POST', '/auth/login', {
    username: 'admin@gardentvet.com',
    password: 'admin123'
  });
  if (adminLogin && adminLogin.token) {
    authToken = adminLogin.token;
    logInfo(`Admin logged in: ${adminLogin.user.role}`);
  }

  // Final Summary
  logSection('📊 TEST SUMMARY');
  logSuccess('All API tests completed!');
  logInfo('Check the results above for any failures');
  console.log('\n' + '='.repeat(80));
  log('🎉 TESTING COMPLETE!', 'green');
  console.log('='.repeat(80) + '\n');
}

// Run all tests
runTests().catch(error => {
  logError('Test suite failed: ' + error.message);
  process.exit(1);
});
