const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/stock-categories', async (req, res) => {
  try {
    const { search = '', isActive } = req.query;
    
    let query = 'SELECT * FROM stock_categories WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

    const [categories] = await pool.query(query, params);

    for (let category of categories) {
      const [itemCount] = await pool.query(
        'SELECT COUNT(*) as count, SUM(current_quantity) as total_quantity FROM stock_items WHERE category_id = ?',
        [category.id]
      );
      category.item_count = itemCount[0].count;
      category.total_quantity = itemCount[0].total_quantity || 0;
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching stock categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock categories', error: error.message });
  }
});

router.post('/stock-categories', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO stock_categories (name, description, is_active)
      VALUES (?, ?, ?)
    `, [name, description, isActive !== undefined ? isActive : true]);

    const [newCategory] = await pool.query('SELECT * FROM stock_categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Stock category created successfully',
      data: newCategory[0]
    });
  } catch (error) {
    console.error('Error creating stock category:', error);
    res.status(500).json({ success: false, message: 'Failed to create stock category', error: error.message });
  }
});

router.put('/stock-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const [existing] = await pool.query('SELECT * FROM stock_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock category not found' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE stock_categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM stock_categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Stock category updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating stock category:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock category', error: error.message });
  }
});

router.delete('/stock-categories/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM stock_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock category not found' });
    }

    const [itemCheck] = await connection.query('SELECT COUNT(*) as count FROM stock_items WHERE category_id = ?', [id]);
    if (itemCheck[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with existing items' 
      });
    }

    await connection.query('DELETE FROM stock_categories WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Stock category deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting stock category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete stock category', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/stock-items', async (req, res) => {
  try {
    const { categoryId, search = '', lowStock, page = 1, limit = 50, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT si.*, sc.name as category_name, sc.description as category_description
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      query += ' AND si.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      query += ' AND (si.name LIKE ? OR si.sku LIKE ? OR si.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (lowStock === 'true') {
      query += ' AND si.current_quantity <= si.minimum_quantity';
    }

    const countQuery = query.replace(/SELECT si\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    const validSortFields = ['name', 'sku', 'current_quantity', 'unit_price', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY si.${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [items] = await pool.query(query, params);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock items', error: error.message });
  }
});

router.get('/stock-items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT si.*, sc.name as category_name
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    const [movements] = await pool.query(`
      SELECT * FROM stock_movements
      WHERE item_id = ?
      ORDER BY movement_date DESC
      LIMIT 20
    `, [id]);

    res.json({
      success: true,
      data: {
        ...items[0],
        recent_movements: movements
      }
    });
  } catch (error) {
    console.error('Error fetching stock item:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock item', error: error.message });
  }
});

router.post('/stock-items', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, sku, description, categoryId, quantity, minimumQuantity, unitPrice, location } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and category ID are required' 
      });
    }

    if (sku) {
      const [existing] = await connection.query('SELECT id FROM stock_items WHERE sku = ?', [sku]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }

    const [categoryCheck] = await connection.query('SELECT id FROM stock_categories WHERE id = ?', [categoryId]);
    if (categoryCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const [result] = await connection.query(`
      INSERT INTO stock_items (name, sku, description, category_id, quantity, minimum_quantity, unit_price, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, sku, description, categoryId, quantity || 0, minimumQuantity || 0, unitPrice || 0, location]);

    if (quantity > 0) {
      await connection.query(`
        INSERT INTO stock_movements (item_id, movement_type, quantity, movement_date, notes)
        VALUES (?, 'in', ?, NOW(), 'Initial stock')
      `, [result.insertId, quantity]);
    }

    await connection.commit();

    const [newItem] = await connection.query(`
      SELECT si.*, sc.name as category_name
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      data: newItem[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating stock item:', error);
    res.status(500).json({ success: false, message: 'Failed to create stock item', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/stock-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, categoryId, minimumQuantity, unitPrice, location } = req.body;

    const [existing] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    if (sku && sku !== existing[0].sku) {
      const [duplicate] = await pool.query('SELECT id FROM stock_items WHERE sku = ? AND id != ?', [sku, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (sku !== undefined) { updates.push('sku = ?'); params.push(sku); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (categoryId) { updates.push('category_id = ?'); params.push(categoryId); }
    if (minimumQuantity !== undefined) { updates.push('minimum_quantity = ?'); params.push(minimumQuantity); }
    if (unitPrice !== undefined) { updates.push('unit_price = ?'); params.push(unitPrice); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE stock_items SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT si.*, sc.name as category_name
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Stock item updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock item', error: error.message });
  }
});

router.delete('/stock-items/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    await connection.query('DELETE FROM stock_movements WHERE item_id = ?', [id]);
    await connection.query('DELETE FROM stock_items WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting stock item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete stock item', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/stock-movements', async (req, res) => {
  try {
    const { itemId, movementType, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sm.*, si.name as item_name, si.sku, u.username as user_name
      FROM stock_movements sm
      LEFT JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (itemId) {
      query += ' AND sm.item_id = ?';
      params.push(itemId);
    }

    if (movementType) {
      query += ' AND sm.movement_type = ?';
      params.push(movementType);
    }

    if (dateFrom) {
      query += ' AND sm.movement_date >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND sm.movement_date <= ?';
      params.push(dateTo);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY sm.movement_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [movements] = await pool.query(query, params);

    res.json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movements', error: error.message });
  }
});

router.post('/stock-movements', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { itemId, movementType, quantity, movementDate, userId, notes, reference } = req.body;

    if (!itemId || !movementType || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item ID, movement type, and quantity are required' 
      });
    }

    const validTypes = ['in', 'out', 'adjustment', 'transfer'];
    if (!validTypes.includes(movementType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid movement type. Must be: in, out, adjustment, or transfer' 
      });
    }

    const [item] = await connection.query('SELECT * FROM stock_items WHERE id = ?', [itemId]);
    if (item.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }

    let newQuantity = item[0].quantity;
    if (movementType === 'in' || movementType === 'adjustment') {
      newQuantity += parseInt(quantity);
    } else if (movementType === 'out' || movementType === 'transfer') {
      newQuantity -= parseInt(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock. Current quantity: ' + item[0].quantity 
        });
      }
    }

    const [result] = await connection.query(`
      INSERT INTO stock_movements (item_id, movement_type, quantity, movement_date, user_id, notes, reference)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [itemId, movementType, quantity, movementDate || new Date(), userId, notes, reference]);

    await connection.query('UPDATE stock_items SET quantity = ? WHERE id = ?', [newQuantity, itemId]);

    await connection.commit();

    const [newMovement] = await connection.query(`
      SELECT sm.*, si.name as item_name, u.username as user_name
      FROM stock_movements sm
      LEFT JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE sm.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: newMovement[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating stock movement:', error);
    res.status(500).json({ success: false, message: 'Failed to create stock movement', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/stock-reports/low-stock', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT si.*, sc.name as category_name,
             (si.minimum_quantity - si.quantity) as deficit
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.quantity <= si.minimum_quantity
      ORDER BY deficit DESC
    `);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching low stock report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock report', error: error.message });
  }
});

