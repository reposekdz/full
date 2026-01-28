const mysql = require('mysql2/promise');
require('dotenv').config();

async function restoreNewsArticles() {
  let connection;
  try {
    console.log('🔄 Restoring news articles from database...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    // Check if news_articles table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'news_articles'");
    if (tables.length === 0) {
      console.log('📝 Creating news_articles table...');
      await connection.execute(`
        CREATE TABLE news_articles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          image_url VARCHAR(500),
          category VARCHAR(100) DEFAULT 'general',
          author_id INT,
          is_featured BOOLEAN DEFAULT false,
          status ENUM('draft', 'published', 'archived') DEFAULT 'published',
          views INT DEFAULT 0,
          likes INT DEFAULT 0,
          shares INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Get admin user for author_id
    const [adminUser] = await connection.execute('SELECT id FROM admin_users WHERE role = "admin" LIMIT 1');
    const authorId = adminUser[0]?.id || 1;

    // Restore articles with existing images
    const articlesToRestore = [
      {
        title: 'Ibiganiro Hagati y\'Abanyeshuri n\'Abayobozi',
        content: `Mu rwego rwo guteza imbere ubushobozi bw'abanyeshuri, Garden TVET School yakoze ibiganiro by'ingenzi hagati y'abanyeshuri n'abayobozi b'ishuri.

Ibi biganiro byagamije:
• Kumva ibibazo abanyeshuri bahura nabyo
• Gushyiraho ibisubizo bikwiye
• Guteza imbere ubufatanye hagati y'abanyeshuri n'abayobozi
• Gushyira mu bikorwa gahunda z'iterambere

Abanyeshuri bashimiye ubu buryo bwo kubana n'abayobozi kandi bavuze ko bizafasha cyane mu guteza imbere ubumenyi bwabo.

Ibi biganiro bizakomeza buri kwezi kugira ngo habeho ubufatanye buhoraho.`,
        excerpt: 'Ibiganiro by\'ingenzi hagati y\'abanyeshuri n\'abayobozi byagamije guteza imbere ubufatanye no gukemura ibibazo.',
        image_url: '/uploads/news/ibiganiro hagati yabanyeshuri nabayobozi.jpg',
        category: 'school_life',
        is_featured: true
      },
      {
        title: 'Inama Nyishi Zitangwa ku Banyeshuri',
        content: `Garden TVET School yatangije gahunda y'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z'ubuzima.

Izi nama zirimo:
• Ubuyobozi bw'ubuzima
• Gukurikirana intego z'amasomo
• Gufasha mu gukemura ibibazo by'ubwiyunge
• Gutanga ubufasha mu kwihangana n'ibibazo

Abanyeshuri bavuze ko izi nama zibafasha cyane mu gukemura ibibazo babo kandi zigafasha mu guteza imbere ubwoba bwabo.

Gahunda izakomeza mu gihe cyose cy'amashuri.`,
        excerpt: 'Gahunda y\'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z\'ubuzima.',
        image_url: '/uploads/news/inama nyishi zitangwa kubanyeshuri.jpg',
        category: 'counseling',
        is_featured: false
      },
      {
        title: 'Kuganirizwa n\'Abayobozi Batandukanye',
        content: `Abanyeshuri ba Garden TVET School bagize amahirwe yo kuganirizwa n'abayobozi batandukanye bo mu turere.

Uku kuganirizwa kwagamije:
• Kwigisha abanyeshuri ubuyobozi
• Gushyira mu gaciro ubushobozi bwabo
• Gutanga ubunararibonye ku buzima bw'ubuyobozi
• Gufasha mu gutegura ejo hazaza

Abayobozi bashimiye uruhare rw'ishuri mu guteza imbere ubumenyi bw'abanyeshuri kandi bashyigikiye gahunda z'amahugurwa.

Ibi bikorwa bizakomeza mu gihe gito kizaza.`,
        excerpt: 'Abanyeshuri bagize amahirwe yo kuganirizwa n\'abayobozi batandukanye bo mu turere.',
        image_url: '/uploads/news/kuganirizwa nabayobozi batandukanye.jpg',
        category: 'leadership',
        is_featured: true
      },
      {
        title: 'Mu Bihe byo Gukora Ibizamini',
        content: `Garden TVET School yateguye neza abanyeshuri bayo mu bihe byo gukora ibizamini by'umwaka.

Ibyo byateguwe birimo:
• Amasomo y'isubiramo
• Ubufasha bw'abarimu
• Ibitabo n'ibikoresho byose bikenewe
• Ahantu heza ho kwiga

Abanyeshuri bashimiye ubufasha bwose bwahawe kandi bemeje ko bazagira ibisubizo byiza.

Ibizamini bizatangira mu cyumweru gitaha kandi bizarangira mu kwezi gutaha.`,
        excerpt: 'Ishuri ryateguye neza abanyeshuri mu bihe byo gukora ibizamini by\'umwaka.',
        image_url: '/uploads/news/mubihe byogukora ibizamin.jpg',
        category: 'academics',
        is_featured: false
      },
      {
        title: 'Muri Garden TSS Isuku ni Umuco',
        content: `Garden TVET School yashyize imbere gahunda y'isuku nk'umuco w'ishuri.

Ibi bikorwa birimo:
• Gusukura ibice byose by'ishuri
• Gushyira mu gaciro ibidukikije
• Kwiga abanyeshuri ubwiyunge
• Gukora ibidukikije byiza byo kwigamo

Abanyeshuri n'abakozi bose bagize uruhare mu gukora iki gikorwa kandi bavuze ko bizafasha cyane mu guteza imbere ubuzima bwabo.

Gahunda y'isuku izakomeza buri munsi.`,
        excerpt: 'Ishuri ryashyize imbere gahunda y\'isuku nk\'umuco w\'ishuri.',
        image_url: '/uploads/news/muri garden  tss isuku ni umuco.jpg',
        category: 'environment',
        is_featured: false
      },
      {
        title: 'Team y\'Ikigo',
        content: `Garden TVET School ifite team y'abakozi b'ubuhanga bafite ubumenyi bukomeye.

Team yacu igizwe na:
• Abarimu b'ubuhanga
• Abayobozi b'ubunararibonye
• Abakozi b'ubufasha
• Abashinzwe ubuzima bw'abanyeshuri

Bose bafite intego imwe yo guteza imbere ubumenyi bw'abanyeshuri no kubafasha kugera ku ntego zabo.

Team yacu ikomeje kwihugura kugira ngo itange serivisi nziza.`,
        excerpt: 'Ishuri rifite team y\'abakozi b\'ubuhanga bafite ubumenyi bukomeye.',
        image_url: '/uploads/news/team yikigo.jpg',
        category: 'staff',
        is_featured: true
      }
    ];

    console.log('📰 Inserting/Updating news articles...');
    
    for (const article of articlesToRestore) {
      const [existing] = await connection.execute(
        'SELECT id FROM news_articles WHERE title = ?',
        [article.title]
      );

      if (existing.length > 0) {
        await connection.execute(`
          UPDATE news_articles 
          SET content = ?, excerpt = ?, image_url = ?, category = ?, 
              is_featured = ?, author_id = ?, status = 'published',
              views = COALESCE(views, 0) + FLOOR(RAND() * 50) + 10,
              likes = COALESCE(likes, 0) + FLOOR(RAND() * 20) + 5,
              shares = COALESCE(shares, 0) + FLOOR(RAND() * 10) + 2
          WHERE title = ?
        `, [article.content, article.excerpt, article.image_url, article.category, 
            article.is_featured, authorId, article.title]);
        console.log(`✅ Updated: ${article.title}`);
      } else {
        await connection.execute(`
          INSERT INTO news_articles (
            title, content, excerpt, image_url, category, author_id, 
            is_featured, status, views, likes, shares
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
        `, [
          article.title, article.content, article.excerpt, article.image_url,
          article.category, authorId, article.is_featured,
          Math.floor(Math.random() * 50) + 10, // Random views
          Math.floor(Math.random() * 20) + 5,  // Random likes
          Math.floor(Math.random() * 10) + 2   // Random shares
        ]);
        console.log(`✅ Created: ${article.title}`);
      }
    }

    // Check final count
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM news_articles WHERE status = "published"');
    console.log(`\n📊 Total published articles: ${count[0].total}`);

    await connection.end();
    console.log('\n✅ News articles restoration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring news articles:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

restoreNewsArticles();