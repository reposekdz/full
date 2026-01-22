const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;
  try {
    console.log('🚀 Initializing Database...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS school_management');
    await connection.query('USE school_management');
    console.log('✅ Database ready\n');

    // Drop existing tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['assignment_submissions', 'quiz_attempts', 'homework_submissions', 'holiday_package_progress', 
                    'session_participants', 'realtime_messages', 'peer_reviews', 'collaboration_group_members',
                    'study_group_members', 'forum_posts', 'resource_interactions', 'student_badges', 'student_points',
                    'student_levels', 'student_learning_paths', 'student_concept_mastery', 'learning_analytics_events',
                    'predictive_analytics', 'engagement_metrics', 'parent_communications', 'parent_student_links',
                    'ai_grading_results', 'assignments', 'quizzes', 'homework', 'holiday_packages', 'live_study_sessions',
                    'collaboration_groups', 'study_groups', 'discussion_forums', 'learning_resources', 'question_bank',
                    'adaptive_assessments', 'achievement_badges', 'leaderboards', 'learning_paths', 'knowledge_graph',
                    'academic_calendar', 'study_schedules', 'parent_accounts', 'ai_grading_models', 'student_learning_analytics',
                    'learning_notifications', 'enrollments', 'trade_classes', 'subjects', 'users'];
    
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Cleaned existing tables\n');

    // Create base tables
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'dos', 'admin', 'parent') NOT NULL,
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE trade_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        class_name VARCHAR(100),
        level VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Base tables created\n');

    // Create learning management tables
    await connection.query(`
      CREATE TABLE assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        trade_class_id INT NOT NULL,
        assignment_type ENUM('homework', 'project', 'presentation', 'research', 'lab_work') DEFAULT 'homework',
        total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        instructions TEXT,
        attachments JSON NULL,
        due_date DATETIME NOT NULL,
        submission_deadline DATETIME NOT NULL,
        allow_late_submission BOOLEAN DEFAULT false,
        late_submission_penalty DECIMAL(5,2) DEFAULT 0.00,
        grading_rubric JSON NULL,
        is_published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );

      CREATE TABLE assignment_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_content TEXT,
        attachments JSON NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_late BOOLEAN DEFAULT false,
        late_days INT DEFAULT 0,
        status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
        marks_obtained DECIMAL(5,2) NULL,
        grade_letter VARCHAR(2) NULL,
        teacher_feedback TEXT NULL,
        graded_by INT NULL,
        graded_at TIMESTAMP NULL,
        plagiarism_score DECIMAL(5,2) DEFAULT 0.00,
        ai_detection_score DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id),
        UNIQUE KEY unique_submission (assignment_id, student_id)
      );

      CREATE TABLE quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        trade_class_id INT NOT NULL,
        quiz_type ENUM('practice', 'assessment', 'exam', 'pop_quiz') DEFAULT 'assessment',
        total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        duration_minutes INT NOT NULL,
        instructions TEXT,
        questions JSON NOT NULL,
        answer_key JSON NOT NULL,
        passing_score DECIMAL(5,2) DEFAULT 50.00,
        allow_retake BOOLEAN DEFAULT false,
        max_attempts INT DEFAULT 1,
        shuffle_questions BOOLEAN DEFAULT true,
        shuffle_options BOOLEAN DEFAULT true,
        show_results_immediately BOOLEAN DEFAULT false,
        scheduled_date DATETIME NULL,
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );

      CREATE TABLE quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_number INT DEFAULT 1,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        time_taken_minutes INT NULL,
        answers JSON NOT NULL,
        score DECIMAL(5,2) NULL,
        percentage DECIMAL(5,2) NULL,
        grade_letter VARCHAR(2) NULL,
        is_passed BOOLEAN NULL,
        status ENUM('in_progress', 'completed', 'timed_out', 'abandoned') DEFAULT 'in_progress',
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attempt (quiz_id, student_id, attempt_number)
      );
    `);
    console.log('✅ Core LMS tables created\n');

    // Continue with more tables
    await connection.query(`
      CREATE TABLE homework (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        trade_class_id INT NOT NULL,
        homework_type ENUM('daily', 'weekly', 'monthly', 'revision', 'practice') DEFAULT 'daily',
        total_marks DECIMAL(5,2) NOT NULL DEFAULT 50.00,
        instructions TEXT,
        resources JSON NULL,
        due_date DATE NOT NULL,
        submission_required BOOLEAN DEFAULT true,
        peer_review_required BOOLEAN DEFAULT false,
        parent_notification BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE
      );

      CREATE TABLE homework_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        homework_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_content TEXT,
        attachments JSON NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_late BOOLEAN DEFAULT false,
        status ENUM('pending', 'submitted', 'reviewed', 'graded') DEFAULT 'pending',
        marks_obtained DECIMAL(5,2) NULL,
        teacher_feedback TEXT NULL,
        peer_reviews JSON NULL,
        graded_by INT NULL,
        graded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id),
        UNIQUE KEY unique_submission (homework_id, student_id)
      );

      CREATE TABLE holiday_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        teacher_id INT NOT NULL,
        trade_class_id INT NOT NULL,
        package_type ENUM('revision', 'practice', 'project', 'reading', 'skill_building') DEFAULT 'revision',
        subject_id INT NULL,
        total_activities INT NOT NULL DEFAULT 1,
        estimated_duration_days INT DEFAULT 7,
        difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
        learning_objectives JSON NULL,
        resources JSON NOT NULL,
        instructions TEXT,
        submission_required BOOLEAN DEFAULT true,
        peer_collaboration BOOLEAN DEFAULT false,
        parent_involvement BOOLEAN DEFAULT false,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE holiday_package_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT NOT NULL,
        student_id INT NOT NULL,
        activity_completed INT DEFAULT 0,
        total_activities INT NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        submission_content JSON NULL,
        submitted_at TIMESTAMP NULL,
        teacher_feedback TEXT NULL,
        marks_obtained DECIMAL(5,2) NULL,
        status ENUM('not_started', 'in_progress', 'completed', 'submitted', 'graded') DEFAULT 'not_started',
        graded_by INT NULL,
        graded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES holiday_packages(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id),
        UNIQUE KEY unique_progress (package_id, student_id)
      );
    `);
    console.log('✅ Homework & Holiday tables created\n');

    await connection.query(`
      CREATE TABLE live_study_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        host_id INT NOT NULL,
        session_type ENUM('class', 'study_group', 'office_hours', 'peer_tutoring', 'q_and_a') DEFAULT 'study_group',
        subject_id INT NULL,
        trade_class_id INT NULL,
        max_participants INT DEFAULT 50,
        is_scheduled BOOLEAN DEFAULT false,
        scheduled_start DATETIME NULL,
        scheduled_end DATETIME NULL,
        actual_start TIMESTAMP NULL,
        actual_end TIMESTAMP NULL,
        status ENUM('scheduled', 'active', 'ended', 'cancelled') DEFAULT 'scheduled',
        meeting_link VARCHAR(500) NULL,
        access_code VARCHAR(20) NULL,
        recording_enabled BOOLEAN DEFAULT false,
        recording_url VARCHAR(500) NULL,
        participants JSON NULL,
        session_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id)
      );

      CREATE TABLE session_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('host', 'co_host', 'presenter', 'participant') DEFAULT 'participant',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP NULL,
        participation_score DECIMAL(5,2) DEFAULT 0.00,
        notes TEXT NULL,
        FOREIGN KEY (session_id) REFERENCES live_study_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (session_id, user_id)
      );

      CREATE TABLE realtime_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        sender_id INT NOT NULL,
        message_type ENUM('text', 'file', 'emoji', 'system') DEFAULT 'text',
        content TEXT NOT NULL,
        attachments JSON NULL,
        is_private BOOLEAN DEFAULT false,
        recipient_id INT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP NULL,
        FOREIGN KEY (session_id) REFERENCES live_study_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id)
      );

      CREATE TABLE peer_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        submission_type ENUM('assignment', 'homework', 'project') NOT NULL,
        reviewer_id INT NOT NULL,
        review_content TEXT NOT NULL,
        rating DECIMAL(3,2) NULL,
        criteria_ratings JSON NULL,
        is_anonymous BOOLEAN DEFAULT true,
        helpful_votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE collaboration_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        creator_id INT NOT NULL,
        subject_id INT NULL,
        trade_class_id INT NULL,
        max_members INT DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        collaboration_type ENUM('study_group', 'project_team', 'peer_learning', 'skill_sharing') DEFAULT 'study_group',
        rules TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id)
      );

      CREATE TABLE collaboration_group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('leader', 'member', 'observer') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        contribution_score DECIMAL(5,2) DEFAULT 0.00,
        FOREIGN KEY (group_id) REFERENCES collaboration_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_membership (group_id, user_id)
      );

      CREATE TABLE student_learning_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        assignments_completed INT DEFAULT 0,
        assignments_avg_score DECIMAL(5,2) DEFAULT 0.00,
        quizzes_taken INT DEFAULT 0,
        quizzes_avg_score DECIMAL(5,2) DEFAULT 0.00,
        homework_completed INT DEFAULT 0,
        homework_avg_score DECIMAL(5,2) DEFAULT 0.00,
        study_sessions_attended INT DEFAULT 0,
        total_study_hours DECIMAL(5,2) DEFAULT 0.00,
        peer_reviews_given INT DEFAULT 0,
        peer_reviews_received INT DEFAULT 0,
        collaboration_score DECIMAL(5,2) DEFAULT 0.00,
        improvement_trend DECIMAL(5,2) DEFAULT 0.00,
        strengths JSON NULL,
        areas_for_improvement JSON NULL,
        recommendations JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_analytics (student_id, subject_id, period_start, period_end)
      );

      CREATE TABLE learning_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_type ENUM('assignment_due', 'quiz_scheduled', 'homework_reminder', 'grade_posted', 'peer_review', 'session_invite', 'deadline_warning') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INT NULL,
        related_type VARCHAR(50) NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP NULL,
        action_url VARCHAR(500) NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Collaboration & Analytics tables created\n');

    // Insert sample data
    await connection.query(`
      INSERT INTO users (id, name, email, password, role) VALUES
      (1, 'Admin User', 'admin@school.com', 'hashed_password', 'admin'),
      (2, 'John Teacher', 'teacher@school.com', 'hashed_password', 'teacher'),
      (3, 'Jane Student', 'student@school.com', 'hashed_password', 'student');

      INSERT INTO subjects (id, name, code) VALUES
      (1, 'Mathematics', 'MATH101'),
      (2, 'Physics', 'PHY101'),
      (3, 'English', 'ENG101');

      INSERT INTO trade_classes (id, name, class_name, level) VALUES
      (1, 'Class 10A', '10A', 'Grade 10'),
      (2, 'Class 10B', '10B', 'Grade 10');

      INSERT INTO enrollments (student_id, class_id) VALUES (3, 1);
    `);
    console.log('✅ Sample data inserted\n');

    const [allTables] = await connection.query('SHOW TABLES');
    console.log(`✅ Total tables: ${allTables.length}\n`);
    console.log('🎉 DATABASE SETUP COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
