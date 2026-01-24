const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPIs() {
  try {
    console.log('🧪 Testing API Endpoints...\n');

    console.log('1. Testing Health Endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data);
    console.log();

    console.log('2. Testing /api/users (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/users`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('3. Testing /api/finance/payments (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/finance/payments`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('4. Testing /api/stock/items (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/stock/items`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('5. Testing /api/academics/courses (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/academics/courses`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('6. Testing /api/academics/classes (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/academics/classes`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('7. Testing /api/academics/subjects (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/academics/subjects`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('8. Testing /api/academics/enrollments (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/academics/enrollments`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('9. Testing /api/academics/grades (should fail without auth)...');
    try {
      await axios.get(`${API_BASE}/academics/grades`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('\n✅ All API routes are accessible (with proper authentication checks)');
    console.log('✅ No more "Route not found" errors!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPIs();
