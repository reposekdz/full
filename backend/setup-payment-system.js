/**
 * Garden TVET School - Parent Payment System Setup Script
 * Creates all required tables for the payment system
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupPaymentSystem() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  console.log('✓ Connected to database');

  try {
    // 1. Create fee_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_code VARCHAR(50) UNIQUE NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_mandatory BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created fee_categories table');

    // 2. Create level_fee_config table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS level_fee_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level_number VARCHAR(20) NOT NULL,
        fee_category_id INT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        academic_year VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id),
        UNIQUE KEY unique_level_category_year (level_number, fee_category_id, academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created level_fee_config table');

    // 3. Create fee_assessments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        fee_type VARCHAR(100) NOT NULL,
        fee_category VARCHAR(50) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        due_date DATE NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_fee_student (student_id),
        INDEX idx_fee_academic_year (academic_year),
        INDEX idx_fee_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created fee_assessments table');

    // 4. Create pending_payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pending_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id VARCHAR(50) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        fee_amount DECIMAL(12, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100) UNIQUE NOT NULL,
        receipt_number VARCHAR(100) UNIQUE NOT NULL,
        external_reference VARCHAR(200),
        status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        payment_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        INDEX idx_pending_parent (parent_id),
        INDEX idx_pending_student (student_id),
        INDEX idx_pending_reference (reference_number),
        INDEX idx_pending_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created pending_payments table');

    // 5. Create payment_transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        parent_id VARCHAR(50) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        fee_amount DECIMAL(12, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_channel VARCHAR(50),
        reference_number VARCHAR(100) UNIQUE NOT NULL,
        receipt_number VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        description TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_transaction_student (student_id),
        INDEX idx_transaction_parent (parent_id),
        INDEX idx_transaction_reference (reference_number),
        INDEX idx_transaction_status (status),
        INDEX idx_transaction_date (payment_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created payment_transactions table');

    // 6. Create payments table (legacy)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        parent_id VARCHAR(50),
        fee_id INT,
        amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50),
        reference_number VARCHAR(100) UNIQUE,
        receipt_number VARCHAR(100) UNIQUE,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fee_amount DECIMAL(12, 2) DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payments_student (student_id),
        INDEX idx_payments_parent (parent_id),
        INDEX idx_payments_reference (reference_number),
        INDEX idx_payments_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created payments table');

    // 7. Create payment_receipts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(100) UNIQUE NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        parent_id VARCHAR(50),
        transaction_id VARCHAR(100),
        amount DECIMAL(12, 2) NOT NULL,
        fee_amount DECIMAL(12, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        generated_by VARCHAR(50),
        pdf_path VARCHAR(255),
        is_valid BOOLEAN DEFAULT TRUE,
        voided_at TIMESTAMP NULL,
        voided_by VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_receipts_student (student_id),
        INDEX idx_receipts_parent (parent_id),
        INDEX idx_receipts_number (receipt_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created payment_receipts table');

    // 8. Create bank_configurations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bank_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_code VARCHAR(50) UNIQUE NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        api_url VARCHAR(500),
        merchant_id VARCHAR(100),
        collection_id VARCHAR(100),
        api_key VARCHAR(255),
        api_secret VARCHAR(255),
        callback_url VARCHAR(500),
        webhook_secret VARCHAR(255),
        fee_percent DECIMAL(5, 2) DEFAULT 0.00,
        min_amount DECIMAL(12, 2) DEFAULT 0.00,
        max_amount DECIMAL(12, 2),
        is_enabled BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        sandbox_mode BOOLEAN DEFAULT FALSE,
        config_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bank_enabled (is_enabled),
        INDEX idx_bank_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created bank_configurations table');

    // 9. Insert default fee categories
    const categories = [
      ['TUITION', 'Tuition Fees', 'Core tuition fees for the academic year', TRUE],
      ['REGISTRATION', 'Registration Fees', 'One-time registration fees', TRUE],
      ['EXAM', 'Examination Fees', 'Fees for internal and external examinations', TRUE],
      ['MATERIAL', 'Learning Materials', 'Books, uniforms, and learning materials', TRUE],
      ['HOSTEL', 'Hostel Accommodation', 'Dormitory and accommodation fees', FALSE],
      ['TRANSPORT', 'Transport Fees', 'School bus and transportation fees', FALSE],
      ['CAFETERIA', 'Cafeteria/Food', 'Meal plans and cafeteria credits', FALSE],
      ['ACTIVITY', 'Activity Fees', 'Sports, clubs, and extracurricular activities', FALSE],
      ['LATE', 'Late Payment Fees', 'Penalty for late payment', FALSE],
      ['OTHER', 'Other Fees', 'Miscellaneous fees', FALSE]
    ];

    for (const [code, name, desc, mandatory] of categories) {
      await connection.query(`
        INSERT IGNORE INTO fee_categories (category_code, category_name, description, is_mandatory)
        VALUES (?, ?, ?, ?)
      `, [code, name, desc, mandatory]);
    }
    console.log('✓ Inserted default fee categories');

    // 10. Insert level fee configurations
    const levelFees = [
      ['3', 1, 150000, '2024-2025'],  // Level 3 Tuition
      ['3', 2, 25000, '2024-2025'],  // Level 3 Registration
      ['3', 3, 50000, '2024-2025'],  // Level 3 Exam
      ['3', 4, 75000, '2024-2025'],  // Level 3 Materials
      ['4', 1, 200000, '2024-2025'], // Level 4 Tuition
      ['4', 2, 25000, '2024-2025'],  // Level 4 Registration
      ['4', 3, 50000, '2024-2025'],  // Level 4 Exam
      ['4', 4, 75000, '2024-2025'],  // Level 4 Materials
      ['5', 1, 250000, '2024-2025'], // Level 5 Tuition
      ['5', 2, 25000, '2024-2025'],  // Level 5 Registration
      ['5', 3, 75000, '2024-2025'],  // Level 5 Exam
      ['5', 4, 75000, '2024-2025'],  // Level 5 Materials
    ];

    for (const [level, category, amount, year] of levelFees) {
      await connection.query(`
        INSERT IGNORE INTO level_fee_config (level_number, fee_category_id, amount, academic_year)
        VALUES (?, ?, ?, ?)
      `, [level, category, amount, year]);
    }
    console.log('✓ Inserted level fee configurations');

    // 11. Insert bank configurations
    const banks = [
      ['gt_bank', 'GT Bank Rwanda', NULL, 0.00, 1000, 10000000, FALSE],
      ['bpr', 'Bank of Kigali (BPR)', NULL, 0.00, 1000, 10000000, FALSE],
      ['equity_bank', 'Equity Bank Rwanda', NULL, 0.00, 1000, 10000000, FALSE],
      ['mtn_money', 'MTN Mobile Money', NULL, 0.50, 100, 500000, FALSE],
      ['airtel_money', 'Airtel Money', NULL, 0.50, 100, 500000, FALSE]
    ];

    for (const [code, name, api, fee, min, max, enabled] of banks) {
      await connection.query(`
        INSERT IGNORE INTO bank_configurations (bank_code, bank_name, api_url, fee_percent, min_amount, max_amount, is_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [code, name, api, fee, min, max, enabled]);
    }
    console.log('✓ Inserted bank configurations');

    console.log('\n✅ Parent Payment System setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    await connection.end();
  }
}

setupPaymentSystem();
