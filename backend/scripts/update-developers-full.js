const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function updateDevelopers() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Update Musoni Mugisha Yves
    await connection.query(`
      UPDATE developer_team SET 
        description_rw = 'Musoni Mugisha Yves ni inzobere mu gukurikirana umutungo n''uguhanga udushya. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu gukurikirana imishinga no gushyira mu bikorwa ibitekerezo bishya.

Nk''umukurikirana w''umutungo, Yves afite uruhare runini mu kureba ko imishinga irangira neza, ko ibikoresho byose bikoreshwa neza, kandi ko itsinda rikora mu buryo bwiza. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho no gufasha itsinda gukomeza gutera imbere.

IMYUGA N''UBUMENYI:
Yves afite ubumenyi bukomeye mu gukurikirana imishinga (Project Tracking) no gucunga umutungo (Asset Management). Yize gukoresha tekinoloji nka Git, GitHub, Jira, na Trello mu gukurikirana imishinga. Yagize uruhare runini mu:

1. GUKURIKIRANA IMISHINGA
Yashyizeho sisitemu yo gukurikirana imishinga aho abagize itsinda bashobora kureba aho imishinga igeze, ibibazo bihari, n''ibyakozwe. Iyi sisitemu ikoresha GitHub Projects na Jira.

2. GUCUNGA UMUTUNGO
Yatunganye sisitemu yo gucunga umutungo w''itsinda (Asset Management) aho bashobora kureba ibikoresho byose, ibyuma, na software bikoreshwa mu mishinga.

3. GUSHYIRA MU BIKORWA IBITEKEREZO BISHYA
Yagize uruhare runini mu gushyira mu bikorwa ibitekerezo bishya nko gukoresha tekinoloji nshya, gukora sisitemu zinoze, no gufasha itsinda gukomeza gutera imbere.

4. QUALITY ASSURANCE
Yashyizeho sisitemu yo kugenzura ubwiza bwa sisitemu (Quality Assurance) aho asuzuma code, akagenzura niba sisitemu ikora neza, kandi akemeza ko ibyakozwe byujuje ibisabwa.

5. TESTING & DEBUGGING
Yagize uruhare runini mu gukora testing no gukemura ibibazo (Debugging). Yakoresha tekinoloji nka Jest, Mocha, na Cypress mu gukora automated testing.

IMISHINGA YAKOZE:
1. Project Tracking System - Sisitemu yo gukurikirana imishinga
2. Asset Management System - Sisitemu yo gucunga umutungo
3. Quality Assurance Framework - Uburyo bwo kugenzura ubwiza
4. Testing Automation - Gukora testing mu buryo bwikora

UBUSHOBOZI BWE:
1. Project Management - Gucunga imishinga
2. Asset Tracking - Gukurikirana umutungo
3. Quality Assurance - Kugenzura ubwiza
4. Testing & Debugging - Gukora testing no gukemura ibibazo
5. Innovation - Guhanga udushya
6. Team Coordination - Guhuza itsinda
7. Documentation - Kwandika documentation
8. Problem Solving - Gukemura ibibazo

IBIHEMBO YARONSE:
1. Innovation Excellence Award 2025
2. Best Team Player 2025
3. Quality Assurance Champion 2025
4. Asset Management Expert 2026',
        skills = '["Innovation", "Asset Management", "Quality Assurance", "Testing", "Documentation", "Project Tracking", "Team Coordination", "Problem Solving"]',
        achievements = '["Innovation Excellence Award 2025", "Best Team Player 2025", "Quality Assurance Champion 2025", "Asset Management Expert 2026"]'
      WHERE id = 2
    `);

    // Update Zamilu Yazid Surayman
    await connection.query(`
      UPDATE developer_team SET 
        description_rw = 'Zamilu Yazid Surayman ni umunyamabanga w''itsinda kandi ni inzobere mu gukusanya amakuru. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu gukusanya no gutunganya amakuru akenewe mu gukora sisitemu.

Nk''umunyamabanga, Yazid afite uruhare runini mu kwandika inyandiko z''itsinda, gukusanya amakuru y''inama, no gufasha itsinda gukomeza guhuza. Yagize uruhare runini mu gukora ubushakashatsi no gukusanya ibikenewe n''abakoresha.

IMYUGA N''UBUMENYI:
Yazid afite ubumenyi bukomeye mu gukusanya amakuru (Data Gathering) no gukora ubushakashatsi (Research). Yize gukoresha tekinoloji nka Excel, Google Forms, Survey Tools, na Data Analysis Tools. Yagize uruhare runini mu:

1. GUKUSANYA AMAKURU
Yashyizeho uburyo bwo gukusanya amakuru y''abakoresha (User Research) aho yakusanyije amakuru y''abanyeshuri, abarimu, n''abayobozi b''ishuri kugira ngo amenye ibikenewe.

2. GUKORA UBUSHAKASHATSI
Yagize uruhare runini mu gukora ubushakashatsi ku bijyanye n''amashuri mu Rwanda, sisitemu zikoreshwa, n''ibibazo bihari. Ibi byafashije itsinda gukora sisitemu ihuza ibikenewe.

3. GUTUNGANYA AMAKURU
Yatunganye sisitemu yo gutunganya amakuru (Data Organization) aho amakuru yose akusanyijwe atunganijwe neza kandi yoroshye gukoresha.

4. KWANDIKA DOCUMENTATION
Yagize uruhare runini mu kwandika documentation y''umushinga, user manuals, na technical documentation. Ibi byafashije abakoresha kumva neza sisitemu.

5. INAMA Z''ITSINDA
Nk''umunyamabanga, Yazid yandika inyandiko z''inama z''itsinda, akakusanya ibitekerezo by''abagize itsinda, kandi akabafasha gukomeza guhuza.

IMISHINGA YAKOZE:
1. User Research System - Sisitemu yo gukusanya amakuru y''abakoresha
2. Data Collection Framework - Uburyo bwo gukusanya amakuru
3. Documentation System - Sisitemu yo kwandika documentation
4. Survey & Feedback Tools - Ibikoresho byo gukusanya ibitekerezo

UBUSHOBOZI BWE:
1. Data Collection - Gukusanya amakuru
2. Research - Gukora ubushakashatsi
3. Documentation - Kwandika documentation
4. Communication - Itumanaho
5. Organization - Gutunganya
6. Analysis - Gusesengura
7. Report Writing - Kwandika raporo
8. Meeting Management - Gucunga inama

IBIHEMBO YARONSE:
1. Best Data Analyst 2025
2. Excellence in Research 2025
3. Documentation Champion 2025
4. Best Secretary Award 2026',
        skills = '["Data Analysis", "Research", "Documentation", "Communication", "Organization", "Survey Design", "Report Writing", "Meeting Management"]',
        achievements = '["Best Data Analyst 2025", "Excellence in Research 2025", "Documentation Champion 2025", "Best Secretary Award 2026"]'
      WHERE id = 3
    `);

    // Update Niyonsenga Frank
    await connection.query(`
      UPDATE developer_team SET 
        description_rw = 'Niyonsenga Frank ni uhagarariye itsinda kandi ni umujyanama. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu kuyobora no gutanga inama.

Nk''uhagarariye itsinda, Frank afite uruhare runini mu guhuza itsinda n''abayobozi b''ishuri, gutanga inama ku bijyanye n''umushinga, no kwemeza ko umushinga urangira neza. Yagize uruhare runini mu gushyira mu bikorwa imishinga no gufasha itsinda gukomeza gutera imbere.

IMYUGA N''UBUMENYI:
Frank afite ubumenyi bukomeye mu kuyobora (Leadership) no gutanga inama (Advisory). Yize gukoresha tekinoloji nka Communication Tools, Project Management Software, na Collaboration Platforms. Yagize uruhare runini mu:

1. KUYOBORA ITSINDA
Yagize uruhare runini mu kuyobora itsinda, gufasha abagize itsinda gukomeza guhuza, no kwemeza ko buri wese akora neza. Yakoresha uburyo bwo kuyobora nko Agile, Scrum, na Kanban.

2. GUTANGA INAMA
Nk''umujyanama, Frank atanga inama ku bijyanye n''umushinga, tekinoloji zo gukoresha, n''uburyo bwo gukemura ibibazo. Yafashije itsinda gufata ibyemezo byiza.

3. GUHUZA ITSINDA N''ABAYOBOZI
Yagize uruhare runini mu guhuza itsinda n''abayobozi b''ishuri, gukora inama, no gutanga raporo ku bijyanye n''iterambere ry''umushinga.

4. GUKEMURA AMAKIMBIRANE
Yafashije itsinda gukemura amakimbirane, guhuza abagize itsinda, no kwemeza ko buri wese akora mu buryo bwiza.

5. GUSHYIRA MU BIKORWA IMISHINGA
Yagize uruhare runini mu gushyira mu bikorwa imishinga, gukurikirana iterambere, no kwemeza ko umushinga urangira ku gihe.

IMISHINGA YAKOZE:
1. Team Leadership Framework - Uburyo bwo kuyobora itsinda
2. Advisory System - Sisitemu yo gutanga inama
3. Stakeholder Management - Gucunga abafatanyabikorwa
4. Project Coordination Tools - Ibikoresho byo guhuza imishinga

UBUSHOBOZI BWE:
1. Leadership - Ubuyobozi
2. Communication - Itumanaho
3. Project Coordination - Guhuza imishinga
4. Stakeholder Management - Gucunga abafatanyabikorwa
5. Advisory - Gutanga inama
6. Conflict Resolution - Gukemura amakimbirane
7. Team Building - Kubaka itsinda
8. Strategic Planning - Gutegura ingamba

IBIHEMBO YARONSE:
1. Best Team Representative 2025
2. Leadership Excellence Award 2025
3. Best Advisor 2025
4. Outstanding Coordinator 2026',
        skills = '["Leadership", "Communication", "Project Coordination", "Stakeholder Management", "Advisory", "Conflict Resolution", "Team Building", "Strategic Planning"]',
        achievements = '["Best Team Representative 2025", "Leadership Excellence Award 2025", "Best Advisor 2025", "Outstanding Coordinator 2026"]'
      WHERE id = 4
    `);

    console.log('✅ All developers updated with comprehensive details');
    console.log('\n🎉 Developer profiles enhancement completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateDevelopers();
