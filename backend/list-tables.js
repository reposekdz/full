const { pool } = require('./config/database');
async function listTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log(JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listTables();
