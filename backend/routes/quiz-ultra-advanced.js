const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create quiz
router.post('/', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const {
      title, description, subject_id, trade_code, level_number, level_suffix,
      difficulty_level, time_limit, total_marks, passing_marks, instructions,
      start_time, end_time, randomize_questions, show_results_immediately,
      allow_review, max_attempts, questions
    } = req.body;
    
    const [result] = await connection.execute(
      `INSERT INTO quizzes (
        teacher_id, title, description, subject_id, trade_code, level_number, level_suffix,
        difficulty_level, time_limit, total_marks, passing_marks, instructions,
        start_time, end_time, randomize_questions, show_results_immediately,
        allow_review, max_attempts, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        req.user.id, title, description, subject_id, trade_code, level_number, level_suffix,
        difficulty_level, time_limit, total_marks, passing_marks, instructions,
        start_time, end_time, randomize_questions, show_results_immediately,
        allow_review, max_attempts
      ]
    );
    
    const quizId = result.insertId;
    
    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [qResult] = await connection.execute(
        `INSERT INTO quiz_questions (
          quiz_id, question_order, question_type, question_text, points,
          options, correct_answer, explanation, media_url, media_type,
          code_language, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId, i + 1, q.type, q.question_text, q.points,
          JSON.stringify(q.options || []), JSON.stringify(q.correct_answer || ''),
          q.explanation, q.media_url, q.media_type, q.code_language, q.difficulty
        ]
      );
    }
    
    await connection.commit();
    res.json({ success: true, quiz_id: quizId, message: 'Quiz created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  } finally {
    connection.release();
  }
});

// Get all quizzes for teacher
router.get('/', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const [quizzes] = await db.execute(
      `SELECT q.*, 
        COUNT(DISTINCT qq.id) as question_count,
        COUNT(DISTINCT qs.id) as submission_count,
        AVG(qs.score) as avg_score
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
      WHERE q.teacher_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC`,
      [req.user.id]
    );
    
    // Parse JSON fields
    const parsedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: []
    }));
    
    res.json({ success: true, quizzes: parsedQuizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// Get quiz by ID with questions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [quizzes] = await db.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [req.params.id]
    );
    
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const [questions] = await db.execute(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order',
      [req.params.id]
    );
    
    const quiz = {
      ...quizzes[0],
      questions: questions.map(q => ({
        ...q,
        options: JSON.parse(q.options || '[]'),
        correct_answer: JSON.parse(q.correct_answer || '""')
      }))
    };
    
    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// Submit quiz (student)
router.post('/:id/submit', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { answers, time_taken } = req.body;
    const quizId = req.params.id;
    
    // Get quiz and questions
    const [quizzes] = await connection.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );
    
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const quiz = quizzes[0];
    
    // Check attempts
    const [attempts] = await connection.execute(
      'SELECT COUNT(*) as count FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?',
      [quizId, req.user.id]
    );
    
    if (attempts[0].count >= quiz.max_attempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }
    
    // Get questions with correct answers
    const [questions] = await connection.execute(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order',
      [quizId]
    );
    
    // Auto-grade
    let totalScore = 0;
    let correctAnswers = 0;
    const gradedAnswers = [];
    
    for (const question of questions) {
      const studentAnswer = answers[question.id];
      const correctAnswer = JSON.parse(question.correct_answer);
      let isCorrect = false;
      let pointsEarned = 0;
      
      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        isCorrect = studentAnswer === correctAnswer;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.question_type === 'short_answer' || question.question_type === 'fill_blank') {
        // Simple string comparison (can be enhanced with fuzzy matching)
        isCorrect = studentAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        pointsEarned = isCorrect ? question.points : 0;
      } else {
        // Essay and code questions need manual grading
        pointsEarned = 0;
      }
      
      if (isCorrect) correctAnswers++;
      totalScore += pointsEarned;
      
      gradedAnswers.push({
        question_id: question.id,
        student_answer: studentAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      });
    }
    
    const percentage = (totalScore / quiz.total_marks) * 100;
    const passed = totalScore >= quiz.passing_marks;
    
    // Save submission
    const [result] = await connection.execute(
      `INSERT INTO quiz_submissions (
        quiz_id, student_id, score, total_marks, percentage, passed,
        time_taken, submitted_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'completed')`,
      [quizId, req.user.id, totalScore, quiz.total_marks, percentage, passed, time_taken]
    );
    
    const submissionId = result.insertId;
    
    // Save individual answers
    for (const answer of gradedAnswers) {
      await connection.execute(
        `INSERT INTO quiz_answers (
          submission_id, question_id, student_answer, is_correct, points_earned
        ) VALUES (?, ?, ?, ?, ?)`,
        [submissionId, answer.question_id, answer.student_answer, answer.is_correct, answer.points_earned]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      submission_id: submissionId,
      score: totalScore,
      total_marks: quiz.total_marks,
      percentage: percentage.toFixed(2),
      passed,
      correct_answers: correctAnswers,
      total_questions: questions.length,
      show_results: quiz.show_results_immediately
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  } finally {
    connection.release();
  }
});

