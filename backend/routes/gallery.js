const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/gallery');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all gallery images (public)
router.get('/images', async (req, res) => {
  try {
    const [images] = await pool.execute(`
      SELECT * FROM gallery_images 
      WHERE is_active = true 
      ORDER BY sort_order ASC, created_at DESC
    `);
    
    res.json({
      success: true,
      images: images.map(img => ({
        ...img,
        image_url: `/uploads/gallery/${path.basename(img.image_url)}`
      }))
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gallery images' });
  }
});

// Upload new gallery image (admin only)
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, title_rw, description, description_rw, sort_order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    
    const [result] = await pool.execute(`
      INSERT INTO gallery_images (
        title, title_rw, description, description_rw, 
        image_url, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, true)
    `, [
      title || 'Campus Image',
      title_rw || 'Ifoto y\'Ikigo',
      description || '',
      description_rw || '',
      imageUrl,
      sort_order || 0
    ]);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: result.insertId,
        title,
        title_rw,
        image_url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Update gallery image (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_rw, description, description_rw, sort_order, is_active } = req.body;
    
    await pool.execute(`
      UPDATE gallery_images 
      SET title = ?, title_rw = ?, description = ?, description_rw = ?, 
          sort_order = ?, is_active = ?
      WHERE id = ?
    `, [title, title_rw, description, description_rw, sort_order, is_active, id]);

    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update image' });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [images] = await pool.execute('SELECT image_url FROM gallery_images WHERE id = ?', [id]);
    
    if (images.length > 0) {
      const imagePath = path.join(__dirname, '..', images[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await pool.execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

module.exports = router;
