const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupParentLinkingSystem() {
  console.log('🚀 Setting up Parent Linking System...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    multipleStatements: true
  });

  try {
    // Read and execute SQL migration
    const sqlPath = path.join(__dirname, 'migrations', 'parent-linking-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Creating database tables...');
    await connection.query(sql);
    console.log('✅ Tables created successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const tables = [
      'parent_linking_requests',
      'parent_connections',
      'parent_notifications',
      'parent_activities',
      'parent_messages',
      'parent_fee_payments'
    ];

    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ✗ ${table} - FAILED`);
      }
    }

    console.log('\n✅ Parent Linking System setup complete!\n');
    console.log('📝 Features enabled:');
    console.log('  • Parents submit linking requests by name/gender/level/trade');
    console.log('  • Staff (DOS/Headmaster/Admin) approve/reject requests');
    console.log('  • Approved parents get full access to child data');
    console.log('  • Parents can view grades, attendance, conduct, fees');
    console.log('  • Parents can pay fees online');
    console.log('  • Real-time notifications for parents');
    console.log('  • Activity tracking and messaging\n');

    console.log('🔗 API Endpoints:');
    console.log('  POST /api/parent-linking/submit-request - Submit linking request');
    console.log('  GET  /api/parent-linking/my-requests - View my requests');
    console.log('  GET  /api/parent-linking/pending - View pending requests (staff)');
    console.log('  POST /api/parent-linking/approve/:id - Approve request (staff)');
    console.log('  POST /api/parent-linking/reject/:id - Reject request (staff)');
    console.log('  GET  /api/parent-linking/trades - Get available trades');
    console.log('  GET  /api/parent-linking/levels - Get available levels\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupParentLinkingSystem()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { setupParentLinkingSystem };
