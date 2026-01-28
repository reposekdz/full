const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/advanced-role-features';

const testEndpoints = [
  { name: 'Teacher: Lesson Plan', path: '/teacher/generate-lesson-plan', method: 'POST' },
  { name: 'Accountant: Defaulters', path: '/accountant/fee-defaulters', method: 'GET' },
  { name: 'DOS: Report Card', path: '/dos/report-card-data/1', method: 'GET' },
  { name: 'Admin: Audit Trail', path: '/admin/audit-trail', method: 'GET' }
];

async function validate() {
  console.log('--- Validating Advanced Role Features ---');
  for (const endpoint of testEndpoints) {
    try {
      const url = `${BASE_URL}${endpoint.path}`;
      console.log(`Testing ${endpoint.name} [${endpoint.method}] ${url}...`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(url).catch(err => err.response);
      } else {
        response = await axios.post(url).catch(err => err.response);
      }

      if (response && (response.status === 401 || response.status === 403)) {
        console.log(`✅ ${endpoint.name}: Reachable (Returned ${response.status} as expected without token)`);
      } else if (response && response.status === 200) {
        console.log(`✅ ${endpoint.name}: Success!`);
      } else {
        console.log(`❌ ${endpoint.name}: Failed (Status: ${response ? response.status : 'No response'})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }
}

validate();
