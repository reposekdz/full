const mysql = require('mysql2/promise');

async function restoreOriginalDevelopers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('🔄 RESTORING ORIGINAL DEVELOPERS...\n');

    // Drop and recreate developers table with advanced features
    await connection.execute('DROP TABLE IF EXISTS developers');
    await connection.execute(`
      CREATE TABLE developers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255),
        role VARCHAR(100) NOT NULL,
        role_rw VARCHAR(100),
        specialization VARCHAR(255),
        experience_years INT DEFAULT 0,
        bio TEXT,
        bio_rw TEXT,
        image_url VARCHAR(500),
        github_url VARCHAR(255),
        linkedin_url VARCHAR(255),
        portfolio_url VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        skills JSON,
        projects JSON,
        achievements JSON,
        social_links JSON,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Advanced developers table created');

    // Add original developers with their actual images
    const originalDevelopers = [
      {
        name: 'Niyonkuru Reponse',
        name_rw: 'Niyonkuru Reponse',
        role: 'Lead Full-Stack Developer & System Architect',
        role_rw: 'Umuyobozi w\'Abateza Porogaramu n\'Umubunyangamugayo',
        specialization: 'React, Node.js, MySQL, System Architecture',
        experience_years: 6,
        bio: 'Lead developer and architect of the Garden TVET School Management System. Expert in full-stack development with extensive experience in educational technology solutions.',
        bio_rw: 'Umuyobozi w\'abateza porogaramu na mubunyangamugayo wa sisitemu y\'ubuyobozi bw\'ishuri rya Garden TVET. Inzobere mu guteza porogaramu zuzuye kandi afite ubunararibonye bwinshi mu bikoranabuhanga by\'uburezi.',
        image_url: '/uploads/developers/niyonkuru reponse.jpg',
        email: 'reponse@gardentvet.rw',
        phone: '+250788123456',
        github_url: 'https://github.com/reponse-dev',
        linkedin_url: 'https://linkedin.com/in/reponse-niyonkuru',
        portfolio_url: null,
        skills: JSON.stringify(['React', 'Node.js', 'MySQL', 'TypeScript', 'System Design', 'DevOps', 'Project Management']),
        projects: JSON.stringify([
          { name: 'School Management System', description: 'Complete educational management platform', tech: ['React', 'Node.js', 'MySQL'] },
          { name: 'Student Portal', description: 'Interactive student dashboard', tech: ['React', 'TypeScript'] },
          { name: 'Admin Dashboard', description: 'Comprehensive admin interface', tech: ['React', 'Node.js'] }
        ]),
        achievements: JSON.stringify([
          'Led development of complete school management system',
          'Implemented advanced authentication system',
          'Designed scalable database architecture',
          'Mentored junior developers'
        ]),
        social_links: JSON.stringify({
          twitter: 'https://twitter.com/reponse_dev',
          instagram: 'https://instagram.com/reponse.dev'
        }),
        is_featured: true,
        sort_order: 1
      },
      {
        name: 'Musoni Mugisha Yves',
        name_rw: 'Musoni Mugisha Yves',
        role: 'Senior Frontend Developer',
        role_rw: 'Umuteza Porogaramu w\'Imbere Mukuru',
        specialization: 'React, Vue.js, UI/UX Design, Mobile Development',
        experience_years: 4,
        bio: 'Senior frontend developer specializing in modern web technologies and user experience design. Expert in creating responsive and intuitive interfaces.',
        bio_rw: 'Umuteza porogaramu w\'imbere mukuru, inzobere mu bikoranabuhanga bigezweho bya web n\'igishushanyo cy\'uburambe bw\'abakoresha. Inzobere mu gukora interface zihuza kandi zoroshye.',
        image_url: '/uploads/developers/musoni mugisha yves.jpg',
        email: 'yves@gardentvet.rw',
        phone: '+250788234567',
        github_url: 'https://github.com/yves-musoni',
        linkedin_url: 'https://linkedin.com/in/yves-musoni',
        skills: JSON.stringify(['React', 'Vue.js', 'JavaScript', 'CSS3', 'SASS', 'Figma', 'Adobe XD', 'Mobile Development']),
        projects: JSON.stringify([
          { name: 'Student Dashboard UI', description: 'Modern student interface design', tech: ['React', 'CSS3'] },
          { name: 'Mobile App Frontend', description: 'Cross-platform mobile interface', tech: ['React Native'] },
          { name: 'Admin Panel Design', description: 'Comprehensive admin interface', tech: ['Vue.js', 'SASS'] }
        ]),
        achievements: JSON.stringify([
          'Designed complete UI/UX for school system',
          'Implemented responsive design patterns',
          'Created mobile-first interfaces',
          'Optimized frontend performance'
        ]),
        social_links: JSON.stringify({
          behance: 'https://behance.net/yves-musoni',
          dribbble: 'https://dribbble.com/yves-musoni'
        }),
        is_featured: true,
        sort_order: 2
      },
      {
        name: 'Niyonsenga Frank',
        name_rw: 'Niyonsenga Frank',
        role: 'Backend Developer & Database Specialist',
        role_rw: 'Umuteza Porogaramu w\'Inyuma n\'Inzobere mu Bubiko bw\'Amakuru',
        specialization: 'Node.js, MySQL, API Development, Database Optimization',
        experience_years: 3,
        bio: 'Backend developer and database specialist focused on creating robust server-side applications and optimizing database performance for educational systems.',
        bio_rw: 'Umuteza porogaramu w\'inyuma n\'inzobere mu bubiko bw\'amakuru, yibanze ku gukora porogaramu z\'inyuma zikomeye no kunoza imikorere y\'ububiko bw\'amakuru mu sisitemu z\'uburezi.',
        image_url: '/uploads/developers/niyonsenga frank.JPG',
        email: 'frank@gardentvet.rw',
        phone: '+250788345678',
        github_url: 'https://github.com/frank-niyonsenga',
        linkedin_url: 'https://linkedin.com/in/frank-niyonsenga',
        skills: JSON.stringify(['Node.js', 'Express.js', 'MySQL', 'MongoDB', 'API Design', 'Database Optimization', 'Server Management']),
        projects: JSON.stringify([
          { name: 'School API System', description: 'RESTful API for school management', tech: ['Node.js', 'MySQL'] },
          { name: 'Database Architecture', description: 'Optimized database design', tech: ['MySQL', 'Database Design'] },
          { name: 'Authentication System', description: 'Secure user authentication', tech: ['Node.js', 'JWT'] }
        ]),
        achievements: JSON.stringify([
          'Designed scalable database architecture',
          'Implemented secure authentication system',
          'Optimized database queries for performance',
          'Created comprehensive API documentation'
        ]),
        social_links: JSON.stringify({
          stackoverflow: 'https://stackoverflow.com/users/frank-niyonsenga'
        }),
        is_featured: false,
        sort_order: 3
      },
      {
        name: 'Zamiru Yazid Surayiman',
        name_rw: 'Zamiru Yazid Surayiman',
        role: 'DevOps Engineer & System Administrator',
        role_rw: 'Injeniyeri ya DevOps n\'Umuyobozi wa Sisitemu',
        specialization: 'Server Management, Deployment, Security, Cloud Infrastructure',
        experience_years: 4,
        bio: 'DevOps engineer and system administrator ensuring smooth deployment, maintenance, and security of the school management system infrastructure.',
        bio_rw: 'Injeniyeri ya DevOps n\'umuyobozi wa sisitemu ukora ku gushyira mu bikorwa, kubungabunga, n\'umutekano wa sisitemu y\'ubuyobozi bw\'ishuri.',
        image_url: '/uploads/developers/zamiru yazid surayiman.JPG',
        email: 'yazid@gardentvet.rw',
        phone: '+250788456789',
        github_url: 'https://github.com/yazid-zamiru',
        linkedin_url: 'https://linkedin.com/in/yazid-zamiru',
        skills: JSON.stringify(['Linux', 'Docker', 'AWS', 'Nginx', 'CI/CD', 'Security', 'Monitoring', 'Backup Systems']),
        projects: JSON.stringify([
          { name: 'School Infrastructure', description: 'Complete server infrastructure setup', tech: ['Linux', 'Docker'] },
          { name: 'Deployment Pipeline', description: 'Automated deployment system', tech: ['CI/CD', 'Docker'] },
          { name: 'Security Implementation', description: 'System security and monitoring', tech: ['Security', 'Monitoring'] }
        ]),
        achievements: JSON.stringify([
          'Set up complete server infrastructure',
          'Implemented automated deployment pipeline',
          'Established security protocols',
          'Created backup and recovery systems'
        ]),
        social_links: JSON.stringify({
          medium: 'https://medium.com/@yazid-zamiru'
        }),
        is_featured: false,
        sort_order: 4
      }
    ];

    for (const dev of originalDevelopers) {
      await connection.execute(`
        INSERT INTO developers (
          name, name_rw, role, role_rw, specialization, experience_years,
          bio, bio_rw, image_url, email, phone, github_url, linkedin_url, portfolio_url,
          skills, projects, achievements, social_links, is_featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dev.name, dev.name_rw, dev.role, dev.role_rw, dev.specialization, dev.experience_years,
        dev.bio, dev.bio_rw, dev.image_url, dev.email, dev.phone, dev.github_url, dev.linkedin_url, dev.portfolio_url || null,
        dev.skills, dev.projects, dev.achievements, dev.social_links, dev.is_featured, dev.sort_order
      ]);
      console.log(`✅ Restored: ${dev.name}`);
    }

    console.log('\n🎉 ORIGINAL DEVELOPERS RESTORED WITH ADVANCED FEATURES!');
    console.log('\n👥 DEVELOPERS:');
    console.log('   1. Niyonkuru Reponse - Lead Full-Stack Developer');
    console.log('   2. Musoni Mugisha Yves - Senior Frontend Developer');
    console.log('   3. Niyonsenga Frank - Backend Developer');
    console.log('   4. Zamiru Yazid Surayiman - DevOps Engineer');
    
    console.log('\n🚀 ADVANCED FEATURES ADDED:');
    console.log('   ✅ Skills tracking (JSON)');
    console.log('   ✅ Projects portfolio (JSON)');
    console.log('   ✅ Achievements list (JSON)');
    console.log('   ✅ Social media links (JSON)');
    console.log('   ✅ Featured developer flag');
    console.log('   ✅ Bilingual support (English/Kinyarwanda)');
    console.log('   ✅ Original developer images');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

restoreOriginalDevelopers();