const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Read and execute comprehensive schema
    const schemaPath = path.join(__dirname, 'comprehensive-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing comprehensive database schema...');
    await connection.execute(schema);
    
    console.log('✅ Comprehensive database schema executed successfully!');
    
    // Now run content schema for homepage data
    const contentSchemaPath = path.join(__dirname, 'content-schema.sql');
    const contentSchema = fs.readFileSync(contentSchemaPath, 'utf8');
    
    console.log('Executing content management schema...');
    await connection.execute(contentSchema);
    
    console.log('✅ Content management schema executed successfully!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nCreated tables:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

runSchema();