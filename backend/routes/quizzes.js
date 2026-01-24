const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all quizzes (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { subject_id, class_id, difficulty, status } = req.query;
    let query = 'SELECT q.*, u.name as teacher_name, s.name as subject_name FROM quizzes q LEFT JOIN users u ON q.teacher_id = u.id LEFT JOIN subjects s ON q.subject_id = s.id WHERE 1=1';
    const params = [];
    
    if (subject_id) {
      query += ' AND q.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      query += ' AND q.class_id = ?';
      params.push(class_id);
    }
    if (difficulty) {
      query += ' AND q.difficulty_level = ?';
      params.push(difficulty);
    }
    if (status) {
      query += ' AND q.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY q.created_at DESC';
    const [quizzes] = await db.query(query, params);
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get quiz by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [quizzes] = await db.query(`
      SELECT q.*, u.name as teacher_name, s.name as subject_name 
      FROM quizzes q 
      LEFT JOIN users u ON q.teacher_id = u.id 
      LEFT JOIN subjects s ON q.subject_id = s.id 
      WHERE q.id = ?
    `, [req.params.id]);
    
    if (!quizzes.length) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const [questions] = await db.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order', [req.params.id]);
    
    res.json({ success: true, quiz: { ...quizzes[0], questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create quiz (Teacher/Admin)
router.post('/', authenticate, authorize(['teacher', 'admin', 'dos']), async (req, res) => {
  try {
    const { title, description, subject_id, class_id, difficulty_level, time_limit, total_marks, passing_marks, instructions, start_time, end_time, randomize_questions, show_results_immediately, allow_review, max_attempts, questions } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO quizzes (title, description, teacher_id, subject_id, class_id, difficulty_level, time_limit, total_marks, passing_marks, instructions, start_time, end_time, randomize_questions, show_results_immediately, allow_review, max_attempts, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, description, req.user.id, subject_id, class_id, difficulty_level, time_limit, total_marks, passing_marks, instructions, start_time, end_time, randomize_questions, show_results_immediately, allow_review, max_attempts]
    );
    
    const quizId = result.insertId;
    
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.query(
          `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks, explanation, question_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [quizId, q.question_text, q.question_type, JSON.stringify(q.options), q.correct_answer, q.marks, q.explanation, i + 1]
        );
      }
    }
    
    res.status(201).json({ success: true, id: quizId, message: 'Quiz created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quiz
router.put('/:id', authenticate, authorize(['teacher', 'admin', 'dos']), async (req, res) => {
  try {
    const { title, description, subject_id, class_id, difficulty_level, time_limit, total_marks, passing_marks, instructions, start_time, end_time, randomize_questions, show_results_immediately, allow_review, max_attempts, status } = req.body;
    
    await db.query(
      `UPDATE quizzes SET title = ?, description = ?, subject_id = ?, class_id = ?, difficulty_level = ?, time_limit = ?, total_marks = ?, passing_marks = ?, instructions = ?, start_time = ?, end_time = ?, randomize_questions = ?, show_results_immediately = ?, allow_review = ?, max_attempts = ?, status = ? WHERE id = ?`,
      [title, description, subject_id, class_id, difficulty_level, time_limit, total_marks, passing_marks, instructions, start_time, end_time, randomize_questions, show_results_immediately, allow_review, max_attempts, status, req.params.id]
    );
    
    res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete quiz
router.delete('/:id', authenticate, authorize(['teacher', 'admin', 'dos']), async (req, res) => {
  try {
    await db.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [req.params.id]);
    await db.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit quiz attempt (Student)
router.post('/:id/submit', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { answers, time_taken } = req.body;
    const quizId = req.params.id;
    const studentId = req.user.id;
    
    const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz.length) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const [attempts] = await db.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?', [quizId, studentId]);
    if (attempts[0].count >= quiz[0].max_attempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }
    
    const [questions] = await db.query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    
    let score = 0;
    let totalMarks = 0;
    const results = [];
    
    questions.forEach(q => {
      totalMarks += q.marks;
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_answer;
      if (isCorrect) score += q.marks;
      
      results.push({
        question_id: q.id,
        student_answer: studentAnswer,
        is_correct: isCorrect,
        marks_obtained: isCorrect ? q.marks : 0
      });
    });
    
    const percentage = (score / totalMarks) * 100;
    const passed = score >= quiz[0].passing_marks;
    
    const [result] = await db.query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, answers, score, total_marks, percentage, passed, time_taken, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [quizId, studentId, JSON.stringify(answers), score, totalMarks, percentage, passed, time_taken]
    );
    
    res.json({ success: true, attemptId: result.insertId, score, totalMarks, percentage, passed, results: quiz[0].show_results_immediately ? results : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student attempts
router.get('/:id/attempts', authenticate, async (req, res) => {
  try {
    const [attempts] = await db.query(`
      SELECT qa.*, q.title, q.total_marks 
      FROM quiz_attempts qa 
      JOIN quizzes q ON qa.quiz_id = q.id 
      WHERE qa.quiz_id = ? AND qa.student_id = ? 
      ORDER BY qa.attempted_at DESC
    `, [req.params.id, req.user.id]);
    
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get quiz analytics (Teacher/Admin)
router.get('/:id/analytics', authenticate, authorize(['teacher', 'admin', 'dos']), async (req, res) => {
  try {
    const [attempts] = await db.query(`
      SELECT qa.*, u.name as student_name 
      FROM quiz_attempts qa 
      JOIN users u ON qa.student_id = u.id 
      WHERE qa.quiz_id = ? 
      ORDER BY qa.percentage DESC
    `, [req.params.id]);
    
    const totalAttempts = attempts.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts || 0;
    const avgPercentage = attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts || 0;
    
    res.json({ 
      success: true, 
      analytics: {
        totalAttempts,
        passedCount,
        failedCount: totalAttempts - passedCount,
        passPercentage: (passedCount / totalAttempts) * 100 || 0,
        avgScore,
        avgPercentage,
        attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
