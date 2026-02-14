const mysql = require('mysql2/promise');
require('dotenv').config();

const integrateGlobalSheetsAllRoles = async () => {
  let connection;
  
  try {
    console.log('============================================');
    console.log('GLOBAL STUDENT SHEETS - ALL ROLES INTEGRATION');
    console.log('============================================\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });
    
    console.log('✓ Connected to database\n');
    
    // 1. Ensure global_student_sheets table exists
    console.log('1. Verifying global_student_sheets table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS global_student_sheets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        student_code VARCHAR(50) UNIQUE,
        email VARCHAR(255),
        phone VARCHAR(20),
        trade_id INT,
        trade_code VARCHAR(10),
        trade_name VARCHAR(100),
        level_id INT,
        level_number INT,
        level_name VARCHAR(50),
        status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
        average_marks DECIMAL(5,2) DEFAULT 0,
        attendance_percentage DECIMAL(5,2) DEFAULT 0,
        conduct_score INT DEFAULT 100,
        total_fees DECIMAL(10,2) DEFAULT 0,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0,
        payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE SET NULL,
        INDEX idx_trade (trade_id),
        INDEX idx_level (level_id),
        INDEX idx_status (status),
        INDEX idx_student_code (student_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✓ global_student_sheets table verified\n');
    
    // 2. Create role permissions table
    console.log('2. Creating role_permissions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_name VARCHAR(50) NOT NULL,
        permission_name VARCHAR(100) NOT NULL,
        can_view BOOLEAN DEFAULT TRUE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        can_export BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_permission (role_name, permission_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✓ role_permissions table created\n');
    
    // 3. Insert permissions for all staff roles
    console.log('3. Setting up permissions for all staff roles...');
    const roles = [
      { role: 'accountant', view: true, edit: true, delete: false, export: true },
      { role: 'dos', view: true, edit: true, delete: true, export: true },
      { role: 'dod', view: true, edit: true, delete: false, export: true },
      { role: 'headmaster', view: true, edit: true, delete: true, export: true },
      { role: 'teacher', view: true, edit: true, delete: false, export: true },
      { role: 'advisor', view: true, edit: true, delete: false, export: true },
      { role: 'stock_manager', view: true, edit: false, delete: false, export: true },
      { role: 'matron', view: true, edit: true, delete: false, export: true },
      { role: 'patron', view: true, edit: true, delete: false, export: true },
      { role: 'admin', view: true, edit: true, delete: true, export: true }
    ];
    
    for (const role of roles) {
      try {
        await connection.execute(`
          INSERT INTO role_permissions (role_name, permission_name, can_view, can_edit, can_delete, can_export)
          VALUES (?, 'global_student_sheets', ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          can_view = VALUES(can_view),
          can_edit = VALUES(can_edit),
          can_delete = VALUES(can_delete),
          can_export = VALUES(can_export)
        `, [role.role, role.view, role.edit, role.delete, role.export]);
        console.log(`   ✓ ${role.role} permissions set`);
      } catch (err) {
        console.log(`   ⚠ ${role.role} permissions skipped (${err.message})`);
      }
    }
    console.log('\n');
    
    // 4. Sync students to global_student_sheets
    console.log('4. Syncing students to global_student_sheets...');
    await connection.execute(`
      INSERT INTO global_student_sheets (
        student_id, first_name, last_name, student_code, email, phone,
        trade_id, trade_code, trade_name, level_id, level_number, level_name, status
      )
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.student_code,
        u.email,
        u.phone,
        u.trade_id,
        t.code,
        t.name,
        u.level_id,
        l.level_number,
        l.name,
        u.status
      FROM users u
      LEFT JOIN trades t ON u.trade_id = t.id
      LEFT JOIN levels l ON u.level_id = l.id
      WHERE u.role = 'student'
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        email = VALUES(email),
        phone = VALUES(phone),
        trade_id = VALUES(trade_id),
        trade_code = VALUES(trade_code),
        trade_name = VALUES(trade_name),
        level_id = VALUES(level_id),
        level_number = VALUES(level_number),
        level_name = VALUES(level_name),
        status = VALUES(status)
    `);
    
    const [studentCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM global_student_sheets'
    );
    console.log(`   ✓ ${studentCount[0].count} students synced\n`);
    
    // 5. Update financial data
    console.log('5. Updating financial data...');
    await connection.execute(`
      UPDATE global_student_sheets gss
      LEFT JOIN (
        SELECT 
          student_id,
          SUM(amount) as total_fees,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
        FROM student_fees
        GROUP BY student_id
      ) sf ON gss.student_id = sf.student_id
      SET 
        gss.total_fees = COALESCE(sf.total_fees, 0),
        gss.paid_amount = COALESCE(sf.paid_amount, 0),
        gss.balance = COALESCE(sf.total_fees, 0) - COALESCE(sf.paid_amount, 0),
        gss.payment_status = CASE
          WHEN COALESCE(sf.paid_amount, 0) >= COALESCE(sf.total_fees, 0) AND COALESCE(sf.total_fees, 0) > 0 THEN 'paid'
          WHEN COALESCE(sf.paid_amount, 0) > 0 THEN 'partial'
          ELSE 'unpaid'
        END
    `);
    console.log('   ✓ Financial data updated\n');
    
    // 6. Update academic data
    console.log('6. Updating academic data...');
    await connection.execute(`
      UPDATE global_student_sheets gss
      LEFT JOIN (
        SELECT 
          student_id,
          AVG(marks) as avg_marks
        FROM marks
        GROUP BY student_id
      ) m ON gss.student_id = m.student_id
      SET gss.average_marks = COALESCE(m.avg_marks, 0)
    `);
    console.log('   ✓ Academic data updated\n');
    
    // 7. Update attendance data
    console.log('7. Updating attendance data...');
    await connection.execute(`
      UPDATE global_student_sheets gss
      LEFT JOIN (
        SELECT 
          student_id,
          (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as attendance_pct
        FROM attendance
        GROUP BY student_id
      ) a ON gss.student_id = a.student_id
      SET gss.attendance_percentage = COALESCE(a.attendance_pct, 0)
    `);
    console.log('   ✓ Attendance data updated\n');
    
    // 8. Update conduct scores
    console.log('8. Updating conduct scores...');
    await connection.execute(`
      UPDATE global_student_sheets gss
      LEFT JOIN (
        SELECT 
          student_id,
          conduct_score
        FROM discipline_records
        WHERE id IN (
          SELECT MAX(id) FROM discipline_records GROUP BY student_id
        )
      ) d ON gss.student_id = d.student_id
      SET gss.conduct_score = COALESCE(d.conduct_score, 100)
    `);
    console.log('   ✓ Conduct scores updated\n');
    
    // 9. Create view for easy access
    console.log('9. Creating view for easy access...');
    await connection.execute(`DROP VIEW IF EXISTS v_global_student_sheets`);
    await connection.execute(`
      CREATE VIEW v_global_student_sheets AS
      SELECT 
        gss.*,
        t.name as trade_full_name,
        l.name as level_full_name,
        CONCAT(gss.first_name, ' ', gss.last_name) as full_name,
        CASE 
          WHEN gss.average_marks >= 80 THEN 'Excellent'
          WHEN gss.average_marks >= 70 THEN 'Very Good'
          WHEN gss.average_marks >= 60 THEN 'Good'
          WHEN gss.average_marks >= 50 THEN 'Fair'
          ELSE 'Poor'
        END as performance_grade,
        CASE
          WHEN gss.attendance_percentage >= 95 THEN 'Excellent'
          WHEN gss.attendance_percentage >= 85 THEN 'Good'
          WHEN gss.attendance_percentage >= 75 THEN 'Fair'
          ELSE 'Poor'
        END as attendance_grade,
        CASE
          WHEN gss.conduct_score >= 90 THEN 'Excellent'
          WHEN gss.conduct_score >= 75 THEN 'Good'
          WHEN gss.conduct_score >= 60 THEN 'Fair'
          ELSE 'Poor'
        END as conduct_grade
      FROM global_student_sheets gss
      LEFT JOIN trades t ON gss.trade_id = t.id
      LEFT JOIN levels l ON gss.level_id = l.id
    `);
    console.log('   ✓ View created\n');
    
    // 10. Create stored procedure for updates
    console.log('10. Creating stored procedures...');
    await connection.execute(`DROP PROCEDURE IF EXISTS sp_sync_global_student_sheets`);
    await connection.execute(`
      CREATE PROCEDURE sp_sync_global_student_sheets()
      BEGIN
        -- Sync basic student info
        INSERT INTO global_student_sheets (
          student_id, first_name, last_name, student_code, email, phone,
          trade_id, trade_code, trade_name, level_id, level_number, level_name, status
        )
        SELECT 
          u.id, u.first_name, u.last_name, u.student_code, u.email, u.phone,
          u.trade_id, t.code, t.name, u.level_id, l.level_number, l.name, u.status
        FROM users u
        LEFT JOIN trades t ON u.trade_id = t.id
        LEFT JOIN levels l ON u.level_id = l.id
        WHERE u.role = 'student'
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          email = VALUES(email),
          phone = VALUES(phone),
          trade_id = VALUES(trade_id),
          trade_code = VALUES(trade_code),
          trade_name = VALUES(trade_name),
          level_id = VALUES(level_id),
          level_number = VALUES(level_number),
          level_name = VALUES(level_name),
          status = VALUES(status);
        
        -- Update financial data
        UPDATE global_student_sheets gss
        LEFT JOIN (
          SELECT student_id, SUM(amount) as total_fees,
                 SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
          FROM student_fees GROUP BY student_id
        ) sf ON gss.student_id = sf.student_id
        SET gss.total_fees = COALESCE(sf.total_fees, 0),
            gss.paid_amount = COALESCE(sf.paid_amount, 0),
            gss.balance = COALESCE(sf.total_fees, 0) - COALESCE(sf.paid_amount, 0),
            gss.payment_status = CASE
              WHEN COALESCE(sf.paid_amount, 0) >= COALESCE(sf.total_fees, 0) AND COALESCE(sf.total_fees, 0) > 0 THEN 'paid'
              WHEN COALESCE(sf.paid_amount, 0) > 0 THEN 'partial'
              ELSE 'unpaid'
            END;
        
        -- Update academic data
        UPDATE global_student_sheets gss
        LEFT JOIN (SELECT student_id, AVG(marks) as avg_marks FROM marks GROUP BY student_id) m 
        ON gss.student_id = m.student_id
        SET gss.average_marks = COALESCE(m.avg_marks, 0);
        
        -- Update attendance
        UPDATE global_student_sheets gss
        LEFT JOIN (
          SELECT student_id, (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as attendance_pct
          FROM attendance GROUP BY student_id
        ) a ON gss.student_id = a.student_id
        SET gss.attendance_percentage = COALESCE(a.attendance_pct, 0);
        
        -- Update conduct
        UPDATE global_student_sheets gss
        LEFT JOIN (
          SELECT student_id, conduct_score FROM discipline_records
          WHERE id IN (SELECT MAX(id) FROM discipline_records GROUP BY student_id)
        ) d ON gss.student_id = d.student_id
        SET gss.conduct_score = COALESCE(d.conduct_score, 100);
      END
    `);
    console.log('   ✓ Stored procedure created\n');
    
    // 11. Verify permissions
    console.log('11. Verifying role permissions...');
    const [permissions] = await connection.execute(`
      SELECT role_name, can_view, can_edit, can_delete, can_export
      FROM role_permissions
      WHERE permission_name = 'global_student_sheets'
      ORDER BY role_name
    `);
    
    console.log('\n   Role Permissions Summary:');
    console.log('   ' + '='.repeat(70));
    console.log('   Role              | View | Edit | Delete | Export');
    console.log('   ' + '-'.repeat(70));
    permissions.forEach(p => {
      console.log(`   ${p.role_name.padEnd(17)} | ${p.can_view ? '✓' : '✗'}    | ${p.can_edit ? '✓' : '✗'}    | ${p.can_delete ? '✓' : '✗'}      | ${p.can_export ? '✓' : '✗'}`);
    });
    console.log('   ' + '='.repeat(70) + '\n');
    
    console.log('============================================');
    console.log('✅ INTEGRATION COMPLETE!');
    console.log('============================================\n');
    console.log('Global Student Sheets is now accessible to:');
    console.log('✓ Accountant - View, Edit, Export');
    console.log('✓ DOS - View, Edit, Delete, Export');
    console.log('✓ DOD - View, Edit, Export');
    console.log('✓ Headmaster - View, Edit, Delete, Export');
    console.log('✓ Teacher - View, Edit, Export');
    console.log('✓ Advisor - View, Edit, Export');
    console.log('✓ Stock Manager - View, Export');
    console.log('✓ Matron/Patron - View, Edit, Export');
    console.log('✓ Admin - Full Access\n');
    console.log('API Endpoint: /api/global-sheets/students');
    console.log('View: v_global_student_sheets');
    console.log('Sync Procedure: CALL sp_sync_global_student_sheets()\n');
    
  } catch (error) {
    console.error('\n============================================');
    console.error('❌ ERROR: Integration failed');
    console.error('============================================\n');
    console.error('Error details:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database credentials in .env file');
    console.error('2. MySQL server is running');
    console.error('3. Database "school_management" exists');
    console.error('4. Required tables exist (users, trades, levels)\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the integration
integrateGlobalSheetsAllRoles();
