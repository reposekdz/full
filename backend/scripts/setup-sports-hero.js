const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupSportsHero() {
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
    const schemaPath = path.join(__dirname, '../migrations/sports_hero_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✓ Sports and Hero tables created');

    // Create upload directories
    const uploadDirs = ['sports', 'hero'];
    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, `../uploads/${dir}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: uploads/${dir}`);
      }
    }

    console.log('\n✅ Sports & Hero Management Setup Complete!');
    console.log('\nYou can now manage:');
    console.log('- Sports Teams');
    console.log('- Players');
    console.log('- Coaches');
    console.log('- Achievements');
    console.log('- Hero Section Slides');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupSportsHero();
