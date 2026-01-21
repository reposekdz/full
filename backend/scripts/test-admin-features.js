const fetch = require('node-fetch');

let adminToken = '';

async function loginAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'reponsekdz06@gmail.com',
        password: '2026'
      })
    });

    const data = await response.json();
    if (data.success) {
      adminToken = data.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    console.log(`\n📍 Testing: ${name}`);
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.success) {
      console.log(`   ✅ ${name} - SUCCESS`);
      if (data.slides) console.log(`      📊 Found ${data.slides.length} slides`);
      if (data.articles) console.log(`      📰 Found ${data.articles.length} articles`);
      if (data.testimonials) console.log(`      💬 Found ${data.testimonials.length} testimonials`);
      if (data.achievements) console.log(`      🏆 Found ${data.achievements.length} achievements`);
      if (data.stats) console.log(`      📈 Found ${data.stats.length} stats`);
    } else {
      console.log(`   ❌ ${name} - FAILED: ${data.message}`);
    }
    
    return data.success;
  } catch (error) {
    console.log(`   ❌ ${name} - ERROR: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🔍 Testing Admin Management Features\n');
  console.log('=' .repeat(50));

  // Login first
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin login');
    return;
  }

  // Test all admin endpoints
  const tests = [
    ['Get Admin Slides', 'http://localhost:5000/api/content/admin/slides'],
    ['Get Admin News', 'http://localhost:5000/api/content/admin/news'], 
    ['Get Admin Testimonials', 'http://localhost:5000/api/content/admin/testimonials'],
    ['Get Admin Achievements', 'http://localhost:5000/api/content/admin/achievements'],
    ['Get School Stats', 'http://localhost:5000/api/content/stats'],
    ['Get Public Slides', 'http://localhost:5000/api/content/slides'],
    ['Get Public News', 'http://localhost:5000/api/content/news'],
    ['Get Public Testimonials', 'http://localhost:5000/api/content/testimonials'],
    ['Get Public Achievements', 'http://localhost:5000/api/content/achievements'],
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const [name, url] of tests) {
    const success = await testEndpoint(name, url);
    if (success) passedTests++;
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Admin functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the failed endpoints.');
  }
}

runAllTests();