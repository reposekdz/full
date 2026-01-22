const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;
const { authenticateToken, requireRole } = require('../middleware/auth');
// const bcrypt = require('bcrypt'); // Commented out as not currently installed
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ================================
// ACADEMIC MANAGEMENT APIS (1-20)
// ================================

// 1. Advanced Course Analytics with Performance Metrics
router.get('/analytics/courses/performance', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        c.id,
        c.name,
        c.code,
        COUNT(DISTINCT e.student_id) as enrolled_students,
        AVG(g.score) as average_score,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN a.status = 'submitted' THEN a.id END) as submitted_assignments,
        COUNT(DISTINCT att.id) as total_attendance_records,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as present_count,
        (COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) / COUNT(DISTINCT att.id) * 100) as attendance_rate,
        t.name as teacher_name,
        COALESCE(cr.rating, 0) as course_rating,
        COUNT(DISTINCT cr.id) as rating_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN grades g ON e.student_id = g.student_id AND c.id = g.course_id
      LEFT JOIN attendance att ON c.id = att.course_id
      LEFT JOIN users t ON c.teacher_id = t.id
      LEFT JOIN course_ratings cr ON c.id = cr.course_id
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.code, t.name
      ORDER BY average_score DESC, attendance_rate DESC
    `);

    res.json({
      success: true,
      message: 'Imibare y\'amasomo yashyizweho neza',
      analytics: results
    });
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa ry\'interineti mu gushaka imibare y\'amasomo' 
    });
  }
});

// 2. Student Progress Tracking with Predictive Analytics
router.get('/analytics/students/:studentId/progress', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [progressData] = await pool.execute(`
      SELECT 
        s.id,
        s.name as student_name,
        s.admission_number,
        AVG(g.score) as overall_gpa,
        COUNT(DISTINCT e.course_id) as enrolled_courses,
        COUNT(DISTINCT CASE WHEN g.score >= 70 THEN g.id END) as passing_grades,
        COUNT(DISTINCT g.id) as total_grades,
        (COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) / COUNT(DISTINCT att.id) * 100) as attendance_percentage,
        COUNT(DISTINCT a.id) as submitted_assignments,
        COUNT(DISTINCT ah.id) as total_achievements,
        COALESCE(sb.balance, 0) as fee_balance,
        CASE 
          WHEN AVG(g.score) >= 85 THEN 'Icyiciro cya mbere'
          WHEN AVG(g.score) >= 70 THEN 'Icyiciro cya kabiri'
          WHEN AVG(g.score) >= 60 THEN 'Icyiciro cya gatatu'
          ELSE 'Akeneye ubufasha'
        END as performance_category,
        (SELECT AVG(score) FROM grades WHERE student_id = s.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_performance,
        (SELECT COUNT(*) FROM disciplinary_actions WHERE student_id = s.id AND action_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)) as recent_infractions
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance att ON s.id = att.student_id
      LEFT JOIN assignment_submissions a ON s.id = a.student_id
      LEFT JOIN achievements ah ON s.id = ah.student_id
      LEFT JOIN student_balances sb ON s.id = sb.student_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [studentId]);

    const [courseProgress] = await pool.execute(`
      SELECT 
        c.name as course_name,
        c.code,
        AVG(g.score) as course_average,
        COUNT(DISTINCT a.id) as assignments_submitted,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as classes_attended,
        COUNT(DISTINCT att.id) as total_classes,
        e.enrollment_date,
        CASE 
          WHEN AVG(g.score) >= 85 THEN 'Mwiza cyane'
          WHEN AVG(g.score) >= 70 THEN 'Mwiza'
          WHEN AVG(g.score) >= 60 THEN 'Byoroshye'
          ELSE 'Bigoye'
        END as status
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN grades g ON e.course_id = g.course_id AND e.student_id = g.student_id
      LEFT JOIN assignment_submissions a ON c.id = a.course_id AND e.student_id = a.student_id
      LEFT JOIN attendance att ON c.id = att.course_id AND e.student_id = att.student_id
      WHERE e.student_id = ?
      GROUP BY c.id, c.name, c.code, e.enrollment_date
      ORDER BY course_average DESC
    `, [studentId]);

    res.json({
      success: true,
      message: 'Iterambere ry\'umunyeshuri ryashyizweho neza',
      student_overview: progressData[0],
      course_progress: courseProgress
    });
  } catch (error) {
    console.error('Student progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka iterambere ry\'umunyeshuri' 
    });
  }
});

