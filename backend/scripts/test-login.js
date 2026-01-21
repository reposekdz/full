const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'reponsekdz06@gmail.com',
        password: '2026'
      })
    });

    const data = await response.json();
    console.log('Login response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      
      // Test content API with token
      console.log('\n--- Testing content API ---');
      const contentResponse = await fetch('http://localhost:5000/api/content/admin/slides', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const contentData = await contentResponse.json();
      console.log('Content response:', JSON.stringify(contentData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLogin();