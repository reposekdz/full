const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Track article view
router.post('/:articleId/view', async (req, res) => {
  try {
    await db.query('UPDATE news SET views = COALESCE(views, 0) + 1 WHERE id = ?', [req.params.articleId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like article
router.post('/:articleId/like', async (req, res) => {
  try {
    await db.query('UPDATE news SET likes = COALESCE(likes, 0) + 1 WHERE id = ?', [req.params.articleId]);
    const [article] = await db.query('SELECT likes FROM news WHERE id = ?', [req.params.articleId]);
    res.json({ success: true, likes: article[0]?.likes || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unlike article
router.post('/:articleId/unlike', async (req, res) => {
  try {
    await db.query('UPDATE news SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = ?', [req.params.articleId]);
    const [article] = await db.query('SELECT likes FROM news WHERE id = ?', [req.params.articleId]);
    res.json({ success: true, likes: article[0]?.likes || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Share article
router.post('/:articleId/share', async (req, res) => {
  try {
    await db.query('UPDATE news SET shares = COALESCE(shares, 0) + 1 WHERE id = ?', [req.params.articleId]);
    const [article] = await db.query('SELECT shares FROM news WHERE id = ?', [req.params.articleId]);
    res.json({ success: true, shares: article[0]?.shares || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bookmark article
router.post('/:articleId/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    await db.query(
      'INSERT INTO article_bookmarks (article_id, user_id, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE created_at = NOW()',
      [req.params.articleId, userId || 'anonymous']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove bookmark
router.delete('/:articleId/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    await db.query('DELETE FROM article_bookmarks WHERE article_id = ? AND user_id = ?', [req.params.articleId, userId || 'anonymous']);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post comment
router.post('/:articleId/comment', async (req, res) => {
  try {
    const { text, author } = req.body;
    await db.query(
      'INSERT INTO article_comments (article_id, author, text, created_at) VALUES (?, ?, ?, NOW())',
      [req.params.articleId, author || 'Anonymous', text]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get article with comments
router.get('/:articleId', async (req, res) => {
  try {
    const [articles] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.articleId]);
    if (!articles || articles.length === 0) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const [comments] = await db.query(
      'SELECT * FROM article_comments WHERE article_id = ? ORDER BY created_at DESC',
      [req.params.articleId]
    );

    const article = {
      ...articles[0],
      views: articles[0].views || 0,
      likes: articles[0].likes || 0,
      shares: articles[0].shares || 0,
      comments: comments.map(c => ({
        id: c.id,
        author: c.author,
        text: c.text,
        time: new Date(c.created_at).toLocaleString(),
        likes: c.likes || 0,
        avatar: c.author.substring(0, 2).toUpperCase()
      }))
    };

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like comment
router.post('/:articleId/comment/:commentId/like', async (req, res) => {
  try {
    await db.query('UPDATE article_comments SET likes = COALESCE(likes, 0) + 1 WHERE id = ?', [req.params.commentId]);
    const [comment] = await db.query('SELECT likes FROM article_comments WHERE id = ?', [req.params.commentId]);
    res.json({ success: true, likes: comment[0]?.likes || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get related articles
router.get('/:articleId/related', async (req, res) => {
  try {
    const [current] = await db.query('SELECT category FROM news WHERE id = ?', [req.params.articleId]);
    if (!current || current.length === 0) {
      return res.json({ success: true, articles: [] });
    }

    const [articles] = await db.query(
      'SELECT id, title, description, image_url, publish_date, category FROM news WHERE category = ? AND id != ? AND is_active = 1 ORDER BY publish_date DESC LIMIT 3',
      [current[0].category, req.params.articleId]
    );

    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
