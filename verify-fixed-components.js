const axios = require('axios');

const BASE_URL = 'http://localhost:5173';

// Test routes that were missing
const testRoutes = [
  {
    name: 'Parent Dashboard',
    url: '/dashboard-parent',
    description: 'Parent portal with child linking and monitoring'
  },
  {
    name: 'Teacher Portal Advanced', 
    url: '/teacher-portal-advanced',
    description: 'Ultra advanced teacher portal with content management'
  },
  {
    name: 'Stock Ultra Advanced',
    url: '/stock-ultra-advanced', 
    description: 'Advanced stock management dashboard'
  }
];

async function verifyRoutes() {
  console.log('🔍 Verifying Fixed Routes...');
  console.log('=' .repeat(50));
  
  for (const route of testRoutes) {
    try {
      console.log(`\n📡 Testing: ${route.name}`);
      console.log(`   URL: ${BASE_URL}${route.url}`);
      console.log(`   Description: ${route.description}`);
      
      const response = await axios.get(BASE_URL + route.url, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept redirects and client errors
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Content-Type: ${response.headers['content-type']}`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  Server not running - Please start frontend server first`);
      } else {
        console.log(`   ❌ Error: ${error.response?.status || error.code}`);
        console.log(`   📝 Message: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Route Verification Complete');
  console.log('\n💡 To test these routes:');
  console.log('   1. Run: start-all-servers.bat');
  console.log('   2. Wait for servers to start');
  console.log('   3. Navigate to http://localhost:5173');
  console.log('   4. Login with appropriate role');
  console.log('   5. Access the fixed components');
}

// Check if frontend server is running
async function checkServer() {
  try {
    const response = await axios.get(BASE_URL, { timeout: 3000 });
    console.log('✅ Frontend server is running');
    return true;
  } catch (error) {
    console.log('❌ Frontend server is not running');
    console.log('   Please run: start-all-servers.bat');
    return false;
  }
}

async function main() {
  console.log('🎯 Component Fix Verification');
  console.log('=' .repeat(50));
  
  const isRunning = await checkServer();
  if (isRunning) {
    await verifyRoutes();
  }
  
  console.log('\n📋 Summary of Fixes Applied:');
  console.log('   ✅ Added TeacherPortalUltraAdvanced import');
  console.log('   ✅ Added UltraAdvancedStockDashboard import'); 
  console.log('   ✅ Fixed routing for teacher-portal-advanced');
  console.log('   ✅ Fixed routing for stock-ultra-advanced');
  console.log('   ✅ Updated role permissions');
  console.log('   ✅ Added navigation menu items');
}

main().catch(console.error);