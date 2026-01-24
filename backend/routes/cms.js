const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/cms'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all content by section
router.get('/:section', async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM cms_content WHERE section = ? ORDER BY display_order', [req.params.section]);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single item
router.get('/:section/:id', async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM cms_content WHERE section = ? AND id = ?', [req.params.section, req.params.id]);
    res.json({ success: true, item: items[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update content
router.post('/:section', upload.single('image'), async (req, res) => {
  try {
    const { id, title, subtitle, description, content, link, metadata, display_order, active } = req.body;
    const image = req.file ? req.file.filename : null;
    
    if (id) {
      let query = 'UPDATE cms_content SET title=?, subtitle=?, description=?, content=?, link=?, metadata=?, display_order=?, active=?';
      const params = [title, subtitle, description, content, link, metadata, display_order, active];
      
      if (image) {
        query += ', image=?';
        params.push(image);
      }
      
      query += ' WHERE id=?';
      params.push(id);
      
      await db.query(query, params);
      res.json({ success: true, id });
    } else {
      const [result] = await db.query(
        'INSERT INTO cms_content (section, title, subtitle, description, content, image, link, metadata, display_order, active) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [req.params.section, title, subtitle, description, content, image, link, metadata, display_order, active || 1]
      );
      res.json({ success: true, id: result.insertId });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete content
router.delete('/:section/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cms_content WHERE section = ? AND id = ?', [req.params.section, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reorder items
router.put('/:section/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    for (let i = 0; i < items.length; i++) {
      await db.query('UPDATE cms_content SET display_order = ? WHERE id = ?', [i, items[i].id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
