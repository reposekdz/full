const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupStaffAccessCodes() {
  let connection;
  
  try {
    console.log('🔐 Setting up Staff Access Code Management System...\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../migrations/staff_access_codes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration...');
    await connection.query(migrationSQL);
    console.log('✅ Migration completed\n');

    // Verify tables were created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('staff_access_codes', 'staff_access_code_history', 'staff_roles_config')
    `, [process.env.DB_NAME || 'school_management']);

    console.log('📊 Created tables:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });
    console.log('');

    // Verify default access code
    const [codes] = await connection.query(
      'SELECT * FROM staff_access_codes WHERE code_name = "staff_portal_access"'
    );

    if (codes.length > 0) {
      console.log('🔑 Default Access Code Configuration:');
      console.log(`   Code Name: ${codes[0].code_name}`);
      console.log(`   Code Value: ${codes[0].code_value}`);
      console.log(`   Description: ${codes[0].description}`);
      console.log(`   Status: ${codes[0].is_active ? 'Active' : 'Inactive'}`);
      console.log('');
    }

    // Verify staff roles
    const [roles] = await connection.query(
      'SELECT COUNT(*) as count FROM staff_roles_config WHERE is_active = TRUE'
    );

    console.log(`👥 Staff Roles Configured: ${roles[0].count} active roles\n`);

    console.log('✅ Staff Access Code Management System setup completed!\n');
    console.log('📖 Next Steps:');
    console.log('   1. Add route to server.js:');
    console.log('      app.use(\'/api/staff-access-codes\', require(\'./routes/staff-access-codes\'));');
    console.log('   2. Access the management interface as Admin or Headmaster');
    console.log('   3. Current access code: g@2026');
    console.log('   4. You can update it through the admin panel\n');

  } catch (error) {
    console.error('❌ Error setting up staff access codes:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup
setupStaffAccessCodes()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  });
