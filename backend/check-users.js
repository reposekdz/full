const {pool} = require('./config/database');

(async()=>{
  try{
    console.log('=== USERS TABLE STRUCTURE ===');
    const [users] = await pool.execute('DESCRIBE users');
    users.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    
    console.log('\n=== USERS WITH STUDENT ROLE ===');
    const [studentUsers] = await pool.execute('SELECT COUNT(*) as cnt FROM users WHERE role = "student"');
    console.log(`  Total students in users table: ${studentUsers[0].cnt}`);
    
    if (studentUsers[0].cnt > 0) {
      console.log('\n=== SAMPLE STUDENT USERS ===');
      const [samples] = await pool.execute('SELECT id, first_name, last_name, email, student_id FROM users WHERE role = "student" LIMIT 5');
      samples.forEach(s => console.log(`  [${s.id}] ${s.first_name} ${s.last_name} (${s.student_id})`));
    }
    
    console.log('\n=== ENROLLMENTS TABLE ===');
    try {
      const [enr] = await pool.execute('DESCRIBE enrollments');
      enr.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
      
      const [eCount] = await pool.execute('SELECT COUNT(*) as cnt FROM enrollments');
      console.log(`\n  Total enrollments: ${eCount[0].cnt}`);
    } catch(e) {
      console.log('  Table does not exist or error:', e.message);
    }
    
    console.log('\n=== TRADE_CLASSES TABLE ===');
    try {
      const [tc] = await pool.execute('DESCRIBE trade_classes');
      tc.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch(e) {
      console.log('  Error:', e.message);
    }
    
    process.exit(0);
  }catch(e){
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
