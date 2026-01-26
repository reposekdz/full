const axios = require('axios');

const BASE = 'http://localhost:5000/api';

const tests = {
  passed: 0,
  failed: 0,
  errors: []
};

async function test(name, url, method = 'GET', data = null) {
  try {
    const config = { method, url: `${BASE}${url}` };
    if (data) config.data = data;
    const res = await axios(config);
    console.log(`✅ ${name}`);
    tests.passed++;
    return res.data;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.data?.error || error.message}`);
    tests.failed++;
    tests.errors.push({ name, error: error.response?.data?.error || error.message });
    return null;
  }
}

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE API TEST SUITE\n');
  console.log('='.repeat(60));

  // STAFF MANAGEMENT
  console.log('\n📋 STAFF MANAGEMENT APIs');
  console.log('-'.repeat(60));
  await test('Get Trades', '/staff-management/trades');
  await test('Get Levels', '/staff-management/levels');
  await test('Get Classes', '/staff-management/classes');
  await test('Get Roles', '/staff-management/roles');
  await test('Get All Staff', '/staff-management/staff');
  await test('Get AUTO Staff', '/staff-management/staff/by-credential/AUTO');
  await test('Get BDC Staff', '/staff-management/staff/by-credential/BDC');
  await test('Get SOD Staff', '/staff-management/staff/by-credential/SOD');
  await test('Get Staff Stats', '/staff-management/staff/stats/by-trade');

  // DOD SYSTEM
  console.log('\n🎯 DOD COMPREHENSIVE APIs');
  console.log('-'.repeat(60));
  await test('DOD Dashboard Stats', '/dod-comprehensive/dashboard/stats');
  await test('DOD Recent Activities', '/dod-comprehensive/activities/recent');
  await test('DOD Notifications', '/dod-comprehensive/notifications');
  await test('DOD Discipline Cases', '/dod-comprehensive/discipline/cases');
  await test('DOD Behavior Points', '/dod-comprehensive/behavior/points');
  await test('DOD Exam Monitoring', '/dod-comprehensive/exams/monitoring');
  await test('DOD Punishments', '/dod-comprehensive/punishments');
  await test('DOD Parent Notifications', '/dod-comprehensive/parent-notifications');
  await test('DOD Students', '/dod-comprehensive/students');
  await test('DOD Student Sheets', '/dod-comprehensive/students/sheets');
  await test('DOD Analytics', '/dod-comprehensive/analytics/dashboard');
  await test('DOD System Health', '/dod-comprehensive/system/health');
  await test('DOD System Alerts', '/dod-comprehensive/system/alerts');

  // DOD PROFILE
  console.log('\n👤 DOD PROFILE APIs');
  console.log('-'.repeat(60));
  await test('Get DOD Profile', '/dod-profile/1');
  await test('Get DOD Activities', '/dod-profile/1/activities');

  // AUTHENTICATION
  console.log('\n🔐 AUTHENTICATION APIs');
  console.log('-'.repeat(60));
  await test('Auth Health Check', '/auth/health');

  // USERS & ROLES
  console.log('\n👥 USER MANAGEMENT APIs');
  console.log('-'.repeat(60));
  await test('Get All Users', '/users');
  await test('Get All Roles', '/roles');

  // TRADES & SERVICES
  console.log('\n🏗️ TRADES & SERVICES APIs');
  console.log('-'.repeat(60));
  await test('Get All Trades', '/trades');
  await test('Get Services', '/services');

  // SPORTS
  console.log('\n⚽ SPORTS APIs');
  console.log('-'.repeat(60));
  await test('Get All Sports', '/sports');
  await test('Get Sports Players', '/sports-players');

  // NEWS & CONTENT
  console.log('\n📰 NEWS & CONTENT APIs');
  console.log('-'.repeat(60));
  await test('Get News Articles', '/news');
  await test('Get Gallery', '/gallery');
  await test('Get Leadership', '/leadership');
  await test('Get Developers', '/developers');

  // ACADEMIC
  console.log('\n📚 ACADEMIC APIs');
  console.log('-'.repeat(60));
  await test('Get Courses', '/courses');
  await test('Get Classes', '/classes');
  await test('Get Exams', '/exams');
  await test('Get Assignments', '/assignments');

  // FINANCE
  console.log('\n💰 FINANCE APIs');
  console.log('-'.repeat(60));
  await test('Get Finance Overview', '/finance');

  // LIBRARY & FACILITIES
  console.log('\n📖 FACILITIES APIs');
  console.log('-'.repeat(60));
  await test('Get Library', '/library');
  await test('Get Hostel', '/hostel');
  await test('Get Transport', '/transport');

  // SEARCH
  console.log('\n🔍 SEARCH APIs');
  console.log('-'.repeat(60));
  await test('Global Search', '/search?q=test');
  await test('Advanced Search', '/advanced-search?q=test');

  // ADMIN
  console.log('\n⚙️ ADMIN APIs');
  console.log('-'.repeat(60));
  await test('Admin Dashboard', '/admin/dashboard');
  await test('Admin Analytics', '/admin/analytics');

  // UNIFIED INTEGRATION
  console.log('\n🌟 UNIFIED INTEGRATION APIs');
  console.log('-'.repeat(60));
  await test('Global Search Integration', '/unified-integration/search?q=test');
  await test('Analytics Integration', '/unified-integration/analytics');
  await test('Notifications Integration', '/unified-integration/notifications');

  // COMPREHENSIVE APIS
  console.log('\n🚀 COMPREHENSIVE APIs');
  console.log('-'.repeat(60));
  await test('Comprehensive Users', '/v1/users');
  await test('Comprehensive Academic', '/v1/academic');
  await test('Comprehensive Finance', '/v1/finance');
  await test('Comprehensive Stock', '/v1/stock');

  // SUMMARY
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);
  
  if (tests.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    tests.errors.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.name}: ${e.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

runAllTests().catch(error => {
  if (error.code === 'ECONNREFUSED') {
    console.log('\n❌ Backend server is not running!');
    console.log('   Start server: npm run dev or START-BACKEND.bat\n');
  } else {
    console.log('\n❌ Test suite error:', error.message);
  }
});
