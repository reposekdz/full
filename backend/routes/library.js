const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all books
router.get('/books', authenticate, async (req, res) => {
  try {
    const { search, category, available } = req.query;
    let query = 'SELECT * FROM library_books WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (available === 'true') {
      query += ' AND available_copies > 0';
    }
    
    const [books] = await db.query(query, params);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue book
router.post('/issue', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { book_id } = req.body;
    const student_id = req.user.id;
    
    const [book] = await db.query('SELECT * FROM library_books WHERE id = ?', [book_id]);
    if (!book.length || book[0].available_copies <= 0) {
      return res.status(400).json({ error: 'Book not available' });
    }
    
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14);
    
    await db.query('INSERT INTO book_issues (book_id, student_id, issue_date, due_date, status) VALUES (?, ?, NOW(), ?, "issued")', 
      [book_id, student_id, due_date]);
    await db.query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
    
    res.json({ success: true, due_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return book
router.post('/return/:issueId', authenticate, async (req, res) => {
  try {
    const [issue] = await db.query('SELECT * FROM book_issues WHERE id = ?', [req.params.issueId]);
    if (!issue.length) return res.status(404).json({ error: 'Issue not found' });
    
    const fine = new Date() > new Date(issue[0].due_date) ? 500 : 0;
    
    await db.query('UPDATE book_issues SET return_date = NOW(), status = "returned", fine = ? WHERE id = ?', [fine, req.params.issueId]);
    await db.query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?', [issue[0].book_id]);
    
    res.json({ success: true, fine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my issues
router.get('/my-issues', authenticate, authorize(['student']), async (req, res) => {
  try {
    const [issues] = await db.query(`
      SELECT bi.*, lb.title, lb.author, lb.isbn 
      FROM book_issues bi 
      JOIN library_books lb ON bi.book_id = lb.id 
      WHERE bi.student_id = ? 
      ORDER BY bi.issue_date DESC
    `, [req.user.id]);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
