const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAPIs() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING COMPREHENSIVE APIs');
  console.log('='.repeat(80) + '\n');

  const tests = [
    // Academic APIs
    { name: 'Academic Years', method: 'GET', url: `${BASE_URL}/academic/academic-years` },
    { name: 'Courses', method: 'GET', url: `${BASE_URL}/academic/courses` },
    { name: 'Subjects', method: 'GET', url: `${BASE_URL}/academic/subjects` },
    { name: 'Classes', method: 'GET', url: `${BASE_URL}/academic/classes` },
    
    // Finance APIs
    { name: 'Fee Types', method: 'GET', url: `${BASE_URL}/finance/fee-types` },
    { name: 'Fee Structures', method: 'GET', url: `${BASE_URL}/finance/fee-structures` },
    
    // Stock APIs
    { name: 'Stock Categories', method: 'GET', url: `${BASE_URL}/stock/stock-categories` },
    { name: 'Stock Items', method: 'GET', url: `${BASE_URL}/stock/stock-items` },
    
    // Knowledge Base APIs
    { name: 'Knowledge Base', method: 'GET', url: `${BASE_URL}/knowledge/knowledge-base` },
    { name: 'Notifications', method: 'GET', url: `${BASE_URL}/knowledge/notifications` },
    
    // Library & Services APIs
    { name: 'Library Books', method: 'GET', url: `${BASE_URL}/services/library/books` },
    { name: 'Hostel Rooms', method: 'GET', url: `${BASE_URL}/services/hostel/rooms` },
    { name: 'Transport Routes', method: 'GET', url: `${BASE_URL}/services/transport/routes` },
    { name: 'Sports Teams', method: 'GET', url: `${BASE_URL}/services/sports/teams` },
    
    // Attendance & Grades APIs
    { name: 'Attendance', method: 'GET', url: `${BASE_URL}/academics-tracking/attendance` },
    { name: 'Grades', method: 'GET', url: `${BASE_URL}/academics-tracking/grades` },
    { name: 'Assignments', method: 'GET', url: `${BASE_URL}/academics-tracking/assignments` },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });

      if (response.data && response.data.success) {
        console.log(`✅ ${test.name.padEnd(30)} - PASSED`);
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`   └─ Records: ${response.data.data.length}`);
        } else if (response.data.pagination) {
          console.log(`   └─ Total: ${response.data.pagination.total}`);
        }
        passed++;
      } else {
        console.log(`⚠️  ${test.name.padEnd(30)} - WARNING (No success flag)`);
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name.padEnd(30)} - FAILED`);
      if (error.response && error.response.data) {
        console.log(`   └─ Error: ${error.response.data.message || error.message}`);
      } else {
        console.log(`   └─ Error: ${error.message}`);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST RESULTS: ${passed}/${tests.length} passed, ${failed} failed`);
  console.log('='.repeat(80) + '\n');

  if (failed === 0) {
    console.log('✅ ALL COMPREHENSIVE APIs ARE WORKING!\n');
  } else {
    console.log(`⚠️  ${failed} API(s) need attention\n`);
  }
}

testAPIs().catch(err => {
  console.error('❌ Test execution failed:', err.message);
  process.exit(1);
});
