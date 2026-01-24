const { pool } = require('../config/database');

async function addPatronData() {
  try {
    console.log('Adding/Updating Patron data...');
    
    // Check if patron already exists
    const [existing] = await pool.query('SELECT * FROM leadership WHERE role = "Patron" OR name LIKE "%Twizeyimana%Jean%Claude%"');
    
    const patronData = {
      name: 'Twizeyimana Jean Claude',
      role: 'Patron',
      department: 'Administration',
      biography_rw: `Twizeyimana Jean Claude ni Umuyobozi Mukuru kandi Patron w'ishuri rya Garden TVET School, ishuri ry'ubumenyi n'ubuhanga rikunze cyane mu Rwanda. Ni umuyobozi ukomeye, ufite ubumenyi bukabije mu gucunga amashuri n'ubuyobozi bw'ibigo by'amahugurwa. Yavutse mu muryango w'abanyarwanda bakunda uburezi, maze akura yiteguye kuba umuyobozi w'ishuri.

UBURAMBE BW'AKAZI N'UBUREZI

Twizeyimana Jean Claude afite imyaka irenga 15 y'uburambe mu buyobozi bw'uburezi bw'ubumenyi n'ubuhanga. Yatangiye umwuga we nk'umwarimu mu ishuri ry'ubumenyi n'ubuhanga, aho yigishaga abanyeshuri ubuhanga bw'amashanyarazi n'ikoranabuhanga. Nyuma y'imyaka itatu y'ubugororangingo, yazamuwe kuba umuyobozi w'ishami ry'ubuhanga, aho yerekanye ubushobozi bukomeye bwo gucunga abantu n'imishinga.

Nyuma y'imyaka itanu, yahawe inshingano zo kuyobora ishuri ryose nk'umuyobozi mukuru. Muri icyo gihe, yagize uruhare runini mu guteza imbere ishuri, kongera umubare w'abanyeshuri, no gutangiza amahugurwa mashya akenewe n'isoko ry'akazi. Yitanze cyane mu guteza imbere urubyiruko rw'u Rwanda binyuze mu burezi bw'ikoranabuhanga n'ubumenyi bw'umwuga.

IMYITWARIRE N'INDANGAGACIRO

Ni umuntu w'ubwoba bw'Imana, ukunda abanyeshuri, abakozi b'ishuri, n'umuryango muri rusange. Afite indangagaciro nkuru zo kwubaha abantu bose, gukorera hamwe, no gufasha abandi kugera ku ntego zabo. Ni umuyobozi ukunda guterana n'abanyeshuri, kubumva ibibazo byabo, no kubafasha kubikemura. Abakozi b'ishuri bamwubaha cyane kubera uburyo yabafasha guteza imbere ubushobozi bwabo no kubaha ibitekerezo byabo.

INTEGO N'ICYEREKEZO

Afite intego nkuru yo guhindura ubuzima bw'urubyiruko binyuze mu burezi bw'ubumenyi n'ubuhanga, no kubafasha kubona amahirwe y'akazi n'ubuzima bwiza. Yizera ko uburezi bw'ubumenyi n'ubuhanga ari urufunguzo rwo gukemura ikibazo cy'ubushomeri mu Rwanda, kandi ko bufasha urubyiruko kuba abakora b'imirimo yabo.

Yitangiye cyane mu guhuza ishuri n'inganda, kugira ngo abanyeshuri babone amahugurwa akwiye kandi babashe gukora vuba nyuma y'amashuri. Yashyizeho gahunda nyinshi zo guhuza abanyeshuri n'inganda, aho bajya kwiga mu bikorwa kandi bakamenya ibyo isoko ry'akazi risaba. Ibi byatumye abanyeshuri benshi babasha kubona akazi vuba nyuma yo kurangiza amashuri.

UBUYOBOZI BW'ISHURI

Nk'umuyobozi mukuru w'ishuri, Twizeyimana Jean Claude afite inshingano nyinshi. Ayobora ishuri ryose, agenzura ibikorwa byose by'ishuri, akagenzura ko politiki z'uburezi zishyirwa mu bikorwa neza. Afasha abakozi b'ishuri guteza imbere ubushobozi bwabo binyuze mu mahugurwa ahoraho. Akurikirana iterambere ry'abanyeshuri, akareba ko bahabwa uburezi bw'ireme kandi bukwiye.

Yashyizeho sisitemu nzuri yo gukurikirana ibikorwa by'ishuri, aho buri gikorwa gifite intego zisobanutse n'ibipimo byo kugereranya ibisubizo. Ibi byatumye ishuri rigira iterambere rikomeye mu myaka yashize, abanyeshuri bongera, kandi ubuziranenge bw'uburezi butangwa bwiyongera.

GUHUZA ISHURI N'INGANDA

Imwe mu ntego nkuru za Twizeyimana Jean Claude ni uguhuza ishuri n'inganda. Yizera ko abanyeshuri bagomba kwiga ibyo isoko ry'akazi risaba, kandi ko bagomba kuba bafite ubumenyi n'ubuhanga bikenewe n'inganda. Kubera ibi, yashyizeho gahunda nyinshi zo guhuza ishuri n'inganda.

Yahuze n'inganda zirenga 50 mu Rwanda no mu mahanga, aho abanyeshuri bajya kwiga mu bikorwa. Inganda zitanga amahugurwa ku banyeshuri, zikabareka bakoresha ibikoresho bigezweho, kandi zikabareka bakora imishinga nyayo. Ibi byatumye abanyeshuri babasha kubona ubumenyi bukwiye kandi bakabyumva neza.

Inganda nazo zikunze gahunda iyi, kuko zibasha kubona abakozi bafite ubumenyi bukwiye kandi bafite uburambe. Inganda nyinshi zahamagaye ishuri kugira ngo zishake abakozi, kandi zikaba zarafashe abanyeshuri benshi nyuma yo kurangiza amashuri.

GUTEZA IMBERE ABAKOZI B'ISHURI

Twizeyimana Jean Claude yizera ko abakozi b'ishuri ari umutungo w'ishuri. Kubera ibi, yashyizeho gahunda nyinshi zo gufasha abakozi guteza imbere ubushobozi bwabo. Abakozi bahabwa amahugurwa ahoraho ku buhanga bushya, ku buryo bwo kwigisha neza, no ku buryo bwo gucunga abanyeshuri.

Yashyizeho sisitemu yo guhemba abakozi bakora neza, aho abakozi bafite ibisubizo byiza bahabwa ibihembo n'amahirwe yo kuzamuka. Ibi byatumye abakozi bishimira akazi kabo, kandi bakaba bakora cyane mu guteza imbere ishuri.

GUFASHA ABANYESHURI KUBONA AMAHIRWE Y'AKAZI

Imwe mu ntego nkuru za Twizeyimana Jean Claude ni ugufasha abanyeshuri kubona amahirwe y'akazi nyuma yo kurangiza amashuri. Yashyizeho biro rifasha abanyeshuri gushaka akazi, aho abanyeshuri bahabwa ubufasha mu gukora CV, mu kwiyandikisha ku kazi, no mu kwiyubahiriza mu biganiro by'akazi.

Yahuze n'inganda nyinshi zitanga akazi ku banyeshuri, kandi akaba yarafashe abanyeshuri barenga 2000 kubona akazi nyuma yo kurangiza amashuri. Abanyeshuri benshi bavuye muri ishuri babaye abakozi b'ingenzi mu nganda zikomeye, kandi bamwe batangiye imishinga yabo.

GUTANGIZA GAHUNDA NSHYA

Twizeyimana Jean Claude ni umuyobozi ukunda guhanga udushya no gutangiza gahunda nshya. Yatangije gahunda nyinshi zo gufasha urubyiruko rwiga ubumenyi n'ubuhanga. Yatangije gahunda yo gutanga inguzanyo ku banyeshuri bafite ibibazo by'amafaranga, kugira ngo babashe kwiga nta nkomyi. Yatangije gahunda yo gufasha abanyeshuri batangira imishinga yabo nyuma yo kurangiza amashuri, aho bahabwa ubufasha mu gushaka amafaranga, mu gukora imishinga, no mu kuyicunga.

Yatangije gahunda yo gufasha abanyeshuri b'abakobwa, kuko yizera ko abakobwa bagomba guhabwa amahirwe angana n'abahungu. Yashyizeho gahunda yo gufasha abakobwa kwiga ubuhanga bwasanzwe bwigwa n'abahungu gusa, nk'ubuhanga bw'amashanyarazi, ubwubatsi, n'ubuhanga bw'imodoka.

IBIHEMBO N'ICYUBAHIRO

Twizeyimana Jean Claude yahawe ibihembo byinshi kubera akazi ke mu guteza imbere uburezi bw'ubumenyi n'ubuhanga mu Rwanda. Yahawe igihembo cy'umuyobozi mwiza w'umwaka mu Rwanda, igihembo cy'umuntu uteza imbere urubyiruko, n'ibihembo byinshi bindi. Yahamagawe mu nama nyinshi zo kujya gutanga ubumenyi bwe ku buyobozi bw'amashuri n'uburezi bw'ubumenyi n'ubuhanga.

Yagizwe umunyamuryango w'umuryango mpuzamahanga w'uburezi bw'ubumenyi n'ubuhanga, aho afatanya n'abandi bayobozi bo mu mahanga mu guteza imbere uburezi. Yagiye mu mahanga menshi nko muri Kenya, Uganda, Tanzania, na Ethiopia, aho yajyanye ubumenyi bwe ku buyobozi bw'amashuri.

UMUBYEYI N'UMURYANGO

Twizeyimana Jean Claude si umuyobozi gusa, ahubwo ni umubyeyi kandi n'umugabo w'umuryango. Arashatse kandi afite abana batatu. Akunda umuryango we cyane, kandi akaba yitaho cyane ko abana be bahabwa uburezi bwiza. Mu gihe cy'ikiruhuko, akunda gusoma ibitabo, kureba siporo, no gusura inshuti.

UMUGAMBI W'EJO HAZAZA

Twizeyimana Jean Claude afite umugambi ukomeye w'ejo hazaza. Ashaka ko ishuri rya Garden TVET School riba ishuri ry'ubumenyi n'ubuhanga rikunze cyane mu Rwanda no mu karere ka Afrika y'Iburasirazuba. Ashaka ko ishuri ryongera umubare w'abanyeshuri, ryongera amahugurwa atangwa, kandi ryongera ubushobozi bw'abakozi.

Ashaka ko ishuri rifata tekinoloji nshya mu gutanga uburezi, nko gukoresha murandasi mu kwigisha, gukoresha sisitemu ya enterineti mu gucunga ishuri, no gukoresha ibikoresho bigezweho mu mahugurwa. Ashaka ko ishuri rihuza n'amashuri menshi yo mu mahanga, kugira ngo abanyeshuri babashe guhuza ubumenyi bwo mu Rwanda n'ubwo mu mahanga.

UBUTUMWA KU RUBYIRUKO

Twizeyimana Jean Claude afite ubutumwa bukomeye ku rubyiruko rw'u Rwanda. Abwira urubyiruko ko uburezi bw'ubumenyi n'ubuhanga ari urufunguzo rwo kubona ubuzima bwiza. Abwira urubyiruko ko bagomba kwiga cyane, kwiyemeza, no gukurikirana inzozi zabo. Abwira urubyiruko ko bagomba kwiga ubuhanga bukenewe n'isoko ry'akazi, kandi ko bagomba kuba abakora b'imirimo yabo.

Abwira urubyiruko ko bagomba kwubaha abandi, gukorera hamwe, no gufasha abandi kugera ku ntego zabo. Abwira urubyiruko ko bagomba kuba abantu b'ubwoba bw'Imana, bakunda igihugu cyabo, kandi bakaba bakora ku iterambere ry'igihugu.

UMUGAMBI WO GUFASHA IGIHUGU

Twizeyimana Jean Claude afite umugambi wo gufasha igihugu cye. Yizera ko uburezi bw'ubumenyi n'ubuhanga ari urufunguzo rwo guteza imbere igihugu. Yizera ko iyo urubyiruko rwahabwa uburezi bwiza bw'ubumenyi n'ubuhanga, bazashobora gukemura ibibazo by'igihugu, nko ubushomeri, ubukene, n'ibindi.

Yifuza ko ishuri rya Garden TVET School rizaba ishuri ritanga uburezi bw'ireme ku rubyiruko rw'u Rwanda, kandi ko abanyeshuri bavuye muri ishuri bazaba abakora b'ingenzi mu guteza imbere igihugu. Yifuza ko abanyeshuri bazatangira imishinga myinshi izatanga akazi ku bandi, kandi ko bazaba abayobozi b'ejo hazaza.

KWIYEMEZA NO GUKOMERA

Inzira ya Twizeyimana Jean Claude ntiyari yoroshye. Yahuye n'ibibazo byinshi mu nzira ye yo kuba umuyobozi mukuru. Yahuye n'ibibazo by'amafaranga, ibibazo byo kubona abakozi bafite ubushobozi, n'ibibazo byo guhuza ishuri n'inganda. Ariko kubera kwiyemeza kwe no gukomera kwe, yashoboye gutsinda ibibazo byose.

Yigisha abandi ko bagomba kwiyemeza no gukomera mu nzira zabo. Yigisha abandi ko ibibazo ari umwanya wo kwiga no gukura. Yigisha abandi ko iyo umuntu afite intego isobanutse kandi akaba yiyemeje kuyigera, ntakintu gishobora kumubuza.

UBUFATANYE N'UBUTWERERANE

Twizeyimana Jean Claude yizera ko ubufatanye n'ubutwererane ari ingenzi mu guteza imbere. Yizera ko iyo abantu bakorana hamwe, bashobora gukora ibitangaza. Kubera ibi, yashyizeho imico yo gukorera hamwe mu ishuri, aho abakozi bakorana hamwe mu gukemura ibibazo no guteza imbere ishuri.

Yahuze n'abayobozi b'amashuri menshi, inganda nyinshi, n'imiryango itandukanye, kugira ngo bakorane mu guteza imbere uburezi bw'ubumenyi n'ubuhanga. Yizera ko ubufatanye ari urufunguzo rwo guteza imbere igihugu.

KWIGA AHORAHO

Twizeyimana Jean Claude ni umuntu ukunda kwiga ahoraho. Yizera ko umuntu agomba kwiga ahoraho kugira ngo abashe gukomeza kuba ingenzi mu kazi ke. Asoma ibitabo byinshi ku buyobozi, uburezi, n'iterambere ry'abantu. Yitabira amahugurwa menshi yo guteza imbere ubushobozi bwe.

Yigisha abakozi b'ishuri ko bagomba kwiga ahoraho, ko bagomba gukurikirana ibyerekeye uburezi bw'ubumenyi n'ubuhanga, kandi ko bagomba guhora bahindura uburyo bwo kwigisha kugira ngo buhuze n'ibyo isoko ry'akazi risaba.

UMUZIRO

Twizeyimana Jean Claude ni umuyobozi ukomeye, ufite ubumenyi bukabije, kandi ukunda abanyeshuri n'abakozi b'ishuri. Ni umuntu w'ubwoba bw'Imana, ukunda igihugu cye, kandi ukaba ukora cyane ku iterambere ry'urubyiruko. Ni inzira nziza y'urubyiruko rw'u Rwanda, kandi ni umuyobozi uzakomeza guteza imbere uburezi bw'ubumenyi n'ubuhanga mu Rwanda.`,
      email: 'jeanclaudetwizeyimana14@gmail.com',
      phone: '0783407691',
      office_location: 'Main Administration Building - Patron Office, Room 101',
      image_url: '/uploads/leadership/patron.jpg',
      qualifications: JSON.stringify(['Master of Science in Educational Leadership and Management', 'Bachelor of Technical Education', 'Advanced Certificate in School Administration', 'Diploma in Business Management', 'Professional Development in TVET Systems']),
      experience_years: 15,
      specialization: 'Educational Leadership, Technical and Vocational Education Training (TVET), Youth Development and Empowerment, Strategic Planning and School Management, Industry-Education Partnership Development',
      achievements: JSON.stringify([
        'Yatangije kandi ayobora neza ishuri rya Garden TVET School rifite abanyeshuri barenga 500',
        'Yahuza ishuri n\'inganda zirenga 50 mu gutanga amahugurwa n\'amahirwe y\'akazi',
        'Yahawe ibihembo byinshi by\'ubuyobozi bw\'uburezi bw\'ubumenyi n\'ubuhanga mu Rwanda',
        'Yafashije abanyeshuri barenga 2000 kubona amahirwe y\'akazi n\'ubuzima bwiza',
        'Yatangije gahunda nyinshi zo gufasha urubyiruko rwiga ubumenyi n\'ubuhanga'
      ]),
      responsibilities: JSON.stringify([
        'Kuyobora ishuri rya Garden TVET School no kugenzura ibikorwa byose by\'ishuri',
        'Gushyira mu bikorwa politiki z\'uburezi n\'intego z\'ishuri',
        'Gufasha abanyeshuri kubona amahugurwa y\'ireme kandi bakwiye',
        'Guhuza ishuri n\'inganda mu gutanga amahugurwa n\'amahirwe y\'akazi',
        'Gufasha abakozi b\'ishuri guteza imbere ubushobozi bwabo',
        'Gukurikirana iterambere ry\'abanyeshuri n\'ishuri muri rusange'
      ]),
      office_hours: 'Ku wa Mbere - Ku wa Gatanu: 8:00 AM - 5:00 PM, Ku wa Gatandatu: 9:00 AM - 1:00 PM, Cyangwa maze gutumira mbere'
    };
    
    if (existing.length > 0) {
      console.log('Patron exists, updating...');
      await pool.query(`
        UPDATE leadership SET 
          name = ?, 
          role = ?,
          department = ?,
          email = ?, 
          phone = ?, 
          biography_rw = ?, 
          image_url = ?,
          office_location = ?,
          qualifications = ?,
          achievements = ?,
          responsibilities = ?,
          specialization = ?,
          experience_years = ?,
          office_hours = ?
        WHERE id = ?
      `, [
        patronData.name,
        patronData.role,
        patronData.department,
        patronData.email,
        patronData.phone,
        patronData.biography_rw,
        patronData.image_url,
        patronData.office_location,
        patronData.qualifications,
        patronData.achievements,
        patronData.responsibilities,
        patronData.specialization,
        patronData.experience_years,
        patronData.office_hours,
        existing[0].id
      ]);
      console.log('✅ Patron data updated successfully!');
    } else {
      console.log('Adding new patron...');
      await pool.query(`
        INSERT INTO leadership (
          name, role, department, biography_rw, email, phone, 
          office_location, image_url, qualifications, experience_years,
          specialization, achievements, responsibilities, office_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        patronData.name,
        patronData.role,
        patronData.department,
        patronData.biography_rw,
        patronData.email,
        patronData.phone,
        patronData.office_location,
        patronData.image_url,
        patronData.qualifications,
        patronData.experience_years,
        patronData.specialization,
        patronData.achievements,
        patronData.responsibilities,
        patronData.office_hours
      ]);
      console.log('✅ Patron data added successfully!');
    }
    
    // Verify the data
    const [result] = await pool.query('SELECT * FROM leadership WHERE role = "Patron"');
    console.log('\n📋 Patron Information:');
    console.log('Name:', result[0].name);
    console.log('Email:', result[0].email);
    console.log('Phone:', result[0].phone);
    console.log('Image:', result[0].image_url);
    console.log('\n✅ All done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addPatronData();