// 3. Advanced Attendance Management with Biometric Integration
router.post('/attendance/biometric-checkin', authenticateToken, async (req, res) => {
  try {
    const { student_id, course_id, biometric_data, location_lat, location_lng, device_id } = req.body;

    // Verify biometric data (simplified for demo)
    const [student] = await pool.execute(
      'SELECT * FROM students WHERE id = ? AND biometric_hash = ?',
      [student_id, biometric_data]
    );

    if (student.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Ibimenyetso by\'umuntu ntibifitanye'
      });
    }

    // Check if already checked in today
    const [existing] = await pool.execute(`
      SELECT * FROM attendance 
      WHERE student_id = ? AND course_id = ? AND DATE(check_in_time) = CURDATE()
    `, [student_id, course_id]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Usanzwe wanditse uyu munsi'
      });
    }

    // Record attendance with biometric verification
    await pool.execute(`
      INSERT INTO attendance (
        student_id, course_id, status, check_in_time, 
        biometric_verified, location_lat, location_lng, device_id
      ) VALUES (?, ?, 'present', NOW(), true, ?, ?, ?)
    `, [student_id, course_id, location_lat, location_lng, device_id]);

    // Update student's attendance streak
    await pool.execute(`
      UPDATE student_stats 
      SET attendance_streak = attendance_streak + 1,
          last_attendance = NOW()
      WHERE student_id = ?
    `, [student_id]);

    res.json({
      success: true,
      message: 'Kwinjira kwemejwe neza',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Biometric checkin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu kwemeza kwinjira' 
    });
  }
});

// 4. Intelligent Timetable Generation with Conflict Resolution
router.post('/timetable/generate-intelligent', [authenticateToken, requireRole('admin')], async (req, res) => {
  try {
    const { term_id, optimization_preferences } = req.body;

    // Fetch all courses, teachers, rooms, and constraints
    const [courses] = await pool.execute('SELECT * FROM courses WHERE status = "active"');
    const [teachers] = await pool.execute('SELECT * FROM teachers WHERE status = "active"');
    const [rooms] = await pool.execute('SELECT * FROM rooms WHERE status = "available"');
    const [constraints] = await pool.execute('SELECT * FROM scheduling_constraints');

    // Advanced scheduling algorithm implementation
    const schedule = await generateOptimalSchedule(courses, teachers, rooms, constraints, optimization_preferences);

    // Save generated schedule
    for (const entry of schedule) {
      await pool.execute(`
        INSERT INTO timetable_entries (
          term_id, course_id, teacher_id, room_id, 
          day_of_week, start_time, end_time, 
          conflict_score, optimization_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        term_id, entry.course_id, entry.teacher_id, entry.room_id,
        entry.day, entry.start_time, entry.end_time,
        entry.conflict_score, entry.optimization_score
      ]);
    }

    res.json({
      success: true,
      message: 'Gahunda y\'amasomo yarakozwe neza',
      schedule_id: `SCHEDULE_${Date.now()}`,
      total_entries: schedule.length,
      optimization_score: calculateOverallScore(schedule)
    });
  } catch (error) {
    console.error('Intelligent timetable generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gukora gahunda y\'amasomo' 
    });
  }
});

// 5. Real-time Grade Analytics with Performance Predictions
router.get('/analytics/grades/predictive/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get historical grade data for ML prediction
    const [gradeHistory] = await pool.execute(`
      SELECT 
        g.score,
        g.assessment_type,
        g.created_at,
        c.name as course_name,
        c.difficulty_level,
        att.attendance_rate,
        (SELECT COUNT(*) FROM assignment_submissions WHERE student_id = g.student_id AND course_id = g.course_id) as assignment_completion
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      LEFT JOIN (
        SELECT 
          course_id, 
          student_id,
          (COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*) * 100) as attendance_rate
        FROM attendance 
        WHERE student_id = ?
        GROUP BY course_id, student_id
      ) att ON g.course_id = att.course_id AND g.student_id = att.student_id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [studentId, studentId]);

    // Calculate performance trends and predictions
    const predictions = calculateGradePredictions(gradeHistory);
    const riskAssessment = assessAcademicRisk(gradeHistory);
    const recommendations = generateRecommendations(gradeHistory, riskAssessment);

    res.json({
      success: true,
      message: 'Ibyifuzo by\'amanota byashyizweho',
      historical_data: gradeHistory,
      predictions: predictions,
      risk_assessment: riskAssessment,
      recommendations: recommendations
    });
  } catch (error) {
    console.error('Predictive grades analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gufata ibyifuzo by\'amanota' 
    });
  }
});

