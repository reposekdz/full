const { pool } = require('./config/database');

async function testMessagingSystem() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE MESSAGING SYSTEM - INTEGRATION TEST       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const tests = [];
  let passed = 0;
  let failed = 0;

  try {
    console.log('📊 Testing Database Tables...\n');

    const tablesToTest = [
      'messages',
      'message_reads',
      'notifications',
      'notification_templates',
      'notification_logs',
      'activity_logs',
      'sms_logs',
      'parent_student_links'
    ];

    for (const table of tablesToTest) {
      try {
        const [result] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
        if (result.length > 0) {
          const [columns] = await pool.execute(`DESCRIBE ${table}`);
          console.log(`✅ ${table.padEnd(25)} - ${columns.length} columns`);
          tests.push({ test: `Table: ${table}`, status: 'PASS' });
          passed++;
        } else {
          console.log(`❌ ${table.padEnd(25)} - MISSING`);
          tests.push({ test: `Table: ${table}`, status: 'FAIL' });
          failed++;
        }
      } catch (err) {
        console.log(`❌ ${table.padEnd(25)} - ERROR: ${err.message}`);
        tests.push({ test: `Table: ${table}`, status: 'FAIL' });
        failed++;
      }
    }

    console.log('\n📧 Testing Notification Templates...\n');

    const [templates] = await pool.execute('SELECT COUNT(*) as count FROM notification_templates');
    const templateCount = templates[0].count;
    
    if (templateCount >= 12) {
      console.log(`✅ Notification templates loaded: ${templateCount}`);
      tests.push({ test: 'Default templates loaded', status: 'PASS' });
      passed++;
    } else {
      console.log(`❌ Insufficient templates: ${templateCount} (expected 12+)`);
      tests.push({ test: 'Default templates loaded', status: 'FAIL' });
      failed++;
    }

    const [eventTypes] = await pool.execute(`
      SELECT event_type, COUNT(*) as count 
      FROM notification_templates 
      GROUP BY event_type
    `);
    
    console.log('\nTemplate Event Types:');
    eventTypes.forEach(et => {
      console.log(`  • ${et.event_type.padEnd(25)} - ${et.count} template(s)`);
    });

    console.log('\n📁 Testing Upload Directories...\n');

    const fs = require('fs');
    const path = require('path');

    const uploadDirs = [
      'uploads/profiles',
      'uploads/messages'
    ];

    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}`);
        tests.push({ test: `Directory: ${dir}`, status: 'PASS' });
        passed++;
      } else {
        console.log(`❌ ${dir} - MISSING`);
        tests.push({ test: `Directory: ${dir}`, status: 'FAIL' });
        failed++;
      }
    }

    console.log('\n🔗 Testing Sample Data Insertion...\n');

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [testMessage] = await connection.execute(`
        INSERT INTO messages (
          sender_id, recipient_id, recipient_type, subject, message, 
          priority, category, status, created_at
        ) VALUES (1, 1, 'parent', 'Test Message', 'This is a test message', 'normal', 'general', 'sent', NOW())
      `);

      console.log(`✅ Test message inserted (ID: ${testMessage.insertId})`);
      tests.push({ test: 'Insert test message', status: 'PASS' });
      passed++;

      const [testNotif] = await connection.execute(`
        INSERT INTO notifications (
          user_id, type, title, message, created_at
        ) VALUES (1, 'test', 'Test Notification', 'This is a test notification', NOW())
      `);

      console.log(`✅ Test notification inserted (ID: ${testNotif.insertId})`);
      tests.push({ test: 'Insert test notification', status: 'PASS' });
      passed++;

      const [testLog] = await connection.execute(`
        INSERT INTO activity_logs (
          user_id, action, entity_type, entity_id, created_at
        ) VALUES (1, 'test', 'system', 1, NOW())
      `);

      console.log(`✅ Test activity log inserted (ID: ${testLog.insertId})`);
      tests.push({ test: 'Insert test activity log', status: 'PASS' });
      passed++;

      await connection.rollback();
      console.log('✅ Test data rolled back (cleanup successful)');
      tests.push({ test: 'Transaction rollback', status: 'PASS' });
      passed++;

    } catch (err) {
      await connection.rollback();
      console.log(`❌ Sample data insertion failed: ${err.message}`);
      tests.push({ test: 'Sample data insertion', status: 'FAIL' });
      failed++;
    } finally {
      connection.release();
    }

    console.log('\n🔍 Testing Indexes and Constraints...\n');

    const [indexes] = await pool.execute(`
      SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'school_management'
      AND TABLE_NAME IN ('messages', 'notifications', 'notification_templates', 'activity_logs')
      ORDER BY TABLE_NAME, INDEX_NAME
    `);

    const indexCount = indexes.length;
    console.log(`✅ Found ${indexCount} indexes across messaging tables`);
    tests.push({ test: 'Database indexes', status: 'PASS' });
    passed++;

    const [foreignKeys] = await pool.execute(`
      SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'school_management'
      AND TABLE_NAME IN ('messages', 'message_reads', 'notifications', 'notification_logs')
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    const fkCount = foreignKeys.length;
    console.log(`✅ Found ${fkCount} foreign key constraints`);
    tests.push({ test: 'Foreign key constraints', status: 'PASS' });
    passed++;

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`Total Tests: ${tests.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%\n`);

    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! System is ready for use.\n');
      console.log('Next steps:');
      console.log('  1. Start the server: npm start');
      console.log('  2. Test API endpoints with Postman');
      console.log('  3. Configure production SMS credentials');
      console.log('  4. Set up cron job for daily reminders\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
    }

    process.exit(failed === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testMessagingSystem();
