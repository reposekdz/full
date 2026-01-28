const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNewsTable() {
  let connection;
  try {
    console.log('🔍 Checking news table structure...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    // Check current table structure
    const [columns] = await connection.execute("DESCRIBE news_articles");
    console.log('📋 Current table structure:');
    console.table(columns);

    // Add missing columns if needed
    const columnNames = columns.map(col => col.Field);
    
    if (!columnNames.includes('excerpt')) {
      console.log('➕ Adding excerpt column...');
      await connection.execute('ALTER TABLE news_articles ADD COLUMN excerpt TEXT AFTER content');
    }
    
    if (!columnNames.includes('views')) {
      console.log('➕ Adding views column...');
      await connection.execute('ALTER TABLE news_articles ADD COLUMN views INT DEFAULT 0');
    }
    
    if (!columnNames.includes('likes')) {
      console.log('➕ Adding likes column...');
      await connection.execute('ALTER TABLE news_articles ADD COLUMN likes INT DEFAULT 0');
    }
    
    if (!columnNames.includes('shares')) {
      console.log('➕ Adding shares column...');
      await connection.execute('ALTER TABLE news_articles ADD COLUMN shares INT DEFAULT 0');
    }

    // Now restore articles
    const [adminUser] = await connection.execute('SELECT id FROM admin_users WHERE role = "admin" LIMIT 1');
    const authorId = adminUser[0]?.id || 1;

    const articlesToRestore = [
      {
        title: 'Ibiganiro Hagati y\'Abanyeshuri n\'Abayobozi',
        content: `Mu rwego rwo guteza imbere ubushobozi bw'abanyeshuri, Garden TVET School yakoze ibiganiro by'ingenzi hagati y'abanyeshuri n'abayobozi b'ishuri.

Ibi biganiro byagamije:
• Kumva ibibazo abanyeshuri bahura nabyo
• Gushyiraho ibisubizo bikwiye
• Guteza imbere ubufatanye hagati y'abanyeshuri n'abayobozi
• Gushyira mu bikorwa gahunda z'iterambere

Abanyeshuri bashimiye ubu buryo bwo kubana n'abayobozi kandi bavuze ko bizafasha cyane mu guteza imbere ubumenyi bwabo.`,
        excerpt: 'Ibiganiro by\'ingenzi hagati y\'abanyeshuri n\'abayobozi byagamije guteza imbere ubufatanye.',
        image_url: '/uploads/news/ibiganiro hagati yabanyeshuri nabayobozi.jpg',
        category: 'school_life',
        is_featured: 1
      },
      {
        title: 'Inama Nyishi Zitangwa ku Banyeshuri',
        content: `Garden TVET School yatangije gahunda y'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z'ubuzima.

Izi nama zirimo:
• Ubuyobozi bw'ubuzima
• Gukurikirana intego z'amasomo
• Gufasha mu gukemura ibibazo by'ubwiyunge
• Gutanga ubufasha mu kwihangana n'ibibazo

Abanyeshuri bavuze ko izi nama zibafasha cyane mu gukemura ibibazo babo.`,
        excerpt: 'Gahunda y\'inama nyishi zigamije gufasha abanyeshuri mu gutoranya inzira zabo z\'ubuzima.',
        image_url: '/uploads/news/inama nyishi zitangwa kubanyeshuri.jpg',
        category: 'counseling',
        is_featured: 0
      },
      {
        title: 'Kuganirizwa n\'Abayobozi Batandukanye',
        content: `Abanyeshuri ba Garden TVET School bagize amahirwe yo kuganirizwa n'abayobozi batandukanye bo mu turere.

Uku kuganirizwa kwagamije:
• Kwigisha abanyeshuri ubuyobozi
• Gushyira mu gaciro ubushobozi bwabo
• Gutanga ubunararibonye ku buzima bw'ubuyobozi
• Gufasha mu gutegura ejo hazaza`,
        excerpt: 'Abanyeshuri bagize amahirwe yo kuganirizwa n\'abayobozi batandukanye.',
        image_url: '/uploads/news/kuganirizwa nabayobozi batandukanye.jpg',
        category: 'leadership',
        is_featured: 1
      },
      {
        title: 'Mu Bihe byo Gukora Ibizamini',
        content: `Garden TVET School yateguye neza abanyeshuri bayo mu bihe byo gukora ibizamini by'umwaka.

Ibyo byateguwe birimo:
• Amasomo y'isubiramo
• Ubufasha bw'abarimu
• Ibitabo n'ibikoresho byose bikenewe
• Ahantu heza ho kwiga`,
        excerpt: 'Ishuri ryateguye neza abanyeshuri mu bihe byo gukora ibizamini.',
        image_url: '/uploads/news/mubihe byogukora ibizamin.jpg',
        category: 'academics',
        is_featured: 0
      },
      {
        title: 'Muri Garden TSS Isuku ni Umuco',
        content: `Garden TVET School yashyize imbere gahunda y'isuku nk'umuco w'ishuri.

Ibi bikorwa birimo:
• Gusukura ibice byose by'ishuri
• Gushyira mu gaciro ibidukikije
• Kwiga abanyeshuri ubwiyunge
• Gukora ibidukikije byiza byo kwigamo`,
        excerpt: 'Ishuri ryashyize imbere gahunda y\'isuku nk\'umuco w\'ishuri.',
        image_url: '/uploads/news/muri garden  tss isuku ni umuco.jpg',
        category: 'environment',
        is_featured: 0
      },
      {
        title: 'Team y\'Ikigo',
        content: `Garden TVET School ifite team y'abakozi b'ubuhanga bafite ubumenyi bukomeye.

Team yacu igizwe na:
• Abarimu b'ubuhanga
• Abayobozi b'ubunararibonye
• Abakozi b'ubufasha
• Abashinzwe ubuzima bw'abanyeshuri`,
        excerpt: 'Ishuri rifite team y\'abakozi b\'ubuhanga bafite ubumenyi bukomeye.',
        image_url: '/uploads/news/team yikigo.jpg',
        category: 'staff',
        is_featured: 1
      }
    ];

    console.log('\n📰 Restoring news articles...');
    
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
              views = views + ?, likes = likes + ?, shares = shares + ?
          WHERE title = ?
        `, [article.content, article.excerpt, article.image_url, article.category, 
            article.is_featured, authorId, 
            Math.floor(Math.random() * 20) + 5,
            Math.floor(Math.random() * 10) + 2,
            Math.floor(Math.random() * 5) + 1,
            article.title]);
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
          Math.floor(Math.random() * 100) + 20,
          Math.floor(Math.random() * 30) + 10,
          Math.floor(Math.random() * 15) + 5
        ]);
        console.log(`✅ Created: ${article.title}`);
      }
    }

    const [count] = await connection.execute('SELECT COUNT(*) as total FROM news_articles WHERE status = "published"');
    console.log(`\n📊 Total published articles: ${count[0].total}`);

    await connection.end();
    console.log('\n✅ News articles restored successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

fixNewsTable();