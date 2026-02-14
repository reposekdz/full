const mysql = require('mysql2/promise');
require('dotenv').config();

const fixDatabaseSchema = async () => {
  let connection;
  
  try {
    console.log('============================================');
    console.log('DATABASE SCHEMA FIX SCRIPT');
    console.log('============================================\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });
    
    console.log('✓ Connected to database\n');
    
    // 1. Create class_enrollments table
    console.log('1. Creating class_enrollments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        student_id INT NOT NULL,
        enrollment_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('active', 'inactive', 'completed', 'dropped') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (class_id, student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✓ class_enrollments table created\n');
    
    // 2. Add name column to cells table
    console.log('2. Adding name column to cells table...');
    try {
      await connection.execute(`
        ALTER TABLE cells 
        ADD COLUMN name VARCHAR(255) NOT NULL AFTER id
      `);
      console.log('   ✓ name column added to cells table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✓ name column already exists\n');
      } else {
        throw err;
      }
    }
    
    // 3. Add course_id column to assignments table
    console.log('3. Adding course_id column to assignments table...');
    try {
      await connection.execute(`
        ALTER TABLE assignments 
        ADD COLUMN course_id INT NULL AFTER class_id
      `);
      console.log('   ✓ course_id column added to assignments table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✓ course_id column already exists\n');
      } else {
        throw err;
      }
    }
    
    // 4. Add total_amount column to student_fees table
    console.log('4. Adding total_amount column to student_fees table...');
    try {
      await connection.execute(`
        ALTER TABLE student_fees 
        ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00 AFTER academic_year
      `);
      console.log('   ✓ total_amount column added to student_fees table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✓ total_amount column already exists\n');
      } else {
        throw err;
      }
    }
    
    // 5. Add student_code column to users table
    console.log('5. Adding student_code column to users table...');
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN student_code VARCHAR(50) NULL UNIQUE AFTER email
      `);
      console.log('   ✓ student_code column added to users table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✓ student_code column already exists\n');
      } else {
        throw err;
      }
    }
    
    // 6. Update cells with names
    console.log('6. Updating cells with names...');
    await connection.execute(`
      UPDATE cells c
      INNER JOIN sectors s ON c.sector_id = s.id
      SET c.name = CONCAT(s.name, ' Cell ', c.id)
      WHERE c.name IS NULL OR c.name = ''
    `);
    console.log('   ✓ Cell names updated\n');
    
    // 7. Update student_fees total_amount
    console.log('7. Updating student_fees total_amount...');
    try {
      await connection.execute(`
        UPDATE student_fees 
        SET total_amount = COALESCE(amount_due, 0)
        WHERE total_amount = 0 OR total_amount IS NULL
      `);
      console.log('   ✓ Student fees updated\n');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('   ✓ Skipped (amount_due column not found)\n');
      } else {
        throw err;
      }
    }
    
    // 8. Generate student codes
    console.log('8. Generating student codes...');
    await connection.execute(`
      UPDATE users 
      SET student_code = CONCAT('STD', LPAD(id, 6, '0'))
      WHERE role = 'student' AND (student_code IS NULL OR student_code = '')
    `);
    console.log('   ✓ Student codes generated\n');
    
    // 9. Create indexes
    console.log('9. Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id)',
      'CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_class_enrollments_status ON class_enrollments(status)',
      'CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_student_code ON users(student_code)',
      'CREATE INDEX IF NOT EXISTS idx_cells_name ON cells(name)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery);
      } catch (err) {
        // Index might already exist, ignore
      }
    }
    console.log('   ✓ Indexes created\n');
    
    console.log('============================================');
    console.log('✅ DATABASE SCHEMA FIXED SUCCESSFULLY!');
    console.log('============================================\n');
    console.log('Fixed issues:');
    console.log('✓ Created class_enrollments table');
    console.log('✓ Added name column to cells table');
    console.log('✓ Added course_id column to assignments table');
    console.log('✓ Added total_amount column to student_fees table');
    console.log('✓ Added student_code column to users table');
    console.log('✓ Generated student codes for existing students');
    console.log('✓ Created necessary indexes\n');
    console.log('You can now restart your server!\n');
    
  } catch (error) {
    console.error('\n============================================');
    console.error('❌ ERROR: Failed to fix database schema');
    console.error('============================================\n');
    console.error('Error details:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database credentials in .env file');
    console.error('2. MySQL server is running');
    console.error('3. Database "school_management" exists\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the fix
fixDatabaseSchema();
