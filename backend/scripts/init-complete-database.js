const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;

  try {
    console.log('🔄 Connecting to MySQL server...');

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    console.log(`🔄 Creating database ${process.env.DB_NAME}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log('✅ Database created/selected');

    // Read and execute the schema file
    console.log('🔄 Reading schema file...');
    const schemaPath = path.join(__dirname, 'complete-advanced-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Executing schema...');
    // Split by semicolon and execute each statement separately
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('✅ Schema executed successfully');

    // Insert default admin user
    console.log('🔄 Creating default admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Get super_admin role_id
    const [superAdminRole] = await connection.query('SELECT id FROM roles WHERE name = "super_admin"');
    const superAdminRoleId = superAdminRole.length > 0 ? superAdminRole[0].id : 1;

    await connection.query(`
      INSERT INTO users (username, email, password_hash, role, role_id, first_name, last_name, is_active)
      VALUES ('admin', 'admin@school.com', ?, 'super_admin', ?, 'System', 'Administrator', TRUE)
      ON DUPLICATE KEY UPDATE password_hash = password_hash
    `, [hashedPassword, superAdminRoleId]);
    console.log('✅ Default admin user created (username: admin, password: admin123)');

    // Insert sample data
    console.log('🔄 Inserting sample data...');

    // Sample classes
    await connection.query(`
      INSERT INTO classes (class_name, trade, level, academic_year_id, room_number, capacity)
      VALUES 
        ('SOD Level 4 - Class A', 'SOD', 'Level 4', 1, 'Lab A1', 45),
        ('BDC Level 4 - Class A', 'BDC', 'Level 4', 1, 'Room 301', 40),
        ('AUT Level 4 - Class A', 'AUT', 'Level 4', 1, 'Auto Lab 1', 35),
        ('SOD Level 3 - Class A', 'SOD', 'Level 3', 1, 'Lab A2', 42),
        ('BDC Level 3 - Class A', 'BDC', 'Level 3', 1, 'Room 201', 38),
        ('AUT Level 3 - Class A', 'AUT', 'Level 3', 1, 'Auto Lab 2', 40)
      ON DUPLICATE KEY UPDATE class_name = class_name
    `);

    // Sample trade courses
    await connection.query(`
      INSERT INTO trade_courses (code, name, name_rw, trade, level, duration_weeks, description, is_active)
      VALUES 
        ('SOD401', 'Advanced Web Development', 'Iterambere rya Urubuga', 'SOD', 'Level 4', 12, 'Comprehensive web development course covering modern frameworks', TRUE),
        ('BDC401', 'Construction Project Management', 'Imicungire y\\'Imishinga y\\'Ubwubatsi', 'BDC', 'Level 4', 14, 'Advanced construction management and project planning', TRUE),
        ('AUT401', 'Automotive Electronics', 'Elegitoronike y\\'Imodoka', 'AUT', 'Level 4', 12, 'Modern automotive electrical systems and diagnostics', TRUE)
      ON DUPLICATE KEY UPDATE name = name
    `);

    // Sample teams
    await connection.query(`
      INSERT INTO teams (name, role, head_name, team_size, description, avatar_emoji, color_gradient, is_active, sort_order)
      VALUES 
        ('Academic Team', 'Education Management', 'Dr. Jean Uwimana', 15, 'Responsible for curriculum development and academic excellence', '📚', 'from-blue-500 to-indigo-500', TRUE, 1),
        ('Administration Team', 'School Management', 'Ms. Grace Mukamana', 12, 'Handles administrative operations and school management', '🏢', 'from-purple-500 to-pink-500', TRUE, 2),
        ('Finance Team', 'Financial Management', 'Mr. Patrick Habimana', 8, 'Manages school finances and budgeting', '💰', 'from-green-500 to-emerald-500', TRUE, 3),
        ('IT Team', 'Technology Support', 'Eng. David Mugabo', 6, 'Provides technical support and maintains IT infrastructure', '💻', 'from-cyan-500 to-blue-500', TRUE, 4)
      ON DUPLICATE KEY UPDATE name = name
    `);

    console.log('✅ Sample data inserted');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Database created/updated');
    console.log('   - All tables created');
    console.log('   - Default admin user created');
    console.log('   - Sample data inserted');
    console.log('\n🔐 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@school.com');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
