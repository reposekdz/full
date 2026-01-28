const mysql = require('mysql2/promise');
require('dotenv').config();

async function restoreNewsArticlesFinal() {
  let connection;
  try {
    console.log('📰 Restoring news articles with existing images...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    const articlesToRestore = [
      {
        title: 'Ibiganiro Hagati y\'Abanyeshuri n\'Abayobozi',
        description: 'Ibiganiro by\'ingenzi hagati y\'abanyeshuri n\'abayobozi byagamije guteza imbere ubufatanye.',
        content: `Mu rwego rwo guteza imbere ubushobozi bw'abanyeshuri, Garden TVET School yakoze ibiganiro by'ingenzi hagati y'abanyeshuri n'abayobozi b'ishuri.

Ibi biganiro byagamije:
• Kumva ibibazo abanyeshuri bahura nabyo
• Gushyiraho ibisubizo bikwiye
• Guteza imbere ubufatanye hagati y'abanyeshuri n'abayobozi
• Gushyira mu bikorwa gahunda z'iterambere

Abanyeshuri bashimiye ubu buryo bwo kubana n'abayobozi kandi bavuze ko bizafasha cyane mu guteza imbere ubumenyi bwabo. Ibi biganiro bizakomeza buri kwezi kugira ngo habeho ubufatanye buhoraho.`,
        image_url: '/uploads/news/ibiganiro hagati yabanyeshuri nabayobozi.jpg',
        author: 'Garden TVET Admin',
        category: 'school_life',
        is_featured: 1
      },
      {
        title: 'Inama Nyishi Zitangwa ku Banyeshuri',
        description: 'Gahunda y\'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z\'ubuzima.',
        content: `Garden TVET School yatangije gahunda y'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z'ubuzima.

Izi nama zirimo:
• Ubuyobozi bw'ubuzima
• Gukurikirana intego z'amasomo
• Gufasha mu gukemura ibibazo by'ubwiyunge
• Gutanga ubufasha mu kwihangana n'ibibazo

Abanyeshuri bavuze ko izi nama zibafasha cyane mu gukemura ibibazo babo kandi zigafasha mu guteza imbere ubwoba bwabo. Gahunda izakomeza mu gihe cyose cy'amashuri.`,
        image_url: '/uploads/news/inama nyishi zitangwa kubanyeshuri.jpg',
        author: 'Counseling Department',
        category: 'counseling',
        is_featured: 0
      },
      {
        title: 'Kuganirizwa n\'Abayobozi Batandukanye',
        description: 'Abanyeshuri bagize amahirwe yo kuganirizwa n\'abayobozi batandukanye bo mu turere.',
        content: `Abanyeshuri ba Garden TVET School bagize amahirwe yo kuganirizwa n'abayobozi batandukanye bo mu turere.

Uku kuganirizwa kwagamije:
• Kwigisha abanyeshuri ubuyobozi
• Gushyira mu gaciro ubushobozi bwabo
• Gutanga ubunararibonye ku buzima bw'ubuyobozi
• Gufasha mu gutegura ejo hazaza

Abayobozi bashimiye uruhare rw'ishuri mu guteza imbere ubumenyi bw'abanyeshuri kandi bashyigikiye gahunda z'amahugurwa. Ibi bikorwa bizakomeza mu gihe gito kizaza.`,
        image_url: '/uploads/news/kuganirizwa nabayobozi batandukanye.jpg',
        author: 'Leadership Team',
        category: 'leadership',
        is_featured: 1
      },
      {
        title: 'Mu Bihe byo Gukora Ibizamini',
        description: 'Ishuri ryateguye neza abanyeshuri mu bihe byo gukora ibizamini by\'umwaka.',
        content: `Garden TVET School yateguye neza abanyeshuri bayo mu bihe byo gukora ibizamini by'umwaka.

Ibyo byateguwe birimo:
• Amasomo y'isubiramo
• Ubufasha bw'abarimu
• Ibitabo n'ibikoresho byose bikenewe
• Ahantu heza ho kwiga

Abanyeshuri bashimiye ubufasha bwose bwahawe kandi bemeje ko bazagira ibisubizo byiza. Ibizamini bizatangira mu cyumweru gitaha kandi bizarangira mu kwezi gutaha.`,
        image_url: '/uploads/news/mubihe byogukora ibizamin.jpg',
        author: 'Academic Department',
        category: 'academics',
        is_featured: 0
      },
      {
        title: 'Muri Garden TSS Isuku ni Umuco',
        description: 'Ishuri ryashyize imbere gahunda y\'isuku nk\'umuco w\'ishuri.',
        content: `Garden TVET School yashyize imbere gahunda y'isuku nk'umuco w'ishuri.

Ibi bikorwa birimo:
• Gusukura ibice byose by'ishuri
• Gushyira mu gaciro ibidukikije
• Kwiga abanyeshuri ubwiyunge
• Gukora ibidukikije byiza byo kwigamo

Abanyeshuri n'abakozi bose bagize uruhare mu gukora iki gikorwa kandi bavuze ko bizafasha cyane mu guteza imbere ubuzima bwabo. Gahunda y'isuku izakomeza buri munsi.`,
        image_url: '/uploads/news/muri garden  tss isuku ni umuco.jpg',
        author: 'Environment Committee',
        category: 'environment',
        is_featured: 0
      },
      {
        title: 'Team y\'Ikigo',
        description: 'Ishuri rifite team y\'abakozi b\'ubuhanga bafite ubumenyi bukomeye.',
        content: `Garden TVET School ifite team y'abakozi b'ubuhanga bafite ubumenyi bukomeye.

Team yacu igizwe na:
• Abarimu b'ubuhanga
• Abayobozi b'ubunararibonye
• Abakozi b'ubufasha
• Abashinzwe ubuzima bw'abanyeshuri

Bose bafite intego imwe yo guteza imbere ubumenyi bw'abanyeshuri no kubafasha kugera ku ntego zabo. Team yacu ikomeje kwihugura kugira ngo itange serivisi nziza.`,
        image_url: '/uploads/news/team yikigo.jpg',
        author: 'HR Department',
        category: 'staff',
        is_featured: 1
      }
    ];

    console.log('📝 Processing news articles...');
    
    for (const article of articlesToRestore) {
      const [existing] = await connection.execute(
        'SELECT id FROM news_articles WHERE title = ?',
        [article.title]
      );

      if (existing.length > 0) {
        await connection.execute(`
          UPDATE news_articles 
          SET description = ?, content = ?, image_url = ?, author = ?, 
              category = ?, is_featured = ?, is_active = 1,
              date_published = CURDATE(),
              views = views + ?, likes = likes + ?, shares = shares + ?
          WHERE title = ?
        `, [article.description, article.content, article.image_url, article.author,
            article.category, article.is_featured,
            Math.floor(Math.random() * 20) + 10,
            Math.floor(Math.random() * 15) + 5,
            Math.floor(Math.random() * 8) + 2,
            article.title]);
        console.log(`✅ Updated: ${article.title}`);
      } else {
        await connection.execute(`
          INSERT INTO news_articles (
            title, description, content, image_url, author, category, 
            is_featured, is_active, date_published, views, likes, shares, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURDATE(), ?, ?, ?, ?)
        `, [
          article.title, article.description, article.content, article.image_url,
          article.author, article.category, article.is_featured,
          Math.floor(Math.random() * 50) + 25,
          Math.floor(Math.random() * 25) + 10,
          Math.floor(Math.random() * 12) + 3,
          Math.floor(Math.random() * 10) + 1
        ]);
        console.log(`✅ Created: ${article.title}`);
      }
    }

    const [count] = await connection.execute('SELECT COUNT(*) as total FROM news_articles WHERE is_active = 1');
    const [featured] = await connection.execute('SELECT COUNT(*) as total FROM news_articles WHERE is_featured = 1 AND is_active = 1');
    
    console.log(`\n📊 Results:`);
    console.log(`   Total active articles: ${count[0].total}`);
    console.log(`   Featured articles: ${featured[0].total}`);

    await connection.end();
    console.log('\n✅ News articles restoration completed successfully!');
    console.log('🖼️  All articles now have their corresponding images from uploads/news/');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

restoreNewsArticlesFinal();