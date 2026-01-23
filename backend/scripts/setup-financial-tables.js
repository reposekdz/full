const { pool } = require('../config/database');

async function setupFinancialTables() {
  try {
    // Payments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RWF',
        payment_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        reference VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Inventory table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        unit_price DECIMAL(10, 2),
        total_value DECIMAL(10, 2),
        supplier VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Financial tables created successfully');
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    process.exit();
  }
}

setupFinancialTables();
