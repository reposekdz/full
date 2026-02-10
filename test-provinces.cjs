const axios = require('axios');

async function testProvinces() {
  try {
    const response = await axios.get('http://localhost:5000/api/locations/provinces');
    console.log('✅ Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testProvinces();
