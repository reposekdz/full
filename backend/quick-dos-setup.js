const mysql = require('mysql2/promise');

async function setup() {
  let connection;
  
  try {
    console.log('DOS ADVANCED MANAGEMENT SETUP\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management'
    });
    
    console.log('✓ Connected\n');
    
    // Drop existing tables
    console.log('[1/5] Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS dos_action_logs');
    await connection.query('DROP TABLE IF EXISTS class_subject_schedule');
    await connection.query('DROP TABLE IF EXISTS teacher_workload');
    await connection.query('DROP TABLE IF EXISTS teacher_subject_assignments');
    await connection.query('DROP TABLE IF EXISTS subject_trade_assignments');
    await connection.query('DROP TABLE IF EXISTS subjects');
    console.log('✓ Dropped\n');
    
    // Create subjects table
    console.log('[2/5] Creating subjects table...');
    await connection.query(`
      CREATE TABLE subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_code VARCHAR(50) UNIQUE NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        subject_type ENUM('trade_specific', 'general_studies') DEFAULT 'trade_specific',
        description TEXT,
        credit_hours INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created\n');
    
    // Insert subjects
    console.log('[3/5] Inserting 42 subjects...');
    const subjects = [
      ['GS001', 'English Language', 'general_studies', 4],
      ['GS002', 'Kinyarwanda', 'general_studies', 3],
      ['GS003', 'Mathematics', 'general_studies', 4],
      ['GS004', 'Physics', 'general_studies', 3],
      ['GS005', 'Chemistry', 'general_studies', 3],
      ['GS006', 'Entrepreneurship', 'general_studies', 2],
      ['GS007', 'ICT Basics', 'general_studies', 2],
      ['GS008', 'Civic Education', 'general_studies', 2],
      ['GS009', 'Physical Education', 'general_studies', 2],
      ['GS010', 'Life Skills', 'general_studies', 2],
      ['AUT001', 'Engine Systems', 'trade_specific', 6],
      ['AUT002', 'Electrical Systems', 'trade_specific', 5],
      ['AUT003', 'Transmission Systems', 'trade_specific', 5],
      ['AUT004', 'Brake Systems', 'trade_specific', 4],
      ['AUT005', 'Suspension & Steering', 'trade_specific', 4],
      ['AUT006', 'Automotive Diagnostics', 'trade_specific', 5],
      ['AUT007', 'Fuel Systems', 'trade_specific', 4],
      ['AUT008', 'Air Conditioning', 'trade_specific', 3],
      ['AUT009', 'Automotive Workshop Practice', 'trade_specific', 6],
      ['AUT010', 'Vehicle Maintenance', 'trade_specific', 4],
      ['BDC001', 'Building Construction Technology', 'trade_specific', 6],
      ['BDC002', 'Structural Design', 'trade_specific', 5],
      ['BDC003', 'Construction Materials', 'trade_specific', 4],
      ['BDC004', 'Surveying', 'trade_specific', 5],
      ['BDC005', 'Concrete Technology', 'trade_specific', 4],
      ['BDC006', 'Masonry & Bricklaying', 'trade_specific', 5],
      ['BDC007', 'Carpentry & Joinery', 'trade_specific', 5],
      ['BDC008', 'Plumbing Systems', 'trade_specific', 4],
      ['BDC009', 'Electrical Installation', 'trade_specific', 4],
      ['BDC010', 'Construction Drawing', 'trade_specific', 5],
      ['BDC011', 'Quantity Surveying', 'trade_specific', 4],
      ['BDC012', 'Construction Site Management', 'trade_specific', 3],
      ['SOD001', 'Programming Fundamentals', 'trade_specific', 6],
      ['SOD002', 'Web Development', 'trade_specific', 6],
      ['SOD003', 'Database Management', 'trade_specific', 5],
      ['SOD004', 'Object-Oriented Programming', 'trade_specific', 6],
      ['SOD005', 'Mobile App Development', 'trade_specific', 5],
      ['SOD006', 'Software Engineering', 'trade_specific', 4],
      ['SOD007', 'Data Structures & Algorithms', 'trade_specific', 5],
      ['SOD008', 'Network & Security', 'trade_specific', 4],
      ['SOD009', 'UI/UX Design', 'trade_specific', 4],
      ['SOD010', 'Cloud Computing', 'trade_specific', 4]
    ];
    
    for (const [code, name, type, credits] of subjects) {
      await connection.query(
        'INSERT INTO subjects (subject_code, subject_name, subject_type, credit_hours) VALUES (?,?,?,?)',
        [code, name, type, credits]
      );
    }
    console.log('✓ Inserted\n');
    
    // Create other tables
    console.log('[4/5] Creating other tables...');
    await connection.query(`
      CREATE TABLE subject_trade_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        trade_code VARCHAR(50) NOT NULL,
        level_number INT NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        academic_year VARCHAR(20),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE teacher_subject_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        subject_id INT NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        trade_code VARCHAR(50) NOT NULL,
        level_number INT NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE class_subject_schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_code VARCHAR(50) NOT NULL,
        level_number INT NOT NULL,
        subject_id INT NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
        period_number INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        term VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE teacher_workload (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT NOT NULL,
        teacher_name VARCHAR(255) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        total_subjects INT DEFAULT 0,
        total_classes INT DEFAULT 0,
        workload_percentage DECIMAL(5,2) DEFAULT 0,
        status ENUM('underloaded', 'optimal', 'overloaded') DEFAULT 'optimal'
      )
    `);
    
    await connection.query(`
      CREATE TABLE dos_action_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        dos_id INT NOT NULL,
        dos_name VARCHAR(255) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        action_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created\n');
    
    // Assign subjects
    console.log('[5/5] Assigning subjects to trades...');
    const [allSubjects] = await connection.query('SELECT * FROM subjects');
    
    const trades = [
      ['AUT', [4, 5]],
      ['BDC', [3, 4, 5]],
      ['SOD', [3, 4, 5]]
    ];
    
    for (const [trade, levels] of trades) {
      for (const level of levels) {
        for (const subject of allSubjects) {
          if (subject.subject_type === 'general_studies' || subject.subject_code.startsWith(trade)) {
            await connection.query(
              'INSERT INTO subject_trade_assignments (subject_id, subject_code, subject_name, trade_code, level_number, academic_year) VALUES (?,?,?,?,?,?)',
              [subject.id, subject.subject_code, subject.subject_name, trade, level, '2025']
            );
          }
        }
      }
    }
    
    const [[{ count }]] = await connection.query('SELECT COUNT(*) as count FROM subject_trade_assignments');
    console.log(`✓ ${count} assignments\n`);
    
    console.log('✅ COMPLETE!\n');
    console.log('Next: Add to server.js:');
    console.log('const dosAdvanced = require(\'./routes/dos-advanced-management\');');
    console.log('app.use(\'/api/dos-advanced\', dosAdvanced);\n');
    
  } catch (error) {
    console.error('❌', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setup();
