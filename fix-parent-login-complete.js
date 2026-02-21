import mysql from 'mysql2/promise';

async function fixParentLoginComplete() {
  console.log('🔧 FIXING PARENT LOGIN COMPLETELY...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // 1. Ensure all required tables exist
    console.log('📊 Checking tables...');
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
        UNIQUE KEY unique_link (parent_id, student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Tables ready\n');

    // 2. Fix password_hash column
    console.log('🔐 Fixing password columns...');
    const [cols] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'password_hash'`);
    if (cols.length === 0) {
      await connection.execute(`ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL`);
      await connection.execute(`UPDATE users SET password_hash = password WHERE password_hash IS NULL`);
    }
    console.log('✅ Password columns fixed\n');

    // 3. Ensure is_active column
    const [activeCols] = await connection.execute(`SHOW COLUMNS FROM users LIKE 'is_active'`);
    if (activeCols.length === 0) {
      await connection.execute(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE`);
    }
    await connection.execute(`UPDATE users SET is_active = TRUE WHERE role = 'parent'`);
    console.log('✅ All parents activated\n');

    // 4. Test parent login query
    console.log('🧪 Testing parent login query...');
    const [testParents] = await connection.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.phone,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        COUNT(pcl.id) as linked_children
      FROM users u
      LEFT JOIN parent_child_links pcl ON u.id = pcl.parent_id AND pcl.status = 'active'
      WHERE u.role = 'parent' AND u.is_active = TRUE
      GROUP BY u.id
    `);
    console.log(`✅ Found ${testParents.length} parent(s)\n`);

    testParents.forEach(p => {
      console.log(`   👤 ${p.first_name} ${p.last_name} (${p.phone}) - ${p.linked_children} children`);
    });

    console.log('\n🎉 PARENT LOGIN FIX COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Tables verified');
    console.log('   ✅ Password columns fixed');
    console.log('   ✅ All parents activated');
    console.log(`   ✅ ${testParents.length} parent account(s) ready\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixParentLoginComplete();
