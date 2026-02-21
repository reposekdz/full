const mysql = require('mysql2/promise');

async function fixCaseInsensitiveSearch() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('🔧 Fixing case-insensitive student search...\n');

    // Drop and recreate stored procedure with case-insensitive search
    await connection.query('DROP PROCEDURE IF EXISTS sp_submit_parent_linking_application');
    
    await connection.query(`
      CREATE PROCEDURE sp_submit_parent_linking_application(
        IN p_parent_id INT,
        IN p_child_first_name VARCHAR(100),
        IN p_child_last_name VARCHAR(100),
        IN p_child_gender VARCHAR(10),
        IN p_child_trade_code VARCHAR(10),
        IN p_child_level_number INT,
        IN p_relationship VARCHAR(50),
        IN p_notes TEXT,
        OUT p_application_id INT,
        OUT p_matched_student_id INT,
        OUT p_status VARCHAR(20)
      )
      BEGIN
        DECLARE v_student_id INT DEFAULT NULL;
        DECLARE v_app_code VARCHAR(50);
        
        -- Generate unique application code: PLA2024XXXXXX
        SET v_app_code = CONCAT('PLA', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
        
        -- Find matching student (CASE INSENSITIVE)
        SELECT id INTO v_student_id
        FROM global_student_sheets
        WHERE LOWER(first_name) = LOWER(p_child_first_name)
          AND LOWER(last_name) = LOWER(p_child_last_name)
          AND gender = p_child_gender
          AND trade_code = p_child_trade_code
          AND level_number = p_child_level_number
          AND status = 'active'
        LIMIT 1;
        
        -- Insert application with auto-generated code
        INSERT INTO parent_linking_applications (
          application_code, parent_id, child_first_name, child_last_name, child_gender,
          child_trade_code, child_level_number, relationship, notes,
          matched_student_id, status
        ) VALUES (
          v_app_code, p_parent_id, p_child_first_name, p_child_last_name, p_child_gender,
          p_child_trade_code, p_child_level_number, p_relationship, p_notes,
          v_student_id, 'pending'
        );
        
        SET p_application_id = LAST_INSERT_ID();
        SET p_matched_student_id = v_student_id;
        SET p_status = IF(v_student_id IS NULL, 'no_match', 'pending');
      END
    `);

    console.log('✅ Stored procedure updated with case-insensitive search');
    console.log('✅ Now matches: "John" = "john" = "JOHN"');
    console.log('\n🎉 Fix complete! Parent applications will match students regardless of case.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixCaseInsensitiveSearch().catch(console.error);
