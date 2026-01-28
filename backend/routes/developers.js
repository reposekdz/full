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

router.get('/team/:id', async (req, res) => {
  try {
    const [developers] = await pool.query('SELECT * FROM developers WHERE id = ? AND is_active = true', [req.params.id]);
    if (developers.length === 0) {
      return res.json({ success: false, message: 'Developer not found' });
    }
    res.json({ success: true, developer: developers[0] });
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