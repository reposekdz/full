/**
 * Setup Ultra-Advanced SMS and Notification System
 * Run: node setup-ultra-sms-system.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupUltraSMSSystem() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ULTRA-ADVANCED SMS & NOTIFICATION SYSTEM SETUP');
    console.log('='.repeat(80) + '\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read and execute SQL migration
    const sqlPath = path.join(__dirname, 'migrations', 'ultra-advanced-sms-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Creating tables...');
    await connection.query(sql);
    console.log('✅ All tables created\n');

    // Install Africa's Talking package
    console.log('📦 Installing Africa\'s Talking package...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install africastalking', { stdio: 'inherit' });
      console.log('✅ Africa\'s Talking installed\n');
    } catch (error) {
      console.log('⚠️  Please run: npm install africastalking\n');
    }

    // Check environment variables
    console.log('🔧 Checking environment variables...');
    const requiredEnvVars = [
      'AFRICASTALKING_API_KEY',
      'AFRICASTALKING_USERNAME',
      'SCHOOL_NAME',
      'SCHOOL_PHONE'
    ];
    
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:');
      missingVars.forEach(v => console.log(`   - ${v}`));
      console.log('\n📝 Please update your .env file with:');
      console.log('   AFRICASTALKING_API_KEY=your_api_key');
      console.log('   AFRICASTALKING_USERNAME=your_username');
      console.log('   SCHOOL_NAME=GARDEN TVET SCHOOL');
      console.log('   SCHOOL_PHONE=+250 788 123 456\n');
    } else {
      console.log('✅ All environment variables configured\n');
    }

    console.log('='.repeat(80));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(80) + '\n');
    
    console.log('📡 API Endpoints Available:');
    console.log('   POST /api/global-conduct/remove-conduct');
    console.log('   POST /api/global-conduct/update-grade');
    console.log('   POST /api/global-conduct/mark-attendance');
    console.log('   POST /api/global-conduct/approve-leave');
    console.log('   GET  /api/global-conduct/conduct-history/:studentId');
    console.log('   GET  /api/global-conduct/conduct-records\n');
    
    console.log('🎯 Features:');
    console.log('   ✅ Real SMS via Africa\'s Talking');
    console.log('   ✅ Automatic parent notifications');
    console.log('   ✅ All staff roles supported');
    console.log('   ✅ Complete audit trail');
    console.log('   ✅ Rich Kinyarwanda messages');
    console.log('   ✅ 40-point conduct system\n');
    
    console.log('🚀 Next Steps:');
    console.log('   1. Update .env with Africa\'s Talking credentials');
    console.log('   2. Restart backend: npm start');
    console.log('   3. Test by removing conduct from any student');
    console.log('   4. Parents will receive SMS automatically!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupUltraSMSSystem();
