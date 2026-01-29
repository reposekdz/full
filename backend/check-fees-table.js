const {pool} = require('./config/database');

(async()=>{
  try{
    console.log('=== STUDENT_FEES TABLE STRUCTURE ===');
    const [fees] = await pool.execute('DESCRIBE student_fees');
    fees.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    
    console.log('\n=== SAMPLE FEE RECORDS ===');
    const [samples] = await pool.execute('SELECT * FROM student_fees LIMIT 3');
    console.log(`  Total records: ${samples.length}`);
    if (samples.length > 0) {
      console.log('  Columns:', Object.keys(samples[0]).join(', '));
    }
    
    process.exit(0);
  }catch(e){
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
