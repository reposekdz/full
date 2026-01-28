const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

router.post('/initialize-staff-credentials', async (req, res) => {
  try {
    const defaultPassword = await bcrypt.hash('Garden@2024', 10);
    
    const staffMembers = [
      { email: 'uwimana.jc@gardentvet.ac.rw', role: 'headmaster', username: 'headmaster', name: 'UWIMANA Jean Claude' },
      { email: 'masezerano.isaac@gardentvet.ac.rw', role: 'director_study', username: 'dos', name: 'MASEZERANO Isaac' },
      { email: 'mukamana.grace@gardentvet.ac.rw', role: 'director_discipline', username: 'dod', name: 'MUKAMANA Grace' },
      { email: 'niyonkuru.patrick@gardentvet.ac.rw', role: 'advisor', username: 'advisor', name: 'NIYONKURU Patrick' },
      { email: 'emerancemukamugema77@gmail.com', role: 'advisor', username: 'advisor2', name: 'Mukamugema Emerance' },
      { email: 'accountant@gardentvet.ac.rw', role: 'accountant', username: 'accountant', name: 'School Accountant' },
      { email: 'stock@gardentvet.ac.rw', role: 'stock_manager', username: 'stock_manager', name: 'Stock Manager' }
    ];
    
    const created = [];
    
    for (const staff of staffMembers) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [staff.email]
      );
      
      if (existing.length === 0) {
        const [roleResult] = await pool.execute(
          'SELECT id FROM roles WHERE name = ?',
          [staff.role]
        );
        
        if (roleResult.length > 0) {
          const [result] = await pool.execute(
            `INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
            [
              staff.username,
              staff.email,
              defaultPassword,
              staff.name.split(' ')[0],
              staff.name.split(' ').slice(1).join(' '),
              roleResult[0].id
            ]
          );
          
          created.push({ ...staff, id: result.insertId, password: 'Garden@2024' });
        }
      }
    }
    
    res.json({
      success: true,
      message: `Initialized ${created.length} staff accounts`,
      credentials: created
    });
    
  } catch (error) {
    console.error('Error initializing staff credentials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/staff-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.is_active = true`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    delete user.password;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_name,
        is_active: user.is_active
      },
      token: 'jwt_token_here'
    });
    
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/update-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, phone, current_password, new_password } = req.body;
    
    if (new_password && current_password) {
      const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const passwordMatch = await bcrypt.compare(current_password, users[0].password);
      
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(new_password, 10);
      
      await pool.execute(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [first_name, last_name, phone, hashedPassword, userId]
      );
    } else {
      await pool.execute(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
        [first_name, last_name, phone, userId]
      );
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
