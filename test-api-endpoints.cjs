const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const endpoints = [
    { name: 'Health Check', url: `${BASE_URL}/health` },
    { name: 'Trades', url: `${BASE_URL}/trades` },
    { name: 'Levels', url: `${BASE_URL}/levels/levels` },
    { name: 'Provinces', url: `${BASE_URL}/locations/provinces` },
    { name: 'Validation Rules', url: `${BASE_URL}/locations/validation-rules` },
    { name: 'Leadership', url: `${BASE_URL}/leadership` }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name}: Server not running`);
      } else if (error.response) {
        console.log(`❌ ${endpoint.name}: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }
}

testEndpoints();