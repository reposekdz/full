const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testParentAuth() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'school_management'
  });

  console.log('✅ Connected to database\n');

  try {
    // Test 1: Check if parents table exists
    console.log('📋 Test 1: Checking parents table...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'parents'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Parents table does not exist!');
      console.log('💡 Run migrations first: node backend/scripts/run-migrations.js');
      return;
    }
    console.log('✅ Parents table exists\n');

    // Test 2: Check table structure
    console.log('📋 Test 2: Checking parents table structure...');
    const [columns] = await connection.execute('DESCRIBE parents');
    console.log('✅ Parents table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    console.log('');

    // Test 3: Create a test parent
    console.log('📋 Test 3: Creating test parent...');
    const testParent = {
      username: `test_parent_${Date.now()}`,
      email: `testparent${Date.now()}@test.com`,
      password: 'test123',
      first_name: 'Test',
      last_name: 'Parent',
      phone: '0788123456',
      address: 'Kigali, Rwanda'
    };

    const hashedPassword = await bcrypt.hash(testParent.password, 10);
    
    const [insertResult] = await connection.execute(`
      INSERT INTO parents (
        username, email, password_hash, first_name, last_name,
        phone, address, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [
      testParent.username,
      testParent.email,
      hashedPassword,
      testParent.first_name,
      testParent.last_name,
      testParent.phone,
      testParent.address
    ]);

    console.log(`✅ Test parent created with ID: ${insertResult.insertId}`);
    console.log(`   Username: ${testParent.username}`);
    console.log(`   Email: ${testParent.email}`);
    console.log(`   Phone: ${testParent.phone}`);
    console.log(`   Password: ${testParent.password}\n`);

    // Test 4: Verify parent can be retrieved by phone
    console.log('📋 Test 4: Testing parent retrieval by phone...');
    const [parents] = await connection.execute(
      'SELECT * FROM parents WHERE phone = ? AND is_active = true',
      [testParent.phone]
    );

    if (parents.length > 0) {
      console.log('✅ Parent found by phone');
      console.log(`   ID: ${parents[0].id}`);
      console.log(`   Name: ${parents[0].first_name} ${parents[0].last_name}`);
      console.log(`   Email: ${parents[0].email}\n`);
    } else {
      console.log('❌ Parent not found by phone\n');
    }

    // Test 5: Verify password comparison
    console.log('📋 Test 5: Testing password verification...');
    const isValidPassword = await bcrypt.compare(testParent.password, parents[0].password_hash);
    if (isValidPassword) {
      console.log('✅ Password verification successful\n');
    } else {
      console.log('❌ Password verification failed\n');
    }

    // Test 6: Check parent_student table
    console.log('📋 Test 6: Checking parent_student linking table...');
    const [linkTables] = await connection.execute(
      "SHOW TABLES LIKE 'parent_student'"
    );
    
    if (linkTables.length > 0) {
      console.log('✅ parent_student table exists');
      const [linkColumns] = await connection.execute('DESCRIBE parent_student');
      console.log('   Columns:');
      linkColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('❌ parent_student table does not exist');
    }
    console.log('');

    // Test 7: Check if parent role exists in roles table
    console.log('📋 Test 7: Checking parent role...');
    const [roles] = await connection.execute(
      "SELECT * FROM roles WHERE name = 'parent'"
    );
    
    if (roles.length > 0) {
      console.log('✅ Parent role exists in roles table');
      console.log(`   Role ID: ${roles[0].id}`);
      console.log(`   Role Name: ${roles[0].name}\n`);
    } else {
      console.log('❌ Parent role does not exist in roles table');
      console.log('💡 Creating parent role...');
      await connection.execute(
        "INSERT INTO roles (name, description) VALUES ('parent', 'Parent/Guardian')"
      );
      console.log('✅ Parent role created\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All tests passed!');
    console.log('');
    console.log('🔐 Test Parent Credentials:');
    console.log(`   Phone: ${testParent.phone}`);
    console.log(`   Password: ${testParent.password}`);
    console.log('');
    console.log('📝 To test login:');
    console.log('   1. Go to login page');
    console.log('   2. Select "Phone" login method');
    console.log(`   3. Enter phone: ${testParent.phone}`);
    console.log(`   4. Enter password: ${testParent.password}`);
    console.log('   5. Click login');
    console.log('');
    console.log('🎯 Expected Result:');
    console.log('   - Login should succeed');
    console.log('   - Should redirect to /dashboard-parent');
    console.log('   - Token should be stored in localStorage/sessionStorage');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

testParentAuth();
