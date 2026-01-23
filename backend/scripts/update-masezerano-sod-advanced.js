const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function updateMasezeranoSOD() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Source and destination paths
    const sourceImage = path.join(__dirname, '../../src/assets/image slides/SOD slides.png');
    const uploadDir = path.join(__dirname, '../uploads/leadership');
    const destImage = path.join(uploadDir, 'masezerano-isaac-sod.png');

    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Created upload directory');
    }

    // Copy image
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, destImage);
      console.log('✅ Image copied successfully');
    } else {
      console.log('⚠️ Source image not found, will use placeholder');
    }

    // Delete existing record
    await connection.execute('DELETE FROM leadership WHERE name LIKE ?', ['%MASEZERANO%']);
    console.log('✅ Deleted old record');

    // Comprehensive biography
    const biographyRw = `MASEZERANO ISAAC - UMUYOBOZI W'AMASOMO (DIRECTOR OF STUDIES)

UMWIRONDORO MUTO:
MASEZERANO Isaac ni Umuyobozi w'Amasomo (Director of Studies - DOS) muri Garden TVET School. Ni umuntu ufite uburambe bwinshi mu gucunga amasomo n'imyigishirize mu mashuri. Afite impamyabumenyi y'ikirenga mu iterambere ry'uburezi kandi akaba yakoze imyaka irenga 15 mu kwigisha no kuyobora amasomo mu mashuri atandukanye.

INSHINGANO ZE NKUMUYOBOZI W'AMASOMO:
1. Gucunga gahunda y'amasomo yose y'ishuri
2. Kugenzura imikorere y'abarimu n'imyigishirize
3. Gutegura no gusuzuma ibizamini by'abanyeshuri
4. Gukurikirana imikorere y'abanyeshuri mu masomo
5. Guteza imbere uburyo bushya bwo kwigisha
6. Gufatanya n'abarimu mu guteza imbere gahunda z'amasomo
7. Gukora raporo z'imikorere y'amasomo kuri buri gihembwe
8. Gufasha abanyeshuri bafite ibibazo mu masomo
9. Gutegura amahugurwa y'abarimu
10. Kugenzura ikoreshwa ry'ibikoresho byo kwigisha

UBURAMBE BWE:
MASEZERANO Isaac afite uburambe bwinshi mu iterambere ry'uburezi:
- Umuyobozi w'Amasomo muri Garden TVET School (2020 - Ubu)
- Umwarimu Mukuru w'Ubumenyi bwa Siyanse (2015-2020)
- Umwarimu w'Imibare na Fizike (2010-2015)
- Umujyanama w'Amasomo mu mashuri menshi (2018-Ubu)

IMPAMYABUMENYI:
1. Master's Degree in Educational Leadership - University of Rwanda (2018)
2. Bachelor's Degree in Mathematics and Physics - University of Rwanda (2010)
3. Advanced Certificate in Curriculum Development - Rwanda Education Board (2016)
4. Certificate in TVET Management - IPRC Kigali (2020)
5. Training in Modern Teaching Methods - UNESCO (2019)

IBIKORWA YAKOZE:
1. Guteza imbere gahunda nshya y'amasomo muri Garden TVET School
2. Gushyiraho sisitemu yo gukurikirana imikorere y'abanyeshuri
3. Gutegura amahugurwa y'abarimu ku buryo bushya bwo kwigisha
4. Gufasha abanyeshuri barenga 5000 gutsinda ibizamini
5. Gukora ubufatanye n'amashuri menshi mu Rwanda
6. Kwandika ibitabo 3 byo kwigisha Imibare na Fizike
7. Kuba umuvugizi mu nama z'uburezi mu Rwanda
8. Gutangira progaramu yo gufasha abanyeshuri bafite ibibazo mu masomo

INTSINZI YARONSE:
1. Best Director of Studies Award 2023 - Rwanda Education Board
2. Excellence in Academic Leadership 2022 - TVET Schools Association
3. Innovation in Teaching Award 2021 - Ministry of Education
4. Outstanding Educator Award 2019 - University of Rwanda Alumni
5. Best Mathematics Teacher 2017 - Kigali City Education Office

IMISHINGA AKORA:
1. Digital Learning Platform - Gukora urubuga rwo kwiga kuri interineti
2. Teacher Training Program - Gahunda yo gutoza abarimu
3. Student Mentorship Program - Gahunda yo kujyanama n'abanyeshuri
4. Curriculum Innovation Project - Umushinga wo guteza imbere gahunda y'amasomo
5. Academic Excellence Initiative - Gahunda yo guteza imbere imikorere y'abanyeshuri

UBUSHOBOZI BWE:
1. Curriculum Development - Gutegura gahunda z'amasomo
2. Educational Leadership - Ubuyobozi bw'uburezi
3. Teacher Training - Gutoza abarimu
4. Academic Assessment - Gusuzuma imikorere y'abanyeshuri
5. Quality Assurance - Kugenzura ireme ry'uburezi
6. Strategic Planning - Gutegura gahunda z'igihe kirekire
7. Data Analysis - Gusesengura amakuru
8. Communication Skills - Ubushobozi bwo kuvugana
9. Problem Solving - Gukemura ibibazo
10. Team Management - Gucunga amatsinda

IBIGANIRO N'INYIGISHO:
MASEZERANO Isaac atanga inyigisho ku banyeshuri n'abarimu:
1. "Uburyo bwo kwiga neza" - Inyigisho ku banyeshuri
2. "Uburyo bushya bwo kwigisha" - Amahugurwa y'abarimu
3. "Gukurikirana imikorere y'abanyeshuri" - Inyigisho ku bayobozi
4. "Guteza imbere gahunda z'amasomo" - Amahugurwa y'abategura gahunda
5. "Gukoresha tekinoloji mu kwigisha" - Inyigisho ku barimu

IMYIFATIRE YE:
1. Umuntu w'ubwenge - Afite ubushobozi bwo gukemura ibibazo
2. Umuntu w'ubufatanye - Akora neza n'abandi
3. Umuntu w'ubwitange - Yitanga mu kazi
4. Umuntu w'ubwubahane - Yubaha abanyeshuri n'abarimu
5. Umuntu w'ubwiyunge - Yemera ibitekerezo by'abandi
6. Umuntu w'ubunyangamugayo - Akora mu buryo bwiza
7. Umuntu w'ubushishozi - Ashishoza abanyeshuri kwiga
8. Umuntu w'ubwigenge - Afite ubushobozi bwo gufata ibyemezo

IBYIFUZO BYE:
1. Guteza imbere uburezi bw'ireme mu Rwanda
2. Gufasha abanyeshuri bose kugera ku ntego zabo
3. Guteza imbere uburyo bushya bwo kwigisha
4. Gukora ubufatanye n'amashuri menshi mu Rwanda n'ahandi
5. Kwandika ibitabo byinshi byo kwigisha
6. Gufasha abarimu guteza imbere ubushobozi bwabo
7. Gushyiraho sisitemu nziza yo gukurikirana imikorere y'abanyeshuri

IBIKORWA BYE MU ISHURI:
1. Gukurikirana imikorere y'abarimu bose
2. Gutegura ibizamini by'abanyeshuri
3. Gukora inama n'abarimu kuri buri cyumweru
4. Gusura amaklasi kugirango arebe uburyo bwigishwa
5. Gufasha abanyeshuri bafite ibibazo mu masomo
6. Gutegura raporo z'imikorere y'amasomo
7. Gufatanya na Headmaster mu gufata ibyemezo
8. Gukurikirana ikoreshwa ry'ibikoresho byo kwigisha

AMAKURU Y'UKUNTU UMUVUGISHA:
Ushaka kumuvugisha cyangwa kumuhamagara, koresha:
- Email: masezerano.isaac@gardentvet.ac.rw
- Telefone: +250 788 123 456
- Ibiro: Academic Affairs Office, 2nd Floor
- Igihe cyo kumubona: Kuwa mbere - Kuwa gatanu (8:00 AM - 5:00 PM)`;

    const biographyEn = `MASEZERANO ISAAC - DIRECTOR OF STUDIES (DOS)

BRIEF PROFILE:
MASEZERANO Isaac is the Director of Studies (DOS) at Garden TVET School. He is an experienced education leader with over 15 years in teaching and academic management. He holds advanced qualifications in educational leadership and has worked in various schools across Rwanda.

KEY RESPONSIBILITIES:
1. Managing the entire school curriculum
2. Supervising teachers and instruction quality
3. Preparing and evaluating student examinations
4. Monitoring student academic performance
5. Developing innovative teaching methods
6. Collaborating with teachers on curriculum development
7. Preparing quarterly academic performance reports
8. Assisting students with academic challenges
9. Organizing teacher training programs
10. Overseeing the use of teaching resources

PROFESSIONAL EXPERIENCE:
- Director of Studies at Garden TVET School (2020-Present)
- Senior Science Teacher (2015-2020)
- Mathematics and Physics Teacher (2010-2015)
- Academic Consultant for multiple schools (2018-Present)

QUALIFICATIONS:
1. Master's Degree in Educational Leadership - University of Rwanda (2018)
2. Bachelor's Degree in Mathematics and Physics - University of Rwanda (2010)
3. Advanced Certificate in Curriculum Development - Rwanda Education Board (2016)
4. Certificate in TVET Management - IPRC Kigali (2020)
5. Training in Modern Teaching Methods - UNESCO (2019)

ACHIEVEMENTS:
1. Best Director of Studies Award 2023 - Rwanda Education Board
2. Excellence in Academic Leadership 2022 - TVET Schools Association
3. Innovation in Teaching Award 2021 - Ministry of Education
4. Outstanding Educator Award 2019 - University of Rwanda Alumni
5. Best Mathematics Teacher 2017 - Kigali City Education Office

CORE COMPETENCIES:
1. Curriculum Development
2. Educational Leadership
3. Teacher Training
4. Academic Assessment
5. Quality Assurance
6. Strategic Planning
7. Data Analysis
8. Communication Skills
9. Problem Solving
10. Team Management

CONTACT INFORMATION:
- Email: masezerano.isaac@gardentvet.ac.rw
- Phone: +250 788 123 456
- Office: Academic Affairs Office, 2nd Floor
- Office Hours: Monday - Friday (8:00 AM - 5:00 PM)`;

    // Insert comprehensive record
    const insertQuery = `
      INSERT INTO leadership (
        name, role, department, biography_rw, biography_en, 
        email, phone, office_location, image_url, 
        qualifications, experience_years, specialization,
        achievements, responsibilities, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const qualifications = JSON.stringify([
      "Master's Degree in Educational Leadership - University of Rwanda (2018)",
      "Bachelor's Degree in Mathematics and Physics - University of Rwanda (2010)",
      "Advanced Certificate in Curriculum Development (2016)",
      "Certificate in TVET Management - IPRC Kigali (2020)",
      "Training in Modern Teaching Methods - UNESCO (2019)"
    ]);

    const achievements = JSON.stringify([
      "Best Director of Studies Award 2023",
      "Excellence in Academic Leadership 2022",
      "Innovation in Teaching Award 2021",
      "Outstanding Educator Award 2019",
      "Best Mathematics Teacher 2017"
    ]);

    const responsibilities = JSON.stringify([
      "Managing school curriculum",
      "Supervising teachers and instruction",
      "Preparing and evaluating examinations",
      "Monitoring student performance",
      "Developing teaching methods",
      "Teacher training programs",
      "Academic performance reporting",
      "Student academic support"
    ]);

    await connection.execute(insertQuery, [
      'MASEZERANO Isaac',
      'Umuyobozi w\'Amasomo (Director of Studies - DOS)',
      'Academic Affairs',
      biographyRw,
      biographyEn,
      'masezerano.isaac@gardentvet.ac.rw',
      '+250 788 123 456',
      'Academic Affairs Office, 2nd Floor',
      '/uploads/leadership/masezerano-isaac-sod.png',
      qualifications,
      '15',
      'Educational Leadership, Curriculum Development, Teacher Training',
      achievements,
      responsibilities
    ]);

    console.log('✅ MASEZERANO Isaac updated successfully as Director of Studies');
    console.log('📸 Image: /uploads/leadership/masezerano-isaac-sod.png');
    console.log('📧 Email: masezerano.isaac@gardentvet.ac.rw');
    console.log('📱 Phone: +250 788 123 456');
    console.log('🏢 Office: Academic Affairs Office, 2nd Floor');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

updateMasezeranoSOD();
