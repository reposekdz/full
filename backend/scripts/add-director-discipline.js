const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function addDirectorOfDiscipline() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Copy image to backend uploads
    const sourcePath = path.join(__dirname, '../../src/assets/ubuyobozi/masezerano issac DOS.jpeg');
    const destDir = path.join(__dirname, '../uploads/leadership');
    const destPath = path.join(destDir, 'masezerano-isaac.jpeg');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log('✅ Image copied successfully');
    }

    // Insert Director of Discipline
    await connection.query(`
      INSERT INTO school_leadership (name, role, department, bio, image_url, email, phone, office_location, responsibilities, qualifications, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'MASEZERANO Isaac',
      'Umuyobozi w\'Imyitwarire',
      'Discipline',
      `MASEZERANO Isaac ni Umuyobozi w'Imyitwarire (Director of Discipline - DOD) muri Garden TVET School. Afite uburambe bukomeye mu gucunga imyitwarire y'abanyeshuri no kurinda umutekano mu ishuri.

INSHINGANO ZE NYAMUKURU:

1. GUCUNGA IMYITWARIRE Y'ABANYESHURI
Masezerano afite inshingano yo kureba ko abanyeshuri bose bakurikiza amategeko n'amabwiriza y'ishuri. Akora ku:
- Gushyiraho amategeko agenga imyitwarire y'abanyeshuri
- Gukurikirana abanyeshuri bose no kureba ko bakurikiza amategeko
- Gukemura ibibazo by'imyitwarire mibi
- Gutanga ibihano biboneye ku banyeshuri batubahiriza amategeko

2. UMUTEKANO MU ISHURI
Afite uruhare runini mu kurinda umutekano mu ishuri:
- Kureba ko abanyeshuri bose bari mu mutekano
- Gukurikirana abantu bose binjira no gusohoka mu ishuri
- Gufatanya n'abapolisi mu gukemura ibibazo by'umutekano
- Gutegura gahunda zo kurinda umutekano

3. GUFATANYA N'ABABYEYI
Masezerano akora cyane n'ababyeyi:
- Kubamenyesha ibibazo by'imyitwarire by'abana babo
- Gufatanya nabo mu gukemura ibibazo
- Gutanga inama ku bijyanye n'imyitwarire myiza
- Gukora inama rusange n'ababyeyi

4. GUTANGA INAMA
Atanga inama ku banyeshuri:
- Kubafasha guhindura imyitwarire mibi
- Kubaha inama ku bijyanye n'imyitwarire myiza
- Kubafasha gukemura ibibazo bafite
- Kubaha intego zo kugera ku

5. GUKORA RAPORO
Akora raporo zijyanye n'imyitwarire:
- Raporo z'abanyeshuri bafite ibibazo by'imyitwarire
- Raporo z'ibikorwa byakozwe mu gukemura ibibazo
- Raporo z'iterambere ry'abanyeshuri
- Raporo zo gutanga abayobozi b'ishuri

UBUMENYI N'UBURAMBE:

Masezerano afite ubumenyi bukomeye mu bijyanye n'imyitwarire y'abanyeshuri:
- Impamyabumenyi mu Uburezi (Bachelor's Degree in Education)
- Impamyabumenyi mu Bujyanama (Diploma in Counseling)
- Amahugurwa mu gucunga imyitwarire y'abanyeshuri
- Uburambe bw'imyaka 15 mu ishuri

IBIKORWA YAKOZE:

1. Yashyizeho amategeko mashya agenga imyitwarire y'abanyeshuri
2. Yateje imbere gahunda yo gufasha abanyeshuri bafite ibibazo by'imyitwarire
3. Yafashe abanyeshuri benshi guhindura imyitwarire mibi
4. Yashyizeho sisitemu yo gukurikirana imyitwarire y'abanyeshuri
5. Yateje imbere umubano mwiza hagati y'ishuri n'ababyeyi

IMYITWARIRE YE:

Masezerano ni umuntu:
- Ukomeye mu gufata ibyemezo
- Ukunda abanyeshuri kandi yifuza ko batera imbere
- Ukora neza n'abandi
- Ukurikiza amategeko
- Ufite ubwenge bwo gukemura ibibazo

INTEGO ZE:

1. Gufasha abanyeshuri bose kugira imyitwarire myiza
2. Kurinda umutekano mu ishuri
3. Gufatanya n'ababyeyi mu kurera abana
4. Guteza imbere umubano mwiza mu ishuri
5. Gufasha abanyeshuri kugera ku ntego zabo

AMAHUGURWA YAHAWE:

- Conflict Resolution Training
- Student Behavior Management
- School Safety and Security
- Counseling and Guidance
- Leadership and Management

IBIHEMBO YARONSE:

1. Best Discipline Officer 2023 - TVET Schools Rwanda
2. Excellence in Student Management 2024
3. Outstanding Leadership Award 2024
4. Community Service Award 2025`,
      '/uploads/leadership/masezerano-isaac.jpeg',
      'masezerano.isaac@garden-tvet.rw',
      '+250 788 567 890',
      'Discipline Office, Block A',
      JSON.stringify([
        'Gucunga imyitwarire y\'abanyeshuri',
        'Kurinda umutekano mu ishuri',
        'Gufatanya n\'ababyeyi',
        'Gutanga inama ku banyeshuri',
        'Gukora raporo z\'imyitwarire',
        'Gukurikirana amategeko y\'ishuri',
        'Gukemura amakimbirane',
        'Gutegura gahunda zo kurinda umutekano'
      ]),
      JSON.stringify([
        'Bachelor\'s Degree in Education',
        'Diploma in Counseling',
        'Certificate in Student Behavior Management',
        'Certificate in Conflict Resolution',
        '15 years experience in school discipline'
      ]),
      3,
      true
    ]);

    console.log('✅ Director of Discipline added successfully');
    console.log('\n🎉 Masezerano Isaac profile created!');
    console.log('\nProfile Details:');
    console.log('- Name: MASEZERANO Isaac');
    console.log('- Role: Umuyobozi w\'Imyitwarire (Director of Discipline)');
    console.log('- Image: /uploads/leadership/masezerano-isaac.jpeg');
    console.log('- Email: masezerano.isaac@garden-tvet.rw');
    console.log('- Phone: +250 788 567 890');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

addDirectorOfDiscipline();
