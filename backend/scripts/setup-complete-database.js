const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL server...');
    
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    console.log('🔄 Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log(`✅ Database ${process.env.DB_NAME} ready`);

    // Read and execute the SQL file
    console.log('🔄 Reading SQL schema file...');
    const sqlFile = path.join(__dirname, 'fix-database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL content by semicolons and execute each statement
    console.log('🔄 Executing SQL schema...');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await connection.query(statement);
        } catch (error) {
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate entry')) {
            console.warn(`Warning on statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    console.log('🔄 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Check if admin user exists
    const [adminUsers] = await connection.query('SELECT COUNT(*) as count FROM admin_users');
    console.log(`✅ Admin users: ${adminUsers[0].count}`);

    // Check content data
    const [slides] = await connection.query('SELECT COUNT(*) as count FROM slides');
    const [news] = await connection.query('SELECT COUNT(*) as count FROM news_articles');
    const [testimonials] = await connection.query('SELECT COUNT(*) as count FROM testimonials');
    
    console.log(`✅ Content data loaded:`);
    console.log(`   - Slides: ${slides[0].count}`);
    console.log(`   - News articles: ${news[0].count}`);
    console.log(`   - Testimonials: ${testimonials[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@school.rw');
    console.log('   Password: password (default bcrypt hash)');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.sql) {
      console.error('SQL Error:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();