const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initContactSupportTables() {
  let connection;
  try {
    console.log('🚀 Creating Contact and Support Tables...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, 'create-contact-support-tables.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    await connection.query(sql);
    
    console.log('✅ Contact and Support tables created successfully!\n');
    console.log('Tables created:');
    console.log('  - contact_submissions');
    console.log('  - callback_requests');
    console.log('  - chat_messages');
    console.log('  - support_tickets');
    console.log('  - ticket_attachments');
    console.log('  - ticket_responses');
    console.log('  - knowledge_base (with sample articles)');
    console.log('  - article_ratings\n');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initContactSupportTables();
