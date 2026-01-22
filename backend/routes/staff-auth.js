const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Staff login with email and password
router.post('/staff-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [staff] = await pool.execute(`SELECT * FROM staff WHERE email = ? AND is_active = true`, [email]);
    
    if (staff.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, staff[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: staff[0].id, email: staff[0].email, role: staff[0].role, isStaff: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: staff[0].id,
        email: staff[0].email,
        first_name: staff[0].first_name,
        last_name: staff[0].last_name,
        role: staff[0].role,
        department: staff[0].department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
