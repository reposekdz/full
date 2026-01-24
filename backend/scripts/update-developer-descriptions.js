const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

const developers = [
  {
    id: 13,
    description_rw: `Niyonkuru Reponse ni umuyobozi mukuru w'itsinda ry'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu iterambere rya sisitemu n'ubuyobozi bw'imishinga.

Nk'umuyobozi w'itsinda, Reponse yafashe inshingano zo guhuza abagize itsinda, gushyiraho imyubakire ya sisitemu, no kwemeza ko umushinga urangira neza. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho nko React, TypeScript, Node.js, Express, na MySQL mu gukora sisitemu ihuza ibikenewe n'amashuri mu Rwanda.

IMYUGA N'UBUMENYI:
Reponse afite ubumenyi bukomeye mu iterambere rya sisitemu zikomeye (Full-Stack Development). Yatunganye sisitemu ikomeye yo kwiyandikisha abanyeshuri ikoresheje kode zidasanzwe, dashboard zitandukanye ku bigo by'abakoresha, sisitemu yo gucunga amaklasi, sisitemu yo gukurikirana amanota, na sisitemu yo guhanahana.

IMISHINGA YAKOZE:
1. School Management System - Umushinga mukuru w'impamyabumenyi
2. Student Serial Code Authentication System
3. Class Sheets Management System
4. DOS Management Dashboard
5. Homepage Content Management System

UBUSHOBOZI BWE:
- Full-Stack Development
- Database Design & Architecture
- System Architecture & Design
- Team Leadership & Management
- Project Management
- Problem Solving & Critical Thinking
- Code Review & Quality Assurance
- Technical Documentation

IBIHEMBO YARONSE:
- Best Student Developer 2025 - Garden TVET School
- Innovation Award 2025 - Rwanda ICT Chamber
- Best Graduation Project 2026 - TVET Schools Competition
- Young Developer Award 2026 - Rwanda Development Board`
  },
  {
    id: 14,
    description_rw: `Musoni Mugisha Yves ni inzobere mu gukurikirana umutungo n'uguhanga udushya. Afite uruhare runini mu gushyira mu bikorwa ibitekerezo bishya no gufasha itsinda gukomeza gutera imbere.

URUHARE MU MUSHINGA:
Yves yagize uruhare runini mu gukurikirana umutungo wa sisitemu, gukora testing, no kwemeza ko sisitemu ikora neza. Yafashe inshingano zo gukora quality assurance, gukora documentation, no gufasha mu gukemura ibibazo.

UBUSHOBOZI BWE:
- Innovation & Creative Thinking
- Asset Management & Tracking
- Quality Assurance & Testing
- Technical Documentation
- Problem Solving
- Team Collaboration

IMISHINGA YAKOZE:
- Asset Tracking System
- Quality Assurance Framework
- Testing Documentation
- Innovation Proposals

IBIHEMBO:
- Innovation Excellence Award 2025
- Best Team Player 2025
- Quality Assurance Award 2025`
  },
  {
    id: 15,
    description_rw: `Zamilu Yazid Surayman ni umunyamabanga w'itsinda kandi ni inzobere mu gukusanya amakuru. Afite uruhare runini mu gukusanya no gutunganya amakuru akenewe mu gukora sisitemu.

URUHARE MU MUSHINGA:
Yazid yagize uruhare runini mu gukora ubushakashatsi, gukusanya ibikenewe n'abakoresha, gutunganya amakuru, no gukora documentation. Yafashe inshingano zo kwandika raporo, gukora inyandiko, no guhuza itsinda n'abayobozi b'ishuri.

UBUSHOBOZI BWE:
- Data Analysis & Research
- Information Gathering
- Documentation & Reporting
- Communication Skills
- Organization & Planning
- Stakeholder Management

IMISHINGA YAKOZE:
- User Requirements Documentation
- Research Reports
- Data Collection Systems
- Meeting Minutes & Reports

IBIHEMBO:
- Best Data Analyst 2025
- Excellence in Research 2025
- Best Documentation Award 2025`
  },
  {
    id: 16,
    description_rw: `Niyonsenga Frank ni uhagarariye itsinda kandi ni umujyanama. Afite uruhare runini mu guhuza itsinda n'abayobozi b'ishuri no gutanga inama ku bijyanye n'umushinga.

URUHARE MU MUSHINGA:
Frank yagize uruhare runini mu guhuza itsinda n'abayobozi b'ishuri, gutanga inama ku bijyanye n'umushinga, gukora presentation, no gufasha mu gushyira mu bikorwa imishinga. Yafashe inshingano zo kuvugira itsinda, gukora advisory, no guhuza stakeholders.

UBUSHOBOZI BWE:
- Leadership & Team Representation
- Communication & Presentation
- Project Coordination
- Stakeholder Management
- Advisory & Consulting
- Conflict Resolution

IMISHINGA YAKOZE:
- Stakeholder Engagement Strategy
- Project Presentations
- Advisory Reports
- Team Coordination Framework

IBIHEMBO:
- Best Team Representative 2025
- Leadership Excellence Award 2025
- Communication Award 2025`
  }
];

async function updateDeveloperDescriptions() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const dev of developers) {
      await connection.query(
        'UPDATE developer_team SET description_rw = ? WHERE id = ?',
        [dev.description_rw, dev.id]
      );
      console.log(`✅ Updated developer ID ${dev.id}`);
    }

    console.log('\n🎉 All developer descriptions updated successfully!');

    // Verify
    const [results] = await connection.query(
      'SELECT id, name, LENGTH(description_rw) as desc_length FROM developer_team ORDER BY sort_order'
    );
    console.log('\n📋 Verification:');
    results.forEach((row) => {
      console.log(`  ${row.name}: ${row.desc_length} characters`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateDeveloperDescriptions();
