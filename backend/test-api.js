const fetch = require('node-fetch');

async function testAPI() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg5OTcxNjgsImV4cCI6MTc2OTA4MzU2OH0.1nmf_LoyQPjsKh0TprUZ3MURrcAOHfuhLXQEXaqZFnI';
  
  try {
    console.log('Testing /api/academics/courses endpoint...');
    const response = await fetch('http://localhost:5000/api/academics/courses', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Users API is working!');
      console.log('Found users:', data.users?.length || 0);
    } else {
      console.log('❌ API failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();