const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const defaultEmail = 'reponsekldz06@gmail.com';
const defaultPassword = '2026';

const roles = [
  { username: 'admin', role: 'admin' },
  { username: 'headmaster', role: 'headmaster' },
  { username: 'dos', role: 'dos' },
  { username: 'dod', role: 'dod' },
  { username: 'accountant', role: 'accountant' },
  { username: 'stockmanager', role: 'stockmanager' },
  { username: 'patron', role: 'patron' },
  { username: 'advisor', role: 'advisor' },
  { username: 'teacher_demo', role: 'teacher' },
  { username: 'student_demo', role: 'student' },
  { username: 'parent_demo', role: 'parent' }
];

async function testLogin() {
  console.log('🧪 Testing Login for All Roles\n');
  console.log('========================================');
  console.log(`Email: ${defaultEmail}`);
  console.log(`Password: ${defaultPassword}`);
  console.log('========================================\n');

  let successful = 0;
  let failed = 0;

  for (const roleData of roles) {
    try {
      console.log(`Testing ${roleData.username} (${roleData.role})...`);
      
      // Test with email
      const emailResponse = await axios.post(`${API_BASE}/auth/login`, {
        username: defaultEmail,
        password: defaultPassword
      });

      if (emailResponse.data.success && emailResponse.data.token) {
        console.log(`✅ Email login successful for ${roleData.username}`);
        console.log(`   Token: ${emailResponse.data.token.substring(0, 20)}...`);
        console.log(`   User: ${emailResponse.data.user.first_name} ${emailResponse.data.user.last_name}`);
        successful++;
      }

      // Test with username
      const usernameResponse = await axios.post(`${API_BASE}/auth/login`, {
        username: roleData.username,
        password: defaultPassword
      });

      if (usernameResponse.data.success && usernameResponse.data.token) {
        console.log(`✅ Username login successful for ${roleData.username}`);
        console.log(`   Role: ${usernameResponse.data.user.role}`);
      }

      console.log('');
    } catch (error) {
      console.log(`❌ Login failed for ${roleData.username}`);
      if (error.response) {
        console.log(`   Error: ${error.response.data.message || error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
      failed++;
    }
  }

  console.log('========================================');
  console.log(`✅ Successful logins: ${successful}/${roles.length}`);
  console.log(`❌ Failed logins: ${failed}/${roles.length}`);
  console.log('========================================\n');
}

async function testProfileEndpoint() {
  console.log('\n🧪 Testing Profile Endpoints\n');
  console.log('========================================');

  try {
    // Login as admin first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: defaultPassword
    });

    if (!loginResponse.data.success) {
      console.log('❌ Failed to login as admin');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Logged in as admin');
    console.log('');

    // Test get profile
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (profileResponse.data.success) {
      console.log('✅ Profile retrieved successfully');
      console.log('   Profile:', JSON.stringify(profileResponse.data.profile, null, 2));
    }
    console.log('');

    // Test update profile
    const updateResponse = await axios.put(
      `${API_BASE}/auth/profile/update`,
      {
        phone: '+250788999999',
        first_name: 'System',
        last_name: 'Administrator'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (updateResponse.data.success) {
      console.log('✅ Profile updated successfully');
      console.log(`   Changes made: ${updateResponse.data.changes_made}`);
    }

  } catch (error) {
    console.log('❌ Profile endpoint test failed');
    if (error.response) {
      console.log(`   Error: ${error.response.data.message || error.message}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('========================================\n');
}

async function testSerialCodes() {
  console.log('\n🧪 Testing Serial Code Generation\n');
  console.log('========================================');

  try {
    // Login as DOS
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'dos',
      password: defaultPassword
    });

    if (!loginResponse.data.success) {
      console.log('❌ Failed to login as DOS');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Logged in as DOS');
    console.log('');

    // Generate serial codes
    const generateResponse = await axios.post(
      `${API_BASE}/serial-codes/generate`,
      {
        trade_code: 'ICT',
        level_number: 1,
        level_suffix: 'A',
        quantity: 5,
        notes: 'Test serial codes for ICT Level 1A'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (generateResponse.data.success) {
      console.log('✅ Serial codes generated successfully');
      console.log(`   Quantity: ${generateResponse.data.codes.length}`);
      console.log('   Codes:');
      generateResponse.data.codes.forEach((code, index) => {
        console.log(`     ${index + 1}. ${code}`);
      });
    }
    console.log('');

    // Test validation of first code
    if (generateResponse.data.codes.length > 0) {
      const firstCode = generateResponse.data.codes[0];
      const validateResponse = await axios.post(
        `${API_BASE}/serial-codes/validate`,
        { serial_code: firstCode }
      );

      if (validateResponse.data.success && validateResponse.data.valid) {
        console.log(`✅ Serial code validation successful`);
        console.log(`   Code: ${firstCode}`);
        console.log(`   Trade: ${validateResponse.data.code_details.trade_name}`);
        console.log(`   Level: ${validateResponse.data.code_details.level_number}${validateResponse.data.code_details.level_suffix || ''}`);
      }
    }

  } catch (error) {
    console.log('❌ Serial code test failed');
    if (error.response) {
      console.log(`   Error: ${error.response.data.message || error.message}`);
      console.log('   Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('========================================\n');
}

async function runAllTests() {
  try {
    await testLogin();
    await testProfileEndpoint();
    await testSerialCodes();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }
}

runAllTests();
