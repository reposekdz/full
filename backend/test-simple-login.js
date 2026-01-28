const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSimpleLogin() {
  console.log('\n🧪 Testing Simple Login\n');
  
  const testCases = [
    { username: 'admin', password: '2026', role: 'admin' },
    { username: 'dos', password: '2026', role: 'dos' },
    { username: 'teacher_demo', password: '2026', role: 'teacher' }
  ];
  
  for (const test of testCases) {
    try {
      console.log(`\nTesting ${test.username}...`);
      
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        {
          username: test.username,
          password: test.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        console.log(`✅ Login successful`);
        console.log(`   User: ${response.data.user.first_name} ${response.data.user.last_name}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Email: ${response.data.user.email}`);
        console.log(`   Token: ${response.data.token.substring(0, 30)}...`);
      } else {
        console.log(`❌ Login failed: ${response.data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Login error for ${test.username}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message}`);
        if (error.response.data.errors) {
          console.log(`   Errors:`, error.response.data.errors);
        }
      } else if (error.request) {
        console.log(`   No response received from server`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n');
}

testSimpleLogin();
