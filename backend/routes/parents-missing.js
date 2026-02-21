const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all parents
router.get('/', authenticateToken, requireRole(['dod', 'director_discipline', 'admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [parents] = await db.execute(`
      SELECT 
        u.id,
        u.username,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.email,
        u.phone,
        u.address,
        u.created_at,
        COUNT(DISTINCT pcl.id) as linked_children_count
      FROM users u
      LEFT JOIN parent_child_links pcl ON u.id = pcl.parent_id AND pcl.status = 'active'
      WHERE u.role = 'parent'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, parents });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parents' });
  }
});

module.exports = router;
