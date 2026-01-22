const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const UNIFIED_EMAIL = 'reponse@gmail.com';
const UNIFIED_PASSWORD = '2026';

async function setupComprehensiveSystem() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🎓 Garden TVET School Management System - Comprehensive Setup');
    console.log('='.repeat(70) + '\n');

    connection = await pool.getConnection();
    
    // Read and execute schema files
    console.log('📋 Step 1: Creating database schema...');
    
    const schemaFiles = [
      'comprehensive-features-schema.sql',
      'advanced-features-schema.sql',
      'content-tables-schema.sql',
      'admin-tables-schema.sql',
      'roles-tables-schema.sql'
    ];

    for (const file of schemaFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`   - Executing ${file}...`);
        const schema = fs.readFileSync(filePath, 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.query(statement);
            } catch (error) {
              if (!error.message.includes('already exists')) {
                console.warn(`     Warning: ${error.message}`);
              }
            }
          }
        }
        console.log(`   ✓ ${file} executed successfully`);
      }
    }

    // Hash the unified password
    console.log('\n🔐 Step 2: Setting up authentication...');
    const hashedPassword = await bcrypt.hash(UNIFIED_PASSWORD, 10);
    console.log('   ✓ Password hashed');

    // Create roles if they don't exist
    console.log('\n👥 Step 3: Creating user roles...');
    const roles = [
      { name: 'student', description: 'Student role' },
      { name: 'parent', description: 'Parent role' },
      { name: 'teacher', description: 'Teacher role' },
      { name: 'director_study', description: 'Director of Study role' },
      { name: 'director_discipline', description: 'Director of Discipline role' },
      { name: 'headmaster', description: 'Head Master role' },
      { name: 'accountant', description: 'Accountant role' },
      { name: 'stock_manager', description: 'Stock Manager role' },
      { name: 'admin', description: 'Administrator role' }
    ];

    for (const role of roles) {
      await connection.query(`
        INSERT INTO roles (name, description)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE description = ?
      `, [role.name, role.description, role.description]);
      console.log(`   ✓ Role created: ${role.name}`);
    }

    // Create default staff users
    console.log('\n👨‍💼 Step 4: Creating default staff accounts...');
    
    const staffRoles = [
      'teacher',
      'director_study',
      'director_discipline',
      'headmaster',
      'accountant',
      'stock_manager',
      'admin'
    ];

    for (const roleName of staffRoles) {
      const [roleResult] = await connection.query(
        'SELECT id FROM roles WHERE name = ?',
        [roleName]
      );

      if (roleResult.length > 0) {
        const roleId = roleResult[0].id;
        const username = `${roleName}_default`;
        const firstName = roleName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        await connection.query(`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name, role_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE
            email = ?, password_hash = ?, first_name = ?, is_active = TRUE
        `, [
          username, UNIFIED_EMAIL, hashedPassword, firstName, 'User', roleId,
          UNIFIED_EMAIL, hashedPassword, firstName
        ]);

        console.log(`   ✓ Created/Updated: ${firstName} (${roleName})`);
      }
    }

    // Create admin_users entry
    console.log('\n🔧 Step 5: Setting up admin access...');
    await connection.query(`
      INSERT INTO admin_users (
        username, email, password, first_name, last_name, role
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = ?, password = ?, first_name = ?
    `, [
      'admin_default', UNIFIED_EMAIL, hashedPassword, 'Admin', 'User', 'admin',
      UNIFIED_EMAIL, hashedPassword, 'Admin'
    ]);
    console.log('   ✓ Admin account configured');

    // Create sample trades
    console.log('\n🎯 Step 6: Setting up trade programs...');
    const trades = [
      { code: 'SOD', name: 'Software Development', description: 'Learn programming and software engineering' },
      { code: 'BDC', name: 'Building Construction', description: 'Master construction and civil engineering' },
      { code: 'AUT', name: 'Automobile Technology', description: 'Automotive mechanics and technology' }
    ];

    for (const trade of trades) {
      await connection.query(`
        INSERT INTO trades (trade_code, trade_name, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE trade_name = ?, description = ?
      `, [trade.code, trade.name, trade.description, trade.name, trade.description]);
      console.log(`   ✓ Trade program: ${trade.name} (${trade.code})`);
    }

    // Create trade levels
    console.log('\n📚 Step 7: Setting up trade levels...');
    for (const trade of trades) {
      for (let level = 3; level <= 5; level++) {
        await connection.query(`
          INSERT INTO trade_levels (
            trade_code, trade_name, level_number, full_name, is_active
          ) VALUES (?, ?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE is_active = TRUE
        `, [
          trade.code,
          trade.name,
          level,
          `Level ${level} ${trade.name}`
        ]);
      }
      console.log(`   ✓ Levels created for ${trade.name}`);
    }

    // Create academic year
    console.log('\n📅 Step 8: Setting up academic year...');
    const currentYear = new Date().getFullYear();
    await connection.query(`
      INSERT INTO academic_years (
        year_name, start_date, end_date, is_active
      ) VALUES (?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE is_active = TRUE
    `, [
      `${currentYear}-${currentYear + 1}`,
      `${currentYear}-09-01`,
      `${currentYear + 1}-06-30`
    ]);
    console.log(`   ✓ Academic year: ${currentYear}-${currentYear + 1}`);

    // Create sample knowledge base articles
    console.log('\n📖 Step 9: Populating knowledge base...');
    const articles = [
      {
        category: 'Admissions',
        title: 'How to Apply for Admission',
        content: 'To apply for admission to Garden TVET School:\n1. Visit our admissions office\n2. Fill out the application form\n3. Submit required documents (O-Level certificate, ID, photos)\n4. Pay application fee\n5. Wait for admission decision\n\nRequired Documents:\n- Completed O-Level certificate\n- National ID or Birth Certificate\n- 2 passport photos\n- Application fee receipt'
      },
      {
        category: 'Academics',
        title: 'Course Registration Process',
        content: 'Course registration is done at the beginning of each semester:\n1. Meet with your academic advisor\n2. Select courses based on your program requirements\n3. Register online through the student portal\n4. Confirm registration and pay fees\n5. Attend orientation\n\nImportant: Registration must be completed within the first two weeks of the semester.'
      },
      {
        category: 'Finance',
        title: 'Payment Methods and Fee Structure',
        content: 'School fees can be paid through:\n- Mobile Money (MTN Mobile Money, Airtel Money)\n- Bank transfer to our account\n- Cash payment at the finance office\n- Installment plans (available upon request)\n\nPayment Schedule:\n- Full payment: 10% discount\n- Two installments: No discount\n- Three installments: 5% surcharge\n\nContact the finance office for scholarship opportunities.'
      },
      {
        category: 'Technical',
        title: 'Student Portal Access Guide',
        content: 'To access the student portal:\n1. Go to the school website\n2. Click on "Student Portal" in the header\n3. Enter your student ID as username\n4. Enter your password (default: your date of birth)\n5. Change your password on first login\n\nTroubleshooting:\n- Forgot password? Contact IT support\n- Account locked? Visit the IT office\n- Technical issues? Email support@gardentvet.rw'
      },
      {
        category: 'Student Services',
        title: 'Campus Facilities and Services',
        content: 'Garden TVET School offers:\n\nLibrary:\n- Open Monday-Saturday, 8 AM - 8 PM\n- Over 10,000 books and digital resources\n- Study rooms and computer lab\n\nHealth Center:\n- Basic medical services\n- First aid\n- Health counseling\n\nCounseling Services:\n- Academic counseling\n- Career guidance\n- Personal counseling\n\nSports Facilities:\n- Football field\n- Basketball court\n- Volleyball court\n- Gym'
      }
    ];

    for (const article of articles) {
      await connection.query(`
        INSERT INTO knowledge_base (category, title, content, is_published)
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE content = ?, is_published = TRUE
      `, [article.category, article.title, article.content, article.content]);
    }
    console.log(`   ✓ ${articles.length} knowledge base articles created`);

    // Create upload directories
    console.log('\n📁 Step 10: Creating upload directories...');
    const uploadDirs = [
      'uploads',
      'uploads/contact',
      'uploads/assignments',
      'uploads/tickets',
      'uploads/profiles',
      'uploads/documents'
    ];

    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   ✓ Created: ${dir}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Setup completed successfully!');
    console.log('='.repeat(70));
    console.log('\n📋 Default Login Credentials:');
    console.log('   Email:    ' + UNIFIED_EMAIL);
    console.log('   Password: ' + UNIFIED_PASSWORD);
    console.log('\n🔑 These credentials work for ALL staff roles:');
    console.log('   - Teacher');
    console.log('   - Director of Study');
    console.log('   - Director of Discipline');
    console.log('   - Head Master');
    console.log('   - Accountant');
    console.log('   - Stock Manager');
    console.log('   - Administrator');
    console.log('\n💡 Staff can change their email and password through their dashboard.');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupComprehensiveSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { setupComprehensiveSystem };
