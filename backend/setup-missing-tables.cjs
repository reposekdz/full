const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupMissingTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Create cells table
    console.log('Creating cells table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cells (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sector_id INT NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ cells table created\n');
    
    // Create villages table
    console.log('Creating villages table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS villages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cell_id INT NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        name_rw VARCHAR(100),
        code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ villages table created\n');
    
    // Create application_validation_rules table
    console.log('Creating application_validation_rules table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_validation_rules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        field_name VARCHAR(100) NOT NULL,
        rule_type VARCHAR(50) NOT NULL,
        rule_value TEXT,
        error_message_en TEXT,
        error_message_rw TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ application_validation_rules table created\n');
    
    // Create trades_levels table (alias for trade_levels)
    console.log('Creating trades_levels table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trades_levels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_code VARCHAR(20) NOT NULL,
        level_number INT NOT NULL,
        level_suffix VARCHAR(10),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ trades_levels table created\n');
    
    // Insert sample validation rules
    console.log('Inserting sample validation rules...');
    await connection.execute(`
      INSERT IGNORE INTO application_validation_rules (field_name, rule_type, rule_value, error_message_en, error_message_rw, is_active)
      VALUES 
        ('phone', 'pattern', '^(\\\\+250|0)[7][0-9]{8}$', 'Invalid phone number format', 'Numero ya telefoni ntiyemewe', TRUE),
        ('email', 'pattern', '^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$', 'Invalid email format', 'Imeri ntiyemewe', TRUE),
        ('national_id', 'length', '16', 'National ID must be 16 digits', 'Indangamuntu igomba kuba imibare 16', TRUE),
        ('age', 'range', '14-35', 'Age must be between 14 and 35', 'Imyaka igomba kuba hagati ya 14 na 35', TRUE)
    `);
    console.log('✅ Sample validation rules inserted\n');
    
    // Copy data from trade_levels to trades_levels if needed
    console.log('Syncing trade_levels data...');
    await connection.execute(`
      INSERT IGNORE INTO trades_levels (trade_code, level_number, level_suffix, description, is_active)
      SELECT 
        COALESCE(t.code, 'GENERAL') as trade_code,
        tl.level_number,
        '' as level_suffix,
        tl.description,
        TRUE
      FROM trade_levels tl
      LEFT JOIN trades t ON tl.trade_id = t.id
    `);
    console.log('✅ Trade levels synced\n');
    
    console.log('========================================');
    console.log('✅ All missing tables created successfully!');
    console.log('========================================');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
  }
}

setupMissingTables();
