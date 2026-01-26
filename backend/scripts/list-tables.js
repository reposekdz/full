const { pool } = require('../config/database');

async function listAllTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('\n=== DATABASE TABLES ===\n');
    
    const tableNames = tables.map(t => Object.values(t)[0]);
    tableNames.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });
    
    console.log(`\nTotal: ${tableNames.length} tables\n`);
    
    // Get details for each table
    console.log('\n=== TABLE STRUCTURES ===\n');
    for (const tableName of tableNames) {
      const [columns] = await pool.query(`DESCRIBE ${tableName}`);
      console.log(`\n${tableName}:`);
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Key ? '[' + col.Key + ']' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

listAllTables();
