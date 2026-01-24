const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupAdvancedFeatures() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'advanced-features-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Advanced features schema created');

    // Create upload directories
    const uploadDirs = [
      'uploads/knowledge',
      'uploads/admissions',
      'uploads/certificates',
      'uploads/alumni'
    ];

    for (const dir of uploadDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    }

    // Insert sample data
    await insertSampleData(connection);

    console.log('\n✅ Advanced features setup completed successfully!');
    console.log('\nNew Features Available:');
    console.log('  - Knowledge Base Management');
    console.log('  - Real-time Notifications System');
    console.log('  - Admission Workflows');
    console.log('  - Examination Scheduling');
    console.log('  - Certificate Generation');
    console.log('  - Alumni Management');
    console.log('  - SMS/Email Integration');
    console.log('  - Advanced Reporting & Export');
    console.log('  - Dashboard Analytics');

  } catch (error) {
    console.error('❌ Error setting up advanced features:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function insertSampleData(connection) {
  try {
    // Sample knowledge base categories
    await connection.query(`
      INSERT IGNORE INTO knowledge_articles (title, content, category, tags, author_id) VALUES
      ('Getting Started Guide', 'Welcome to the school management system...', 'Getting Started', 'guide,tutorial,basics', 1),
      ('Student Registration Process', 'Step-by-step guide for registering new students...', 'Administration', 'students,registration,admin', 1),
      ('Grading System Overview', 'Understanding how grades are calculated...', 'Academics', 'grades,assessment,academics', 1)
    `);
    console.log('✅ Sample knowledge base articles created');

    // Sample certificate templates
    await connection.query(`
      INSERT IGNORE INTO certificate_templates (name, type, design, fields) VALUES
      ('Completion Certificate', 'completion', '{}', '["student_name","course_name","completion_date"]'),
      ('Achievement Award', 'achievement', '{}', '["student_name","achievement","date"]'),
      ('Graduation Certificate', 'graduation', '{}', '["student_name","program","graduation_year"]')
    `);
    console.log('✅ Sample certificate templates created');

    // Sample email templates
    await connection.query(`
      INSERT IGNORE INTO email_templates (name, subject, body, variables) VALUES
      ('Welcome Email', 'Welcome to {{school_name}}', 'Dear {{student_name}}, Welcome to our school...', '["school_name","student_name"]'),
      ('Exam Reminder', 'Upcoming Exam: {{exam_name}}', 'This is a reminder about your exam on {{exam_date}}...', '["exam_name","exam_date"]'),
      ('Grade Report', 'Your Grade Report for {{term}}', 'Dear {{student_name}}, Your grades for {{term}} are now available...', '["student_name","term"]')
    `);
    console.log('✅ Sample email templates created');

    // Sample SMS templates
    await connection.query(`
      INSERT IGNORE INTO sms_templates (name, message, variables) VALUES
      ('Attendance Alert', 'Your child {{student_name}} was absent on {{date}}', '["student_name","date"]'),
      ('Fee Reminder', 'Fee payment reminder for {{student_name}}. Amount: {{amount}}', '["student_name","amount"]'),
      ('Event Notification', 'School event: {{event_name}} on {{date}}', '["event_name","date"]')
    `);
    console.log('✅ Sample SMS templates created');

    // Sample rooms for exam scheduling
    try {
      await connection.query(`
        INSERT IGNORE INTO rooms (name, capacity, building, floor) VALUES
        ('Room A101', 40, 'Main Building', 1),
        ('Room A102', 35, 'Main Building', 1),
        ('Room B201', 50, 'Science Building', 2),
        ('Hall 1', 200, 'Assembly Hall', 1)
      `);
      console.log('✅ Sample rooms created');
    } catch (err) {
      console.log('⚠️  Rooms table may not exist yet - skipping sample rooms');
    }

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Run setup
setupAdvancedFeatures()
  .then(() => {
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
