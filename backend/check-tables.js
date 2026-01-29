const {pool} = require('./config/database');

(async()=>{
  try{
    const [r]=await pool.execute('SHOW TABLES');
    console.log('Fee/Payment-related tables:');
    r.filter(t=>Object.values(t)[0].toLowerCase().includes('fee') || Object.values(t)[0].toLowerCase().includes('payment'))
     .forEach(t=>console.log('  -', Object.values(t)[0]));
    
    process.exit(0);
  }catch(e){
    console.error(e.message);
    process.exit(1);
  }
})();
