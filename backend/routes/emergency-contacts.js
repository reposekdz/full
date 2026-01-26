const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all emergency contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, staff_id } = req.query;
    let query = 'SELECT * FROM emergency_contacts WHERE 1=1';
    const params = [];
    
    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    
    if (staff_id) {
      query += ' AND staff_id = ?';
      params.push(staff_id);
    }
    
    query += ' ORDER BY is_primary DESC, contact_name ASC';
    
    const [contacts] = await pool.execute(query, params);
    
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contacts' });
  }
});

// Get student emergency contacts
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT ec.*,
             s.first_name as student_first_name,
             s.last_name as student_last_name,
             s.student_code
      FROM emergency_contacts ec
      JOIN students s ON ec.student_id = s.id
      WHERE ec.student_id = ?
      ORDER BY ec.is_primary DESC, ec.contact_name ASC
    `, [req.params.studentId]);
    
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching student emergency contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student emergency contacts' });
  }
});

// Get staff emergency contacts
router.get('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT ec.*,
             st.first_name as staff_first_name,
             st.last_name as staff_last_name,
             st.employee_id
      FROM emergency_contacts ec
      JOIN staff st ON ec.staff_id = st.id
      WHERE ec.staff_id = ?
      ORDER BY ec.is_primary DESC, ec.contact_name ASC
    `, [req.params.staffId]);
    
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching staff emergency contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff emergency contacts' });
  }
});

// Get emergency contact by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [contact] = await pool.execute('SELECT * FROM emergency_contacts WHERE id = ?', [req.params.id]);
    
    if (contact.length === 0) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }
    
    res.json({ success: true, data: contact[0] });
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contact' });
  }
});

// Create emergency contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, staff_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, notes } = req.body;
    
    // If setting as primary, remove primary from others
    if (is_primary) {
      if (student_id) {
        await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE student_id = ?', [student_id]);
      }
      if (staff_id) {
        await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE staff_id = ?', [staff_id]);
      }
    }
    
    const [result] = await pool.execute(`
      INSERT INTO emergency_contacts 
      (student_id, staff_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, staff_id, contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary ?? 0, notes]);
    
    res.json({ success: true, message: 'Emergency contact created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create emergency contact' });
  }
});

// Update emergency contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, notes } = req.body;
    
    const [existing] = await pool.execute('SELECT * FROM emergency_contacts WHERE id = ?', [req.params.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }
    
    // If setting as primary, remove primary from others
    if (is_primary) {
      if (existing[0].student_id) {
        await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE student_id = ? AND id != ?', 
          [existing[0].student_id, req.params.id]);
      }
      if (existing[0].staff_id) {
        await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE staff_id = ? AND id != ?', 
          [existing[0].staff_id, req.params.id]);
      }
    }
    
    await pool.execute(`
      UPDATE emergency_contacts 
      SET contact_name = ?, relationship = ?, phone_primary = ?, phone_secondary = ?, 
          email = ?, address = ?, is_primary = ?, notes = ?
      WHERE id = ?
    `, [contact_name, relationship, phone_primary, phone_secondary, email, address, is_primary, notes, req.params.id]);
    
    res.json({ success: true, message: 'Emergency contact updated successfully' });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update emergency contact' });
  }
});

// Set as primary contact
router.patch('/:id/set-primary', authenticateToken, async (req, res) => {
  try {
    const [contact] = await pool.execute('SELECT * FROM emergency_contacts WHERE id = ?', [req.params.id]);
    
    if (contact.length === 0) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }
    
    // Remove primary from others
    if (contact[0].student_id) {
      await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE student_id = ?', [contact[0].student_id]);
    }
    if (contact[0].staff_id) {
      await pool.execute('UPDATE emergency_contacts SET is_primary = 0 WHERE staff_id = ?', [contact[0].staff_id]);
    }
    
    // Set this as primary
    await pool.execute('UPDATE emergency_contacts SET is_primary = 1 WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: 'Primary contact updated successfully' });
  } catch (error) {
    console.error('Error setting primary contact:', error);
    res.status(500).json({ success: false, message: 'Failed to set primary contact' });
  }
});

// Delete emergency contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM emergency_contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Emergency contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete emergency contact' });
  }
});

module.exports = router;
