const { pool } = require('../config/database');

/**
 * Comprehensive API Generator Utility
 * Generates full CRUD operations with advanced features
 */

class APIGenerator {
  constructor(tableName, options = {}) {
    this.tableName = tableName;
    this.options = {
      requireAuth: options.requireAuth !== false, // Default true
      allowedRoles: options.allowedRoles || [], // Empty = all authenticated users
      searchFields: options.searchFields || [],
      dateFields: options.dateFields || ['created_at', 'updated_at'],
      softDelete: options.softDelete || false,
      fileFields: options.fileFields || [],
      ...options
    };
  }

  /**
   * Get table structure
   */
  async getTableStructure() {
    const [columns] = await pool.query(`DESCRIBE ${this.tableName}`);
    return columns;
  }

  /**
   * Generate GET ALL endpoint logic
   */
  async getAll(req, res) {
    try {
      const { page = 1, limit = 50, sort = 'id', order = 'DESC', search, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Build query
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];

      // Apply soft delete filter
      if (this.options.softDelete) {
        query += ` AND deleted_at IS NULL`;
      }

      // Apply search
      if (search && this.options.searchFields.length > 0) {
        const searchConditions = this.options.searchFields.map(field => `${field} LIKE ?`).join(' OR ');
        query += ` AND (${searchConditions})`;
        this.options.searchFields.forEach(() => params.push(`%${search}%`));
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query += ` AND ${key} = ?`;
          params.push(value);
        }
      });

      // Count total
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [[{ total }]] = await pool.query(countQuery, params);

      // Apply pagination and sorting
      query += ` ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [data] = await pool.query(query, params);

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(`Get all ${this.tableName} error:`, error);
      res.status(500).json({ success: false, message: 'Failed to fetch data', error: error.message });
    }
  }

  /**
   * Generate GET BY ID endpoint logic
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const [data] = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);

      if (data.length === 0) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      res.json({ success: true, data: data[0] });
    } catch (error) {
      console.error(`Get ${this.tableName} by ID error:`, error);
      res.status(500).json({ success: false, message: 'Failed to fetch data', error: error.message });
    }
  }

  /**
   * Generate CREATE endpoint logic
   */
  async create(req, res) {
    try {
      const data = req.body;
      
      // Get table structure
      const columns = await this.getTableStructure();
      const columnNames = columns.filter(c => c.Field !== 'id' && c.Extra !== 'auto_increment').map(c => c.Field);
      
      // Filter data to only include valid columns
      const validData = {};
      columnNames.forEach(col => {
        if (data[col] !== undefined) {
          validData[col] = data[col];
        }
      });

      // Auto-add timestamps if they exist
      if (columnNames.includes('created_at')) {
        validData.created_at = new Date();
      }
      if (columnNames.includes('updated_at')) {
        validData.updated_at = new Date();
      }

      const fields = Object.keys(validData);
      const values = Object.values(validData);
      const placeholders = fields.map(() => '?').join(', ');

      const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
      const [result] = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: { id: result.insertId, ...validData }
      });
    } catch (error) {
      console.error(`Create ${this.tableName} error:`, error);
      res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
    }
  }

  /**
   * Generate UPDATE endpoint logic
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if record exists
      const [existing] = await pool.query(`SELECT id FROM ${this.tableName} WHERE id = ?`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      // Get table structure
      const columns = await this.getTableStructure();
      const columnNames = columns.filter(c => c.Field !== 'id').map(c => c.Field);

      // Filter data to only include valid columns
      const validData = {};
      columnNames.forEach(col => {
        if (data[col] !== undefined) {
          validData[col] = data[col];
        }
      });

      // Auto-update timestamp
      if (columnNames.includes('updated_at')) {
        validData.updated_at = new Date();
      }

      const fields = Object.keys(validData);
      const values = Object.values(validData);
      const setClause = fields.map(f => `${f} = ?`).join(', ');

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      await pool.query(query, [...values, id]);

      res.json({ success: true, message: 'Record updated successfully' });
    } catch (error) {
      console.error(`Update ${this.tableName} error:`, error);
      res.status(500).json({ success: false, message: 'Failed to update record', error: error.message });
    }
  }

  /**
   * Generate DELETE endpoint logic
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if record exists
      const [existing] = await pool.query(`SELECT id FROM ${this.tableName} WHERE id = ?`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      if (this.options.softDelete) {
        // Soft delete
        await pool.query(`UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`, [id]);
      } else {
        // Hard delete
        await pool.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
      }

      res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
      console.error(`Delete ${this.tableName} error:`, error);
      res.status(500).json({ success: false, message: 'Failed to delete record', error: error.message });
    }
  }

  /**
   * Generate bulk operations
   */
  async bulkCreate(req, res) {
    try {
      const records = req.body.records || [];
      
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'Records array is required' });
      }

      // Get table structure
      const columns = await this.getTableStructure();
      const columnNames = columns.filter(c => c.Field !== 'id' && c.Extra !== 'auto_increment').map(c => c.Field);

      const results = [];
      for (const data of records) {
        const validData = {};
        columnNames.forEach(col => {
          if (data[col] !== undefined) {
            validData[col] = data[col];
          }
        });

        if (columnNames.includes('created_at')) validData.created_at = new Date();
        if (columnNames.includes('updated_at')) validData.updated_at = new Date();

        const fields = Object.keys(validData);
        const values = Object.values(validData);
        const placeholders = fields.map(() => '?').join(', ');

        const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await pool.query(query, values);
        results.push({ id: result.insertId });
      }

      res.status(201).json({
        success: true,
        message: `${results.length} records created successfully`,
        data: results
      });
    } catch (error) {
      console.error(`Bulk create ${this.tableName} error:`, error);
      res.status(500).json({ success: false, message: 'Failed to create records', error: error.message });
    }
  }

  /**
   * Generate Express router with all CRUD operations
   */
  generateRouter() {
    const express = require('express');
    const router = express.Router();
    const { authenticateToken, requireRole } = require('../middleware/auth');

    // Apply authentication middleware if required
    const authMiddleware = this.options.requireAuth ? [authenticateToken] : [];
    if (this.options.allowedRoles.length > 0) {
      authMiddleware.push(requireRole(...this.options.allowedRoles));
    }

    // Define routes
    router.get('/', ...authMiddleware, this.getAll.bind(this));
    router.get('/:id', ...authMiddleware, this.getById.bind(this));
    router.post('/', ...authMiddleware, this.create.bind(this));
    router.put('/:id', ...authMiddleware, this.update.bind(this));
    router.delete('/:id', ...authMiddleware, this.delete.bind(this));
    router.post('/bulk', ...authMiddleware, this.bulkCreate.bind(this));

    return router;
  }
}

module.exports = APIGenerator;
