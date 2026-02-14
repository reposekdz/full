// DOS Dashboard API Tester
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/dos-dashboard';

// Demo token (replace with actual token from login)
const TOKEN = process.env.DOS_TOKEN || 'your-jwt-token-here';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testEndpoints() {
  console.log('🧪 Testing DOS Dashboard API Endpoints...\n');

  const endpoints = [
    {
      name: 'Dashboard Stats',
      method: 'GET',
      url: `${API_BASE_URL}/dashboard/stats`
    },
    {
      name: 'Get Students',
      method: 'GET',
      url: `${API_BASE_URL}/students`
    },
    {
      name: 'Add Student',
      method: 'POST',
      url: `${API_BASE_URL}/students/add`,
      data: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@gardentvet.rw',
        phone: '+250788123456',
        trade_code: 'SOD',
        level_number: 1,
        level_suffix: '',
        guardian_name: 'Mr. Doe',
        guardian_phone: '+250788654321'
      }
    },
    {
      name: 'Get Teachers',
      method: 'GET',
      url: `${API_BASE_URL}/teachers`
    },
    {
      name: 'Add Teacher',
      method: 'POST',
      url: `${API_BASE_URL}/teachers/add`,
      data: {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@gardentvet.rw',
        phone: '+250788111222',
        specialization: 'Mathematics'
      }
    },
    {
      name: 'Get Exams',
      method: 'GET',
      url: `${API_BASE_URL}/exams`
    },
    {
      name: 'Schedule Exam',
      method: 'POST',
      url: `${API_BASE_URL}/exams/schedule`,
      data: {
        exam_name: 'Mid-Term Mathematics',
        subject: 'Mathematics',
        trade_code: 'SOD',
        level_number: 2,
        exam_date: '2024-03-15',
        start_time: '09:00',
        duration: 120,
        room: 'Room 101'
      }
    },
    {
      name: 'Get Timetables',
      method: 'GET',
      url: `${API_BASE_URL}/timetables`
    },
    {
      name: 'Get Report Cards',
      method: 'GET',
      url: `${API_BASE_URL}/report-cards`
    },
    {
      name: 'Get SMS Notifications',
      method: 'GET',
      url: `${API_BASE_URL}/sms/notifications`
    },
    {
      name: 'Send SMS',
      method: 'POST',
      url: `${API_BASE_URL}/sms/send`,
      data: {
        recipient_type: 'students',
        message: 'Reminder: Final examinations start next week. Please prepare your materials.'
      }
    },
    {
      name: 'Get Analytics',
      method: 'GET',
      url: `${API_BASE_URL}/analytics/performance`
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint.name}...`);
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        headers,
        data: endpoint.data || {}
      });
      console.log(`✅ ${endpoint.name}: Success`, response.data.success ? '✓' : '✗');
      if (response.data.stats) {
        console.log('   Stats:', JSON.stringify(response.data.stats, null, 2).substring(0, 100) + '...');
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed - ${error.response?.data?.message || error.message}`);
    }
    console.log('');
  }

  console.log('🏁 Testing complete!');
}

testEndpoints().catch(console.error);
