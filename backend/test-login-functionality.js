const http = require('http');

function testLogin(username, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ username, password });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAllLogins() {
  console.log('🧪 TESTING LOGIN FUNCTIONALITY...\n');

  const testCredentials = [
    { username: 'admin', password: 'admin123', expectedRole: 'super_admin' },
    { username: 'headmaster', password: 'headmaster123', expectedRole: 'headmaster' },
    { username: 'teacher1', password: 'teacher123', expectedRole: 'teacher' },
    { username: 'accountant', password: 'accountant123', expectedRole: 'accountant' },
    { username: 'dod', password: 'dod123', expectedRole: 'dod' }
  ];

  for (const cred of testCredentials) {
    try {
      console.log(`Testing ${cred.username}...`);
      const result = await testLogin(cred.username, cred.password);
      
      if (result.status === 200 && result.data.success) {
        const user = result.data.user;
        console.log(`   ✅ SUCCESS: ${user.username} (${user.role})`);
        console.log(`      Token: ${result.data.token ? 'Generated' : 'Missing'}`);
        console.log(`      Name: ${user.first_name} ${user.last_name}`);
      } else {
        console.log(`   ❌ FAILED: ${result.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  // Test invalid login
  console.log('Testing invalid credentials...');
  try {
    const result = await testLogin('invalid', 'wrong');
    if (result.status === 401) {
      console.log('   ✅ Invalid login properly rejected');
    } else {
      console.log('   ❌ Invalid login should be rejected');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log('\n🎉 LOGIN TESTING COMPLETED!');
  console.log('\nIf all tests passed, staff management login is now working.');
  console.log('Make sure to restart the backend server if it\'s running.');
}

testAllLogins();