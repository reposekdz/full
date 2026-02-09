const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Insert sample student data
    await conn.execute(
      'INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, trade_code, trade_name, level_number, class_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['STU001', 'SOD-2024-001', 'John', 'Mugisha', 'SOD', 'Software Development', 4, 'SOD Level 4', 'active']
    );
    await conn.execute(
      'INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, trade_code, trade_name, level_number, class_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['STU002', 'SOD-2024-002', 'Marie', 'Uwera', 'SOD', 'Software Development', 4, 'SOD Level 4', 'active']
    );
    await conn.execute(
      'INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, trade_code, trade_name, level_number, class_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['STU003', 'BDC-2024-001', 'Pierre', 'Niyonkuru', 'BDC', 'Business Development', 3, 'BDC Level 3', 'active']
    );
    await conn.execute(
      'INSERT INTO global_student_sheets (student_id, student_code, first_name, last_name, trade_code, trade_name, level_number, class_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['STU004', 'AUT-2024-001', 'Grace', 'Mukamana', 'AUT', 'Automotive', 5, 'AUT Level 5', 'active']
    );

    console.log('Inserted 4 sample students');

    const [rows] = await conn.execute('SELECT * FROM global_student_sheets');
    console.log('Total students:', rows.length);
    rows.forEach(s => console.log('-', s.student_id, '-', s.first_name, s.last_name, '-', s.trade_name, 'Level', s.level_number));
  } catch (e) {
    console.log('Insert Error:', e.message);
  }

  await conn.end();
})();
