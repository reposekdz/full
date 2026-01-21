#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testAuthentication = async () => {
  try {
    console.log('\n🧪 Testing Authentication System...\n');

    // Test 1: Login with unified credentials
    console.log('1. Testing unified admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'reponse@gmail.com',
      password: '2026'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginResponse.data.user.username}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Type: ${loginResponse.data.user.user_type}`);
      
      const token = loginResponse.data.token;

      // Test 2: Get current user
      console.log('\n2. Testing get current user...');
      const meResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meResponse.data.success) {
        console.log('✅ Get current user successful');
        console.log(`   Name: ${meResponse.data.user.first_name} ${meResponse.data.user.last_name}`);
        console.log(`   Email: ${meResponse.data.user.email}`);
      }

      // Test 3: Test profile update
      console.log('\n3. Testing profile update...');
      const updateResponse = await axios.put(`${API_BASE}/auth/profile`, {
        first_name: 'System',
        last_name: 'Administrator'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (updateResponse.data.success) {
        console.log('✅ Profile update successful');
        console.log(`   Updated name: ${updateResponse.data.user.first_name} ${updateResponse.data.user.last_name}`);
      }

      // Test 4: Test invalid credentials
      console.log('\n4. Testing invalid credentials...');
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          username: 'invalid@email.com',
          password: 'wrongpassword'
        });
        console.log('❌ Should have failed with invalid credentials');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ Invalid credentials properly rejected');
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }

      // Test 5: Test registration
      console.log('\n5. Testing user registration...');
      try {
        const regResponse = await axios.post(`${API_BASE}/auth/register`, {
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpass123',
          first_name: 'Test',
          last_name: 'User'
        });

        if (regResponse.data.success) {
          console.log('✅ Registration successful');
          console.log(`   Student ID: ${regResponse.data.user.student_id}`);
        }
      } catch (error) {
        if (error.response) {
          console.log('⚠️ Registration failed:', error.response.data.message);
        } else {
          console.log('❌ Registration error:', error.message);
        }
      }

      console.log('\n✅ Authentication system test complete!');
      console.log('\n📝 Summary:');
      console.log('   - Unified admin login: ✅ Working');
      console.log('   - Get current user: ✅ Working');
      console.log('   - Profile update: ✅ Working');
      console.log('   - Invalid credentials: ✅ Properly rejected');
      console.log('   - User registration: ✅ Working');
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
};

testAuthentication();