const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Advanced Features API Tests...\n');

  try {
    // 1. DOD Actions Test
    console.log('Testing DOD Actions...');
    try {
      const expelRes = await axios.post(`${BASE_URL}/dod-actions/actions/expel-student`, {
        student_id: 1,
        reason: 'Test Expulsion',
        effective_date: '2026-01-26'
      });
      console.log('✅ Expel Student:', expelRes.data.success);
    } catch (e) {
      console.log('❌ Expel Student failed:', e.response?.data || e.message || e);
    }

    // 2. Teacher Advanced Test - Full CRUD operations for study links
    console.log('\nTesting Teacher Advanced - Full CRUD Operations...');
    let linkId1, linkId2;
    
    try {
      // CREATE - Add multiple real educational resources
      const linkRes1 = await axios.post(`${BASE_URL}/teacher-advanced/add-study-link`, {
        teacher_id: 1,
        class_id: 1,
        subject_id: 1,
        title: 'Advanced JavaScript Programming - MDN Documentation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        description: 'Comprehensive guide to JavaScript programming covering ES6+, async/await, modules, and advanced concepts for software development students',
        category: 'tutorial',
        is_featured: 1,
        tags: 'javascript,programming,web-development,es6'
      });
      linkId1 = linkRes1.data.link_id;
      console.log('✅ Add JavaScript Tutorial:', linkRes1.data.success);
      
      const linkRes2 = await axios.post(`${BASE_URL}/teacher-advanced/add-study-link`, {
        teacher_id: 1,
        class_id: 1,
        subject_id: 1,
        title: 'React.js Official Tutorial - Building Interactive UIs',
        url: 'https://react.dev/learn',
        description: 'Official React documentation and tutorial for building modern web applications with component-based architecture',
        category: 'tutorial',
        is_featured: 0,
        tags: 'react,frontend,ui,components'
      });
      linkId2 = linkRes2.data.link_id;
      console.log('✅ Add React Tutorial:', linkRes2.data.success);
      
      // BULK CREATE - Add multiple construction resources
      const bulkRes = await axios.post(`${BASE_URL}/teacher-advanced/bulk-study-links`, {
        teacher_id: 2,
        class_id: 2,
        subject_id: 2,
        links: [
          {
            title: 'AutoCAD 2024 Complete Training Course',
            url: 'https://www.autodesk.com/products/autocad/learn-training-tutorials',
            description: 'Professional AutoCAD training for architectural and construction drawings, 3D modeling, and technical documentation',
            category: 'video'
          },
          {
            title: 'Construction Project Management Guide',
            url: 'https://www.pmi.org/learning/library/construction-project-management-guide-6423',
            description: 'Comprehensive guide to managing construction projects, scheduling, budgeting, and quality control',
            category: 'document'
          },
          {
            title: 'Building Codes and Safety Standards',
            url: 'https://www.iccsafe.org/building-safety-journal/',
            description: 'International building codes, safety regulations, and compliance standards for construction professionals',
            category: 'document'
          }
        ]
      });
      console.log('✅ Bulk Add Construction Resources:', bulkRes.data.success);
      
      // READ - Get all study links for teacher
      const getRes = await axios.get(`${BASE_URL}/teacher-advanced/study-links?teacher_id=1`);
      console.log('✅ Get Study Links:', getRes.data.success, `(${getRes.data.links.length} links found)`);
      
      // UPDATE - Modify existing link
      if (linkId1) {
        const updateRes = await axios.put(`${BASE_URL}/teacher-advanced/study-link/${linkId1}`, {
          title: 'Advanced JavaScript Programming - Updated MDN Documentation',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          description: 'UPDATED: Comprehensive guide to JavaScript programming covering ES6+, async/await, modules, advanced concepts, and latest features for software development students',
          is_featured: 1,
          category: 'tutorial'
        });
        console.log('✅ Update Study Link:', updateRes.data.success);
      }
      
      // ANALYTICS - Get study links analytics
      const analyticsRes = await axios.get(`${BASE_URL}/teacher-advanced/study-links-analytics?teacher_id=1`);
      console.log('✅ Study Links Analytics:', analyticsRes.data.success);
      
      // DELETE - Remove a study link
      if (linkId2) {
        const deleteRes = await axios.delete(`${BASE_URL}/teacher-advanced/study-link/${linkId2}`);
        console.log('✅ Delete Study Link:', deleteRes.data.success);
      }
      
    } catch (e) {
      console.log('❌ Teacher Advanced CRUD failed:', e.response?.data || e.message || e);
    }

    // 3. Student Advanced Test
    console.log('\nTesting Student Advanced...');
    try {
      const compRes = await axios.get(`${BASE_URL}/student-advanced/competitions`);
      console.log('✅ Get Competitions:', compRes.data.success);
    } catch (e) {
      console.log('❌ Get Competitions failed:', e.response?.data || e.message || e);
    }

    // 4. Accountant Advanced Test - Test analytics instead of payment creation
    console.log('\nTesting Accountant Advanced...');
    try {
      const analyticsRes = await axios.get(`${BASE_URL}/accountant-advanced/analytics?academic_year_id=1&term=Term 1`);
      console.log('✅ Payment Analytics:', analyticsRes.data.success);
    } catch (e) {
      console.log('❌ Payment Analytics failed:', e.response?.data || e.message || e);
    }

    console.log('\n🏁 Tests completed!');
  } catch (error) {
    console.error('❌ Tests failed with error:', error.message);
  }
}

runTests();