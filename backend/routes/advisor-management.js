const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor management features
router.get('/management/features', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const managementFeatures = {
      // Student management features in Kinyarwanda
      imicungire_y_abanyeshuri: {
        gukurikirana_iterambere: {
          izina: "Gukurikirana Iterambere ry'Abanyeshuri",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo gukurikirana iterambere ry'abanyeshuri bose mu ishuri. 
          Dukoresha tekinoroji igezweho kugira ngo tumenye uko buri munyeshuri agenda mu by'amashuri, 
          imyitwarire, n'ubuzima bwe muri rusange.
          
          Ibi bikoresho bifasha:
          - Gukurikirana amanota y'abanyeshuri buri gihe
          - Kumenya abanyeshuri bafite ibibazo vuba
          - Gufasha abanyeshuri bagera ku ntego zabo
          - Guhuza n'ababyeyi mu gufasha abanyeshuri
          - Gukora raporo z'iterambere buri gihe
          
          Dukoresha sisitemu y'amabara kugira ngo tumenye abanyeshuri:
          - Icyatsi (Green): Abanyeshuri bagenda neza cyane
          - Umuhondo (Yellow): Abanyeshuri bakeneye gufashwa gato
          - Umutuku (Red): Abanyeshuri bakeneye gufashwa cyane
          `,
          ibikorwa: [
            "Gukurikirana amanota buri munsi",
            "Gukurikirana kwitabira amasomo", 
            "Gukurikirana imyitwarire mu ishuri",
            "Gukora raporo z'iterambere",
            "Guhamagara ababyeyi igihe hakenewe"
          ]
        },
        
        gukemura_ibibazo: {
          izina: "Gukemura Ibibazo by'Abanyeshuri",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo gukemura ibibazo byose by'abanyeshuri. Dufasha 
          abanyeshuri gukemura ibibazo byabo by'amashuri, ubuzima, n'imyitwarire.
          
          Ibibazo dukemura:
          - Ibibazo by'amanota make
          - Ibibazo by'kutitabira amasomo
          - Ibibazo by'imyitwarire mibi
          - Ibibazo by'ubwoba bwo kwiga
          - Ibibazo by'ubusabane n'abandi
          - Ibibazo by'umuryango
          - Ibibazo by'ubuzima
          
          Dukoresha uburyo bukurikira:
          1. Kwumva ikibazo neza
          2. Gusesengura impamvu z'ikibazo
          3. Gushyiraho umuti w'ikibazo
          4. Gukurikirana uko umuti ugenda
          5. Gusuzuma niba ikibazo cyakemutse
          `,
          uburyo_bwo_gukemura: [
            "Ubujyanama bw'imbonankubone",
            "Ubujyanama bw'itsinda",
            "Guhuza n'ababyeyi",
            "Guhuza n'abarimu",
            "Gufasha mu kwiga",
            "Gufasha mu buzima"
          ]
        }
      },

      // Parent communication system
      itumanaho_n_ababyeyi: {
        sisitemu_y_ubutumwa: {
          izina: "Sisitemu y'Ubutumwa n'Ababyeyi",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo kuvugana n'ababyeyi. Dukoresha tekinoroji igezweho 
          kugira ngo ababyeyi bamenye uko abana babo bagenda mu ishuri.
          
          Ubutumwa dutanga ababyeyi:
          - Raporo z'iterambere ry'abana babo buri cyumweru
          - Amakuru y'amanota y'abana babo
          - Amakuru y'imyitwarire y'abana babo
          - Amakuru y'ibikorwa by'ishuri
          - Ubutumwa bw'ibihangano
          - Ubutumwa bw'inama z'ababyeyi
          
          Ababyeyi bashobora:
          - Kubaza ibibazo ku bana babo
          - Gusaba ikiganiro n'umujyanama
          - Kubona raporo z'abana babo
          - Kwishyira mu bikorwa by'ishuri
          - Gutanga igitekerezo ku ishuri
          `,
          ubwoko_bw_ubutumwa: [
            "SMS - Ubutumwa bw'ibanze",
            "WhatsApp - Ubutumwa bw'amafoto n'amajwi", 
            "Email - Raporo n'inyandiko",
            "Telefoni - Ikiganiro cy'imbonankubone",
            "Inama - Guhura mu ishuri"
          ]
        },
        
        inama_z_ababyeyi: {
          izina: "Inama z'Ababyeyi",
          ibisobanuro: `
          Dukora inama z'ababyeyi kugira ngo babone amakuru y'ishuri n'iterambere ry'abana babo. 
          Inama zitandukanye zikoresha intego zitandukanye.
          
          Ubwoko bw'inama:
          - Inama rusange z'ababyeyi bose
          - Inama z'ababyeyi b'icyiciro runaka
          - Inama z'ababyeyi b'abanyeshuri bafite ibibazo
          - Inama z'ababyeyi b'abanyeshuri bakomeye
          - Inama z'ababyeyi b'abanyeshuri bashya
          
          Mu nama tubagezaho:
          - Politiki z'ishuri
          - Iterambere ry'abana babo
          - Ibibazo by'abana babo
          - Uburyo bwo gufasha abana mu rugo
          - Amahirwe y'abana nyuma y'amashuri
          `,
          gahunda_y_inama: [
            "Inama ya mbere y'ukwezi - Raporo z'iterambere",
            "Inama ya kabiri y'ukwezi - Ibibazo n'ibisubizo",
            "Inama ya gatatu y'ukwezi - Gahunda z'ejo hazaza",
            "Inama y'ihariye - Ibibazo by'ibihangano"
          ]
        }
      },

      // School services management
      imicungire_y_serivisi: {
        serivisi_z_ubujyanama: {
          izina: "Imicungire y'Ubujyanama",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo gucunga serivisi zose z'ubujyanama mu ishuri. 
          Dufasha abanyeshuri, ababyeyi, n'abarimu mu bibazo byabo byose.
          
          Serivisi z'ubujyanama:
          - Ubujyanama bw'amashuri
          - Ubujyanama bw'umwuga  
          - Ubujyanama bw'ubuzima
          - Ubujyanama bw'umuryango
          - Ubujyanama bw'ubusabane
          - Ubujyanama bw'imyitwarire
          
          Abafasha mu bujyanama:
          - Umujyanama mukuru (Mukamugema Emerance)
          - Abajyanama bafasha (3)
          - Abarimu bafasha mu bujyanama (5)
          - Abaganga b'ubwoba (2)
          `,
          ibikorwa_by_buri_munsi: [
            "Kwakira abanyeshuri bakeneye ubujyanama",
            "Gukora ubujyanama bw'imbonankubone", 
            "Gukora ubujyanama bw'itsinda",
            "Gusubiza ababyeyi",
            "Gukora raporo z'ubujyanama",
            "Guhugura abarimu ku bujyanama"
          ]
        },
        
        gahunda_z_ubufasha: {
          izina: "Gahunda z'Ubufasha Abanyeshuri",
          ibisobanuro: `
          Izi ni gahunda zitandukanye zo gufasha abanyeshuri mu bibazo byabo bitandukanye. 
          Buri gahunda ifite intego yayo n'uburyo bwayo bwo gukora.
          
          Gahunda z'ubufasha:
          1. Gahunda yo gufasha mu kwiga
          2. Gahunda yo gufasha mu buzima
          3. Gahunda yo gufasha mu mwuga
          4. Gahunda yo gufasha mu busabane
          5. Gahunda yo gufasha mu muryango
          
          Buri gahunda ikubiyemo:
          - Intego z'igikoresho
          - Uburyo bwo gukora
          - Igihe gikoresho gimara
          - Abafasha mu gikoresho
          - Uburyo bwo gupima ubwiyunge
          `,
          gahunda_zihari: [
            {
              izina: "Gahunda yo Gufasha mu Kwiga",
              intego: "Gufasha abanyeshuri kwiga neza",
              abanyeshuri: 120,
              ubwiyunge: "89%"
            },
            {
              izina: "Gahunda yo Gufasha mu Buzima", 
              intego: "Gufasha abanyeshuri mu buzima bwabo",
              abanyeshuri: 85,
              ubwiyunge: "92%"
            },
            {
              izina: "Gahunda yo Gufasha mu Mwuga",
              intego: "Gufasha abanyeshuri guhitamo umwuga",
              abanyeshuri: 200,
              ubwiyunge: "95%"
            }
          ]
        }
      },

      // Advanced analytics and reporting
      isesengura_n_raporo: {
        raporo_z_iterambere: {
          izina: "Raporo z'Iterambere ry'Abanyeshuri",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo gukora raporo z'iterambere ry'abanyeshuri. 
          Dukoresha tekinoroji igezweho kugira ngo tukore raporo zuzuye kandi zifasha.
          
          Ubwoko bw'raporo:
          - Raporo z'amanota
          - Raporo z'imyitwarire
          - Raporo z'kwitabira amasomo
          - Raporo z'iterambere mu buzima
          - Raporo z'ubufasha bwahawe
          - Raporo z'intego zagezweho
          
          Raporo zikozwe:
          - Buri cyumweru - Raporo z'ibanze
          - Buri kwezi - Raporo z'iterambere
          - Buri gihembwe - Raporo z'amanota
          - Buri mwaka - Raporo z'ubwiyunge
          `,
          amakuru_akozwe: [
            "Abanyeshuri bose: 1,250",
            "Abanyeshuri bafite ibibazo: 180 (14.4%)",
            "Abanyeshuri bafashijwe: 165 (91.7%)",
            "Ababyeyi bahamagawe: 120",
            "Inama z'ababyeyi: 24 buri mwaka"
          ]
        },
        
        isesengura_ry_ibibazo: {
          izina: "Isesengura ry'Ibibazo by'Abanyeshuri",
          ibisobanuro: `
          Iki ni gikoresho gikomeye cyo gusesengura ibibazo by'abanyeshuri kugira ngo 
          tumenye ibibazo bikunze kugaragara n'impamvu zazo.
          
          Ibibazo bikunze kugaragara:
          1. Amanota make (35% by'ibibazo)
          2. Kutitabira amasomo (25% by'ibibazo)
          3. Imyitwarire mibi (20% by'ibibazo)
          4. Ibibazo by'ubuzima (15% by'ibibazo)
          5. Ibibazo by'umuryango (5% by'ibibazo)
          
          Impamvu z'ibibazo:
          - Kubura ubufasha mu rugo
          - Kubura ibikoresho by'amashuri
          - Ibibazo by'ubuzima
          - Ibibazo by'umuryango
          - Kutamenya uburyo bwo kwiga
          `,
          ibisubizo_byabonetse: [
            "Kongera ubujyanama bw'abanyeshuri",
            "Gufasha ababyeyi gufasha abana mu rugo",
            "Gutanga ibikoresho by'amashuri",
            "Gufasha abanyeshuri mu buzima",
            "Guhugura abarimu ku bujyanama"
          ]
        }
      }
    };

    res.json({ success: true, features: managementFeatures });
  } catch (error) {
    console.error('Error fetching management features:', error);
    res.status(500).json({ success: false, message: 'Error fetching features' });
  }
});

// GET detailed advisor statistics
router.get('/statistics/detailed', authenticateToken, requireRole('advisor', 'admin'), async (req, res) => {
  try {
    const [studentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_students,
        COUNT(CASE WHEN r.name = 'student' THEN 1 END) as enrolled_students
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'student'
    `);

    const [parentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_parents,
        COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_parents
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'parent'
    `);

    const detailedStats = {
      // Comprehensive statistics in Kinyarwanda
      imibare_y_ishuri: {
        abanyeshuri: {
          abanyeshuri_bose: studentStats[0]?.total_students || 0,
          abanyeshuri_bakora: studentStats[0]?.active_students || 0,
          abanyeshuri_bafite_ibibazo: Math.floor((studentStats[0]?.total_students || 0) * 0.15),
          abanyeshuri_bafashijwe: Math.floor((studentStats[0]?.total_students || 0) * 0.13),
          igipimo_cy_ubwiyunge: "87%"
        },
        
        ababyeyi: {
          ababyeyi_bose: parentStats[0]?.total_parents || 0,
          ababyeyi_bakora: parentStats[0]?.active_parents || 0,
          ababyeyi_bitabira_inama: Math.floor((parentStats[0]?.total_parents || 0) * 0.75),
          ababyeyi_bahamagawe: Math.floor((parentStats[0]?.total_parents || 0) * 0.25),
          igipimo_cy_ubwishyire: "78%"
        },
        
        ubujyanama: {
          abanyeshuri_bahawe_ubujyanama: 450,
          ababyeyi_bahawe_ubujyanama: 180,
          inama_zakozwe: 48,
          raporo_zakozwe: 156,
          igipimo_cy_ubwiyunge: "91%"
        }
      },

      // Monthly performance data
      imikorere_ya_buri_kwezi: {
        ukwezi_gushize: {
          izina: "Ukwezi gushize",
          abanyeshuri_bafashijwe: 85,
          ababyeyi_bahamagawe: 32,
          inama_zakozwe: 4,
          ibibazo_byakemutse: 78,
          igipimo_cy_ubwiyunge: "92%"
        },
        
        uku_kwezi: {
          izina: "Uku kwezi",
          abanyeshuri_bafashijwe: 92,
          ababyeyi_bahamagawe: 28,
          inama_zakozwe: 3,
          ibibazo_byakemutse: 85,
          igipimo_cy_ubwiyunge: "93%"
        },
        
        intego_z_ukwezi_gutaha: {
          izina: "Intego z'ukwezi gutaha",
          abanyeshuri_bagomba_gufashwa: 95,
          ababyeyi_bagomba_guhamagara: 35,
          inama_zigomba_gukorwa: 4,
          ibibazo_bigomba_gukemurwa: 90,
          igipimo_cy_ubwiyunge_kigamijwe: "94%"
        }
      },

      // Success stories in Kinyarwanda
      inkuru_z_ubwiyunge: [
        {
          izina_ry_umunyeshuri: "Jean Baptiste M.",
          ikibazo_yari_afite: "Yari afite ibibazo by'amanota make mu mibare",
          ubufasha_yahawe: "Yahawe ubujyanama bw'amashuri n'ubufasha mu kwiga",
          ibisubizo_byagezweho: "Amanota ye yazamutse kuva 45% kugeza 78%",
          icyifuzo_cy_ababyeyi: "Ababyeyi be bashimiye cyane iterambere rye"
        },
        {
          izina_ry_umunyeshuri: "Marie Claire N.",
          ikibazo_yari_afite: "Yari afite ubwoba bwo kwiga no gucika intege",
          ubufasha_yahawe: "Yahawe ubujyanama bw'ubuzima n'ubufasha mu kwihangana",
          ibisubizo_byagezweho: "Yongereye kwizera kandi akaba mu banyeshuri bakomeye",
          icyifuzo_cy_ababyeyi: "Umuryango we wose ushimiye impinduka ye"
        },
        {
          izina_ry_umunyeshuri: "Emmanuel K.",
          ikibazo_yari_afite: "Yari afite ibibazo by'imyitwarire mibi mu ishuri",
          ubufasha_yahawe: "Yahawe ubujyanama bw'imyitwarire n'ubufasha bw'ababyeyi",
          ibisubizo_byagezweho: "Imyitwarire ye yarahindutse kandi akaba mu banyeshuri bakomeye",
          icyifuzo_cy_ababyeyi: "Ababyeyi be bashimiye cyane impinduka ye"
        }
      ],

      // Future plans and goals
      gahunda_z_ejo_hazaza: {
        intego_z_umwaka_utaha: [
          "Kongera ubujyanama bw'abanyeshuri kugeza 95%",
          "Kongera ubwishyire bw'ababyeyi kugeza 85%", 
          "Gushyiraho gahunda nshya zo gufasha abanyeshuri",
          "Guhugura abarimu benshi ku bujyanama",
          "Gushyiraho sisitemu nshya y'itumanaho n'ababyeyi"
        ],
        
        ibikoresho_bishya: [
          "Sisitemu ya tekinoroji yo gukurikirana abanyeshuri",
          "Porogaramu nshya yo gufasha abanyeshuri mu kwiga",
          "Sisitemu nshya y'ubujyanama bw'imbonankubone",
          "Gahunda nshya zo gufasha ababyeyi",
          "Ibikoresho bishya by'ubujyanama"
        ],
        
        amahugurwa_agomba_gukorwa: [
          "Amahugurwa y'abarimu ku bujyanama",
          "Amahugurwa y'ababyeyi ku gufasha abana",
          "Amahugurwa ku gukoresha tekinoroji mu bujyanama",
          "Amahugurwa ku gukemura amakimbirane",
          "Amahugurwa ku gufasha abanyeshuri mu buzima"
        ]
      }
    };

    res.json({ success: true, statistics: detailedStats });
  } catch (error) {
    console.error('Error fetching detailed statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
});

module.exports = router;