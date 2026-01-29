const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupStockManagement() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'migrations', 'stock_management_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);
    console.log('✅ Stock management tables created successfully');

    // Verify tables
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'stock_%' OR SHOW TABLES LIKE 'procurement_%'
    `);
    
    console.log('\n📊 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check sample data
    const [items] = await connection.query('SELECT COUNT(*) as count FROM stock_items');
    console.log(`\n✅ Sample data: ${items[0].count} stock items inserted`);

    console.log('\n🎉 Stock Management System setup completed successfully!');
    console.log('\n📝 Available tables:');
    console.log('  - stock_items: Main inventory items');
    console.log('  - stock_transactions: All stock movements');
    console.log('  - stock_requisitions: Item requests');
    console.log('  - stock_requisition_items: Requisition details');
    console.log('  - procurement_orders: Purchase orders');
    console.log('  - procurement_order_items: Order details');
    console.log('  - stock_suppliers: Supplier information');

  } catch (error) {
    console.error('❌ Error setting up stock management:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupStockManagement();
