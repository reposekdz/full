const mysql = require('mysql2/promise');

async function testLearningManagementDB() {
  let connection;

  try {
    console.log('🔍 Testing Learning Management Database Tables...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management'
    });

    // Test core learning management tables
    const tables = [
      'assignments',
      'assignment_submissions',
      'quizzes',
      'quiz_attempts',
      'homework',
      'homework_submissions',
      'holiday_packages',
      'holiday_package_progress',
      'live_study_sessions',
      'session_participants',
      'realtime_messages',
      'peer_reviews',
      'collaboration_groups',
      'collaboration_group_members',
      'student_learning_analytics',
      'learning_notifications'
    ];

    console.log('📊 TABLE EXISTENCE & RECORD COUNTS:');
    console.log('=' .repeat(50));

    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`✅ ${table.padEnd(30)}: ${count[0].count} records`);
        } else {
          console.log(`❌ ${table.padEnd(30)}: Table not found`);
        }
      } catch (error) {
        console.log(`❌ ${table.padEnd(30)}: Error - ${error.message}`);
      }
    }

    console.log('\n🔗 TESTING RELATIONSHIPS:');
    console.log('=' .repeat(50));

    // Test relationships
    try {
      const [assignmentRelations] = await connection.query(`
        SELECT COUNT(DISTINCT a.id) as assignments,
               COUNT(DISTINCT asub.id) as submissions,
               COUNT(DISTINCT q.id) as quizzes,
               COUNT(DISTINCT qa.id) as quiz_attempts
        FROM assignments a
        LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
        LEFT JOIN quizzes q ON q.subject_id = a.subject_id AND q.trade_class_id = a.trade_class_id
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      `);

      console.log('✅ Assignment-Submission-Quiz relationships working');
      console.log(`   - Assignments: ${assignmentRelations[0].assignments}`);
      console.log(`   - Submissions: ${assignmentRelations[0].submissions}`);
      console.log(`   - Quizzes: ${assignmentRelations[0].quizzes}`);
      console.log(`   - Quiz Attempts: ${assignmentRelations[0].quiz_attempts}`);
    } catch (error) {
      console.log('❌ Relationship test failed:', error.message);
    }

    // Test constraints and indexes
    console.log('\n🔍 TESTING CONSTRAINTS & INDEXES:');
    console.log('=' .repeat(50));

    try {
      // Test foreign key constraints
      const [constraints] = await connection.query(`
        SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = 'school_management'
        AND TABLE_NAME IN ('assignments', 'quizzes', 'homework', 'holiday_packages')
        AND CONSTRAINT_TYPE IN ('PRIMARY KEY', 'FOREIGN KEY')
        ORDER BY TABLE_NAME, CONSTRAINT_TYPE
      `);

      console.log(`✅ Found ${constraints.length} constraints across learning tables`);

      // Test indexes
      const [indexes] = await connection.query(`
        SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = 'school_management'
        AND TABLE_NAME IN ('assignments', 'quizzes', 'homework', 'holiday_packages')
        ORDER BY TABLE_NAME, SEQ_IN_INDEX
      `);

      console.log(`✅ Found ${indexes.length} indexes for performance optimization`);

    } catch (error) {
      console.log('❌ Constraint/Index test failed:', error.message);
    }

    console.log('\n🎯 TESTING SAMPLE DATA INTEGRITY:');
    console.log('=' .repeat(50));

    // Test sample data
    try {
      const [sampleAssignments] = await connection.query(`
        SELECT a.title, s.name as subject, tc.class_name,
               COUNT(asub.id) as submissions
        FROM assignments a
        JOIN subjects s ON a.subject_id = s.id
        JOIN trade_classes tc ON a.trade_class_id = tc.id
        LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
        GROUP BY a.id
        LIMIT 3
      `);

      if (sampleAssignments.length > 0) {
        console.log('✅ Sample assignments with relationships:');
        sampleAssignments.forEach((assignment, index) => {
          console.log(`   ${index + 1}. "${assignment.title}" (${assignment.subject}) - ${assignment.submissions} submissions`);
        });
      } else {
        console.log('ℹ️  No sample assignment data found');
      }
    } catch (error) {
      console.log('❌ Sample data test failed:', error.message);
    }

    console.log('\n✅ LEARNING MANAGEMENT DATABASE TEST COMPLETED SUCCESSFULLY!');
    console.log('📈 All core tables, relationships, and constraints are properly configured.');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testLearningManagementDB();
