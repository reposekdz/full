const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = `
      SELECT df.*, 
        COUNT(DISTINCT fp.id) as post_count,
        COUNT(DISTINCT fpm.user_id) as member_count,
        u.username as created_by_name
      FROM discussion_forums df
      LEFT JOIN forum_posts fp ON df.id = fp.forum_id
      LEFT JOIN users u ON df.created_by = u.id
      LEFT JOIN (SELECT DISTINCT forum_id, user_id FROM forum_posts) fpm ON df.id = fpm.forum_id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      query += ' AND df.category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND df.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (df.title LIKE ? OR df.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY df.id ORDER BY df.created_at DESC';
    
    const [forums] = await db.execute(query, params);
    res.json({ success: true, data: forums });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [forum] = await db.execute(
      `SELECT df.*, 
        u.username as created_by_name,
        u.email as created_by_email
      FROM discussion_forums df
      LEFT JOIN users u ON df.created_by = u.id
      WHERE df.id = ?`,
      [req.params.id]
    );
    
    if (!forum.length) {
      return res.status(404).json({ success: false, message: 'Forum not found' });
    }
    
    res.json({ success: true, data: forum[0] });
  } catch (error) {
    console.error('Error fetching forum:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      created_by,
      is_private,
      allowed_roles,
      tags,
      status
    } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO discussion_forums (
        title, description, category, created_by, is_private,
        allowed_roles, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, category, created_by, is_private || false,
        JSON.stringify(allowed_roles || []), JSON.stringify(tags || []),
        status || 'active'
      ]
    );
    
    const [forum] = await db.execute(
      'SELECT * FROM discussion_forums WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: forum[0] });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      is_private,
      allowed_roles,
      tags,
      status
    } = req.body;
    
    await db.execute(
      `UPDATE discussion_forums SET
        title = ?, description = ?, category = ?, is_private = ?,
        allowed_roles = ?, tags = ?, status = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        title, description, category, is_private,
        JSON.stringify(allowed_roles), JSON.stringify(tags),
        status, req.params.id
      ]
    );
    
    const [forum] = await db.execute(
      'SELECT * FROM discussion_forums WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: forum[0] });
  } catch (error) {
    console.error('Error updating forum:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM forum_posts WHERE forum_id = ?', [req.params.id]);
    await db.execute('DELETE FROM discussion_forums WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Forum deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    const offset = (page - 1) * limit;
    
    let orderBy = 'fp.created_at DESC';
    if (sort === 'popular') orderBy = 'reply_count DESC, fp.created_at DESC';
    if (sort === 'oldest') orderBy = 'fp.created_at ASC';
    
    const [posts] = await db.execute(
      `SELECT fp.*,
        u.username as author_name,
        u.email as author_email,
        u.profile_image as author_avatar,
        COUNT(DISTINCT fpr.id) as reply_count,
        COUNT(DISTINCT fpl.id) as like_count
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      LEFT JOIN (
        SELECT parent_post_id as id FROM forum_posts WHERE parent_post_id IS NOT NULL
      ) fpr ON fp.id = fpr.id
      LEFT JOIN (
        SELECT post_id as id FROM group_post_likes WHERE post_type = 'forum'
      ) fpl ON fp.id = fpl.id
      WHERE fp.forum_id = ? AND fp.parent_post_id IS NULL
      GROUP BY fp.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [req.params.id, parseInt(limit), parseInt(offset)]
    );
    
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM forum_posts WHERE forum_id = ? AND parent_post_id IS NULL',
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/posts', async (req, res) => {
  try {
    const { user_id, title, content, attachments, is_pinned } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO forum_posts (
        forum_id, user_id, title, content, attachments, is_pinned
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.params.id, user_id, title, content,
        JSON.stringify(attachments || []), is_pinned || false
      ]
    );
    
    const [post] = await db.execute(
      `SELECT fp.*, u.username as author_name
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: post[0] });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/posts/:postId', async (req, res) => {
  try {
    const [post] = await db.execute(
      `SELECT fp.*,
        u.username as author_name,
        u.email as author_email,
        u.profile_image as author_avatar
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.id = ?`,
      [req.params.postId]
    );
    
    if (!post.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const [replies] = await db.execute(
      `SELECT fp.*,
        u.username as author_name,
        u.email as author_email,
        u.profile_image as author_avatar
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.parent_post_id = ?
      ORDER BY fp.created_at ASC`,
      [req.params.postId]
    );
    
    res.json({
      success: true,
      data: {
        ...post[0],
        replies
      }
    });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/posts/:postId/reply', async (req, res) => {
  try {
    const { user_id, content, attachments } = req.body;
    
    const [parentPost] = await db.execute(
      'SELECT forum_id FROM forum_posts WHERE id = ?',
      [req.params.postId]
    );
    
    if (!parentPost.length) {
      return res.status(404).json({ success: false, message: 'Parent post not found' });
    }
    
    const [result] = await db.execute(
      `INSERT INTO forum_posts (
        forum_id, user_id, content, attachments, parent_post_id
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        parentPost[0].forum_id, user_id, content,
        JSON.stringify(attachments || []), req.params.postId
      ]
    );
    
    const [reply] = await db.execute(
      `SELECT fp.*, u.username as author_name
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: reply[0] });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const [existing] = await db.execute(
      'SELECT id FROM group_post_likes WHERE post_id = ? AND user_id = ? AND post_type = "forum"',
      [req.params.postId, user_id]
    );
    
    if (existing.length) {
      await db.execute(
        'DELETE FROM group_post_likes WHERE post_id = ? AND user_id = ? AND post_type = "forum"',
        [req.params.postId, user_id]
      );
      res.json({ success: true, liked: false });
    } else {
      await db.execute(
        'INSERT INTO group_post_likes (post_id, user_id, post_type) VALUES (?, ?, "forum")',
        [req.params.postId, user_id]
      );
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/posts/:postId', async (req, res) => {
  try {
    await db.execute('DELETE FROM forum_posts WHERE parent_post_id = ?', [req.params.postId]);
    await db.execute('DELETE FROM forum_posts WHERE id = ?', [req.params.postId]);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT df.id) as total_forums,
        COUNT(DISTINCT fp.id) as total_posts,
        COUNT(DISTINCT fp.user_id) as active_users,
        COUNT(CASE WHEN df.status = 'active' THEN 1 END) as active_forums
      FROM discussion_forums df
      LEFT JOIN forum_posts fp ON df.id = fp.forum_id
    `);
    
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
