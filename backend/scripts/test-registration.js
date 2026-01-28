const axios = require('axios');

async function testRegistration() {
  console.log('Testing registration endpoint...\n');

  const testData = {
    username: `test_user_${Date.now()}`,
    email: `test${Date.now()}@test.com`,
    password: 'test123456',
    first_name: 'Test',
    last_name: 'User',
    phone: '0788999888'
  };

  try {
    console.log('Sending registration request with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Registration failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegistration();
