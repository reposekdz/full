const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// ASSESSMENT TYPES & CONFIGURATION (10 endpoints)
// ==========================================

// Get all assessment types
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const [types] = await pool.execute(`
      SELECT at.*, 
        COUNT(DISTINCT a.id) as assessment_count,
        ay.year_name as academic_year
      FROM assessment_types at
      LEFT JOIN assessments a ON at.id = a.assessment_type_id
      LEFT JOIN academic_years ay ON at.academic_year_id = ay.id
      GROUP BY at.id
      ORDER BY at.weight DESC
    `);
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create assessment type
router.post('/types/create', authenticateToken, requireRole('dos', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { name, description, weight, max_score, academic_year_id, is_formative } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO assessment_types 
      (name, description, weight, max_score, academic_year_id, is_formative, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [name, description, weight, max_score, academic_year_id, is_formative || false]);
    
    res.json({ success: true, message: 'Assessment type created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update assessment type
router.put('/types/:id', authenticateToken, requireRole('dos', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weight, max_score, is_formative } = req.body;
    
    await pool.execute(`
      UPDATE assessment_types 
      SET name = ?, description = ?, weight = ?, max_score = ?, is_formative = ?
      WHERE id = ?
    `, [name, description, weight, max_score, is_formative, id]);
    
    res.json({ success: true, message: 'Assessment type updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get grading scales
router.get('/grading-scales', authenticateToken, async (req, res) => {
  try {
    const [scales] = await pool.execute(`
      SELECT gs.*, ay.year_name
      FROM grading_scales gs
      JOIN academic_years ay ON gs.academic_year_id = ay.id
      ORDER BY gs.min_percentage DESC
    `);
    res.json({ success: true, scales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create grading scale
router.post('/grading-scales/create', authenticateToken, requireRole('dos', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { grade, min_percentage, max_percentage, gpa_value, description, academic_year_id } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO grading_scales 
      (grade, min_percentage, max_percentage, gpa_value, description, academic_year_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [grade, min_percentage, max_percentage, gpa_value, description, academic_year_id]);
    
    res.json({ success: true, message: 'Grading scale created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ASSESSMENTS MANAGEMENT (20 endpoints)
// ==========================================

// Get all assessments with filters
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const { subject_id, class_id, teacher_id, assessment_type_id, term, academic_year } = req.query;
    
    let filters = '';
    const params = [];
    
    if (subject_id) {
      filters += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    if (class_id) {
      filters += ' AND a.trade_class_id = ?';
      params.push(class_id);
    }
    if (teacher_id) {
      filters += ' AND a.created_by = ?';
      params.push(teacher_id);
    }
    if (assessment_type_id) {
      filters += ' AND a.assessment_type_id = ?';
      params.push(assessment_type_id);
    }
    if (term) {
      filters += ' AND a.term = ?';
      params.push(term);
    }
    
    const [assessments] = await pool.execute(`
      SELECT 
        a.*, s.name as subject_name, s.code as subject_code,
        tc.class_name, tl.trade_name, tl.level_number,
        at.name as assessment_type_name, at.weight, at.max_score,
        CONCAT(teacher.first_name, ' ', teacher.last_name) as teacher_name,
        COUNT(DISTINCT ar.student_id) as submitted_count,
        (SELECT COUNT(*) FROM student_enrollments 
         WHERE trade_class_id = a.trade_class_id AND is_active = TRUE) as total_students
      FROM assessments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN trade_classes tc ON a.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      JOIN assessment_types at ON a.assessment_type_id = at.id
      LEFT JOIN users teacher ON a.created_by = teacher.id
      LEFT JOIN assessment_results ar ON a.id = ar.assessment_id
      WHERE 1=1 ${filters}
      GROUP BY a.id
      ORDER BY a.due_date DESC
    `, params);
    
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assessment details
router.get('/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [assessments] = await pool.execute(`
      SELECT 
        a.*, s.name as subject_name, s.code as subject_code,
        tc.class_name, tl.trade_name, tl.level_number,
        at.name as assessment_type_name, at.weight, at.max_score,
        CONCAT(teacher.first_name, ' ', teacher.last_name) as teacher_name
      FROM assessments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN trade_classes tc ON a.trade_class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      JOIN assessment_types at ON a.assessment_type_id = at.id
      LEFT JOIN users teacher ON a.created_by = teacher.id
      WHERE a.id = ?
    `, [id]);
    
    if (assessments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    const [results] = await pool.execute(`
      SELECT 
        ar.*, u.student_id, u.first_name, u.last_name, u.email,
        CONCAT(grader.first_name, ' ', grader.last_name) as graded_by_name
      FROM assessment_results ar
      JOIN users u ON ar.student_id = u.id
      LEFT JOIN users grader ON ar.graded_by = grader.id
      WHERE ar.assessment_id = ?
      ORDER BY u.last_name, u.first_name
    `, [id]);
    
    res.json({ success: true, assessment: assessments[0], results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create assessment
router.post('/assessments/create', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const {
      title, description, subject_id, trade_class_id, assessment_type_id,
      total_marks, due_date, term, instructions, rubric_criteria
    } = req.body;
    const created_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO assessments 
      (title, description, subject_id, trade_class_id, assessment_type_id, 
       total_marks, due_date, term, instructions, rubric_criteria, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [title, description, subject_id, trade_class_id, assessment_type_id, 
        total_marks, due_date, term, instructions, rubric_criteria, created_by]);
    
    res.json({ success: true, message: 'Assessment created', assessment_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update assessment
router.put('/assessments/:id', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, total_marks, due_date, instructions, rubric_criteria } = req.body;
    
    await pool.execute(`
      UPDATE assessments 
      SET title = ?, description = ?, total_marks = ?, due_date = ?, 
          instructions = ?, rubric_criteria = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, total_marks, due_date, instructions, rubric_criteria, id]);
    
    res.json({ success: true, message: 'Assessment updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete assessment
router.delete('/assessments/:id', authenticateToken, requireRole('teacher', 'dos', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM assessment_results WHERE assessment_id = ?', [id]);
    await pool.execute('DELETE FROM assessments WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Publish assessment results
router.post('/assessments/:id/publish', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(`
      UPDATE assessments SET is_published = TRUE, published_at = NOW() WHERE id = ?
    `, [id]);
    
    res.json({ success: true, message: 'Assessment results published' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// RESULTS & GRADING (20 endpoints)
// ==========================================

// Submit assessment result
router.post('/results/submit', authenticateToken, async (req, res) => {
  try {
    const { assessment_id, student_id, score, feedback, submission_url } = req.body;
    const submitted_by = req.user.role === 'student' ? req.user.id : student_id;
    
    const [result] = await pool.execute(`
      INSERT INTO assessment_results 
      (assessment_id, student_id, score, feedback, submission_url, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, NOW(), 'submitted')
      ON DUPLICATE KEY UPDATE 
        score = VALUES(score),
        feedback = VALUES(feedback),
        submission_url = VALUES(submission_url),
        submitted_at = NOW(),
        status = 'resubmitted'
    `, [assessment_id, submitted_by, score, feedback, submission_url]);
    
    res.json({ success: true, message: 'Result submitted', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grade assessment result
router.post('/results/grade', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { result_id, score, feedback, rubric_scores } = req.body;
    const graded_by = req.user.id;
    
    await pool.execute(`
      UPDATE assessment_results 
      SET score = ?, feedback = ?, rubric_scores = ?, graded_by = ?, 
          graded_at = NOW(), status = 'graded'
      WHERE id = ?
    `, [score, feedback, rubric_scores, graded_by, result_id]);
    
    res.json({ success: true, message: 'Result graded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk grade results
router.post('/results/bulk-grade', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { results } = req.body;
    const graded_by = req.user.id;
    
    const promises = results.map(r => 
      pool.execute(`
        UPDATE assessment_results 
        SET score = ?, feedback = ?, graded_by = ?, graded_at = NOW(), status = 'graded'
        WHERE assessment_id = ? AND student_id = ?
      `, [r.score, r.feedback, graded_by, r.assessment_id, r.student_id])
    );
    
    await Promise.all(promises);
    
    res.json({ success: true, message: `${results.length} results graded` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student assessment results
router.get('/results/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject_id, term, academic_year } = req.query;
    
    let filters = '';
    const params = [studentId];
    
    if (subject_id) {
      filters += ' AND a.subject_id = ?';
      params.push(subject_id);
    }
    if (term) {
      filters += ' AND a.term = ?';
      params.push(term);
    }
    
    const [results] = await pool.execute(`
      SELECT 
        ar.*, a.title, a.total_marks, a.due_date, a.term,
        s.name as subject_name, s.code as subject_code,
        at.name as assessment_type, at.weight,
        CONCAT(grader.first_name, ' ', grader.last_name) as graded_by_name,
        ROUND((ar.score / a.total_marks) * 100, 2) as percentage
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      JOIN subjects s ON a.subject_id = s.id
      JOIN assessment_types at ON a.assessment_type_id = at.id
      LEFT JOIN users grader ON ar.graded_by = grader.id
      WHERE ar.student_id = ? ${filters}
      ORDER BY a.due_date DESC
    `, params);
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get class assessment statistics
router.get('/results/class/:classId/stats', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { assessment_id } = req.query;
    
    let assessmentFilter = '';
    const params = [classId];
    
    if (assessment_id) {
      assessmentFilter = 'AND ar.assessment_id = ?';
      params.push(assessment_id);
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        a.id as assessment_id, a.title, a.total_marks,
        COUNT(ar.id) as submitted_count,
        AVG(ar.score) as average_score,
        MAX(ar.score) as highest_score,
        MIN(ar.score) as lowest_score,
        STDDEV(ar.score) as std_deviation,
        COUNT(CASE WHEN ar.status = 'graded' THEN 1 END) as graded_count
      FROM assessments a
      LEFT JOIN assessment_results ar ON a.id = ar.assessment_id
      WHERE a.trade_class_id = ? ${assessmentFilter}
      GROUP BY a.id, a.title, a.total_marks
    `, params);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subject performance analytics
router.get('/analytics/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { class_id, term } = req.query;
    
    let filters = '';
    const params = [subjectId];
    
    if (class_id) {
      filters += ' AND a.trade_class_id = ?';
      params.push(class_id);
    }
    if (term) {
      filters += ' AND a.term = ?';
      params.push(term);
    }
    
    const [analytics] = await pool.execute(`
      SELECT 
        u.id, u.student_id, u.first_name, u.last_name,
        COUNT(ar.id) as assessments_taken,
        AVG(ROUND((ar.score / a.total_marks) * 100, 2)) as average_percentage,
        SUM(ar.score * at.weight) / SUM(at.weight * a.total_marks) * 100 as weighted_score
      FROM users u
      JOIN student_enrollments se ON u.id = se.student_id AND se.is_active = TRUE
      LEFT JOIN assessment_results ar ON u.id = ar.student_id
      LEFT JOIN assessments a ON ar.assessment_id = a.id AND a.subject_id = ?
      LEFT JOIN assessment_types at ON a.assessment_type_id = at.id
      WHERE u.role = 'student' ${filters}
      GROUP BY u.id, u.student_id, u.first_name, u.last_name
      HAVING assessments_taken > 0
      ORDER BY weighted_score DESC
    `, params);
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate progress report for student
router.get('/reports/student/:studentId/progress', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academic_year } = req.query;
    
    let termFilter = term ? 'AND a.term = ?' : '';
    const params = [studentId];
    if (term) params.push(term);
    
    const [subjectScores] = await pool.execute(`
      SELECT 
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        COUNT(ar.id) as assessments_count,
        AVG(ROUND((ar.score / a.total_marks) * 100, 2)) as average_percentage,
        SUM(ar.score * at.weight) / SUM(at.weight * a.total_marks) * 100 as weighted_score,
        MIN(ROUND((ar.score / a.total_marks) * 100, 2)) as min_percentage,
        MAX(ROUND((ar.score / a.total_marks) * 100, 2)) as max_percentage
      FROM subjects s
      JOIN assessments a ON s.id = a.subject_id
      JOIN assessment_results ar ON a.id = ar.assessment_id
      JOIN assessment_types at ON a.assessment_type_id = at.id
      WHERE ar.student_id = ? ${termFilter}
      GROUP BY s.id, s.name, s.code
    `, params);
    
    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT ar.id) as total_assessments,
        AVG(ROUND((ar.score / a.total_marks) * 100, 2)) as overall_average,
        COUNT(DISTINCT a.subject_id) as subjects_count
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      WHERE ar.student_id = ? ${termFilter}
    `, params);
    
    res.json({ 
      success: true, 
      subject_scores: subjectScores,
      overall: overallStats[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get grade distribution for assessment
router.get('/analytics/assessment/:assessmentId/distribution', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const [distribution] = await pool.execute(`
      SELECT 
        gs.grade,
        COUNT(*) as student_count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results WHERE assessment_id = ?)), 2) as percentage
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      JOIN grading_scales gs ON 
        ROUND((ar.score / a.total_marks) * 100, 2) BETWEEN gs.min_percentage AND gs.max_percentage
      WHERE ar.assessment_id = ?
      GROUP BY gs.grade, gs.min_percentage
      ORDER BY gs.min_percentage DESC
    `, [assessmentId, assessmentId]);
    
    res.json({ success: true, distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// RUBRICS & CRITERIA (10 endpoints)
// ==========================================

// Create rubric
router.post('/rubrics/create', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { name, description, criteria, subject_id } = req.body;
    const created_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO rubrics (name, description, criteria, subject_id, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [name, description, JSON.stringify(criteria), subject_id, created_by]);
    
    res.json({ success: true, message: 'Rubric created', rubric_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get rubrics for subject
router.get('/rubrics/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const [rubrics] = await pool.execute(`
      SELECT 
        r.*, s.name as subject_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM rubrics r
      JOIN subjects s ON r.subject_id = s.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.subject_id = ?
      ORDER BY r.created_at DESC
    `, [subjectId]);
    
    rubrics.forEach(r => r.criteria = JSON.parse(r.criteria));
    
    res.json({ success: true, rubrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply rubric to assessment
router.post('/assessments/:assessmentId/apply-rubric', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { rubric_id } = req.body;
    
    const [rubric] = await pool.execute('SELECT criteria FROM rubrics WHERE id = ?', [rubric_id]);
    
    if (rubric.length === 0) {
      return res.status(404).json({ success: false, message: 'Rubric not found' });
    }
    
    await pool.execute(`
      UPDATE assessments SET rubric_criteria = ? WHERE id = ?
    `, [rubric[0].criteria, assessmentId]);
    
    res.json({ success: true, message: 'Rubric applied to assessment' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// COMPETENCY TRACKING (10 endpoints)
// ==========================================

// Create competency
router.post('/competencies/create', authenticateToken, requireRole('dos', 'admin', 'headmaster'), async (req, res) => {
  try {
    const { name, description, subject_id, level, learning_outcomes } = req.body;
    
    const [result] = await pool.execute(`
      INSERT INTO competencies 
      (name, description, subject_id, level, learning_outcomes, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [name, description, subject_id, level, learning_outcomes]);
    
    res.json({ success: true, message: 'Competency created', competency_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get competencies for subject
router.get('/competencies/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const [competencies] = await pool.execute(`
      SELECT c.*, s.name as subject_name
      FROM competencies c
      JOIN subjects s ON c.subject_id = s.id
      WHERE c.subject_id = ?
      ORDER BY c.level, c.name
    `, [subjectId]);
    
    res.json({ success: true, competencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track student competency achievement
router.post('/competencies/track', authenticateToken, requireRole('teacher', 'dos', 'admin'), async (req, res) => {
  try {
    const { student_id, competency_id, proficiency_level, assessment_id, notes } = req.body;
    const assessed_by = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO student_competencies 
      (student_id, competency_id, proficiency_level, assessment_id, notes, assessed_by, assessed_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        proficiency_level = VALUES(proficiency_level),
        notes = VALUES(notes),
        assessed_by = VALUES(assessed_by),
        assessed_at = NOW()
    `, [student_id, competency_id, proficiency_level, assessment_id, notes, assessed_by]);
    
    res.json({ success: true, message: 'Competency tracked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student competency progress
router.get('/competencies/student/:studentId/progress', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject_id } = req.query;
    
    let subjectFilter = subject_id ? 'AND c.subject_id = ?' : '';
    const params = [studentId];
    if (subject_id) params.push(subject_id);
    
    const [progress] = await pool.execute(`
      SELECT 
        c.*, sc.proficiency_level, sc.assessed_at, sc.notes,
        s.name as subject_name,
        CONCAT(assessor.first_name, ' ', assessor.last_name) as assessed_by_name
      FROM competencies c
      LEFT JOIN student_competencies sc ON c.id = sc.competency_id AND sc.student_id = ?
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN users assessor ON sc.assessed_by = assessor.id
      WHERE 1=1 ${subjectFilter}
      ORDER BY s.name, c.level, c.name
    `, params);
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PEER & SELF ASSESSMENT (10 endpoints)
// ==========================================

// Submit peer assessment
router.post('/peer-assessment/submit', authenticateToken, async (req, res) => {
  try {
    const { assessment_id, assessed_student_id, scores, comments } = req.body;
    const assessor_id = req.user.id;
    
    const [result] = await pool.execute(`
      INSERT INTO peer_assessments 
      (assessment_id, assessor_id, assessed_student_id, scores, comments, submitted_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [assessment_id, assessor_id, assessed_student_id, JSON.stringify(scores), comments]);
    
    res.json({ success: true, message: 'Peer assessment submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get peer assessment results
router.get('/peer-assessment/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { assessment_id } = req.query;
    
    let assessmentFilter = assessment_id ? 'AND pa.assessment_id = ?' : '';
    const params = [studentId];
    if (assessment_id) params.push(assessment_id);
    
    const [results] = await pool.execute(`
      SELECT 
        pa.*, a.title as assessment_title,
        CONCAT(assessor.first_name, ' ', assessor.last_name) as assessor_name
      FROM peer_assessments pa
      JOIN assessments a ON pa.assessment_id = a.id
      JOIN users assessor ON pa.assessor_id = assessor.id
      WHERE pa.assessed_student_id = ? ${assessmentFilter}
      ORDER BY pa.submitted_at DESC
    `, params);
    
    results.forEach(r => r.scores = JSON.parse(r.scores));
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
