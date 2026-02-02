const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixParentRole() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'garden_tvet_school'
  });

  try {
    const phone = '0796329328';
    
    console.log('🔧 Fixing parent role for phone:', phone);
    console.log('');

    // Get parent role ID
    const [parentRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "parent"'
    );

    if (parentRole.length === 0) {
      console.log('❌ Parent role not found in roles table!');
      console.log('Creating parent role...\n');
      
      await connection.execute(
        'INSERT INTO roles (name, description) VALUES ("parent", "Parent/Guardian")'
      );
      
      const [newRole] = await connection.execute(
        'SELECT id FROM roles WHERE name = "parent"'
      );
      
      parentRole[0] = newRole[0];
      console.log('✅ Parent role created!\n');
    }

    const parentRoleId = parentRole[0].id;

    // Update the user's role
    const [result] = await connection.execute(
      'UPDATE users SET role = "parent", role_id = ? WHERE phone = ?',
      [parentRoleId, phone]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Successfully updated user role to parent!');
      console.log('');
      console.log('User can now login with:');
      console.log('Phone:', phone);
      console.log('Password: 1234567');
      console.log('');
      console.log('Go to: http://localhost:5173');
      console.log('Select: Telefoni tab');
      console.log('');
    } else {
      console.log('❌ No user found with that phone number');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixParentRole();
