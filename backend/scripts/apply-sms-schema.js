const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applySMSSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_management',
        multipleStatements: true
    });

    try {
        console.log('🔧 Applying SMS system schema...\n');

        // Read the SQL file
        const sqlFile = path.join(__dirname, 'sms-system-schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL
        await connection.query(sql);

        console.log('✅ SMS system schema applied successfully!\n');

        // Verify
        const [templates] = await connection.query('SELECT COUNT(*) as count FROM sms_templates');
        console.log(`✓ SMS Templates initialized: ${templates[0].count}`);

    } catch (error) {
        console.error('❌ Error applying SMS schema:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

applySMSSchema().catch(console.error);
