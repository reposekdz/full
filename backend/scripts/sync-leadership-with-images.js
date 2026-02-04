const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function syncLeadership() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Clear existing leadership data
    await conn.execute('DELETE FROM leadership');
    console.log('✓ Cleared existing leadership data');

    // Get all images from leadership folder
    const leadershipDir = path.join(__dirname, '../uploads/leadership');
    const files = fs.readdirSync(leadershipDir).filter(f => 
      f.match(/\.(jpg|jpeg|png)$/i)
    );

    console.log(`Found ${files.length} images in leadership folder`);

    // Map images to leader data
    const leaders = [
      {
        name: 'Rugambage Andre',
        role: 'School Owner',
        department: 'Administration',
        image: 'school owner.png',
        email: 'owner@gardentvet.rw',
        phone: '0788000000',
        office: 'Main Office',
        bio_rw: 'Umuyobozi mukuru n\'uwashinze ishuri rya Garden TVET School',
        bio_en: 'Founder and owner of Garden TVET School',
        experience: 4,
        order: 1
      },
      {
        name: 'Mukamugema Emerance',
        role: 'Advisor',
        department: 'Student Affairs',
        image: 'mukamugenga emmerance.jpg',
        email: 'emerancemukamugema77@gmail.com',
        phone: '0788815924',
        office: 'Student Affairs Office',
        bio_rw: 'Umujyanama w\'abanyeshuri akaba afasha mu mibanire y\'abanyeshuri, ababyeyi n\'umuryango',
        bio_en: 'Fostering positive relationship with parent, student and community',
        experience: 4,
        order: 2
      },
      {
        name: 'Masezerano Issac',
        role: 'DOS',
        department: 'Academic Affairs',
        image: 'masezerano issac DOS.jpeg',
        email: 'masezeranoisaac1@gmail.com',
        phone: '0780467323 / 0732287628',
        office: 'Academic Office',
        bio_rw: 'Umuyobozi w\'amasomo akaba ashinzwe gahunda z\'amasomo n\'imyigishirize',
        bio_en: 'Director of Studies overseeing academic programs and teaching',
        experience: 4,
        order: 3
      },
      {
        name: 'Mukandayisabye Emiliane',
        role: 'Accountant',
        department: 'Finance',
        image: 'accountant.jpg',
        email: 'emmanueltuyishime2020@gmail.com',
        phone: '0788622709 / 0735077312',
        office: 'Finance Office',
        bio_rw: 'Umubitsi w\'ishuri akaba ashinzwe imicungire y\'imari n\'ibaruramari',
        bio_en: 'Accountant services and other related services',
        experience: 4,
        order: 4
      },
      {
        name: 'Twizeyimana Jean Claude',
        role: 'Patron',
        department: 'Student Welfare',
        image: 'patron.jpg',
        email: 'jeanclaudetwizeyimana14@gmail.com',
        phone: '0783407691',
        office: 'Boys Hostel',
        bio_rw: 'Patron w\'abanyeshuri b\'abahungu akaba ashinzwe imibereho y\'abanyeshuri',
        bio_en: 'Boys patron overseeing male students welfare',
        experience: 4,
        order: 5
      },
      {
        name: 'Ishimwe Esther',
        role: 'Matron',
        department: 'Student Welfare',
        image: 'matron.png',
        email: 'eishimwe674@gmail.com',
        phone: '0787342430',
        office: 'Girls Hostel',
        bio_rw: 'Matron w\'abanyeshuri b\'abakobwa akaba ashinzwe imibereho y\'abanyeshuri',
        bio_en: 'Girls matron overseeing female students welfare',
        experience: 4,
        order: 6
      },
      {
        name: 'Mukamana Grace',
        role: 'DOD',
        department: 'Discipline',
        image: 'director of discpline dod.jpg',
        email: 'inganji777@gmail.com',
        phone: '0788000004',
        office: 'Discipline Office',
        bio_rw: 'Umuyobozi w\'imyitwarire akaba ashinzwe imyitwarire y\'abanyeshuri',
        bio_en: 'Director of Discipline managing student conduct',
        experience: 4,
        order: 7
      }
    ];

    // Insert leaders that have matching images
    for (const leader of leaders) {
      if (files.includes(leader.image)) {
        await conn.execute(
          `INSERT INTO leadership (name, role, department, biography_rw, biography_en, 
           email, phone, office_location, image_url, experience_years, status, display_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
          [
            leader.name,
            leader.role,
            leader.department,
            leader.bio_rw,
            leader.bio_en,
            leader.email,
            leader.phone,
            leader.office,
            `/uploads/leadership/${leader.image}`,
            leader.experience,
            leader.order
          ]
        );
        console.log(`✓ Added ${leader.name} - ${leader.role}`);
      } else {
        console.log(`✗ Image not found for ${leader.name}: ${leader.image}`);
      }
    }

    console.log('\n✓ Leadership sync complete!');
  } catch (error) {
    console.error('Error syncing leadership:', error);
  } finally {
    await conn.end();
  }
}

syncLeadership();
