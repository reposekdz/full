const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Get role-specific columns
router.get('/columns/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    const [columns] = await pool.execute(`
      SELECT * FROM student_sheet_custom_columns 
      WHERE JSON_CONTAINS(visible_to_roles, ?) AND is_active = 1
      ORDER BY display_order, id
    `, [JSON.stringify(role)]);
    
    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new column based on role
router.post('/columns', async (req, res) => {
  try {
    const { column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, calculation_formula } = req.body;
    
    // Role-specific column templates
    const roleColumns = {
      accountant: {
        paid_amount: { type: 'number', label: 'Paid Amount' },
        unpaid_amount: { type: 'number', label: 'Unpaid Amount' },
        remaining_balance: { type: 'calculated', label: 'Remaining Balance', formula: 'total_fees - paid_amount' },
        payment_status: { type: 'select', label: 'Payment Status', options: ['Paid', 'Partial', 'Unpaid'] },
        payment_date: { type: 'date', label: 'Last Payment Date' },
        fee_category: { type: 'select', label: 'Fee Category', options: ['Tuition', 'Exam', 'Uniform', 'Transport', 'Hostel'] }
      },
      teacher: {
        quiz_marks: { type: 'number', label: 'Quiz Marks' },
        midterm_marks: { type: 'number', label: 'Midterm Marks' },
        final_marks: { type: 'number', label: 'Final Marks' },
        total_marks: { type: 'calculated', label: 'Total Marks', formula: 'quiz_marks + midterm_marks + final_marks' },
        percentage: { type: 'calculated', label: 'Percentage', formula: '(total_marks / 100) * 100' },
        grade: { type: 'calculated', label: 'Grade', formula: 'CASE WHEN percentage >= 90 THEN "A" WHEN percentage >= 80 THEN "B" WHEN percentage >= 70 THEN "C" WHEN percentage >= 60 THEN "D" ELSE "F" END' },
        subject_name: { type: 'text', label: 'Subject Name' },
        course_code: { type: 'text', label: 'Course Code' }
      },
      dos: {
        academic_performance: { type: 'number', label: 'Academic Performance' },
        class_rank: { type: 'number', label: 'Class Rank' },
        gpa: { type: 'calculated', label: 'GPA', formula: 'percentage / 20' },
        study_plan: { type: 'textarea', label: 'Study Plan' },
        academic_status: { type: 'select', label: 'Academic Status', options: ['Excellent', 'Good', 'Average', 'Poor'] }
      },
      headmaster: {
        overall_rating: { type: 'calculated', label: 'Overall Rating', formula: '(academic_performance + conduct_score + attendance_percentage) / 3' },
        recommendation: { type: 'textarea', label: 'Principal Recommendation' },
        awards: { type: 'text', label: 'Awards & Recognition' },
        leadership_potential: { type: 'select', label: 'Leadership Potential', options: ['High', 'Medium', 'Low'] }
      }
    };

    await pool.execute(`
      INSERT INTO student_sheet_custom_columns 
      (column_name, column_label, column_type, select_options, calculation_formula, created_by_role, visible_to_roles, editable_by_roles, scope, is_active)
      VALUES (?,?,?,?,?,?,?,?,?,1)
    `, [
      column_name, column_label, column_type, 
      select_options ? JSON.stringify(select_options) : null,
      calculation_formula,
      created_by_role, JSON.stringify(visible_to_roles), JSON.stringify(editable_by_roles), scope || 'global'
    ]);
    
    res.json({ success: true, message: 'Column added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all student sheets with role-based filtering
router.get('/sheets/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { trade_code, level_number } = req.query;
    
    let query = `
      SELECT gss.*, 
             GROUP_CONCAT(CONCAT(sscv.column_id, ':', sscv.value_text, ':', sscv.value_number) SEPARATOR '|') as custom_values
      FROM global_student_sheets gss
      LEFT JOIN student_sheet_custom_values sscv ON gss.id = sscv.sheet_id
      WHERE gss.student_id > 0
    `;
    
    const params = [];
    if (trade_code) {
      query += ' AND gss.trade_code = ?';
      params.push(trade_code);
    }
    if (level_number) {
      query += ' AND gss.level_number = ?';
      params.push(level_number);
    }
    
    query += ' GROUP BY gss.id ORDER BY gss.last_name, gss.first_name';
    
    const [sheets] = await pool.execute(query, params);
    
    res.json({ success: true, sheets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update student sheet data
router.put('/sheets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { column_values, user_role } = req.body;
    
    // Update custom column values
    for (const [column_id, value] of Object.entries(column_values)) {
      await pool.execute(`
        INSERT INTO student_sheet_custom_values (sheet_id, student_id, column_id, value_text, value_number, updated_by_role)
        VALUES (?, (SELECT student_id FROM global_student_sheets WHERE id = ?), ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        value_text = VALUES(value_text), 
        value_number = VALUES(value_number),
        updated_by_role = VALUES(updated_by_role),
        updated_at = NOW()
      `, [id, id, column_id, isNaN(value) ? value : null, isNaN(value) ? null : parseFloat(value), user_role]);
    }
    
    // Recalculate computed fields
    await recalculateSheet(id);
    
    res.json({ success: true, message: 'Sheet updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recalculate computed fields
async function recalculateSheet(sheetId) {
  try {
    // Get all calculated columns
    const [calcColumns] = await pool.execute(`
      SELECT * FROM student_sheet_custom_columns 
      WHERE column_type = 'calculated' AND is_active = 1
    `);
    
    // Get current values
    const [values] = await pool.execute(`
      SELECT sscv.column_id, sscv.value_number, ssc.column_name
      FROM student_sheet_custom_values sscv
      JOIN student_sheet_custom_columns ssc ON sscv.column_id = ssc.id
      WHERE sscv.sheet_id = ?
    `, [sheetId]);
    
    const valueMap = {};
    values.forEach(v => {
      valueMap[v.column_name] = v.value_number || 0;
    });
    
    // Calculate each computed column
    for (const column of calcColumns) {
      let result = 0;
      
      try {
        // Simple formula evaluation
        const formula = column.calculation_formula;
        
        if (formula.includes('total_fees - paid_amount')) {
          result = (valueMap.total_fees || 0) - (valueMap.paid_amount || 0);
        } else if (formula.includes('quiz_marks + midterm_marks + final_marks')) {
          result = (valueMap.quiz_marks || 0) + (valueMap.midterm_marks || 0) + (valueMap.final_marks || 0);
        } else if (formula.includes('(total_marks / 100) * 100')) {
          result = ((valueMap.total_marks || 0) / 100) * 100;
        } else if (formula.includes('percentage / 20')) {
          result = (valueMap.percentage || 0) / 20;
        } else if (formula.includes('(academic_performance + conduct_score + attendance_percentage) / 3')) {
          result = ((valueMap.academic_performance || 0) + (valueMap.conduct_score || 0) + (valueMap.attendance_percentage || 0)) / 3;
        }
        
        // Update calculated value
        await pool.execute(`
          INSERT INTO student_sheet_custom_values (sheet_id, student_id, column_id, value_number, updated_by_role)
          VALUES (?, (SELECT student_id FROM global_student_sheets WHERE id = ?), ?, ?, 'system')
          ON DUPLICATE KEY UPDATE 
          value_number = VALUES(value_number),
          updated_at = NOW()
        `, [sheetId, sheetId, column.id, result]);
        
      } catch (e) {
        console.error('Calculation error:', e);
      }
    }
  } catch (error) {
    console.error('Recalculation error:', error);
  }
}

// Bulk operations
router.post('/bulk-update', async (req, res) => {
  try {
    const { updates, user_role } = req.body;
    
    for (const update of updates) {
      await pool.execute(`
        UPDATE global_student_sheets SET ? WHERE id = ?
      `, [update.data, update.sheet_id]);
    }
    
    res.json({ success: true, message: 'Bulk update completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoint
router.get('/analytics/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        AVG(average_marks) as avg_performance,
        AVG(attendance_percentage) as avg_attendance,
        AVG(conduct_score) as avg_conduct
      FROM global_student_sheets 
      WHERE student_id > 0
    `);
    
    res.json({ success: true, analytics: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual recalculation endpoint
router.post('/recalculate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Call stored procedure for comprehensive recalculation
    await pool.execute('CALL update_all_calculations(?)', [id]);
    
    res.json({ success: true, message: 'Sheet recalculated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;