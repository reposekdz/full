const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupAdminContent() {
  console.log('🚀 Setting up Admin Content Management System...\n');
  
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'admin-content-management.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    const statements = migration.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
      }
    }
    
    console.log('✅ Admin content management tables created');
    console.log('✅ Default content inserted for all pages');
    console.log('✅ Admin can now edit content on any page');
    
    console.log('\n📊 Features Available:');
    console.log('   ✓ Edit page titles, descriptions, and content');
    console.log('   ✓ Upload and manage images for any page');
    console.log('   ✓ Change colors, fonts, and styling');
    console.log('   ✓ Bulk content updates');
    console.log('   ✓ Content access logging');
    
    console.log('\n🔗 API Endpoints:');
    console.log('   GET /api/admin-content/pages - Get all page content');
    console.log('   PUT /api/admin-content/pages/:page/:section - Update content');
    console.log('   DELETE /api/admin-content/pages/:page/:section - Delete content');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupAdminContent();