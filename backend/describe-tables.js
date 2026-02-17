const { pool } = require('./config/database');
async function describeTable(table) {
    try {
        const [rows] = await pool.query(`DESCRIBE ${table}`);
        console.log(table, JSON.stringify(rows));
    } catch (err) {
        console.error(table, err.message);
    }
}
async function run() {
    await describeTable('student_conduct_records');
    await describeTable('student_sheet_custom_values');
    await describeTable('student_sheets');
    await describeTable('student_counseling_sessions');
    await describeTable('stock_items');
    process.exit(0);
}
run();
