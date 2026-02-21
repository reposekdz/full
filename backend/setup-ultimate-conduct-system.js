/**
 * Setup Ultimate Global Conduct System
 * - Adds parent columns to global_student_sheets
 * - Uses existing gardenSMSService
 * - All staff can see parent info and send SMS
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ULTIMATE GLOBAL CONDUCT SYSTEM SETUP');
    console.log('='.repeat(80) + '\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Run SQL migration
    const sqlPath = path.join(__dirname, 'migrations', 'add-parent-columns-to-global-sheets.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Adding parent columns to global_student_sheets...');
    await connection.query(sql);
    console.log('✅ Parent columns added\n');

    // Update existing students with parent info
    console.log('🔄 Updating existing students with parent info...');
    const [students] = await connection.execute(`
      SELECT id FROM global_student_sheets WHERE status = 'active'
    `);
    
    for (const student of students) {
      const [parents] = await connection.execute(`
        SELECT u.first_name, u.last_name, u.phone
        FROM parent_student_links psl
        JOIN users u ON psl.parent_id = u.id
        WHERE psl.student_id = ? AND psl.status = 'approved'
      `, [student.id]);
      
      const parentNames = parents.map(p => `${p.first_name} ${p.last_name}`).join(', ');
      const parentPhones = parents.map(p => p.phone).filter(p => p).join(', ');
      const parentCount = parents.length;
      
      await connection.execute(`
        UPDATE global_student_sheets
        SET parent_names = ?, parent_phones = ?, parent_count = ?
        WHERE id = ?
      `, [parentNames, parentPhones, parentCount, student.id]);
    }
    
    console.log(`✅ Updated ${students.length} students\n`);

    console.log('='.repeat(80));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(80) + '\n');
    
    console.log('📡 API Endpoints:');
    console.log('   POST /api/global-conduct/remove-conduct');
    console.log('   POST /api/global-conduct/approve-leave');
    console.log('   GET  /api/global-conduct/students-with-parents');
    console.log('   GET  /api/global-conduct/conduct-history/:studentId\n');
    
    console.log('✨ Features:');
    console.log('   ✅ Real SMS via Africa\'s Talking (existing service)');
    console.log('   ✅ Parent info visible in global_student_sheets');
    console.log('   ✅ All staff roles can remove conduct');
    console.log('   ✅ Automatic SMS to all linked parents');
    console.log('   ✅ Complete audit trail');
    console.log('   ✅ Rich Kinyarwanda messages\n');
    
    console.log('🎯 SMS Configuration (from .env):');
    console.log(`   API Key: ${process.env.AFRICATALKING_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Username: ${process.env.AFRICATALKING_USERNAME || 'reponse'}`);
    console.log(`   Sender ID: GARDEN\n`);
    
    console.log('🚀 Ready to use! Restart backend: npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setup();
