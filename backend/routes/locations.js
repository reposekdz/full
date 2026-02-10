const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Get all provinces
router.get('/provinces', async (req, res) => {
  try {
    const [provinces] = await pool.execute(`
      SELECT id, name_en, name_rw, code FROM provinces ORDER BY name_en
    `);
    
    res.json({
      success: true,
      provinces
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provinces',
      error: error.message
    });
  }
});

// Get districts by province
router.get('/districts/:provinceId', async (req, res) => {
  try {
    const { provinceId } = req.params;
    
    const [districts] = await pool.execute(`
      SELECT d.id, d.name_en, d.name_rw, d.code, p.name_en as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      WHERE d.province_id = ?
      ORDER BY d.name_en
    `, [provinceId]);
    
    res.json({
      success: true,
      districts
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
      error: error.message
    });
  }
});

// Get all districts
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await pool.execute(`
      SELECT d.id, d.name_en, d.name_rw, d.code, d.province_id, p.name_en as province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      ORDER BY p.name_en, d.name_en
    `);
    
    res.json({
      success: true,
      districts
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
      error: error.message
    });
  }
});

// Get sectors by district
router.get('/sectors/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    
    const [sectors] = await pool.execute(`
      SELECT s.id, s.name_en, s.name_rw, s.code, d.name_en as district_name
      FROM sectors s
      JOIN districts d ON s.district_id = d.id
      WHERE s.district_id = ?
      ORDER BY s.name_en
    `, [districtId]);
    
    res.json({
      success: true,
      sectors
    });
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sectors',
      error: error.message
    });
  }
});

// Get cells by sector
router.get('/cells/:sectorId', async (req, res) => {
  try {
    const { sectorId } = req.params;
    
    const [cells] = await pool.execute(`
      SELECT c.id, c.name_en, c.name_rw, c.code, s.name_en as sector_name
      FROM cells c
      JOIN sectors s ON c.sector_id = s.id
      WHERE c.sector_id = ?
      ORDER BY c.name_en
    `, [sectorId]);
    
    res.json({
      success: true,
      cells
    });
  } catch (error) {
    console.error('Error fetching cells:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cells',
      error: error.message
    });
  }
});

// Get villages by cell
router.get('/villages/:cellId', async (req, res) => {
  try {
    const { cellId } = req.params;
    
    const [villages] = await pool.execute(`
      SELECT v.id, v.name_en, v.name_rw, v.code, c.name_en as cell_name
      FROM villages v
      JOIN cells c ON v.cell_id = c.id
      WHERE v.cell_id = ?
      ORDER BY v.name_en
    `, [cellId]);
    
    res.json({
      success: true,
      villages
    });
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch villages',
      error: error.message
    });
  }
});

// Get complete location hierarchy
router.get('/hierarchy/:provinceId?/:districtId?/:sectorId?/:cellId?', async (req, res) => {
  try {
    const { provinceId, districtId, sectorId, cellId } = req.params;
    
    let query = `
      SELECT 
        p.id as province_id, p.name_en as province_name, p.name_rw as province_name_rw,
        d.id as district_id, d.name_en as district_name, d.name_rw as district_name_rw,
        s.id as sector_id, s.name_en as sector_name, s.name_rw as sector_name_rw,
        c.id as cell_id, c.name_en as cell_name, c.name_rw as cell_name_rw,
        v.id as village_id, v.name_en as village_name, v.name_rw as village_name_rw
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id
      LEFT JOIN sectors s ON d.id = s.district_id
      LEFT JOIN cells c ON s.id = c.sector_id
      LEFT JOIN villages v ON c.id = v.cell_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (provinceId) {
      query += ' AND p.id = ?';
      params.push(provinceId);
    }
    if (districtId) {
      query += ' AND d.id = ?';
      params.push(districtId);
    }
    if (sectorId) {
      query += ' AND s.id = ?';
      params.push(sectorId);
    }
    if (cellId) {
      query += ' AND c.id = ?';
      params.push(cellId);
    }
    
    query += ' ORDER BY p.name_en, d.name_en, s.name_en, c.name_en, v.name_en';
    
    const [hierarchy] = await pool.execute(query, params);
    
    res.json({
      success: true,
      hierarchy
    });
  } catch (error) {
    console.error('Error fetching location hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location hierarchy',
      error: error.message
    });
  }
});

// Validate location combination
router.post('/validate', async (req, res) => {
  try {
    const { province_id, district_id, sector_id, cell_id, village_id } = req.body;
    
    // Check if the location hierarchy is valid
    const [result] = await pool.execute(`
      SELECT 
        p.name_en as province_name,
        d.name_en as district_name,
        s.name_en as sector_name,
        c.name_en as cell_name,
        v.name_en as village_name
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id AND d.id = ?
      LEFT JOIN sectors s ON d.id = s.district_id AND s.id = ?
      LEFT JOIN cells c ON s.id = c.sector_id AND c.id = ?
      LEFT JOIN villages v ON c.id = v.cell_id AND v.id = ?
      WHERE p.id = ?
    `, [district_id, sector_id, cell_id, village_id, province_id]);
    
    if (result.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid location combination'
      });
    }
    
    res.json({
      success: true,
      message: 'Valid location combination',
      location: result[0]
    });
  } catch (error) {
    console.error('Error validating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate location',
      error: error.message
    });
  }
});

// Get validation rules
router.get('/validation-rules', async (req, res) => {
  try {
    const [rules] = await pool.execute(`
      SELECT field_name, rule_type, rule_value, error_message_en, error_message_rw
      FROM application_validation_rules
      WHERE is_active = TRUE
      ORDER BY field_name, rule_type
    `);
    
    // Group rules by field
    const groupedRules = {};
    rules.forEach(rule => {
      if (!groupedRules[rule.field_name]) {
        groupedRules[rule.field_name] = [];
      }
      groupedRules[rule.field_name].push(rule);
    });
    
    res.json({
      success: true,
      rules: groupedRules
    });
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch validation rules',
      error: error.message
    });
  }
});

// Search locations
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    let results = [];
    
    if (type === 'all' || type === 'province') {
      const [provinces] = await pool.execute(`
        SELECT 'province' as type, id, name_en, name_rw, code
        FROM provinces
        WHERE name_en LIKE ? OR name_rw LIKE ?
        LIMIT 10
      `, [`%${q}%`, `%${q}%`]);
      results = results.concat(provinces);
    }
    
    if (type === 'all' || type === 'district') {
      const [districts] = await pool.execute(`
        SELECT 'district' as type, d.id, d.name_en, d.name_rw, d.code, p.name_en as province_name
        FROM districts d
        JOIN provinces p ON d.province_id = p.id
        WHERE d.name_en LIKE ? OR d.name_rw LIKE ?
        LIMIT 10
      `, [`%${q}%`, `%${q}%`]);
      results = results.concat(districts);
    }
    
    if (type === 'all' || type === 'sector') {
      const [sectors] = await pool.execute(`
        SELECT 'sector' as type, s.id, s.name_en, s.name_rw, s.code, 
               d.name_en as district_name, p.name_en as province_name
        FROM sectors s
        JOIN districts d ON s.district_id = d.id
        JOIN provinces p ON d.province_id = p.id
        WHERE s.name_en LIKE ? OR s.name_rw LIKE ?
        LIMIT 10
      `, [`%${q}%`, `%${q}%`]);
      results = results.concat(sectors);
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search locations',
      error: error.message
    });
  }
});

module.exports = router;