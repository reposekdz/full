const mysql = require('mysql2/promise');

async function setupServices() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Creating school_services table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS school_services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        name_rw VARCHAR(255) NOT NULL,
        category ENUM('academic', 'health', 'transport', 'library', 'counseling', 'cafeteria', 'hostel', 'sports', 'technology', 'other') NOT NULL,
        description TEXT,
        description_rw TEXT,
        full_details LONGTEXT,
        full_details_rw LONGTEXT,
        icon VARCHAR(100),
        image_url VARCHAR(500),
        price DECIMAL(10,2),
        duration VARCHAR(100),
        availability ENUM('available', 'limited', 'unavailable') DEFAULT 'available',
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        location VARCHAR(255),
        schedule JSON,
        features JSON,
        requirements JSON,
        benefits JSON,
        is_active BOOLEAN DEFAULT true,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Creating service_requests table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_id INT NOT NULL,
        user_id INT,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255),
        student_phone VARCHAR(20),
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        request_type ENUM('inquiry', 'booking', 'complaint', 'feedback') DEFAULT 'inquiry',
        message TEXT,
        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES school_services(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_service (service_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Inserting comprehensive services data...');
    
    const services = [
      {
        name: 'Library Services',
        name_rw: 'Serivisi z\'Isomero',
        category: 'library',
        description: 'Access to extensive collection of books, digital resources, and study spaces',
        description_rw: 'Kubona ibitabo byinshi, ibikoresho bya digitale n\'ahantu ho kwiga',
        full_details_rw: `SERIVISI Z'ISOMERO - ISOMERO RIKOMEYE RY'ISHURI

Isomero ryacu rifite ibitabo byinshi, ibikoresho bya digitale, n'ahantu heza ho kwiga. Abanyeshuri bashobora kubona ibitabo by'amasomo, ibitabo by'ubumenyi, n'ibindi bikoresho byinshi.

IBIRANGA ISOMERO:
• Ibitabo byinshi - Ibitabo 5000+ by'amasomo n'ubumenyi
• Ibikoresho bya Digitale - Mudasobwa 50+ n'internet yihuse
• Ahantu ho Kwiga - Ameza 100+ n'intebe zinoze
• Abakozi Babifitiye Ubumenyi - Abakozi 5 bafasha abanyeshuri
• Igihe Kinini - Ifungura kuva saa 2 kugeza saa 10
• Serivisi za Online - Gusaba ibitabo online no kubona inyandiko

IBYICIRO BY'IBITABO:
1. Ibitabo by'Amasomo - Ibitabo byose by'amasomo y'ishuri
2. Ibitabo by'Ubumenyi - Ibitabo by'ubumenyi mu byiciro byose
3. Ibitabo by'Imyuga - Ibitabo by'imyuga n'ikoranabuhanga
4. Magazines na Journals - Ibinyamakuru n'ibitabo by'ubushakashatsi
5. Digital Resources - Inyandiko za PDF, amavideo n'ibindi

SERIVISI ZITANGWA:
• Guhagarika Ibitabo - Abanyeshuri bashobora guhagarika ibitabo iminsi 14
• Gusoma mu Isomero - Ahantu heza ho gusoma no kwiga
• Ubufasha bwo Gushakisha - Abakozi bafasha gushakisha ibitabo
• Amahugurwa - Amahugurwa yo gukoresha isomero neza
• Printing & Scanning - Serivisi zo gucapa no gusikana
• Internet Access - Internet yihuse ku banyeshuri bose

AMATEGEKO Y'ISOMERO:
1. Kwinjira mu isomero - Abanyeshuri bagomba kugira ID card
2. Guhagarika ibitabo - Ibitabo bishobora guhagarikwa iminsi 14
3. Gusubiza ibitabo - Ibitabo bigomba gusubizwa ku gihe
4. Gucapa - Gucapa bihenze 50 RWF ku rupapuro
5. Gusoma - Gusoma mu isomero ni ubuntu

INYUNGU Z'ABANYESHURI:
✓ Kubona ibitabo byinshi by'ubuntu
✓ Kwiga mu buryo bworoshye
✓ Gukoresha mudasobwa n'internet
✓ Kubona ubufasha bw'abakozi
✓ Kwiga mu buryo bwigenga
✓ Gutegura ibizamini neza`,
        icon: 'BookOpen',
        price: 0,
        duration: 'Umwaka wose',
        availability: 'available',
        contact_person: 'Mukamana Grace',
        contact_email: 'library@garden-tvet.rw',
        contact_phone: '+250 788 111 222',
        location: 'Library Building, Ground Floor',
        schedule: JSON.stringify({
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '09:00-13:00',
          sunday: 'Closed'
        }),
        features: JSON.stringify([
          '5000+ ibitabo',
          '50+ mudasobwa',
          'Internet yihuse',
          'Ahantu ho kwiga',
          'Printing & Scanning',
          'Digital Resources'
        ]),
        requirements: JSON.stringify([
          'ID Card y\'ishuri',
          'Kwiyandikisha mu isomero',
          'Kubahiriza amategeko'
        ]),
        benefits: JSON.stringify([
          'Kubona ibitabo by\'ubuntu',
          'Kwiga mu buryo bworoshye',
          'Gukoresha mudasobwa',
          'Kubona ubufasha'
        ])
      },
      {
        name: 'Health Services',
        name_rw: 'Serivisi z\'Ubuzima',
        category: 'health',
        description: 'Comprehensive healthcare services for students',
        description_rw: 'Serivisi z\'ubuzima zuzuye ku banyeshuri',
        full_details_rw: `SERIVISI Z'UBUZIMA - UBUZIMA BW'ABANYESHURI

Ishuri rifite serivisi z'ubuzima zuzuye zifasha abanyeshuri kubona ubufasha bw'ubuzima. Dufite abaganga, abaforomo n'ibikoresho by'ubuzima.

IBIRANGA SERIVISI Z'UBUZIMA:
• Kliniki y'Ishuri - Kliniki ifite ibikoresho byose
• Abaganga Babifitiye Ubumenyi - Abaganga 3 n'abaforomo 5
• Imiti Yose - Imiti y'indwara zose
• Serivisi za Byihutirwa - Serivisi 24/7 ku bibazo by'ubuzima
• Ubujyanama bw'Ubuzima - Ubujyanama ku buzima bw'abanyeshuri
• Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana

SERIVISI ZITANGWA:
1. Kuvura Indwara - Kuvura indwara zose z'abanyeshuri
2. Gukurikirana Ubuzima - Gukurikirana ubuzima bwa buri mwana
3. Vaccination - Inkingo zose zikenewe
4. First Aid - Ubufasha bwa mbere ku bibazo by'ubuzima
5. Mental Health - Ubujyanama ku buzima bwo mu mutwe
6. Dental Care - Kuvura amenyo

IGIHE CY'AKAZI:
• Ku cyumweru - Saa 2 kugeza saa 10
• Ku wa gatandatu - Saa 3 kugeza saa 7
• Emergency - 24/7

AMATEGEKO:
1. Abanyeshuri bagomba kugira insurance
2. Kuja kwa muganga bifite ID card
3. Gukurikiza inama z'abaganga
4. Kunywa imiti nk'uko byateganyijwe

INYUNGU:
✓ Kubona ubufasha bw'ubuzima vuba
✓ Kuvurwa indwara zose
✓ Gukurikirana ubuzima
✓ Kubona ubujyanama
✓ Serivisi z'ubuntu`,
        icon: 'Heart',
        price: 0,
        duration: 'Umwaka wose',
        availability: 'available',
        contact_person: 'Dr. Uwera Christine',
        contact_email: 'health@garden-tvet.rw',
        contact_phone: '+250 788 222 333',
        location: 'Health Center, Block B',
        schedule: JSON.stringify({
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '09:00-13:00',
          sunday: 'Emergency Only'
        }),
        features: JSON.stringify([
          'Kliniki ikomeye',
          'Abaganga babifitiye ubumenyi',
          'Imiti yose',
          'Serivisi 24/7',
          'Mental health support',
          'Dental care'
        ]),
        requirements: JSON.stringify([
          'ID Card',
          'Insurance card',
          'Parent consent (for minors)'
        ]),
        benefits: JSON.stringify([
          'Ubufasha bw\'ubuzima vuba',
          'Kuvurwa indwara',
          'Gukurikirana ubuzima',
          'Serivisi z\'ubuntu'
        ])
      }
    ];

    for (const service of services) {
      await connection.query(
        `INSERT INTO school_services 
         (name, name_rw, category, description, description_rw, full_details_rw, icon, price, duration, availability, 
          contact_person, contact_email, contact_phone, location, schedule, features, requirements, benefits) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          service.name, service.name_rw, service.category, service.description, service.description_rw,
          service.full_details_rw, service.icon, service.price, service.duration, service.availability,
          service.contact_person, service.contact_email, service.contact_phone, service.location,
          service.schedule, service.features, service.requirements, service.benefits
        ]
      );
    }

    console.log('✓ Services setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupServices().catch(console.error);
