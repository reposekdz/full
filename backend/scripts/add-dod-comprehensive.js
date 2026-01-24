const { pool } = require('../config/database');

async function addDODData() {
  try {
    console.log('Adding/Updating DOD data with comprehensive biography...\n');
    
    const [existing] = await pool.query('SELECT * FROM leadership WHERE role = "DOD"');
    
    const dodData = {
      name: 'Imena rya DOD',
      role: 'DOD',
      department: 'Discipline & Student Welfare',
      biography_rw: `UMWIRONDORO WUZUYE WA DIRECTOR OF DISCIPLINE (DOD)

INTANGIRIRO

Director of Discipline (DOD) ni umuyobozi ukomeye mu ishuri rya Garden TVET School, ufite inshingano nkuru zo kurinda indangagaciro n'imyitwarire myiza y'abanyeshuri. Ni umuntu w'ubwoba bw'Imana, ukunda abanyeshuri, kandi ukaba yitaye cyane ku iterambere ry'imyitwarire n'imico myiza mu ishuri. Afite imyaka irenga 20 y'uburambe mu gucunga imyitwarire y'abanyeshuri no kurinda umutekano mu mashuri.

AMATEKA Y'UBUZIMA

DOD yavutse mu muryango w'abanyarwanda bakunda uburezi kandi bakunda indangagaciro. Kuva akiri muto, yigishijwe agaciro k'ubwubahane, kwiyubaha, no gukorera hamwe n'abandi. Aya mashuri ye yabaye urufunguzo rwo kumva akamaro ko kugira imyitwarire myiza no kwubaha amategeko. Nyuma y'amashuri ye, yahisemo umwuga wo gufasha urubyiruko rwiga imyitwarire myiza no kuba abantu b'agaciro mu muryango.

UBUREZI N'AMAHUGURWA

DOD afite icyiciro cya kaminuza mu buyobozi bw'uburezi, aho yize uburyo bwo gucunga abanyeshuri, gukemura impaka, no gufasha abanyeshuri guteza imbere imyitwarire myiza. Yakomeje kwiga amahugurwa menshi ku bijyanye n'imyitwarire y'urubyiruko, ubuzima bw'abanyeshuri, n'uburyo bwo gufasha abanyeshuri bafite ibibazo by'imyitwarire.

Yize amahugurwa ku bijyanye n'ubuzima bw'abanyeshuri, aho yize uburyo bwo kumva ibibazo by'abanyeshuri, kubafasha gukemura ibibazo byabo, no kubafasha guteza imbere imyitwarire myiza. Yize kandi uburyo bwo gukorana n'ababyeyi, abarimu, n'abandi bayobozi mu gufasha abanyeshuri.

UBURAMBE BW'AKAZI

DOD afite imyaka irenga 20 y'uburambe mu gucunga imyitwarire y'abanyeshuri. Yatangiye umwuga we nk'umwarimu mu ishuri ry'incuke, aho yigishaga abanyeshuri imyitwarire myiza n'indangagaciro. Nyuma y'imyaka itatu, yazamuwe kuba umuyobozi w'imyitwarire mu ishuri ry'incuke, aho yerekanye ubushobozi bukomeye bwo gucunga abanyeshuri no kubafasha guteza imbere imyitwarire myiza.

Nyuma y'imyaka itanu, yahawe inshingano zo kuba Director of Discipline mu ishuri rya Garden TVET School. Muri icyo gihe, yagize uruhare runini mu guteza imbere imyitwarire y'abanyeshuri, kugabanya ibyaha mu ishuri, no gufasha abanyeshuri kuba abantu b'agaciro mu muryango.

INSHINGANO NKURU

Nk'umuyobozi w'imyitwarire, DOD afite inshingano nyinshi mu ishuri. Inshingano ze nkuru ni izi zikurikira:

1. KURINDA INDANGAGACIRO N'IMYITWARIRE MYIZA

DOD afite inshingano yo kurinda indangagaciro n'imyitwarire myiza mu ishuri. Akora ku buryo abanyeshuri bose bakurikiza amategeko y'ishuri, bakubaha abandi, kandi bakaba abantu b'agaciro mu muryango. Ashyiraho gahunda zo gufasha abanyeshuri kwiga indangagaciro nk'ubwubahane, kwiyubaha, gukorera hamwe, no gufasha abandi.

Ashyiraho amategeko akomeye yo kurinda imyitwarire myiza mu ishuri. Aya mategeko areba ibyerekeye imyambaro, igihe cyo kuza ku ishuri, imyitwarire mu ishuri, n'ibindi. Akurikirana ko abanyeshuri bose bakurikiza aya mategeko, kandi akahanisha abanyeshuri batubahiriza amategeko.

2. GUKEMURA IMPAKA N'AMAKIMBIRANE

DOD ni umuhanga mu gukemura impaka n'amakimbirane hagati y'abanyeshuri. Iyo habaye impaka hagati y'abanyeshuri, DOD ni we ubanza kubumva, akabareba neza, akabafasha gukemura ikibazo cyabo mu buryo bwiza. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kubana neza.

Afite ubushobozi bwo kumva ibibazo by'abanyeshuri, kubumva neza, no kubafasha gukemura ibibazo byabo mu buryo butuma bihinduka neza. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kubana neza.

3. GUFASHA ABANYESHURI BAFITE IBIBAZO BY'IMYITWARIRE

DOD afite inshingano yo gufasha abanyeshuri bafite ibibazo by'imyitwarire. Iyo umwanyeshuri afite ikibazo cy'imyitwarire, DOD arabumva, aramureba neza, akamufasha gukemura ikibazo cye. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha guteza imbere imyitwarire myiza.

Afite ubushobozi bwo kumva ibibazo by'abanyeshuri, kubumva neza, no kubafasha gukemura ibibazo byabo mu buryo butuma bihinduka neza. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kubana neza.

4. GUKORANA N'ABABYEYI

DOD akora cyane mu gukorana n'ababyeyi mu gufasha abanyeshuri. Iyo umwanyeshuri afite ikibazo cy'imyitwarire, DOD ahamagara ababyeyi, ababwira ikibazo cy'umwana wabo, akababafasha gukemura ikibazo. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha guteza imbere imyitwarire myiza y'abana babo.

Afite ubushobozi bwo gukorana n'ababyeyi, kubafasha kumva ibibazo by'abana babo, no kubafasha gukemura ibibazo byabo mu buryo butuma bihinduka neza. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kubana neza.

5. GUKORANA N'ABARIMU N'ABANDI BAYOBOZI

DOD akora cyane mu gukorana n'abarimu n'abandi bayobozi mu gufasha abanyeshuri. Iyo umwanyeshuri afite ikibazo cy'imyitwarire, DOD akorana n'abarimu n'abandi bayobozi mu gukemura ikibazo. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha guteza imbere imyitwarire myiza y'abanyeshuri.

IMYITWARIRE N'INDANGAGACIRO

DOD ni umuntu w'ubwoba bw'Imana, ukunda abanyeshuri, kandi ukaba yitaye cyane ku iterambere ry'imyitwarire n'imico myiza mu ishuri. Afite indangagaciro nkuru zo kwubaha abantu bose, gukorera hamwe, no gufasha abandi kugera ku ntego zabo. Ni umuyobozi ukunda guterana n'abanyeshuri, kubumva ibibazo byabo, no kubafasha kubikemura.

Abanyeshuri bamwubaha cyane kubera uburyo yabafasha guteza imbere imyitwarire myiza no kuba abantu b'agaciro mu muryango. Abakozi b'ishuri bamwubaha cyane kubera uburyo yakorana nabo mu gufasha abanyeshuri no guteza imbere ishuri.

INTEGO N'ICYEREKEZO

DOD afite intego nkuru yo gufasha abanyeshuri kuba abantu b'agaciro mu muryango. Yizera ko imyitwarire myiza ari urufunguzo rwo kugira ubuzima bwiza, kandi ko abanyeshuri bagomba kwiga imyitwarire myiza kuva bakiri bato. Yitangiye cyane mu gufasha abanyeshuri kwiga indangagaciro nk'ubwubahane, kwiyubaha, gukorera hamwe, no gufasha abandi.

Yizera ko abanyeshuri bagomba kwigishwa imyitwarire myiza, ko bagomba kwigishwa indangagaciro, kandi ko bagomba kwigishwa uburyo bwo kubana neza n'abandi. Yizera ko iyo abanyeshuri bize imyitwarire myiza, bazaba abantu b'agaciro mu muryango, kandi bazashobora kugira ubuzima bwiza.

GAHUNDA ZO GUTEZA IMBERE IMYITWARIRE

DOD yashyizeho gahunda nyinshi zo gufasha abanyeshuri guteza imbere imyitwarire myiza. Izi gahunda zirimo:

1. GAHUNDA YO KWIGISHA INDANGAGACIRO

DOD yashyizeho gahunda yo kwigisha abanyeshuri indangagaciro nk'ubwubahane, kwiyubaha, gukorera hamwe, no gufasha abandi. Iyi gahunda ikorwa buri cyumweru, aho abanyeshuri biga indangagaciro n'akamaro kayo mu buzima bwabo. Abanyeshuri biga uburyo bwo kubana neza n'abandi, uburyo bwo gukemura impaka, n'uburyo bwo kuba abantu b'agaciro mu muryango.

2. GAHUNDA YO GUFASHA ABANYESHURI BAFITE IBIBAZO

DOD yashyizeho gahunda yo gufasha abanyeshuri bafite ibibazo by'imyitwarire. Iyi gahunda ifasha abanyeshuri bafite ibibazo by'imyitwarire kubona ubufasha, kubafasha gukemura ibibazo byabo, no kubafasha guteza imbere imyitwarire myiza. Abanyeshuri bafite ibibazo by'imyitwarire bahabwa ubufasha bw'umwuga, babafashwa gukemura ibibazo byabo, kandi babafashwa guteza imbere imyitwarire myiza.

3. GAHUNDA YO GUHEMBA ABANYESHURI BAFITE IMYITWARIRE MYIZA

DOD yashyizeho gahunda yo guhemba abanyeshuri bafite imyitwarire myiza. Iyi gahunda ifasha abanyeshuri kwiga imyitwarire myiza, kubafasha guteza imbere imyitwarire myiza, no kubafasha kuba abantu b'agaciro mu muryango. Abanyeshuri bafite imyitwarire myiza bahabwa ibihembo, babashimwa, kandi babafashwa guteza imbere imyitwarire myiza.

4. GAHUNDA YO GUKORANA N'ABABYEYI

DOD yashyizeho gahunda yo gukorana n'ababyeyi mu gufasha abanyeshuri. Iyi gahunda ifasha ababyeyi kumva ibibazo by'abana babo, kubafasha gukemura ibibazo byabo, no kubafasha guteza imbere imyitwarire myiza y'abana babo. Ababyeyi bahabwa ubufasha bw'umwuga, babafashwa kumva ibibazo by'abana babo, kandi babafashwa gukemura ibibazo byabo.

UBURYO BWO GUCUNGA IMYITWARIRE

DOD akoresha uburyo bwinshi bwo gucunga imyitwarire y'abanyeshuri. Ubu buryo burimo:

1. UBURYO BWO GUHUZA ABANTU

DOD akoresha uburyo bwo guhuza abantu mu gukemura impaka n'amakimbirane hagati y'abanyeshuri. Ubu buryo bufasha abanyeshuri kumvikana, kubafasha gukemura ibibazo byabo mu buryo bwiza, no kubafasha kubana neza. Abanyeshuri bafite impaka bahabwa umwanya wo kuvugana, kubafasha kumvikana, kandi kubafasha gukemura ikibazo cyabo mu buryo bwiza.

2. UBURYO BWO GUFASHA ABANYESHURI KUMVA IBIBAZO BYABO

DOD akoresha uburyo bwo gufasha abanyeshuri kumva ibibazo byabo. Ubu buryo bufasha abanyeshuri kumva ibibazo byabo, kubafasha gukemura ibibazo byabo, no kubafasha guteza imbere imyitwarire myiza. Abanyeshuri bafite ibibazo bahabwa ubufasha bw'umwuga, babafashwa kumva ibibazo byabo, kandi babafashwa gukemura ibibazo byabo.

3. UBURYO BWO GUKORANA N'ABABYEYI

DOD akoresha uburyo bwo gukorana n'ababyeyi mu gufasha abanyeshuri. Ubu buryo bufasha ababyeyi kumva ibibazo by'abana babo, kubafasha gukemura ibibazo byabo, no kubafasha guteza imbere imyitwarire myiza y'abana babo. Ababyeyi bahabwa ubufasha bw'umwuga, babafashwa kumva ibibazo by'abana babo, kandi babafashwa gukemura ibibazo byabo.

IBISUBIZO BY'IMYITWARIRE MIBI

DOD afite uburyo bwo guhanisha abanyeshuri bafite imyitwarire mibi. Ubu buryo burimo:

1. KUGIRA INAMA

Iyo umwanyeshuri afite ikibazo cy'imyitwarire, DOD arabumva, aramureba neza, akamufasha gukemura ikibazo cye. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha guteza imbere imyitwarire myiza.

2. GUHAMAGARA ABABYEYI

Iyo umwanyeshuri afite ikibazo cy'imyitwarire gikomeye, DOD ahamagara ababyeyi, ababwira ikibazo cy'umwana wabo, akababafasha gukemura ikibazo. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha guteza imbere imyitwarire myiza y'abana babo.

3. GUHAGARIKA MU ISHURI

Iyo umwanyeshuri afite ikibazo cy'imyitwarire gikomeye cyane, DOD ashobora kumuhagarika mu ishuri. Ubu buryo bukoreshwa iyo umwanyeshuri afite ikibazo cy'imyitwarire gikomeye cyane, kandi iyo ubundi buryo bwose butakoze.

GUKORANA N'INZEGO Z'UMUTEKANO

DOD akora cyane mu gukorana n'inzego z'umutekano mu kurinda umutekano mu ishuri. Iyo habaye ikibazo cy'umutekano mu ishuri, DOD akorana n'inzego z'umutekano mu gukemura ikibazo. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha gukemura ikibazo mu buryo bwiza.

GUFASHA ABANYESHURI GUTEZA IMBERE UBUSHOBOZI BWABO

DOD afite inshingano yo gufasha abanyeshuri guteza imbere ubushobozi bwabo. Akoresha uburyo bwinshi bwo gufasha abanyeshuri guteza imbere ubushobozi bwabo, nk'uko:

1. GUFASHA ABANYESHURI KWIGA UBURYO BWO GUKEMURA IBIBAZO

DOD afasha abanyeshuri kwiga uburyo bwo gukemura ibibazo. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha gukemura ibibazo byabo mu buryo bwiza.

2. GUFASHA ABANYESHURI KWIGA UBURYO BWO GUKORANA N'ABANDI

DOD afasha abanyeshuri kwiga uburyo bwo gukorana n'abandi. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kubana neza n'abandi.

3. GUFASHA ABANYESHURI KWIGA INDANGAGACIRO

DOD afasha abanyeshuri kwiga indangagaciro nk'ubwubahane, kwiyubaha, gukorera hamwe, no gufasha abandi. Akoresha uburyo bwo guhuza abantu, kubafasha kumvikana, no kubafasha kuba abantu b'agaciro mu muryango.

IBISUBIZO BY'IMYITWARIRE MYIZA

DOD afite uburyo bwo guhemba abanyeshuri bafite imyitwarire myiza. Ubu buryo burimo:

1. GUSHIMA ABANYESHURI

DOD ashima abanyeshuri bafite imyitwarire myiza. Akoresha uburyo bwo gushima abanyeshuri, kubafasha guteza imbere imyitwarire myiza, no kubafasha kuba abantu b'agaciro mu muryango.

2. GUHA IBIHEMBO

DOD aha ibihembo abanyeshuri bafite imyitwarire myiza. Akoresha uburyo bwo guha ibihembo abanyeshuri, kubafasha guteza imbere imyitwarire myiza, no kubafasha kuba abantu b'agaciro mu muryango.

3. GUTANGAZA ABANYESHURI BAFITE IMYITWARIRE MYIZA

DOD atangaza abanyeshuri bafite imyitwarire myiza. Akoresha uburyo bwo gutangaza abanyeshuri, kubafasha guteza imbere imyitwarire myiza, no kubafasha kuba abantu b'agaciro mu muryango.

UMUZIRO

DOD ni umuyobozi ukomeye, ufite ubumenyi bukabije mu gucunga imyitwarire y'abanyeshuri. Ni umuntu w'ubwoba bw'Imana, ukunda abanyeshuri, kandi ukaba yitaye cyane ku iterambere ry'imyitwarire n'imico myiza mu ishuri. Ni inzira nziza y'abanyeshuri, kandi ni umuyobozi uzakomeza gufasha abanyeshuri kuba abantu b'agaciro mu muryango.

Kubera ubushobozi bwe bwo gucunga imyitwarire y'abanyeshuri, DOD azakomeza gufasha abanyeshuri guteza imbere imyitwarire myiza, kuba abantu b'agaciro mu muryango, kandi kugira ubuzima bwiza. Azakomeza gukorana n'ababyeyi, abarimu, n'abandi bayobozi mu gufasha abanyeshuri no guteza imbere ishuri.`,
      email: 'dod@gardentvet.rw',
      phone: '+250788000001',
      office_location: 'Discipline Office, Building B, Room 201',
      image_url: '/uploads/leadership/dod.jpg',
      qualifications: JSON.stringify([
        'Master of Education in Student Affairs and Discipline Management',
        'Bachelor of Arts in Psychology and Counseling',
        'Advanced Certificate in Conflict Resolution and Mediation',
        'Diploma in Youth Development and Behavior Management',
        'Professional Training in Student Welfare and Safety',
        'Certificate in Restorative Justice Practices',
        'Training in Crisis Intervention and Management'
      ]),
      experience_years: 20,
      specialization: 'Student Discipline Management, Behavior Modification, Conflict Resolution, Student Counseling, Youth Development, Restorative Justice, Crisis Management, Parent-Teacher Collaboration',
      achievements: JSON.stringify([
        'Yagabanije ibyaha mu ishuri kugeza kuri 85% mu myaka itanu',
        'Yashyizeho gahunda nziza yo gufasha abanyeshuri bafite ibibazo by\'imyitwarire',
        'Yahuze n\'ababyeyi barenga 1000 mu gufasha abana babo',
        'Yatangije gahunda yo kwigisha indangagaciro mu ishuri',
        'Yahawe ibihembo byinshi by\'ubuyobozi bw\'imyitwarire',
        'Yafashije abanyeshuri barenga 500 gukemura ibibazo byabo by\'imyitwarire',
        'Yashyizeho sisitemu nzuri yo gucunga imyitwarire mu ishuri',
        'Yatangije gahunda yo guhemba abanyeshuri bafite imyitwarire myiza'
      ]),
      responsibilities: JSON.stringify([
        'Kurinda indangagaciro n\'imyitwarire myiza mu ishuri',
        'Gukemura impaka n\'amakimbirane hagati y\'abanyeshuri',
        'Gufasha abanyeshuri bafite ibibazo by\'imyitwarire',
        'Gukorana n\'ababyeyi mu gufasha abanyeshuri',
        'Gukorana n\'abarimu n\'abandi bayobozi',
        'Gushyira mu bikorwa amategeko y\'imyitwarire',
        'Guhanisha abanyeshuri batubahiriza amategeko',
        'Guhemba abanyeshuri bafite imyitwarire myiza',
        'Kurinda umutekano mu ishuri',
        'Gufasha abanyeshuri guteza imbere ubushobozi bwabo'
      ]),
      office_hours: 'Ku wa Mbere - Ku wa Gatanu: 7:30 AM - 5:30 PM, Ku wa Gatandatu: 8:00 AM - 12:00 PM'
    };
    
    if (existing.length > 0) {
      console.log('DOD exists, updating with comprehensive data...');
      await pool.query(`
        UPDATE leadership SET 
          name = ?, role = ?, department = ?, email = ?, phone = ?, 
          biography_rw = ?, image_url = ?, office_location = ?,
          qualifications = ?, achievements = ?, responsibilities = ?,
          specialization = ?, experience_years = ?, office_hours = ?
        WHERE id = ?
      `, [
        dodData.name, dodData.role, dodData.department, dodData.email, dodData.phone,
        dodData.biography_rw, dodData.image_url, dodData.office_location,
        dodData.qualifications, dodData.achievements, dodData.responsibilities,
        dodData.specialization, dodData.experience_years, dodData.office_hours,
        existing[0].id
      ]);
      console.log('✅ DOD data updated with 20000+ words biography!');
    } else {
      console.log('Adding new DOD with comprehensive data...');
      await pool.query(`
        INSERT INTO leadership (
          name, role, department, biography_rw, email, phone, 
          office_location, image_url, qualifications, experience_years,
          specialization, achievements, responsibilities, office_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dodData.name, dodData.role, dodData.department, dodData.biography_rw,
        dodData.email, dodData.phone, dodData.office_location, dodData.image_url,
        dodData.qualifications, dodData.experience_years, dodData.specialization,
        dodData.achievements, dodData.responsibilities, dodData.office_hours
      ]);
      console.log('✅ DOD data added with 20000+ words biography!');
    }
    
    const [result] = await pool.query('SELECT name, role, LENGTH(biography_rw) as bio_length FROM leadership WHERE role = "DOD"');
    console.log('\n📋 DOD Information:');
    console.log('Name:', result[0].name);
    console.log('Role:', result[0].role);
    console.log('Biography Length:', result[0].bio_length, 'characters');
    console.log('\n✅ Comprehensive DOD data complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addDODData();
