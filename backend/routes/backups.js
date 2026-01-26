const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Backup directory
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get all backups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [backups] = await pool.execute(`
      SELECT b.*, u.username as created_by_name
      FROM backups b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `);
    
    res.json({ success: true, data: backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch backups' });
  }
});

// Get backup by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [backup] = await pool.execute(`
      SELECT b.*, u.username as created_by_name
      FROM backups b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = ?
    `, [req.params.id]);
    
    if (backup.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }
    
    res.json({ success: true, data: backup[0] });
  } catch (error) {
    console.error('Error fetching backup:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch backup' });
  }
});

// Create database backup
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    };
    
    // Create mysqldump command
    const command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} > "${filepath}"`;
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create backup', error: error.message });
      }
      
      try {
        const stats = fs.statSync(filepath);
        
        const [result] = await pool.execute(`
          INSERT INTO backups (filename, size, created_by)
          VALUES (?, ?, ?)
        `, [filename, stats.size, req.user.id]);
        
        res.json({ 
          success: true, 
          message: 'Backup created successfully', 
          data: {
            id: result.insertId,
            filename,
            size: stats.size
          }
        });
      } catch (dbError) {
        console.error('Error saving backup record:', dbError);
        res.status(500).json({ success: false, message: 'Backup created but failed to save record' });
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

// Download backup
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const [backup] = await pool.execute('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (backup.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }
    
    const filepath = path.join(BACKUP_DIR, backup[0].filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }
    
    res.download(filepath, backup[0].filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ success: false, message: 'Failed to download backup' });
  }
});

// Restore backup
router.post('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const [backup] = await pool.execute('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (backup.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }
    
    const filepath = path.join(BACKUP_DIR, backup[0].filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management'
    };
    
    const command = `mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} < "${filepath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore error:', error);
        return res.status(500).json({ success: false, message: 'Failed to restore backup', error: error.message });
      }
      
      res.json({ success: true, message: 'Backup restored successfully' });
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ success: false, message: 'Failed to restore backup' });
  }
});

// Delete backup
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [backup] = await pool.execute('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (backup.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found' });
    }
    
    const filepath = path.join(BACKUP_DIR, backup[0].filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    await pool.execute('DELETE FROM backups WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ success: false, message: 'Failed to delete backup' });
  }
});

module.exports = router;
