const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/content');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all content by type
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const { status, featured, limit = 100 } = req.query;

  try {
    let query = 'SELECT * FROM ?? WHERE 1=1';
    const params = [getTableName(type)];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (featured !== undefined) {
      query += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    query += ' ORDER BY `order` ASC, created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// GET single content item
router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM ?? WHERE id = ?', [getTableName(type), id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching ${type} ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// CREATE new content
router.post('/:type', upload.single('image'), async (req, res) => {
  const { type } = req.params;
  const { title, description, status = 'active', featured = false, metadata = '{}' } = req.body;

  try {
    const tableName = getTableName(type);
    const imagePath = req.file ? `/uploads/content/${req.file.filename}` : null;

    const insertData = {
      title,
      description,
      image: imagePath,
      status,
      featured: featured === 'true' || featured === true ? 1 : 0,
      metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Add type-specific fields
    addTypeSpecificFields(type, req.body, insertData);

    const [result] = await pool.query('INSERT INTO ?? SET ?', [tableName, insertData]);
    
    const [newItem] = await pool.query('SELECT * FROM ?? WHERE id = ?', [tableName, result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// UPDATE content
router.put('/:type/:id', upload.single('image'), async (req, res) => {
  const { type, id } = req.params;
  const { title, description, status, featured, metadata } = req.body;

  try {
    const tableName = getTableName(type);
    
    // Get existing item
    const [existing] = await pool.query('SELECT * FROM ?? WHERE id = ?', [tableName, id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const updateData = {
      updated_at: new Date()
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true ? 1 : 0;
    if (metadata) updateData.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    
    if (req.file) {
      updateData.image = `/uploads/content/${req.file.filename}`;
      // Delete old image
      if (existing[0].image) {
        const oldImagePath = path.join(__dirname, '..', existing[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Add type-specific fields
    addTypeSpecificFields(type, req.body, updateData);

    await pool.query('UPDATE ?? SET ? WHERE id = ?', [tableName, updateData, id]);
    
    const [updated] = await pool.query('SELECT * FROM ?? WHERE id = ?', [tableName, id]);
    res.json(updated[0]);
  } catch (error) {
    console.error(`Error updating ${type} ${id}:`, error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// DELETE content
router.delete('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const tableName = getTableName(type);
    
    // Get item to delete image
    const [item] = await pool.query('SELECT * FROM ?? WHERE id = ?', [tableName, id]);
    if (item.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete image file
    if (item[0].image) {
      const imagePath = path.join(__dirname, '..', item[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query('DELETE FROM ?? WHERE id = ?', [tableName, id]);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error(`Error deleting ${type} ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Helper function to get table name
function getTableName(type) {
  const tableMap = {
    'courses': 'courses',
    'gallery': 'gallery_images',
    'events': 'events',
    'testimonials': 'testimonials'
  };
  return tableMap[type] || type;
}

// Helper function to add type-specific fields
function addTypeSpecificFields(type, body, data) {
  switch (type) {
    case 'courses':
      if (body.duration) data.duration = body.duration;
      if (body.level) data.level = body.level;
      if (body.instructor) data.instructor = body.instructor;
      if (body.price) data.price = body.price;
      break;
    case 'events':
      if (body.event_date) data.event_date = body.event_date;
      if (body.location) data.location = body.location;
      if (body.organizer) data.organizer = body.organizer;
      break;
    case 'testimonials':
      if (body.author) data.author = body.author;
      if (body.role) data.role = body.role;
      if (body.rating) data.rating = body.rating;
      break;
    case 'gallery':
      if (body.category) data.category = body.category;
      if (body.photographer) data.photographer = body.photographer;
      break;
  }
}

// Create tables if they don't exist
async function ensureTables() {
  try {
    // Courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        duration VARCHAR(100),
        level VARCHAR(50),
        instructor VARCHAR(255),
        price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Gallery table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        category VARCHAR(100),
        photographer VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        event_date DATETIME,
        location VARCHAR(255),
        organizer VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        author VARCHAR(255),
        role VARCHAR(100),
        rating INT DEFAULT 5,
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        \`order\` INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Content tables ensured');
  } catch (error) {
    console.error('Error ensuring tables:', error);
  }
}

// Initialize tables
ensureTables();

module.exports = router;
