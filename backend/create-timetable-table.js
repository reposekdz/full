const { pool } = require('./config/database');

async function createTimetableTable() {
  try {
    console.log('Creating timetable_entries table...\n');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS timetable_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        day_of_week VARCHAR(20) NOT NULL,
        period_number INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        venue VARCHAR(255),
        week_start_date DATE,
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_class_day (class_id, day_of_week),
        INDEX idx_teacher_day (teacher_id, day_of_week),
        INDEX idx_week (week_start_date),
        UNIQUE KEY unique_class_schedule (class_id, day_of_week, period_number, week_start_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('✅ timetable_entries table created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

createTimetableTable();
