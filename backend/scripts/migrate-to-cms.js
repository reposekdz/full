const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateAllData() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('✅ Connected to database');
    console.log('🔄 Migrating all existing data to CMS...\n');

    // Sports
    try {
      const [sports] = await connection.query('SELECT * FROM sports_teams');
      for (const item of sports) {
        await connection.query(
          'INSERT INTO cms_content (section, title, description, image, active) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['sports', item.name, item.description, item.image, 1]
        );
      }
      console.log(`✅ Migrated ${sports.length} sports items`);
    } catch (e) { console.log('⚠️  Sports table not found'); }

    // Services
    try {
      const [services] = await connection.query('SELECT * FROM school_services');
      for (const item of services) {
        await connection.query(
          'INSERT INTO cms_content (section, title, description, image, active) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['services', item.title, item.description, item.icon, 1]
        );
      }
      console.log(`✅ Migrated ${services.length} services items`);
    } catch (e) { console.log('⚠️  Services table not found'); }

    // Trades
    try {
      const [trades] = await connection.query('SELECT * FROM trades');
      for (const item of trades) {
        await connection.query(
          'INSERT INTO cms_content (section, title, description, image, content, active) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['trades', item.name, item.description, item.image, item.curriculum, 1]
        );
      }
      console.log(`✅ Migrated ${trades.length} trades items`);
    } catch (e) { console.log('⚠️  Trades table not found'); }

    // Leadership
    try {
      const [leadership] = await connection.query('SELECT * FROM leadership');
      for (const item of leadership) {
        await connection.query(
          'INSERT INTO cms_content (section, title, subtitle, description, image, active) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['leadership', item.name, item.position, item.bio, item.image, 1]
        );
      }
      console.log(`✅ Migrated ${leadership.length} leadership items`);
    } catch (e) { console.log('⚠️  Leadership table not found'); }

    // Developers
    try {
      const [developers] = await connection.query('SELECT * FROM developers');
      for (const item of developers) {
        await connection.query(
          'INSERT INTO cms_content (section, title, subtitle, description, image, active) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['developers', item.name, item.role, item.bio, item.image, 1]
        );
      }
      console.log(`✅ Migrated ${developers.length} developers items`);
    } catch (e) { console.log('⚠️  Developers table not found'); }

    // Homepage
    try {
      const [homepage] = await connection.query('SELECT * FROM homepage_content');
      for (const item of homepage) {
        await connection.query(
          'INSERT INTO cms_content (section, title, content, image, active) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          ['homepage', item.section, item.content, item.image, 1]
        );
      }
      console.log(`✅ Migrated ${homepage.length} homepage items`);
    } catch (e) { console.log('⚠️  Homepage table not found'); }

    console.log('\n✅ Migration completed!');
    console.log('Admin can now manage all content from CMS dashboard');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

migrateAllData().then(() => process.exit(0)).catch(() => process.exit(1));
