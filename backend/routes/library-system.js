const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/books', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM library_books WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ? OR publisher LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY title LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [books] = await pool.query(query, params);

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get library books error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
});

router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await pool.query('SELECT * FROM library_books WHERE id = ?', [id]);

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const [borrowingHistory] = await pool.query(
      `SELECT lb.*, u.first_name, u.last_name
       FROM library_borrowings lb
       LEFT JOIN users u ON lb.user_id = u.id
       WHERE lb.book_id = ?
       ORDER BY lb.borrow_date DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      book: { ...books[0], borrowing_history: borrowingHistory }
    });
  } catch (error) {
    console.error('Get library book error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book', error: error.message });
  }
});

router.post('/books', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const {
      title, author, isbn, category, publisher, publication_year,
      quantity, location, description, cover_image
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO library_books 
       (title, author, isbn, category, publisher, publication_year, quantity, 
        available_quantity, location, description, status, cover_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
      [title, author, isbn, category, publisher, publication_year, quantity,
       quantity, location, description, cover_image]
    );

    res.status(201).json({ success: true, message: 'Book added to library', id: result.insertId });
  } catch (error) {
    console.error('Create library book error:', error);
    res.status(500).json({ success: false, message: 'Failed to add book', error: error.message });
  }
});

router.put('/books/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, author, isbn, category, publisher, publication_year,
      quantity, location, description, status, cover_image
    } = req.body;

    const [[currentBook]] = await pool.query(
      'SELECT quantity, available_quantity FROM library_books WHERE id = ?',
      [id]
    );

    let newAvailableQuantity = currentBook.available_quantity;
    if (quantity !== currentBook.quantity) {
      const difference = quantity - currentBook.quantity;
      newAvailableQuantity = currentBook.available_quantity + difference;
      if (newAvailableQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reduce quantity below borrowed amount'
        });
      }
    }

    await pool.query(
      `UPDATE library_books 
       SET title = ?, author = ?, isbn = ?, category = ?, publisher = ?, 
           publication_year = ?, quantity = ?, available_quantity = ?, location = ?, 
           description = ?, status = ?, cover_image = ?
       WHERE id = ?`,
      [title, author, isbn, category, publisher, publication_year, quantity,
       newAvailableQuantity, location, description, status, cover_image, id]
    );

    res.json({ success: true, message: 'Book updated successfully' });
  } catch (error) {
    console.error('Update library book error:', error);
    res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
  }
});

router.delete('/books/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;

    const [[book]] = await pool.query(
      'SELECT available_quantity, quantity FROM library_books WHERE id = ?',
      [id]
    );

    if (book.available_quantity < book.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrowings'
      });
    }

    await pool.query('DELETE FROM library_books WHERE id = ?', [id]);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete library book error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete book', error: error.message });
  }
});

router.get('/borrowings', authenticateToken, async (req, res) => {
  try {
    const { user_id, book_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lb.*, 
        u.first_name as user_first_name, u.last_name as user_last_name,
        b.title as book_title, b.author as book_author, b.isbn,
        i.first_name as issuer_first_name, i.last_name as issuer_last_name
      FROM library_borrowings lb
      LEFT JOIN users u ON lb.user_id = u.id
      LEFT JOIN library_books b ON lb.book_id = b.id
      LEFT JOIN users i ON lb.issued_by = i.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND lb.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND lb.user_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else {
      if (user_id) {
        query += ' AND lb.user_id = ?';
        params.push(user_id);
      }
      if (book_id) {
        query += ' AND lb.book_id = ?';
        params.push(book_id);
      }
    }

    if (status) {
      query += ' AND lb.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(
      'SELECT lb.*, u.first_name as user_first_name, u.last_name as user_last_name, b.title as book_title, b.author as book_author, b.isbn, i.first_name as issuer_first_name, i.last_name as issuer_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY lb.borrow_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [borrowings] = await pool.query(query, params);

    res.json({
      success: true,
      borrowings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get library borrowings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch borrowings', error: error.message });
  }
});

router.post('/borrowings', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { user_id, book_id, due_date, notes } = req.body;

    const [[book]] = await pool.query(
      'SELECT available_quantity, status FROM library_books WHERE id = ?',
      [book_id]
    );

    if (!book || book.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }

    if (book.available_quantity <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    await pool.query('BEGIN');

    const [result] = await pool.query(
      `INSERT INTO library_borrowings 
       (book_id, user_id, borrow_date, due_date, status, notes, issued_by) 
       VALUES (?, ?, NOW(), ?, 'borrowed', ?, ?)`,
      [book_id, user_id, due_date, notes, req.user.id]
    );

    await pool.query(
      'UPDATE library_books SET available_quantity = available_quantity - 1 WHERE id = ?',
      [book_id]
    );

    await pool.query('COMMIT');

    res.status(201).json({ success: true, message: 'Book issued successfully', id: result.insertId });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Create library borrowing error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue book', error: error.message });
  }
});

router.put('/borrowings/:id/return', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fine_amount, notes } = req.body;

    const [[borrowing]] = await pool.query(
      'SELECT book_id, status, due_date FROM library_borrowings WHERE id = ?',
      [id]
    );

    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Borrowing record not found' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    await pool.query('BEGIN');

    const returnDate = new Date();
    const isOverdue = new Date(borrowing.due_date) < returnDate;

    await pool.query(
      `UPDATE library_borrowings 
       SET status = ?, return_date = ?, fine_amount = ?, notes = ?, returned_to = ?
       WHERE id = ?`,
      [isOverdue ? 'overdue' : 'returned', returnDate, fine_amount || 0, notes, req.user.id, id]
    );

    await pool.query(
      'UPDATE library_books SET available_quantity = available_quantity + 1 WHERE id = ?',
      [borrowing.book_id]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Book returned successfully',
      fine_amount: fine_amount || 0,
      is_overdue: isOverdue
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Return library book error:', error);
    res.status(500).json({ success: false, message: 'Failed to return book', error: error.message });
  }
});

router.put('/borrowings/:id/mark-lost', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fine_amount, notes } = req.body;

    const [[borrowing]] = await pool.query(
      'SELECT status FROM library_borrowings WHERE id = ?',
      [id]
    );

    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Borrowing record not found' });
    }

    await pool.query(
      'UPDATE library_borrowings SET status = ?, fine_amount = ?, notes = ? WHERE id = ?',
      ['lost', fine_amount, notes, id]
    );

    res.json({ success: true, message: 'Book marked as lost' });
  } catch (error) {
    console.error('Mark book lost error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark book as lost', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const [totalBooks] = await pool.query('SELECT COUNT(*) as total, SUM(quantity) as total_quantity FROM library_books');
    const [totalBorrowed] = await pool.query('SELECT COUNT(*) as total FROM library_borrowings WHERE status = "borrowed"');
    const [totalOverdue] = await pool.query('SELECT COUNT(*) as total FROM library_borrowings WHERE status = "overdue"');

    const [byCategory] = await pool.query(
      'SELECT category, COUNT(*) as count FROM library_books GROUP BY category'
    );

    const [popularBooks] = await pool.query(
      `SELECT b.id, b.title, b.author, COUNT(lb.id) as borrow_count
       FROM library_books b
       LEFT JOIN library_borrowings lb ON b.id = lb.book_id
       GROUP BY b.id
       ORDER BY borrow_count DESC
       LIMIT 10`
    );

    const [borrowingTrends] = await pool.query(
      `SELECT DATE_FORMAT(borrow_date, '%Y-%m') as month, COUNT(*) as count
       FROM library_borrowings
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    );

    const [finesCollected] = await pool.query(
      'SELECT SUM(fine_amount) as total_fines FROM library_borrowings WHERE fine_amount > 0'
    );

    const [topBorrowers] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, COUNT(lb.id) as borrow_count
       FROM users u
       LEFT JOIN library_borrowings lb ON u.id = lb.user_id
       GROUP BY u.id
       ORDER BY borrow_count DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      analytics: {
        total_books: totalBooks[0].total,
        total_quantity: totalBooks[0].total_quantity,
        total_borrowed: totalBorrowed[0].total,
        total_overdue: totalOverdue[0].total,
        by_category: byCategory,
        popular_books: popularBooks,
        borrowing_trends: borrowingTrends,
        fines_collected: finesCollected[0].total_fines || 0,
        top_borrowers: topBorrowers
      }
    });
  } catch (error) {
    console.error('Get library analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;