router.get('/stock-reports/summary', async (req, res) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity <= minimum_quantity THEN 1 ELSE 0 END) as low_stock_items,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_items
      FROM stock_items
    `);

    const [byCategory] = await pool.query(`
      SELECT sc.name as category_name,
             COUNT(si.id) as item_count,
             SUM(si.quantity) as total_quantity,
             SUM(si.quantity * si.unit_price) as total_value
      FROM stock_categories sc
      LEFT JOIN stock_items si ON sc.id = si.category_id
      GROUP BY sc.id
      ORDER BY total_value DESC
    `);

    const [recentMovements] = await pool.query(`
      SELECT sm.*, si.name as item_name, u.username as user_name
      FROM stock_movements sm
      LEFT JOIN stock_items si ON sm.item_id = si.id
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.movement_date DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        summary: summary[0],
        byCategory,
        recentMovements
      }
    });
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock summary', error: error.message });
  }
});

router.get('/stock-reports/valuation', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT si.*, sc.name as category_name,
             (si.quantity * si.unit_price) as total_value
      FROM stock_items si
      LEFT JOIN stock_categories sc ON si.category_id = sc.id
      WHERE si.quantity > 0
      ORDER BY total_value DESC
    `);

    const totalValue = items.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0);

    res.json({
      success: true,
      data: {
        items,
        totalValue
      }
    });
  } catch (error) {
    console.error('Error fetching stock valuation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock valuation', error: error.message });
  }
});

module.exports = router;
