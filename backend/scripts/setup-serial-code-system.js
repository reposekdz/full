const { pool } = require('../config/database');

async function setupSerialCodeSystem() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Setting up Serial Code System tables...\n');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS serial_codes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        serial_code VARCHAR(100) UNIQUE NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50) NOT NULL,
        trade_code VARCHAR(10) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(5) DEFAULT '',
        status ENUM('active', 'used', 'expired') DEFAULT 'active',
        generated_by INT NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_by INT NULL,
        used_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_serial_code (serial_code),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_trade_code (trade_code),
        FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ serial_codes table created/verified');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50) NOT NULL,
        serial_code VARCHAR(100) NOT NULL,
        linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_parent (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_serial_code (serial_code),
        INDEX idx_active (is_active),
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ parent_student_links table created/verified');

    const [userTableInfo] = await connection.query(`
      SHOW COLUMNS FROM users LIKE 'linked_student_id'
    `);
    
    if (userTableInfo.length === 0) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN linked_student_id INT NULL AFTER role
      `);
      console.log('✅ Added linked_student_id column to users table');
    } else {
      console.log('✅ linked_student_id column already exists in users table');
    }

    const [studentPaymentRecords] = await connection.query(`
      SHOW TABLES LIKE 'student_payment_records'
    `);
    
    if (studentPaymentRecords.length === 0) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS student_payment_records (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) DEFAULT 'cash',
          reference_number VARCHAR(100) NULL,
          payment_date DATE NOT NULL,
          notes TEXT NULL,
          recorded_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_student_id (student_id),
          INDEX idx_payment_date (payment_date),
          FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ student_payment_records table created');
    } else {
      console.log('✅ student_payment_records table already exists');
    }

    const [transactionsTable] = await connection.query(`
      SHOW TABLES LIKE 'transactions'
    `);
    
    if (transactionsTable.length === 0) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          type ENUM('income', 'expense') NOT NULL,
          category VARCHAR(100) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT NULL,
          transaction_date DATE NOT NULL,
          reference_id INT NULL,
          reference_type VARCHAR(50) NULL,
          created_by INT NOT NULL,
          status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_type (type),
          INDEX idx_category (category),
          INDEX idx_transaction_date (transaction_date),
          INDEX idx_status (status),
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ transactions table created');
    } else {
      console.log('✅ transactions table already exists');
    }

    const [stockTransactionsTable] = await connection.query(`
      SHOW TABLES LIKE 'stock_transactions'
    `);
    
    if (stockTransactionsTable.length === 0) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS stock_transactions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          item_id INT NOT NULL,
          transaction_type ENUM('purchase', 'issue', 'return', 'damaged', 'lost') NOT NULL,
          quantity INT NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_cost DECIMAL(10,2) NOT NULL,
          transaction_date DATE NOT NULL,
          notes TEXT NULL,
          issued_to INT NULL,
          issued_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_item_id (item_id),
          INDEX idx_transaction_type (transaction_type),
          INDEX idx_transaction_date (transaction_date),
          FOREIGN KEY (item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
          FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (issued_to) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ stock_transactions table created');
    } else {
      console.log('✅ stock_transactions table already exists');
    }

    console.log('\n📊 Database Summary:');
    const [serialCodesCount] = await connection.query('SELECT COUNT(*) as count FROM serial_codes');
    const [linksCount] = await connection.query('SELECT COUNT(*) as count FROM parent_student_links');
    console.log(`   Serial Codes: ${serialCodesCount[0].count}`);
    console.log(`   Parent-Student Links: ${linksCount[0].count}`);

    console.log('\n✅ Serial Code System setup completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

setupSerialCodeSystem()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
