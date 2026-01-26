const { pool } = require('./config/database');

async function checkTable() {
  const [columns] = await pool.execute('DESCRIBE messages');
  console.log('\nMessages Table Structure:\n');
  console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));
  process.exit(0);
}

checkTable().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
