const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function addAllLeadership() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Clear existing records
    await connection.execute('DELETE FROM leadership');
    console.log('✅ Cleared old records\n');

    const leaders = [
      {
        name: 'MASEZERANO Isaac',
        role: 'Umuyobozi w\'Amasomo (Director of Studies - DOS)',
        department: 'Academic Affairs',
        biography_rw: `MASEZERANO Isaac ni Umuyobozi w'Amasomo muri Garden TVET School. Afite uburambe bw'imyaka 15 mu gucunga amasomo n'imyigishirize. Yize kuri University of Rwanda aho yabonye impamyabumenyi ya Master's mu buyobozi bw'uburezi. Akora cyane mu guteza imbere gahunda z'amasomo, gukurikirana abarimu n'abanyeshuri, no gutegura ibizamini. Ni umuntu ukunda akazi kandi yitanze mu guteza imbere uburezi bw'ireme muri Garden TVET School.`,
        biography_en: `MASEZERANO Isaac is the Director of Studies at Garden TVET School with 15 years of experience in academic management. He holds a Master's degree in Educational Leadership from the University of Rwanda. He focuses on curriculum development, teacher and student supervision, and examination preparation. He is dedicated to advancing quality education at Garden TVET School.`,
        email: 'masezerano.isaac@gardentvet.ac.rw',
        phone: '+250 788 123 456',
        office_location: 'Academic Affairs Office, 2nd Floor',
        image_url: '/uploads/leadership/masezerano-isaac-sod.png',
        qualifications: JSON.stringify([
          "Master's Degree in Educational Leadership - University of Rwanda",
          "Bachelor's Degree in Mathematics and Physics",
          "Advanced Certificate in Curriculum Development",
          "Certificate in TVET Management",
          "Training in Modern Teaching Methods"
        ]),
        experience_years: 15,
        specialization: 'Educational Leadership, Curriculum Development, Teacher Training',
        achievements: JSON.stringify([
          "Best Director of Studies Award 2023",
          "Excellence in Academic Leadership 2022",
          "Innovation in Teaching Award 2021",
          "Outstanding Educator Award 2019",
          "Best Mathematics Teacher 2017"
        ]),
        responsibilities: JSON.stringify([
          "Managing school curriculum",
          "Supervising teachers and instruction",
          "Preparing and evaluating examinations",
          "Monitoring student performance",
          "Developing teaching methods",
          "Teacher training programs",
          "Academic performance reporting",
          "Student academic support"
        ]),
        office_hours: 'Monday - Friday (8:00 AM - 5:00 PM)',
        display_order: 1
      },
      {
        name: 'UWIMANA Jean Claude',
        role: 'Umuyobozi Mukuru (Headmaster)',
        department: 'Administration',
        biography_rw: `UWIMANA Jean Claude ni Umuyobozi Mukuru wa Garden TVET School. Afite uburambe bw'imyaka 20 mu buyobozi bw'amashuri. Yize kuri Kigali Independent University aho yabonye impamyabumenyi ya Master's mu buyobozi bw'uburezi. Akora cyane mu gucunga imikorere rusange y'ishuri, gufatanya n'abarimu n'abanyeshuri, no guteza imbere imishinga mishya. Ni umuyobozi ukomeye kandi ufite ubushobozi bwo gufata ibyemezo byiza.`,
        biography_en: `UWIMANA Jean Claude is the Headmaster of Garden TVET School with 20 years of school management experience. He holds a Master's degree in Educational Administration from Kigali Independent University. He oversees overall school operations, collaborates with teachers and students, and develops new initiatives. He is a strong leader with excellent decision-making skills.`,
        email: 'uwimana.jc@gardentvet.ac.rw',
        phone: '+250 788 234 567',
        office_location: 'Headmaster Office, 3rd Floor',
        image_url: '/uploads/leadership/headmaster.jpg',
        qualifications: JSON.stringify([
          "Master's Degree in Educational Administration",
          "Bachelor's Degree in Education Management",
          "Certificate in School Leadership",
          "Training in Strategic Planning"
        ]),
        experience_years: 20,
        specialization: 'School Administration, Strategic Planning, Leadership',
        achievements: JSON.stringify([
          "Best Headmaster Award 2024",
          "School Excellence Award 2023",
          "Leadership Excellence 2022",
          "Community Service Award 2021"
        ]),
        responsibilities: JSON.stringify([
          "Overall school management",
          "Strategic planning and implementation",
          "Staff supervision and development",
          "Budget management",
          "Community relations",
          "Policy implementation",
          "Quality assurance",
          "Stakeholder engagement"
        ]),
        office_hours: 'Monday - Friday (7:30 AM - 5:30 PM)',
        display_order: 0
      },
      {
        name: 'MUKAMANA Grace',
        role: 'Umuyobozi w\'Imyitwarire (Director of Discipline - DOD)',
        department: 'Student Affairs',
        biography_rw: `MUKAMANA Grace ni Umuyobozi w'Imyitwarire muri Garden TVET School. Afite uburambe bw'imyaka 12 mu gucunga imyitwarire y'abanyeshuri. Yize kuri University of Rwanda aho yabonye impamyabumenyi ya Bachelor's mu Psychologie. Akora cyane mu kurinda imyitwarire myiza y'abanyeshuri, gukemura ibibazo, no gutanga inama. Ni umuntu ukunda abanyeshuri kandi yitaye ku iterambere ryabo.`,
        biography_en: `MUKAMANA Grace is the Director of Discipline at Garden TVET School with 12 years of experience in student behavior management. She holds a Bachelor's degree in Psychology from the University of Rwanda. She focuses on maintaining student discipline, conflict resolution, and counseling. She is passionate about student development and welfare.`,
        email: 'mukamana.grace@gardentvet.ac.rw',
        phone: '+250 788 345 678',
        office_location: 'Student Affairs Office, 1st Floor',
        image_url: '/uploads/leadership/dod.jpg',
        qualifications: JSON.stringify([
          "Bachelor's Degree in Psychology",
          "Certificate in Counseling and Guidance",
          "Training in Conflict Resolution",
          "Child Protection Training"
        ]),
        experience_years: 12,
        specialization: 'Student Discipline, Counseling, Behavior Management',
        achievements: JSON.stringify([
          "Best Disciplinarian Award 2023",
          "Student Welfare Excellence 2022",
          "Counseling Excellence Award 2021"
        ]),
        responsibilities: JSON.stringify([
          "Student discipline management",
          "Counseling and guidance",
          "Conflict resolution",
          "Behavior monitoring",
          "Parent communication",
          "Student welfare programs",
          "Disciplinary committee coordination"
        ]),
        office_hours: 'Monday - Friday (8:00 AM - 5:00 PM)',
        display_order: 2
      },
      {
        name: 'NIYONKURU Patrick',
        role: 'Umujyanama (Advisor)',
        department: 'Student Support Services',
        biography_rw: `NIYONKURU Patrick ni Umujyanama muri Garden TVET School. Afite uburambe bw'imyaka 10 mu gutanga inama abanyeshuri n'ababyeyi. Yize kuri Kigali Independent University aho yabonye impamyabumenyi ya Bachelor's mu Social Work. Akora cyane mu gufasha abanyeshuri gukemura ibibazo byabo, gutanga inama ku masomo, no gufatanya n'ababyeyi. Ni umuntu w'ubwenge kandi ukunda gufasha abandi.`,
        biography_en: `NIYONKURU Patrick is an Advisor at Garden TVET School with 10 years of experience in student and parent counseling. He holds a Bachelor's degree in Social Work from Kigali Independent University. He helps students solve their problems, provides academic advice, and collaborates with parents. He is intelligent and passionate about helping others.`,
        email: 'niyonkuru.patrick@gardentvet.ac.rw',
        phone: '+250 788 456 789',
        office_location: 'Student Support Office, 1st Floor',
        image_url: '/uploads/leadership/advisor.jpg',
        qualifications: JSON.stringify([
          "Bachelor's Degree in Social Work",
          "Certificate in Guidance and Counseling",
          "Training in Family Therapy",
          "Youth Development Training"
        ]),
        experience_years: 10,
        specialization: 'Student Counseling, Parent Relations, Social Work',
        achievements: JSON.stringify([
          "Best Advisor Award 2023",
          "Student Support Excellence 2022",
          "Community Engagement Award 2021"
        ]),
        responsibilities: JSON.stringify([
          "Student counseling and guidance",
          "Parent-teacher communication",
          "Academic advising",
          "Career guidance",
          "Home visits coordination",
          "Student welfare monitoring",
          "Support program development"
        ]),
        office_hours: 'Monday - Friday (8:00 AM - 5:00 PM)',
        display_order: 3
      },
      {
        name: 'HABIMANA Emmanuel',
        role: 'Umubitsi (Accountant)',
        department: 'Finance',
        biography_rw: `HABIMANA Emmanuel ni Umubitsi wa Garden TVET School. Afite uburambe bw'imyaka 14 mu ikoranabuhanga ry'ibaruramari. Yize kuri University of Rwanda aho yabonye impamyabumenyi ya Bachelor's mu Accounting. Akora cyane mu gucunga amafaranga y'ishuri, gutegura raporo z'ibaruramari, no kugenzura ibikoresho. Ni umuntu ukomeye mu kazi kandi yubahiriza amategeko y'ibaruramari.`,
        biography_en: `HABIMANA Emmanuel is the Accountant at Garden TVET School with 14 years of experience in financial management. He holds a Bachelor's degree in Accounting from the University of Rwanda. He manages school finances, prepares financial reports, and oversees resource management. He is diligent and adheres to financial regulations.`,
        email: 'habimana.emmanuel@gardentvet.ac.rw',
        phone: '+250 788 567 890',
        office_location: 'Finance Office, 2nd Floor',
        image_url: '/uploads/leadership/accountant.jpg',
        qualifications: JSON.stringify([
          "Bachelor's Degree in Accounting",
          "CPA Certification",
          "Certificate in Financial Management",
          "Training in School Finance"
        ]),
        experience_years: 14,
        specialization: 'Financial Management, Accounting, Budgeting',
        achievements: JSON.stringify([
          "Best Accountant Award 2024",
          "Financial Excellence Award 2023",
          "Audit Excellence 2022"
        ]),
        responsibilities: JSON.stringify([
          "Financial management and reporting",
          "Budget preparation and monitoring",
          "Fee collection management",
          "Payroll processing",
          "Financial audits",
          "Procurement oversight",
          "Financial policy implementation"
        ]),
        office_hours: 'Monday - Friday (8:00 AM - 5:00 PM)',
        display_order: 4
      }
    ];

    for (const leader of leaders) {
      await connection.execute(
        `INSERT INTO leadership (
          name, role, department, biography_rw, biography_en,
          email, phone, office_location, image_url,
          qualifications, experience_years, specialization,
          achievements, responsibilities, office_hours, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leader.name, leader.role, leader.department, leader.biography_rw, leader.biography_en,
          leader.email, leader.phone, leader.office_location, leader.image_url,
          leader.qualifications, leader.experience_years, leader.specialization,
          leader.achievements, leader.responsibilities, leader.office_hours, leader.display_order
        ]
      );
      console.log(`✅ Added: ${leader.name} - ${leader.role}`);
    }

    console.log('\n✅ All 5 leadership members added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addAllLeadership();
