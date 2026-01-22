const mysql = require('mysql2/promise');

async function addAdvancedFeatures() {
  let connection;
  try {
    console.log('🚀 Adding Advanced Features...\n');

    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management',
      multipleStatements: true
    });

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_grading_models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_name VARCHAR(100) NOT NULL,
        model_type ENUM('essay', 'code', 'math', 'general') NOT NULL,
        version VARCHAR(20) NOT NULL,
        accuracy_score DECIMAL(5,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_grading_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        submission_type ENUM('assignment', 'quiz', 'homework') NOT NULL,
        model_id INT NOT NULL,
        ai_score DECIMAL(5,2),
        confidence_level DECIMAL(5,2),
        detailed_feedback JSON,
        strengths JSON,
        weaknesses JSON,
        improvement_suggestions JSON,
        grammar_score DECIMAL(5,2),
        coherence_score DECIMAL(5,2),
        creativity_score DECIMAL(5,2),
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (model_id) REFERENCES ai_grading_models(id)
      );

      CREATE TABLE IF NOT EXISTS achievement_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        badge_name VARCHAR(100) NOT NULL,
        badge_description TEXT,
        badge_icon VARCHAR(255),
        badge_category ENUM('academic', 'participation', 'collaboration', 'consistency', 'excellence', 'special') NOT NULL,
        points_value INT DEFAULT 0,
        rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
        unlock_criteria JSON NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress_percentage DECIMAL(5,2) DEFAULT 100.00,
        is_displayed BOOLEAN DEFAULT true,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES achievement_badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_badge (student_id, badge_id)
      );

      CREATE TABLE IF NOT EXISTS student_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        points_type ENUM('academic', 'participation', 'collaboration', 'bonus', 'penalty') NOT NULL,
        points_value INT NOT NULL,
        source_type VARCHAR(50),
        source_id INT,
        description TEXT,
        awarded_by INT,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (awarded_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS student_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT,
        current_level INT DEFAULT 1,
        current_xp INT DEFAULT 0,
        total_xp INT DEFAULT 0,
        next_level_xp INT DEFAULT 100,
        level_title VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_subject (student_id, subject_id)
      );

      CREATE TABLE IF NOT EXISTS learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_name VARCHAR(255) NOT NULL,
        subject_id INT NOT NULL,
        difficulty_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
        prerequisites JSON,
        learning_objectives JSON NOT NULL,
        estimated_duration_hours INT,
        path_structure JSON NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS student_learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        path_id INT NOT NULL,
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_milestone INT DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        performance_score DECIMAL(5,2),
        status ENUM('not_started', 'in_progress', 'completed', 'paused') DEFAULT 'not_started',
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, path_id)
      );

      CREATE TABLE IF NOT EXISTS knowledge_graph (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        concept_name VARCHAR(255) NOT NULL,
        concept_description TEXT,
        difficulty_level INT DEFAULT 1,
        prerequisites JSON,
        related_concepts JSON,
        mastery_threshold DECIMAL(5,2) DEFAULT 80.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS student_concept_mastery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        concept_id INT NOT NULL,
        mastery_level DECIMAL(5,2) DEFAULT 0.00,
        attempts_count INT DEFAULT 0,
        last_assessment_score DECIMAL(5,2),
        needs_review BOOLEAN DEFAULT false,
        last_practiced TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (concept_id) REFERENCES knowledge_graph(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_concept (student_id, concept_id)
      );

      CREATE TABLE IF NOT EXISTS learning_analytics_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_category ENUM('engagement', 'performance', 'behavior', 'social', 'technical') NOT NULL,
        event_data JSON NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS predictive_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT,
        prediction_type ENUM('performance', 'dropout_risk', 'success_probability', 'time_to_mastery') NOT NULL,
        predicted_value DECIMAL(10,2),
        confidence_score DECIMAL(5,2),
        contributing_factors JSON,
        recommendations JSON,
        prediction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS engagement_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        login_count INT DEFAULT 0,
        session_duration_minutes INT DEFAULT 0,
        assignments_completed INT DEFAULT 0,
        quizzes_attempted INT DEFAULT 0,
        engagement_score DECIMAL(5,2),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_date (student_id, date)
      );

      CREATE TABLE IF NOT EXISTS study_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_name VARCHAR(255) NOT NULL,
        subject_id INT,
        creator_id INT NOT NULL,
        group_type ENUM('public', 'private', 'invite_only') DEFAULT 'public',
        max_members INT DEFAULT 20,
        current_members INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS study_group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
        contribution_score DECIMAL(5,2) DEFAULT 0.00,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_membership (group_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS discussion_forums (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT,
        trade_class_id INT,
        forum_title VARCHAR(255) NOT NULL,
        forum_description TEXT,
        created_by INT NOT NULL,
        is_moderated BOOLEAN DEFAULT true,
        post_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (trade_class_id) REFERENCES trade_classes(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS forum_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        forum_id INT NOT NULL,
        parent_post_id INT,
        author_id INT NOT NULL,
        post_title VARCHAR(255),
        post_content TEXT NOT NULL,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        is_answered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (forum_id) REFERENCES discussion_forums(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS learning_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resource_title VARCHAR(255) NOT NULL,
        resource_type ENUM('video', 'document', 'interactive', 'audio', 'link', 'ebook', 'simulation') NOT NULL,
        subject_id INT,
        difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
        file_url VARCHAR(500),
        description TEXT,
        uploaded_by INT NOT NULL,
        view_count INT DEFAULT 0,
        rating_avg DECIMAL(3,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS question_bank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'coding') NOT NULL,
        difficulty_level INT DEFAULT 1,
        options JSON,
        correct_answer JSON NOT NULL,
        explanation TEXT,
        points DECIMAL(5,2) DEFAULT 1.00,
        created_by INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);

    console.log('✅ Advanced features tables created\n');

    // Insert sample data
    await connection.query(`
      INSERT IGNORE INTO ai_grading_models (id, model_name, model_type, version, accuracy_score) VALUES
      (1, 'Essay Grader v1', 'essay', '1.0', 85.5);

      INSERT IGNORE INTO achievement_badges (id, badge_name, badge_description, badge_category, rarity, points_value, unlock_criteria) VALUES
      (1, 'First Assignment', 'Complete your first assignment', 'academic', 'common', 10, '{}'),
      (2, 'Quiz Master', 'Complete 20 quizzes', 'academic', 'rare', 50, '{}'),
      (3, 'Point Collector', 'Earn 1000 points', 'excellence', 'epic', 100, '{}'),
      (4, 'Consistent Learner', 'Active for 30 days', 'consistency', 'rare', 75, '{}');
    `);

    console.log('✅ Sample advanced data inserted\n');

    const [tables] = await connection.query("SHOW TABLES LIKE '%'");
    console.log(`✅ Total tables in database: ${tables.length}\n`);
    console.log('🎉 ADVANCED FEATURES SETUP COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addAdvancedFeatures();