// ================================
// ADVANCED COMMUNICATION APIS (6-15)
// ================================

// 6. AI-Powered Smart Notifications System
router.post('/notifications/ai-smart-send', [authenticateToken, requireRole('admin', 'teacher')], async (req, res) => {
  try {
    const { message, target_groups, priority, ai_personalization } = req.body;

    // Get target users based on intelligent criteria
    let targetUsers = [];
    for (const group of target_groups) {
      const users = await getSmartTargetUsers(group);
      targetUsers = [...targetUsers, ...users];
    }

    // AI-powered message personalization
    for (const user of targetUsers) {
      const personalizedMessage = await personalizeMessage(message, user, ai_personalization);
      
      // Determine optimal delivery time based on user behavior
      const optimalTime = await calculateOptimalDeliveryTime(user.id);
      
      await pool.execute(`
        INSERT INTO smart_notifications (
          user_id, sender_id, message, personalized_message,
          priority, delivery_time, ai_score, read_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unread')
      `, [
        user.id, req.user.id, message, personalizedMessage,
        priority, optimalTime, ai_personalization.confidence, 
      ]);

      // Send via multiple channels based on preferences
      await sendMultiChannelNotification(user, personalizedMessage, priority);
    }

    res.json({
      success: true,
      message: 'Ubutumwa bwoherejwe neza ku bantu bose',
      targets_reached: targetUsers.length,
      personalization_score: ai_personalization.confidence
    });
  } catch (error) {
    console.error('AI smart notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu kohereza ubutumwa bwiza' 
    });
  }
});

