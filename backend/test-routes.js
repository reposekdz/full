const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testRoutes() {
  console.log('Testing API Routes...\n');
  
  const tests = [
    { name: 'Health Check', url: `${API_URL}/health` },
    { name: 'Get Trades', url: `${API_URL}/auth/trades` },
    { name: 'Services', url: `${API_URL}/services` },
    { name: 'Content News', url: `${API_URL}/content/news` },
    { name: 'Sports Teams', url: `${API_URL}/sports/teams` }
  ];
  
  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✅ ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || error.message}`);
    }
  }
  
  console.log('\n📝 Testing Student Registration...');
  try {
    const studentData = {
      first_name: 'Test',
      last_name: 'Student',
      email: `test${Date.now()}@student.com`,
      phone: '0788888888',
      password: 'test123',
      date_of_birth: '2005-01-01',
      gender: 'Male',
      trade_code: 'SOD',
      level_number: 1,
      address: 'Kigali',
      emergency_contact: '0788888889'
    };
    
    const response = await axios.post(`${API_URL}/auth/student/register`, studentData);
    console.log(`✅ Student Registration: ${response.status} - Student ID: ${response.data.user.student_id}`);
  } catch (error) {
    console.log(`❌ Student Registration: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('\n📝 Testing Parent Registration...');
  try {
    const parentData = {
      first_name: 'Test',
      last_name: 'Parent',
      email: `test${Date.now()}@parent.com`,
      phone: '0788888887',
      password: 'test123',
      address: 'Kigali',
      occupation: 'Engineer',
      relationship: 'father'
    };
    
    const response = await axios.post(`${API_URL}/auth/parent/register`, parentData);
    console.log(`✅ Parent Registration: ${response.status}`);
  } catch (error) {
    console.log(`❌ Parent Registration: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('\n✅ All tests completed!');
}

testRoutes().catch(console.error);
