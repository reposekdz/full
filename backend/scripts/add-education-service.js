const { pool } = require('../config/database');

async function addEducationService() {
  try {
    console.log('Adding Fast-Track Education Service...');

    const [existing] = await pool.query(
      'SELECT id FROM school_services WHERE name LIKE "%Fast-Track%"'
    );

    if (existing.length > 0) {
      console.log('Service already exists, updating...');
      await pool.query(`
        UPDATE school_services 
        SET 
          name = ?,
          name_rw = ?,
          description = ?,
          description_rw = ?,
          full_details_rw = ?,
          category = ?,
          is_active = true
        WHERE id = ?
      `, [
        'Fast-Track Primary & Secondary Education',
        'Kwiga ukabona Preime na Provisoire Mugihe Gito',
        'Accelerated education program for Primary (P6) and Secondary (S3) certificates in 6-12 months',
        'Serivisi y\'uburezi bwihuse igufasha kubona impamyabumenyi za Preime (P6) na Provisoire (S3) mugihe gito',
        `Serivisi yacu y'uburezi bwihuse igufasha kubona impamyabumenyi za Preime (P6) na Provisoire (S3) mugihe gito kandi byoroshye.

🎯 IBYO UZABONA:
• Amasomo yihuse kandi yuzuye
• Abarimu bafite ubunararibonye
• Ibikoresho byose by'amasomo
• Ubufasha bw'umwihariko
• Gukora ibizamini bisanzwe
• Impamyabumenyi zemewe na Leta

📚 AMASOMO TWIGISHA:
• Ikinyarwanda
• Igifaransa
• Icyongereza
• Imibare (Mathematics)
• Ubumenyi bwa Siyansi (Science)
• Amateka n'Imibereho (Social Studies)
• Ubumenyi bw'Imibereho (Life Skills)

⏰ IGIHE CYANGWA:
• Preime (P6): Amezi 6-9
• Provisoire (S3): Amezi 9-12
• Amasomo ya buri munsi cyangwa weekend
• Igihe gihuje n'igihe cyawe

💰 IBICIRO BYIZA:
• Kwishyura rimwe cyangwa buri kwezi
• Ibiciro bihendutse ku bafite ibibazo
• Inkunga zihari ku banyeshuri bakomeye

✅ IBISABWA:
• Kuba ufite nibura imyaka 15
• Impamyabumenyi y'ishuri ryashize
• Ubushake bwo kwiga no gutsinda

🎓 INTSINZI ZACU:
• 95% y'abanyeshuri baratsinze ibizamini
• 500+ abanyeshuri bahawe impamyabumenyi
• Abarimu 20+ bafite ubunararibonye
• Amasomo yuzuye kandi yihuse

📞 TWANDIKIRE UBU:
Saba ikiganiro cy'ubuntu kugira ngo tuganire ku buryo bwo kwiga kwawe. Tuzagufasha gushyira umugambi ukwiye kandi ukagera ku ntego zawe z'uburezi vuba!`,
        `Our fast-track education service helps you obtain Primary (P6) and Secondary (S3) certificates quickly and easily.

🎯 WHAT YOU GET:
• Accelerated comprehensive curriculum
• Experienced qualified teachers
• All learning materials included
• Personalized support & tutoring
• Official government examinations
• Nationally recognized certificates

📚 SUBJECTS WE TEACH:
• Kinyarwanda Language
• French Language
• English Language
• Mathematics
• Science & Technology
• Social Studies & History
• Life Skills & Citizenship

⏰ DURATION:
• Primary (P6): 6-9 months
• Secondary (S3): 9-12 months
• Daily or weekend classes available
• Flexible scheduling options

💰 AFFORDABLE PRICING:
• One-time or monthly payment plans
• Discounts for hardship cases
• Scholarships available for top performers

✅ REQUIREMENTS:
• Minimum age 15 years
• Previous school certificates
• Commitment to learning and success

🎓 OUR SUCCESS RATE:
• 95% pass rate on national exams
• 500+ students certified
• 20+ experienced teachers
• Comprehensive fast-track program

📞 ENROLL TODAY:
Request a free consultation to discuss your education path. We'll help you create a customized plan to achieve your educational goals quickly!`,
        'other',
        existing[0].id
      ]);
      console.log('✅ Service updated successfully!');
    } else {
      await pool.query(`
        INSERT INTO school_services (
          name, name_rw, description, description_rw, full_details_rw, category,
          icon, price, duration, availability, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
      `, [
        'Fast-Track Primary & Secondary Education',
        'Kwiga ukabona Preime na Provisoire Mugihe Gito',
        'Accelerated education program for Primary (P6) and Secondary (S3) certificates in 6-12 months',
        'Serivisi y\'uburezi bwihuse igufasha kubona impamyabumenyi za Preime (P6) na Provisoire (S3) mugihe gito',
        `Serivisi yacu y'uburezi bwihuse igufasha kubona impamyabumenyi za Preime (P6) na Provisoire (S3) mugihe gito kandi byoroshye.

🎯 IBYO UZABONA:
• Amasomo yihuse kandi yuzuye
• Abarimu bafite ubunararibonye
• Ibikoresho byose by'amasomo
• Ubufasha bw'umwihariko
• Gukora ibizamini bisanzwe
• Impamyabumenyi zemewe na Leta

📚 AMASOMO TWIGISHA:
• Ikinyarwanda
• Igifaransa
• Icyongereza
• Imibare (Mathematics)
• Ubumenyi bwa Siyansi (Science)
• Amateka n'Imibereho (Social Studies)
• Ubumenyi bw'Imibereho (Life Skills)

⏰ IGIHE CYANGWA:
• Preime (P6): Amezi 6-9
• Provisoire (S3): Amezi 9-12
• Amasomo ya buri munsi cyangwa weekend
• Igihe gihuje n'igihe cyawe

💰 IBICIRO BYIZA:
• Kwishyura rimwe cyangwa buri kwezi
• Ibiciro bihendutse ku bafite ibibazo
• Inkunga zihari ku banyeshuri bakomeye

✅ IBISABWA:
• Kuba ufite nibura imyaka 15
• Impamyabumenyi y'ishuri ryashize
• Ubushake bwo kwiga no gutsinda

🎓 INTSINZI ZACU:
• 95% y'abanyeshuri baratsinze ibizamini
• 500+ abanyeshuri bahawe impamyabumenyi
• Abarimu 20+ bafite ubunararibonye
• Amasomo yuzuye kandi yihuse

📞 TWANDIKIRE UBU:
Saba ikiganiro cy'ubuntu kugira ngo tuganire ku buryo bwo kwiga kwawe. Tuzagufasha gushyira umugambi ukwiye kandi ukagera ku ntego zawe z'uburezi vuba!`,
        `Our fast-track education service helps you obtain Primary (P6) and Secondary (S3) certificates quickly and easily.

🎯 WHAT YOU GET:
• Accelerated comprehensive curriculum
• Experienced qualified teachers
• All learning materials included
• Personalized support & tutoring
• Official government examinations
• Nationally recognized certificates

📚 SUBJECTS WE TEACH:
• Kinyarwanda Language
• French Language
• English Language
• Mathematics
• Science & Technology
• Social Studies & History
• Life Skills & Citizenship

⏰ DURATION:
• Primary (P6): 6-9 months
• Secondary (S3): 9-12 months
• Daily or weekend classes available
• Flexible scheduling options

💰 AFFORDABLE PRICING:
• One-time or monthly payment plans
• Discounts for hardship cases
• Scholarships available for top performers

✅ REQUIREMENTS:
• Minimum age 15 years
• Previous school certificates
• Commitment to learning and success

🎓 OUR SUCCESS RATE:
• 95% pass rate on national exams
• 500+ students certified
• 20+ experienced teachers
• Comprehensive fast-track program

📞 ENROLL TODAY:
Request a free consultation to discuss your education path. We'll help you create a customized plan to achieve your educational goals quickly!`,
        'other',
        'GraduationCap',
        0,
        '6-12 months',
        'available'
      ]);
      console.log('✅ Service added successfully!');
    }

    console.log('\n✅ Fast-Track Education Service is ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addEducationService();