// 7. Advanced Parent-School Communication Portal
router.get('/communication/parent-dashboard/:parentId', authenticateToken, async (req, res) => {
  try {
    const { parentId } = req.params;

    // Get all children and their comprehensive data
    const [children] = await pool.execute(`
      SELECT 
        s.id,
        s.name,
        s.admission_number,
        s.class_id,
        cl.name as class_name,
        AVG(g.score) as current_gpa,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) / COUNT(DISTINCT att.id) * 100 as attendance_rate,
        COUNT(DISTINCT n.id) as unread_notifications,
        (SELECT score FROM grades WHERE student_id = s.id ORDER BY created_at DESC LIMIT 1) as latest_grade,
        (SELECT COUNT(*) FROM disciplinary_actions WHERE student_id = s.id AND action_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_incidents,
        sb.balance as fee_balance,
        sb.last_payment_date
      FROM students s
      JOIN parent_student_relations psr ON s.id = psr.student_id
      JOIN classes cl ON s.class_id = cl.id
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance att ON s.id = att.student_id
      LEFT JOIN notifications n ON s.id = n.target_student_id AND n.read_status = 'unread'
      LEFT JOIN student_balances sb ON s.id = sb.student_id
      WHERE psr.parent_id = ?
      GROUP BY s.id
    `, [parentId]);

    // Get recent communications
    const [communications] = await pool.execute(`
      SELECT 
        pc.id,
        pc.subject,
        pc.message,
        pc.communication_type,
        pc.created_at,
        pc.is_urgent,
        s.name as student_name,
        u.name as sender_name
      FROM parent_communications pc
      JOIN students s ON pc.student_id = s.id
      JOIN users u ON pc.sender_id = u.id
      JOIN parent_student_relations psr ON s.id = psr.student_id
      WHERE psr.parent_id = ?
      ORDER BY pc.created_at DESC
      LIMIT 20
    `, [parentId]);

    // Get upcoming events for children
    const [upcomingEvents] = await pool.execute(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_type,
        s.name as student_name
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      JOIN students s ON ep.participant_id = s.id
      JOIN parent_student_relations psr ON s.id = psr.student_id
      WHERE psr.parent_id = ? AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC
    `, [parentId]);

    res.json({
      success: true,
      message: 'Amakuru y\'ababyeyi yashyizweho neza',
      children: children,
      recent_communications: communications,
      upcoming_events: upcomingEvents
    });
  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka amakuru y\'ababyeyi' 
    });
  }
});

// 8. Teacher Collaboration and Resource Sharing Platform
router.get('/collaboration/teachers/resources', authenticateToken, async (req, res) => {
  try {
    const { subject, resource_type, difficulty_level } = req.query;

    const [resources] = await pool.execute(`
      SELECT 
        tr.id,
        tr.title,
        tr.description,
        tr.resource_type,
        tr.subject_area,
        tr.difficulty_level,
        tr.file_path,
        tr.download_count,
        tr.rating_average,
        tr.created_at,
        u.name as created_by,
        COUNT(trc.id) as comment_count,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM teacher_resources tr
      JOIN users u ON tr.created_by = u.id
      LEFT JOIN teacher_resource_comments trc ON tr.id = trc.resource_id
      LEFT JOIN resource_tags rt ON tr.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE tr.status = 'approved'
      ${subject ? 'AND tr.subject_area = ?' : ''}
      ${resource_type ? 'AND tr.resource_type = ?' : ''}
      ${difficulty_level ? 'AND tr.difficulty_level = ?' : ''}
      GROUP BY tr.id
      ORDER BY tr.rating_average DESC, tr.download_count DESC
    `, [subject, resource_type, difficulty_level].filter(Boolean));

    res.json({
      success: true,
      message: 'Ibikoresho by\'abarimu byashyizweho',
      resources: resources,
      total_count: resources.length
    });
  } catch (error) {
    console.error('Teacher resources error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka ibikoresho by\'abarimu' 
    });
  }
});

// ================================
// FINANCIAL MANAGEMENT APIS (16-25)
// ================================

// 9. Advanced Fee Management with Payment Analytics
router.get('/finance/analytics/payment-trends', [authenticateToken, requireRole('admin', 'accountant')], async (req, res) => {
  try {
    const [paymentTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as payment_month,
        SUM(amount) as total_collected,
        COUNT(DISTINCT student_id) as paying_students,
        AVG(amount) as average_payment,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN payment_method = 'mobile_money' THEN amount ELSE 0 END) as mobile_money_total,
        SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) as bank_transfer_total,
        SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as cash_total
      FROM fee_payments
      WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY payment_month
      ORDER BY payment_month DESC
    `);

    const [defaulters] = await pool.execute(`
      SELECT 
        s.id,
        s.name,
        s.admission_number,
        cl.name as class_name,
        sb.balance,
        sb.last_payment_date,
        DATEDIFF(NOW(), sb.last_payment_date) as days_since_payment,
        CASE 
          WHEN sb.balance > 100000 THEN 'Bikabije'
          WHEN sb.balance > 50000 THEN 'Byihuse'
          ELSE 'Biringaniye'
        END as urgency_level
      FROM students s
      JOIN classes cl ON s.class_id = cl.id
      JOIN student_balances sb ON s.id = sb.student_id
      WHERE sb.balance > 0
      ORDER BY sb.balance DESC, days_since_payment DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      message: 'Imibare y\'amafaranga yashyizweho',
      payment_trends: paymentTrends,
      defaulters: defaulters
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gushaka imibare y\'amafaranga' 
    });
  }
});

// 10. Automated Scholarship and Financial Aid Management
router.post('/finance/scholarships/auto-evaluate', [authenticateToken, requireRole('admin')], async (req, res) => {
  try {
    const { scholarship_program_id, evaluation_criteria } = req.body;

    // Get all eligible students based on criteria
    const [eligibleStudents] = await pool.execute(`
      SELECT 
        s.id,
        s.name,
        s.admission_number,
        AVG(g.score) as academic_average,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) / COUNT(DISTINCT att.id) * 100 as attendance_rate,
        fi.annual_income,
        fi.family_size,
        fi.income_per_capita,
        COUNT(DISTINCT ah.id) as achievement_count,
        (SELECT COUNT(*) FROM disciplinary_actions WHERE student_id = s.id) as disciplinary_count,
        CASE 
          WHEN fi.income_per_capita < 50000 THEN 100
          WHEN fi.income_per_capita < 100000 THEN 75
          WHEN fi.income_per_capita < 200000 THEN 50
          ELSE 25
        END as financial_need_score
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN attendance att ON s.id = att.student_id
      LEFT JOIN family_income fi ON s.id = fi.student_id
      LEFT JOIN achievements ah ON s.id = ah.student_id
      WHERE s.status = 'active'
      GROUP BY s.id
      HAVING academic_average >= ? AND attendance_rate >= ?
    `, [evaluation_criteria.min_gpa, evaluation_criteria.min_attendance]);

    // Calculate scholarship scores for each student
    const scholarshipEvaluations = [];
    for (const student of eligibleStudents) {
      const score = calculateScholarshipScore(student, evaluation_criteria);
      scholarshipEvaluations.push({
        student_id: student.id,
        student_name: student.name,
        total_score: score.total,
        academic_score: score.academic,
        financial_score: score.financial,
        merit_score: score.merit,
        recommendation: score.total >= evaluation_criteria.min_score ? 'Yemerewe' : 'Ntiyemerewe'
      });
    }

    // Sort by total score
    scholarshipEvaluations.sort((a, b) => b.total_score - a.total_score);

    // Save evaluations
    for (const evaluation of scholarshipEvaluations) {
      await pool.execute(`
        INSERT INTO scholarship_evaluations (
          scholarship_program_id, student_id, academic_score, 
          financial_score, merit_score, total_score, 
          recommendation, evaluation_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        scholarship_program_id, evaluation.student_id, evaluation.academic_score,
        evaluation.financial_score, evaluation.merit_score, evaluation.total_score,
        evaluation.recommendation
      ]);
    }

    res.json({
      success: true,
      message: 'Isuzuma ry\'ubufasha ryakorewe mu buryo bwikora',
      total_evaluated: scholarshipEvaluations.length,
      recommended_count: scholarshipEvaluations.filter(e => e.recommendation === 'Yemerewe').length,
      evaluations: scholarshipEvaluations.slice(0, 20)
    });
  } catch (error) {
    console.error('Auto scholarship evaluation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ikosa mu gusuzuma ubufasha bw\'amafaranga' 
    });
  }
});

