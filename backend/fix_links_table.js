
const { pool } = require('./config/database');
async function run() {
  try {
    const sql = `ALTER TABLE parent_student_links 
      ADD COLUMN student_code VARCHAR(50), 
      ADD COLUMN student_name VARCHAR(200), 
      ADD COLUMN student_class VARCHAR(50), 
      ADD COLUMN trade VARCHAR(100), 
      ADD COLUMN year VARCHAR(20), 
      ADD COLUMN link_code VARCHAR(10), 
      ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', 
      ADD COLUMN requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      ADD COLUMN linked_student_id INT, 
      ADD COLUMN approved_at TIMESTAMP NULL, 
      ADD COLUMN approved_by INT`;
    await pool.execute(sql);
    console.log('Success');
  } catch (err) {
    console.log('Error: ' + err.message);
  }
  process.exit(0);
}
run();
