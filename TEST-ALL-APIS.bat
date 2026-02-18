@echo off
echo ========================================
echo GARDEN TVET - API VERIFICATION TEST
echo ========================================
echo.

cd /d "%~dp0backend"

echo Testing all API endpoints...
echo.

node -e "
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const endpoints = [
  { name: 'Health Check', url: '/api/health', method: 'GET' },
  { name: 'Auth - Login', url: '/api/auth/login', method: 'POST' },
  { name: 'Students List', url: '/api/students', method: 'GET' },
  { name: 'Staff List', url: '/api/staff', method: 'GET' },
  { name: 'DOD Dashboard', url: '/api/dod/dashboard', method: 'GET' },
  { name: 'DOS Dashboard', url: '/api/dos/dashboard', method: 'GET' },
  { name: 'SMS Templates', url: '/api/sms/templates', method: 'GET' },
  { name: 'News Articles', url: '/api/news', method: 'GET' },
  { name: 'Sports List', url: '/api/sports', method: 'GET' },
  { name: 'Trades List', url: '/api/trades', method: 'GET' },
  { name: 'Applications', url: '/api/applications', method: 'GET' },
  { name: 'Global Sheets', url: '/api/global-sheets/students', method: 'GET' },
  { name: 'Leadership', url: '/api/leadership', method: 'GET' },
  { name: 'Developers', url: '/api/developers', method: 'GET' },
  { name: 'Locations - Provinces', url: '/api/locations/provinces', method: 'GET' },
  { name: 'Parent Dashboard', url: '/api/parent/dashboard', method: 'GET' },
  { name: 'Notifications', url: '/api/notifications', method: 'GET' },
  { name: 'Timetable', url: '/api/timetable', method: 'GET' },
  { name: 'Exams', url: '/api/exams', method: 'GET' },
  { name: 'Payments', url: '/api/payments', method: 'GET' }
];

async function testEndpoints() {
  console.log('\\n========================================');
  console.log('TESTING API ENDPOINTS');
  console.log('========================================\\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: BASE_URL + endpoint.url,
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status < 500) {
        console.log('✅ PASS:', endpoint.name, '(' + response.status + ')');
        passed++;
      } else {
        console.log('❌ FAIL:', endpoint.name, '(' + response.status + ')');
        failed++;
      }
    } catch (error) {
      console.log('❌ ERROR:', endpoint.name, '-', error.message);
      failed++;
    }
  }
  
  console.log('\\n========================================');
  console.log('TEST RESULTS');
  console.log('========================================');
  console.log('Total Tests:', endpoints.length);
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Success Rate:', Math.round((passed / endpoints.length) * 100) + '%%');
  console.log('========================================\\n');
}

testEndpoints().catch(err => {
  console.error('\\n❌ Test suite failed:', err.message);
  console.log('\\nMake sure the backend server is running on port 5000');
  process.exit(1);
});
"

echo.
echo Test complete!
echo.
pause
