const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all system settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM system_settings ORDER BY setting_key ASC');
    
    // Convert array to object for easier access
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        type: setting.setting_type
      };
    });
    
    res.json({ success: true, data: settingsObj, raw: settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system settings' });
  }
});

// Get setting by key
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const [setting] = await pool.execute(
      'SELECT * FROM system_settings WHERE setting_key = ?',
      [req.params.key]
    );
    
    if (setting.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    
    res.json({ success: true, data: setting[0] });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch setting' });
  }
});

// Get settings by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM system_settings WHERE category = ? ORDER BY setting_key ASC',
      [req.params.category]
    );
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Create or update setting
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { setting_key, setting_value, description, setting_type, category } = req.body;
    
    // Check if setting exists
    const [existing] = await pool.execute(
      'SELECT id FROM system_settings WHERE setting_key = ?',
      [setting_key]
    );
    
    if (existing.length > 0) {
      // Update existing
      await pool.execute(`
        UPDATE system_settings 
        SET setting_value = ?, description = ?, setting_type = ?, category = ?
        WHERE setting_key = ?
      `, [setting_value, description, setting_type, category, setting_key]);
      
      res.json({ success: true, message: 'Setting updated successfully' });
    } else {
      // Create new
      const [result] = await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value, description, setting_type, category)
        VALUES (?, ?, ?, ?, ?)
      `, [setting_key, setting_value, description, setting_type || 'string', category || 'general']);
      
      res.json({ success: true, message: 'Setting created successfully', id: result.insertId });
    }
  } catch (error) {
    console.error('Error saving setting:', error);
    res.status(500).json({ success: false, message: 'Failed to save setting' });
  }
});

// Bulk update settings
router.put('/bulk', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings must be an array' });
    }
    
    for (const setting of settings) {
      await pool.execute(`
        UPDATE system_settings 
        SET setting_value = ?
        WHERE setting_key = ?
      `, [setting.value, setting.key]);
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Update setting by key
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { setting_value, description, setting_type, category } = req.body;
    
    await pool.execute(`
      UPDATE system_settings 
      SET setting_value = ?, description = ?, setting_type = ?, category = ?
      WHERE setting_key = ?
    `, [setting_value, description, setting_type, category, req.params.key]);
    
    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
});

// Delete setting
router.delete('/:key', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM system_settings WHERE setting_key = ?', [req.params.key]);
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ success: false, message: 'Failed to delete setting' });
  }
});

// Initialize default settings
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const defaultSettings = [
      { key: 'school_name', value: 'Garden TVET School', description: 'School name', type: 'string', category: 'general' },
      { key: 'school_email', value: 'info@gardentvet.edu', description: 'School email', type: 'string', category: 'general' },
      { key: 'school_phone', value: '+250 XXX XXX XXX', description: 'School phone', type: 'string', category: 'general' },
      { key: 'academic_year', value: '2024-2025', description: 'Current academic year', type: 'string', category: 'academic' },
      { key: 'current_term', value: 'Term 1', description: 'Current term', type: 'string', category: 'academic' },
      { key: 'attendance_grace_period', value: '15', description: 'Grace period for late arrival (minutes)', type: 'number', category: 'attendance' },
      { key: 'max_login_attempts', value: '5', description: 'Maximum login attempts before lockout', type: 'number', category: 'security' },
      { key: 'session_timeout', value: '3600', description: 'Session timeout (seconds)', type: 'number', category: 'security' },
      { key: 'enable_sms_notifications', value: 'true', description: 'Enable SMS notifications', type: 'boolean', category: 'notifications' },
      { key: 'enable_email_notifications', value: 'true', description: 'Enable email notifications', type: 'boolean', category: 'notifications' },
      { key: 'max_file_upload_size', value: '10485760', description: 'Maximum file upload size (bytes)', type: 'number', category: 'system' },
      { key: 'backup_frequency', value: 'daily', description: 'Automatic backup frequency', type: 'string', category: 'system' },
      { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode enabled', type: 'boolean', category: 'system' }
    ];
    
    for (const setting of defaultSettings) {
      const [existing] = await pool.execute(
        'SELECT id FROM system_settings WHERE setting_key = ?',
        [setting.key]
      );
      
      if (existing.length === 0) {
        await pool.execute(`
          INSERT INTO system_settings (setting_key, setting_value, description, setting_type, category)
          VALUES (?, ?, ?, ?, ?)
        `, [setting.key, setting.value, setting.description, setting.type, setting.category]);
      }
    }
    
    res.json({ success: true, message: 'Default settings initialized successfully' });
  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize settings' });
  }
});

module.exports = router;
