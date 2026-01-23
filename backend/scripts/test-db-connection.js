const db = require('../config/database');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test basic connection
    const [result] = await db.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log(`   Test query result: ${result[0].test}\n`);

    // Get database name
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    console.log(`📊 Connected to database: ${dbInfo[0].db_name}\n`);

    // Check if tables exist
    console.log('📋 Checking tables...');
    const tables = [
      'slides',
      'news_articles',
      'testimonials',
      'school_stats',
      'achievements',
      'events',
      'home_features',
      'courses',
      'users',
      'roles'
    ];

    for (const table of tables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✓ ${table.padEnd(20)} - ${rows[0].count} records`);
      } catch (error) {
        console.log(`   ✗ ${table.padEnd(20)} - Table does not exist`);
      }
    }

    console.log('\n✅ Database test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check your .env file:');
    console.error('  DB_HOST=localhost');
    console.error('  DB_USER=root');
    console.error('  DB_PASSWORD=your_password');
    console.error('  DB_NAME=school_management');
    console.error('  DB_PORT=3306\n');
    process.exit(1);
  }
}

testConnection();
