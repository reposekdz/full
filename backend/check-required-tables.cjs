const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function checkTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    const requiredTables = [
      'provinces',
      'districts',
      'sectors',
      'cells',
      'villages',
      'application_validation_rules',
      'trades',
      'trade_levels',
      'trades_levels',
      'leadership'
    ];
    
    for (const table of requiredTables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`✅ ${table}: ${count[0].count} records`);
        } else {
          console.log(`❌ ${table}: Table does not exist`);
        }
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkTables();
