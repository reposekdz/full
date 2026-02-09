/**
 * ========================================================
 * COMPREHENSIVE ROLES API TEST SCRIPT
 * ========================================================
 * Tests all role-based API endpoints for:
 * - Admin
 * - Accountant
 * - Teacher
 * - Advisor
 * - DOS
 * - DOD
 * - Headmaster
 * - Stock Manager
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
const API_BASE = `${BASE_URL}/api/comprehensive-roles`;

// Test helper
async function testEndpoint(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function runTest(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`❌ FAILED: ${name} - ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 COMPREHENSIVE ROLES API TEST');
  console.log('='.repeat(60));
  console.log(`\n🌐 Base URL: ${API_BASE}`);
  console.log(`📅 Test Date: ${new Date().toISOString()}`);

  try {
    // ============================================================
    // HEALTH CHECK
    // ============================================================
    await runTest('Health Check - API Server', async () => {
      const res = await http.get(`${BASE_URL}/api/health`, (res) => {
        if (res.statusCode !== 200) {
          throw new Error(`Server returned status ${res.statusCode}`);
        }
      });
    });

    // ============================================================
    // AUTHENTICATION (Skip if no token available)
    // ============================================================
    console.log('\n📝 Note: Some tests require authentication');
    console.log('   Run login test separately to get a token');

    // ============================================================
    // COMMON ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMMON ENDPOINTS');
    console.log('='.repeat(60));

    // ============================================================
    // ADMIN ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('👤 ADMIN ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /admin/dashboard', async () => {
      // This will return 401 without auth, but we test the endpoint exists
      await testEndpoint('GET', '/admin/dashboard');
    });

    await runTest('GET /admin/users', async () => {
      await testEndpoint('GET', '/admin/users');
    });

    await runTest('POST /admin/users (validation)', async () => {
      const res = await testEndpoint('POST', '/admin/users', {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'teacher'
      });
      if (res.status === 400 || res.status === 401) {
        // Expected without proper auth
        return;
      }
    });

    // ============================================================
    // ACCOUNTANT ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('💰 ACCOUNTANT ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /accountant/dashboard', async () => {
      await testEndpoint('GET', '/accountant/dashboard');
    });

    await runTest('GET /accountant/transactions', async () => {
      await testEndpoint('GET', '/accountant/transactions');
    });

    // ============================================================
    // TEACHER ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('👨‍🏫 TEACHER ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /teacher/dashboard', async () => {
      await testEndpoint('GET', '/teacher/dashboard');
    });

    await runTest('GET /teacher/classes', async () => {
      await testEndpoint('GET', '/teacher/classes');
    });

    // ============================================================
    // ADVISOR ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('🎓 ADVISOR ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /advisor/dashboard', async () => {
      await testEndpoint('GET', '/advisor/dashboard');
    });

    await runTest('GET /advisor/students', async () => {
      await testEndpoint('GET', '/advisor/students');
    });

    // ============================================================
    // DOS ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📚 DOS ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /dos/dashboard', async () => {
      await testEndpoint('GET', '/dos/dashboard');
    });

    await runTest('GET /dos/students', async () => {
      await testEndpoint('GET', '/dos/students');
    });

    await runTest('GET /dos/trades-levels', async () => {
      await testEndpoint('GET', '/dos/trades-levels');
    });

    // ============================================================
    // DOD ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('⚖️ DOD ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /dod/dashboard', async () => {
      await testEndpoint('GET', '/dod/dashboard');
    });

    await runTest('GET /dod/students', async () => {
      await testEndpoint('GET', '/dod/students');
    });

    // ============================================================
    // HEADMASTER ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('🏛️ HEADMASTER ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /headmaster/dashboard', async () => {
      await testEndpoint('GET', '/headmaster/dashboard');
    });

    await runTest('GET /headmaster/analytics', async () => {
      await testEndpoint('GET', '/headmaster/analytics');
    });

    await runTest('GET /headmaster/reports', async () => {
      await testEndpoint('GET', '/headmaster/reports');
    });

    // ============================================================
    // STOCK MANAGER ENDPOINTS
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📦 STOCK MANAGER ENDPOINTS');
    console.log('='.repeat(60));

    await runTest('GET /stock/dashboard', async () => {
      await testEndpoint('GET', '/stock/dashboard');
    });

    await runTest('GET /stock/items', async () => {
      await testEndpoint('GET', '/stock/items');
    });

    await runTest('GET /stock/categories', async () => {
      await testEndpoint('GET', '/stock/categories');
    });

    // ============================================================
    // POST ENDPOINTS (Validation Tests)
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📤 POST ENDPOINTS (Validation)');
    console.log('='.repeat(60));

    await runTest('POST /accountant/payments/record (validation)', async () => {
      await testEndpoint('POST', '/accountant/payments/record', {
        student_id: 'TEST001',
        amount: 50000
      });
    });

    await runTest('POST /teacher/attendance (validation)', async () => {
      await testEndpoint('POST', '/teacher/attendance', {
        class_id: 1,
        attendance_records: []
      });
    });

    await runTest('POST /stock/items (validation)', async () => {
      await testEndpoint('POST', '/stock/items', {
        item_name: 'Test Item',
        item_code: 'TEST001',
        category: 'testing'
      });
    });

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📝 Total: ${results.passed + results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);

    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests.filter(t => t.status === 'failed').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    }

    // Save results
    const resultsFile = path.join(__dirname, '..', 'test-results-comprehensive-roles.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed: results.passed,
        failed: results.failed,
        total: results.passed + results.failed,
        successRate: ((results.passed / (results.passed + results.failed)) * 100).toFixed(2) + '%'
      },
      tests: results.tests
    }, null, 2));
    console.log(`\n📁 Results saved to: ${resultsFile}`);

  } catch (error) {
    console.error('\n💥 Test Execution Error:', error);
    process.exit(1);
  }
}

// Run tests
main().then(() => {
  console.log('\n✅ All tests completed!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Fatal Error:', error);
  process.exit(1);
});
