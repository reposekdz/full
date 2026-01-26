const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/staff-management';

async function testStaffManagementAPI() {
  console.log('🧪 Testing Staff Management API...\n');

  try {
    // Test 1: Get all trades
    console.log('1️⃣ Testing GET /trades');
    const tradesRes = await axios.get(`${API_BASE}/trades`);
    console.log(`   ✅ Found ${tradesRes.data.trades.length} trades`);
    console.log(`   ✅ Grouped: BDC(${tradesRes.data.grouped.BDC.length}), AUTO(${tradesRes.data.grouped.AUTO.length}), SOD(${tradesRes.data.grouped.SOD.length})\n`);

    // Test 2: Get levels
    console.log('2️⃣ Testing GET /levels');
    const levelsRes = await axios.get(`${API_BASE}/levels`);
    console.log(`   ✅ Found ${levelsRes.data.levels.length} levels: ${levelsRes.data.levels.map(l => l.value).join(', ')}\n`);

    // Test 3: Get classes
    console.log('3️⃣ Testing GET /classes');
    const classesRes = await axios.get(`${API_BASE}/classes`);
    console.log(`   ✅ Found ${classesRes.data.classes.length} classes: ${classesRes.data.classes.map(c => c.value).join(', ')}\n`);

    // Test 4: Get roles
    console.log('4️⃣ Testing GET /roles');
    const rolesRes = await axios.get(`${API_BASE}/roles`);
    console.log(`   ✅ Found ${rolesRes.data.roles.length} staff roles\n`);

    // Test 5: Get all staff
    console.log('5️⃣ Testing GET /staff');
    const staffRes = await axios.get(`${API_BASE}/staff`);
    console.log(`   ✅ Found ${staffRes.data.staff.length} staff members\n`);

    // Test 6: Get staff by credential
    console.log('6️⃣ Testing GET /staff/by-credential/AUTO');
    const autoStaffRes = await axios.get(`${API_BASE}/staff/by-credential/AUTO`);
    console.log(`   ✅ Found ${autoStaffRes.data.staff.length} AUTO staff\n`);

    // Test 7: Get staff statistics
    console.log('7️⃣ Testing GET /staff/stats/by-trade');
    const statsRes = await axios.get(`${API_BASE}/staff/stats/by-trade`);
    console.log(`   ✅ Got statistics for trades\n`);

    console.log('✅ All API endpoints working correctly!\n');
    console.log('📊 Summary:');
    console.log(`   - Trades: ${tradesRes.data.trades.length}`);
    console.log(`   - Levels: ${levelsRes.data.levels.length}`);
    console.log(`   - Classes: ${classesRes.data.classes.length}`);
    console.log(`   - Roles: ${rolesRes.data.roles.length}`);
    console.log(`   - Staff: ${staffRes.data.staff.length}`);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running!');
      console.log('   Please start the server first: npm run dev or START-BACKEND.bat\n');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

testStaffManagementAPI();
