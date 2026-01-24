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

// Sync CMS changes to original tables
const syncToOriginalTables = async (section, data) => {
  try {
    const mapping = {
      sports: { table: 'sports_teams', fields: ['name', 'description', 'image', 'achievements'] },
      services: { table: 'school_services', fields: ['title', 'description', 'icon', 'category'] },
      trades: { table: 'trades', fields: ['name', 'description', 'image', 'curriculum'] },
      leadership: { table: 'leadership', fields: ['name', 'position', 'bio', 'image'] },
      developers: { table: 'developers', fields: ['name', 'role', 'bio', 'image'] },
      support: { table: 'support_tickets', fields: ['title', 'description', 'status'] },
      homepage: { table: 'homepage_content', fields: ['section', 'title', 'content', 'image'] }
    };

    if (mapping[section]) {
      const { table, fields } = mapping[section];
      // Update or insert into original table
      await db.query(`INSERT INTO ${table} SET ? ON DUPLICATE KEY UPDATE ?`, [data, data]);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
};

// Get all content
router.get('/:section', async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM cms_content WHERE section = ? ORDER BY display_order', [req.params.section]);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update
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
    } else {
      const [result] = await db.query(
        'INSERT INTO cms_content (section, title, subtitle, description, content, image, link, metadata, display_order, active) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [req.params.section, title, subtitle, description, content, image, link, metadata, display_order, active || 1]
      );
      id = result.insertId;
    }

    // Sync to original tables
    await syncToOriginalTables(req.params.section, { title, description, image, content });
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete
router.delete('/:section/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cms_content WHERE section = ? AND id = ?', [req.params.section, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk import from existing APIs
router.post('/:section/import', async (req, res) => {
  try {
    const section = req.params.section;
    const tables = {
      sports: 'SELECT id, name as title, description, image FROM sports_teams',
      services: 'SELECT id, title, description, icon as image FROM school_services',
      trades: 'SELECT id, name as title, description, image FROM trades',
      leadership: 'SELECT id, name as title, position as subtitle, bio as description, image FROM leadership',
      developers: 'SELECT id, name as title, role as subtitle, bio as description, image FROM developers'
    };

    if (tables[section]) {
      const [rows] = await db.query(tables[section]);
      for (const row of rows) {
        await db.query(
          'INSERT INTO cms_content (section, title, subtitle, description, image) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)',
          [section, row.title, row.subtitle || '', row.description || '', row.image || '']
        );
      }
      res.json({ success: true, imported: rows.length });
    } else {
      res.json({ success: false, message: 'Section not supported' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
