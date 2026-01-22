const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupParentDetails() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS parent_details (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE,
      occupation VARCHAR(100),
      relationship ENUM('father','mother','guardian') DEFAULT 'guardian',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Parent details table created');
  await connection.end();
}

setupParentDetails().catch(console.error);
