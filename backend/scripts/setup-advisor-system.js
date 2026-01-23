const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupAdvisorSystem() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. Parents Management Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_code VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        national_id VARCHAR(20) UNIQUE,
        address TEXT,
        occupation VARCHAR(100),
        relationship_type ENUM('father', 'mother', 'guardian') NOT NULL,
        emergency_contact VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Student-Parent Relationships
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_parents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        parent_id INT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        can_pickup BOOLEAN DEFAULT true,
        financial_responsible BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
      )
    `);

    // 3. Parent Communications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_communications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        advisor_id INT NOT NULL,
        communication_type ENUM('call', 'sms', 'email', 'meeting', 'home_visit') NOT NULL,
        subject_rw VARCHAR(200) NOT NULL,
        subject_en VARCHAR(200),
        message_rw TEXT NOT NULL,
        message_en TEXT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('pending', 'sent', 'delivered', 'read', 'replied') DEFAULT 'pending',
        scheduled_date DATETIME,
        sent_date DATETIME,
        response_rw TEXT,
        response_en TEXT,
        response_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
      )
    `);

    // 4. Parent Meetings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_meetings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        advisor_id INT NOT NULL,
        meeting_type ENUM('individual', 'group', 'emergency', 'routine') NOT NULL,
        title_rw VARCHAR(200) NOT NULL,
        title_en VARCHAR(200),
        description_rw TEXT,
        description_en TEXT,
        location VARCHAR(200),
        meeting_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 30,
        status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
        attendance_status ENUM('present', 'absent', 'late') DEFAULT NULL,
        notes_rw TEXT,
        notes_en TEXT,
        action_items TEXT,
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
      )
    `);

    // 5. Student Behavior Records
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_behavior (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        recorded_by INT NOT NULL,
        behavior_type ENUM('positive', 'negative', 'neutral') NOT NULL,
        category ENUM('discipline', 'attendance', 'academic', 'social', 'health') NOT NULL,
        title_rw VARCHAR(200) NOT NULL,
        title_en VARCHAR(200),
        description_rw TEXT NOT NULL,
        description_en TEXT,
        severity ENUM('minor', 'moderate', 'major', 'critical') DEFAULT 'minor',
        incident_date DATETIME NOT NULL,
        location VARCHAR(200),
        witnesses TEXT,
        action_taken_rw TEXT,
        action_taken_en TEXT,
        parent_notified BOOLEAN DEFAULT false,
        parent_notification_date DATETIME,
        parent_response_rw TEXT,
        parent_response_en TEXT,
        resolved BOOLEAN DEFAULT false,
        resolution_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Student Counseling Sessions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS counseling_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        counselor_id INT NOT NULL,
        session_type ENUM('individual', 'group', 'family', 'crisis') NOT NULL,
        category ENUM('academic', 'personal', 'social', 'career', 'family', 'health') NOT NULL,
        title_rw VARCHAR(200) NOT NULL,
        title_en VARCHAR(200),
        description_rw TEXT,
        description_en TEXT,
        session_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 45,
        location VARCHAR(200),
        concerns_rw TEXT NOT NULL,
        concerns_en TEXT,
        interventions_rw TEXT,
        interventions_en TEXT,
        outcomes_rw TEXT,
        outcomes_en TEXT,
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_date DATE,
        parent_involved BOOLEAN DEFAULT false,
        confidential BOOLEAN DEFAULT true,
        status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Home Visits
    await connection.query(`
      CREATE TABLE IF NOT EXISTS home_visits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        advisor_id INT NOT NULL,
        visit_date DATETIME NOT NULL,
        purpose_rw TEXT NOT NULL,
        purpose_en TEXT,
        family_members_present TEXT,
        home_conditions_rw TEXT,
        home_conditions_en TEXT,
        observations_rw TEXT NOT NULL,
        observations_en TEXT,
        concerns_identified_rw TEXT,
        concerns_identified_en TEXT,
        recommendations_rw TEXT,
        recommendations_en TEXT,
        follow_up_actions TEXT,
        parent_feedback_rw TEXT,
        parent_feedback_en TEXT,
        visit_status ENUM('planned', 'completed', 'cancelled') DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Student Attendance Tracking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused', 'sick', 'suspended') NOT NULL,
        arrival_time TIME,
        departure_time TIME,
        reason_rw TEXT,
        reason_en TEXT,
        parent_notified BOOLEAN DEFAULT false,
        notification_method ENUM('call', 'sms', 'email') DEFAULT NULL,
        verified_by INT,
        notes_rw TEXT,
        notes_en TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_attendance (student_id, attendance_date)
      )
    `);

    // 9. Academic Progress Reports
    await connection.query(`
      CREATE TABLE IF NOT EXISTS academic_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        term ENUM('term1', 'term2', 'term3') NOT NULL,
        academic_year VARCHAR(10) NOT NULL,
        marks DECIMAL(5,2),
        grade VARCHAR(5),
        rank_in_class INT,
        teacher_comment_rw TEXT,
        teacher_comment_en TEXT,
        advisor_comment_rw TEXT,
        advisor_comment_en TEXT,
        strengths_rw TEXT,
        strengths_en TEXT,
        areas_improvement_rw TEXT,
        areas_improvement_en TEXT,
        parent_notified BOOLEAN DEFAULT false,
        parent_signature BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Parent Feedback & Complaints
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_feedback (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        feedback_type ENUM('complaint', 'suggestion', 'compliment', 'inquiry', 'concern') NOT NULL,
        category ENUM('academic', 'discipline', 'facilities', 'staff', 'fees', 'transport', 'food', 'other') NOT NULL,
        subject_rw VARCHAR(200) NOT NULL,
        subject_en VARCHAR(200),
        message_rw TEXT NOT NULL,
        message_en TEXT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('received', 'reviewing', 'investigating', 'resolved', 'closed') DEFAULT 'received',
        assigned_to INT,
        response_rw TEXT,
        response_en TEXT,
        resolution_rw TEXT,
        resolution_en TEXT,
        satisfaction_rating INT,
        resolved_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
      )
    `);

    // 11. Advisor Tasks & Reminders
    await connection.query(`
      CREATE TABLE IF NOT EXISTS advisor_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        advisor_id INT NOT NULL,
        task_type ENUM('call', 'meeting', 'report', 'follow_up', 'visit', 'other') NOT NULL,
        title_rw VARCHAR(200) NOT NULL,
        title_en VARCHAR(200),
        description_rw TEXT,
        description_en TEXT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        due_date DATETIME NOT NULL,
        related_student_id INT,
        related_parent_id INT,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        completion_date DATETIME,
        notes_rw TEXT,
        notes_en TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Emergency Contacts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        phone_primary VARCHAR(20) NOT NULL,
        phone_secondary VARCHAR(20),
        address TEXT,
        priority_order INT DEFAULT 1,
        can_pickup BOOLEAN DEFAULT false,
        medical_authority BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All advisor system tables created successfully');

    // Insert sample data
    await connection.query(`
      INSERT INTO parents (parent_code, first_name, last_name, phone, email, national_id, address, occupation, relationship_type, emergency_contact, status) VALUES
      ('PAR001', 'Jean', 'MUGABO', '0788123456', 'j.mugabo@email.com', '1198012345678901', 'Kigali, Gasabo, Remera', 'Umucuruzi', 'father', '0788654321', 'active'),
      ('PAR002', 'Marie', 'UWASE', '0788234567', 'm.uwase@email.com', '1198112345678902', 'Kigali, Kicukiro, Gikondo', 'Umwarimu', 'mother', '0788765432', 'active'),
      ('PAR003', 'Pierre', 'NKURUNZIZA', '0788345678', 'p.nkurunziza@email.com', '1198212345678903', 'Kigali, Nyarugenge, Nyamirambo', 'Umuganga', 'father', '0788876543', 'active'),
      ('PAR004', 'Grace', 'MUKAMANA', '0788456789', 'g.mukamana@email.com', '1198312345678904', 'Kigali, Gasabo, Kimironko', 'Umukozi wa Leta', 'mother', '0788987654', 'active'),
      ('PAR005', 'Emmanuel', 'HABIMANA', '0788567890', 'e.habimana@email.com', '1198412345678905', 'Kigali, Kicukiro, Niboye', 'Umwubatsi', 'guardian', '0788098765', 'active')
    `);

    console.log('✅ Sample parents inserted');

    await connection.query(`
      INSERT INTO advisor_tasks (advisor_id, task_type, title_rw, title_en, description_rw, description_en, priority, due_date, status) VALUES
      (1, 'call', 'Hamagara Ababyeyi ba Abanyeshuri Bafite Ibibazo', 'Call Parents of Students with Issues', 'Hamagara ababyeyi 5 bafite abana bafite ibibazo byo kwiga', 'Call 5 parents whose children have academic issues', 'high', DATE_ADD(NOW(), INTERVAL 1 DAY), 'pending'),
      (1, 'meeting', 'Inama y''Ababyeyi', 'Parents Meeting', 'Gutegura inama rusange y''ababyeyi ku wa 15', 'Prepare general parents meeting on the 15th', 'medium', DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending'),
      (1, 'report', 'Raporo y''Igihembwe', 'Term Report', 'Gukora raporo y''imikorere y''abanyeshuri muri iki gihembwe', 'Prepare student performance report for this term', 'high', DATE_ADD(NOW(), INTERVAL 3 DAY), 'in_progress'),
      (1, 'visit', 'Gusura Imiryango', 'Home Visits', 'Gusura imiryango 3 y''abanyeshuri bafite ibibazo', 'Visit 3 families of students with issues', 'urgent', DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending')
    `);

    console.log('✅ Sample advisor tasks inserted');

    console.log('\n🎉 Advisor system setup completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   1. parents - Parent information management');
    console.log('   2. student_parents - Student-parent relationships');
    console.log('   3. parent_communications - Communication tracking');
    console.log('   4. parent_meetings - Meeting scheduling & tracking');
    console.log('   5. student_behavior - Behavior records');
    console.log('   6. counseling_sessions - Counseling tracking');
    console.log('   7. home_visits - Home visit records');
    console.log('   8. student_attendance - Attendance tracking');
    console.log('   9. academic_progress - Progress reports');
    console.log('   10. parent_feedback - Feedback & complaints');
    console.log('   11. advisor_tasks - Task management');
    console.log('   12. emergency_contacts - Emergency contacts');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

setupAdvisorSystem();