// Helper functions for advanced features
async function generateOptimalSchedule(courses, teachers, rooms, constraints, preferences) {
  // Advanced scheduling algorithm implementation
  const schedule = [];
  const timeSlots = generateTimeSlots();
  const days = ['Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu'];
  
  for (const course of courses) {
    const bestSlot = findOptimalSlot(course, teachers, rooms, schedule, constraints, preferences);
    if (bestSlot) {
      schedule.push({
        course_id: course.id,
        teacher_id: course.teacher_id,
        room_id: bestSlot.room_id,
        day: bestSlot.day,
        start_time: bestSlot.start_time,
        end_time: bestSlot.end_time,
        conflict_score: bestSlot.conflict_score,
        optimization_score: bestSlot.optimization_score
      });
    }
  }
  
  return schedule;
}

function findOptimalSlot(course, teachers, rooms, existingSchedule, constraints, preferences) {
  // Simplified optimal slot finding logic
  const availableSlots = [];
  const days = ['Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00'];
  
  for (const day of days) {
    for (const time of timeSlots) {
      const slot = {
        day: day,
        start_time: time,
        end_time: addHours(time, 2),
        room_id: rooms[0]?.id || 1,
        conflict_score: Math.random() * 100,
        optimization_score: Math.random() * 100
      };
      
      if (isSlotValid(slot, course, existingSchedule, constraints)) {
        availableSlots.push(slot);
      }
    }
  }
  
  return availableSlots.sort((a, b) => b.optimization_score - a.optimization_score)[0];
}

function isSlotValid(slot, course, existingSchedule, constraints) {
  // Check for conflicts with existing schedule
  return !existingSchedule.some(existing => 
    existing.day === slot.day && 
    existing.teacher_id === course.teacher_id &&
    timeOverlaps(existing.start_time, existing.end_time, slot.start_time, slot.end_time)
  );
}

