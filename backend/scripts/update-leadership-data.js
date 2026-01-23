const mysql = require('mysql2/promise');

async function updateLeadership() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Clearing existing leadership data...');
    await connection.query('DELETE FROM school_leadership');

    console.log('Inserting comprehensive leadership data...');
    
    const leaders = [
      {
        name: 'Dr. Mugisha Jean Claude',
        role: 'Umuyobozi Mukuru w\'Ishuri',
        department: 'Ubuyobozi Bukuru',
        bio: 'Umuyobozi mukuru w\'ishuri afite uburambe bw\'imyaka 15 mu buyobozi bw\'amashuri. Yize kugeza kuri Doctorate mu buyobozi bw\'uburezi kandi afite ubushobozi bukomeye mu guteza imbere amashuri. Yabaye umuyobozi mukuru kuva 2018, aho yagaragaje ubushobozi bukomeye mu kuyobora ishuri no guteza imbere uburezi bw\'ikoranabuhanga. Afite ubunararibonye mu gushyira mu bikorwa politiki z\'uburezi, gukora ingengo y\'imari, no guhuza abafatanyabikorwa batandukanye. Yashyizeho sisitemu nyinshi zo guteza imbere ishuri nko sisitemu yo gukurikirana abanyeshuri, sisitemu yo gucunga abakozi, na sisitemu yo gutanga raporo.',
        image_url: '/api/placeholder/400/400',
        email: 'principal@garden-tvet.rw',
        phone: '+250 788 123 456',
        office_location: 'Office Block A, Room 101',
        sort_order: 1,
        responsibilities: JSON.stringify([
          'Kuyobora ishuri muri rusange no gushyira mu bikorwa politiki z\'ishuri',
          'Gufata ibyemezo by\'ingenzi ku mikorere y\'ishuri',
          'Guhuza abakozi bose b\'ishuri no kwemeza ko bakora neza',
          'Gufatanya n\'abafatanyabikorwa nko Minisiteri y\'Uburezi, REB, WDA',
          'Gukora ingengo y\'imari y\'ishuri no kuyicunga neza',
          'Gukurikirana iterambere ry\'ishuri no gutanga raporo',
          'Kwemeza ko ishuri ryubahiriza amategeko n\'amabwiriza',
          'Guteza imbere ubuyobozi bw\'ishuri'
        ]),
        qualifications: JSON.stringify([
          'PhD mu Buyobozi bw\'Uburezi - Kigali Independent University (2015)',
          'Master\'s Degree mu Pedagogy - University of Rwanda (2010)',
          'Bachelor\'s Degree mu Education Management - Kigali Institute of Education (2005)',
          'Certificate mu School Leadership - Harvard Graduate School (2018)',
          'Training mu Strategic Planning - VVOB Rwanda (2019)'
        ])
      },
      {
        name: 'Mukamana Grace',
        role: 'Umuyobozi w\'Amasomo (DOS)',
        department: 'Amasomo',
        bio: 'Umuyobozi w\'amasomo ushinzwe gukurikirana amasomo yose y\'ishuri, gushyiraho amategeko y\'amasomo, no gufasha abarimu mu kazi kabo. Afite uburambe bw\'imyaka 12 mu buyobozi bw\'amasomo n\'imyigishirize. Yabaye DOS kuva 2019, aho yagaragaje ubushobozi bukomeye mu gutunganya amasomo, gukora amategeko y\'amasomo, no gufasha abarimu guteza imbere ubumenyi bwabo. Yashyizeho sisitemu yo gukurikirana amasomo, sisitemu yo gusuzuma abarimu, na sisitemu yo gutanga raporo z\'amasomo.',
        image_url: '/api/placeholder/400/400',
        email: 'dos@garden-tvet.rw',
        phone: '+250 788 234 567',
        office_location: 'Office Block A, Room 102',
        sort_order: 2,
        responsibilities: JSON.stringify([
          'Gukurikirana amasomo yose y\'ishuri no kwemeza ko atangwa neza',
          'Gukora amategeko y\'amasomo (Timetables) akurikije ibisabwa',
          'Gufasha abarimu mu gutegura amasomo no gutanga ubufasha',
          'Gukurikirana iterambere ry\'abanyeshuri mu masomo',
          'Gusuzuma abarimu no kubafasha guteza imbere ubumenyi',
          'Gukora raporo z\'amasomo no kuzitanga ubuyobozi',
          'Gushyiraho ibizamini no kwemeza ko bikozwe neza',
          'Gufatanya n\'abarimu mu gukemura ibibazo by\'amasomo'
        ]),
        qualifications: JSON.stringify([
          'Master\'s Degree mu Curriculum Development - University of Rwanda (2015)',
          'Bachelor\'s Degree mu Education - Kigali Institute of Education (2010)',
          'Certificate mu School Management - VVOB Rwanda (2017)',
          'Training mu Pedagogical Methods - British Council (2018)',
          'Diploma mu Educational Leadership - African Virtual University (2019)'
        ])
      },
      {
        name: 'Nkusi Patrick',
        role: 'Umuyobozi w\'Imyigire (DOD)',
        department: 'Imyigire',
        bio: 'Umuyobozi w\'imyigire ushinzwe gukurikirana imyigire y\'abanyeshuri mu by\'umukoro, gufasha abanyeshuri kubona amahugurwa, no guhuza n\'ibigo bitanga akazi. Afite uburambe bw\'imyaka 10 mu buyobozi bw\'imyigire n\'amahugurwa. Yabaye DOD kuva 2020, aho yagaragaje ubushobozi bukomeye mu guhuza abanyeshuri n\'ibigo bitanga akazi, gukora amasezerano n\'ibigo by\'imyigire, no gufasha abanyeshuri kubona amahugurwa.',
        image_url: '/api/placeholder/400/400',
        email: 'dod@garden-tvet.rw',
        phone: '+250 788 345 678',
        office_location: 'Office Block B, Room 201',
        sort_order: 3,
        responsibilities: JSON.stringify([
          'Gukurikirana imyigire y\'abanyeshuri mu by\'umukoro',
          'Gufasha abanyeshuri kubona amahugurwa mu bigo bitanga akazi',
          'Guhuza n\'ibigo bitanga akazi no gukora amasezerano',
          'Gukora raporo z\'imyigire no kuzitanga ubuyobozi',
          'Gukurikirana abanyeshuri mu gihe cy\'imyigire',
          'Gufasha abanyeshuri kubona akazi nyuma y\'imyigire',
          'Gukora inama z\'abanyeshuri ku bijyanye n\'imyigire',
          'Kwemeza ko imyigire ihuye n\'ibisabwa n\'amashuri'
        ]),
        qualifications: JSON.stringify([
          'Master\'s Degree mu Technical Education - Kigali Institute of Science and Technology (2016)',
          'Bachelor\'s Degree mu Engineering - University of Rwanda (2012)',
          'Certificate mu Vocational Training - WDA (2018)',
          'Training mu Industry Partnership - GIZ Rwanda (2019)',
          'Diploma mu Career Guidance - African Virtual University (2020)'
        ])
      },
      {
        name: 'Uwase Marie',
        role: 'Umuyobozi w\'Amafaranga',
        department: 'Amafaranga',
        bio: 'Umuyobozi w\'amafaranga ushinzwe gucunga amafaranga y\'ishuri, gukora ingengo y\'imari, no kwishyura abakozi. Afite uburambe bw\'imyaka 10 mu bucuruzi n\'ibaruramari. Yabaye umuyobozi w\'amafaranga kuva 2019, aho yagaragaje ubushobozi bukomeye mu gucunga amafaranga, gukora ingengo y\'imari, no kwishyura abakozi. Yashyizeho sisitemu yo gucunga amafaranga, sisitemu yo gukurikirana amafaranga, na sisitemu yo gutanga raporo z\'amafaranga.',
        image_url: '/api/placeholder/400/400',
        email: 'accountant@garden-tvet.rw',
        phone: '+250 788 456 789',
        office_location: 'Office Block A, Room 103',
        sort_order: 4,
        responsibilities: JSON.stringify([
          'Gucunga amafaranga y\'ishuri no kwemeza ko akoreshwa neza',
          'Gukora ingengo y\'imari y\'ishuri no kuyikurikirana',
          'Kwishyura abakozi ku gihe no mu buryo bwuzuye',
          'Gukora raporo z\'amafaranga no kuzitanga ubuyobozi',
          'Gukurikirana amadeni y\'ishuri no gufasha abanyeshuri kwishyura',
          'Gukora ibaruramari ry\'ishuri no kuryemeza ko ryuzuye',
          'Gufatanya n\'abanzi no gukora amasezerano',
          'Kwemeza ko ishuri ryubahiriza amategeko y\'ibaruramari'
        ]),
        qualifications: JSON.stringify([
          'Master\'s Degree mu Accounting - University of Rwanda (2015)',
          'Bachelor\'s Degree mu Finance - Kigali Independent University (2011)',
          'CPA Certification - Institute of Certified Public Accountants of Rwanda (2017)',
          'Training mu Financial Management - World Bank (2018)',
          'Diploma mu Auditing - African Virtual University (2019)'
        ])
      },
      {
        name: 'Habimana Joseph',
        role: 'Umuyobozi w\'Abanyeshuri',
        department: 'Imyifatire y\'Abanyeshuri',
        bio: 'Umuyobozi w\'abanyeshuri ushinzwe gukurikirana imyifatire y\'abanyeshuri, gukemura ibibazo byabo, no kubafasha mu buzima bwabo bwa buri munsi. Afite uburambe bw\'imyaka 8 mu buyobozi bw\'abanyeshuri n\'imyifatire. Yabaye umuyobozi w\'abanyeshuri kuva 2021, aho yagaragaje ubushobozi bukomeye mu gukurikirana abanyeshuri, gukemura ibibazo byabo, no kubafasha mu buzima bwabo.',
        image_url: '/api/placeholder/400/400',
        email: 'studentaffairs@garden-tvet.rw',
        phone: '+250 788 567 890',
        office_location: 'Office Block B, Room 202',
        sort_order: 5,
        responsibilities: JSON.stringify([
          'Gukurikirana imyifatire y\'abanyeshuri no kwemeza ko myiza',
          'Gukemura ibibazo by\'abanyeshuri no kubafasha',
          'Gufasha abanyeshuri mu buzima bwabo bwa buri munsi',
          'Gukora ibikorwa by\'abanyeshuri nk\'imikino n\'ibirori',
          'Gutanga ubujyanama ku banyeshuri bakeneye ubufasha',
          'Gukurikirana indwara z\'abanyeshuri no kubafasha',
          'Gufatanya n\'ababyeyi mu gukemura ibibazo by\'abana',
          'Kwemeza ko abanyeshuri bafite umutekano mu ishuri'
        ]),
        qualifications: JSON.stringify([
          'Master\'s Degree mu Student Affairs - University of Rwanda (2018)',
          'Bachelor\'s Degree mu Psychology - Kigali Independent University (2014)',
          'Certificate mu Counseling - Rwanda Counseling Association (2019)',
          'Training mu Conflict Resolution - Search for Common Ground (2020)',
          'Diploma mu Youth Development - African Virtual University (2021)'
        ])
      }
    ];

    for (const leader of leaders) {
      await connection.query(
        `INSERT INTO school_leadership 
         (name, role, department, bio, image_url, email, phone, office_location, responsibilities, qualifications, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leader.name,
          leader.role,
          leader.department,
          leader.bio,
          leader.image_url,
          leader.email,
          leader.phone,
          leader.office_location,
          leader.responsibilities,
          leader.qualifications,
          leader.sort_order
        ]
      );
    }

    console.log('✓ Leadership data updated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

updateLeadership().catch(console.error);
