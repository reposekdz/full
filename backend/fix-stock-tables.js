const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndFixStockTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');

    // Check if stock_items table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'stock_items'");
    
    if (tables.length > 0) {
      console.log('📋 Checking existing stock_items table structure...');
      const [columns] = await connection.query("SHOW COLUMNS FROM stock_items");
      const columnNames = columns.map(col => col.Field);
      
      console.log('Current columns:', columnNames.join(', '));
      
      // Check if we need to rename 'name' to 'item_name'
      if (columnNames.includes('name') && !columnNames.includes('item_name')) {
        console.log('🔧 Renaming column "name" to "item_name"...');
        await connection.query('ALTER TABLE stock_items CHANGE COLUMN name item_name VARCHAR(255) NOT NULL');
      }
      
      // Check if we need to rename 'code' to 'item_code'
      if (columnNames.includes('code') && !columnNames.includes('item_code')) {
        console.log('🔧 Renaming column "code" to "item_code"...');
        await connection.query('ALTER TABLE stock_items CHANGE COLUMN code item_code VARCHAR(100) UNIQUE NOT NULL');
      }
      
      console.log('✅ Table structure updated successfully');
    } else {
      console.log('❌ stock_items table does not exist. Running full setup...');
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'migrations', 'stock_management_schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schema);
      console.log('✅ Tables created successfully');
    }

    const [items] = await connection.query('SELECT COUNT(*) as count FROM stock_items');
    console.log(`\n✅ Stock items in database: ${items[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndFixStockTables();
