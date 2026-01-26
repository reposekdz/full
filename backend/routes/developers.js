const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE is_active = true ORDER BY sort_order ASC');
    res.json({ success: true, developers, data: developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/team', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE is_active = true ORDER BY sort_order ASC');
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard', (req, res) => {
  res.json({ success: true, data: {}, message: 'Dashboard' });
});

router.get('/analytics', (req, res) => {
  res.json({ success: true, data: {}, message: 'Analytics' });
});

router.get('/notifications', (req, res) => {
  res.json({ success: true, data: [], message: 'Notifications' });
});

module.exports = router;