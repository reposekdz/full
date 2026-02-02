const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestParent() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'garden_tvet_school'
  });

  try {
    const phone = '0796329328';
    const password = '1234567';
    
    console.log('🔍 Checking if parent already exists...\n');

    // Check if parent exists
    const [existing] = await connection.execute(
      'SELECT * FROM parents WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      console.log('⚠️  Parent already exists!');
      console.log('Updating password...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.execute(
        'UPDATE parents SET password_hash = ?, is_active = true WHERE phone = ?',
        [hashedPassword, phone]
      );
      
      console.log('✅ Password updated successfully!');
      console.log('\nLogin credentials:');
      console.log('Phone:', phone);
      console.log('Password:', password);
      console.log('\nYou can now login at: http://localhost:5173');
      console.log('Use the "Telefoni" tab\n');
    } else {
      console.log('📝 Creating new parent account...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = `parent_${Date.now()}`;
      const email = `parent_${phone}@garden.tvet`;
      
      await connection.execute(`
        INSERT INTO parents (
          username, email, password_hash, first_name, last_name,
          phone, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, true)
      `, [
        username,
        email,
        hashedPassword,
        'Test',
        'Parent',
        phone
      ]);
      
      console.log('✅ Parent account created successfully!');
      console.log('\nLogin credentials:');
      console.log('Phone:', phone);
      console.log('Password:', password);
      console.log('Email:', email);
      console.log('\nYou can now login at: http://localhost:5173');
      console.log('Use the "Telefoni" tab or "Email" tab\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createTestParent();
