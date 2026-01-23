const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDOS() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('🔧 Updating DOS information...');

    await connection.query(
      `UPDATE leadership 
       SET name = ?, 
           image_url = ?
       WHERE role LIKE '%Amasomo%'`,
      ['Masezerano Issac', '/uploads/leadership/masezerano issac DOS.jpeg']
    );

    console.log('✅ DOS updated successfully!');

  } catch (error) {
    console.error('❌ Error updating DOS:', error);
  } finally {
    await connection.end();
  }
}

updateDOS();
