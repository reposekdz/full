const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

const roleSheetConfigs = {
  headmaster: {
    defaultColumns: [
      { name: 'school_vision_score', type: 'number', calculated: false },
      { name: 'leadership_rating', type: 'number', calculated: false },
      { name: 'strategic_planning', type: 'number', calculated: false },
      { name: 'budget_efficiency', type: 'percentage', calculated: true, formula: '(budget_utilized / budget_allocated) * 100' },
      { name: 'staff_satisfaction', type: 'number', calculated: false },
      { name: 'overall_performance', type: 'number', calculated: true, formula: '(school_vision_score + leadership_rating + strategic_planning + staff_satisfaction) / 4' }
    ]
  },
  director_study: {
    defaultColumns: [
      { name: 'academic_excellence_score', type: 'number', calculated: false },
      { name: 'curriculum_implementation', type: 'number', calculated: false },
      { name: 'teacher_evaluations_completed', type: 'number', calculated: false },
      { name: 'student_pass_rate', type: 'percentage', calculated: false },
      { name: 'exam_coordination', type: 'number', calculated: false },
      { name: 'academic_performance_index', type: 'number', calculated: true, formula: '(academic_excellence_score + curriculum_implementation + exam_coordination) / 3' }
    ]
  },
  director_discipline: {
    defaultColumns: [
      { name: 'discipline_cases_handled', type: 'number', calculated: false },
      { name: 'resolution_rate', type: 'percentage', calculated: true, formula: '(resolved_cases / discipline_cases_handled) * 100' },
      { name: 'student_behavior_improvement', type: 'number', calculated: false },
      { name: 'parent_engagements', type: 'number', calculated: false },
      { name: 'safety_incidents', type: 'number', calculated: false },
      { name: 'discipline_effectiveness', type: 'number', calculated: true, formula: '(100 - (safety_incidents * 5)) * (student_behavior_improvement / 10)' }
    ]
  },
  advisor: {
    defaultColumns: [
      { name: 'students_counseled', type: 'number', calculated: false },
      { name: 'counseling_sessions', type: 'number', calculated: false },
      { name: 'student_satisfaction_score', type: 'number', calculated: false },
      { name: 'career_guidance_provided', type: 'number', calculated: false },
      { name: 'follow_up_rate', type: 'percentage', calculated: true, formula: '(follow_ups_completed / students_counseled) * 100' },
      { name: 'advisor_effectiveness', type: 'number', calculated: true, formula: '(student_satisfaction_score + (counseling_sessions / students_counseled * 10)) / 2' }
    ]
  },
  accountant: {
    defaultColumns: [
      { name: 'fees_collected', type: 'currency', calculated: false },
      { name: 'fees_pending', type: 'currency', calculated: false },
      { name: 'collection_rate', type: 'percentage', calculated: true, formula: '(fees_collected / (fees_collected + fees_pending)) * 100' },
      { name: 'expenses_processed', type: 'currency', calculated: false },
      { name: 'budget_variance', type: 'percentage', calculated: true, formula: '((budget_allocated - expenses_processed) / budget_allocated) * 100' },
      { name: 'financial_accuracy', type: 'number', calculated: false }
    ]
  },
  stock_manager: {
    defaultColumns: [
      { name: 'items_managed', type: 'number', calculated: false },
      { name: 'stock_value', type: 'currency', calculated: false },
      { name: 'items_below_reorder', type: 'number', calculated: false },
      { name: 'stock_efficiency', type: 'percentage', calculated: true, formula: '((items_managed - items_below_reorder) / items_managed) * 100' },
      { name: 'orders_processed', type: 'number', calculated: false },
      { name: 'inventory_turnover', type: 'number', calculated: true, formula: 'orders_processed / items_managed' }
    ]
  },
  teacher: {
    defaultColumns: [
      { name: 'classes_taught', type: 'number', calculated: false },
      { name: 'students_taught', type: 'number', calculated: false },
      { name: 'assignments_given', type: 'number', calculated: false },
      { name: 'assignments_graded', type: 'number', calculated: false },
      { name: 'grading_completion_rate', type: 'percentage', calculated: true, formula: '(assignments_graded / assignments_given) * 100' },
      { name: 'average_student_score', type: 'number', calculated: false },
      { name: 'teaching_effectiveness', type: 'number', calculated: true, formula: '(average_student_score + grading_completion_rate) / 2' }
    ]
  }
};

