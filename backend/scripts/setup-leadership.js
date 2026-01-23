const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupLeadershipTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management'
  });

  try {
    console.log('🔧 Setting up leadership table...');

    // Create table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leadership (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        biography_rw TEXT NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        office_location VARCHAR(255) NOT NULL,
        image_url VARCHAR(500),
        qualifications JSON,
        experience_years INT DEFAULT 0,
        specialization VARCHAR(255),
        achievements JSON,
        responsibilities JSON,
        office_hours VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Leadership table created');

    // Insert sample data
    const leaders = [
      {
        name: 'Mugisha Jean Claude',
        role: 'Umuyobozi Mukuru',
        department: 'Ubuyobozi Bukuru',
        biography_rw: `Mugisha Jean Claude ni Umuyobozi Mukuru w'Ishuri rya Garden TVET School, umuyobozi ukomeye kandi ufite uburambe bw'imyaka 15+ mu kuyobora amashuri y'ubumenyi bw'ikoranabuhanga mu Rwanda. Yavutse mu 1978 mu Karere ka Gasabo, Umujyi wa Kigali, aho yakuriye mu muryango w'abarimu kandi yiga mu mashuri yiza. Kuva akiri muto, yagaragaje ubushobozi bukomeye mu kwiga no mu kuyobora, bikamugeza ku kuba umuyobozi mukuru w'ishuri rikomeye nka Garden TVET School.

UBUZIMA BWE BW'AMATEKA:
Mugisha yize amashuri abanza mu Ishuri Ryisumbuye rya Kigali (1984-1990), aho yagaragaje ubushobozi bukomeye mu masomo yose. Yakomeje amashuri yisumbuye mu Lycée de Kigali (1991-1996), aho yize mu ishami rya Sciences. Nyuma y'amashuri yisumbuye, yinjiye muri Kaminuza y'u Rwanda (1997-2001) aho yize Bachelor's Degree mu Buyobozi bw'Uburezi. Nyuma yo kurangiza kaminuza, yakomeje kwiga Masters mu Buyobozi bw'Uburezi (2005-2007) muri Kaminuza y'u Rwanda.

UBURAMBE BWE MU KAZI:
Mugisha yatangiye umwuga we nk'umwarimu mu Ishuri Ryisumbuye rya Nyarugenge (2001-2003), aho yigishaga Mathematics na Physics. Nyuma yaje kuba umuyobozi w'amasomo mu Ishuri Ryisumbuye rya Kicukiro (2003-2007), aho yagaragaje ubushobozi bukomeye mu kuyobora no guteza imbere uburezi. Mu 2007, yaje kuba umuyobozi mukuru w'Ishuri Ryisumbuye rya Gasabo (2007-2015), aho yateje imbere ishuri kugeza ku rwego rwo hejuru. Mu 2015, yatoranijwe kuba umuyobozi mukuru wa Garden TVET School, aho akora kugeza ubu.

INSHINGANO ZE NK'UMUYOBOZI MUKURU:
1. KUYOBORA ISHURI MURI RUSANGE - Mugisha afite inshingano yo kuyobora ishuri muri rusange, gushyira mu bikorwa politiki z'ishuri, gufatanya n'abakozi bose, no kwemeza ko ishuri rigera ku ntego zaryo. Akora raporo ku nama y'ubuyobozi b'ishuri buri kwezi, agatanga ibitekerezo ku buryo bwo guteza imbere ishuri.

2. GUSHYIRA MU BIKORWA POLITIKI Z'ISHURI - Afite inshingano yo kwemeza ko politiki zose z'ishuri zishyirwa mu bikorwa neza. Ibi bikubiyemo politiki zo kwinjiza abanyeshuri, politiki zo kwishyura amafaranga, politiki z'indero, na politiki z'amasomo.

3. GUFATANYA N'ABAKOZI BOSE - Mugisha afatanya n'abakozi bose b'ishuri harimo abarimu, abakozi b'ubuyobozi, abakozi b'indero, n'abakozi b'ibikorwa. Akora inama n'abakozi buri cyumweru kugira ngo abone ibibazo n'ibisubizo.

4. GUFATANYA N'ABABYEYI - Afite inshingano yo gufatanya n'ababyeyi b'abanyeshuri kugira ngo babone amakuru ku iterambere ry'abana babo. Akora inama n'ababyeyi buri gihembwe kugira ngo abahe amakuru ku ishuri.

5. GUFATANYA N'UBUYOBOZI BW'IGIHUGU - Mugisha afatanya n'ubuyobozi bw'igihugu harimo MINEDUC, REB, na WDA kugira ngo yemeze ko ishuri rikurikiza amategeko n'amabwiriza y'igihugu.

IMISHINGA YAKOZE:
1. SISITEMU YO GUCUNGA ISHURI - Mu 2016, Mugisha yashyizeho sisitemu nshya yo gucunga ishuri ikoresheje tekinoloji. Iyi sisitemu ifasha mu kwiyandikisha abanyeshuri, gukurikirana amanota, gukora raporo, no guhanahana n'ababyeyi. Sisitemu yatumye ishuri ryongera umusaruro kandi rigateza imbere uburyo bwo gukora.

2. GAHUNDA YO GUTEZA IMBERE UBUSHOBOZI BW'ABAKOZI - Mu 2017, yatunganye gahunda yo guteza imbere ubushobozi bw'abakozi b'ishuri. Iyi gahunda ifasha abarimu no guhugura mu buryo bwo kwigisha, gukoresha tekinoloji mu kwigisha, no gucunga amaklasi. Gahunda yatumye abarimu bongera ubushobozi kandi bagateza imbere uburyo bwo kwigisha.

3. AMASEZERANO Y'UBUFATANYE - Mugisha yashyizeho amasezerano y'ubufatanye n'amashuri menshi mu Rwanda no mu mahanga. Aya masezerano afasha abanyeshuri kubona amahirwe yo guhana uburambe, kwiga mu mahanga, no kubona akazi nyuma y'amashuri. Amasezerano yafashije abanyeshuri benshi kubona amahirwe menshi.

4. GAHUNDA YO GUFASHA ABANYESHURI BAKENNYE - Mu 2018, yatunganye gahunda yo gufasha abanyeshuri bakennye kwishyura amafaranga y'ishuri. Iyi gahunda ifasha abanyeshuri bakennye kubona inkunga yo kwishyura amafaranga y'ishuri, kugura ibikoresho by'ishuri, no kubona imyambaro. Gahunda yafashije abanyeshuri benshi bakennye kwiga neza.

5. SISITEMU YO GUKURIKIRANA IMIKORERE Y'ABANYESHURI - Mu 2019, yashyizeho sisitemu yo gukurikirana imikorere y'abanyeshuri. Iyi sisitemu ifasha abarimu gukurikirana iterambere ry'abanyeshuri, kubona ibibazo, no gufasha abanyeshuri bafite ibibazo. Sisitemu yatumye abanyeshuri bongera imikorere kandi bakarangiza amashuri neza.

INTEGO ZE:
1. GUTEZA IMBERE UBUREZI BW'UBUMENYI BW'IKORANABUHANGA - Mugisha afite intego yo guteza imbere uburezi bw'ubumenyi bw'ikoranabuhanga mu Rwanda. Yifuza ko abanyeshuri bose bazabona amahirwe yo kwiga ubumenyi bw'ikoranabuhanga kandi bakabona akazi nyuma y'amashuri.

2. GUFASHA ABANYESHURI BOSE KUBONA AMAHIRWE YO KWIGA - Afite intego yo gufasha abanyeshuri bose kubona amahirwe yo kwiga nta kubangamira. Yifuza ko abanyeshuri bakennye bazabona inkunga yo kwishyura amafaranga y'ishuri.

3. GUSHYIRA MU BIKORWA TEKINOLOJI ZIGEZWEHO - Mugisha afite intego yo gushyira mu bikorwa tekinoloji zigezweho mu ishuri. Yifuza ko ishuri rizakoresha tekinoloji mu kwigisha, gucunga ishuri, no guhanahana n'ababyeyi.

4. GUFATANYA N'AMASHURI MENSHI - Afite intego yo gufatanya n'amashuri menshi mu Rwanda no mu mahanga. Yifuza ko abanyeshuri bazabona amahirwe yo guhana uburambe no kwiga mu mahanga.

5. GUTEZA IMBERE UBUSHOBOZI BW'ABAKOZI - Mugisha afite intego yo guteza imbere ubushobozi bw'abakozi b'ishuri. Yifuza ko abakozi bazabona amahugurwa menshi kandi bakateza imbere ubushobozi bwabo.

UBUSHOBOZI BWE:
1. UBUYOBOZI - Mugisha afite ubushobozi bukomeye mu kuyobora amashuri. Yagaragaje ubushobozi bwo kuyobora amashuri menshi kandi akagateza imbere.

2. GUTEGURA INGAMBA - Afite ubushobozi bwo gutegura ingamba zo guteza imbere ishuri. Yagaragaje ubushobozi bwo gutegura ingamba nziza kandi zigateza imbere ishuri.

3. GUFATANYA N'ABANDI - Mugisha afite ubushobozi bwo gufatanya n'abandi. Akora neza n'abakozi, ababyeyi, n'ubuyobozi bw'igihugu.

4. GUKEMURA IBIBAZO - Afite ubushobozi bwo gukemura ibibazo. Yagaragaje ubushobozi bwo gukemura ibibazo byinshi mu ishuri.

5. GUHANAHANA - Mugisha afite ubushobozi bwo guhanahana neza. Ahanahana neza n'abakozi, ababyeyi, n'abanyeshuri.

IBIHEMBO YARONSE:
1. BEST HEADMASTER 2020 - Yaronse igihembo cy'umuyobozi mukuru mwiza mu Rwanda mu 2020.
2. EDUCATION LEADERSHIP AWARD 2021 - Yaronse igihembo cy'ubuyobozi bw'uburezi mu 2021.
3. INNOVATION IN EDUCATION 2022 - Yaronse igihembo cy'ubushakashatsi mu burezi mu 2022.
4. EXCELLENCE IN TVET 2023 - Yaronse igihembo cy'ubwiza mu burezi bw'ubumenyi bw'ikoranabuhanga mu 2023.

UMURANGO WE:
Mugisha arashakanye kandi afite abana 3. Umugore we ni umwarimu mu ishuri ryisumbuye. Abana be biga mu mashuri yiza mu Rwanda.`,
        email: 'headmaster@garden-tvet.rw',
        phone: '+250 788 123 456',
        office_location: 'Ibiro by\'Umuyobozi Mukuru, Ikibanza 1',
        qualifications: JSON.stringify([
          'Masters mu Buyobozi bw\'Uburezi - Kaminuza y\'u Rwanda',
          'Bachelor\'s Degree mu Buyobozi - Kaminuza y\'u Rwanda',
          'Icyemezo cy\'Ubuyobozi bw\'Amashuri - MINEDUC',
          'Amahugurwa mu Kuyobora - Rwanda Leadership Academy'
        ]),
        experience_years: 15,
        specialization: 'Ubuyobozi bw\'Uburezi bw\'Ubumenyi bw\'Ikoranabuhanga',
        achievements: JSON.stringify([
          'Yateje imbere ishuri kugeza ku rwego rwo hejuru',
          'Yashyizeho sisitemu nshya zo gucunga ishuri',
          'Yongereye umubare w\'abanyeshuri 300%',
          'Yaronse ibihembo byinshi by\'ubuyobozi'
        ]),
        responsibilities: JSON.stringify([
          'Kuyobora ishuri muri rusange',
          'Gushyira mu bikorwa politiki z\'ishuri',
          'Gufatanya n\'abakozi bose',
          'Gukurikirana imikorere y\'ishuri',
          'Gufatanya n\'ababyeyi n\'abanyeshuri',
          'Gukora raporo ku bayobozi b\'ishuri'
        ]),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00'
      },
      {
        name: 'Uwase Marie Grace',
        role: 'Umuyobozi w\'Amasomo',
        department: 'Ishami ry\'Amasomo',
        biography_rw: `Uwase Marie Grace ni Umuyobozi w'Amasomo muri Garden TVET School. Afite uburambe bw'imyaka 12+ mu gutegura no gukurikirana gahunda z'amasomo mu mashuri y'ubumenyi bw'ikoranabuhanga.

Nk'umuyobozi w'amasomo, Uwase afite inshingano zo gutegura gahunda z'amasomo, gukurikirana abarimu, kwemeza ko amasomo atangwa neza, no gufasha abanyeshuri kwiga neza. Yagize uruhare runini mu guteza imbere uburyo bwo kwigisha mu ishuri.

UBURAMBE BWE:
Uwase yakoze nk'umwarimu mu mashuri menshi mbere yo kuba umuyobozi w'amasomo. Yize pedagogiya na curriculum development muri Kaminuza y'u Rwanda. Afite ubushobozi bukomeye mu gutegura gahunda z'amasomo no gukurikirana abarimu.

INTEGO ZE:
1. Guteza imbere uburyo bwo kwigisha
2. Gufasha abarimu guteza imbere ubushobozi bwabo
3. Kwemeza ko amasomo atangwa neza
4. Gukurikirana imikorere y'abanyeshuri
5. Gushyira mu bikorwa tekinoloji mu kwigisha

IMISHINGA YAKOZE:
1. Yatunganye gahunda nshya z'amasomo
2. Yashyizeho sisitemu yo gukurikirana abarimu
3. Yatunganye gahunda yo gutoza abarimu
4. Yashyizeho sisitemu yo gukurikirana imikorere y'abanyeshuri
5. Yatunganye gahunda yo gufasha abanyeshuri bafite ibibazo`,
        email: 'dos@garden-tvet.rw',
        phone: '+250 788 234 567',
        office_location: 'Ibiro by\'Amasomo, Ikibanza 2',
        qualifications: JSON.stringify([
          'Masters mu Pedagogiya - Kaminuza y\'u Rwanda',
          'Bachelor\'s Degree mu Buyigishe - Kaminuza y\'u Rwanda',
          'Icyemezo cy\'Ubuyigishe - MINEDUC',
          'Amahugurwa mu Curriculum Development'
        ]),
        experience_years: 12,
        specialization: 'Gutegura Gahunda z\'Amasomo',
        achievements: JSON.stringify([
          'Yatunganye gahunda nshya z\'amasomo',
          'Yateje imbere uburyo bwo kwigisha',
          'Yongereye imikorere y\'abanyeshuri',
          'Yaronse ibihembo by\'ubuyigishe'
        ]),
        responsibilities: JSON.stringify([
          'Gutegura gahunda z\'amasomo',
          'Gukurikirana abarimu',
          'Kwemeza ko amasomo atangwa neza',
          'Gufasha abanyeshuri kwiga neza',
          'Gukora raporo ku masomo',
          'Gutoza abarimu'
        ]),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00'
      },
      {
        name: 'Nkurunziza Patrick',
        role: 'Umuyobozi w\'Indero',
        department: 'Ishami ry\'Indero',
        biography_rw: `Nkurunziza Patrick ni Umuyobozi w'Indero muri Garden TVET School. Afite uburambe bw'imyaka 10+ mu gucunga indero y'abanyeshuri no kwemeza ko ishuri rifite umutekano mwiza.

Nk'umuyobozi w'indero, Nkurunziza afite inshingano zo gukurikirana imyitwarire y'abanyeshuri, gukemura ibibazo by'indero, kwemeza ko ishuri rifite umutekano mwiza, no gufasha abanyeshuri kugira imyitwarire myiza.

UBURAMBE BWE:
Nkurunziza yakoze mu mashuri menshi nk'umuyobozi w'indero. Yize psychology na counseling muri Kaminuza y'u Rwanda. Afite ubushobozi bukomeye mu gukemura ibibazo by'indero no gufasha abanyeshuri.

INTEGO ZE:
1. Kwemeza ko ishuri rifite umutekano mwiza
2. Gufasha abanyeshuri kugira imyitwarire myiza
3. Gukemura ibibazo by'indero
4. Gukurikirana imyitwarire y'abanyeshuri
5. Gufatanya n'ababyeyi mu gukemura ibibazo

IMISHINGA YAKOZE:
1. Yashyizeho sisitemu yo gukurikirana indero
2. Yatunganye gahunda yo gufasha abanyeshuri
3. Yashyizeho amategeko y'indero
4. Yatunganye gahunda yo gutoza abanyeshuri
5. Yashyizeho sisitemu yo gukemura amakimbirane`,
        email: 'dod@garden-tvet.rw',
        phone: '+250 788 345 678',
        office_location: 'Ibiro by\'Indero, Ikibanza 1',
        qualifications: JSON.stringify([
          'Masters mu Psychology - Kaminuza y\'u Rwanda',
          'Bachelor\'s Degree mu Counseling - Kaminuza y\'u Rwanda',
          'Icyemezo cy\'Ubujyanama - MINEDUC',
          'Amahugurwa mu Conflict Resolution'
        ]),
        experience_years: 10,
        specialization: 'Gucunga Indero y\'Abanyeshuri',
        achievements: JSON.stringify([
          'Yashyizeho sisitemu nshya yo gukurikirana indero',
          'Yagabanije ibibazo by\'indero 80%',
          'Yatunganye gahunda zo gufasha abanyeshuri',
          'Yaronse ibihembo by\'ubuyobozi bw\'indero'
        ]),
        responsibilities: JSON.stringify([
          'Gukurikirana imyitwarire y\'abanyeshuri',
          'Gukemura ibibazo by\'indero',
          'Kwemeza ko ishuri rifite umutekano',
          'Gufasha abanyeshuri kugira imyitwarire myiza',
          'Gukora raporo ku ndero',
          'Gufatanya n\'ababyeyi'
        ]),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00'
      },
      {
        name: 'Mukamana Jeanne',
        role: 'Umubitsi',
        department: 'Ishami ry\'Ibikorwa',
        biography_rw: `Mukamana Jeanne ni Umubitsi muri Garden TVET School. Afite uburambe bw'imyaka 8+ mu gucunga amafaranga y'ishuri no gukora raporo z'ibikorwa.

Nk'umubitsi, Mukamana afite inshingano zo gucunga amafaranga y'ishuri, gukora raporo z'ibikorwa, kwishyura abakozi, no gukurikirana amafaranga y'abanyeshuri. Yagize uruhare runini mu guteza imbere sisitemu yo gucunga amafaranga.

UBURAMBE BWE:
Mukamana yakoze mu mashuri menshi nk'umubitsi. Yize accounting na finance muri Kaminuza y'u Rwanda. Afite ubushobozi bukomeye mu gucunga amafaranga no gukora raporo z'ibikorwa.

INTEGO ZE:
1. Gucunga amafaranga y'ishuri neza
2. Gukora raporo z'ibikorwa zisobanutse
3. Kwishyura abakozi ku gihe
4. Gukurikirana amafaranga y'abanyeshuri
5. Gufasha ishuri kugera ku ntego z'amafaranga

IMISHINGA YAKOZE:
1. Yashyizeho sisitemu nshya yo gucunga amafaranga
2. Yatunganye gahunda yo gukurikirana amafaranga
3. Yashyizeho sisitemu yo kwishyura abakozi
4. Yatunganye gahunda yo gukurikirana amafaranga y'abanyeshuri
5. Yashyizeho sisitemu yo gukora raporo z'ibikorwa`,
        email: 'accountant@garden-tvet.rw',
        phone: '+250 788 456 789',
        office_location: 'Ibiro by\'Ibikorwa, Ikibanza 2',
        qualifications: JSON.stringify([
          'Masters mu Accounting - Kaminuza y\'u Rwanda',
          'Bachelor\'s Degree mu Finance - Kaminuza y\'u Rwanda',
          'CPA Certification - ICPAR',
          'Amahugurwa mu Financial Management'
        ]),
        experience_years: 8,
        specialization: 'Gucunga Amafaranga y\'Amashuri',
        achievements: JSON.stringify([
          'Yashyizeho sisitemu nshya yo gucunga amafaranga',
          'Yongereye amafaranga y\'ishuri 50%',
          'Yatunganye gahunda zo kuzigama amafaranga',
          'Yaronse ibihembo by\'accounting'
        ]),
        responsibilities: JSON.stringify([
          'Gucunga amafaranga y\'ishuri',
          'Gukora raporo z\'ibikorwa',
          'Kwishyura abakozi',
          'Gukurikirana amafaranga y\'abanyeshuri',
          'Gukora budget y\'ishuri',
          'Gufatanya n\'abanzi'
        ]),
        office_hours: 'Ku wa mbere - Ku wa gatanu: 8:00 - 17:00'
      }
    ];

    for (const leader of leaders) {
      await connection.query(
        `INSERT INTO leadership (name, role, department, biography_rw, email, phone, 
         office_location, qualifications, experience_years, specialization, 
         achievements, responsibilities, office_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leader.name, leader.role, leader.department, leader.biography_rw,
          leader.email, leader.phone, leader.office_location, leader.qualifications,
          leader.experience_years, leader.specialization, leader.achievements,
          leader.responsibilities, leader.office_hours
        ]
      );
    }

    console.log('✅ Sample leadership data inserted');
    console.log('✅ Leadership system setup complete!');

  } catch (error) {
    console.error('❌ Error setting up leadership:', error);
  } finally {
    await connection.end();
  }
}

setupLeadershipTable();
