const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupSearchSystem() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'setup-search-system.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute SQL
    console.log('🔄 Setting up search system...');
    await connection.query(sql);

    console.log('✅ Search system setup completed!');
    console.log('\n📊 Search Features Enabled:');
    console.log('  ✓ Search logging and analytics');
    console.log('  ✓ News articles search');
    console.log('  ✓ Gallery images search');
    console.log('  ✓ Popular searches tracking');
    console.log('  ✓ Search performance indexes');
    console.log('\n🎉 Your powerful search system is ready!');

  } catch (error) {
    console.error('❌ Error setting up search system:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupSearchSystem();
