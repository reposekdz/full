const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuth() {
  try {
    // Check for admin users
    console.log('Checking for admin users...');
    const [admins] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'admin' 
      LIMIT 3
    `);
    
    if (admins.length === 0) {
      console.log('No admin users found. Creating admin user...');
      
      // Get admin role ID
      const [roleResult] = await pool.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', ['admin']);
      if (roleResult.length === 0) {
        console.log('Admin role does not exist. Creating admin role...');
        await pool.execute(`INSERT INTO roles (name, description) VALUES (?, ?)`, ['admin', 'System Administrator']);
        const [newRole] = await pool.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', ['admin']);
        var adminRoleId = newRole[0].id;
      } else {
        var adminRoleId = roleResult[0].id;
      }
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['admin', 'admin@school.com', hashedPassword, 'System', 'Admin', adminRoleId, 1]);
      
      console.log('✅ Admin user created: admin / admin123');
    } else {
      console.log('Found admin users:');
      admins.forEach(admin => {
        console.log(`- ${admin.username} (${admin.email}) - ${admin.first_name} ${admin.last_name}`);
      });
    }
    
    // Generate token for testing
    const adminUser = admins[0] || { id: 1, username: 'admin', role_name: 'admin' };
    const token = jwt.sign(
      { userId: adminUser.id, username: adminUser.username, role: adminUser.role_name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('\n🔑 Test Token (valid for 24h):');
    console.log(token);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testAuth();