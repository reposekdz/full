const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

console.log('\n🔐 ADVANCED JWT AUTHENTICATION TEST - FULL SERVER INTEGRATION\n');
console.log('='.repeat(70));

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (details) console.log(`   ${details}`);
  testResults.tests.push({ name, passed, details });
  passed ? testResults.passed++ : testResults.failed++;
}

async function runTests() {
  console.log('\n📋 Test Suite: JWT Authentication System\n');

  // Test 1: JWT Configuration
  console.log('1️⃣  Testing JWT Configuration...');
  try {
    const hasSecret = !!process.env.JWT_SECRET;
    const hasExpiry = !!process.env.JWT_EXPIRE;
    logTest('JWT Configuration', hasSecret && hasExpiry, 
      `Secret: ${process.env.JWT_SECRET.substring(0, 20)}..., Expiry: ${process.env.JWT_EXPIRE}`);
  } catch (error) {
    logTest('JWT Configuration', false, error.message);
  }

  // Test 2: Database Connection
  console.log('\n2️⃣  Testing Database Connection...');
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logTest('Database Connection', true, 'Connected to MySQL');
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return;
  }

  // Test 3: Create Test Users
  console.log('\n3️⃣  Creating Test Users...');
  const testUsers = [];
  
  try {
    // Create test student
    const studentPassword = await bcrypt.hash('student123', 10);
    const [studentRole] = await pool.execute('SELECT id FROM roles WHERE name = "student"');
    
    if (studentRole.length > 0) {
      await pool.execute('DELETE FROM users WHERE email = ?', ['test.student@school.rw']);
      const [studentResult] = await pool.execute(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, student_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
      `, ['test_student', 'test.student@school.rw', studentPassword, 'Test', 'Student', '0788111111', studentRole[0].id, '2025TEST001']);
      
      testUsers.push({ id: studentResult.insertId, email: 'test.student@school.rw', password: 'student123', role: 'student' });
      logTest('Create Test Student', true, 'Student ID: 2025TEST001');
    }

    // Create test parent
    const parentPassword = await bcrypt.hash('parent123', 10);
    const [parentRole] = await pool.execute('SELECT id FROM roles WHERE name = "parent"');
    
    if (parentRole.length > 0) {
      await pool.execute('DELETE FROM users WHERE phone = ?', ['0788222222']);
      const [parentResult] = await pool.execute(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, true)
      `, ['test_parent', 'test.parent@school.rw', parentPassword, 'Test', 'Parent', '0788222222', parentRole[0].id]);
      
      testUsers.push({ id: parentResult.insertId, phone: '0788222222', password: 'parent123', role: 'parent' });
      logTest('Create Test Parent', true, 'Phone: 0788222222');
    }
  } catch (error) {
    logTest('Create Test Users', false, error.message);
  }

  // Test 4: Student Login & Token Generation
  console.log('\n4️⃣  Testing Student Login & JWT Token...');
  let studentToken = null;
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.student@school.rw',
      password: 'student123'
    });

    if (response.data.success && response.data.token) {
      studentToken = response.data.token;
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      logTest('Student Login & Token', true, 
        `Token generated, Role: ${decoded.role}, Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    } else {
      logTest('Student Login & Token', false, 'No token returned');
    }
  } catch (error) {
    logTest('Student Login & Token', false, error.response?.data?.message || error.message);
  }

  // Test 5: Parent Phone Login & Token
  console.log('\n5️⃣  Testing Parent Phone Login & JWT Token...');
  let parentToken = null;
  try {
    const response = await axios.post(`${API_BASE}/auth/login/parent`, {
      phone: '0788222222',
      password: 'parent123'
    });

    if (response.data.success && response.data.token) {
      parentToken = response.data.token;
      const decoded = jwt.verify(parentToken, process.env.JWT_SECRET);
      logTest('Parent Phone Login & Token', true, 
        `Token generated, Role: ${decoded.role}, User ID: ${decoded.userId}`);
    } else {
      logTest('Parent Phone Login & Token', false, 'No token returned');
    }
  } catch (error) {
    logTest('Parent Phone Login & Token', false, error.response?.data?.message || error.message);
  }

  // Test 6: Protected Route Access with Token
  console.log('\n6️⃣  Testing Protected Route Access...');
  if (studentToken) {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      if (response.data.success && response.data.user) {
        logTest('Protected Route Access', true, 
          `Accessed /auth/me, User: ${response.data.user.first_name} ${response.data.user.last_name}`);
      } else {
        logTest('Protected Route Access', false, 'Invalid response');
      }
    } catch (error) {
      logTest('Protected Route Access', false, error.response?.data?.message || error.message);
    }
  } else {
    logTest('Protected Route Access', false, 'No token available');
  }

  // Test 7: Invalid Token Rejection
  console.log('\n7️⃣  Testing Invalid Token Rejection...');
  try {
    await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer invalid_token_12345' }
    });
    logTest('Invalid Token Rejection', false, 'Invalid token was accepted');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Invalid Token Rejection', true, 'Invalid token correctly rejected');
    } else {
      logTest('Invalid Token Rejection', false, error.message);
    }
  }

  // Test 8: Missing Token Rejection
  console.log('\n8️⃣  Testing Missing Token Rejection...');
  try {
    await axios.get(`${API_BASE}/auth/me`);
    logTest('Missing Token Rejection', false, 'Request without token was accepted');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Missing Token Rejection', true, 'Request without token correctly rejected');
    } else {
      logTest('Missing Token Rejection', false, error.message);
    }
  }

  // Test 9: Token Expiry
  console.log('\n9️⃣  Testing Token Expiry...');
  try {
    const expiredToken = jwt.sign(
      { userId: 999, role: 'test' },
      process.env.JWT_SECRET,
      { expiresIn: '1s' }
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
      logTest('Token Expiry', false, 'Expired token was accepted');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logTest('Token Expiry', true, 'Expired token correctly rejected');
      } else {
        logTest('Token Expiry', false, error.message);
      }
    }
  } catch (error) {
    logTest('Token Expiry', false, error.message);
  }

  // Test 10: Student Registration with Auto-Token
  console.log('\n🔟 Testing Student Registration with Auto-Token...');
  try {
    await pool.execute('DELETE FROM users WHERE email = ?', ['new.student@school.rw']);
    
    const response = await axios.post(`${API_BASE}/auth/register/student`, {
      first_name: 'New',
      last_name: 'Student',
      email: 'new.student@school.rw',
      phone: '0788333333',
      password: 'newstudent123',
      trade_code: 'ELEC',
      level_number: 1,
      level_suffix: 'A'
    });

    if (response.data.success && response.data.token) {
      const decoded = jwt.verify(response.data.token, process.env.JWT_SECRET);
      logTest('Student Registration with Auto-Token', true, 
        `Student ID: ${response.data.user.student_id}, Token Role: ${decoded.role}`);
    } else {
      logTest('Student Registration with Auto-Token', false, 'No token returned');
    }
  } catch (error) {
    logTest('Student Registration with Auto-Token', false, error.response?.data?.message || error.message);
  }

  // Test 11: Parent Registration with Auto-Token
  console.log('\n1️⃣1️⃣  Testing Parent Registration with Auto-Token...');
  try {
    await pool.execute('DELETE FROM users WHERE phone = ?', ['0788444444']);
    
    const response = await axios.post(`${API_BASE}/auth/register/parent-phone`, {
      first_name: 'New',
      last_name: 'Parent',
      phone: '0788444444',
      password: 'newparent123',
      email: 'new.parent@school.rw',
      address: 'Kigali, Gasabo'
    });

    if (response.data.success && response.data.token) {
      const decoded = jwt.verify(response.data.token, process.env.JWT_SECRET);
      logTest('Parent Registration with Auto-Token', true, 
        `Phone: ${response.data.user.phone}, Token Role: ${decoded.role}`);
    } else {
      logTest('Parent Registration with Auto-Token', false, 'No token returned');
    }
  } catch (error) {
    logTest('Parent Registration with Auto-Token', false, error.response?.data?.message || error.message);
  }

  // Test 12: Role-Based Access Control
  console.log('\n1️⃣2️⃣  Testing Role-Based Access Control...');
  if (parentToken) {
    try {
      const response = await axios.get(`${API_BASE}/parents/children`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });

      if (response.data.success) {
        logTest('Role-Based Access Control', true, 
          `Parent accessed /parents/children endpoint`);
      } else {
        logTest('Role-Based Access Control', false, 'Invalid response');
      }
    } catch (error) {
      logTest('Role-Based Access Control', false, error.response?.data?.message || error.message);
    }
  } else {
    logTest('Role-Based Access Control', false, 'No parent token available');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  try {
    await pool.execute('DELETE FROM users WHERE email IN (?, ?, ?)', 
      ['test.student@school.rw', 'test.parent@school.rw', 'new.student@school.rw']);
    await pool.execute('DELETE FROM users WHERE phone IN (?, ?)', 
      ['0788222222', '0788444444']);
    console.log('   ✓ Test data cleaned up');
  } catch (error) {
    console.log('   ⚠ Cleanup warning:', error.message);
  }

  // Final Report
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 TEST RESULTS SUMMARY\n');
  console.log(`   Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! JWT Authentication System is fully operational!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the details above.\n');
  }

  console.log('='.repeat(70) + '\n');
  
  await pool.end();
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
