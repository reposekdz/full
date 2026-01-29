const {pool} = require('./config/database');

(async()=>{
  try{
    const tables = ['fees', 'payments', 'student_fees', 'fee_payments'];
    
    for (const table of tables) {
      try {
        console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
        const [cols] = await pool.execute(`DESCRIBE ${table}`);
        cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
        
        const [count] = await pool.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
        console.log(`  Records: ${count[0].cnt}`);
      } catch(e) {
        console.log(`  Error: ${e.message}`);
      }
    }
    
    process.exit(0);
  }catch(e){
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
