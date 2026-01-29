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
    const { first_name, last_name, phone, email, current_password, new_password } = req.body;
    
    // Get current user data
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let updateFields = [];
    let updateValues = [];

    // Update basic info
    if (first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    // Handle password change
    if (new_password && current_password) {
      const passwordMatch = await bcrypt.compare(current_password, user.password_hash || user.password);
      if (!passwordMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      await pool.execute(query, updateValues);
    }

    // Also update admin_users table if user is admin
    if (['admin', 'super_admin', 'headmaster', 'director_study', 'director_discipline', 'accountant', 'stock_manager', 'patron', 'advisor'].includes(user.role)) {
      try {
        let adminUpdateFields = [];
        let adminUpdateValues = [];
        
        if (first_name) {
          adminUpdateFields.push('first_name = ?');
          adminUpdateValues.push(first_name);
        }
        if (last_name) {
          adminUpdateFields.push('last_name = ?');
          adminUpdateValues.push(last_name);
        }
        if (phone) {
          adminUpdateFields.push('phone = ?');
          adminUpdateValues.push(phone);
        }
        if (email) {
          adminUpdateFields.push('email = ?');
          adminUpdateValues.push(email);
        }
        if (new_password && current_password) {
          const hashedPassword = await bcrypt.hash(new_password, 10);
          adminUpdateFields.push('password = ?');
          adminUpdateValues.push(hashedPassword);
        }
        
        if (adminUpdateFields.length > 0) {
          adminUpdateFields.push('updated_at = CURRENT_TIMESTAMP');
          adminUpdateValues.push(user.email);
          
          const adminQuery = `UPDATE admin_users SET ${adminUpdateFields.join(', ')} WHERE email = ?`;
          await pool.execute(adminQuery, adminUpdateValues);
        }
      } catch (adminError) {
        console.log('Admin table update failed (non-critical):', adminError.message);
      }
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