router.get('/role-columns/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    const [customColumns] = await pool.execute(
      'SELECT * FROM staff_sheet_columns WHERE role_name = ? AND is_active = true ORDER BY display_order',
      [role]
    );
    
    const defaultColumns = roleSheetConfigs[role]?.defaultColumns || [];
    
    const allColumns = [
      ...defaultColumns.map(col => ({ ...col, is_default: true })),
      ...customColumns.map(col => ({
        name: col.column_name,
        type: col.column_type,
        calculated: col.is_calculated,
        formula: col.calculation_formula,
        is_default: false,
        id: col.id
      }))
    ];
    
    res.json({ success: true, columns: allColumns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/add-column', async (req, res) => {
  try {
    const { role_name, column_name, column_type, is_calculated, calculation_formula, created_by } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO staff_sheet_columns (role_name, column_name, column_type, is_calculated, calculation_formula, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [role_name, column_name, column_type, is_calculated || false, calculation_formula, created_by]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/columns/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE staff_sheet_columns SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sheet/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, term } = req.query;
    
    const [staff] = await pool.execute(
      `SELECT u.*, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [staffId]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    
    const roleName = staff[0].role_name;
    
    const [sheets] = await pool.execute(
      `SELECT * FROM staff_dynamic_sheets 
       WHERE staff_id = ? AND academic_year = ? AND term = ?
       ORDER BY created_at DESC LIMIT 1`,
      [staffId, year || new Date().getFullYear(), term || 'Term 1']
    );
    
    let sheetData = {};
    if (sheets.length > 0) {
      sheetData = JSON.parse(sheets[0].data);
    }
    
    const [columns] = await pool.execute(
      'SELECT * FROM staff_sheet_columns WHERE role_name = ? AND is_active = true ORDER BY display_order',
      [roleName]
    );
    
    const defaultColumns = roleSheetConfigs[roleName]?.defaultColumns || [];
    
    const allColumns = [
      ...defaultColumns,
      ...columns.map(col => ({
        name: col.column_name,
        type: col.column_type,
        calculated: col.is_calculated,
        formula: col.calculation_formula
      }))
    ];
    
    const calculatedData = calculateFields(sheetData, allColumns);
    
    res.json({
      success: true,
      staff: staff[0],
      data: calculatedData,
      columns: allColumns,
      sheetId: sheets[0]?.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sheet/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { data, academic_year, term, created_by } = req.body;
    
    const [staff] = await pool.execute(
      `SELECT u.*, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [staffId]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    
    const roleName = staff[0].role_name;
    
    const [columns] = await pool.execute(
      'SELECT * FROM staff_sheet_columns WHERE role_name = ? AND is_active = true',
      [roleName]
    );
    
    const defaultColumns = roleSheetConfigs[roleName]?.defaultColumns || [];
    const allColumns = [...defaultColumns, ...columns.map(col => ({
      name: col.column_name,
      type: col.column_type,
      calculated: col.is_calculated,
      formula: col.calculation_formula
    }))];
    
    const calculatedData = calculateFields(data, allColumns);
    
    const [existing] = await pool.execute(
      `SELECT id FROM staff_dynamic_sheets 
       WHERE staff_id = ? AND academic_year = ? AND term = ?`,
      [staffId, academic_year, term]
    );
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE staff_dynamic_sheets 
         SET data = ?, updated_at = NOW()
         WHERE id = ?`,
        [JSON.stringify(calculatedData), existing[0].id]
      );
      
      res.json({ success: true, id: existing[0].id, data: calculatedData });
    } else {
      const [result] = await pool.execute(
        `INSERT INTO staff_dynamic_sheets (staff_id, sheet_type, data, academic_year, term, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [staffId, roleName, JSON.stringify(calculatedData), academic_year, term, created_by]
      );
      
      res.json({ success: true, id: result.insertId, data: calculatedData });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { year } = req.query;
    
    const [sheets] = await pool.execute(
      `SELECT sds.*, u.first_name, u.last_name
       FROM staff_dynamic_sheets sds
       JOIN users u ON sds.staff_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE r.name = ? AND sds.academic_year = ?`,
      [role, year || new Date().getFullYear()]
    );
    
    const analytics = sheets.map(sheet => {
      const data = JSON.parse(sheet.data);
      return {
        staff_name: `${sheet.first_name} ${sheet.last_name}`,
        staff_id: sheet.staff_id,
        ...data
      };
    });
    
    const averages = {};
    const defaultColumns = roleSheetConfigs[role]?.defaultColumns || [];
    
    defaultColumns.forEach(col => {
      if (col.type === 'number' || col.type === 'percentage') {
        const values = analytics.map(a => a[col.name]).filter(v => v !== undefined && v !== null);
        if (values.length > 0) {
          averages[col.name] = values.reduce((sum, v) => sum + parseFloat(v), 0) / values.length;
        }
      }
    });
    
    res.json({ success: true, analytics, averages, total_staff: sheets.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/comparison', async (req, res) => {
  try {
    const { year } = req.query;
    
    const comparison = {};
    
    for (const role of Object.keys(roleSheetConfigs)) {
      const [sheets] = await pool.execute(
        `SELECT sds.*
         FROM staff_dynamic_sheets sds
         JOIN users u ON sds.staff_id = u.id
         JOIN roles r ON u.role_id = r.id
         WHERE r.name = ? AND sds.academic_year = ?`,
        [role, year || new Date().getFullYear()]
      );
      
      const data = sheets.map(s => JSON.parse(s.data));
      const columns = roleSheetConfigs[role].defaultColumns;
      
      const metrics = {};
      columns.forEach(col => {
        if (col.type === 'number' || col.type === 'percentage') {
          const values = data.map(d => d[col.name]).filter(v => v !== undefined && v !== null);
          if (values.length > 0) {
            metrics[col.name] = {
              average: values.reduce((sum, v) => sum + parseFloat(v), 0) / values.length,
              max: Math.max(...values),
              min: Math.min(...values)
            };
          }
        }
      });
      
      comparison[role] = {
        staff_count: sheets.length,
        metrics
      };
    }
    
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function calculateFields(data, columns) {
  const result = { ...data };
  
  columns.forEach(col => {
    if (col.calculated && col.formula) {
      try {
        let formula = col.formula;
        
        Object.keys(result).forEach(key => {
          const regex = new RegExp(key, 'g');
          formula = formula.replace(regex, result[key] || 0);
        });
        
        const calculatedValue = eval(formula);
        result[col.name] = parseFloat(calculatedValue.toFixed(2));
      } catch (error) {
        result[col.name] = 0;
      }
    }
  });
  
  return result;
}

router.post('/bulk-update', async (req, res) => {
  try {
    const { updates, academic_year, term, created_by } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const update of updates) {
        const { staff_id, data } = update;
        
        const [staff] = await connection.execute(
          `SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
          [staff_id]
        );
        
        if (staff.length === 0) continue;
        
        const roleName = staff[0].role_name;
        const columns = roleSheetConfigs[roleName]?.defaultColumns || [];
        const calculatedData = calculateFields(data, columns);
        
        const [existing] = await connection.execute(
          `SELECT id FROM staff_dynamic_sheets WHERE staff_id = ? AND academic_year = ? AND term = ?`,
          [staff_id, academic_year, term]
        );
        
        if (existing.length > 0) {
          await connection.execute(
            `UPDATE staff_dynamic_sheets SET data = ?, updated_at = NOW() WHERE id = ?`,
            [JSON.stringify(calculatedData), existing[0].id]
          );
        } else {
          await connection.execute(
            `INSERT INTO staff_dynamic_sheets (staff_id, sheet_type, data, academic_year, term, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [staff_id, roleName, JSON.stringify(calculatedData), academic_year, term, created_by]
          );
        }
      }
      
      await connection.commit();
      res.json({ success: true, updated: updates.length });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
