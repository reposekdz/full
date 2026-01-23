const db = require('../config/database');

async function updateStudentAuthSchema() {
  console.log('🔄 Updating database schema for student authentication...\n');

  try {
    // Add serial_code column if not exists
    console.log('Adding serial_code column...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS serial_code VARCHAR(50) UNIQUE NULL AFTER username
    `);
    console.log('✅ serial_code column added\n');

    // Add parent_phone column if not exists
    console.log('Adding parent_phone column...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20) NULL AFTER phone
    `);
    console.log('✅ parent_phone column added\n');

    // Create index on serial_code for faster lookups
    console.log('Creating index on serial_code...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_serial_code ON users(serial_code)
    `);
    console.log('✅ Index created\n');

    // Make email optional for students
    console.log('Making email optional...');
    await db.query(`
      ALTER TABLE users 
      MODIFY COLUMN email VARCHAR(255) NULL
    `);
    console.log('✅ Email is now optional\n');

    // Make username optional for students
    console.log('Making username optional...');
    await db.query(`
      ALTER TABLE users 
      MODIFY COLUMN username VARCHAR(100) NULL
    `);
    console.log('✅ Username is now optional\n');

    console.log('✅ Database schema updated successfully!\n');
    console.log('📋 Summary:');
    console.log('   - serial_code column added (unique)');
    console.log('   - parent_phone column added');
    console.log('   - Index created on serial_code');
    console.log('   - Email made optional');
    console.log('   - Username made optional\n');

  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateStudentAuthSchema()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = updateStudentAuthSchema;
