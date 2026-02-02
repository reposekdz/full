const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupSchoolOwner() {
  console.log('========================================');
  console.log('School Owner Role Setup');
  console.log('========================================\n');

  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management_db',
      multipleStatements: true
    });

    console.log('✓ Connected to database\n');

    // Read SQL migration file
    const sqlPath = path.join(__dirname, 'migrations', 'add-school-owner-role.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate')) {
            console.log('⚠ Already exists:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
          } else {
            console.log('⚠ Warning:', err.message);
          }
        }
      }
    }

    // Verify role was created
    const [roles] = await connection.execute(
      "SELECT * FROM roles WHERE name = 'school_owner'"
    );

    if (roles.length > 0) {
      console.log('\n✓ School Owner role created successfully!');
      console.log('  Role ID:', roles[0].id);
      console.log('  Role Name:', roles[0].name);
      console.log('  Description:', roles[0].description);
    } else {
      console.log('\n⚠ School Owner role not found. Please check the migration.');
    }

    await connection.end();

    console.log('\n========================================');
    console.log('Setup Complete!');
    console.log('========================================\n');
    console.log('School Owner role has been added to the system.\n');
    console.log('To create a School Owner user:');
    console.log('1. Go to Staff Management');
    console.log('2. Add new staff member');
    console.log('3. Select role: "school_owner"\n');
    console.log('School Owner has access to:');
    console.log('- Complete Financial Management');
    console.log('- School-wide Performance Analytics');
    console.log('- Stock & Inventory Management');
    console.log('- Real-time System Analytics');
    console.log('- All Staff & Student Data\n');
    console.log('API Endpoint: /api/school-owner/*\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database connection settings in .env file');
    console.error('2. Database exists and is accessible');
    console.error('3. Migration file exists at backend/migrations/add-school-owner-role.sql\n');
    process.exit(1);
  }
}

// Run setup
setupSchoolOwner();
