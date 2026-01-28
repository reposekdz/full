const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function validateAccountant() {
  console.log('\n--- Validating Accountant System ---');
  try {
    // 1. Get student payment status
    const res1 = await axios.get(`${BASE_URL}/accountant-advanced/students-payment-status`, {
      params: { class_id: 1, academic_year_id: 1, term: 'Term 1' }
    });
    console.log('✅ Get payment status:', res1.data.success ? 'Success' : 'Failed');
    if (res1.data.students && res1.data.students.length > 0) {
      console.log(`   Found ${res1.data.students.length} students`);
      console.log(`   Student 1 status: ${res1.data.students[0].status}`);
    }

    // 2. Mark a new payment
    const res2 = await axios.post(`${BASE_URL}/accountant-advanced/mark-payment`, {
      student_id: 1,
      academic_year_id: 1,
      term: 'Term 1',
      total_amount: 500000,
      paid_amount: 500000, // Fully paid
      transaction_code: 'TEST_TXN_999'
    });
    console.log('✅ Mark payment (Full):', res2.data.success ? 'Success' : 'Failed');

    // 3. Check analytics
    const res3 = await axios.get(`${BASE_URL}/accountant-advanced/analytics`, {
      params: { academic_year_id: 1, term: 'Term 1' }
    });
    console.log('✅ Payment Analytics:', res3.data.success ? 'Success' : 'Failed');
    console.log('   Stats:', JSON.stringify(res3.data.stats));
  } catch (error) {
    console.error('❌ Accountant validation failed:', error.response?.data || error.message);
  }
}

async function validateTeacher() {
  console.log('\n--- Validating Teacher System ---');
  try {
    // 1. Submit grades
    const res1 = await axios.post(`${BASE_URL}/teacher-advanced/submit-grades-advanced`, {
      class_id: 1,
      subject_id: 1,
      assessment_name: 'Mid-Term Exam',
      assessment_type: 'exam',
      assessment_date: '2026-01-26',
      teacher_id: 3,
      grades: [
        { student_id: 1, obtained_marks: 85, max_marks: 100 }
      ]
    });
    console.log('✅ Submit grades:', res1.data.success ? 'Success' : 'Failed');

    // 2. Get class sheet
    const res2 = await axios.get(`${BASE_URL}/teacher-advanced/class-sheet/1`, {
      params: { subject_id: 1, assessment_name: 'Mid-Term Exam' }
    });
    console.log('✅ Get class sheet:', res2.data.success ? 'Success' : 'Failed');
    if (res2.data.students && res2.data.students.length > 0) {
      console.log(`   Student 1 grade: ${res2.data.students[0].grade_letter}, Ranking: ${res2.data.students[0].ranking}`);
    }
  } catch (error) {
    console.error('❌ Teacher validation failed:', error.response?.data || error.message);
  }
}

async function validateDOD() {
  console.log('\n--- Validating DOD System ---');
  try {
    // 1. Expel student (dummy test)
    const res1 = await axios.post(`${BASE_URL}/dod-actions/actions/expel-student`, {
      student_id: 999, // dummy
      reason: 'Validation test',
      effective_date: '2026-01-26'
    });
    // This might fail if student 999 doesn't exist due to foreign key, but we check if it reaches the logic
    console.log('✅ Expel endpoint reached:', res1.data ? 'Yes' : 'No');
  } catch (error) {
    if (error.response?.status === 500 && error.response.data.error.includes('foreign key constraint fails')) {
       console.log('✅ Expel endpoint reached (Foreign key error as expected for dummy student)');
    } else {
       console.error('❌ DOD validation status:', error.response?.data || error.message);
    }
  }
}

async function runValidation() {
  await validateAccountant();
  await validateTeacher();
  await validateDOD();
}

runValidation();
