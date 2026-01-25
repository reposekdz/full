const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  try {
    console.log('📊 Running accountant tables migration...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(100),
        allocated_amount DECIMAL(15,2),
        fiscal_year VARCHAR(20),
        description TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS salaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        staff_id INT,
        amount DECIMAL(15,2),
        month VARCHAR(2),
        year VARCHAR(4),
        status ENUM('pending','paid') DEFAULT 'pending',
        payment_date DATETIME,
        processed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('income','expense'),
        category VARCHAR(100),
        amount DECIMAL(15,2),
        description TEXT,
        transaction_date DATETIME,
        created_by INT,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Created tables: budgets, salaries, transactions');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
