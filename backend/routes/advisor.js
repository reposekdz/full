const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/advisor/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET comprehensive advisor dashboard data
router.get('/dashboard', authenticateToken, requireRole('advisor', 'admin', 'headmaster'), async (req, res) => {
  try {
    const [advisor] = await pool.execute(
      'SELECT * FROM leadership WHERE role = "advisor" AND status = "active" LIMIT 1'
    );

    if (!advisor.length) {
      return res.status(404).json({ success: false, message: 'Advisor not found' });
    }

    // Get comprehensive advisor data with full Kinyarwanda content
    const advisorData = {
      ...advisor[0],
      
      // Full advisor profile in Kinyarwanda
      profile_kinyarwanda: {
        igicucu: "Mukamugema Emerance",
        umurimo: "Umujyanama w'Uburezi",
        ishuri: "Ishuri Rikuru rya Garden TVET",
        ubunararibonye: "Imyaka 8 y'ubunararibonye mu gufasha abanyeshuri",
        
        incamake_y_ubuzima: `
        Mukamugema Emerance ni umujyanama w'uburezi ukomeye cyane mu ishuri rya Garden TVET School. 
        Afite ubunararibonye bw'imyaka 8 mu gufasha abanyeshuri kugera ku ntego zabo z'amashuri n'umwuga. 
        Yize cyane mu by'uburezi kandi afite impamyabumenyi nyinshi zijyanye n'ubujyanama bw'abanyeshuri.
        
        Mukamugema yitangiye akazi ke mu 2016 nk'umujyanama w'abanyeshuri mu mashuri atandukanye. 
        Yagize uruhare runini mu gufasha abanyeshuri benshi kugera ku ntego zabo. Afite ubushobozi 
        bw'ihariye bwo kumva ibibazo by'abanyeshuri no kubafasha gukemura ibibazo byabo.
        
        Mu gihe cy'imyaka 8, yafashije abanyeshuri barenga 2000 mu gukemura ibibazo byabo by'amashuri, 
        ubuzima, n'umwuga. Afite ubumenyi bw'ihariye mu gufasha abanyeshuri bafite ibibazo by'ubwoba, 
        ubwoba bwo kwiga, n'ibibazo by'ubuzima bwabo.
        
        Mukamugema ni umuntu ukunda cyane akazi ke kandi yitangiye cyane mu gufasha abanyeshuri. 
        Afite ubushobozi bw'ihariye bwo guhuza abanyeshuri n'ababyeyi babo kugira ngo babone 
        ubufasha bukwiye. Ni umuntu ukomeye cyane mu gufasha abanyeshuri gukemura ibibazo byabo.
        `,
        
        amahugurwa: [
          "Impamyabumenyi y'Icyiciro cya Kabiri mu Burezi (Master of Education)",
          "Impamyabumenyi y'Icyiciro cya Mbere mu Bujyanama (Bachelor in Counseling Psychology)", 
          "Impamyabumenyi mu Bujyanama bw'Abanyeshuri (Student Counseling Certificate)",
          "Amahugurwa mu Gufasha Abanyeshuri (Student Support Training)",
          "Amahugurwa mu Gukemura Amakimbirane (Conflict Resolution Training)"
        ],
        
        ubushobozi: [
          "Ubujyanama bw'amashuri - Gufasha abanyeshuri mu by'amashuri",
          "Ubujyanama bw'umwuga - Gufasha abanyeshuri guhitamo umwuga",
          "Gufasha mu buzima bwite - Gukemura ibibazo by'ubuzima",
          "Gufasha mu kwiga - Menya uburyo bwo kwiga neza",
          "Gushyiraho intego - Gufasha abanyeshuri gushyiraho intego",
          "Gufasha ababyeyi - Guhuza ababyeyi n'abanyeshuri",
          "Gukemura amakimbirane - Gukemura ibibazo hagati y'abanyeshuri",
          "Gufasha mu by'ubuzima - Gufasha abanyeshuri mu buzima bwabo"
        ]
      },

      // Services offered in Kinyarwanda
      serivisi_zitangwa: {
        ubujyanama_bw_amashuri: {
          izina: "Ubujyanama bw'Amashuri",
          ibisobanuro: `
          Iki ni ubujyanama bwite bujyanye n'amashuri. Dufasha abanyeshuri gukemura ibibazo byabo 
          by'amashuri nko kutamenya icyo bagomba kwiga, kutamenya uburyo bwo kwiga neza, no gufata 
          ibyemezo by'amashuri. Tubafasha gushyiraho intego z'amashuri no gukurikirana uko bazigera.
          
          Mu bujyanama bw'amashuri, tubafasha:
          - Guhitamo amasomo bakwiye kwiga
          - Gukora gahunda y'amashuri
          - Gukemura ibibazo by'amanota
          - Gufasha mu kwiga neza
          - Gukurikirana uko bagenda mu mashuri
          `,
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11",
          aho_bibera: "Ibiro by'Ubujyanama bw'Abanyeshuri"
        },
        
        ubujyanama_bw_umwuga: {
          izina: "Ubujyanama bw'Umwuga", 
          ibisobanuro: `
          Iki ni ubujyanama bujyanye no guhitamo umwuga. Dufasha abanyeshuri kumenya umwuga 
          bakwiye gukora nyuma y'amashuri. Tubafasha kumenya ubushobozi bwabo, inyungu zabo, 
          n'amahirwe y'akazi ariho mu gihugu.
          
          Mu bujyanama bw'umwuga, tubafasha:
          - Guhitamo umwuga ukwiye
          - Kumenya ubushobozi bwabo
          - Gukora CV n'ibaruwa z'ubusabe
          - Gushaka amahirwe y'akazi
          - Gutegura ikiganiro cy'akazi
          `,
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11", 
          aho_bibera: "Ibiro by'Ubujyanama bw'Abanyeshuri"
        },
        
        ubufasha_mu_buzima: {
          izina: "Ubufasha mu Buzima Bwite",
          ibisobanuro: `
          Iki ni ubufasha bujyanye n'ubuzima bw'abanyeshuri. Dufasha abanyeshuri gukemura 
          ibibazo byabo by'ubuzima nko guhangayika, ubwoba, gucika intege, n'ibibazo by'ubusabane.
          
          Mu bufasha mu buzima, tubafasha:
          - Gukemura ubwoba n'ubwoba
          - Gufasha abafite ubwoba bwo kwiga
          - Gukemura ibibazo by'ubusabane
          - Gufasha mu gucika intege
          - Gufasha mu ibibazo by'umuryango
          `,
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11",
          aho_bibera: "Icyumba cy'ubujyanama (cyihishe)"
        }
      },

      // Parent integration services
      serivisi_z_ababyeyi: {
        ubutumire_bw_ababyeyi: {
          izina: "Ubutumire bw'Ababyeyi",
          ibisobanuro: `
          Dufasha ababyeyi kumenya uko abana babo bagenda mu mashuri. Tubatumira mu nama 
          zijyanye n'iterambere ry'abana babo. Tubafasha kumenya ibibazo abana babo bafite 
          no kubafasha kubikemura.
          
          Mu butumire bw'ababyeyi:
          - Tubabwira uko abana babo bagenda mu mashuri
          - Tubafasha gukemura ibibazo by'abana babo
          - Tubafasha gufasha abana babo mu rugo
          - Tubafasha guhuza n'abarimu b'abana babo
          `,
          igihe: "Buri cyumweru ku wa gatatu, saa 8 kugeza saa 10"
        },
        
        inama_z_ababyeyi: {
          izina: "Inama z'Ababyeyi",
          ibisobanuro: `
          Dukora inama z'ababyeyi aho tubagezaho amakuru y'ishuri n'iterambere ry'abana babo. 
          Mu nama, tubafasha kumenya uburyo bwo gufasha abana babo mu rugo no mu mashuri.
          
          Mu nama z'ababyeyi:
          - Tubabwira politiki z'ishuri
          - Tubafasha kumenya iterambere ry'abana babo
          - Tubafasha gukemura ibibazo by'abana babo
          - Tubafasha guhuza n'abarimu
          `,
          igihe: "Buri kwezi rimwe, ku wa gatandatu"
        }
      },

      // School management features
      imicungire_y_ishuri: {
        gukurikirana_abanyeshuri: {
          izina: "Gukurikirana Abanyeshuri",
          ibisobanuro: `
          Dukurikirana abanyeshuri bose mu ishuri kugira ngo tumenye uko bagenda. Dufasha 
          abanyeshuri bafite ibibazo no kubafasha kubikemura. Dukora raporo z'iterambere 
          ry'abanyeshuri.
          
          Mu gukurikirana abanyeshuri:
          - Dukurikirana amanota yabo
          - Dukurikirana kwitabira kwabo amasomo
          - Dukurikirana imyitwarire yabo
          - Dufasha abafite ibibazo
          `,
          igihe: "Buri munsi"
        },
        
        gukemura_amakimbirane: {
          izina: "Gukemura Amakimbirane",
          ibisobanuro: `
          Dufasha gukemura amakimbirane hagati y'abanyeshuri, hagati y'abanyeshuri n'abarimu, 
          n'amakimbirane y'ubundi bwoko. Dukoresha uburyo bw'amahoro mu gukemura amakimbirane.
          
          Mu gukemura amakimbirane:
          - Dukurikirana amakimbirane yose
          - Dufasha abagize amakimbirane kubana neza
          - Dufasha gukemura ibibazo byavuye mu makimbirane
          - Dufasha kubana neza mu ishuri
          `,
          igihe: "Igihe cyose hakenewe"
        }
      },

      // Communication channels
      uburyo_bwo_kuvugana: [
        {
          ubwoko: "Telefoni",
          agaciro: "+250788000000",
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11",
          ibisobanuro: "Mwahamagara igihe cyose mukeneye ubufasha"
        },
        {
          ubwoko: "Email",
          agaciro: "emerancemukamugema77@gmail.com", 
          igihe: "Igihe cyose",
          ibisobanuro: "Mwohereze email mukeneye ubufasha cyangwa gusaba ikiganiro"
        },
        {
          ubwoko: "Ibiro",
          agaciro: "Ibiro by'Ubujyanama bw'Abanyeshuri",
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11",
          ibisobanuro: "Mwuje mu biro byacu mukeneye ubufasha bw'imbonankubone"
        },
        {
          ubwoko: "WhatsApp",
          agaciro: "+250788000000",
          igihe: "Kuwa mbere kugeza kuwa gatanu, saa 2 kugeza saa 11", 
          ibisobanuro: "Mwohereze ubutumwa kuri WhatsApp mukeneye ubufasha bwihuse"
        }
      ],

      // Detailed schedule in Kinyarwanda
      gahunda_y_akazi: {
        kuwa_mbere: {
          izina: "Kuwa Mbere",
          ibikorwa: [
            { igihe: "Saa 2:00 - 2:30", igikorwa: "Gusoma ubutumwa bw'ababyeyi" },
            { igihe: "Saa 2:30 - 4:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 4:00 - 4:30", igikorwa: "Kuraguza" },
            { igihe: "Saa 4:30 - 6:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 6:00 - 7:00", igikorwa: "Gukora raporo" },
            { igihe: "Saa 7:00 - 8:00", igikorwa: "Gusubiza ababyeyi" },
            { igihe: "Saa 8:00 - 9:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 9:00 - 10:00", igikorwa: "Gukurikirana abanyeshuri" },
            { igihe: "Saa 10:00 - 11:00", igikorwa: "Gukora raporo y'umunsi" }
          ]
        },
        kuwa_kabiri: {
          izina: "Kuwa Kabiri", 
          ibikorwa: [
            { igihe: "Saa 2:00 - 3:00", igikorwa: "Inama n'abarimu" },
            { igihe: "Saa 3:00 - 5:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 5:00 - 6:00", igikorwa: "Gukemura amakimbirane" },
            { igihe: "Saa 6:00 - 8:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 8:00 - 9:00", igikorwa: "Gusubiza ababyeyi" },
            { igihe: "Saa 9:00 - 10:00", igikorwa: "Gukurikirana abanyeshuri" },
            { igihe: "Saa 10:00 - 11:00", igikorwa: "Gukora raporo y'umunsi" }
          ]
        },
        kuwa_gatatu: {
          izina: "Kuwa Gatatu",
          ibikorwa: [
            { igihe: "Saa 2:00 - 4:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 4:00 - 5:00", igikorwa: "Gukora raporo" },
            { igihe: "Saa 5:00 - 7:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 7:00 - 8:00", igikorwa: "Gusubiza ababyeyi" },
            { igihe: "Saa 8:00 - 10:00", igikorwa: "Inama z'ababyeyi" },
            { igihe: "Saa 10:00 - 11:00", igikorwa: "Gukora raporo y'umunsi" }
          ]
        },
        kuwa_kane: {
          izina: "Kuwa Kane",
          ibikorwa: [
            { igihe: "Saa 2:00 - 3:00", igikorwa: "Gusoma ubutumwa" },
            { igihe: "Saa 3:00 - 5:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 5:00 - 6:00", igikorwa: "Gukemura amakimbirane" },
            { igihe: "Saa 6:00 - 8:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 8:00 - 9:00", igikorwa: "Gusubiza ababyeyi" },
            { igihe: "Saa 9:00 - 10:00", igikorwa: "Gukurikirana abanyeshuri" },
            { igihe: "Saa 10:00 - 11:00", igikorwa: "Gukora raporo y'umunsi" }
          ]
        },
        kuwa_gatanu: {
          izina: "Kuwa Gatanu",
          ibikorwa: [
            { igihe: "Saa 2:00 - 4:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 4:00 - 5:00", igikorwa: "Gukora raporo y'icyumweru" },
            { igihe: "Saa 5:00 - 7:00", igikorwa: "Ubujyanama bw'abanyeshuri" },
            { igihe: "Saa 7:00 - 8:00", igikorwa: "Gusubiza ababyeyi" },
            { igihe: "Saa 8:00 - 9:00", igikorwa: "Gukurikirana abanyeshuri" },
            { igihe: "Saa 9:00 - 10:00", igikorwa: "Gukora raporo y'icyumweru" }
          ]
        }
      }
    };

    res.json({ success: true, advisor: advisorData });
  } catch (error) {
    console.error('Error fetching advisor dashboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching advisor data' });
  }
});

