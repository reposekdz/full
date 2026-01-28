const axios = require('axios');

async function testStaffLogin() {
  console.log('Testing staff login...\n');

  const testAccounts = [
    { email: 'admin@reponsekdz06.com', role: 'admin' },
    { email: 'teacher1@reponsekdz06.com', role: 'teacher' },
    { email: 'dos@reponsekdz06.com', role: 'dos' }
  ];

  for (const account of testAccounts) {
    try {
      console.log(`Testing ${account.role}...`);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: account.email,  // Send as username (backend accepts email as username)
        password: '2026'
      });

      if (response.data.success) {
        console.log(`✅ ${account.role} login SUCCESS`);
        console.log(`   User: ${response.data.user.first_name} ${response.data.user.last_name}`);
        console.log(`   Role: ${response.data.user.role}\n`);
      }
    } catch (error) {
      console.log(`❌ ${account.role} login FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log(`   Error: ${error.message}\n`);
      }
    }
  }
}

testStaffLogin();
