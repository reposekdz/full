const mysql = require('mysql2/promise');
require('dotenv').config();

const newsArticles = [
  {
    title: 'Ibiganiro hagati y\'abanyeshuri n\'abayobozi',
    description: 'Abanyeshuri baganiriza n\'abayobozi b\'ishuri kugira ngo babone ubufasha no kumenya inzira y\'iterambere.',
    content: 'Ibiganiro hagati y\'abanyeshuri n\'abayobozi ni ingenzi cyane mu guteza imbere ubumwe n\'ubufatanye mu ishuri. Izi nama zifasha abanyeshuri kumenya neza inzira y\'iterambere ryabo mu mashuri.',
    image_url: '/uploads/news/ibiganiro hagati yabanyeshuri nabayobozi.jpg',
    author: 'TSS Administration',
    category: 'School Life',
    is_featured: true
  },
  {
    title: 'Inama nyishi zitangwa ku banyeshuri',
    description: 'Abanyeshuri bahabwa inama z\'ingenzi zijyanye n\'amashuri n\'iterambere ry\'imyuga.',
    content: 'Inama nyishi zitangwa ku banyeshuri ni urugero rw\'ubufatanye hagati y\'abarimu n\'abanyeshuri. Izi nama zifasha abanyeshuri gufata ibyemezo byiza mu buzima bwabo.',
    image_url: '/uploads/news/inama nyishi zitangwa kubanyeshuri.jpg',
    author: 'TSS Counseling Team',
    category: 'Guidance',
    is_featured: false
  },
  {
    title: 'Kuganirizwa n\'abayobozi batandukanye',
    description: 'Abanyeshuri baganiririzwa n\'abayobozi batandukanye kugira ngo babone ubufasha mu bibazo bitandukanye.',
    content: 'Kuganirizwa n\'abayobozi batandukanye ni kimwe mu bikorwa by\'ingenzi mu ishuri. Ibi bikorwa bifasha abanyeshuri kubona ibisubizo ku bibazo byabo.',
    image_url: '/uploads/news/kuganirizwa nabayobozi batandukanye.jpg',
    author: 'TSS Leadership',
    category: 'Leadership',
    is_featured: false
  },
  {
    title: 'Mu bihe byo gukora ibizamini',
    description: 'Abanyeshuri bitegura ibizamini mu buryo bwiza kugira ngo babone amanota meza.',
    content: 'Igihe cy\'ibizamini ni igihe cy\'ingenzi cyane ku banyeshuri. Ishuri rifasha abanyeshuri kwitegura neza ibizamini kugira ngo babone ibisubizo byiza.',
    image_url: '/uploads/news/mubihe byogukora ibizamin.jpg',
    author: 'TSS Academic Team',
    category: 'Academics',
    is_featured: true
  },
  {
    title: 'Muri Garden TSS - Isuku ni umuco',
    description: 'Abanyeshuri bakora imirimo yo gusukura ishuri kugira ngo bakomeze umuco w\'isuku.',
    content: 'Isuku ni umuco mu ishuri rya TSS. Abanyeshuri bafatanya mu gusukura ahantu hatandukanye h\'ishuri kugira ngo bakomeze umuco mwiza w\'isuku.',
    image_url: '/uploads/news/muri garden  tss isuku ni umuco.jpg',
    author: 'TSS Environment Team',
    category: 'Environment',
    is_featured: false
  },
  {
    title: 'Team y\'ikigo',
    description: 'Abakozi b\'ishuri bafatanya mu guteza imbere uburezi bw\'abanyeshuri.',
    content: 'Team y\'ikigo ni urugero rw\'ubufatanye hagati y\'abakozi b\'ishuri. Aba bakozi bafatanya mu guteza imbere uburezi bw\'abanyeshuri.',
    image_url: '/uploads/news/team yikigo.jpg',
    author: 'TSS Staff',
    category: 'Staff',
    is_featured: true
  }
];

async function setupNewsArticles() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    });

    console.log('Connected to database');

    for (const article of newsArticles) {
      const [existing] = await connection.query(
        'SELECT id FROM news_articles WHERE title = ?',
        [article.title]
      );

      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO news_articles (title, description, content, image_url, author, category, is_featured, date_published, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), true)`,
          [article.title, article.description, article.content, article.image_url, article.author, article.category, article.is_featured]
        );
        console.log(`✓ Added article: ${article.title}`);
      } else {
        console.log(`- Article already exists: ${article.title}`);
      }
    }

    console.log('\n✓ News articles setup complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupNewsArticles();