// Get quiz submissions (teacher)
router.get('/:id/submissions', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const [submissions] = await db.execute(
      `SELECT qs.*, 
        CONCAT(gss.first_name, ' ', gss.last_name) as student_name,
        gss.student_code,
        gss.trade_code,
        gss.level_number
      FROM quiz_submissions qs
      JOIN global_student_sheets gss ON qs.student_id = gss.student_id
      WHERE qs.quiz_id = ?
      ORDER BY qs.submitted_at DESC`,
      [req.params.id]
    );
    
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
});

// Get quiz analytics
router.get('/:id/analytics', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as total_submissions,
        AVG(score) as avg_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        AVG(percentage) as avg_percentage,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
        AVG(time_taken) as avg_time_taken
      FROM quiz_submissions
      WHERE quiz_id = ?`,
      [req.params.id]
    );
    
    const [questionStats] = await db.execute(
      `SELECT 
        qq.id,
        qq.question_text,
        qq.question_type,
        qq.points,
        COUNT(qa.id) as total_answers,
        SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        AVG(qa.points_earned) as avg_points
      FROM quiz_questions qq
      LEFT JOIN quiz_answers qa ON qq.id = qa.question_id
      WHERE qq.quiz_id = ?
      GROUP BY qq.id`,
      [req.params.id]
    );
    
    const [scoreDistribution] = await db.execute(
      `SELECT 
        CASE 
          WHEN percentage >= 90 THEN 'A (90-100%)'
          WHEN percentage >= 80 THEN 'B (80-89%)'
          WHEN percentage >= 70 THEN 'C (70-79%)'
          WHEN percentage >= 60 THEN 'D (60-69%)'
          ELSE 'F (Below 60%)'
        END as grade,
        COUNT(*) as count
      FROM quiz_submissions
      WHERE quiz_id = ?
      GROUP BY grade
      ORDER BY grade`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      analytics: {
        overall: stats[0],
        questions: questionStats,
        score_distribution: scoreDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// Update quiz
router.put('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const {
      title, description, difficulty_level, time_limit, passing_marks,
      instructions, start_time, end_time, randomize_questions,
      show_results_immediately, allow_review, max_attempts, status
    } = req.body;
    
    await connection.execute(
      `UPDATE quizzes SET
        title = ?, description = ?, difficulty_level = ?, time_limit = ?,
        passing_marks = ?, instructions = ?, start_time = ?, end_time = ?,
        randomize_questions = ?, show_results_immediately = ?, allow_review = ?,
        max_attempts = ?, status = ?, updated_at = NOW()
      WHERE id = ? AND teacher_id = ?`,
      [
        title, description, difficulty_level, time_limit, passing_marks,
        instructions, start_time, end_time, randomize_questions,
        show_results_immediately, allow_review, max_attempts, status,
        req.params.id, req.user.id
      ]
    );
    
    await connection.commit();
    res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  } finally {
    connection.release();
  }
});

// Delete quiz
router.delete('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM quizzes WHERE id = ? AND teacher_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
});

// Publish quiz
router.post('/:id/publish', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    await db.execute(
      'UPDATE quizzes SET status = ?, published_at = NOW() WHERE id = ? AND teacher_id = ?',
      ['published', req.params.id, req.user.id]
    );
    
    res.json({ success: true, message: 'Quiz published successfully' });
  } catch (error) {
    console.error('Error publishing quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to publish quiz' });
  }
});

module.exports = router;
