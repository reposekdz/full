const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDynamicColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    multipleStatements: true
  });

  try {
    console.log('📊 Setting up Dynamic Columns System...');
    
    const schema = fs.readFileSync(
      path.join(__dirname, 'migrations', 'dynamic_columns_schema.sql'),
      'utf8'
    );
    
    await connection.query(schema);
    console.log('✅ Dynamic columns tables created successfully!');
    
    console.log('\n🎉 Setup Complete!');
    console.log('Features enabled:');
    console.log('  - Dynamic column creation for level sheets');
    console.log('  - Student column values management');
    console.log('  - Parent-student connection requests');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupDynamicColumns();
