const db = require('../config/database');

async function setupDODSystem() {
  console.log('🚀 Gutangiza Sisiteme ya Umuyobozi w\'Indero...\n');

  try {
    // Discipline Cases Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS discipline_cases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        case_type ENUM('ikosa_gito', 'ikosa_gikomeye', 'ikosa_cyane', 'ikosa_kibabaje') DEFAULT 'ikosa_gito',
        description TEXT NOT NULL,
        action_taken TEXT,
        status ENUM('gishya', 'girakurikiranwa', 'byakemuwe', 'byahagaritswe') DEFAULT 'gishya',
        severity INT DEFAULT 1,
        reported_by INT,
        handled_by INT,
        parent_notified BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        INDEX idx_student (student_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Imbonerahamwe y\'amakosa yarakozwe');

    // Behavior Points Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS behavior_points (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        points INT DEFAULT 0,
        reason VARCHAR(255),
        point_type ENUM('amanota_meza', 'amanota_mabi') DEFAULT 'amanota_meza',
        awarded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_type (point_type)
      )
    `);
    console.log('✅ Imbonerahamwe y\'amanota y\'imyitwarire yarakozwe');

    // Punishments Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS punishments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        case_id INT NOT NULL,
        punishment_type ENUM('iburira', 'guhagarikwa_iminsi', 'guhagarikwa_byimazeyo', 'kwirukana') DEFAULT 'iburira',
        description TEXT,
        start_date DATE,
        end_date DATE,
        status ENUM('bitegerejwe', 'birakora', 'byarangiye') DEFAULT 'bitegerejwe',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_case (case_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Imbonerahamwe y\'ibihano yarakozwe');

    // DOD Notifications Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS dod_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        notification_type ENUM('ikosa', 'ibihano', 'ibizamini', 'sisiteme', 'amakuru') DEFAULT 'amakuru',
        priority ENUM('bihutirwa', 'byingenzi', 'bisanzwe') DEFAULT 'bisanzwe',
        target_user INT,
        target_role VARCHAR(50),
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (target_user),
        INDEX idx_read (is_read),
        INDEX idx_type (notification_type)
      )
    `);
    console.log('✅ Imbonerahamwe y\'amakuru yarakozwe');

    // Exam Monitoring Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS exam_monitoring (
        id INT PRIMARY KEY AUTO_INCREMENT,
        exam_id INT NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        exam_date DATE NOT NULL,
        location VARCHAR(255),
        supervisor_id INT,
        status ENUM('biteguwe', 'biratangira', 'byarangiye', 'byahagaritswe') DEFAULT 'biteguwe',
        students_count INT DEFAULT 0,
        issues_reported INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (exam_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Imbonerahamwe yo gukurikirana ibizamini yarakozwe');

    // System Alerts Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS system_alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        alert_type ENUM('ikimenyetso', 'ikosa', 'amakuru', 'byihutirwa') DEFAULT 'amakuru',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity ENUM('byo_hejuru', 'byo_hagati', 'byo_hasi') DEFAULT 'byo_hagati',
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        INDEX idx_active (is_active),
        INDEX idx_type (alert_type)
      )
    `);
    console.log('✅ Imbonerahamwe y\'ibimenyetso bya sisiteme yarakozwe');

    // Activity Log Table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS dod_activity_log (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(50) NOT NULL,
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_module (module),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Imbonerahamwe y\'ibikorwa yarakozwe');

    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS parent_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        case_id INT,
        message TEXT NOT NULL,
        notification_method ENUM('sms', 'email', 'call', 'app') DEFAULT 'sms',
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_case (case_id)
      )
    `);
    console.log('✅ Imbonerahamwe y\'ubutumwa bw\'ababyeyi yarakozwe');

    // Insert sample data
    await db.pool.query(`
      INSERT INTO dod_notifications (title, message, notification_type, priority, target_role) VALUES
      ('Ubutumwa bushya', 'Hari amakuru mashya akwiye kumenya', 'amakuru', 'byingenzi', 'director_discipline'),
      ('Ikizamini gitegerejwe', 'Ikizamini cya Mathematics kizaba ku wa 15/06/2024', 'ibizamini', 'byingenzi', 'director_discipline'),
      ('Ikizamini gitegerejwe', 'Ikizamini cya Physics kizaba ku wa 20/06/2024', 'ibizamini', 'byingenzi', 'director_discipline'),
      ('Ikimenyetso cya sisiteme', 'Sisiteme yaravuguruwe neza', 'sisiteme', 'bisanzwe', 'director_discipline')
    `);
    console.log('✅ Amakuru y\'urugero yinjijwe');

    await db.pool.query(`
      INSERT INTO system_alerts (alert_type, title, message, severity, is_active) VALUES
      ('amakuru', 'Sisiteme irakora neza', 'Ibice byose bya sisiteme birakora neza', 'byo_hasi', 1),
      ('ikimenyetso', 'Kugenzura ibizamini', 'Ibizamini 2 bitegerejwe muri iki cyumweru', 'byo_hagati', 1)
    `);
    console.log('✅ Ibimenyetso bya sisiteme byinjijwe');

    await db.pool.query(`
      INSERT INTO exam_monitoring (exam_name, exam_date, location, status, students_count) VALUES
      ('Ikizamini cya Mathematics', '2024-06-15', 'Icyumba A101', 'biteguwe', 45),
      ('Ikizamini cya Physics', '2024-06-20', 'Icyumba B205', 'biteguwe', 38)
    `);
    console.log('✅ Ibizamini bitegerejwe byinjijwe');

    console.log('\n✨ Sisiteme ya Umuyobozi w\'Indero yateguwe neza!');
    
  } catch (error) {
    console.error('❌ Ikosa mu gutegura sisiteme:', error);
    throw error;
  }
}

if (require.main === module) {
  setupDODSystem()
    .then(() => {
      console.log('\n✅ Gutegura byarangiye neza');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Gutegura byanze:', error);
      process.exit(1);
    });
}

module.exports = setupDODSystem;
