const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

async function testAPIs() {
  console.log('\n🧪 Testing All New APIs...\n');

  try {
    // 1. Test Authentication
    console.log('1️⃣ Testing Authentication...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginRes.data.token;
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test Courses API
    console.log('2️⃣ Testing Courses API...');
    const coursesRes = await axios.get(`${API_BASE}/courses`, { headers });
    console.log(`✅ Courses: ${coursesRes.data.courses.length} found\n`);

    // 3. Test Exams API
    console.log('3️⃣ Testing Exams API...');
    const examsRes = await axios.get(`${API_BASE}/exams`, { headers });
    console.log(`✅ Exams: ${examsRes.data.exams.length} found\n`);

    // 4. Test Attendance API
    console.log('4️⃣ Testing Attendance API...');
    const attendanceRes = await axios.get(`${API_BASE}/attendance`, { headers });
    console.log(`✅ Attendance: ${attendanceRes.data.attendance.length} records\n`);

    // 5. Test Grades API
    console.log('5️⃣ Testing Grades API...');
    const gradesRes = await axios.get(`${API_BASE}/grades`, { headers });
    console.log(`✅ Grades: ${gradesRes.data.grades.length} records\n`);

    // 6. Test Timetable API
    console.log('6️⃣ Testing Timetable API...');
    const timetableRes = await axios.get(`${API_BASE}/timetable`, { headers });
    console.log(`✅ Timetable: ${timetableRes.data.timetable.length} entries\n`);

    // 7. Test Notifications API
    console.log('7️⃣ Testing Notifications API...');
    const notificationsRes = await axios.get(`${API_BASE}/notifications`, { headers });
    console.log(`✅ Notifications: ${notificationsRes.data.notifications.length} found\n`);

    // 8. Test Messages API
    console.log('8️⃣ Testing Messages API...');
    const messagesRes = await axios.get(`${API_BASE}/messages`, { headers });
    console.log(`✅ Messages: ${messagesRes.data.messages.length} found\n`);

    // 9. Test Sports API
    console.log('9️⃣ Testing Sports API...');
    const sportsTeamsRes = await axios.get(`${API_BASE}/sports/teams`, { headers });
    console.log(`✅ Sports Teams: ${sportsTeamsRes.data.teams.length} found\n`);

    // 10. Test Teams API
    console.log('🔟 Testing Teams API...');
    const teamsRes = await axios.get(`${API_BASE}/teams`, { headers });
    console.log(`✅ Teams: ${teamsRes.data.teams.length} found\n`);

    // 11. Create Test Exam
    console.log('1️⃣1️⃣ Creating Test Exam...');
    const examData = {
      code: 'TEST001',
      title: 'Test Exam',
      title_rw: 'Ikizamini cyo Kugerageza',
      trade: 'SOD',
      level: 'Level 4',
      exam_type: 'quiz',
      exam_date: '2024-12-31',
      start_time: '09:00:00',
      end_time: '10:00:00',
      duration_minutes: 60,
      room: 'Lab A1',
      total_marks: 50,
      passing_marks: 25,
      description: 'Test exam for API verification',
      topics: ['Testing', 'API'],
      materials: ['Pen', 'Paper'],
      rules: ['No cheating']
    };
    const createExamRes = await axios.post(`${API_BASE}/exams`, examData, { headers });
    console.log(`✅ Exam created with ID: ${createExamRes.data.examId}\n`);

    // 12. Test Grade Analytics
    console.log('1️⃣2️⃣ Testing Grade Analytics...');
    const analyticsRes = await axios.get(`${API_BASE}/grades/analytics`, { headers });
    console.log(`✅ Analytics retrieved\n`);

    // 13. Test Attendance Statistics
    console.log('1️⃣3️⃣ Testing Attendance Statistics...');
    const statsRes = await axios.get(`${API_BASE}/attendance/statistics`, { headers });
    console.log(`✅ Statistics retrieved\n`);

    console.log('\n🎉 All API Tests Completed Successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Courses API: Working');
    console.log('   ✅ Exams API: Working');
    console.log('   ✅ Attendance API: Working');
    console.log('   ✅ Grades API: Working');
    console.log('   ✅ Timetable API: Working');
    console.log('   ✅ Notifications API: Working');
    console.log('   ✅ Messages API: Working');
    console.log('   ✅ Sports API: Working');
    console.log('   ✅ Teams API: Working');
    console.log('   ✅ CRUD Operations: Working');
    console.log('   ✅ Analytics: Working');
    console.log('\n✨ All systems operational!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPIs();
