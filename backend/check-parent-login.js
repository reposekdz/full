const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkParentCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'garden_tvet_school'
  });

  try {
    console.log('🔍 Checking for parent with phone: 0796329328\n');

    // Check in parents table
    const [parents] = await connection.execute(
      'SELECT * FROM parents WHERE phone = ?',
      ['0796329328']
    );

    if (parents.length > 0) {
      console.log('✅ Found in parents table:');
      console.log('ID:', parents[0].id);
      console.log('Username:', parents[0].username);
      console.log('Email:', parents[0].email);
      console.log('Phone:', parents[0].phone);
      console.log('First Name:', parents[0].first_name);
      console.log('Last Name:', parents[0].last_name);
      console.log('Is Active:', parents[0].is_active);
      console.log('Has Password:', parents[0].password_hash ? 'Yes' : 'No');
      console.log('\n');
    } else {
      console.log('❌ Not found in parents table\n');
    }

    // Check in users table (in case registered as user)
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE phone = ?',
      ['0796329328']
    );

    if (users.length > 0) {
      console.log('✅ Found in users table:');
      console.log('ID:', users[0].id);
      console.log('Username:', users[0].username);
      console.log('Email:', users[0].email);
      console.log('Phone:', users[0].phone);
      console.log('Role:', users[0].role);
      console.log('Is Active:', users[0].is_active);
      console.log('Has Password:', users[0].password_hash ? 'Yes' : 'No');
      console.log('\n');
    } else {
      console.log('❌ Not found in users table\n');
    }

    // Check all parents
    const [allParents] = await connection.execute(
      'SELECT id, username, email, phone, first_name, last_name, is_active FROM parents LIMIT 10'
    );

    console.log('📋 All parents in database (first 10):');
    console.table(allParents);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkParentCredentials();
