const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const students = [
    { code: '561108160896', name: 'HAKIZIMANA Philippe', gender: 'MALE' },
    { code: '561009160153', name: 'ZAMIRU YAZIDI SURAYIMANI', gender: 'MALE' },
    { code: '561004150161', name: 'SHIMWA Ritha', gender: 'FEMALE' },
    { code: '561003160433', name: 'UMURERWA Diane', gender: 'FEMALE' },
    { code: '560901190195', name: 'IRAMUZI John', gender: 'MALE' },
    { code: '560715220190', name: 'MUGISHA ELYSE', gender: 'MALE' },
    { code: '560515250012', name: 'NYIRAMUCYO Irene', gender: 'FEMALE' },
    { code: '560102220026', name: 'TWIZERIMANA OLIVIER', gender: 'MALE' },
    { code: '550607190591', name: 'BIGIRINDAVYI Andy Brinel', gender: 'MALE' },
    { code: '550603200229', name: 'UWIRAGIYE Bernardine', gender: 'FEMALE' },
    { code: '550603150560', name: 'NZAYITURIKI Rachel', gender: 'FEMALE' },
    { code: '550602220571', gender: 'MALE', name: 'TUYISHIME INNOCENT' },
    { code: '550503160863', name: 'NIYOMUGENGA MARIE GRACE', gender: 'FEMALE' },
    { code: '550114200201', name: 'HAGABIMANA VALENS', gender: 'MALE' },
    { code: '550114200166', name: 'MUNYEHIRWE OBAMA', gender: 'MALE' },
    { code: '540611160704', name: 'ishimwe eric', gender: 'MALE' },
    { code: '540420210018', name: 'GISUBIZO ELLIONE', gender: 'FEMALE' },
    { code: '511115190076', name: 'NIYONSENGA Frank', gender: 'MALE' },
    { code: '510707220023', name: 'IRADUKUNDA Esther', gender: 'FEMALE' },
    { code: '430825160224', name: 'NIYONKURU REPONSE', gender: 'MALE' },
    { code: '330906172956', name: 'UWIDUHAYE KEVINE', gender: 'FEMALE' },
    { code: '280511161709', name: 'NIYITANGA Sarah', gender: 'FEMALE' },
    { code: '280113220135', name: 'UMUHIRE MANZI KELLIA', gender: 'FEMALE' },
    { code: '210104220042', name: 'UWAMAHORO Vanessa', gender: 'FEMALE' },
    { code: '130801190627', name: 'MVUYEKURE King', gender: 'MALE' },
    { code: '120922160104', name: 'UWASE ANGE', gender: 'FEMALE' },
    { code: '120203183581', name: 'MUSONI MUGISHA Yves', gender: 'MALE' },
    { code: '120131221009', name: 'MUTUYIMANA VIVIANE', gender: 'FEMALE' },
    { code: '110901200265', name: 'ISHIMWE CEDRICK', gender: 'MALE' }
];

async function importStudents() {
    console.log('🚀 Starting Robust L4 SOD Student Import...');

    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_management',
        multipleStatements: true
    });

    try {
        // 1. Check/Fix Schema for users table
        console.log('Checking users table schema...');
        const [userCols] = await pool.query('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);

        if (!userFields.includes('password_hash') && userFields.includes('password')) {
            console.log('Renaming password to password_hash in users table...');
            await pool.query('ALTER TABLE users CHANGE password password_hash VARCHAR(255)');
        }

        // 2. Check/Fix Schema for student_profiles
        console.log('Ensuring student_profiles table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT UNIQUE NOT NULL,
                admission_number VARCHAR(50) UNIQUE,
                guardian_name VARCHAR(100),
                guardian_phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Check columns in student_profiles
        const [profileCols] = await pool.query('DESCRIBE student_profiles');
        const profileFields = profileCols.map(c => c.Field);
        if (!profileFields.includes('user_id')) {
            console.log('Fixing student_profiles table (missing user_id)...');
            // This is complex, let's just recreate it if it's broken
            await pool.query('DROP TABLE IF EXISTS student_profiles');
            await pool.query(`
                CREATE TABLE student_profiles (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT UNIQUE NOT NULL,
                    admission_number VARCHAR(50) UNIQUE,
                    guardian_name VARCHAR(100),
                    guardian_phone VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
        }

        // 3. Ensure global_student_sheets exists
        console.log('Ensuring global_student_sheets table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS global_student_sheets (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id INT UNIQUE NOT NULL,
                student_code VARCHAR(50) UNIQUE NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                student_name VARCHAR(100),
                gender VARCHAR(20),
                trade_code VARCHAR(20),
                level_number INT,
                level_suffix VARCHAR(10),
                status VARCHAR(20) DEFAULT 'active',
                total_fees DECIMAL(15,2) DEFAULT 0,
                paid_amount DECIMAL(15,2) DEFAULT 0,
                balance DECIMAL(15,2) DEFAULT 0,
                payment_status VARCHAR(20) DEFAULT 'pending',
                academic_year VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 4. Get student role ID
        const [roleRows] = await pool.execute("SELECT id FROM roles WHERE name = 'student'");
        if (roleRows.length === 0) throw new Error('Student role not found');
        const studentRoleId = roleRows[0].id;

        const defaultPassword = await bcrypt.hash('student123', 10);
        let count = 0;

        for (const student of students) {
            try {
                const names = student.name.split(' ');
                const firstName = names[0];
                const lastName = names.slice(1).join(' ') || ' ';

                // 1. User
                const [uRows] = await pool.execute('SELECT id FROM users WHERE username = ?', [student.code]);
                let userId;
                if (uRows.length > 0) {
                    userId = uRows[0].id;
                } else {
                    const [uRes] = await pool.execute(
                        'INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
                        [student.code, `${student.code}@garden.edu.rw`, defaultPassword, firstName, lastName, studentRoleId]
                    );
                    userId = uRes.insertId;
                }

                // 2. Profile
                await pool.execute(
                    'INSERT INTO student_profiles (user_id, admission_number, guardian_name, guardian_phone) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE guardian_name = VALUES(guardian_name)',
                    [userId, student.code, 'Guardian of ' + student.name, '250780000000']
                );

                // 3. Global Sheet
                await pool.execute(
                    `INSERT INTO global_student_sheets 
                    (student_id, student_code, first_name, last_name, gender, trade_code, level_number, level_suffix, total_fees, paid_amount, academic_year)
                    VALUES (?, ?, ?, ?, ?, 'SOD', 4, 'A', 500000, 0, '2025-2026')
                    ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name)`,
                    [userId, student.code, firstName, lastName, student.gender]
                );

                count++;
                console.log(`✅ [${count}/${students.length}] ${student.name}`);
            } catch (e) {
                console.error(`❌ Failed student ${student.name}: ${e.message}`);
            }
        }

        console.log(`\n✨ Successfully processed ${count} students.`);
    } catch (error) {
        console.error('❌ Global error:', error);
    } finally {
        await pool.end();
    }
}

importStudents();
