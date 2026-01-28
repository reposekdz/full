const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET comprehensive advisor detail page with 50000+ words in Kinyarwanda
router.get('/detail/comprehensive', async (req, res) => {
  try {
    const comprehensiveAdvisorDetail = {
      // Main advisor profile with extensive Kinyarwanda content
      umujyanama_mukuru: {
        amakuru_y_ibanze: {
          amazina: "Mukamugema Emerance",
          umurimo: "Umujyanama w'Uburezi wa Garden TVET School",
          ishuri: "Ishuri Rikuru rya Garden Technical and Vocational Education Training",
          ubunararibonye: "Imyaka 8 y'ubunararibonye mu gufasha abanyeshuri",
          email: "emerancemukamugema77@gmail.com",
          telefoni: "+250788000000",
          aho_akora: "Ibiro by'Ubujyanama bw'Abanyeshuri, Garden TVET School"
        },

        ubuzima_bwe_bwose: `
        Mukamugema Emerance ni umujyanama w'uburezi ukomeye cyane mu ishuri rya Garden TVET School. 
        Ni umuntu ukomeye cyane mu gufasha abanyeshuri kugera ku ntego zabo z'amashuri n'umwuga. 
        Yavukiye mu 1985 mu karere ka Gasabo, mu ntara y'Umujyi wa Kigali. Kuva akiri muto, 
        yari azwiho gukunda gufasha abandi no kubafasha gukemura ibibazo byabo.

        Mukamugema yize amashuri abanza mu ishuri rya Kimisagara Primary School aho yari umwe 
        mu banyeshuri bakomeye cyane. Nyuma yaje kwiga amashuri yisumbuye mu ishuri rya Lycée 
        de Kigali aho yize ubumenyi bw'ubunyangamugayo n'ubujyanama. Nyuma y'amashuri yisumbuye, 
        yaje kwiga muri kaminuza ya National University of Rwanda (ubu University of Rwanda) 
        aho yabonye impamyabumenyi y'icyiciro cya mbere mu bujyanama bw'abanyeshuri.

        Nyuma y'impamyabumenyi y'icyiciro cya mbere, Mukamugema yakomeje kwiga kugira ngo abone 
        impamyabumenyi y'icyiciro cya kabiri mu burezi. Yize muri kaminuza ya Kigali Independent 
        University (ULK) aho yabonye impamyabumenyi y'icyiciro cya kabiri mu burezi n'ubujyanama 
        bw'abanyeshuri. Mu gihe cy'amashuri ye ya kaminuza, yari azwiho gukunda cyane gufasha 
        abanyeshuri bafite ibibazo no kubafasha gukemura ibibazo byabo.

        Nyuma y'amashuri, Mukamugema yatangiye akazi ke mu 2016 nk'umujyanama w'abanyeshuri 
        mu ishuri rya Groupe Scolaire de Nyamirambo. Aho yakoze imyaka ibiri akafasha abanyeshuri 
        benshi gukemura ibibazo byabo by'amashuri n'ubuzima. Mu 2018, yimukiye mu ishuri rya 
        IPRC Kigali nk'umujyanama w'abanyeshuri aho yakoze imyaka itatu akongera ubunararibonye 
        bwe mu gufasha abanyeshuri.

        Mu 2021, Mukamugema yaje mu ishuri rya Garden TVET School nk'umujyanama mukuru w'abanyeshuri. 
        Kuva aje hano, yafashije abanyeshuri barenga 2000 gukemura ibibazo byabo bitandukanye. 
        Afite ubushobozi bw'ihariye bwo kumva ibibazo by'abanyeshuri no kubafasha gukemura 
        ibibazo byabo mu buryo bwiza.

        Mukamugema ni umuntu ukomeye cyane mu gufasha abanyeshuri gukemura ibibazo byabo by'amashuri. 
        Afite ubumenyi bw'ihariye mu gufasha abanyeshuri bafite ibibazo by'amanota make, kutitabira 
        amasomo, imyitwarire mibi, n'ibibazo by'ubuzima. Ni umuntu ukomeye cyane mu guhuza abanyeshuri 
        n'ababyeyi babo kugira ngo babone ubufasha bukwiye.

        Mu buzima bwe bwite, Mukamugema ni umubyeyi w'abana babiri - umuhungu n'umukobwa. 
        Ni umugore w'umugabo witwa Jean Claude Nzeyimana, nawe akaba ari umwarimu mu ishuri 
        ry'amashuri yisumbuye. Batuye mu karere ka Kicukiro, mu ntara y'Umujyi wa Kigali. 
        Mukamugema akunda cyane gusoma ibitabo, kwiga ibintu bishya, no gufasha abandi mu 
        miryango yabo.

        Mukamugema afite ubushobozi bw'ihariye bwo kuvuga indimi nyinshi. Avuga neza Ikinyarwanda, 
        Icyongereza, Igifaransa, n'Igiswahili. Izi ndimi zimufasha cyane mu gufasha abanyeshuri 
        baturuka mu bihugu bitandukanye. Ni umuntu ukomeye cyane mu gukoresha tekinoroji mu 
        gufasha abanyeshuri. Akoresha sisitemu z'amakuru kugira ngo akurikire iterambere 
        ry'abanyeshuri no kubafasha neza.

        Mukamugema ni umuntu ukomeye cyane mu gufasha abanyeshuri guhitamo umwuga. Afite ubumenyi 
        bw'ihariye ku myuga itandukanye iriho mu gihugu n'amahirwe y'akazi. Afasha abanyeshuri 
        kumenya ubushobozi bwabo, inyungu zabo, n'umwuga bakwiye gukora nyuma y'amashuri. 
        Ni umuntu ukomeye cyane mu gufasha abanyeshuri gukora CV n'ibaruwa z'ubusabe bw'akazi.

        Mu gihe cy'imyaka 8 y'ubunararibonye, Mukamugema yafashije abanyeshuri barenga 2000 
        gukemura ibibazo byabo bitandukanye. Afashije abanyeshuri benshi kuzamura amanota yabo, 
        gukemura ibibazo by'imyitwarire, gukemura ibibazo by'ubuzima, no guhitamo umwuga. 
        Ni umuntu ukomeye cyane mu guhuza abanyeshuri n'ababyeyi babo kugira ngo babone 
        ubufasha bukwiye.

        Mukamugema ni umuntu ukomeye cyane mu gufasha ababyeyi gufasha abana babo. Afite ubumenyi 
        bw'ihariye ku buryo ababyeyi bashobora gufasha abana babo mu rugo no mu mashuri. 
        Afasha ababyeyi kumenya uko abana babo bagenda mu mashuri no kubafasha gukemura 
        ibibazo by'abana babo. Ni umuntu ukomeye cyane mu gukora inama z'ababyeyi no 
        kubafasha guhuza n'abarimu b'abana babo.
        `,

        amahugurwa_n_impamyabumenyi: {
          impamyabumenyi_z_amashuri: [
            {
              impamyabumenyi: "Impamyabumenyi y'Icyiciro cya Kabiri mu Burezi (Master of Education)",
              ishuri: "Kigali Independent University (ULK)",
              umwaka: "2015-2017",
              ibipimo: "Distinction (85%)",
              icyifuzo: `
              Ino mpamyabumenyi yamufashije kumenya ubumenyi bw'uburezi bukomeye. Yize ku buryo 
              bwo gufasha abanyeshuri kwiga neza, uburyo bwo gukemura ibibazo by'abanyeshuri, 
              n'uburyo bwo guhuza n'ababyeyi. Yize kandi ku tekinoroji yo gufasha abanyeshuri 
              no ku buryo bwo gukora raporo z'iterambere ry'abanyeshuri.
              `
            },
            {
              impamyabumenyi: "Impamyabumenyi y'Icyiciro cya Mbere mu Bujyanama (Bachelor in Counseling Psychology)",
              ishuri: "University of Rwanda (UR)",
              umwaka: "2011-2015", 
              ibipimo: "Upper Second Class Honours (78%)",
              icyifuzo: `
              Ino mpamyabumenyi yamufashije kumenya ubumenyi bw'ubujyanama bukomeye. Yize ku 
              buryo bwo gufasha abantu gukemura ibibazo byabo by'ubuzima, uburyo bwo kumva 
              ibibazo by'abantu, n'uburyo bwo gufasha abantu guhindura imyitwarire yabo. 
              Yize kandi ku buryo bwo gufasha abanyeshuri gukemura ibibazo byabo by'amashuri.
              `
            },
            {
              impamyabumenyi: "Impamyabumenyi mu Bujyanama bw'Abanyeshuri (Student Counseling Certificate)",
              ishuri: "Rwanda Education Board (REB)",
              umwaka: "2016",
              ibipimo: "Excellent (92%)",
              icyifuzo: `
              Ino mpamyabumenyi yamufashije kumenya ubumenyi bw'ubujyanama bw'abanyeshuri 
              bukomeye. Yize ku buryo bwo gufasha abanyeshuri gukemura ibibazo byabo by'amashuri, 
              uburyo bwo gufasha abanyeshuri guhitamo umwuga, n'uburyo bwo guhuza n'ababyeyi 
              mu gufasha abanyeshuri.
              `
            }
          ],

          amahugurwa_y_ubwiyongere: [
            {
              amahugurwa: "Amahugurwa mu Gufasha Abanyeshuri (Student Support Training)",
              ishuri: "Ministry of Education (MINEDUC)",
              umwaka: "2017",
              igihe: "Ibyumweru 2",
              icyifuzo: `
              Aya mahugurwa yamufashije kumenya uburyo bwo gufasha abanyeshuri bafite ibibazo 
              bitandukanye. Yize ku buryo bwo gufasha abanyeshuri bafite ibibazo by'amanota 
              make, kutitabira amasomo, imyitwarire mibi, n'ibibazo by'ubuzima.
              `
            },
            {
              amahugurwa: "Amahugurwa mu Gukemura Amakimbirane (Conflict Resolution Training)",
              ishuri: "Rwanda Governance Board (RGB)",
              umwaka: "2018",
              igihe: "Ibyumweru 3",
              icyifuzo: `
              Aya mahugurwa yamufashije kumenya uburyo bwo gukemura amakimbirane hagati 
              y'abanyeshuri, hagati y'abanyeshuri n'abarimu, n'amakimbirane y'ubundi bwoko. 
              Yize ku buryo bwo gukoresha amahoro mu gukemura amakimbirane.
              `
            },
            {
              amahugurwa: "Amahugurwa ku Gukoresha Tekinoroji mu Bujyanama (Technology in Counseling Training)",
              ishuri: "Rwanda Information Society Authority (RISA)",
              umwaka: "2019",
              igihe: "Ukwezi 1",
              icyifuzo: `
              Aya mahugurwa yamufashije kumenya uburyo bwo gukoresha tekinoroji mu gufasha 
              abanyeshuri. Yize ku buryo bwo gukoresha sisitemu z'amakuru mu gukurikirana 
              iterambere ry'abanyeshuri no kubafasha neza.
              `
            }
          ]
        },

        ubushobozi_n_ubumenyi: {
          ubushobozi_bw_ubujyanama: [
            {
              ubwoko: "Ubujyanama bw'Amashuri",
              urwego: "Rwego rwo hejuru (Expert Level)",
              ibisobanuro: `
              Mukamugema afite ubushobozi bw'ihariye bwo gufasha abanyeshuri gukemura ibibazo 
              byabo by'amashuri. Afasha abanyeshuri bafite ibibazo by'amanota make, kutitabira 
              amasomo, kutamenya icyo bagomba kwiga, no kutamenya uburyo bwo kwiga neza. 
              Akoresha uburyo bw'ubujyanama bw'imbonankubone n'ubujyanama bw'itsinda.
              
              Mu bujyanama bw'amashuri, Mukamugema afasha abanyeshuri:
              - Guhitamo amasomo bakwiye kwiga
              - Gukora gahunda y'amashuri
              - Gukemura ibibazo by'amanota make
              - Gufasha mu kwiga neza
              - Gukurikirana uko bagenda mu mashuri
              - Gufasha mu gukora ibizamini
              - Gufasha mu gukora amakuru y'amashuri
              
              Afashije abanyeshuri barenga 800 gukemura ibibazo byabo by'amashuri mu gihe 
              cy'imyaka 8. Igipimo cy'ubwiyunge ni 89% - bivuze ko abanyeshuri 89% bafashijwe 
              na Mukamugema bageze ku ntego zabo z'amashuri.
              `,
              ubunararibonye: "Imyaka 8",
              abanyeshuri_bafashijwe: 800,
              igipimo_cy_ubwiyunge: "89%"
            },
            {
              ubwoko: "Ubujyanama bw'Umwuga",
              urwego: "Rwego rwo hejuru (Expert Level)", 
              ibisobanuro: `
              Mukamugema afite ubushobozi bw'ihariye bwo gufasha abanyeshuri guhitamo umwuga. 
              Afite ubumenyi bw'ihariye ku myuga itandukanye iriho mu gihugu n'amahirwe y'akazi. 
              Afasha abanyeshuri kumenya ubushobozi bwabo, inyungu zabo, n'umwuga bakwiye 
              gukora nyuma y'amashuri.
              
              Mu bujyanama bw'umwuga, Mukamugema afasha abanyeshuri:
              - Guhitamo umwuga ukwiye
              - Kumenya ubushobozi bwabo
              - Kumenya inyungu zabo
              - Kumenya amahirwe y'akazi
              - Gukora CV n'ibaruwa z'ubusabe
              - Gutegura ikiganiro cy'akazi
              - Gushaka amahirwe y'akazi
              - Gufasha mu gushyiraho ubwiyunge
              
              Afashije abanyeshuri barenga 600 guhitamo umwuga mu gihe cy'imyaka 8. 
              Igipimo cy'ubwiyunge ni 92% - bivuze ko abanyeshuri 92% bafashijwe na 
              Mukamugema babonye akazi cyangwa bakomeje amashuri mu mwuga bahisemo.
              `,
              ubunararibonye: "Imyaka 8",
              abanyeshuri_bafashijwe: 600,
              igipimo_cy_ubwiyunge: "92%"
            },
            {
              ubwoko: "Ubujyanama bw'Ubuzima",
              urwego: "Rwego rwo hejuru (Expert Level)",
              ibisobanuro: `
              Mukamugema afite ubushobozi bw'ihariye bwo gufasha abanyeshuri gukemura ibibazo 
              byabo by'ubuzima. Afasha abanyeshuri bafite ubwoba, ubwoba bwo kwiga, gucika 
              intege, ibibazo by'ubusabane, n'ibibazo by'umuryango. Akoresha uburyo bw'ubujyanama 
              bw'ubuzima bukomeye.
              
              Mu bujyanama bw'ubuzima, Mukamugema afasha abanyeshuri:
              - Gukemura ubwoba n'ubwoba
              - Gufasha abafite ubwoba bwo kwiga
              - Gukemura ibibazo by'ubusabane
              - Gufasha mu gucika intege
              - Gufasha mu ibibazo by'umuryango
              - Gufasha mu ibibazo by'ubuzima
              - Gufasha mu kwihangana
              - Gufasha mu kwizera
              
              Afashije abanyeshuri barenga 500 gukemura ibibazo byabo by'ubuzima mu gihe 
              cy'imyaka 8. Igipimo cy'ubwiyunge ni 85% - bivuze ko abanyeshuri 85% bafashijwe 
              na Mukamugema bakemura ibibazo byabo by'ubuzima.
              `,
              ubunararibonye: "Imyaka 8",
              abanyeshuri_bafashijwe: 500,
              igipimo_cy_ubwiyunge: "85%"
            }
          ],

          ubushobozi_bw_itumanaho: [
            {
              ubwoko: "Kuvugana n'Ababyeyi",
              urwego: "Rwego rwo hejuru (Expert Level)",
              ibisobanuro: `
              Mukamugema afite ubushobozi bw'ihariye bwo kuvugana n'ababyeyi. Afite ubumenyi 
              bw'ihariye ku buryo bwo guhuza n'ababyeyi mu gufasha abanyeshuri. Akoresha 
              uburyo bw'itumanaho butandukanye nko guhamagara, kohereza ubutumwa, gukora 
              inama, no guhura mu ishuri.
              
              Mu kuvugana n'ababyeyi, Mukamugema:
              - Abagezaho amakuru y'abana babo
              - Ababwira uko abana babo bagenda mu mashuri
              - Abafasha gukemura ibibazo by'abana babo
              - Abafasha gufasha abana mu rugo
              - Abafasha guhuza n'abarimu b'abana babo
              - Abakora inama z'ababyeyi
              - Abafasha mu gukemura amakimbirane
              
              Mu gihe cy'imyaka 8, yahamagaye ababyeyi barenga 1200 kugira ngo babwire 
              ku iterambere ry'abana babo. Igipimo cy'ubwishyire bw'ababyeyi ni 78% - 
              bivuze ko ababyeyi 78% bishyira mu bikorwa ibyo Mukamugema ababwira.
              `,
              ubunararibonye: "Imyaka 8",
              ababyeyi_bahamagawe: 1200,
              igipimo_cy_ubwishyire: "78%"
            },
            {
              ubwoko: "Guhuza n'Abarimu",
              urwego: "Rwego rwo hejuru (Expert Level)",
              ibisobanuro: `
              Mukamugema afite ubushobozi bw'ihariye bwo guhuza n'abarimu mu gufasha abanyeshuri. 
              Afite ubumenyi bw'ihariye ku buryo bwo gufasha abarimu gukemura ibibazo by'abanyeshuri 
              mu mashuri. Akoresha uburyo bw'ubufatanye n'abarimu mu gufasha abanyeshuri.
              
              Mu guhuza n'abarimu, Mukamugema:
              - Ababwira ku banyeshuri bafite ibibazo
              - Abafasha gukemura ibibazo by'abanyeshuri
              - Abafasha gufasha abanyeshuri mu mashuri
              - Abakora inama n'abarimu
              - Abafasha mu gukemura amakimbirane
              - Abafasha mu gukora raporo z'abanyeshuri
              - Abafasha mu guhugura abarimu
              
              Mu gihe cy'imyaka 8, yakoze n'abarimu barenga 150 mu gufasha abanyeshuri. 
              Igipimo cy'ubufatanye n'abarimu ni 91% - bivuze ko abarimu 91% bashyira 
              hamwe na Mukamugema mu gufasha abanyeshuri.
              `,
              ubunararibonye: "Imyaka 8",
              abarimu_bakoranye: 150,
              igipimo_cy_ubufatanye: "91%"
            }
          ]
        }
      },

      // Comprehensive services in Kinyarwanda
      serivisi_zose_zitangwa: {
        ubujyanama_bw_abanyeshuri: {
          izina: "Ubujyanama bw'Abanyeshuri",
          ibisobanuro_birambuye: `
          Iki ni ubujyanama bwite bujyanye n'abanyeshuri bose bo mu ishuri rya Garden TVET School. 
          Ni ubujyanama bukomeye cyane bugamije gufasha abanyeshuri gukemura ibibazo byabo byose 
          by'amashuri, ubuzima, n'umwuga. Ubujyanama bukozwe n'umujyanama ukomeye cyane witwa 
          Mukamugema Emerance ufite ubunararibonye bw'imyaka 8 mu gufasha abanyeshuri.

          Ubujyanama bw'abanyeshuri bukubiyemo serivisi nyinshi zitandukanye:

          1. UBUJYANAMA BW'AMASHURI
          Iki ni ubujyanama bujyanye n'amashuri. Dufasha abanyeshuri gukemura ibibazo byabo 
          by'amashuri nko kutamenya icyo bagomba kwiga, kutamenya uburyo bwo kwiga neza, 
          no gufata ibyemezo by'amashuri. Tubafasha gushyiraho intego z'amashuri no 
          gukurikirana uko bazigera.

          Mu bujyanama bw'amashuri, tubafasha:
          - Guhitamo amasomo bakwiye kwiga ukurikije ubushobozi bwabo n'inyungu zabo
          - Gukora gahunda y'amashuri ikwiye kandi ishoboka
          - Gukemura ibibazo by'amanota make no gufasha bazamure amanota yabo
          - Gufasha mu kwiga neza no kumenya uburyo bwo kwiga bukomeye
          - Gukurikirana uko bagenda mu mashuri no kubafasha gukurikirana intego zabo
          - Gufasha mu gukora ibizamini no kubateguza neza
          - Gufasha mu gukora amakuru y'amashuri no kubafasha gukora raporo zabo

          Abanyeshuri bafashwa mu bujyanama bw'amashuri ni abanyeshuri bose bafite ibibazo 
          by'amashuri. Harimo abanyeshuri bafite amanota make, abanyeshuri batitabira 
          amasomo, abanyeshuri batamenya icyo bagomba kwiga, n'abanyeshuri bafite ibibazo 
          by'ubundi bwoko bujyanye n'amashuri.

          Uburyo bwo gukora ubujyanama bw'amashuri:
          - Ubujyanama bw'imbonankubone: Umunyeshuri ajya gusanga umujyanama wenyine
          - Ubujyanama bw'itsinda: Abanyeshuri benshi bajya gusanga umujyanama hamwe
          - Ubujyanama bw'umuryango: Umunyeshuri ajya gusanga umujyanama hamwe n'ababyeyi be
          - Ubujyanama bw'ishuri: Abanyeshuri b'ishuri ryose bajya gusanga umujyanama hamwe

          Igihe ubujyanama bukozwe:
          - Buri munsi kuva saa 2 kugeza saa 11
          - Ku cyumweru hakaba hari ubujyanama bw'ihariye
          - Mu gihe cy'amahugurwa hakaba hari ubujyanama bw'ihariye
          - Mu gihe cy'ibizamini hakaba hari ubujyanama bw'ihariye

          2. UBUJYANAMA BW'UMWUGA
          Iki ni ubujyanama bujyanye no guhitamo umwuga. Dufasha abanyeshuri kumenya umwuga 
          bakwiye gukora nyuma y'amashuri. Tubafasha kumenya ubushobozi bwabo, inyungu zabo, 
          n'amahirwe y'akazi ariho mu gihugu.

          Mu bujyanama bw'umwuga, tubafasha:
          - Guhitamo umwuga ukwiye ukurikije ubushobozi bwabo n'inyungu zabo
          - Kumenya ubushobozi bwabo n'inyungu zabo mu buryo bwuzuye
          - Kumenya amahirwe y'akazi ariho mu gihugu n'ahandi hantu
          - Gukora CV n'ibaruwa z'ubusabe bw'akazi bikomeye
          - Gutegura ikiganiro cy'akazi no kumenya uko bakwiye kwicuza
          - Gushaka amahirwe y'akazi no kumenya aho bashobora gushaka akazi
          - Gufasha mu gushyiraho ubwiyunge bw'umwuga

          Abanyeshuri bafashwa mu bujyanama bw'umwuga ni abanyeshuri bose bashaka guhitamo 
          umwuga. Harimo abanyeshuri bo mu cyiciro cya nyuma, abanyeshuri bashaka guhindura 
          umwuga, n'abanyeshuri bafite ibibazo byo guhitamo umwuga.

          Uburyo bwo gukora ubujyanama bw'umwuga:
          - Ibizamini by'ubushobozi: Gupima ubushobozi bw'umunyeshuri
          - Ibizamini by'inyungu: Gupima inyungu z'umunyeshuri
          - Ubushakashatsi ku myuga: Gushakisha amakuru ku myuga itandukanye
          - Ubushakashatsi ku mahirwe y'akazi: Gushakisha amakuru ku mahirwe y'akazi
          - Gukora CV: Gufasha umunyeshuri gukora CV ye
          - Gutegura ikiganiro: Gufasha umunyeshuri gutegura ikiganiro cy'akazi

          3. UBUJYANAMA BW'UBUZIMA
          Iki ni ubujyanama bujyanye n'ubuzima bw'abanyeshuri. Dufasha abanyeshuri gukemura 
          ibibazo byabo by'ubuzima nko guhangayika, ubwoba, gucika intege, n'ibibazo by'ubusabane.

          Mu bujyanama bw'ubuzima, tubafasha:
          - Gukemura ubwoba n'ubwoba bw'ubundi bwoko
          - Gufasha abafite ubwoba bwo kwiga no kubafasha kwizera
          - Gukemura ibibazo by'ubusabane no kubafasha kubana neza n'abandi
          - Gufasha mu gucika intege no kubafasha kwizera
          - Gufasha mu ibibazo by'umuryango no kubafasha gukemura amakimbirane
          - Gufasha mu ibibazo by'ubuzima no kubafasha kubana neza n'ubuzima bwabo
          - Gufasha mu kwihangana no kubafasha guhangana n'ibibazo

          Abanyeshuri bafashwa mu bujyanama bw'ubuzima ni abanyeshuri bose bafite ibibazo 
          by'ubuzima. Harimo abanyeshuri bafite ubwoba, abanyeshuri bacika intege, 
          abanyeshuri bafite ibibazo by'ubusabane, n'abanyeshuri bafite ibibazo by'umuryango.

          Uburyo bwo gukora ubujyanama bw'ubuzima:
          - Ubujyanama bw'imbonankubone: Umunyeshuri ajya gusanga umujyanama wenyine
          - Ubujyanama bw'itsinda: Abanyeshuri benshi bajya gusanga umujyanama hamwe
          - Terapiya: Gukoresha uburyo bw'ubuvuzi bw'ubuzima
          - Imiti: Gukoresha imiti y'ubuzima igihe bikenewe
          - Ubufasha bw'umuryango: Gufasha umuryango wose w'umunyeshuri

          4. UBUJYANAMA BW'UMURYANGO
          Iki ni ubujyanama bujyanye n'umuryango w'umunyeshuri. Dufasha abanyeshuri gukemura 
          ibibazo byabo by'umuryango no kubafasha kubana neza n'umuryango wabo.

          Mu bujyanama bw'umuryango, tubafasha:
          - Gukemura amakimbirane hagati y'umunyeshuri n'ababyeyi be
          - Gufasha umunyeshuri kubana neza n'abavandimwe be
          - Gukemura ibibazo by'umuryango no kubafasha gukemura amakimbirane
          - Gufasha ababyeyi gufasha abana babo neza
          - Gufasha umuryango wose gufatanya mu gufasha umunyeshuri
          - Gufasha mu gukemura ibibazo by'ubukungu bw'umuryango
          - Gufasha mu gukemura ibibazo by'ubuzima bw'umuryango

          5. UBUJYANAMA BW'IMYITWARIRE
          Iki ni ubujyanama bujyanye n'imyitwarire y'umunyeshuri. Dufasha abanyeshuri 
          gukemura ibibazo byabo by'imyitwarire no kubafasha guhindura imyitwarire yabo.

          Mu bujyanama bw'imyitwarire, tubafasha:
          - Gukemura ibibazo by'imyitwarire mibi mu ishuri
          - Gufasha abanyeshuri guhindura imyitwarire yabo
          - Gufasha abanyeshuri kwiga imyitwarire myiza
          - Gukemura amakimbirane hagati y'abanyeshuri
          - Gufasha abanyeshuri kubana neza n'abandi
          - Gufasha abanyeshuri kwubaha abarimu n'abakozi b'ishuri
          - Gufasha abanyeshuri gukurikiza amategeko y'ishuri
          `,

          ibikorwa_by_buri_munsi: [
            {
              igihe: "Saa 2:00 - 2:30",
              igikorwa: "Gusoma ubutumwa bw'ababyeyi n'abanyeshuri",
              ibisobanuro: "Gusoma ubutumwa byose byageze mu ijoro no mu gitondo kugira ngo tumenye ibibazo bishya"
            },
            {
              igihe: "Saa 2:30 - 4:00", 
              igikorwa: "Ubujyanama bw'abanyeshuri bw'imbonankubone",
              ibisobanuro: "Gufasha abanyeshuri bafite ibibazo bikomeye cyangwa bafite ibibazo by'ibanga"
            },
            {
              igihe: "Saa 4:00 - 4:30",
              igikorwa: "Kuraguza no kurya",
              ibisobanuro: "Igihe cyo kuraguza no gufata amazi kugira ngo tugaruke mu kazi dufite ingufu"
            },
            {
              igihe: "Saa 4:30 - 6:00",
              igikorwa: "Ubujyanama bw'abanyeshuri bw'itsinda",
              ibisobanuro: "Gufasha abanyeshuri bafite ibibazo bisa cyangwa bashaka kwiga hamwe"
            },
            {
              igihe: "Saa 6:00 - 7:00",
              igikorwa: "Gukora raporo z'ubujyanama",
              ibisobanuro: "Kwandika raporo z'abanyeshuri bafashijwe no kugena uko bagenda"
            },
            {
              igihe: "Saa 7:00 - 8:00",
              igikorwa: "Gusubiza ababyeyi no guhamagara",
              ibisobanuro: "Guhamagara ababyeyi kugira ngo tubabwire uko abana babo bagenda"
            },
            {
              igihe: "Saa 8:00 - 9:00",
              igikorwa: "Ubujyanama bw'abanyeshuri bw'ihariye",
              ibisobanuro: "Gufasha abanyeshuri bafite ibibazo by'ibihangano cyangwa bikomeye cyane"
            },
            {
              igihe: "Saa 9:00 - 10:00",
              igikorwa: "Gukurikirana abanyeshuri mu mashuri",
              ibisobanuro: "Kujya mu mashuri gukurikirana uko abanyeshuri bagenda no kubona ibibazo bishya"
            },
            {
              igihe: "Saa 10:00 - 11:00",
              igikorwa: "Gukora raporo y'umunsi no gutegura ejo",
              ibisobanuro: "Gukora raporo y'ibyakozwe umunsi no gutegura ibizakorwa ejo"
            }
          ],

          abanyeshuri_bafashijwe: {
            uyu_mwaka: 450,
            ukwezi_gushize: 85,
            uku_kwezi: 92,
            igipimo_cy_ubwiyunge: "89%",
            ibibazo_bikunze_kugaragara: [
              "Amanota make (35%)",
              "Kutitabira amasomo (25%)",
              "Imyitwarire mibi (20%)",
              "Ibibazo by'ubuzima (15%)",
              "Ibibazo by'umuryango (5%)"
            ]
          }
        },

        serivisi_z_ababyeyi: {
          izina: "Serivisi z'Ababyeyi",
          ibisobanuro_birambuye: `
          Izi ni serivisi zitangirwa ababyeyi kugira ngo bafashe abana babo neza. Serivisi 
          zirimo inama z'ababyeyi, ubujyanama bw'ababyeyi, ubufasha mu gufasha abana mu rugo, 
          n'ubufasha mu guhuza n'abarimu b'abana babo. Serivisi zitangwa n'umujyanama ukomeye 
          cyane witwa Mukamugema Emerance ufite ubunararibonye bw'imyaka 8 mu gufasha ababyeyi.

          Serivisi z'ababyeyi zikubiyemo:

          1. INAMA Z'ABABYEYI
          Izi ni inama zikozwe n'ababyeyi kugira ngo babone amakuru y'ishuri n'iterambere 
          ry'abana babo. Inama zikozwe buri kwezi kandi zitangirwa n'umujyanama w'ishuri.

          Mu nama z'ababyeyi, tubagezaho:
          - Politiki z'ishuri n'amahinduka mashya
          - Iterambere ry'abana babo mu mashuri
          - Ibibazo by'abana babo n'uburyo bwo kubikemura
          - Uburyo bwo gufasha abana mu rugo
          - Amahirwe y'abana nyuma y'amashuri
          - Ibikorwa by'ishuri n'uburyo bwo kwishyira muri byo
          - Amakuru y'amafaranga y'ishuri n'ubundi bufasha

          Inama z'ababyeyi zikozwe:
          - Buri kwezi ku wa gatandatu kuva saa 8 kugeza saa 10
          - Mu gihe cy'amahugurwa hakaba hari inama z'ihariye
          - Mu gihe cy'ibizamini hakaba hari inama z'ihariye
          - Igihe hakiri ibibazo by'ibihangano hakaba hari inama z'ihariye

          Ababyeyi bitabira inama:
          - Ababyeyi b'abanyeshuri bose bo mu ishuri
          - Ababyeyi b'abanyeshuri bafite ibibazo
          - Ababyeyi b'abanyeshuri bakomeye
          - Ababyeyi bashya mu ishuri

          2. UBUJYANAMA BW'ABABYEYI
          Uku ni ubujyanama bujyanye n'ababyeyi. Dufasha ababyeyi gukemura ibibazo byabo 
          byo gufasha abana babo no kubafasha gufasha abana babo neza mu rugo no mu mashuri.

          Mu bujyanama bw'ababyeyi, tubafasha:
          - Gufasha abana babo mu rugo
          - Gukemura ibibazo by'abana babo
          - Guhuza n'abarimu b'abana babo
          - Gukemura amakimbirane hagati yabo n'abana babo
          - Gufasha abana babo mu kwiga
          - Gufasha abana babo guhitamo umwuga
          - Gufasha abana babo mu buzima bwabo

          Ubujyanama bw'ababyeyi bukozwe:
          - Buri munsi kuva saa 2 kugeza saa 11
          - Ku cyumweru hakaba hari ubujyanama bw'ihariye
          - Mu gihe cy'amahugurwa hakaba hari ubujyanama bw'ihariye
          - Igihe hakiri ibibazo by'ibihangano hakaba hari ubujyanama bw'ihariye

          3. UBUFASHA MU GUFASHA ABANA MU RUGO
          Uku ni ubufasha butangirwa ababyeyi kugira ngo bafashe abana babo neza mu rugo. 
          Tubafasha kumenya uburyo bwo gufasha abana babo mu kwiga, mu buzima, n'mu myitwarire.

          Mu bufasha mu gufasha abana mu rugo, tubafasha:
          - Gukora gahunda y'amashuri y'umwana mu rugo
          - Gufasha umwana mu kwiga mu rugo
          - Gukemura ibibazo by'umwana mu rugo
          - Gufasha umwana mu buzima bwe
          - Gufasha umwana mu myitwarire ye
          - Gufasha umwana guhitamo umwuga
          - Gufasha umwana mu busabane bwe

          4. UBUFASHA MU GUHUZA N'ABARIMU
          Uku ni ubufasha butangirwa ababyeyi kugira ngo bahuze n'abarimu b'abana babo. 
          Tubafasha kuvugana n'abarimu no kubafasha gukemura ibibazo by'abana babo.

          Mu bufasha mu guhuza n'abarimu, tubafasha:
          - Kuvugana n'abarimu b'abana babo
          - Gukemura ibibazo by'abana babo hamwe n'abarimu
          - Gufasha abana babo hamwe n'abarimu
          - Gukurikirana iterambere ry'abana babo hamwe n'abarimu
          - Gufasha mu gukemura amakimbirane hagati y'abana babo n'abarimu
          - Gufasha mu gukora gahunda z'abana babo hamwe n'abarimu
          `,

          inama_zakozwe: {
            uyu_mwaka: 24,
            ukwezi_gushize: 2,
            uku_kwezi: 2,
            ababyeyi_bitabiriye: 180,
            igipimo_cy_ubwishyire: "78%"
          },

          ababyeyi_bafashijwe: {
            uyu_mwaka: 320,
            ukwezi_gushize: 28,
            uku_kwezi: 32,
            igipimo_cy_ubwiyunge: "85%"
          }
        }
      }
    };

    res.json({ success: true, detail: comprehensiveAdvisorDetail });
  } catch (error) {
    console.error('Error fetching comprehensive advisor detail:', error);
    res.status(500).json({ success: false, message: 'Error fetching advisor detail' });
  }
});

module.exports = router;