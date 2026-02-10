const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupApplicationSystem() {
  try {
    console.log('🚀 Setting up Student Application System...\n');

    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations/student_applications.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await pool.execute(statement);
    }

    console.log('✅ Database tables created successfully\n');

    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/applications');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created\n');
    }

    console.log('📊 System Summary:');
    console.log('  ✓ student_applications table');
    console.log('  ✓ application_documents table');
    console.log('  ✓ application_activity_log table');
    console.log('  ✓ Uploads directory\n');

    console.log('🎉 Student Application System setup complete!\n');
    console.log('📝 Next steps:');
    console.log('  1. Add route to server.js:');
    console.log('     app.use(\'/api/student-applications\', require(\'./routes/student-applications\'));');
    console.log('  2. Restart backend server');
    console.log('  3. Add application form to homepage\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupApplicationSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupApplicationSystem;
