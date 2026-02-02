const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ==================== DYNAMIC COLUMN MANAGEMENT ====================

// Get all custom columns for a specific entity type
router.get('/columns/:entityType', authenticateToken, async (req, res) => {
  try {
    const { entityType } = req.params;
    
    const [columns] = await pool.execute(`
      SELECT * FROM custom_columns 
      WHERE entity_type = ? AND is_active = 1 
      ORDER BY display_order, created_at
    `, [entityType]);
    
    res.json({ success: true, columns });
  } catch (error) {
    console.error('Get columns error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new custom column
router.post('/columns', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const {
      entity_type,
      column_name,
      column_label,
      column_type,
      data_type,
      is_required,
      is_searchable,
      is_sortable,
      is_filterable,
      default_value,
      validation_rules,
      options,
      display_order,
      description,
      group_name
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO custom_columns (
        entity_type, column_name, column_label, column_type, data_type,
        is_required, is_searchable, is_sortable, is_filterable,
        default_value, validation_rules, options, display_order,
        description, group_name, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entity_type, column_name, column_label, column_type, data_type,
      is_required || 0, is_searchable || 0, is_sortable || 0, is_filterable || 0,
      default_value, JSON.stringify(validation_rules), JSON.stringify(options),
      display_order || 0, description, group_name, req.user.userId
    ]);

    res.json({
      success: true,
      message: 'Column created successfully',
      columnId: result.insertId
    });
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update custom column
router.put('/columns/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'column_label', 'column_type', 'data_type', 'is_required',
      'is_searchable', 'is_sortable', 'is_filterable', 'default_value',
      'validation_rules', 'options', 'display_order', 'description', 'group_name'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === 'validation_rules' || field === 'options') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    
    values.push(id);
    await pool.execute(`UPDATE custom_columns SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Column updated successfully' });
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete/Deactivate custom column
router.delete('/columns/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      await pool.execute('DELETE FROM custom_column_values WHERE column_id = ?', [id]);
      await pool.execute('DELETE FROM custom_columns WHERE id = ?', [id]);
    } else {
      await pool.execute('UPDATE custom_columns SET is_active = 0 WHERE id = ?', [id]);
    }
    
    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UNIVERSAL ENTITY MANAGEMENT ====================

// Get all entities (students, teachers, staff, etc.) with dynamic columns
router.get('/entities/:entityType', authenticateToken, async (req, res) => {
  try {
    const { entityType } = req.params;
    const {
      page = 1,
      limit = 50,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      filters
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Get base table name based on entity type
    const tableMap = {
      students: 'global_student_sheets',
      teachers: 'teachers',
      staff: 'staff',
      parents: 'parents'
    };
    
    const tableName = tableMap[entityType];
    if (!tableName) {
      return res.status(400).json({ success: false, message: 'Invalid entity type' });
    }
    
    // Build query
    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params = [];
    
    // Search
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Apply filters
    if (filters) {
      const filterObj = JSON.parse(filters);
      Object.keys(filterObj).forEach(key => {
        query += ` AND ${key} = ?`;
        params.push(filterObj[key]);
      });
    }
    
    // Sorting
    const allowedSortFields = ['first_name', 'last_name', 'created_at', 'updated_at', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
    
    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [entities] = await pool.execute(query, params);
    
    // Get custom column values for each entity
    const [customColumns] = await pool.execute(`
      SELECT * FROM custom_columns 
      WHERE entity_type = ? AND is_active = 1 
      ORDER BY display_order
    `, [entityType]);
    
    for (let entity of entities) {
      const [customValues] = await pool.execute(`
        SELECT cv.*, cc.column_name, cc.column_label, cc.column_type, cc.data_type
        FROM custom_column_values cv
        JOIN custom_columns cc ON cv.column_id = cc.id
        WHERE cv.entity_type = ? AND cv.entity_id = ?
      `, [entityType, entity.id]);
      
      entity.customFields = {};
      customValues.forEach(val => {
        entity.customFields[val.column_name] = {
          value: val.column_value,
          label: val.column_label,
          type: val.column_type
        };
      });
    }
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (filters) {
      const filterObj = JSON.parse(filters);
      Object.keys(filterObj).forEach(key => {
        countQuery += ` AND ${key} = ?`;
        countParams.push(filterObj[key]);
      });
    }
    
    const [[{ total }]] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      entities,
      customColumns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get entities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single entity with all custom fields
router.get('/entities/:entityType/:id', authenticateToken, async (req, res) => {
  try {
    const { entityType, id } = req.params;
    
    const tableMap = {
      students: 'global_student_sheets',
      teachers: 'teachers',
      staff: 'staff',
      parents: 'parents'
    };
    
    const tableName = tableMap[entityType];
    if (!tableName) {
      return res.status(400).json({ success: false, message: 'Invalid entity type' });
    }
    
    const [entities] = await pool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    if (entities.length === 0) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }
    
    const entity = entities[0];
    
    // Get custom fields
    const [customValues] = await pool.execute(`
      SELECT cv.*, cc.column_name, cc.column_label, cc.column_type, cc.data_type, cc.options
      FROM custom_column_values cv
      JOIN custom_columns cc ON cv.column_id = cc.id
      WHERE cv.entity_type = ? AND cv.entity_id = ?
    `, [entityType, id]);
    
    entity.customFields = {};
    customValues.forEach(val => {
      entity.customFields[val.column_name] = {
        value: val.column_value,
        label: val.column_label,
        type: val.column_type,
        options: val.options ? JSON.parse(val.options) : null
      };
    });
    
    res.json({ success: true, entity });
  } catch (error) {
    console.error('Get entity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save/Update custom field value
router.post('/entities/:entityType/:id/fields', authenticateToken, async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { columnId, value } = req.body;
    
    // Check if value exists
    const [existing] = await pool.execute(`
      SELECT id FROM custom_column_values 
      WHERE entity_type = ? AND entity_id = ? AND column_id = ?
    `, [entityType, id, columnId]);
    
    if (existing.length > 0) {
      await pool.execute(`
        UPDATE custom_column_values 
        SET column_value = ?, updated_at = NOW() 
        WHERE id = ?
      `, [value, existing[0].id]);
    } else {
      await pool.execute(`
        INSERT INTO custom_column_values (entity_type, entity_id, column_id, column_value) 
        VALUES (?, ?, ?, ?)
      `, [entityType, id, columnId, value]);
    }
    
    res.json({ success: true, message: 'Field value saved successfully' });
  } catch (error) {
    console.error('Save field value error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update custom fields
router.post('/entities/:entityType/:id/fields/bulk', authenticateToken, async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { fields } = req.body; // Array of { columnId, value }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const field of fields) {
        const [existing] = await connection.execute(`
          SELECT id FROM custom_column_values 
          WHERE entity_type = ? AND entity_id = ? AND column_id = ?
        `, [entityType, id, field.columnId]);
        
        if (existing.length > 0) {
          await connection.execute(`
            UPDATE custom_column_values 
            SET column_value = ?, updated_at = NOW() 
            WHERE id = ?
          `, [field.value, existing[0].id]);
        } else {
          await connection.execute(`
            INSERT INTO custom_column_values (entity_type, entity_id, column_id, column_value) 
            VALUES (?, ?, ?, ?)
          `, [entityType, id, field.columnId, field.value]);
        }
      }
      
      await connection.commit();
      res.json({ success: true, message: 'Fields updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export entities with custom fields
router.get('/entities/:entityType/export', authenticateToken, async (req, res) => {
  try {
    const { entityType } = req.params;
    const { format = 'json' } = req.query;
    
    const tableMap = {
      students: 'global_student_sheets',
      teachers: 'teachers',
      staff: 'staff',
      parents: 'parents'
    };
    
    const tableName = tableMap[entityType];
    if (!tableName) {
      return res.status(400).json({ success: false, message: 'Invalid entity type' });
    }
    
    const [entities] = await pool.execute(`SELECT * FROM ${tableName}`);
    
    // Get all custom columns
    const [customColumns] = await pool.execute(`
      SELECT * FROM custom_columns 
      WHERE entity_type = ? AND is_active = 1 
      ORDER BY display_order
    `, [entityType]);
    
    // Get all custom values
    const [allCustomValues] = await pool.execute(`
      SELECT cv.*, cc.column_name 
      FROM custom_column_values cv
      JOIN custom_columns cc ON cv.column_id = cc.id
      WHERE cv.entity_type = ?
    `, [entityType]);
    
    // Map custom values to entities
    const exportData = entities.map(entity => {
      const row = { ...entity };
      
      // Add custom fields
      const entityValues = allCustomValues.filter(v => v.entity_id === entity.id);
      entityValues.forEach(val => {
        row[val.column_name] = val.column_value;
      });
      
      return row;
    });
    
    res.json({
      success: true,
      data: exportData,
      columns: customColumns,
      format
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADVANCED SEARCH & FILTERING ====================

// Advanced search with custom field filtering
router.post('/entities/:entityType/search', authenticateToken, async (req, res) => {
  try {
    const { entityType } = req.params;
    const { searchTerm, customFilters, dateRange, advancedFilters } = req.body;
    
    const tableMap = {
      students: 'global_student_sheets',
      teachers: 'teachers',
      staff: 'staff',
      parents: 'parents'
    };
    
    const tableName = tableMap[entityType];
    let query = `SELECT DISTINCT e.* FROM ${tableName} e`;
    const params = [];
    const joins = [];
    const conditions = [];
    
    // Search in base fields
    if (searchTerm) {
      conditions.push(`(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)`);
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // Search in custom fields
    if (customFilters && customFilters.length > 0) {
      customFilters.forEach((filter, index) => {
        const alias = `cv${index}`;
        joins.push(`LEFT JOIN custom_column_values ${alias} ON e.id = ${alias}.entity_id AND ${alias}.entity_type = '${entityType}' AND ${alias}.column_id = ${filter.columnId}`);
        
        if (filter.operator === 'equals') {
          conditions.push(`${alias}.column_value = ?`);
          params.push(filter.value);
        } else if (filter.operator === 'contains') {
          conditions.push(`${alias}.column_value LIKE ?`);
          params.push(`%${filter.value}%`);
        } else if (filter.operator === 'greater_than') {
          conditions.push(`CAST(${alias}.column_value AS DECIMAL) > ?`);
          params.push(filter.value);
        } else if (filter.operator === 'less_than') {
          conditions.push(`CAST(${alias}.column_value AS DECIMAL) < ?`);
          params.push(filter.value);
        }
      });
    }
    
    // Date range filter
    if (dateRange) {
      conditions.push(`e.created_at BETWEEN ? AND ?`);
      params.push(dateRange.start, dateRange.end);
    }
    
    // Build final query
    if (joins.length > 0) {
      query += ' ' + joins.join(' ');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    const [results] = await pool.execute(query, params);
    
    // Attach custom fields to results
    for (let entity of results) {
      const [customValues] = await pool.execute(`
        SELECT cv.*, cc.column_name, cc.column_label
        FROM custom_column_values cv
        JOIN custom_columns cc ON cv.column_id = cc.id
        WHERE cv.entity_type = ? AND cv.entity_id = ?
      `, [entityType, entity.id]);
      
      entity.customFields = {};
      customValues.forEach(val => {
        entity.customFields[val.column_name] = {
          value: val.column_value,
          label: val.column_label
        };
      });
    }
    
    res.json({ success: true, results, total: results.length });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
