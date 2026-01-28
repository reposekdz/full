
const { pool } = require('./config/database');
async function test() {
  try {
    await pool.execute('INSERT INTO sms_messages (recipient, message, sender_id, status) VALUES (?, ?, ?, ?)', ['+250780000000', 'Test', 0, 'pending']);
    console.log('Success: sender_id 0 works');
  } catch (err) {
    console.log('Failed: ' + err.message);
  }
  process.exit(0);
}
test();
