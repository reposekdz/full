const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupContentManagement() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../migrations/content_management_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✓ Content management tables created');

    // Create upload directories
    const uploadDirs = ['sports', 'leadership', 'trades', 'developers', 'profiles'];
    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, `../uploads/${dir}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: uploads/${dir}`);
      }
    }

    console.log('\n✅ Content Management System setup complete!');
    console.log('\nYou can now:');
    console.log('- Manage Sports teams');
    console.log('- Manage Leadership profiles');
    console.log('- Manage Trade programs');
    console.log('- Manage Developer profiles');
    console.log('- Update profile images');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupContentManagement();
