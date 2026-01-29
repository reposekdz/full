const {pool} = require('./config/database');

(async()=>{
  try{
    console.log('=== STUDENTS TABLE STRUCTURE ===');
    const [students] = await pool.execute('DESCRIBE students');
    students.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    
    console.log('\n=== TRADES TABLE STRUCTURE ===');
    const [trades] = await pool.execute('DESCRIBE trades');
    trades.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    
    console.log('\n=== LEVELS TABLE STRUCTURE ===');
    const [levels] = await pool.execute('DESCRIBE levels');
    levels.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    
    console.log('\n=== CHECKING FOR GLOBAL_STUDENT_SHEETS ===');
    try {
      const [gss] = await pool.execute('DESCRIBE global_student_sheets');
      gss.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch(e) {
      console.log('  Table does not exist');
    }
    
    console.log('\n=== SAMPLE STUDENTS COUNT ===');
    const [sCount] = await pool.execute('SELECT COUNT(*) as cnt FROM students');
    console.log(`  Students table: ${sCount[0].cnt} records`);
    
    console.log('\n=== SAMPLE TRADES ===');
    const [tList] = await pool.execute('SELECT id, code, name FROM trades LIMIT 5');
    tList.forEach(t => console.log(`  [${t.id}] ${t.code} - ${t.name}`));
    
    console.log('\n=== SAMPLE LEVELS ===');
    const [lList] = await pool.execute('SELECT id, level_number, name FROM levels LIMIT 5');
    lList.forEach(l => console.log(`  [${l.id}] Level ${l.level_number} - ${l.name}`));
    
    process.exit(0);
  }catch(e){
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
