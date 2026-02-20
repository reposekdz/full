// Simplified auto-connect endpoint - Add this to parent-linking.js
router.post('/auto-connect', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    const { student_name, trade, level_id, level, relationship_type } = req.body;

    // Validate inputs
    if (!student_name || !trade) {
      return res.status(400).json({
        success: false,
        message: 'Student name and trade are required'
      });
    }

    // Parse level
    const levelNumber = parseInt(level_id || level || '1');
    
    // Parse name
    const nameParts = student_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Search for student
    const [students] = await pool.execute(`
      SELECT id, first_name, last_name, trade_code, level_number, gender
      FROM global_student_sheets
      WHERE LOWER(first_name) LIKE LOWER(?)
        AND LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(?)
        AND trade_code = ?
        AND level_number = ?
      LIMIT 5
    `, [`%${firstName}%`, `%${student_name.trim()}%`, trade, levelNumber]);

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        code: 'NO_MATCHES'
      });
    }

    const student = students[0];

    // Check if already linked
    const [existing] = await pool.execute(`
      SELECT id FROM parent_student_links 
      WHERE parent_id = ? AND student_id = ? AND status = 'active'
    `, [parentId, student.id]);

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Student is already linked!',
        alreadyLinked: true
      });
    }

    // Create link
    await pool.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, linked_at)
      VALUES (?, ?, ?, 'active', NOW())
    `, [parentId, student.id, relationship_type || 'parent']);

    res.json({
      success: true,
      message: 'Student linked successfully! 🎉',
      child: {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        gender: student.gender,
        trade: student.trade_code,
        level: student.level_number
      }
    });

  } catch (error) {
    console.error('[Auto-Connect Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database error. Please check if MySQL is running.',
      error: error.message
    });
  }
});
