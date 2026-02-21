import mysql from 'mysql2/promise';

async function fixParentLogin() {
  console.log('🔧 FIXING PARENT LOGIN INFINITE LOADING...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // 1. Ensure parent_child_links table exists
    console.log('📊 Checking parent_child_links table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_child_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        linked_by INT NOT NULL,
        linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        permissions JSON NULL,
        relationship_type VARCHAR(20) DEFAULT 'parent',
        INDEX idx_parent_id (parent_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_link (parent_id, student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ parent_child_links table ready\n');

    // 2. Check all parent users
    console.log('👥 Checking parent users...');
    const [parents] = await connection.execute(`
      SELECT id, username, CONCAT(first_name, ' ', last_name) as name, phone, email
      FROM users 
      WHERE role = 'parent'
    `);
    console.log(`✅ Found ${parents.length} parent users\n`);

    // 3. Check linked children for each parent
    console.log('🔗 Checking parent-child links...');
    for (const parent of parents) {
      const [links] = await connection.execute(
        'SELECT COUNT(*) as count FROM parent_child_links WHERE parent_id = ? AND status = "active"',
        [parent.id]
      );
      console.log(`   Parent ${parent.name} (${parent.phone}): ${links[0].count} linked children`);
    }
    console.log('');

    // 4. Ensure password_hash column exists
    console.log('🔐 Checking password_hash column...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users LIKE 'password_hash'
    `);
    if (columns.length === 0) {
      console.log('   Adding password_hash column...');
      await connection.execute(`
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER password
      `);
      // Copy password to password_hash if exists
      await connection.execute(`
        UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL
      `);
    }
    console.log('✅ password_hash column ready\n');

    // 5. Ensure is_active column exists
    console.log('✅ Checking is_active column...');
    const [activeCol] = await connection.execute(`
      SHOW COLUMNS FROM users LIKE 'is_active'
    `);
    if (activeCol.length === 0) {
      console.log('   Adding is_active column...');
      await connection.execute(`
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
    }
    console.log('✅ is_active column ready\n');

    // 6. Set all parents to active
    console.log('🔓 Activating all parent accounts...');
    await connection.execute(`
      UPDATE users SET is_active = TRUE WHERE role = 'parent'
    `);
    console.log('✅ All parent accounts activated\n');

    // 7. Test parent login query
    console.log('🧪 Testing parent login query...');
    const testPhone = parents.length > 0 ? parents[0].phone : '+250788000000';
    const [testResult] = await connection.execute(`
      SELECT u.*, COUNT(pcl.id) as linked_children
      FROM users u
      LEFT JOIN parent_child_links pcl ON u.id = pcl.parent_id AND pcl.status = 'active'
      WHERE u.phone = ? AND u.role = 'parent' AND u.is_active = TRUE
      GROUP BY u.id
    `, [testPhone]);
    console.log(`✅ Query test successful: ${testResult.length} result(s)\n`);

    console.log('🎉 PARENT LOGIN FIX COMPLETE!\n');
    console.log('📋 Summary:');
    console.log(`   ✅ ${parents.length} parent accounts found`);
    console.log('   ✅ parent_child_links table ready');
    console.log('   ✅ password_hash column ready');
    console.log('   ✅ is_active column ready');
    console.log('   ✅ All parents activated');
    console.log('   ✅ Login query tested\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Restart backend: cd backend && npm start');
    console.log('   2. Test parent login with phone number');
    console.log('   3. Check browser console for errors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixParentLogin();
