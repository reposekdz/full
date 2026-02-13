const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all provinces
router.get('/provinces', async (req, res) => {
  try {
    const [provinces] = await pool.execute('SELECT * FROM provinces ORDER BY name_rw');
    res.json({ success: true, provinces });
  } catch (error) {
    console.error('Get provinces error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get districts by province
router.get('/districts/:provinceId', async (req, res) => {
  try {
    const [districts] = await pool.execute(
      'SELECT * FROM districts WHERE province_id = ? ORDER BY name_rw',
      [req.params.provinceId]
    );
    res.json({ success: true, districts });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get sectors by district
router.get('/sectors/:districtId', async (req, res) => {
  try {
    const [sectors] = await pool.execute(
      'SELECT * FROM sectors WHERE district_id = ? ORDER BY name_rw',
      [req.params.districtId]
    );
    res.json({ success: true, sectors });
  } catch (error) {
    console.error('Get sectors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get cells by sector
router.get('/cells/:sectorId', async (req, res) => {
  try {
    const [cells] = await pool.execute(
      'SELECT * FROM cells WHERE sector_id = ? ORDER BY name_rw',
      [req.params.sectorId]
    );
    res.json({ success: true, cells });
  } catch (error) {
    console.error('Get cells error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get villages by cell
router.get('/villages/:cellId', async (req, res) => {
  try {
    const [villages] = await pool.execute(
      'SELECT * FROM villages WHERE cell_id = ? ORDER BY name_rw',
      [req.params.cellId]
    );
    res.json({ success: true, villages });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
