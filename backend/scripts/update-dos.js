const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function updateDirectorOfStudies() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Update to Director of Studies
    await connection.query(`
      UPDATE school_leadership 
      SET 
        role = 'Umuyobozi w\'Amasomo',
        department = 'Academic Affairs',
        bio = 'MASEZERANO Isaac ni Umuyobozi w\'Amasomo (Director of Studies - DOS) muri Garden TVET School. Afite uburambe bukomeye mu gucunga amasomo n\'iterambere ry\'abanyeshuri mu by\'ubumenyi.

INSHINGANO ZE NYAMUKURU:

1. GUCUNGA AMASOMO
Masezerano afite inshingano yo kureba ko amasomo yose agenwa neza kandi akurikizwa:
- Gukora gahunda y\'amasomo (Timetable)
- Gukurikirana abarimu no kureba ko batanga amasomo neza
- Gukemura ibibazo bijyanye n\'amasomo
- Kwemeza ko amasomo akurikiza gahunda y\'ishuri

2. GUKURIKIRANA ITERAMBERE RY\'ABANYESHURI
Afite uruhare runini mu gukurikirana iterambere ry\'abanyeshuri:
- Gukora raporo z\'amanota y\'abanyeshuri
- Gufasha abanyeshuri bafite ibibazo mu kwiga
- Gutegura ibizamini
- Gusuzuma ibisubizo by\'ibizamini

3. GUFATANYA N\'ABARIMU
Masezerano akora cyane n\'abarimu:
- Kubaha inama ku bijyanye no gutanga amasomo
- Gufasha abarimu bashya kwinjira mu kazi
- Gukora inama z\'abarimu
- Gukemura ibibazo by\'abarimu

4. GUKORA RAPORO
Akora raporo zijyanye n\'amasomo:
- Raporo z\'iterambere ry\'abanyeshuri
- Raporo z\'ibikorwa by\'abarimu
- Raporo z\'ibizamini
- Raporo zo gutanga abayobozi b\'ishuri

5. GUTEGURA IBIZAMINI
Afite uruhare runini mu gutegura ibizamini:
- Gukora gahunda y\'ibizamini
- Kwemeza ko ibibazo by\'ibizamini byujuje ibisabwa
- Gukurikirana ibizamini
- Gusuzuma ibisubizo

UBUMENYI N\'UBURAMBE:

Masezerano afite ubumenyi bukomeye mu bijyanye n\'uburezi:
- Master\'s Degree in Education Management
- Bachelor\'s Degree in Education
- Diploma in Curriculum Development
- Amahugurwa mu gucunga amasomo
- Uburambe bw\'imyaka 18 mu ishuri

IBIKORWA YAKOZE:

1. Yashyizeho sisitemu nshya yo gukora gahunda y\'amasomo
2. Yateje imbere gahunda yo gufasha abanyeshuri bafite ibibazo mu kwiga
3. Yafashe abarimu benshi guteza imbere uburyo bwo gutanga amasomo
4. Yashyizeho sisitemu yo gukurikirana iterambere ry\'abanyeshuri
5. Yateje imbere ibizamini byujuje ibisabwa

IMYITWARIRE YE:

Masezerano ni umuntu:
- Ukunda amasomo kandi yifuza ko abanyeshuri biga neza
- Ukora neza n\'abarimu
- Ukurikiza gahunda
- Ufite ubwenge bwo gukemura ibibazo
- Ukunda gufasha abandi

INTEGO ZE:

1. Guteza imbere uburyo bwo gutanga amasomo
2. Gufasha abanyeshuri bose kwiga neza
3. Gufatanya n\'abarimu mu guteza imbere amasomo
4. Kwemeza ko amasomo akurikiza gahunda y\'ishuri
5. Gufasha abanyeshuri kugera ku ntego zabo

AMAHUGURWA YAHAWE:

- Curriculum Development and Implementation
- Student Assessment and Evaluation
- Academic Leadership and Management
- Teaching Methodology and Pedagogy
- Educational Technology Integration

IBIHEMBO YARONSE:

1. Best Academic Director 2023 - TVET Schools Rwanda
2. Excellence in Academic Management 2024
3. Outstanding Leadership in Education 2024
4. Innovation in Teaching Award 2025',
        responsibilities = JSON.stringify([
          'Gucunga amasomo yose',
          'Gukora gahunda y\'amasomo (Timetable)',
          'Gukurikirana abarimu',
          'Gukurikirana iterambere ry\'abanyeshuri',
          'Gutegura ibizamini',
          'Gukora raporo z\'amasomo',
          'Gufatanya n\'abarimu',
          'Gukemura ibibazo bijyanye n\'amasomo'
        ]),
        qualifications = JSON.stringify([
          'Master\'s Degree in Education Management',
          'Bachelor\'s Degree in Education',
          'Diploma in Curriculum Development',
          'Certificate in Academic Leadership',
          '18 years experience in education'
        ]),
        office_location = 'DOS Office, Administration Block'
      WHERE name = 'MASEZERANO Isaac'
    `);

    console.log('✅ Updated to Director of Studies (DOS)');
    console.log('\n🎉 Masezerano Isaac profile updated!');
    console.log('\nUpdated Details:');
    console.log('- Name: MASEZERANO Isaac');
    console.log('- Role: Umuyobozi w\'Amasomo (Director of Studies - DOS)');
    console.log('- Department: Academic Affairs');
    console.log('- Office: DOS Office, Administration Block');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateDirectorOfStudies();
