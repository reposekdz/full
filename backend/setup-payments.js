const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('========================================');
  console.log('PAYMENT MANAGEMENT SYSTEM - DATABASE SETUP');
  console.log('========================================\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✓ Connected to database\n');

    // Step 1: Create payment_columns table
    console.log('Step 1: Creating payment_columns table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_columns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        term VARCHAR(50) DEFAULT 'Term 1',
        academic_year VARCHAR(10) DEFAULT '2024',
        due_date DATE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_term (term, academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ payment_columns table created\n');

    // Step 2: Create student_payments table
    console.log('Step 2: Creating student_payments table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        column_id INT NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(50) DEFAULT 'cash',
        reference_number VARCHAR(100),
        payment_date DATE,
        recorded_by INT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE KEY unique_payment (student_id, column_id),
        INDEX idx_student (student_id),
        INDEX idx_column (column_id),
        INDEX idx_date (payment_date),
        FOREIGN KEY (column_id) REFERENCES payment_columns(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ student_payments table created\n');

    // Step 3: Create payment_history table
    console.log('Step 3: Creating payment_history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        column_id INT,
        amount DECIMAL(12,2) NOT NULL,
        action VARCHAR(50) NOT NULL,
        performed_by INT,
        performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        old_value DECIMAL(12,2),
        new_value DECIMAL(12,2),
        notes TEXT,
        INDEX idx_student (student_id),
        INDEX idx_date (performed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ payment_history table created\n');

    // Step 4: Insert default payment columns
    console.log('Step 4: Inserting default payment columns...');
    const columns = [
      ['Term 1 Tuition', 150000.00, 'Term 1', '2024', '2024-03-31', 1],
      ['Term 1 Exam Fees', 25000.00, 'Term 1', '2024', '2024-03-31', 2],
      ['Term 2 Tuition', 150000.00, 'Term 2', '2024', '2024-07-31', 3],
      ['Term 2 Exam Fees', 25000.00, 'Term 2', '2024', '2024-07-31', 4],
      ['Term 3 Tuition', 150000.00, 'Term 3', '2024', '2024-11-30', 5],
      ['Term 3 Exam Fees', 25000.00, 'Term 3', '2024', '2024-11-30', 6],
      ['Uniform', 35000.00, 'Annual', '2024', '2024-02-28', 7],
      ['Transport', 50000.00, 'Annual', '2024', '2024-02-28', 8]
    ];

    for (const col of columns) {
      try {
        await connection.query(`
          INSERT IGNORE INTO payment_columns (name, amount, term, academic_year, due_date, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `, col);
      } catch (err) {
        console.log(`  Skipping ${col[0]} (already exists)`);
      }
    }
    console.log('✓ Inserted 8 default payment columns\n');

    // Step 5: Update global_student_sheets
    console.log('Step 5: Updating global_student_sheets table...');
    
    // Check if columns exist
    const [columns_check] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'global_student_sheets' 
      AND COLUMN_NAME IN ('total_fees', 'paid_amount', 'payment_status', 'last_payment_date')
    `, [process.env.DB_NAME || 'school_management']);

    const existingColumns = columns_check.map(c => c.COLUMN_NAME);

    if (!existingColumns.includes('total_fees')) {
      await connection.query('ALTER TABLE global_student_sheets ADD COLUMN total_fees DECIMAL(12,2) DEFAULT 0.00');
      console.log('  ✓ Added total_fees column');
    }
    if (!existingColumns.includes('paid_amount')) {
      await connection.query('ALTER TABLE global_student_sheets ADD COLUMN paid_amount DECIMAL(12,2) DEFAULT 0.00');
      console.log('  ✓ Added paid_amount column');
    }
    if (!existingColumns.includes('payment_status')) {
      await connection.query("ALTER TABLE global_student_sheets ADD COLUMN payment_status ENUM('paid', 'partial', 'unpaid', 'overdue') DEFAULT 'unpaid'");
      console.log('  ✓ Added payment_status column');
    }
    if (!existingColumns.includes('last_payment_date')) {
      await connection.query('ALTER TABLE global_student_sheets ADD COLUMN last_payment_date DATE');
      console.log('  ✓ Added last_payment_date column');
    }

    // Set default total fees
    const [totalFees] = await connection.query('SELECT SUM(amount) as total FROM payment_columns WHERE is_active = 1');
    const defaultFees = totalFees[0].total || 610000;
    
    await connection.query('UPDATE global_student_sheets SET total_fees = ? WHERE total_fees = 0 OR total_fees IS NULL', [defaultFees]);
    console.log(`✓ Set default total fees: ${defaultFees} RWF\n`);

    // Verify
    const [stats] = await connection.query('SELECT COUNT(*) as count FROM global_student_sheets WHERE total_fees > 0');
    console.log(`✓ ${stats[0].count} students have payment data\n`);

    await connection.end();

    console.log('========================================');
    console.log('✅ SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Features Enabled:');
    console.log('  ✓ Excel-like payment tracking');
    console.log('  ✓ Dynamic payment columns');
    console.log('  ✓ Real-time cell editing');
    console.log('  ✓ Bulk SMS reminders');
    console.log('  ✓ Export to Excel');
    console.log('  ✓ Payment history audit trail');
    console.log('  ✓ Auto-calculation of totals\n');
    console.log('Next Steps:');
    console.log('  1. Restart backend: cd backend && npm start');
    console.log('  2. Access at: http://localhost:5173/payments\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
