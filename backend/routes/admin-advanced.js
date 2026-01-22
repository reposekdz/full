const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for admin uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldMap = {
      'news_image': 'uploads/news/',
      'event_images': 'uploads/events/',
      'announcement_files': 'uploads/announcements/',
      'media_files': 'uploads/media/'
    };
    cb(null, fieldMap[file.fieldname] || 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|mp4|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});

// News Management
router.get('/news', async (req, res) => {
  try {
    const { category, status, limit } = req.query;
    let query = `SELECT n.*, u.first_name, u.last_name FROM news n JOIN users u ON n.author_id = u.id WHERE 1=1`;
    const params = [];
    
    if (category) {
      query += ` AND n.category = ?`;
      params.push(category);
    }
    if (status) {
      query += ` AND n.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY n.published_date DESC`;
    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }
    
    const [news] = await db.query(query, params);
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create news with image
router.post('/news', upload.single('news_image'), async (req, res) => {
  try {
    const { title, content, excerpt, category, author_id, tags, published_date, featured } = req.body;
    const image = req.file ? `/uploads/news/${req.file.filename}` : null;
    
    const [result] = await db.query(
      `INSERT INTO news (title, content, excerpt, category, image, author_id, tags, published_date, featured, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [title, content, excerpt, category, image, author_id, tags, published_date || new Date(), featured ? 1 : 0]
    );
    res.json({ success: true, newsId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update news
router.put('/news/:id', upload.single('news_image'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured, status } = req.body;
    let query = `UPDATE news SET title = ?, content = ?, excerpt = ?, category = ?, tags = ?, featured = ?, status = ?`;
    const params = [title, content, excerpt, category, tags, featured ? 1 : 0, status];
    
    if (req.file) {
      query += `, image = ?`;
      params.push(`/uploads/news/${req.file.filename}`);
    }
    
    query += ` WHERE id = ?`;
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete news
router.delete('/news/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM news WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Event Management
router.get('/events', async (req, res) => {
  try {
    const { type, status, upcoming } = req.query;
    let query = `SELECT e.*, COUNT(DISTINCT ei.id) as image_count, COUNT(DISTINCT ep.id) as participant_count 
                 FROM events e 
                 LEFT JOIN event_images ei ON e.id = ei.event_id 
                 LEFT JOIN event_participants ep ON e.id = ep.event_id 
                 WHERE 1=1`;
    const params = [];
    
    if (type) {
      query += ` AND e.type = ?`;
      params.push(type);
    }
    if (status) {
      query += ` AND e.status = ?`;
      params.push(status);
    }
    if (upcoming === 'true') {
      query += ` AND e.start_date >= CURDATE()`;
    }
    
    query += ` GROUP BY e.id ORDER BY e.start_date DESC`;
    const [events] = await db.query(query, params);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create event with multiple images
router.post('/events', upload.array('event_images', 10), async (req, res) => {
  try {
    const { title, description, type, start_date, end_date, venue, organizer, max_participants, registration_deadline } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO events (title, description, type, start_date, end_date, venue, organizer, max_participants, registration_deadline, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [title, description, type, start_date, end_date, venue, organizer, max_participants, registration_deadline]
    );
    
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => 
        db.query(
          `INSERT INTO event_images (event_id, image_url, is_primary) VALUES (?, ?, ?)`,
          [result.insertId, `/uploads/events/${file.filename}`, index === 0 ? 1 : 0]
        )
      );
      await Promise.all(imagePromises);
    }
    
    res.json({ success: true, eventId: result.insertId, imagesUploaded: req.files?.length || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const { title, description, start_date, end_date, venue, status } = req.body;
    await db.query(
      `UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, venue = ?, status = ? WHERE id = ?`,
      [title, description, start_date, end_date, venue, status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event images
router.get('/events/:id/images', async (req, res) => {
  try {
    const [images] = await db.query(
      `SELECT * FROM event_images WHERE event_id = ? ORDER BY is_primary DESC, uploaded_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Announcement System
router.get('/announcements', async (req, res) => {
  try {
    const { target_audience, priority, active } = req.query;
    let query = `SELECT a.*, u.first_name, u.last_name FROM announcements a JOIN users u ON a.created_by = u.id WHERE 1=1`;
    const params = [];
    
    if (target_audience) {
      query += ` AND a.target_audience = ?`;
      params.push(target_audience);
    }
    if (priority) {
      query += ` AND a.priority = ?`;
      params.push(priority);
    }
    if (active === 'true') {
      query += ` AND a.start_date <= NOW() AND a.end_date >= NOW()`;
    }
    
    query += ` ORDER BY a.priority DESC, a.created_at DESC`;
    const [announcements] = await db.query(query, params);
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create announcement with attachments
router.post('/announcements', upload.array('announcement_files', 5), async (req, res) => {
  try {
    const { title, content, target_audience, priority, start_date, end_date, created_by, send_email, send_sms } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO announcements (title, content, target_audience, priority, start_date, end_date, created_by, send_email, send_sms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, target_audience, priority, start_date, end_date, created_by, send_email ? 1 : 0, send_sms ? 1 : 0]
    );
    
    if (req.files && req.files.length > 0) {
      const filePromises = req.files.map(file => 
        db.query(
          `INSERT INTO announcement_attachments (announcement_id, file_url, file_name, file_type) VALUES (?, ?, ?, ?)`,
          [result.insertId, `/uploads/announcements/${file.filename}`, file.originalname, file.mimetype]
        )
      );
      await Promise.all(filePromises);
    }
    
    res.json({ success: true, announcementId: result.insertId, filesUploaded: req.files?.length || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Media Library
router.get('/media', async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = `SELECT * FROM media_library WHERE 1=1`;
    const params = [];
    
    if (type) {
      query += ` AND file_type = ?`;
      params.push(type);
    }
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY uploaded_at DESC`;
    const [media] = await db.query(query, params);
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload to media library
router.post('/media', upload.array('media_files', 20), async (req, res) => {
  try {
    const { category, uploaded_by } = req.body;
    
    const insertPromises = req.files.map(file => 
      db.query(
        `INSERT INTO media_library (file_name, file_url, file_type, file_size, category, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [file.originalname, `/uploads/media/${file.filename}`, file.mimetype, file.size, category, uploaded_by]
      )
    );
    
    await Promise.all(insertPromises);
    res.json({ success: true, filesUploaded: req.files.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// System Settings
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await db.query(`SELECT * FROM system_settings`);
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    const updatePromises = Object.entries(settings).map(([key, value]) => 
      db.query(
        `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, value, value]
      )
    );
    await Promise.all(updatePromises);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM news WHERE status = 'published') as published_news,
        (SELECT COUNT(*) FROM events WHERE status = 'scheduled' OR status = 'ongoing') as active_events,
        (SELECT COUNT(*) FROM announcements WHERE start_date <= NOW() AND end_date >= NOW()) as active_announcements,
        (SELECT COUNT(*) FROM media_library) as media_files,
        (SELECT COUNT(*) FROM students WHERE status = 'active') as active_students,
        (SELECT COUNT(*) FROM teachers WHERE status = 'active') as active_teachers
    `);
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activity Log
router.get('/activity-log', async (req, res) => {
  try {
    const { user_id, action_type, limit } = req.query;
    let query = `SELECT al.*, u.first_name, u.last_name, u.email 
                 FROM activity_log al 
                 JOIN users u ON al.user_id = u.id 
                 WHERE 1=1`;
    const params = [];
    
    if (user_id) {
      query += ` AND al.user_id = ?`;
      params.push(user_id);
    }
    if (action_type) {
      query += ` AND al.action_type = ?`;
      params.push(action_type);
    }
    
    query += ` ORDER BY al.created_at DESC`;
    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }
    
    const [logs] = await db.query(query, params);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
