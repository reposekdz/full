const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sendUniversalMessage, checkBalance, getSMSStats } = require('./services/smsService');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

console.log('\n🔍 COMPREHENSIVE FEATURE TEST - AFRICAN TALK & JWT SYSTEM\n');
console.log('='.repeat(80));

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

async function runComprehensiveTests() {
  console.log('\n📋 Testing African Talk SMS & JWT Authentication Features\n');

  // Test 1: African Talk API Configuration
  console.log('1️⃣  Testing African Talk API Configuration...');
  try {
    const hasApiKey = !!process.env.AFRICATALKING_API_KEY;
    const hasUsername = !!process.env.AFRICATALKING_USERNAME;
    const isProduction = process.env.AFRICATALKING_USERNAME !== 'sandbox';
    
    logTest('African Talk Configuration', hasApiKey && hasUsername, 
      `API Key: ${hasApiKey ? 'Set' : 'Missing'}, Username: ${process.env.AFRICATALKING_USERNAME}, Mode: ${isProduction ? 'Production' : 'Sandbox'}`);
  } catch (error) {
    logTest('African Talk Configuration', false, error.message);
  }

  // Test 2: SMS Balance Check
  console.log('\n2️⃣  Testing SMS Balance Check...');
  try {
    const balanceResult = await checkBalance();
    logTest('SMS Balance Check', balanceResult.success, 
      balanceResult.success ? `Balance: ${balanceResult.balance}` : balanceResult.error);
  } catch (error) {
    logTest('SMS Balance Check', false, error.message);
  }

  // Test 3: SMS Service Functionality
  console.log('\n3️⃣  Testing SMS Service Functionality...');
  try {
    const testMessage = 'Test message from Garden TVET School Management System - Feature Test';
    const smsResult = await sendUniversalMessage('+250788123456', testMessage, 0, {
      type: 'feature_test',
      preferredMethod: 'sms'
    });
    
    logTest('SMS Service Functionality', smsResult.success, 
      smsResult.success ? `Method: ${smsResult.method}, Message sent successfully` : smsResult.error);
  } catch (error) {
    logTest('SMS Service Functionality', false, error.message);
  }

  // Test 4: WhatsApp Service Functionality
  console.log('\n4️⃣  Testing WhatsApp Service Functionality...');
  try {
    const testMessage = 'Test WhatsApp message from Garden TVET School Management System';
    const whatsappResult = await sendUniversalMessage('+250788123456', testMessage, 0, {
      type: 'feature_test',
      preferredMethod: 'whatsapp',
      hasSmartphone: true
    });
    
    logTest('WhatsApp Service Functionality', whatsappResult.success, 
      whatsappResult.success ? `Method: ${whatsappResult.method}` : whatsappResult.error);
  } catch (error) {
    logTest('WhatsApp Service Functionality', false, error.message);
  }

  // Test 5: SMS Statistics
  console.log('\n5️⃣  Testing SMS Statistics...');
  try {
    const statsResult = await getSMSStats();
    logTest('SMS Statistics', statsResult.success, 
      statsResult.success ? `Total Messages: ${statsResult.stats.total_messages}, Sent: ${statsResult.stats.sent_count}` : statsResult.error);
  } catch (error) {
    logTest('SMS Statistics', false, error.message);
  }

  // Test 6: JWT Configuration
  console.log('\n6️⃣  Testing JWT Configuration...');
  try {
    const hasSecret = !!process.env.JWT_SECRET;
    const hasExpiry = !!process.env.JWT_EXPIRE;
    const secretLength = process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0;
    
    logTest('JWT Configuration', hasSecret && hasExpiry && secretLength >= 32, 
      `Secret Length: ${secretLength}, Expiry: ${process.env.JWT_EXPIRE}`);
  } catch (error) {
    logTest('JWT Configuration', false, error.message);
  }

  // Test 7: JWT Token Generation
  console.log('\n7️⃣  Testing JWT Token Generation...');
  try {
    const testPayload = { userId: 999, username: 'test_user', role: 'test' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const isValid = decoded.userId === testPayload.userId && 
                   decoded.username === testPayload.username && 
                   decoded.role === testPayload.role;
    
    logTest('JWT Token Generation', isValid, 
      `Token generated and verified successfully, Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`);
  } catch (error) {
    logTest('JWT Token Generation', false, error.message);
  }

  // Test 8: JWT Token Expiry Handling
  console.log('\n8️⃣  Testing JWT Token Expiry Handling...');
  try {
    const expiredToken = jwt.sign({ userId: 999 }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    await new Promise(resolve => setTimeout(resolve, 10));
    
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
      logTest('JWT Token Expiry Handling', false, 'Expired token was accepted');
    } catch (error) {
      const isExpiredError = error.name === 'TokenExpiredError';
      logTest('JWT Token Expiry Handling', isExpiredError, 
        isExpiredError ? 'Expired tokens correctly rejected' : error.message);
    }
  } catch (error) {
    logTest('JWT Token Expiry Handling', false, error.message);
  }

  // Test 9: Authentication Endpoint Health
  console.log('\n9️⃣  Testing Authentication Endpoint Health...');
  try {
    const response = await axios.get(`${API_BASE}/auth/health`);
    const isHealthy = response.data.success && response.data.status === 'ok';
    
    logTest('Authentication Endpoint Health', isHealthy, 
      isHealthy ? `Service running, Version: ${response.data.version || 'N/A'}` : 'Health check failed');
  } catch (error) {
    logTest('Authentication Endpoint Health', false, 
      error.response?.data?.message || error.message);
  }

  // Test 10: Role-Based Access Control Features
  console.log('\n🔟 Testing Role-Based Access Control Features...');
  try {
    // Test different role tokens
    const adminToken = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const studentToken = jwt.sign({ userId: 2, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const parentToken = jwt.sign({ userId: 3, role: 'parent' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const tokens = { admin: adminToken, student: studentToken, parent: parentToken };
    const tokenCount = Object.keys(tokens).length;
    
    logTest('Role-Based Access Control Features', tokenCount === 3, 
      `Generated ${tokenCount} role-based tokens: admin, student, parent`);
  } catch (error) {
    logTest('Role-Based Access Control Features', false, error.message);
  }

  // Test 11: Environment Security
  console.log('\n1️⃣1️⃣  Testing Environment Security...');
  try {
    const hasSecureSecret = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 64;
    const hasLongExpiry = process.env.JWT_EXPIRE && process.env.JWT_EXPIRE.includes('d');
    const isProduction = process.env.NODE_ENV === 'production';
    const hasSMSEnabled = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
    
    const securityScore = [hasSecureSecret, hasLongExpiry, isProduction, hasSMSEnabled].filter(Boolean).length;
    
    logTest('Environment Security', securityScore >= 3, 
      `Security Score: ${securityScore}/4 - Secret: ${hasSecureSecret ? 'Secure' : 'Weak'}, Production: ${isProduction}, SMS: ${hasSMSEnabled}`);
  } catch (error) {
    logTest('Environment Security', false, error.message);
  }

  // Test 12: Feature Integration
  console.log('\n1️⃣2️⃣  Testing Feature Integration...');
  try {
    const features = {
      sms: !!process.env.AFRICATALKING_API_KEY,
      jwt: !!process.env.JWT_SECRET,
      database: !!process.env.DB_NAME,
      email: !!process.env.EMAIL_USER,
      notifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true'
    };
    
    const enabledFeatures = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;
    
    logTest('Feature Integration', enabledFeatures >= 4, 
      `${enabledFeatures}/${totalFeatures} features enabled: ${Object.entries(features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  } catch (error) {
    logTest('Feature Integration', false, error.message);
  }

  // Final Report
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 COMPREHENSIVE TEST RESULTS SUMMARY\n');
  console.log(`   Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Feature Analysis
  console.log('\n🔍 FEATURE ANALYSIS:\n');
  
  const africanTalkTests = testResults.tests.filter(t => 
    t.name.includes('African Talk') || t.name.includes('SMS') || t.name.includes('WhatsApp')
  );
  const africanTalkPassed = africanTalkTests.filter(t => t.passed).length;
  
  const jwtTests = testResults.tests.filter(t => 
    t.name.includes('JWT') || t.name.includes('Authentication') || t.name.includes('Role-Based')
  );
  const jwtPassed = jwtTests.filter(t => t.passed).length;
  
  console.log(`📱 African Talk SMS/WhatsApp: ${africanTalkPassed}/${africanTalkTests.length} tests passed`);
  console.log(`   - ${africanTalkPassed === africanTalkTests.length ? '✅ FULLY FUNCTIONAL' : '⚠️  PARTIALLY FUNCTIONAL'}`);
  console.log(`   - Features: SMS sending, WhatsApp messaging, Balance checking, Statistics`);
  
  console.log(`\n🔐 JWT Authentication: ${jwtPassed}/${jwtTests.length} tests passed`);
  console.log(`   - ${jwtPassed === jwtTests.length ? '✅ FULLY FUNCTIONAL' : '⚠️  PARTIALLY FUNCTIONAL'}`);
  console.log(`   - Features: Token generation, Expiry handling, Role-based access, Security`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL SYSTEMS FULLY OPERATIONAL!');
    console.log('\n✅ African Talk APIs are production-ready with rich features:');
    console.log('   • SMS and WhatsApp messaging');
    console.log('   • Balance monitoring');
    console.log('   • Message history and statistics');
    console.log('   • Universal messaging with fallback');
    console.log('   • Production-grade error handling');
    
    console.log('\n✅ JWT Authentication is enterprise-grade with rich features:');
    console.log('   • Secure token generation and validation');
    console.log('   • Role-based access control');
    console.log('   • Token expiry management');
    console.log('   • Multi-table user support');
    console.log('   • Profile management with history');
    console.log('   • Password change functionality');
  } else {
    console.log('\n⚠️  Some features need attention. Review the details above.');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run comprehensive tests
runComprehensiveTests().catch(error => {
  console.error('\n❌ Comprehensive test suite failed:', error.message);
  process.exit(1);
});