// GET parent messages for advisor
router.get('/messages/parents', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
             CONCAT(u.first_name, ' ', u.last_name) as parent_name,
             u.phone as parent_phone,
             u.email as parent_email,
             s.first_name as student_first_name,
             s.last_name as student_last_name,
             s.student_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN users s ON u.id = s.parent_id
      WHERE m.receiver_role = 'advisor' OR m.message_type = 'parent_to_advisor'
      ORDER BY m.created_at DESC
      LIMIT 100
    `);

    const messagesWithKinyarwanda = messages.map(msg => ({
      ...msg,
      kinyarwanda_content: {
        ubwoko_bw_ubutumwa: getMessageTypeKinyarwanda(msg.message_type),
        aho_bukomoka: `Ubutumwa bukomoka kuri ${msg.parent_name}`,
        ijambo_ry_ingenzi: extractKeywords(msg.content),
        icyifuzo: determineParentRequest(msg.content),
        igikoresho_cyo_gusubiza: getResponseTemplate(msg.message_type)
      }
    }));

    res.json({ success: true, messages: messagesWithKinyarwanda });
  } catch (error) {
    console.error('Error fetching parent messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

// POST reply to parent message
router.post('/messages/reply', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const { message_id, reply_content, parent_id } = req.body;

    // Insert reply
    const [result] = await pool.execute(`
      INSERT INTO messages (sender_id, receiver_id, content, message_type, parent_message_id, created_at)
      VALUES (?, ?, ?, 'advisor_to_parent', ?, NOW())
    `, [req.user.id, parent_id, reply_content, message_id]);

    // Update original message status
    await pool.execute(`
      UPDATE messages SET status = 'replied', replied_at = NOW() WHERE id = ?
    `, [message_id]);

    res.json({ success: true, message: 'Ubutumwa bwoherejwe neza', reply_id: result.insertId });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ success: false, message: 'Error sending reply' });
  }
});

// GET school services managed by advisor
router.get('/services', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const services = {
      serivisi_z_ubujyanama: {
        izina: "Serivisi z'Ubujyanama",
        ibisobanuro: `
        Izi ni serivisi zose z'ubujyanama zitangwa n'ishuri. Zirimo ubujyanama bw'amashuri, 
        ubujyanama bw'umwuga, ubufasha mu buzima, n'ubundi bujyanama bukenewe n'abanyeshuri.
        `,
        serivisi: [
          {
            izina: "Ubujyanama bw'Amashuri",
            ibisobanuro: "Gufasha abanyeshuri mu by'amashuri",
            abanyeshuri_bafashijwe: 450,
            igipimo_cy_ubwiyunge: "95%"
          },
          {
            izina: "Ubujyanama bw'Umwuga", 
            ibisobanuro: "Gufasha abanyeshuri guhitamo umwuga",
            abanyeshuri_bafashijwe: 320,
            igipimo_cy_ubwiyunge: "92%"
          },
          {
            izina: "Ubufasha mu Buzima",
            ibisobanuro: "Gufasha abanyeshuri mu buzima bwabo",
            abanyeshuri_bafashijwe: 280,
            igipimo_cy_ubwiyunge: "88%"
          }
        ]
      },

      serivisi_z_ababyeyi: {
        izina: "Serivisi z'Ababyeyi",
        ibisobanuro: `
        Izi ni serivisi zitangirwa ababyeyi kugira ngo bafashe abana babo neza. Zirimo 
        inama z'ababyeyi, ubujyanama bw'ababyeyi, n'ubufasha mu gufasha abana mu rugo.
        `,
        serivisi: [
          {
            izina: "Inama z'Ababyeyi",
            ibisobanuro: "Inama z'ababyeyi ku iterambere ry'abana",
            ababyeyi_bitabiriye: 180,
            igipimo_cy_ubwiyunge: "90%"
          },
          {
            izina: "Ubujyanama bw'Ababyeyi",
            ibisobanuro: "Gufasha ababyeyi gufasha abana babo",
            ababyeyi_bafashijwe: 120,
            igipimo_cy_ubwiyunge: "85%"
          }
        ]
      },

      serivisi_z_abarimu: {
        izina: "Serivisi z'Abarimu",
        ibisobanuro: `
        Izi ni serivisi zifasha abarimu gufasha abanyeshuri neza. Zirimo amahugurwa 
        y'abarimu, ubujyanama bw'abarimu, n'ubufasha mu gukemura ibibazo by'abanyeshuri.
        `,
        serivisi: [
          {
            izina: "Amahugurwa y'Abarimu",
            ibisobanuro: "Gufasha abarimu kumenya uburyo bwo gufasha abanyeshuri",
            abarimu_bahuguwe: 45,
            igipimo_cy_ubwiyunge: "93%"
          },
          {
            izina: "Ubujyanama bw'Abarimu",
            ibisobanuro: "Gufasha abarimu gukemura ibibazo by'abanyeshuri",
            abarimu_bafashijwe: 38,
            igipimo_cy_ubwiyunge: "89%"
          }
        ]
      }
    };

    res.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

// Helper functions
function getMessageTypeKinyarwanda(type) {
  const types = {
    'parent_inquiry': 'Ikibazo cy\'umubyeyi',
    'student_issue': 'Ikibazo cy\'umunyeshuri', 
    'academic_concern': 'Ikibazo cy\'amashuri',
    'behavioral_issue': 'Ikibazo cy\'imyitwarire',
    'general_question': 'Ikibazo rusange'
  };
  return types[type] || 'Ubutumwa busanzwe';
}

function extractKeywords(content) {
  const keywords = {
    'amanota': ['amanota', 'ibipimo', 'amashuri'],
    'imyitwarire': ['imyitwarire', 'amakimbirane', 'ibibazo'],
    'ubuzima': ['ubuzima', 'ubwoba', 'gucika intege'],
    'umwuga': ['umwuga', 'akazi', 'ejo hazaza']
  };
  
  for (let [key, words] of Object.entries(keywords)) {
    if (words.some(word => content.toLowerCase().includes(word))) {
      return key;
    }
  }
  return 'ibindi';
}

function determineParentRequest(content) {
  if (content.includes('amanota') || content.includes('amashuri')) {
    return 'Umubyeyi ashaka kumenya ku iterambere ry\'umwana we mu mashuri';
  }
  if (content.includes('imyitwarire') || content.includes('ibibazo')) {
    return 'Umubyeyi afite ikibazo ku myitwarire y\'umwana we';
  }
  if (content.includes('ubuzima') || content.includes('ubwoba')) {
    return 'Umubyeyi ashaka ubufasha ku buzima bw\'umwana we';
  }
  return 'Umubyeyi afite ikibazo rusange';
}

function getResponseTemplate(type) {
  const templates = {
    'parent_inquiry': `
    Muraho [Izina ry'umubyeyi],
    
    Murakoze kubaza ku [ikibazo]. Twabonye ikibazo cyanyu kandi tuzakibana neza.
    
    Ku kibazo cyanyu:
    [Igisubizo]
    
    Murakoze,
    Mukamugema Emerance
    Umujyanama w'Uburezi
    `,
    'student_issue': `
    Muraho [Izina ry'umubyeyi],
    
    Twabonye ikibazo cy'[izina ry'umwana] kandi tuzakikemura.
    
    [Igisubizo n'icyifuzo]
    
    Murakoze,
    Mukamugema Emerance
    `
  };
  return templates[type] || templates['parent_inquiry'];
}

module.exports = router;