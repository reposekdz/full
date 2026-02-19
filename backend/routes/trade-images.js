const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for trade image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/trades');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const tradeCode = req.body.tradeCode || 'default';
    const ext = path.extname(file.originalname);
    cb(null, `${tradeCode.toLowerCase()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|jfif|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/jpeg';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, JFIF, PNG, WebP) are allowed!'));
    }
  }
});

// Upload trade image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/trades/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Trade image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading trade image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Get all trade images
router.get('/list', (req, res) => {
  try {
    const tradesDir = path.join(__dirname, '../uploads/trades');
    
    if (!fs.existsSync(tradesDir)) {
      return res.json({ success: true, images: [] });
    }

    const files = fs.readdirSync(tradesDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|jfif|png|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `/uploads/trades/${file}`,
        tradeCode: file.replace(/\.(jpg|jpeg|png|webp)$/i, '').toUpperCase()
      }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error listing trade images:', error);
    res.status(500).json({ success: false, message: 'Failed to list images' });
  }
});

// Delete trade image
router.delete('/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/trades', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting trade image:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// Get gallery images for a specific trade
router.get('/gallery/:tradeCode', (req, res) => {
  try {
    let tradeCode = req.params.tradeCode.toUpperCase();
    // Normalize AUT to AUTO for file system
    if (tradeCode === 'AUT') tradeCode = 'AUTO';
    const tradeDir = path.join(__dirname, '../uploads/trades', tradeCode);
    const toolsDir = path.join(tradeDir, 'tools');
    
    const gallery = [];

    // Get images from trade root folder
    if (fs.existsSync(tradeDir)) {
      const tradeFiles = fs.readdirSync(tradeDir)
        .filter(file => /\.(jpg|jpeg|jfif|png|webp)$/i.test(file));
      
      tradeFiles.forEach(file => {
        gallery.push({
          url: `/uploads/trades/${tradeCode}/${file}`,
          title: file.replace(/\.(jpg|jpeg|jfif|png|webp)$/i, ''),
          category: 'General',
          filename: file
        });
      });
    }

    // Get images from tools folder
    if (fs.existsSync(toolsDir)) {
      const toolFiles = fs.readdirSync(toolsDir)
        .filter(file => /\.(jpg|jpeg|jfif|png|webp)$/i.test(file));
      
      toolFiles.forEach(file => {
        gallery.push({
          url: `/uploads/trades/${tradeCode}/tools/${file}`,
          title: file.replace(/\.(jpg|jpeg|jfif|png|webp)$/i, '').replace(/-/g, ' '),
          category: 'Tools & Equipment',
          filename: file
        });
      });
    }

    res.json({ success: true, gallery, count: gallery.length });
  } catch (error) {
    console.error('Error getting trade gallery:', error);
    res.status(500).json({ success: false, message: 'Failed to get gallery images' });
  }
});

module.exports = router;
