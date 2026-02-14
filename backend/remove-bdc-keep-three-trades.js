const mysql = require('mysql2/promise');
require('dotenv').config();

const removeExtraTrades = async () => {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('  REMOVING EXTRA TRADES - KEEPING ONLY BDC, AUT, SOD');
    console.log('='.repeat(70) + '\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });
    
    console.log('✓ Database connected\n');
    
    // Delete all trades except BDC, AUT, SOD
    const [result] = await connection.execute(`
      DELETE FROM trades 
      WHERE code NOT IN ('BDC', 'AUT', 'SOD')
    `);
    
    console.log(`✓ Removed ${result.affectedRows} trades\n`);
    
    // Show remaining trades
    const [trades] = await connection.execute(`
      SELECT code, name FROM trades ORDER BY code
    `);
    
    console.log('Remaining Trades:');
    trades.forEach(trade => {
      console.log(`  • ${trade.code} - ${trade.name}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ CLEANUP COMPLETE!');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message, '\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

removeExtraTrades();
