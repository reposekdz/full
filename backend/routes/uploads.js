const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads with organized folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'general';
    const uploadPath = path.join(__dirname, '../uploads', type);
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${sanitizedName.split('.')[0]}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  
  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter
});

// Upload single image with database tracking
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const type = req.query.type || 'general';
    const fileUrl = `/uploads/${type}/${req.file.filename}`;
    
    // Store file info in database
    await pool.execute(
      'INSERT INTO uploaded_files (original_name, filename, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.file.originalname,
        req.file.filename,
        fileUrl,
        req.file.size,
        req.file.mimetype,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
        type: type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

// Upload multiple images
router.post('/images', authenticateToken, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

// Delete file
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

// Get uploaded files list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../uploads');
    
    if (!await fs.pathExists(uploadsPath)) {
      return res.json({
        success: true,
        files: []
      });
    }

    const files = await fs.readdir(uploadsPath);
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsPath, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          uploadDate: stats.birthtime,
          url: `/uploads/${filename}`,
          fullUrl: `${req.protocol}://${req.get('host')}/uploads/${filename}`
        };
      })
    );

    res.json({
      success: true,
      files: fileDetails
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get files'
    });
  }
});

module.exports = router;