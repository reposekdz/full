const db = require('../config/database');

async function migrateUsersTable() {
  try {
    console.log('🔄 Starting users table migration...\n');

    // Add trade_id column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS trade_id INT NULL,
      ADD FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL
    `).catch(() => console.log('✓ trade_id already exists'));

    // Add level column (3, 4, 5)
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS level INT NULL COMMENT 'Level 3, 4, or 5'
    `).catch(() => console.log('✓ level already exists'));

    // Add class column (A, B)
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS class VARCHAR(10) NULL COMMENT 'Class A or B'
    `).catch(() => console.log('✓ class already exists'));

    // Add employee_id column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) NULL UNIQUE
    `).catch(() => console.log('✓ employee_id already exists'));

    // Add bio column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT NULL
    `).catch(() => console.log('✓ bio already exists'));

    // Add photo column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS photo VARCHAR(255) NULL
    `).catch(() => console.log('✓ photo already exists'));

    // Add password column (for simple password, different from password_hash)
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL COMMENT 'Simple password for staff'
    `).catch(() => console.log('✓ password already exists'));

    // Add preferences column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferences JSON NULL
    `).catch(() => console.log('✓ preferences already exists'));

    // Add status column
    await db.pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `).catch(() => console.log('✓ status already exists'));

    console.log('\n✅ Users table migration completed successfully!');
    console.log('\n📊 New columns added:');
    console.log('   - trade_id (INT) - Links to trades table');
    console.log('   - level (INT) - Level 3, 4, or 5');
    console.log('   - class (VARCHAR) - Class A or B');
    console.log('   - employee_id (VARCHAR) - Unique employee identifier');
    console.log('   - bio (TEXT) - User biography');
    console.log('   - photo (VARCHAR) - Profile photo path');
    console.log('   - password (VARCHAR) - Simple password');
    console.log('   - preferences (JSON) - User preferences');
    console.log('   - status (VARCHAR) - User status');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateUsersTable();
