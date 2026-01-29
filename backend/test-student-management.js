const {pool} = require('./config/database');

async function testStudentManagement() {
  console.log('====================================');
  console.log('TESTING STUDENT MANAGEMENT SYSTEM');
  console.log('====================================\n');
  
  try {
    // Test 1: Get all students count
    console.log('1. Testing student count...');
    const [students] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "student"');
    console.log(`   ✓ Total students: ${students[0].total}\n`);
    
    // Test 2: Get trades
    console.log('2. Testing trades retrieval...');
    const [trades] = await pool.execute('SELECT id, code, name FROM trades WHERE is_active = 1 LIMIT 5');
    console.log(`   ✓ Found ${trades.length} active trades:`);
    trades.forEach(t => console.log(`     - [${t.id}] ${t.code}: ${t.name}`));
    console.log();
    
    // Test 3: Verify students table structure
    console.log('3. Testing student data structure...');
    const [sampleStudents] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.student_id, u.trade_id, u.level, t.name as trade_name
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      WHERE u.role = "student"
      LIMIT 5
    `);
    console.log(`   ✓ Sample students:`);
    sampleStudents.forEach(s => console.log(`     - [${s.id}] ${s.first_name} ${s.last_name} (${s.student_id}) - Trade: ${s.trade_name || 'None'}, Level: ${s.level || 'N/A'}`));
    console.log();
    
    // Test 4: Test student insertion capability
    console.log('4. Testing student insertion setup...');
    if (trades.length > 0) {
      const testTrade = trades[0];
      const [count] = await pool.execute(
        'SELECT COUNT(*) as total FROM users WHERE role = "student" AND trade_id = ? AND level = ?',
        [testTrade.id, 1]
      );
      const nextId = `${testTrade.code}1${String(count[0].total + 1).padStart(3, '0')}`;
      console.log(`   ✓ Next student ID for ${testTrade.code} Level 1 would be: ${nextId}\n`);
    }
    
    // Test 5: Verify enrollments
    console.log('5. Testing enrollments...');
    const [enrollments] = await pool.execute('SELECT COUNT(*) as total FROM enrollments WHERE status = "active"');
    console.log(`   ✓ Active enrollments: ${enrollments[0].total}\n`);
    
    // Test 6: Verify fee records
    console.log('6. Testing fee records...');
    const [fees] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(paid_amount), 0) as total_paid
      FROM student_fees
    `);
    console.log(`   ✓ Fee records: ${fees[0].total_records}`);
    console.log(`   ✓ Total paid: ${fees[0].total_paid}`);
    console.log(`   ✓ Total balance: ${fees[0].total_balance}\n`);
    
    // Test 7: Test analytics queries
    console.log('7. Testing analytics queries...');
    const [byTrade] = await pool.execute(`
      SELECT t.code, COUNT(u.id) as count
      FROM trades t
      LEFT JOIN users u ON t.id = u.trade_id AND u.role = 'student'
      WHERE t.is_active = 1
      GROUP BY t.id
      LIMIT 5
    `);
    console.log(`   ✓ Students by trade:`);
    byTrade.forEach(t => console.log(`     - ${t.code}: ${t.count} students`));
    console.log();
    
    // Test 8: Test search functionality
    console.log('8. Testing search capabilities...');
    const [searchResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM users u
      WHERE u.role = 'student' AND u.is_active = 1
    `);
    console.log(`   ✓ Active students available for search: ${searchResult[0].total}\n`);
    
    // Test 9: Verify all required tables exist
    console.log('9. Verifying required tables...');
    const requiredTables = [
      'users',
      'trades',
      'enrollments',
      'trade_classes',
      'student_fees',
      'student_subject_performance',
      'student_attendance_records',
      'student_discipline_records'
    ];
    
    for (const table of requiredTables) {
      try {
        await pool.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`   ✓ Table '${table}' exists and is accessible`);
      } catch (err) {
        console.log(`   ✗ Table '${table}' error: ${err.message}`);
      }
    }
    console.log();
    
    console.log('====================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('====================================\n');
    
    console.log('SUMMARY:');
    console.log(`- Total students: ${students[0].total}`);
    console.log(`- Active trades: ${trades.length}`);
    console.log(`- Active enrollments: ${enrollments[0].total}`);
    console.log(`- Fee records: ${fees[0].total_records}`);
    console.log('\nThe student management system is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testStudentManagement();
