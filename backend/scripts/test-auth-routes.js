const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testRoutes() {
  console.log('Testing Authentication Routes...\n');

  // Test 1: Student Login Route
  console.log('1. Testing Student Login Route...');
  try {
    const response = await axios.post(`${BASE_URL}/login/student`, {
      serial_code: 'STD2024001',
      password: 'student123'
    });
    console.log('✅ Student login route exists');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('✅ Student login route exists (returned error response)');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('❌ Student login route NOT FOUND');
      console.log('Error:', error.message);
    }
  }

  console.log('\n2. Testing Parent Login Route...');
  try {
    const response = await axios.post(`${BASE_URL}/login/parent`, {
      phone: '+250788123456',
      password: 'parent123'
    });
    console.log('✅ Parent login route exists');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('✅ Parent login route exists (returned error response)');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('❌ Parent login route NOT FOUND');
      console.log('Error:', error.message);
    }
  }

  console.log('\n3. Testing Standard Login Route...');
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      username: 'test@example.com',
      password: 'test123'
    });
    console.log('✅ Standard login route exists');
  } catch (error) {
    if (error.response) {
      console.log('✅ Standard login route exists (returned error response)');
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Standard login route NOT FOUND');
    }
  }

  console.log('\n✅ Route testing complete!');
  console.log('\nIf routes are not found, restart the backend server:');
  console.log('1. Stop server: Ctrl+C');
  console.log('2. Start server: npm start or node server.js');
}

testRoutes();
