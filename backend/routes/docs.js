const express = require('express');
const router = express.Router();

const API_DOCS = {
  title: 'School Management System API',
  version: '1.0.0',
  description: 'Comprehensive API for managing school operations',
  baseUrl: 'http://localhost:5000/api',
  endpoints: [
    {
      category: 'Authentication',
      icon: '🔐',
      color: 'from-blue-500 to-blue-600',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/login',
          description: 'Login with email and password',
          body: {
            username: 'reponse@gmail.com',
            password: '2026'
          },
          response: {
            success: true,
            token: 'jwt_token_here',
            user: { id: 1, email: 'reponse@gmail.com', role: 'admin' }
          }
        },
        {
          method: 'GET',
          path: '/auth/me',
          description: 'Get current user info',
          auth: true,
          response: { success: true, user: { id: 1, email: 'reponse@gmail.com' } }
        },
        {
          method: 'PUT',
          path: '/auth/profile',
          description: 'Update user profile',
          auth: true,
          body: { email: 'new@email.com', first_name: 'John', password: 'newpass' },
          response: { success: true, message: 'Profile updated' }
        }
      ]
    },
    {
      category: 'DOS Management',
      icon: '⚖️',
      color: 'from-purple-500 to-purple-600',
      endpoints: [
        {
          method: 'GET',
          path: '/dos/students',
          description: 'Get all students with filters',
          auth: true,
          params: 'class_id, level_id, trade_id, search, status',
          response: { success: true, students: [] }
        },
        {
          method: 'GET',
          path: '/dos/students/:id',
          description: 'Get student details',
          auth: true,
          response: { success: true, student: {} }
        },
        {
          method: 'PUT',
          path: '/dos/students/:id',
          description: 'Update student info',
          auth: true,
          body: { first_name: 'John', class_id: 1 },
          response: { success: true, message: 'Student updated' }
        },
        {
          method: 'GET',
          path: '/dos/classes',
          description: 'Get all classes',
          auth: true,
          response: { success: true, classes: [] }
        },
        {
          method: 'POST',
          path: '/dos/classes',
          description: 'Create new class',
          auth: true,
          body: { name: 'Class A', level_id: 1, capacity: 50 },
          response: { success: true, message: 'Class created', id: 1 }
        },
        {
          method: 'GET',
          path: '/dos/levels',
          description: 'Get all levels',
          auth: true,
          response: { success: true, levels: [] }
        },
        {
          method: 'POST',
          path: '/dos/levels',
          description: 'Create new level',
          auth: true,
          body: { name: 'Level 1', description: 'First level' },
          response: { success: true, message: 'Level created', id: 1 }
        },
        {
          method: 'GET',
          path: '/dos/trades',
          description: 'Get all trades',
          auth: true,
          response: { success: true, trades: [] }
        },
        {
          method: 'POST',
          path: '/dos/trades',
          description: 'Create new trade',
          auth: true,
          body: { name: 'Software Development', code: 'SOD' },
          response: { success: true, message: 'Trade created', id: 1 }
        },
        {
          method: 'GET',
          path: '/dos/teachers',
          description: 'Get all teachers',
          auth: true,
          response: { success: true, teachers: [] }
        },
        {
          method: 'GET',
          path: '/dos/conduct-records',
          description: 'Get conduct records',
          auth: true,
          params: 'student_id, type, status',
          response: { success: true, records: [] }
        },
        {
          method: 'POST',
          path: '/dos/conduct-records',
          description: 'Create conduct record',
          auth: true,
          body: { student_id: 1, type: 'warning', description: 'Late to class', severity: 'low' },
          response: { success: true, message: 'Record created', id: 1 }
        },
        {
          method: 'GET',
          path: '/dos/analytics/overview',
          description: 'Get DOS analytics',
          auth: true,
          response: { success: true, analytics: { totalStudents: 100, totalTeachers: 20 } }
        }
      ]
    },
    {
      category: 'Content Management',
      icon: '📚',
      color: 'from-green-500 to-green-600',
      endpoints: [
        {
          method: 'GET',
          path: '/content/slides',
          description: 'Get home slides',
          response: { success: true, slides: [] }
        },
        {
          method: 'GET',
          path: '/content/news',
          description: 'Get news articles',
          response: { success: true, articles: [] }
        },
        {
          method: 'GET',
          path: '/content/testimonials',
          description: 'Get testimonials',
          response: { success: true, testimonials: [] }
        }
      ]
    },
    {
      category: 'User Management',
      icon: '👥',
      color: 'from-orange-500 to-orange-600',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/register',
          description: 'Register new user',
          body: { username: 'john', email: 'john@example.com', password: 'pass123', first_name: 'John', last_name: 'Doe' },
          response: { success: true, message: 'Registration successful' }
        }
      ]
    }
  ]
};

