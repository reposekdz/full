const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function getSampleData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    const [roles] = await connection.query("SELECT * FROM roles");
    console.log('Roles:', JSON.stringify(roles, null, 2));

    const [users] = await connection.query("SELECT id, first_name, last_name, role_id FROM users LIMIT 10");
    console.log('All Users Sample:', JSON.stringify(users, null, 2));

    const [classes] = await connection.query("SELECT * FROM classes LIMIT 5");
    console.log('Classes:', JSON.stringify(classes, null, 2));

    const [subjects] = await connection.query("SELECT * FROM subjects LIMIT 5");
    console.log('Subjects:', JSON.stringify(subjects, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getSampleData();
