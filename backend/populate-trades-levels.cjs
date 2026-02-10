const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function populateTradesLevels() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Get all trades
    const [trades] = await connection.execute('SELECT code FROM trades');
    
    console.log(`Found ${trades.length} trades\n`);
    
    // Insert levels 1-4 for each trade
    for (const trade of trades) {
      for (let level = 1; level <= 4; level++) {
        await connection.execute(`
          INSERT IGNORE INTO trades_levels (trade_code, level_number, level_suffix, description, is_active)
          VALUES (?, ?, '', ?, TRUE)
        `, [trade.code, level, `Level ${level} - ${trade.code}`]);
      }
      console.log(`✅ Added levels for ${trade.code}`);
    }
    
    console.log('\n========================================');
    console.log('✅ Trades levels populated successfully!');
    console.log('========================================');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
  }
}

populateTradesLevels();
