const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const UNIFIED_EMAIL = 'reponse@gmail.com';
const UNIFIED_PASSWORD = '2026';

const STAFF_ROLES = [
  'teacher',
  'director_study',
  'director_discipline',
  'headmaster',
  'accountant',
  'stock_manager',
  'admin'
];

async function initializeStaffCredentials() {
  try {
    console.log('Initializing default staff credentials...');

    // Hash the unified password
    const hashedPassword = await bcrypt.hash(UNIFIED_PASSWORD, 10);

    // Get all staff role IDs
    const [roles] = await pool.execute(`
      SELECT id, name FROM roles WHERE name IN (${STAFF_ROLES.map(() => '?').join(',')})
    `, STAFF_ROLES);

    console.log(`Found ${roles.length} staff roles`);

    // Create or update default staff user for each role
    for (const role of roles) {
      const username = `${role.name}_default`;
      const firstName = role.name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE username = ? OR (email = ? AND role_id = ?)',
        [username, UNIFIED_EMAIL, role.id]
      );

      if (existingUsers.length > 0) {
        // Update existing user
        await pool.execute(`
          UPDATE users
          SET email = ?, password_hash = ?, first_name = ?, last_name = ?, is_active = TRUE
          WHERE id = ?
        `, [UNIFIED_EMAIL, hashedPassword, firstName, 'User', existingUsers[0].id]);

        console.log(`✓ Updated default credentials for ${role.name}`);
      } else {
        // Create new user
        await pool.execute(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name, role_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, TRUE)
        `, [username, UNIFIED_EMAIL, hashedPassword, firstName, 'User', role.id]);

        console.log(`✓ Created default credentials for ${role.name}`);
      }
    }

    // Also create/update admin_users table entry
    const [adminUsers] = await pool.execute(
      'SELECT id FROM admin_users WHERE username = ? OR email = ?',
      ['admin_default', UNIFIED_EMAIL]
    );

    if (adminUsers.length > 0) {
      await pool.execute(`
        UPDATE admin_users
        SET email = ?, password = ?, first_name = ?, last_name = ?, role = 'admin'
        WHERE id = ?
      `, [UNIFIED_EMAIL, hashedPassword, 'Admin', 'User', adminUsers[0].id]);

      console.log('✓ Updated admin_users default credentials');
    } else {
      await pool.execute(`
        INSERT INTO admin_users (
          username, email, password, first_name, last_name, role
        ) VALUES (?, ?, ?, ?, ?, 'admin')
      `, ['admin_default', UNIFIED_EMAIL, hashedPassword, 'Admin', 'User']);

      console.log('✓ Created admin_users default credentials');
    }

    console.log('\n✅ Default staff credentials initialized successfully!');
    console.log(`\nDefault Login Credentials:`);
    console.log(`Email: ${UNIFIED_EMAIL}`);
    console.log(`Password: ${UNIFIED_PASSWORD}`);
    console.log(`\nThese credentials work for all staff roles.`);
    console.log(`Staff can change their email and password through their dashboard profile settings.`);

  } catch (error) {
    console.error('Error initializing staff credentials:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeStaffCredentials()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initializeStaffCredentials };
