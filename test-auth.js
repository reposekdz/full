// Open browser console (F12) and paste this to check your authentication:

console.log('=== AUTH DIAGNOSTIC ===');
console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
console.log('Role:', JSON.parse(localStorage.getItem('user') || '{}').role);

// Test API call
fetch('http://localhost:5000/api/global-student-sheets/students?trade_id=AUTO&level_id=5', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  if (data.success) {
    console.log('✅ SUCCESS! Found', data.students?.length || 0, 'students');
  } else {
    console.log('❌ FAILED:', data.message || data.error);
  }
})
.catch(err => console.error('❌ ERROR:', err));
