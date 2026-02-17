const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('Starting migration to add missing columns to users table...');

    try {
        // Check current columns in users table
        const [columns] = await connection.execute('DESCRIBE users');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames.join(', '));

        // Add trade_code column if not exists
        if (!columnNames.includes('trade_code')) {
            await connection.execute('ALTER TABLE users ADD COLUMN trade_code VARCHAR(20) AFTER student_id');
            console.log('✅ Added trade_code column');
        } else {
            console.log('✓ trade_code column already exists');
        }

        // Add level column if not exists
        if (!columnNames.includes('level')) {
            await connection.execute('ALTER TABLE users ADD COLUMN level VARCHAR(20) AFTER trade_code');
            console.log('✅ Added level column');
        } else {
            console.log('✓ level column already exists');
        }

        // Add level_number column if not exists (for compatibility)
        if (!columnNames.includes('level_number')) {
            await connection.execute('ALTER TABLE users ADD COLUMN level_number INT AFTER level');
            console.log('✅ Added level_number column');
        } else {
            console.log('✓ level_number column already exists');
        }

        // Add province column if not exists
        if (!columnNames.includes('province')) {
            await connection.execute('ALTER TABLE users ADD COLUMN province VARCHAR(100) AFTER address');
            console.log('✅ Added province column');
        } else {
            console.log('✓ province column already exists');
        }

        // Add district column if not exists
        if (!columnNames.includes('district')) {
            await connection.execute('ALTER TABLE users ADD COLUMN district VARCHAR(100) AFTER province');
            console.log('✅ Added district column');
        } else {
            console.log('✓ district column already exists');
        }

        // Add sector column if not exists
        if (!columnNames.includes('sector')) {
            await connection.execute('ALTER TABLE users ADD COLUMN sector VARCHAR(100) AFTER district');
            console.log('✅ Added sector column');
        } else {
            console.log('✓ sector column already exists');
        }

        // Add status column if not exists (for compatibility)
        if (!columnNames.includes('status')) {
            await connection.execute('ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT "active" AFTER role');
            console.log('✅ Added status column');
        } else {
            console.log('✓ status column already exists');
        }

        // Add password column if not exists (for compatibility with some auth systems)
        if (!columnNames.includes('password')) {
            await connection.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER phone');
            console.log('✅ Added password column');
        } else {
            console.log('✓ password column already exists');
        }

        // Verify trades table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE "trades"');
        if (tables.length === 0) {
            console.log('⚠️ trades table does not exist, creating it...');
            await connection.execute(`
        CREATE TABLE trades (
          id INT PRIMARY KEY AUTO_INCREMENT,
          trade_code VARCHAR(10) UNIQUE,
          trade_name VARCHAR(100),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Insert default trades
            await connection.execute(`
        INSERT INTO trades (trade_code, trade_name, description) VALUES
        ('SOD', 'Software Development', 'Software Development program'),
        ('BDC', 'Building Construction', 'Building Construction program'),
        ('AUT', 'Automotive Technology', 'Automotive Technology program')
      `);
            console.log('✅ Created trades table with default data');
        }

        // Verify trade_levels table exists
        const [tlTables] = await connection.execute('SHOW TABLES LIKE "trade_levels"');
        if (tlTables.length === 0) {
            console.log('⚠️ trade_levels table does not exist, creating it...');
            await connection.execute(`
        CREATE TABLE trade_levels (
          id INT PRIMARY KEY AUTO_INCREMENT,
          trade_code VARCHAR(10),
          trade_name VARCHAR(100),
          level_number INT,
          level_suffix VARCHAR(10),
          full_name VARCHAR(200),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_trade_level (trade_code, level_number, level_suffix)
        )
      `);

            // Insert default levels
            await connection.execute(`
        INSERT INTO trade_levels (trade_code, trade_name, level_number, level_suffix, full_name) VALUES
        ('SOD', 'Software Development', 3, 'A', 'SOD Level 3'),
        ('SOD', 'Software Development', 4, 'A', 'SOD Level 4'),
        ('SOD', 'Software Development', 5, 'A', 'SOD Level 5'),
        ('BDC', 'Building Construction', 3, 'A', 'BDC Level 3'),
        ('BDC', 'Building Construction', 4, 'A', 'BDC Level 4'),
        ('BDC', 'Building Construction', 5, 'A', 'BDC Level 5'),
        ('AUT', 'Automotive Technology', 3, 'A', 'AUT Level 3'),
        ('AUT', 'Automotive Technology', 4, 'A', 'AUT Level 4'),
        ('AUT', 'Automotive Technology', 5, 'A', 'AUT Level 5')
      `);
            console.log('✅ Created trade_levels table with default data');
        }

        console.log('\n✅ Migration completed successfully!');

        // Display final columns
        const [finalColumns] = await connection.execute('DESCRIBE users');
        console.log('\nFinal users table columns:');
        finalColumns.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));

    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await connection.end();
    }
}

migrate();
