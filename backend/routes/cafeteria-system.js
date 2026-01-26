const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== CAFETERIA MENU ====================

router.get('/menu', async (req, res) => {
  try {
    const { category, available, search } = req.query;

    let query = 'SELECT * FROM cafeteria_menu WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (available !== undefined) {
      query += ' AND is_available = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';
    const [menu] = await pool.query(query, params);

    res.json({ success: true, menu });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu', error: error.message });
  }
});

router.get('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query('SELECT * FROM cafeteria_menu WHERE id = ?', [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, item: items[0] });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu item', error: error.message });
  }
});

router.post('/menu', authenticateToken, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    const { name, description, category, price, image_url, is_available, nutritional_info, allergens } = req.body;

    const [result] = await pool.query(
      `INSERT INTO cafeteria_menu 
       (name, description, category, price, image_url, is_available, nutritional_info, allergens) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, price, image_url, is_available !== false ? 1 : 0, 
       JSON.stringify(nutritional_info), JSON.stringify(allergens)]
    );

    res.status(201).json({ success: true, message: 'Menu item created', id: result.insertId });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu item', error: error.message });
  }
});

router.put('/menu/:id', authenticateToken, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, image_url, is_available, nutritional_info, allergens } = req.body;

    await pool.query(
      `UPDATE cafeteria_menu 
       SET name = ?, description = ?, category = ?, price = ?, image_url = ?, 
           is_available = ?, nutritional_info = ?, allergens = ?
       WHERE id = ?`,
      [name, description, category, price, image_url, is_available ? 1 : 0,
       JSON.stringify(nutritional_info), JSON.stringify(allergens), id]
    );

    res.json({ success: true, message: 'Menu item updated' });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu item', error: error.message });
  }
});

router.delete('/menu/:id', authenticateToken, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cafeteria_menu WHERE id = ?', [id]);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete menu item', error: error.message });
  }
});

// ==================== CAFETERIA ORDERS ====================

router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { user_id, status, date_from, date_to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, 
        u.first_name, u.last_name, u.email, u.phone,
        (SELECT COUNT(*) FROM cafeteria_order_items WHERE order_id = o.id) as item_count
      FROM cafeteria_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering: students/parents can only see their own orders
    if (!['admin', 'accountant', 'headmaster'].includes(req.user.role)) {
      query += ' AND o.user_id = ?';
      params.push(req.user.id);
    } else if (user_id) {
      query += ' AND o.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (date_from) {
      query += ' AND DATE(o.created_at) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND DATE(o.created_at) <= ?';
      params.push(date_to);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT o.*, u.first_name, u.last_name, u.email, u.phone, (SELECT COUNT(*) FROM cafeteria_order_items WHERE order_id = o.id) as item_count',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await pool.query(query, params);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(`
      SELECT o.*, 
        u.first_name, u.last_name, u.email, u.phone
      FROM cafeteria_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Check authorization
    if (!['admin', 'accountant', 'headmaster'].includes(req.user.role) && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get order items
    const [items] = await pool.query(`
      SELECT oi.*, cm.name as item_name, cm.category, cm.image_url
      FROM cafeteria_order_items oi
      LEFT JOIN cafeteria_menu cm ON oi.menu_item_id = cm.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { items, delivery_location, delivery_time, special_instructions } = req.body;
    const user_id = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      const [menuItems] = await pool.query('SELECT price FROM cafeteria_menu WHERE id = ?', [item.menu_item_id]);
      if (menuItems.length === 0) {
        return res.status(400).json({ success: false, message: `Menu item ${item.menu_item_id} not found` });
      }
      total_amount += menuItems[0].price * item.quantity;
    }

    // Create order
    const [orderResult] = await pool.query(
      `INSERT INTO cafeteria_orders 
       (user_id, total_amount, status, delivery_location, delivery_time, special_instructions) 
       VALUES (?, ?, 'pending', ?, ?, ?)`,
      [user_id, total_amount, delivery_location, delivery_time, special_instructions]
    );

    const order_id = orderResult.insertId;

    // Create order items
    for (const item of items) {
      const [menuItems] = await pool.query('SELECT price FROM cafeteria_menu WHERE id = ?', [item.menu_item_id]);
      const price = menuItems[0].price;
      const subtotal = price * item.quantity;

      await pool.query(
        `INSERT INTO cafeteria_order_items 
         (order_id, menu_item_id, quantity, price, subtotal) 
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, item.menu_item_id, item.quantity, price, subtotal]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order_id,
      total_amount
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

router.put('/orders/:id/status', authenticateToken, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.query('UPDATE cafeteria_orders SET status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
});

router.delete('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can delete (own order and status is pending, or admin)
    const [orders] = await pool.query('SELECT user_id, status FROM cafeteria_orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];
    const isAdmin = ['admin', 'accountant', 'headmaster'].includes(req.user.role);
    const isOwnOrder = order.user_id === req.user.id;

    if (!isAdmin && (!isOwnOrder || order.status !== 'pending')) {
      return res.status(403).json({ success: false, message: 'Cannot cancel this order' });
    }

    // Delete order items first
    await pool.query('DELETE FROM cafeteria_order_items WHERE order_id = ?', [id]);
    await pool.query('DELETE FROM cafeteria_orders WHERE id = ?', [id]);

    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
});

// ==================== CAFETERIA ANALYTICS ====================

router.get('/analytics', authenticateToken, requireRole('admin', 'accountant', 'headmaster'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = '';
    const params = [];

    if (date_from && date_to) {
      dateFilter = ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(date_from, date_to);
    } else if (date_from) {
      dateFilter = ' AND DATE(created_at) >= ?';
      params.push(date_from);
    } else if (date_to) {
      dateFilter = ' AND DATE(created_at) <= ?';
      params.push(date_to);
    }

    // Total orders and revenue
    const [[totals]] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value
      FROM cafeteria_orders
      WHERE 1=1 ${dateFilter}
    `, params);

    // Orders by status
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
      FROM cafeteria_orders
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `, params);

    // Popular items
    const [popularItems] = await pool.query(`
      SELECT 
        cm.name,
        cm.category,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue
      FROM cafeteria_order_items oi
      JOIN cafeteria_orders o ON oi.order_id = o.id
      JOIN cafeteria_menu cm ON oi.menu_item_id = cm.id
      WHERE 1=1 ${dateFilter}
      GROUP BY oi.menu_item_id, cm.name, cm.category
      ORDER BY total_quantity DESC
      LIMIT 10
    `, params);

    // Revenue by category
    const [byCategory] = await pool.query(`
      SELECT 
        cm.category,
        SUM(oi.quantity) as total_items,
        SUM(oi.subtotal) as total_revenue
      FROM cafeteria_order_items oi
      JOIN cafeteria_orders o ON oi.order_id = o.id
      JOIN cafeteria_menu cm ON oi.menu_item_id = cm.id
      WHERE 1=1 ${dateFilter}
      GROUP BY cm.category
      ORDER BY total_revenue DESC
    `, params);

    // Daily revenue trend
    const [dailyTrend] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM cafeteria_orders
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      analytics: {
        totals,
        byStatus,
        popularItems,
        byCategory,
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Cafeteria analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

// ==================== MENU CATEGORIES ====================

router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as item_count
      FROM cafeteria_menu
      GROUP BY category
      ORDER BY category
    `);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
});

module.exports = router;
