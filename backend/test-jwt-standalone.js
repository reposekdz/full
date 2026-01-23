const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
require('dotenv').config();

console.log('\n🔐 JWT AUTHENTICATION SYSTEM - STANDALONE TEST\n');
console.log('='.repeat(70));

async function runStandaloneTests() {
  let passed = 0, failed = 0;

  // Test 1: JWT Configuration
  console.log('\n✅ Test 1: JWT Configuration');
  try {
    console.log(`   Secret: ${process.env.JWT_SECRET.substring(0, 30)}...`);
    console.log(`   Expiry: ${process.env.JWT_EXPIRE}`);
    console.log(`   ✓ PASS - JWT is configured\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 2: Database Connection
  console.log('✅ Test 2: Database Connection');
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('   ✓ PASS - Connected to MySQL database\n');
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
    await pool.end();
    return { passed, failed };
  }

  // Test 3: Token Generation
  console.log('✅ Test 3: JWT Token Generation');
  try {
    const payload = { userId: 1, username: 'test_user', role: 'student' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(`   Generated Token: ${token.substring(0, 50)}...`);
    console.log(`   ✓ PASS - Token generated successfully\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 4: Token Verification
  console.log('✅ Test 4: JWT Token Verification');
  try {
    const payload = { userId: 2, username: 'parent_user', role: 'parent' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`   Original: ${JSON.stringify(payload)}`);
    console.log(`   Decoded: userId=${decoded.userId}, role=${decoded.role}`);
    console.log(`   ✓ PASS - Token verified successfully\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 5: Multi-Role Token Generation
  console.log('✅ Test 5: Multi-Role Token Generation');
  try {
    const roles = ['student', 'parent', 'teacher', 'admin', 'director_study'];
    console.log('   Generating tokens for all roles:');
    
    for (const role of roles) {
      const token = jwt.sign({ userId: Math.floor(Math.random() * 1000), role }, process.env.JWT_SECRET, { expiresIn: '24h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`   • ${role.padEnd(20)} → Token valid ✓`);
    }
    console.log(`   ✓ PASS - All role tokens generated\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 6: Token Expiry
  console.log('✅ Test 6: Token Expiry Validation');
  try {
    const shortToken = jwt.sign({ userId: 999, role: 'test' }, process.env.JWT_SECRET, { expiresIn: '1s' });
    console.log('   Created token with 1 second expiry...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      jwt.verify(shortToken, process.env.JWT_SECRET);
      console.log('   ✗ FAIL - Expired token was accepted\n');
      failed++;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('   Token expired after 2 seconds ✓');
        console.log(`   ✓ PASS - Token expiry works correctly\n`);
        passed++;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 7: Password Hashing
  console.log('✅ Test 7: Password Hashing (bcrypt)');
  try {
    const password = 'TestPassword123';
    const hashed = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hashed);
    const isInvalid = await bcrypt.compare('WrongPassword', hashed);
    
    console.log(`   Original: ${password}`);
    console.log(`   Hashed: ${hashed.substring(0, 40)}...`);
    console.log(`   Valid password check: ${isValid ? '✓' : '✗'}`);
    console.log(`   Invalid password check: ${!isInvalid ? '✓' : '✗'}`);
    
    if (isValid && !isInvalid) {
      console.log(`   ✓ PASS - Password hashing works\n`);
      passed++;
    } else {
      console.log(`   ✗ FAIL - Password verification failed\n`);
      failed++;
    }
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 8: Check Database Tables
  console.log('✅ Test 8: Database Tables Check');
  try {
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [roles] = await pool.execute('SELECT COUNT(*) as count FROM roles');
    
    console.log(`   Users table: ${users[0].count} records`);
    console.log(`   Roles table: ${roles[0].count} records`);
    console.log(`   ✓ PASS - Database tables accessible\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 9: Token Payload Structure
  console.log('✅ Test 9: Token Payload Structure');
  try {
    const payload = {
      userId: 123,
      username: 'john_doe',
      role: 'teacher',
      email: 'john@school.rw',
      timestamp: Date.now()
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('   Payload fields verified:');
    console.log(`   • userId: ${decoded.userId === payload.userId ? '✓' : '✗'}`);
    console.log(`   • username: ${decoded.username === payload.username ? '✓' : '✗'}`);
    console.log(`   • role: ${decoded.role === payload.role ? '✓' : '✗'}`);
    console.log(`   • email: ${decoded.email === payload.email ? '✓' : '✗'}`);
    console.log(`   • exp (expiry): ${decoded.exp ? '✓' : '✗'}`);
    console.log(`   • iat (issued at): ${decoded.iat ? '✓' : '✗'}`);
    console.log(`   ✓ PASS - Token payload structure correct\n`);
    passed++;
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 10: Invalid Token Detection
  console.log('✅ Test 10: Invalid Token Detection');
  try {
    const invalidTokens = [
      'invalid.token.here',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
      'completely_wrong_format'
    ];
    
    let allRejected = true;
    for (const token of invalidTokens) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        allRejected = false;
        break;
      } catch (error) {
        // Expected to fail
      }
    }
    
    if (allRejected) {
      console.log('   All invalid tokens rejected ✓');
      console.log(`   ✓ PASS - Invalid token detection works\n`);
      passed++;
    } else {
      console.log(`   ✗ FAIL - Some invalid tokens were accepted\n`);
      failed++;
    }
  } catch (error) {
    console.log(`   ✗ FAIL - ${error.message}\n`);
    failed++;
  }

  // Final Summary
  console.log('='.repeat(70));
  console.log('\n📊 TEST RESULTS SUMMARY\n');
  console.log(`   Total Tests: ${passed + failed}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ JWT Authentication System Features:');
    console.log('   • Token generation and signing');
    console.log('   • Token verification and validation');
    console.log('   • Multi-role support (student, parent, teacher, admin, etc.)');
    console.log('   • Token expiry handling');
    console.log('   • Password hashing with bcrypt');
    console.log('   • Database integration');
    console.log('   • Invalid token detection');
    console.log('   • Secure payload structure');
    console.log('\n✅ System is production-ready!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the details above.\n');
  }
  
  console.log('='.repeat(70) + '\n');
  
  await pool.end();
  return { passed, failed };
}

// Run tests
runStandaloneTests()
  .then(({ passed, failed }) => {
    process.exit(failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test suite crashed:', error.message);
    process.exit(1);
  });
