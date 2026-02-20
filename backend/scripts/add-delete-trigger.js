const mysql = require('mysql2/promise');

async function addDeleteTrigger() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  console.log('Adding DELETE trigger for conduct restoration...\n');

  // Drop existing trigger
  await connection.query('DROP TRIGGER IF EXISTS restore_conduct_on_delete');

  // Create new trigger
  const triggerSQL = `
    CREATE TRIGGER restore_conduct_on_delete
    BEFORE DELETE ON student_conduct_records
    FOR EACH ROW
    BEGIN
        DECLARE current_score INT DEFAULT 0;
        DECLARE points_to_restore INT DEFAULT 0;
        
        SELECT conduct_score INTO current_score 
        FROM global_student_sheets 
        WHERE id = OLD.student_id;
        
        SET points_to_restore = CASE OLD.severity
            WHEN 'minor' THEN 1
            WHEN 'moderate' THEN 2
            WHEN 'major' THEN 3
            WHEN 'severe' THEN 4
            ELSE 2
        END;
        
        UPDATE global_student_sheets 
        SET 
            conduct_score = LEAST(40, current_score + points_to_restore),
            conduct_grade = CASE
                WHEN LEAST(40, current_score + points_to_restore) >= 36 THEN 'A'
                WHEN LEAST(40, current_score + points_to_restore) >= 32 THEN 'B'
                WHEN LEAST(40, current_score + points_to_restore) >= 28 THEN 'C'
                WHEN LEAST(40, current_score + points_to_restore) >= 24 THEN 'D'
                ELSE 'F'
            END
        WHERE id = OLD.student_id;
    END
  `;

  await connection.query(triggerSQL);
  console.log('✅ DELETE trigger created successfully');
  console.log('   - Points will be restored automatically when conduct is removed');
  console.log('   - Max score capped at 40\n');

  await connection.end();
}

addDeleteTrigger();
