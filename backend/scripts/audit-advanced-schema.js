const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function auditSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const tables = [
    'users',
    'classes',
    'subjects',
    'academic_years',
    'grades',
    'fee_payments',
    'fee_structures',
    'enrollments',
    'courses',
    'fee_types'
  ];

  for (const table of tables) {
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      console.log(`\n=== Table: ${table} ===`);
      columns.forEach(col => {
        console.log(`${col.Field} (${col.Type}) ${col.Null === 'YES' ? '' : 'NOT NULL'} ${col.Key} ${col.Default ? 'DEFAULT ' + col.Default : ''}`);
      });

      const [constraints] = await connection.query(`
        SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [process.env.DB_NAME, table]);
      
      if (constraints.length > 0) {
        console.log('--- Constraints ---');
        constraints.forEach(c => {
          console.log(`${c.COLUMN_NAME} -> ${c.REFERENCED_TABLE_NAME}(${c.REFERENCED_COLUMN_NAME}) [${c.CONSTRAINT_NAME}]`);
        });
      }
    } catch (error) {
      console.log(`\n❌ Table: ${table} - ${error.message}`);
    }
  }

  await connection.end();
}

auditSchema();