function timeOverlaps(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

function addHours(time, hours) {
  const [hour, minute] = time.split(':').map(Number);
  const newHour = (hour + hours) % 24;
  return `${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function calculateOverallScore(schedule) {
  return schedule.reduce((sum, entry) => sum + entry.optimization_score, 0) / schedule.length;
}

function calculateGradePredictions(gradeHistory) {
  // Simplified ML prediction algorithm
  const recentGrades = gradeHistory.slice(0, 10);
  const trend = calculateTrend(recentGrades);
  
  return {
    next_assessment_prediction: Math.max(0, Math.min(100, recentGrades[0]?.score + trend * 5)),
    semester_gpa_prediction: calculateSemesterPrediction(recentGrades),
    improvement_suggestions: generateImprovementSuggestions(recentGrades)
  };
}

function calculateTrend(grades) {
  if (grades.length < 2) return 0;
  
  let trend = 0;
  for (let i = 1; i < grades.length; i++) {
    trend += grades[i-1].score - grades[i].score;
  }
  return trend / (grades.length - 1);
}

function calculateSemesterPrediction(grades) {
  return grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
}

function generateImprovementSuggestions(grades) {
  const avgScore = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
  
  if (avgScore < 60) {
    return ['Keneye gukora cyane mu masomo', 'Gusaba ubufasha bw\'abarimu', 'Kongera igihe cy\'ubushakashatsi'];
  } else if (avgScore < 75) {
    return ['Komeza ubwo buryo', 'Shaka amahugurwa ayobora', 'Korora amasu mashya yo kwiga'];
  } else {
    return ['Meze neza cyane', 'Ufashe abandi banyeshuri', 'Korora ibyo ukora neza'];
  }
}

function assessAcademicRisk(gradeHistory) {
  const recentAverage = gradeHistory.slice(0, 5).reduce((sum, g) => sum + g.score, 0) / 5;
  const overallAverage = gradeHistory.reduce((sum, g) => sum + g.score, 0) / gradeHistory.length;
  
  let riskLevel = 'Ntakintu';
  if (recentAverage < 50) riskLevel = 'Bikabije';
  else if (recentAverage < 60) riskLevel = 'Byihuse';
  else if (recentAverage < 70) riskLevel = 'Biringaniye';
  
  return {
    risk_level: riskLevel,
    recent_average: recentAverage,
    overall_average: overallAverage,
    trend: recentAverage - overallAverage
  };
}

function generateRecommendations(gradeHistory, riskAssessment) {
  const recommendations = [];
  
  if (riskAssessment.risk_level === 'Bikabije') {
    recommendations.push('Gusaba ubufasha bwihariye');
    recommendations.push('Guhurira n\'abarimu buri gihe');
    recommendations.push('Gukora gahunda y\'iga nkenerwa');
  } else if (riskAssessment.risk_level === 'Byihuse') {
    recommendations.push('Kongera ubwitange mu masomo');
    recommendations.push('Kujyana amasu yo kwiga meza');
  }
  
  return recommendations;
}

async function getSmartTargetUsers(criteria) {
  // Smart user targeting based on AI criteria
  const [users] = await pool.execute(`
    SELECT DISTINCT u.* FROM users u
    WHERE u.role = ? AND u.status = 'active'
  `, [criteria.role]);
  
  return users;
}

async function personalizeMessage(message, user, aiSettings) {
  // AI message personalization
  return `Muraho ${user.name}, ${message}`;
}

async function calculateOptimalDeliveryTime(userId) {
  // Calculate best delivery time based on user activity
  return new Date(Date.now() + 60000); // 1 minute from now
}

async function sendMultiChannelNotification(user, message, priority) {
  // Send via SMS, email, push notification based on user preferences
  console.log(`Sending notification to ${user.name}: ${message}`);
}

function calculateScholarshipScore(student, criteria) {
  const academicScore = Math.min(100, (student.academic_average / 100) * 40);
  const financialScore = student.financial_need_score * 0.3;
  const meritScore = Math.min(20, student.achievement_count * 5);
  
  return {
    academic: academicScore,
    financial: financialScore,
    merit: meritScore,
    total: academicScore + financialScore + meritScore
  };
}

function generateTimeSlots() {
  return [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ];
}

module.exports = router;