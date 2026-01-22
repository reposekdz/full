const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/collaboration/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Invalid file type'));
  }
});

// Study Groups
router.get('/groups', async (req, res) => {
  try {
    const [groups] = await pool.execute(`
      SELECT g.*, u.first_name, u.last_name,
             COUNT(DISTINCT gm.user_id) as member_count,
             COUNT(DISTINCT gp.id) as post_count
      FROM study_groups g
      JOIN users u ON g.created_by = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_posts gp ON g.id = gp.group_id
      WHERE g.status = 'active'
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/groups', async (req, res) => {
  try {
    const { name, description, subject, max_members, created_by, privacy } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO study_groups (name, description, subject, max_members, created_by, privacy, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [name, description, subject, max_members, created_by, privacy || 'public']
    );
    await pool.execute(`INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')`, [result.insertId, created_by]);
    res.json({ success: true, groupId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/groups/:id/join', async (req, res) => {
  try {
    const { user_id } = req.body;
    await pool.execute(`INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')`, [req.params.id, user_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/groups/:id/posts', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT gp.*, u.first_name, u.last_name, u.profile_image,
             COUNT(DISTINCT gpc.id) as comment_count,
             COUNT(DISTINCT gpl.id) as like_count
      FROM group_posts gp
      JOIN users u ON gp.user_id = u.id
      LEFT JOIN group_post_comments gpc ON gp.id = gpc.post_id
      LEFT JOIN group_post_likes gpl ON gp.id = gpl.post_id
      WHERE gp.group_id = ?
      GROUP BY gp.id
      ORDER BY gp.created_at DESC
    `, [req.params.id]);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/groups/:id/posts', upload.array('attachments', 5), async (req, res) => {
  try {
    const { user_id, content } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO group_posts (group_id, user_id, content) VALUES (?, ?, ?)`,
      [req.params.id, user_id, content]
    );
    if (req.files?.length) {
      for (const file of req.files) {
        await pool.execute(
          `INSERT INTO group_post_attachments (post_id, file_url, file_name, file_type) VALUES (?, ?, ?, ?)`,
          [result.insertId, `/uploads/collaboration/${file.filename}`, file.originalname, file.mimetype]
        );
      }
    }
    res.json({ success: true, postId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { user_id, comment } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO group_post_comments (post_id, user_id, comment) VALUES (?, ?, ?)`,
      [req.params.id, user_id, comment]
    );
    res.json({ success: true, commentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/posts/:id/like', async (req, res) => {
  try {
    const { user_id } = req.body;
    await pool.execute(`INSERT INTO group_post_likes (post_id, user_id) VALUES (?, ?)`, [req.params.id, user_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
