const mysql = require('mysql2/promise');

async function addAdvisor() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Adding Advisor to leadership...');
    
    const advisor = {
      name: 'Uwimana Jean Paul',
      role: 'Umujyanama w\'Ikigo',
      department: 'Ubujyanama',
      bio: 'Umujyanama w\'ikigo ushinzwe gutanga inama ku buyobozi bw\'ishuri, gufasha mu gufata ibyemezo by\'ingenzi, no gukurikirana imikorere y\'ishuri. Afite uburambe bw\'imyaka 20 mu buyobozi bw\'amashuri n\'ubujyanama. Yabaye umujyanama w\'ikigo kuva 2017, aho yagaragaje ubushobozi bukomeye mu gutanga inama nziza, gufasha ubuyobozi gufata ibyemezo byiza, no gukurikirana imikorere y\'ishuri. Yashyizeho sisitemu nyinshi zo guteza imbere ishuri, gufasha abakozi, no gukemura ibibazo. Afite ubushobozi bwo gusesengura ibibazo, gutanga ibisubizo, no gufasha ishuri kugera ku ntego zacyo.',
      image_url: '/api/placeholder/400/400',
      email: 'advisor@garden-tvet.rw',
      phone: '+250 788 678 901',
      office_location: 'Office Block A, Room 104',
      sort_order: 6,
      responsibilities: JSON.stringify([
        'Gutanga inama ku buyobozi bw\'ishuri no gufasha mu gufata ibyemezo',
        'Gukurikirana imikorere y\'ishuri no gutanga raporo',
        'Gufasha ubuyobozi gukemura ibibazo by\'ishuri',
        'Gusesengura politiki z\'ishuri no gutanga ibisubizo',
        'Gufatanya n\'abafatanyabikorwa bo hanze',
        'Gukora ubushakashatsi ku iterambere ry\'ishuri',
        'Gutanga amahugurwa ku buyobozi bw\'ishuri',
        'Gufasha mu gushyira mu bikorwa politiki nshya'
      ]),
      qualifications: JSON.stringify([
        'PhD mu Educational Leadership - University of Rwanda (2012)',
        'Master\'s Degree mu School Administration - Kigali Independent University (2008)',
        'Bachelor\'s Degree mu Education Management - Kigali Institute of Education (2004)',
        'Certificate mu Strategic Planning - VVOB Rwanda (2015)',
        'Training mu Quality Assurance - British Council (2017)'
      ])
    };

    await connection.query(
      `INSERT INTO school_leadership 
       (name, role, department, bio, image_url, email, phone, office_location, responsibilities, qualifications, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        advisor.name,
        advisor.role,
        advisor.department,
        advisor.bio,
        advisor.image_url,
        advisor.email,
        advisor.phone,
        advisor.office_location,
        advisor.responsibilities,
        advisor.qualifications,
        advisor.sort_order
      ]
    );

    console.log('✓ Advisor added successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addAdvisor().catch(console.error);
