const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/provinces', async (req, res) => {
  try {
    const [provinces] = await db.execute('SELECT * FROM rwanda_provinces ORDER BY name');
    res.json({ success: true, data: provinces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/districts/:provinceId', async (req, res) => {
  try {
    const [districts] = await db.execute('SELECT * FROM rwanda_districts WHERE province_id=? ORDER BY name', [req.params.provinceId]);
    res.json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sectors/:districtId', async (req, res) => {
  try {
    const [sectors] = await db.execute('SELECT * FROM rwanda_sectors WHERE district_id=? ORDER BY name', [req.params.districtId]);
    res.json({ success: true, data: sectors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cells/:sectorId', async (req, res) => {
  try {
    const [cells] = await db.execute('SELECT * FROM rwanda_cells WHERE sector_id=? ORDER BY name', [req.params.sectorId]);
    res.json({ success: true, data: cells });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/villages/:cellId', async (req, res) => {
  try {
    const [villages] = await db.execute('SELECT * FROM rwanda_villages WHERE cell_id=? ORDER BY name', [req.params.cellId]);
    res.json({ success: true, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