router.get('/docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${API_DOCS.title} - API Documentation</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
      <style>
        .method-badge {
          font-weight: bold;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
        .method-get { background: #10b981; color: white; }
        .method-post { background: #3b82f6; color: white; }
        .method-put { background: #f59e0b; color: white; }
        .method-delete { background: #ef4444; color: white; }
        .endpoint-card {
          transition: all 0.3s ease;
        }
        .endpoint-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .code-block {
          background: #1f2937;
          color: #e5e7eb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }
        .auth-badge {
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-left: 8px;
        }
      </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div class="min-h-screen">
        <!-- Header -->
        <div class="bg-gradient-to-r from-yellow-500 to-green-500 text-white py-12 shadow-lg">
          <div class="max-w-7xl mx-auto px-6">
            <h1 class="text-4xl font-black mb-2">${API_DOCS.title}</h1>
            <p class="text-white/90 text-lg">${API_DOCS.description}</p>
            <p class="text-white/80 mt-2">Base URL: <code class="bg-white/20 px-3 py-1 rounded">${API_DOCS.baseUrl}</code></p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-white border-b sticky top-0 z-40 shadow">
          <div class="max-w-7xl mx-auto px-6">
            <div class="flex space-x-6 overflow-x-auto">
              ${API_DOCS.endpoints.map((cat, idx) => `
                <button onclick="scrollToCategory(${idx})" class="py-4 px-4 font-semibold text-gray-700 hover:text-yellow-600 border-b-2 border-transparent hover:border-yellow-600 transition whitespace-nowrap">
                  ${cat.icon} ${cat.category}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto px-6 py-12">
          ${API_DOCS.endpoints.map((category, catIdx) => `
            <div id="category-${catIdx}" class="mb-16">
              <div class="flex items-center space-x-3 mb-8">
                <div class="text-4xl">${category.icon}</div>
                <h2 class="text-3xl font-black text-gray-900">${category.category}</h2>
              </div>

              <div class="grid gap-6">
                ${category.endpoints.map((endpoint, idx) => `
                  <div class="endpoint-card bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:border-yellow-400">
                    <div class="bg-gradient-to-r ${category.color} p-6 text-white">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-3">
                          <span class="method-badge method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                          <code class="text-lg font-mono">${endpoint.path}</code>
                          ${endpoint.auth ? '<span class="auth-badge">🔒 Auth Required</span>' : ''}
                        </div>
                      </div>
                      <p class="text-white/90">${endpoint.description}</p>
                    </div>

                    <div class="p-6 space-y-6">
                      ${endpoint.params ? `
                        <div>
                          <h4 class="font-bold text-gray-900 mb-2">Query Parameters:</h4>
                          <p class="text-gray-600 text-sm">${endpoint.params}</p>
                        </div>
                      ` : ''}

                      ${endpoint.body ? `
                        <div>
                          <h4 class="font-bold text-gray-900 mb-2">Request Body:</h4>
                          <div class="code-block">
                            <pre>${JSON.stringify(endpoint.body, null, 2)}</pre>
                          </div>
                        </div>
                      ` : ''}

                      <div>
                        <h4 class="font-bold text-gray-900 mb-2">Response:</h4>
                        <div class="code-block">
                          <pre>${JSON.stringify(endpoint.response, null, 2)}</pre>
                        </div>
                      </div>

                      <button onclick="testEndpoint('${endpoint.method}', '${endpoint.path}', ${JSON.stringify(endpoint.body || {}).replace(/"/g, '&quot;')})" class="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold py-2 px-4 rounded-lg transition">
                        🧪 Test Endpoint
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Test Modal -->
        <div id="testModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-yellow-500 to-green-500 text-white p-6">
              <h3 class="text-2xl font-bold">Test Endpoint</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block font-bold text-gray-900 mb-2">Authorization Token:</label>
                <input type="text" id="tokenInput" placeholder="Paste your JWT token here" class="w-full border-2 border-gray-300 rounded-lg p-3 font-mono text-sm">
              </div>
              <div id="testResult" class="hidden bg-gray-100 p-4 rounded-lg">
                <h4 class="font-bold mb-2">Result:</h4>
                <div class="code-block" id="resultCode"></div>
              </div>
              <div class="flex space-x-3">
                <button onclick="closeTestModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg">Close</button>
                <button onclick="executeTest()" class="flex-1 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold py-2 px-4 rounded-lg">Execute</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        let currentTest = { method: 'GET', path: '', body: {} };

        function scrollToCategory(idx) {
          document.getElementById('category-' + idx).scrollIntoView({ behavior: 'smooth' });
        }

        function testEndpoint(method, path, body) {
          currentTest = { method, path, body };
          document.getElementById('testModal').classList.remove('hidden');
          document.getElementById('testResult').classList.add('hidden');
        }

        function closeTestModal() {
          document.getElementById('testModal').classList.add('hidden');
        }

        async function executeTest() {
          const token = document.getElementById('tokenInput').value;
          const resultDiv = document.getElementById('testResult');
          const resultCode = document.getElementById('resultCode');

          try {
            const config = {
              method: currentTest.method,
              url: '${API_DOCS.baseUrl}' + currentTest.path,
              headers: {}
            };

            if (token) {
              config.headers['Authorization'] = 'Bearer ' + token;
            }

            if (currentTest.method !== 'GET' && Object.keys(currentTest.body).length > 0) {
              config.data = currentTest.body;
            }

            const response = await axios(config);
            resultCode.textContent = JSON.stringify(response.data, null, 2);
            resultDiv.classList.remove('hidden');
          } catch (error) {
            resultCode.textContent = JSON.stringify({
              error: error.response?.data || error.message,
              status: error.response?.status
            }, null, 2);
            resultDiv.classList.remove('hidden');
          }
        }
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

module.exports = router;
