const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupCMS() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    const schema = fs.readFileSync(path.join(__dirname, 'cms-schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('✅ CMS table created');

    const uploadDir = path.join(__dirname, '..', 'uploads', 'cms');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ CMS upload directory created');
    }

    console.log('\n✅ CMS setup completed!');
    console.log('Admin can now manage:');
    console.log('  - Homepage content');
    console.log('  - Sports sections');
    console.log('  - Services');
    console.log('  - Trades');
    console.log('  - Leadership');
    console.log('  - Developers');
    console.log('  - Support');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

setupCMS().then(() => process.exit(0)).catch(() => process.exit(1));
