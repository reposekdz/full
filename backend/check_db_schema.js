
const { pool } = require('./config/database');

async function checkTables() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Tables in database:');
    console.log(tables.map(t => Object.values(t)[0]));

    const [createTable] = await pool.execute('SHOW CREATE TABLE sms_messages');
    console.log('\nsms_messages CREATE TABLE:');
    console.log(createTable[0]['Create Table']);

    const [count] = await pool.execute('SELECT COUNT(*) as count FROM parent_student_links');
    console.log(`\nparent_student_links count: ${count[0].count}`);

    const tablesToCheck = ['users', 'staff', 'parent_student', 'parent_student_links', 'parents', 'students'];
    for (const table of tablesToCheck) {
      try {
        const [exists] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
        if (exists.length > 0) {
          const [columns] = await pool.execute(`DESCRIBE ${table}`);
          console.log(`\n${table} columns:`);
          console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
        } else {
          console.log(`\n${table} table does NOT exist.`);
        }
      } catch (err) {
        console.log(`\nError checking ${table}: ${err.message}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
