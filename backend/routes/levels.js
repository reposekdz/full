const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all levels (distinct from trades_levels table or generate standard levels)
router.get('/levels', async (req, res) => {
  try {
    // Try to get from trades_levels table first
    const [levels] = await pool.query(`
      SELECT DISTINCT 
        level_number, 
        level_suffix,
        CONCAT('Level ', level_number, COALESCE(level_suffix, '')) as level_name
      FROM trades_levels 
      WHERE is_active = true
      ORDER BY level_number, level_suffix
    `);
    
    // If no levels found, return standard levels
    if (levels.length === 0) {
      const standardLevels = [
        { level_number: 1, level_suffix: '', level_name: 'Level 1' },
        { level_number: 2, level_suffix: '', level_name: 'Level 2' },
        { level_number: 3, level_suffix: '', level_name: 'Level 3' },
        { level_number: 4, level_suffix: '', level_name: 'Level 4' }
      ];
      return res.json({ success: true, levels: standardLevels });
    }
    
    res.json({ success: true, levels });
  } catch (error) {
    console.error('Levels error:', error);
    // Return standard levels on error
    const standardLevels = [
      { level_number: 1, level_suffix: '', level_name: 'Level 1' },
      { level_number: 2, level_suffix: '', level_name: 'Level 2' },
      { level_number: 3, level_suffix: '', level_name: 'Level 3' },
      { level_number: 4, level_suffix: '', level_name: 'Level 4' }
    ];
    res.json({ success: true, levels: standardLevels });
  }
});

// Get levels for a specific trade
router.get('/trades/:tradeCode/levels', async (req, res) => {
  try {
    const { tradeCode } = req.params;
    
    const [levels] = await pool.query(`
      SELECT 
        id,
        trade_code,
        level_number,
        level_suffix,
        CONCAT('Level ', level_number, COALESCE(level_suffix, '')) as level_name,
        description
      FROM trades_levels 
      WHERE trade_code = ? AND is_active = true
      ORDER BY level_number, level_suffix
    `, [tradeCode]);
    
    res.json({ success: true, levels });
  } catch (error) {
    console.error('Trade levels error:', error);
    res.json({ success: true, levels: [] });
  }
});

// Get all trades with their levels
router.get('/trades-with-levels', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT DISTINCT
        c.id,
        c.code as trade_code,
        c.name as trade_name,
        c.description,
        c.duration_months,
        c.fee_amount
      FROM courses c
      WHERE c.is_active = true
      ORDER BY c.name
    `);
    
    // Get levels for each trade
    for (let trade of trades) {
      const [levels] = await pool.query(`
        SELECT 
          level_number,
          level_suffix,
          CONCAT('Level ', level_number, COALESCE(level_suffix, '')) as level_name
        FROM trades_levels
        WHERE trade_code = ? AND is_active = true
        ORDER BY level_number, level_suffix
      `, [trade.trade_code]);
      
      trade.levels = levels;
    }
    
    res.json({ success: true, trades });
  } catch (error) {
    console.error('Trades with levels error:', error);
    res.json({ success: true, trades: [] });
  }
});

module.exports = router;
