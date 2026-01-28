const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/topics', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = `
      SELECT df.*, 
        COUNT(DISTINCT fp.id) as post_count,
        COUNT(DISTINCT fpm.created_by) as member_count,
        u.username as created_by_name
      FROM discussion_forums df
      LEFT JOIN forum_posts fp ON df.id = fp.forum_id
      LEFT JOIN users u ON df.created_by = u.id
      LEFT JOIN (SELECT DISTINCT forum_id, created_by FROM forum_posts) fpm ON df.id = fpm.forum_id
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
    
    const [forums] = await pool.execute(query, params);
    res.json({ success: true, data: forums });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/topics/:id', async (req, res) => {
  try {
    const [forum] = await pool.execute(
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

router.post('/topics', async (req, res) => {
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
    
    const [result] = await pool.execute(
      `INSERT INTO discussion_forums (
        title, description, category, created_by, is_private,
        allowed_roles, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || 'Untitled', description || '', category || 'General', created_by || 1, is_private || false,
        JSON.stringify(allowed_roles || []), JSON.stringify(tags || []),
        status || 'active'
      ]
    );
    
    const [forum] = await pool.execute(
      'SELECT * FROM discussion_forums WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: forum[0] });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, forum_id } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT fp.*,
        u.username as author_name,
        u.email as author_email,
        u.profile_image as author_avatar,
        COUNT(DISTINCT fpr.id) as reply_count
      FROM forum_posts fp
      LEFT JOIN users u ON fp.created_by = u.id
      LEFT JOIN forum_posts fpr ON fp.id = fpr.parent_post_id
      WHERE fp.parent_post_id IS NULL
    `;
    const params = [];
    
    if (forum_id) {
      query += ' AND fp.forum_id = ?';
      params.push(forum_id);
    }
    
    query += ' GROUP BY fp.id ORDER BY fp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [posts] = await pool.execute(query, params);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/posts', async (req, res) => {
  try {
    const { forum_id, created_by, title, content } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO forum_posts (forum_id, created_by, title, content) VALUES (?, ?, ?, ?)`,
      [forum_id || 1, created_by || 1, title || 'Untitled', content || '']
    );
    
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
