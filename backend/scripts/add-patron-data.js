const { pool } = require('../config/database');

async function addPatronData() {
  try {
    // Check if patron already exists
    const [existing] = await pool.query('SELECT * FROM leadership WHERE role = "Patron"');
    
    if (existing.length > 0) {
      console.log('Patron already exists, updating...');
      await pool.query(`
        UPDATE leadership SET 
          name = ?, 
          email = ?, 
          phone = ?, 
          biography_rw = ?, 
          image_url = ?,
          qualifications = ?,
          achievements = ?,
          responsibilities = ?,
          experience_years = ?
        WHERE role = "Patron"
      `, [
        'Twizeyimana Jean Claude',
        'jeanclaudetwizeyimana14@gmail.com',
        '0783407691',
        'Twizeyimana Jean Claude ni umuyobozi ukomeye w\'ishuri rya Garden TVET School. Afite ubumenyi bukomeye mu gucunga amashuri n\'ubuyobozi bw\'ibigo by\'amahugurwa. Yitanze cyane mu guteza imbere uburezi bw\'ubumenyi n\'ubuhanga mu Rwanda. Ni umuntu w\'ubwoba bw\'Imana, ukunda abanyeshuri n\'abakozi b\'ishuri. Afite intego yo guhindura ubuzima bw\'urubyiruko binyuze mu burezi bw\'ubumenyi n\'ubuhanga.',
        '/uploads/leadership/patron.jpg',
        'Master\'s Degree in Educational Leadership, Bachelor\'s Degree in Technical Education, Certificate in School Management',
        'Yatangije amashuri menshi y\'ubumenyi n\'ubuhanga, Yahawe ibihembo by\'ubuyobozi bw\'uburezi, Yagize uruhare runini mu guteza imbere uburezi bw\'ubumenyi n\'ubuhanga mu Rwanda',
        'Kuyobora ishuri rya Garden TVET School, Gushyira mu bikorwa politiki z\'uburezi, Gufasha abanyeshuri kubona amahirwe y\'akazi, Guhuza ishuri n\'inganda mu gutanga amahugurwa',
        15
      ]);
    } else {
      console.log('Adding new patron...');
      await pool.query(`
        INSERT INTO leadership (
          name, role, department, biography_rw, email, phone, 
          office_location, image_url, qualifications, experience_years,
          specialization, achievements, responsibilities, office_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Twizeyimana Jean Claude',
        'Patron',
        'Administration',
        'Twizeyimana Jean Claude ni umuyobozi ukomeye w\'ishuri rya Garden TVET School. Afite ubumenyi bukomeye mu gucunga amashuri n\'ubuyobozi bw\'ibigo by\'amahugurwa. Yitanze cyane mu guteza imbere uburezi bw\'ubumenyi n\'ubuhanga mu Rwanda. Ni umuntu w\'ubwoba bw\'Imana, ukunda abanyeshuri n\'abakozi b\'ishuri. Afite intego yo guhindura ubuzima bw\'urubyiruko binyuze mu burezi bw\'ubumenyi n\'ubuhanga.',
        'jeanclaudetwizeyimana14@gmail.com',
        '0783407691',
        'Main Administration Building, Office 101',
        '/uploads/leadership/patron.jpg',
        'Master\'s Degree in Educational Leadership, Bachelor\'s Degree in Technical Education, Certificate in School Management',
        15,
        'Educational Leadership, Technical Education Management, Youth Development',
        'Yatangije amashuri menshi y\'ubumenyi n\'ubuhanga, Yahawe ibihembo by\'ubuyobozi bw\'uburezi, Yagize uruhare runini mu guteza imbere uburezi bw\'ubumenyi n\'ubuhanga mu Rwanda',
        'Kuyobora ishuri rya Garden TVET School, Gushyira mu bikorwa politiki z\'uburezi, Gufasha abanyeshuri kubona amahirwe y\'akazi, Guhuza ishuri n\'inganda mu gutanga amahugurwa',
        'Monday-Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 1:00 PM'
      ]);
    }
    
    console.log('Patron data added/updated successfully!');
    
    // Verify the data
    const [result] = await pool.query('SELECT * FROM leadership WHERE role = "Patron"');
    console.log('Patron data:', result[0]);
    
  } catch (error) {
    console.error('Error adding patron data:', error);
  } finally {
    process.exit(0);
  }
}

addPatronData();