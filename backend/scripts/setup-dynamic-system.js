const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDynamicSystem() {
  try {
    console.log('Setting up dynamic system...\n');
    
    const sqlFile = path.join(__dirname, 'setup-dynamic-system.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Dynamic system tables created');
    console.log('✅ Default configurations inserted');
    console.log('✅ Dashboard widgets configured');
    console.log('✅ Module permissions set');
    console.log('✅ Theme configuration initialized');
    console.log('\n🎉 Dynamic system setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

setupDynamicSystem();
