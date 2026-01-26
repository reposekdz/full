const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
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
    req.end();
  });
}

async function testDevelopersAPI() {
  console.log('🧪 TESTING DEVELOPERS API...\n');

  const endpoints = [
    '/api/developers',
    '/api/developers/team',
    '/api/developers-api',
    '/api/developers-api/team'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await testAPI(endpoint);
      
      if (result.status === 200 && result.data.success) {
        const devs = result.data.developers || result.data.data || [];
        console.log(`   ✅ SUCCESS: ${devs.length} developers found`);
        if (devs.length > 0) {
          devs.forEach((dev, i) => {
            console.log(`      ${i+1}. ${dev.name} - ${dev.role}`);
          });
        }
      } else {
        console.log(`   ❌ FAILED: ${result.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 API TESTING COMPLETED!');
}

testDevelopersAPI();