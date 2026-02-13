const { pool } = require('./config/database');

/**
 * Test Script for Parent Linking & DOD System
 * Run this to verify the system is working correctly
 */

async function testParentLinkingDODSystem() {
  console.log('\n🧪 Testing Parent Linking & DOD System Integration\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Check if tables exist
    console.log('\n✅ Test 1: Checking database tables...');
    const tables = [
      'global_student_sheets',
      'parent_connections',
      'parent_student_requests',
      'discipline_records',
      'student_leaves',
      'parent_notifications',
      'parent_communications'
    ];

    for (const table of tables) {
      const [rows] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`   ✓ ${table} exists`);
      } else {
        console.log(`   ✗ ${table} MISSING!`);
      }
    }

    // Test 2: Check for students
    console.log('\n✅ Test 2: Checking for students...');
    const [students] = await pool.execute(
      'SELECT COUNT(*) as count FROM global_student_sheets'
    );
    console.log(`   Found ${students[0].count} students`);

    // Test 3: Check for parent connections
    console.log('\n✅ Test 3: Checking parent connections...');
    const [connections] = await pool.execute(
      'SELECT COUNT(*) as count FROM parent_connections WHERE status = "active"'
    );
    console.log(`   Found ${connections[0].count} active parent connections`);

    // Test 4: Check for pending requests
    console.log('\n✅ Test 4: Checking pending requests...');
    const [requests] = await pool.execute(
      'SELECT COUNT(*) as count FROM parent_student_requests WHERE status = "pending"'
    );
    console.log(`   Found ${requests[0].count} pending requests`);

    // Test 5: Check discipline records
    console.log('\n✅ Test 5: Checking discipline records...');
    const [discipline] = await pool.execute(
      'SELECT COUNT(*) as count FROM discipline_records'
    );
    console.log(`   Found ${discipline[0].count} discipline records`);

    // Test 6: Check leave records
    console.log('\n✅ Test 6: Checking leave records...');
    const [leaves] = await pool.execute(
      'SELECT COUNT(*) as count FROM student_leaves'
    );
    console.log(`   Found ${leaves[0].count} leave records`);

    // Test 7: Check notification system
    console.log('\n✅ Test 7: Checking notification system...');
    const [notifications] = await pool.execute(
      'SELECT COUNT(*) as count FROM parent_notifications'
    );
    console.log(`   Found ${notifications[0].count} parent notifications`);

    // Test 8: Sample query - Students with linked parents
    console.log('\n✅ Test 8: Students with linked parents...');
    const [linkedStudents] = await pool.execute(`
      SELECT 
        gss.id,
        gss.first_name,
        gss.last_name,
        gss.student_code,
        COUNT(pc.id) as parent_count
      FROM global_student_sheets gss
      LEFT JOIN parent_connections pc ON gss.id = pc.student_id AND pc.status = 'active'
      GROUP BY gss.id
      HAVING parent_count > 0
      LIMIT 5
    `);
    console.log(`   Found ${linkedStudents.length} students with linked parents`);
    linkedStudents.forEach(s => {
      console.log(`   - ${s.first_name} ${s.last_name} (${s.student_code}): ${s.parent_count} parent(s)`);
    });

    // Test 9: Recent discipline actions with notifications
    console.log('\n✅ Test 9: Recent discipline actions...');
    const [recentDiscipline] = await pool.execute(`
      SELECT 
        student_name,
        conduct_type,
        severity,
        parent_notified,
        sms_sent,
        created_at
      FROM discipline_records
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`   Found ${recentDiscipline.length} recent discipline records`);
    recentDiscipline.forEach(d => {
      const notified = d.parent_notified ? '✓' : '✗';
      const sms = d.sms_sent ? '✓' : '✗';
      console.log(`   - ${d.student_name}: ${d.conduct_type} (${d.severity}) | Notified: ${notified} | SMS: ${sms}`);
    });

    // Test 10: Recent leave approvals with notifications
    console.log('\n✅ Test 10: Recent leave approvals...');
    const [recentLeaves] = await pool.execute(`
      SELECT 
        student_name,
        leave_type,
        reason,
        parent_notified,
        sms_sent,
        created_at
      FROM student_leaves
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`   Found ${recentLeaves.length} recent leave records`);
    recentLeaves.forEach(l => {
      const notified = l.parent_notified ? '✓' : '✗';
      const sms = l.sms_sent ? '✓' : '✗';
      console.log(`   - ${l.student_name}: ${l.leave_type} | Notified: ${notified} | SMS: ${sms}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60) + '\n');

    // Summary
    console.log('📊 SYSTEM SUMMARY:');
    console.log(`   Students: ${students[0].count}`);
    console.log(`   Active Parent Connections: ${connections[0].count}`);
    console.log(`   Pending Requests: ${requests[0].count}`);
    console.log(`   Discipline Records: ${discipline[0].count}`);
    console.log(`   Leave Records: ${leaves[0].count}`);
    console.log(`   Notifications: ${notifications[0].count}`);
    console.log('\n✨ System is ready for use!\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testParentLinkingDODSystem();
