const { pool } = require('../config/database');

async function setupStaffTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS staff_management (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        title_rw VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        image VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        description TEXT,
        description_rw TEXT,
        responsibilities TEXT,
        responsibilities_rw TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [existing] = await pool.execute('SELECT COUNT(*) as count FROM staff_management');
    
    if (existing[0].count === 0) {
      await pool.execute(`
        INSERT INTO staff_management (title, title_rw, name, image, email, phone, description, description_rw, responsibilities, responsibilities_rw, display_order) VALUES
        ('Head Master', 'Umuyobozi Mukuru', 'Dr. Jean Baptiste NIYONZIMA', '/assets/staff/headmaster.jpg', 'headmaster@gardentvet.ac.rw', '+250788123456',
         'The Head Master oversees all school operations and strategic planning.',
         'Umuyobozi Mukuru akurikirana ibikorwa byose by\\'ishuri n\\'igenamigambi.',
         'Overall school management, Strategic planning, Staff supervision, Budget oversight, Community relations',
         'Ubuyobozi rusange bw\\'ishuri, Igenamigambi, Kugenzura abakozi, Gucunga ingengo y\\'imari, Umubano n\\'abaturage',
         1),
        
        ('Director of Studies', 'Umuyobozi w\\'Amasomo', 'Prof. Marie Claire UWASE', '/assets/staff/dos.jpg', 'dos@gardentvet.ac.rw', '+250788234567',
         'The Director of Studies manages academic programs and curriculum development.',
         'Umuyobozi w\\'Amasomo akurikirana gahunda z\\'amasomo n\\'integanyanyigisho.',
         'Academic program management, Curriculum development, Teacher evaluation, Examination coordination, Student performance monitoring',
         'Gucunga gahunda z\\'amasomo, Gutegura integanyanyigisho, Gusuzuma abarimu, Gutegura ibizamini, Gukurikirana imikorere y\\'abanyeshuri',
         2),
        
        ('Director of Discipline', 'Umuyobozi w\\'Imyitwarire', 'Mr. Paul MUGABO', '/assets/staff/dod.jpg', 'dod@gardentvet.ac.rw', '+250788345678',
         'The Director of Discipline ensures student welfare and maintains school discipline.',
         'Umuyobozi w\\'Imyitwarire areba imibereho y\\'abanyeshuri n\\'imyitwarire myiza.',
         'Student discipline management, Counseling services, Behavior monitoring, Conflict resolution, Student welfare programs',
         'Gucunga imyitwarire y\\'abanyeshuri, Ubujyanama, Gukurikirana imyitwarire, Gukemura amakimbirane, Gahunda z\\'imibereho myiza',
         3),
        
        ('Stock Manager', 'Umuyobozi w\\'Ububiko', 'Mrs. Grace MUKAMANA', '/assets/staff/stock.jpg', 'stock@gardentvet.ac.rw', '+250788456789',
         'The Stock Manager oversees inventory and procurement of school supplies.',
         'Umuyobozi w\\'Ububiko akurikirana ibikoresho n\\'ibicuruzwa by\\'ishuri.',
         'Inventory management, Procurement coordination, Supply chain oversight, Asset tracking, Vendor relations',
         'Gucunga ububiko, Gutegura ibicuruzwa, Gukurikirana ibikoresho, Gukurikirana umutungo, Umubano n\\'abatanga',
         4),
        
        ('School Advisor', 'Umujyanama w\\'Ishuri', 'Dr. Emmanuel HABIMANA', '/assets/staff/advisor.jpg', 'advisor@gardentvet.ac.rw', '+250788567890',
         'The School Advisor provides guidance on educational policies and strategic initiatives.',
         'Umujyanama w\\'Ishuri atanga ubujyanama ku ngamba z\\'uburezi n\\'imigambi.',
         'Policy advisory, Strategic planning support, Quality assurance, Stakeholder engagement, Educational research',
         'Ubujyanama ku ngamba, Gufasha mu nteganyabikorwa, Kureba ireme, Guhuza abafatanyabikorwa, Ubushakashatsi mu burezi',
         5),
        
        ('School Manager', 'Umuyobozi w\\'Imicungire', 'Mr. David KAMANZI', '/assets/staff/manager.jpg', 'manager@gardentvet.ac.rw', '+250788678901',
         'The School Manager handles administrative operations and facility management.',
         'Umuyobozi w\\'Imicungire akurikirana ibikorwa by\\'ubuyobozi n\\'ububiko.',
         'Administrative operations, Facility management, Resource allocation, Operational planning, Support services coordination',
         'Ibikorwa by\\'ubuyobozi, Gucunga ububiko, Gutanga ibikoresho, Gutegura ibikorwa, Guhuza serivisi zifasha',
         6)
      `);
      console.log('Staff management table created and populated with initial data');
    } else {
      console.log('Staff management table already exists with data');
    }
  } catch (error) {
    console.error('Setup staff table error:', error);
  } finally {
    process.exit();
  }
}

setupStaffTable();
