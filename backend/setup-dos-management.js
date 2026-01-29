const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupDOSManagement() {
  console.log('🚀 Setting up DOS Comprehensive Management System...\n');
  
  try {
    // Execute schema
    const schemaPath = path.join(__dirname, 'migrations', 'dos_management_extensions.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
      }
    }
    console.log('✅ DOS management tables created');
    
    // Create uploads/reports directory
    const reportsDir = path.join(__dirname, 'uploads', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    console.log('✅ Reports directory created');
    
    console.log('\n✅ DOS Comprehensive Management System setup complete!');
    console.log('\n📊 Features Enabled:');
    console.log('   ✓ Teacher-Class Assignments');
    console.log('   ✓ Teacher-Course Assignments');
    console.log('   ✓ Timetable Generation (Manual & Auto)');
    console.log('   ✓ Report Card Generation (Single & Bulk)');
    console.log('   ✓ PDF Report Downloads');
    console.log('   ✓ SMS to Parents (No Smartphone Required)');
    console.log('   ✓ Comprehensive Analytics');
    console.log('   ✓ Teacher Performance Tracking');
    console.log('   ✓ Cached Analytics for Performance');
    
    console.log('\n🔗 API Endpoint: /api/dos-management');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupDOSManagement();
