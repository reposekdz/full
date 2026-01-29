require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function addDODStaff() {
  let connection;
  try {
    console.log('Creating DOD staff accounts...');
    const hashedPassword = await bcrypt.hash('2026', 10);
    console.log('Password hashed successfully');
    
    const matronEmail = 'matron@reponsekdz06.com';
    const patronEmail = 'patron@reponsekdz06.com';
    
    connection = await pool.getConnection();
    
    console.log('\nProcessing Matron account...');
    const [existingMatron] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [matronEmail]
    );
    
    if (existingMatron.length === 0) {
      try {
        await connection.execute(`
          INSERT INTO users 
          (first_name, last_name, email, password, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'dod', 1, NOW(), NOW())
        `, ['Matron', 'DOD', matronEmail, hashedPassword]);
        console.log('✓ Matron account created successfully');
      } catch (insertError) {
        if (insertError.code === 'ER_NO_REFERENCED_ROW_2') {
          await connection.execute(`
            INSERT IGNORE INTO users 
            (first_name, last_name, email, password, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'dod', 1, NOW(), NOW())
          `, ['Matron', 'DOD', matronEmail, hashedPassword]);
          console.log('✓ Matron account created successfully (without role_id constraint)');
        } else {
          throw insertError;
        }
      }
    } else {
      await connection.execute(
        'UPDATE users SET password = ?, role = "dod", is_active = 1, updated_at = NOW() WHERE email = ?',
        [hashedPassword, matronEmail]
      );
      console.log('✓ Matron account updated successfully');
    }
    
    console.log('\nProcessing Patron account...');
    const [existingPatron] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [patronEmail]
    );
    
    if (existingPatron.length === 0) {
      try {
        await connection.execute(`
          INSERT INTO users 
          (first_name, last_name, email, password, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'dod', 1, NOW(), NOW())
        `, ['Patron', 'DOD', patronEmail, hashedPassword]);
        console.log('✓ Patron account created successfully');
      } catch (insertError) {
        if (insertError.code === 'ER_NO_REFERENCED_ROW_2') {
          await connection.execute(`
            INSERT IGNORE INTO users 
            (first_name, last_name, email, password, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'dod', 1, NOW(), NOW())
          `, ['Patron', 'DOD', patronEmail, hashedPassword]);
          console.log('✓ Patron account created successfully (without role_id constraint)');
        } else {
          throw insertError;
        }
      }
      console.log('✓ Patron account created successfully');
    } else {
      await pool.execute(
        'UPDATE users SET password = ?, role = "dod", is_active = 1 WHERE email = ?',
        [hashedPassword, patronEmail]
      );
      console.log('✓ Patron account updated successfully');
    }
    
    console.log('\n========================================');
    console.log('DOD Staff Accounts Setup Complete!');
    console.log('========================================');
    console.log('Matron Login:');
    console.log('  Email: matron@reponsekdz06.com');
    console.log('  Password: 2026');
    console.log('\nPatron Login:');
    console.log('  Email: patron@reponsekdz06.com');
    console.log('  Password: 2026');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding DOD staff:', error);
    process.exit(1);
  }
}

addDODStaff();
