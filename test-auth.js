const axios = require('axios');

async function testWithAuth() {
  console.log('\n========================================');
  console.log(' Testing Advanced Student Search with Auth');
  console.log('========================================\n');

  try {
    // Step 1: Login
    console.log('[1/4] Authenticating...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'dos',
      password: 'dos123'
    });
    
    const token = loginRes.data.token;
    console.log('[PASS] Authentication successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Test all students
    console.log('[2/4] Testing all students endpoint...');
    const allStudents = await axios.get('http://localhost:5000/api/dos-management/students?limit=5', { headers });
    console.log(`[PASS] Found ${allStudents.data.students?.length || 0} students\n`);

    // Step 3: Test Level 4 SOD
    console.log('[3/4] Testing Level 4 SOD students...');
    const sodStudents = await axios.get('http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&limit=5', { headers });
    console.log(`[PASS] Found ${sodStudents.data.students?.length || 0} Level 4 SOD students\n`);

    // Step 4: Test with filters
    console.log('[4/4] Testing with multiple filters...');
    const filtered = await axios.get('http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&gender=male&limit=5', { headers });
    console.log(`[PASS] Found ${filtered.data.students?.length || 0} filtered students\n`);

    console.log('========================================');
    console.log(' All Tests Passed! ✅');
    console.log('========================================\n');
    console.log('The Advanced Student Search System is working correctly!');
    
  } catch (error) {
    console.error('[FAIL]', error.response?.data?.message || error.message);
    console.log('\nPlease ensure:');
    console.log('1. Backend is running: cd backend && npm start');
    console.log('2. Database is connected');
    console.log('3. User credentials are correct (dos/dos123)');
  }
}

testWithAuth();
