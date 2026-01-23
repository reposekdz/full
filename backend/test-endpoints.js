const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✅ ${name}: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 Testing API Endpoints...\n');
  
  await testEndpoint('Health Check', `${BASE_URL}/health`);
  await testEndpoint('Trades', `${BASE_URL}/trades`);
  await testEndpoint('Services', `${BASE_URL}/services/services`);
  await testEndpoint('Sports Teams', `${BASE_URL}/sports/teams`);
  await testEndpoint('Sports Matches', `${BASE_URL}/sports/matches`);
  await testEndpoint('Upcoming Matches', `${BASE_URL}/sports/matches?upcoming=true`);
  
  console.log('\n✅ All tests complete!\n');
}

runTests();
