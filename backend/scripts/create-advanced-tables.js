const fs = require('fs');
const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('Creating advanced tables...');
    
    const sql = fs.readFileSync('./create-advanced-tables.sql', 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await pool.execute(statement);
        console.log('✅ Executed statement');
      } catch (error) {
        if (error.code !== 'ER_TABLE_EXISTS_ERR') {
          console.error('❌ Error executing statement:', error.message);
        }
      }
    }
    
    console.log('\n✅ All advanced tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

createTables();
