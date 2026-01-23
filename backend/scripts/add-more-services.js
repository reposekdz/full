const mysql = require('mysql2/promise');

async function addMoreServices() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Adding more services...');
    
    const services = [
      {
        name: 'Counseling Services',
        name_rw: 'Serivisi z\'Ubujyanama',
        category: 'counseling',
        description: 'Professional counseling and guidance for students',
        description_rw: 'Ubujyanama n\'ubuyobozi bw\'abanyeshuri',
        full_details_rw: `SERIVISI Z'UBUJYANAMA - UBUFASHA BW'ABANYESHURI

Dufite abajyanama babifitiye ubumenyi bafasha abanyeshuri mu bibazo byabo. Ubujyanama bufasha abanyeshuri gukemura ibibazo by'amasomo, imibereho n'indi mibanire.

IBIRANGA SERIVISI Z'UBUJYANAMA:
• Abajyanama Babifitiye Ubumenyi - Abajyanama 4 bafite ubushobozi
• Ubujyanama bw'Amasomo - Gufasha abanyeshuri mu masomo
• Ubujyanama bw'Imibereho - Gufasha mu bibazo by'imibereho
• Ubujyanama bw'Umwuga - Gufasha guhitamo umwuga
• Serivisi z'Ibanga - Ibanga ryubahirizwa cyane
• Igihe Kinini - Ifungura buri gihe

SERIVISI ZITANGWA:
1. Ubujyanama ku Giti - Guganira n'umujyanama wenyine
2. Ubujyanama mu Matsinda - Guganira mu matsinda
3. Ubujyanama bw'Ababyeyi - Gufasha ababyeyi
4. Gukurikirana - Gukurikirana abanyeshuri
5. Crisis Intervention - Ubufasha mu bihe bigoye
6. Career Guidance - Ubuyobozi bw'umwuga

INYUNGU:
✓ Gukemura ibibazo vuba
✓ Kubona ubufasha bw'abahanga
✓ Kwiga neza
✓ Kugira ubuzima bwiza
✓ Guhitamo umwuga mwiza`,
        icon: 'HelpCircle',
        price: 0,
        duration: 'Umwaka wose',
        availability: 'available',
        contact_person: 'Niyonkuru Patrick',
        contact_email: 'counseling@garden-tvet.rw',
        contact_phone: '+250 788 333 444',
        location: 'Counseling Office, Block A',
        schedule: JSON.stringify({
          monday: '08:00-17:00',
          tuesday: '08:00-17:00',
          wednesday: '08:00-17:00',
          thursday: '08:00-17:00',
          friday: '08:00-17:00',
          saturday: '09:00-12:00',
          sunday: 'Closed'
        }),
        features: JSON.stringify([
          'Abajyanama babifitiye ubumenyi',
          'Ubujyanama bw\'amasomo',
          'Ubujyanama bw\'imibereho',
          'Career guidance',
          'Serivisi z\'ibanga',
          'Crisis intervention'
        ]),
        requirements: JSON.stringify([
          'ID Card',
          'Gusaba ubujyanama',
          'Kubahiriza ibanga'
        ]),
        benefits: JSON.stringify([
          'Gukemura ibibazo',
          'Kubona ubufasha',
          'Kwiga neza',
          'Kugira ubuzima bwiza'
        ])
      },
      {
        name: 'Transport Services',
        name_rw: 'Serivisi z\'Ubwikorezi',
        category: 'transport',
        description: 'Safe and reliable transport for students',
        description_rw: 'Ubwikorezi bwizewe bw\'abanyeshuri',
        full_details_rw: `SERIVISI Z'UBWIKOREZI - UBWIKOREZI BW'ABANYESHURI

Dufite serivisi z'ubwikorezi zizewe zifasha abanyeshuri kugera ku ishuri no gusubira mu rugo. Dufite amabus akomeye kandi afite umutekano.

IBIRANGA SERIVISI Z'UBWIKOREZI:
• Amabus Akomeye - Amabus 10 akomeye
• Abashoferi Babifitiye Ubumenyi - Abashoferi 15 bafite ubushobozi
• Umutekano - Umutekano w'abanyeshuri ni ingenzi
• Igihe Cyizewe - Amabus agera ku gihe
• Inzira Nyinshi - Inzira 20 zitandukanye
• Igiciro Gihendutse - Igiciro gihendutse ku banyeshuri

SERIVISI ZITANGWA:
1. Ubwikorezi bwa Buri Munsi - Kugera ku ishuri no gusubira
2. Ubwikorezi bw'Ikiruhuko - Ubwikorezi ku wa gatandatu
3. Ubwikorezi bw'Ibihe Byihariye - Ubwikorezi mu bihe byihariye
4. Gukurikirana - GPS tracking ku mabus yose

INZIRA:
• Kigali City - 5 inzira
• Gasabo - 4 inzira
• Kicukiro - 4 inzira
• Nyarugenge - 3 inzira
• Suburbs - 4 inzira

INYUNGU:
✓ Umutekano w'abanyeshuri
✓ Kugera ku gihe
✓ Igiciro gihendutse
✓ Ubwikorezi bwizewe`,
        icon: 'Bus',
        price: 15000,
        duration: 'Ukwezi',
        availability: 'available',
        contact_person: 'Habimana Emmanuel',
        contact_email: 'transport@garden-tvet.rw',
        contact_phone: '+250 788 444 555',
        location: 'Transport Office, Main Gate',
        schedule: JSON.stringify({
          monday: '06:00-19:00',
          tuesday: '06:00-19:00',
          wednesday: '06:00-19:00',
          thursday: '06:00-19:00',
          friday: '06:00-19:00',
          saturday: '07:00-14:00',
          sunday: 'Closed'
        }),
        features: JSON.stringify([
          'Amabus akomeye',
          'Abashoferi babifitiye ubumenyi',
          'GPS tracking',
          'Umutekano',
          'Inzira nyinshi',
          'Igiciro gihendutse'
        ]),
        requirements: JSON.stringify([
          'ID Card',
          'Kwishyura',
          'Gukurikiza amategeko'
        ]),
        benefits: JSON.stringify([
          'Umutekano',
          'Kugera ku gihe',
          'Igiciro gihendutse',
          'Ubwikorezi bwizewe'
        ])
      },
      {
        name: 'Cafeteria Services',
        name_rw: 'Serivisi z\'Ibiryo',
        category: 'cafeteria',
        description: 'Healthy and nutritious meals for students',
        description_rw: 'Ibiryo byiza kandi bifite intungamubiri',
        full_details_rw: `SERIVISI Z'IBIRYO - IBIRYO BY'ABANYESHURI

Dufite cafeteria ikomeye itanga ibiryo byiza kandi bifite intungamubiri. Abanyeshuri bashobora kubona ifunguro rya mu gitondo, rya saa sita n'iry'umugoroba.

IBIRANGA CAFETERIA:
• Ibiryo Byiza - Ibiryo byiza kandi bifite intungamubiri
• Abateka Babifitiye Ubumenyi - Abateka 8 bafite ubushobozi
• Isuku - Isuku y'ibiryo ni ingenzi
• Igiciro Gihendutse - Igiciro gihendutse ku banyeshuri
• Menu Itandukanye - Menu itandukanye buri munsi
• Ahantu Hanini - Ahantu ho kurya hanini

IFUNGURO RITANGWA:
1. Ifunguro rya Mu Gitondo - 7:00-9:00
2. Ifunguro rya Saa Sita - 12:00-14:00
3. Ifunguro ry'Umugoroba - 18:00-20:00
4. Snacks - Snacks zitandukanye

MENU:
• Ku wa mbere - Umuceri n'isosi
• Ku wa kabiri - Ibirayi n'inyama
• Ku wa gatatu - Ibishyimbo n'umugati
• Ku wa kane - Pasta n'isosi
• Ku wa gatanu - Pilau n'inyama

INYUNGU:
✓ Ibiryo byiza
✓ Intungamubiri
✓ Igiciro gihendutse
✓ Menu itandukanye`,
        icon: 'Utensils',
        price: 25000,
        duration: 'Ukwezi',
        availability: 'available',
        contact_person: 'Mukamana Alice',
        contact_email: 'cafeteria@garden-tvet.rw',
        contact_phone: '+250 788 555 666',
        location: 'Cafeteria Building',
        schedule: JSON.stringify({
          monday: '07:00-20:00',
          tuesday: '07:00-20:00',
          wednesday: '07:00-20:00',
          thursday: '07:00-20:00',
          friday: '07:00-20:00',
          saturday: '08:00-15:00',
          sunday: 'Closed'
        }),
        features: JSON.stringify([
          'Ibiryo byiza',
          'Abateka babifitiye ubumenyi',
          'Isuku',
          'Menu itandukanye',
          'Igiciro gihendutse',
          'Ahantu hanini'
        ]),
        requirements: JSON.stringify([
          'ID Card',
          'Kwishyura',
          'Kubahiriza isuku'
        ]),
        benefits: JSON.stringify([
          'Ibiryo byiza',
          'Intungamubiri',
          'Igiciro gihendutse',
          'Menu itandukanye'
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

    console.log('✓ Additional services added successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addMoreServices().catch(console.error);
