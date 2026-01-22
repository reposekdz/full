const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Global search endpoint
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [] });
    }

    const searchTerm = `%${q}%`;
    const results = {
      students: [],
      teachers: [],
      courses: [],
      assignments: [],
      exams: [],
      trades: [],
      sports: [],
      notifications: [],
      messages: []
    };

    // Search students
    if (!type || type === 'students') {
      const [students] = await db.query(
        `SELECT id, student_id, first_name, last_name, email, phone, trade_code, 'student' as type 
         FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') 
         AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ?) 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.students = students;
    }

    // Search teachers
    if (!type || type === 'teachers') {
      const [teachers] = await db.query(
        `SELECT id, first_name, last_name, email, phone, 'teacher' as type 
         FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'teacher') 
         AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?) 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.teachers = teachers;
    }

    // Search courses
    if (!type || type === 'courses') {
      const [courses] = await db.query(
        `SELECT id, code, name, description, 'course' as type 
         FROM trade_courses WHERE name LIKE ? OR code LIKE ? OR description LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.courses = courses;
    }

    // Search assignments
    if (!type || type === 'assignments') {
      const [assignments] = await db.query(
        `SELECT id, title, description, due_date, 'assignment' as type 
         FROM assignments WHERE title LIKE ? OR description LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.assignments = assignments;
    }

    // Search exams
    if (!type || type === 'exams') {
      const [exams] = await db.query(
        `SELECT id, title, exam_date, exam_type, 'exam' as type 
         FROM exams WHERE title LIKE ? OR exam_type LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.exams = exams;
    }

    // Search trades
    if (!type || type === 'trades') {
      const [trades] = await db.query(
        `SELECT id, code, name_rw, name_en, description_rw, 'trade' as type 
         FROM trades WHERE name_rw LIKE ? OR name_en LIKE ? OR code LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.trades = trades;
    }

    // Search sports teams
    if (!type || type === 'sports') {
      const [sports] = await db.query(
        `SELECT id, name, sport_type, coach, 'sport' as type 
         FROM teams WHERE name LIKE ? OR sport_type LIKE ? OR coach LIKE ? 
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.sports = sports;
    }

    // Search notifications
    if (!type || type === 'notifications') {
      const [notifications] = await db.query(
        `SELECT id, title, message, type, created_at, 'notification' as type 
         FROM notifications WHERE title LIKE ? OR message LIKE ? 
         ORDER BY created_at DESC LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.notifications = notifications;
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      query: q,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
