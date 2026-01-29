const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Helper: Calculate grade
const calcGrade = (p) => p >= 90 ? 'A' : p >= 80 ? 'B' : p >= 70 ? 'C' : p >= 60 ? 'D' : 'F';

// ==================== TEACHER ASSIGNMENTS ====================

// Assign teacher to class
router.post('/assign-teacher-class', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, teacher_name, trade_code, level_number, class_name, role, academic_year } = req.body;
    await pool.execute(`INSERT INTO dos_teacher_class_assignments (teacher_id, teacher_name, trade_code, level_number, class_name, role, academic_year, assigned_by) VALUES (?,?,?,?,?,?,?,?)`,
      [teacher_id, teacher_name, trade_code, level_number, class_name, role, academic_year, req.user.userId]);
    res.json({ success: true, message: 'Teacher assigned to class' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign teacher to course
router.post('/assign-teacher-course', authenticateToken, async (req, res) => {
  try {
    const { teacher_id, teacher_name, subject_code, subject_name, trade_code, level_number, academic_year } = req.body;
    await pool.execute(`INSERT INTO dos_teacher_course_assignments (teacher_id, teacher_name, subject_code, subject_name, trade_code, level_number, academic_year, assigned_by) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE is_active=1, assigned_at=NOW()`,
      [teacher_id, teacher_name, subject_code, subject_name, trade_code, level_number, academic_year, req.user.userId]);
    res.json({ success: true, message: 'Teacher assigned to course' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher assignments
router.get('/teacher-assignments/:teacherId', authenticateToken, async (req, res) => {
  try {
    const [classes] = await pool.execute('SELECT * FROM dos_teacher_class_assignments WHERE teacher_id=? AND is_active=1', [req.params.teacherId]);
    const [courses] = await pool.execute('SELECT * FROM dos_teacher_course_assignments WHERE teacher_id=? AND is_active=1', [req.params.teacherId]);
    res.json({ success: true, classes, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all assignments by class
router.get('/class-assignments/:tradeCode/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const [teachers] = await pool.execute('SELECT * FROM dos_teacher_class_assignments WHERE trade_code=? AND level_number=? AND is_active=1', [req.params.tradeCode, req.params.levelNumber]);
    const [courses] = await pool.execute('SELECT * FROM dos_teacher_course_assignments WHERE trade_code=? AND level_number=? AND is_active=1', [req.params.tradeCode, req.params.levelNumber]);
    res.json({ success: true, teachers, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TIMETABLE GENERATION ====================

// Create timetable
router.post('/timetables', authenticateToken, async (req, res) => {
  try {
    const { timetable_name, trade_code, level_number, academic_year, term, start_date, end_date } = req.body;
    const [result] = await pool.execute(`INSERT INTO dos_timetables (timetable_name, trade_code, level_number, academic_year, term, start_date, end_date, created_by) VALUES (?,?,?,?,?,?,?,?)`,
      [timetable_name, trade_code, level_number, academic_year, term, start_date, end_date, req.user.userId]);
    res.json({ success: true, message: 'Timetable created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add timetable slot
router.post('/timetables/:id/slots', authenticateToken, async (req, res) => {
  try {
    const { day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name, room, notes } = req.body;
    await pool.execute(`INSERT INTO dos_timetable_slots (timetable_id, day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name, room, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [req.params.id, day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name, room, notes]);
    res.json({ success: true, message: 'Slot added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get timetable
router.get('/timetables/:id', authenticateToken, async (req, res) => {
  try {
    const [timetable] = await pool.execute('SELECT * FROM dos_timetables WHERE id=?', [req.params.id]);
    const [slots] = await pool.execute('SELECT * FROM dos_timetable_slots WHERE timetable_id=? ORDER BY FIELD(day_of_week,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), period_number', [req.params.id]);
    res.json({ success: true, timetable: timetable[0], slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get timetables by class
router.get('/timetables/class/:tradeCode/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const [timetables] = await pool.execute('SELECT * FROM dos_timetables WHERE trade_code=? AND level_number=? ORDER BY created_at DESC', [req.params.tradeCode, req.params.levelNumber]);
    res.json({ success: true, timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-generate timetable with 12 periods (7:30-17:00)
router.post('/timetables/auto-generate', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.body;
    
    const [courses] = await pool.execute('SELECT * FROM dos_teacher_course_assignments WHERE trade_code=? AND level_number=? AND academic_year=? AND is_active=1', [trade_code, level_number, academic_year]);
    if (courses.length === 0) return res.status(400).json({ success: false, message: 'No courses assigned' });
    
    const [result] = await pool.execute(`INSERT INTO dos_timetables (timetable_name, trade_code, level_number, academic_year, term, status, created_by) VALUES (?,?,?,?,?,'active',?)`,
      [`${trade_code} Level ${level_number} - ${term}`, trade_code, level_number, academic_year, term, req.user.userId]);
    
    const timetableId = result.insertId;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // 12 periods: 7:30-17:00 with breaks
    const periods = [
      { num: 1, start: '07:30', end: '08:10' },
      { num: 2, start: '08:10', end: '08:50' },
      { num: 3, start: '08:50', end: '09:30' },
      { num: 4, start: '09:30', end: '10:10' },
      // Break 10:10-10:25
      { num: 5, start: '10:25', end: '11:05' },
      { num: 6, start: '11:05', end: '11:45' },
      { num: 7, start: '11:45', end: '12:25' },
      // Lunch 12:25-13:25
      { num: 8, start: '13:25', end: '14:05' },
      { num: 9, start: '14:05', end: '14:45' },
      { num: 10, start: '14:45', end: '15:25' },
      // Break 15:25-15:40
      { num: 11, start: '15:40', end: '16:20' },
      { num: 12, start: '16:20', end: '17:00' }
    ];
    
    const teacherSchedule = {};
    const conflicts = [];
    let courseIndex = 0;
    
    for (const day of days) {
      for (const period of periods) {
        if (courseIndex >= courses.length) courseIndex = 0;
        
        const course = courses[courseIndex];
        const scheduleKey = `${course.teacher_id}_${day}_${period.num}`;
        
        if (teacherSchedule[scheduleKey]) {
          conflicts.push({ day, period: period.num, teacher: course.teacher_name, reason: 'Teacher conflict' });
          courseIndex++;
          continue;
        }
        
        await pool.execute(`INSERT INTO dos_timetable_slots (timetable_id, day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name) VALUES (?,?,?,?,?,?,?,?,?)`,
          [timetableId, day, period.num, period.start, period.end, course.subject_code, course.subject_name, course.teacher_id, course.teacher_name]);
        
        teacherSchedule[scheduleKey] = true;
        courseIndex++;
      }
    }
    
    res.json({ success: true, message: 'Timetable generated', id: timetableId, conflicts, total_slots: 60, periods_per_day: 12 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate timetable for multiple trades/levels
router.post('/timetables/bulk-generate', authenticateToken, async (req, res) => {
  try {
    const { selections, academic_year, term } = req.body;
    const results = [];
    
    const periods = [
      { num: 1, start: '07:30', end: '08:10' },
      { num: 2, start: '08:10', end: '08:50' },
      { num: 3, start: '08:50', end: '09:30' },
      { num: 4, start: '09:30', end: '10:10' },
      { num: 5, start: '10:25', end: '11:05' },
      { num: 6, start: '11:05', end: '11:45' },
      { num: 7, start: '11:45', end: '12:25' },
      { num: 8, start: '13:25', end: '14:05' },
      { num: 9, start: '14:05', end: '14:45' },
      { num: 10, start: '14:45', end: '15:25' },
      { num: 11, start: '15:40', end: '16:20' },
      { num: 12, start: '16:20', end: '17:00' }
    ];
    
    for (const sel of selections) {
      try {
        const [courses] = await pool.execute('SELECT * FROM dos_teacher_course_assignments WHERE trade_code=? AND level_number=? AND academic_year=? AND is_active=1', [sel.trade_code, sel.level_number, academic_year]);
        if (courses.length === 0) {
          results.push({ trade_code: sel.trade_code, level_number: sel.level_number, success: false, message: 'No courses' });
          continue;
        }
        
        const [result] = await pool.execute(`INSERT INTO dos_timetables (timetable_name, trade_code, level_number, academic_year, term, status, created_by) VALUES (?,?,?,?,?,'active',?)`,
          [`${sel.trade_code} Level ${sel.level_number} - ${term}`, sel.trade_code, sel.level_number, academic_year, term, req.user.userId]);
        
        const timetableId = result.insertId;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let courseIndex = 0;
        
        for (const day of days) {
          for (const period of periods) {
            if (courseIndex >= courses.length) courseIndex = 0;
            const course = courses[courseIndex];
            await pool.execute(`INSERT INTO dos_timetable_slots (timetable_id, day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name) VALUES (?,?,?,?,?,?,?,?,?)`,
              [timetableId, day, period.num, period.start, period.end, course.subject_code, course.subject_name, course.teacher_id, course.teacher_name]);
            courseIndex++;
          }
        }
        
        results.push({ trade_code: sel.trade_code, level_number: sel.level_number, success: true, timetable_id: timetableId, slots: 60 });
      } catch (err) {
        results.push({ trade_code: sel.trade_code, level_number: sel.level_number, success: false, message: err.message });
      }
    }
    
    res.json({ success: true, message: 'Bulk generation completed', results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});6 * 60) {
          const startHour = Math.floor(time / 60);
          const startMin = time % 60;
          const endTime = time + 40;
          const endHour = Math.floor(endTime / 60);
          const endMin = endTime % 60;
          
          if (time >= 12 * 60 && time < 14 * 60) {
            time = 14 * 60;
            continue;
          }
          
          if (periodNum === 3 || periodNum === 5) time += 10;
          
          periods.push({
            num: periodNum++,
            start: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
            end: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
          });
          
          time += 40;
        }
        
        let courseIndex = 0;
        for (const day of days) {
          for (const period of periods) {
            if (courseIndex >= courses.length) break;
            const course = courses[courseIndex];
            await pool.execute(`INSERT INTO dos_timetable_slots (timetable_id, day_of_week, period_number, start_time, end_time, subject_code, subject_name, teacher_id, teacher_name) VALUES (?,?,?,?,?,?,?,?,?)`,
              [timetableId, day, period.num, period.start, period.end, course.subject_code, course.subject_name, course.teacher_id, course.teacher_name]);
            courseIndex++;
          }
        }
        
        results.push({ trade_code: sel.trade_code, level_number: sel.level_number, success: true, timetable_id: timetableId, slots: courseIndex });
      } catch (err) {
        results.push({ trade_code: sel.trade_code, level_number: sel.level_number, success: false, message: err.message });
      }
    }
    
    res.json({ success: true, message: 'Bulk generation completed', results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check conflicts before generating
router.post('/timetables/check-conflicts', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, academic_year } = req.body;
    
    const [courses] = await pool.execute('SELECT * FROM dos_teacher_course_assignments WHERE trade_code=? AND level_number=? AND academic_year=? AND is_active=1', [trade_code, level_number, academic_year]);
    
    // Check teacher availability across all active timetables
    const conflicts = [];
    const teacherLoads = {};
    
    for (const course of courses) {
      const [existing] = await pool.execute(`
        SELECT COUNT(*) as count, GROUP_CONCAT(DISTINCT t.trade_code) as trades
        FROM dos_timetable_slots s
        JOIN dos_timetables t ON s.timetable_id = t.id
        WHERE s.teacher_id = ? AND t.status = 'active' AND t.academic_year = ?
      `, [course.teacher_id, academic_year]);
      
      teacherLoads[course.teacher_name] = existing[0].count;
      
      if (existing[0].count > 25) {
        conflicts.push({ teacher: course.teacher_name, subject: course.subject_name, issue: 'Overloaded', current_load: existing[0].count, trades: existing[0].trades });
      }
    }
    
    res.json({ success: true, conflicts, teacher_loads: teacherLoads, total_courses: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REPORT CARD GENERATION ====================

// Auto-generate reports for entire class
router.post('/report-cards/auto-generate-class', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, term, academic_year } = req.body;
    
    const [students] = await pool.execute('SELECT student_id FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active"', [trade_code, level_number]);
    
    let processed = 0, failed = 0;
    const stats = { total_gpa: 0, total_attendance: 0, total_conduct: 0 };
    
    for (const student of students) {
      try {
        const [sheet] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id=?', [student.student_id]);
        if (!sheet[0]) continue;
        
        const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id=? AND term=? AND academic_year=?', [student.student_id, term, academic_year]);
        const [attendance] = await pool.execute('SELECT SUM(present_days) as present, SUM(absent_days) as absent, SUM(late_days) as late, AVG(attendance_rate) as rate FROM student_attendance_summary WHERE student_id=?', [student.student_id]);
        const [conduct] = await pool.execute('SELECT * FROM student_conduct_tracking WHERE student_id=?', [student.student_id]);
        
        const totalMarks = subjects.reduce((sum, s) => sum + parseFloat(s.total_marks), 0);
        const avgMarks = subjects.length > 0 ? totalMarks / subjects.length : 0;
        const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / (subjects.length || 1);
        const gpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / (subjects.length || 1);
        const overallGrade = calcGrade(avgPercentage);
        
        const [classStudents] = await pool.execute('SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active"', [trade_code, level_number]);
        const [ranking] = await pool.execute('SELECT COUNT(*) + 1 as rank FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active" AND gpa > ?', [trade_code, level_number, gpa]);
        
        await pool.execute(`INSERT INTO dos_report_cards (student_id, student_code, student_name, trade_code, level_number, term, academic_year, total_subjects, total_marks, average_marks, percentage, gpa, overall_grade, class_rank, total_students, attendance_rate, days_present, days_absent, days_late, conduct_score, conduct_grade, total_incidents, status, generated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'generated',?) ON DUPLICATE KEY UPDATE total_subjects=VALUES(total_subjects), total_marks=VALUES(total_marks), average_marks=VALUES(average_marks), percentage=VALUES(percentage), gpa=VALUES(gpa), overall_grade=VALUES(overall_grade), class_rank=VALUES(class_rank), total_students=VALUES(total_students), attendance_rate=VALUES(attendance_rate), days_present=VALUES(days_present), days_absent=VALUES(days_absent), days_late=VALUES(days_late), conduct_score=VALUES(conduct_score), conduct_grade=VALUES(conduct_grade), total_incidents=VALUES(total_incidents), status=VALUES(status), generated_at=NOW()`,
          [student.student_id, sheet[0].student_code, `${sheet[0].first_name} ${sheet[0].last_name}`, trade_code, level_number, term, academic_year, subjects.length, totalMarks, avgMarks, avgPercentage, gpa, overallGrade, ranking[0].rank, classStudents[0].total, attendance[0].rate, attendance[0].present, attendance[0].absent, attendance[0].late, conduct[0]?.final_score || 100, conduct[0]?.conduct_grade || 'A', sheet[0].total_incidents, req.user.userId]);
        
        stats.total_gpa += gpa;
        stats.total_attendance += attendance[0].rate || 0;
        stats.total_conduct += conduct[0]?.final_score || 100;
        processed++;
      } catch (err) {
        console.error('Error processing student:', err);
        failed++;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Reports auto-generated', 
      processed, 
      failed,
      stats: {
        avg_gpa: (stats.total_gpa / processed).toFixed(2),
        avg_attendance: (stats.total_attendance / processed).toFixed(1),
        avg_conduct: (stats.total_conduct / processed).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reports by class
router.get('/report-cards/class/:tradeCode/:levelNumber', authenticateToken, async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const [reports] = await pool.execute('SELECT * FROM dos_report_cards WHERE trade_code=? AND level_number=? AND term=? AND academic_year=? ORDER BY class_rank', [req.params.tradeCode, req.params.levelNumber, term, academic_year]);
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send SMS to all parents in class
router.post('/report-cards/send-sms-bulk', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, term, academic_year } = req.body;
    
    const [reports] = await pool.execute('SELECT * FROM dos_report_cards WHERE trade_code=? AND level_number=? AND term=? AND academic_year=?', [trade_code, level_number, term, academic_year]);
    
    const smsService = require('../services/smsService');
    let sent = 0;
    
    for (const report of reports) {
      try {
        const [parents] = await pool.execute('SELECT p.phone, p.parent_name FROM parents p JOIN parent_student_links psl ON p.phone=psl.parent_phone WHERE psl.student_id=?', [report.student_id]);
        
        const message = `Dear Parent, ${report.student_name}'s ${term} report: GPA ${report.gpa}, Grade ${report.overall_grade}, Rank ${report.class_rank}/${report.total_students}. Attendance: ${report.attendance_rate}%. Visit school for full report. - GARDEN TVET`;
        
        for (const parent of parents) {
          const result = await smsService.sendSMS(parent.phone, message);
          if (result.success) {
            await pool.execute(`INSERT INTO dos_parent_sms_notifications (student_id, parent_phone, parent_name, message_type, message_content, sms_status, sms_provider, sms_id, cost, sent_by, sent_by_name) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
              [report.student_id, parent.phone, parent.parent_name, 'report_card', message, 'sent', 'AfricasTalking', result.messageId, result.cost, req.user.userId, req.user.name]);
            sent++;
          }
        }
      } catch (err) {
        console.error('SMS error:', err);
      }
    }
    
    res.json({ success: true, message: `SMS sent to ${sent} parents`, sent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
  try {
    const { term, academic_year, class_teacher_comment, dos_comment, principal_comment } = req.body;
    
    const [sheet] = await pool.execute('SELECT * FROM global_student_sheets WHERE student_id=?', [req.params.studentId]);
    if (!sheet[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id=? AND term=? AND academic_year=?', [req.params.studentId, term, academic_year]);
    const [attendance] = await pool.execute('SELECT SUM(present_days) as present, SUM(absent_days) as absent, SUM(late_days) as late, AVG(attendance_rate) as rate FROM student_attendance_summary WHERE student_id=?', [req.params.studentId]);
    const [conduct] = await pool.execute('SELECT * FROM student_conduct_tracking WHERE student_id=?', [req.params.studentId]);
    
    const totalMarks = subjects.reduce((sum, s) => sum + parseFloat(s.total_marks), 0);
    const avgMarks = subjects.length > 0 ? totalMarks / subjects.length : 0;
    const avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / (subjects.length || 1);
    const gpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / (subjects.length || 1);
    const overallGrade = calcGrade(avgPercentage);
    
    const [classStudents] = await pool.execute('SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active"', [sheet[0].trade_code, sheet[0].level_number]);
    const [ranking] = await pool.execute('SELECT COUNT(*) + 1 as rank FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active" AND gpa > ?', [sheet[0].trade_code, sheet[0].level_number, gpa]);
    
    await pool.execute(`INSERT INTO dos_report_cards (student_id, student_code, student_name, trade_code, level_number, term, academic_year, total_subjects, total_marks, average_marks, percentage, gpa, overall_grade, class_rank, total_students, attendance_rate, days_present, days_absent, days_late, conduct_score, conduct_grade, total_incidents, class_teacher_comment, dos_comment, principal_comment, status, generated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'generated',?) ON DUPLICATE KEY UPDATE total_subjects=VALUES(total_subjects), total_marks=VALUES(total_marks), average_marks=VALUES(average_marks), percentage=VALUES(percentage), gpa=VALUES(gpa), overall_grade=VALUES(overall_grade), class_rank=VALUES(class_rank), total_students=VALUES(total_students), attendance_rate=VALUES(attendance_rate), days_present=VALUES(days_present), days_absent=VALUES(days_absent), days_late=VALUES(days_late), conduct_score=VALUES(conduct_score), conduct_grade=VALUES(conduct_grade), total_incidents=VALUES(total_incidents), class_teacher_comment=VALUES(class_teacher_comment), dos_comment=VALUES(dos_comment), principal_comment=VALUES(principal_comment), status=VALUES(status), generated_at=NOW()`,
      [req.params.studentId, sheet[0].student_code, `${sheet[0].first_name} ${sheet[0].last_name}`, sheet[0].trade_code, sheet[0].level_number, term, academic_year, subjects.length, totalMarks, avgMarks, avgPercentage, gpa, overallGrade, ranking[0].rank, classStudents[0].total, attendance[0].rate, attendance[0].present, attendance[0].absent, attendance[0].late, conduct[0]?.final_score || 100, conduct[0]?.conduct_grade || 'A', sheet[0].total_incidents, class_teacher_comment, dos_comment, principal_comment, req.user.userId]);
    
    res.json({ success: true, message: 'Report card generated', data: { gpa, grade: overallGrade, rank: ranking[0].rank } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});nst avgPercentage = subjects.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / (subjects.length || 1);
    const gpa = subjects.reduce((sum, s) => sum + parseFloat(s.grade_points), 0) / (subjects.length || 1);
    const overallGrade = calcGrade(avgPercentage);
    
    const [classStudents] = await pool.execute('SELECT COUNT(*) as total FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active"', [sheet[0].trade_code, sheet[0].level_number]);
    const [ranking] = await pool.execute('SELECT COUNT(*) + 1 as rank FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active" AND gpa > ?', [sheet[0].trade_code, sheet[0].level_number, gpa]);
    
    await pool.execute(`INSERT INTO dos_report_cards (student_id, student_code, student_name, trade_code, level_number, term, academic_year, total_subjects, total_marks, average_marks, percentage, gpa, overall_grade, class_rank, total_students, attendance_rate, days_present, days_absent, days_late, conduct_score, conduct_grade, total_incidents, class_teacher_comment, dos_comment, principal_comment, status, generated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'generated',?) ON DUPLICATE KEY UPDATE total_subjects=VALUES(total_subjects), total_marks=VALUES(total_marks), average_marks=VALUES(average_marks), percentage=VALUES(percentage), gpa=VALUES(gpa), overall_grade=VALUES(overall_grade), class_rank=VALUES(class_rank), total_students=VALUES(total_students), attendance_rate=VALUES(attendance_rate), days_present=VALUES(days_present), days_absent=VALUES(days_absent), days_late=VALUES(days_late), conduct_score=VALUES(conduct_score), conduct_grade=VALUES(conduct_grade), total_incidents=VALUES(total_incidents), class_teacher_comment=VALUES(class_teacher_comment), dos_comment=VALUES(dos_comment), principal_comment=VALUES(principal_comment), status=VALUES(status), generated_at=NOW()`,
      [req.params.studentId, sheet[0].student_code, `${sheet[0].first_name} ${sheet[0].last_name}`, sheet[0].trade_code, sheet[0].level_number, term, academic_year, subjects.length, totalMarks, avgMarks, avgPercentage, gpa, overallGrade, ranking[0].rank, classStudents[0].total, attendance[0].rate, attendance[0].present, attendance[0].absent, attendance[0].late, conduct[0]?.final_score || 100, conduct[0]?.conduct_grade || 'A', sheet[0].total_incidents, class_teacher_comment, dos_comment, principal_comment, req.user.userId]);
    
    res.json({ success: true, message: 'Report card generated', data: { gpa, grade: overallGrade, rank: ranking[0].rank } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate bulk report cards
router.post('/report-cards/generate-bulk', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, term, academic_year } = req.body;
    const batchId = `BATCH_${Date.now()}`;
    
    const [students] = await pool.execute('SELECT student_id FROM global_student_sheets WHERE trade_code=? AND level_number=? AND enrollment_status="active"', [trade_code, level_number]);
    
    await pool.execute(`INSERT INTO dos_bulk_report_queue (batch_id, trade_code, level_number, term, academic_year, total_students, status, started_by) VALUES (?,?,?,?,?,?,'processing',?)`,
      [batchId, trade_code, level_number, term, academic_year, students.length, req.user.userId]);
    
    let processed = 0, failed = 0;
    for (const student of students) {
      try {
        await pool.execute(`CALL generate_report_card(?, ?, ?)`, [student.student_id, term, academic_year]);
        processed++;
      } catch (err) {
        failed++;
      }
    }
    
    await pool.execute(`UPDATE dos_bulk_report_queue SET processed_students=?, failed_students=?, status='completed', completed_at=NOW() WHERE batch_id=?`, [processed, failed, batchId]);
    
    res.json({ success: true, message: 'Bulk generation completed', batch_id: batchId, processed, failed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download report card PDF
router.get('/report-cards/:studentId/pdf', authenticateToken, async (req, res) => {
  try {
    const { term, academic_year } = req.query;
    const [report] = await pool.execute('SELECT * FROM dos_report_cards WHERE student_id=? AND term=? AND academic_year=?', [req.params.studentId, term, academic_year]);
    if (!report[0]) return res.status(404).json({ success: false, message: 'Report not found' });
    
    const [subjects] = await pool.execute('SELECT * FROM student_subject_performance WHERE student_id=? AND term=? AND academic_year=?', [req.params.studentId, term, academic_year]);
    
    const doc = new PDFDocument({ margin: 50 });
    const filename = `report_${report[0].student_code}_${term}_${academic_year}.pdf`;
    const filepath = path.join(__dirname, '../uploads/reports', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) fs.mkdirSync(path.dirname(filepath), { recursive: true });
    
    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('GARDEN TVET SCHOOL', { align: 'center' });
    doc.fontSize(16).text('STUDENT REPORT CARD', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Student: ${report[0].student_name}`);
    doc.text(`Code: ${report[0].student_code}`);
    doc.text(`Trade: ${report[0].trade_code} - Level ${report[0].level_number}`);
    doc.text(`Term: ${term} | Year: ${academic_year}`);
    doc.moveDown();
    
    doc.fontSize(14).text('ACADEMIC PERFORMANCE', { underline: true });
    doc.fontSize(10);
    subjects.forEach(s => {
      doc.text(`${s.subject_name}: ${s.total_marks}/${s.total_max} (${s.percentage}%) - Grade ${s.grade}`);
    });
    doc.moveDown();
    
    doc.text(`Overall: ${report[0].average_marks.toFixed(2)} | GPA: ${report[0].gpa} | Grade: ${report[0].overall_grade}`);
    doc.text(`Rank: ${report[0].class_rank}/${report[0].total_students}`);
    doc.moveDown();
    
    doc.fontSize(14).text('ATTENDANCE', { underline: true });
    doc.fontSize(10).text(`Rate: ${report[0].attendance_rate}% | Present: ${report[0].days_present} | Absent: ${report[0].days_absent}`);
    doc.moveDown();
    
    doc.fontSize(14).text('CONDUCT', { underline: true });
    doc.fontSize(10).text(`Score: ${report[0].conduct_score} | Grade: ${report[0].conduct_grade} | Incidents: ${report[0].total_incidents}`);
    doc.moveDown();
    
    if (report[0].class_teacher_comment) {
      doc.fontSize(14).text('CLASS TEACHER COMMENT', { underline: true });
      doc.fontSize(10).text(report[0].class_teacher_comment);
      doc.moveDown();
    }
    
    if (report[0].dos_comment) {
      doc.fontSize(14).text('DOS COMMENT', { underline: true });
      doc.fontSize(10).text(report[0].dos_comment);
      doc.moveDown();
    }
    
    doc.end();
    
    await pool.execute('UPDATE dos_report_cards SET pdf_path=?, pdf_generated=1 WHERE id=?', [filepath, report[0].id]);
    
    res.download(filepath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SMS TO PARENTS ====================

// Send SMS to parent
router.post('/sms/send', authenticateToken, async (req, res) => {
  try {
    const { student_id, parent_phone, message_type, message_content } = req.body;
    
    const [parent] = await pool.execute('SELECT parent_name FROM parents WHERE phone=?', [parent_phone]);
    
    const smsService = require('../services/smsService');
    const result = await smsService.sendSMS(parent_phone, message_content);
    
    await pool.execute(`INSERT INTO dos_parent_sms_notifications (student_id, parent_phone, parent_name, message_type, message_content, sms_status, sms_provider, sms_id, cost, sent_by, sent_by_name) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [student_id, parent_phone, parent[0]?.parent_name, message_type, message_content, result.success ? 'sent' : 'failed', 'AfricasTalking', result.messageId, result.cost, req.user.userId, req.user.name]);
    
    res.json({ success: result.success, message: result.success ? 'SMS sent' : 'SMS failed', details: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send report card notification to parents
router.post('/sms/send-report-notification/:studentId', authenticateToken, async (req, res) => {
  try {
    const { term, academic_year } = req.body;
    
    const [report] = await pool.execute('SELECT * FROM dos_report_cards WHERE student_id=? AND term=? AND academic_year=?', [req.params.studentId, term, academic_year]);
    if (!report[0]) return res.status(404).json({ success: false, message: 'Report not found' });
    
    const [parents] = await pool.execute('SELECT p.phone, p.parent_name FROM parents p JOIN parent_student_links psl ON p.phone=psl.parent_phone WHERE psl.student_id=?', [req.params.studentId]);
    
    const message = `Dear Parent, ${report[0].student_name}'s ${term} report: GPA ${report[0].gpa}, Grade ${report[0].overall_grade}, Rank ${report[0].class_rank}/${report[0].total_students}. Attendance: ${report[0].attendance_rate}%. Visit school for full report. - GARDEN TVET`;
    
    const smsService = require('../services/smsService');
    let sent = 0;
    for (const parent of parents) {
      try {
        const result = await smsService.sendSMS(parent.phone, message);
        await pool.execute(`INSERT INTO dos_parent_sms_notifications (student_id, parent_phone, parent_name, message_type, message_content, sms_status, sms_provider, sms_id, cost, sent_by, sent_by_name) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [req.params.studentId, parent.phone, parent.parent_name, 'report_card', message, result.success ? 'sent' : 'failed', 'AfricasTalking', result.messageId, result.cost, req.user.userId, req.user.name]);
        if (result.success) sent++;
      } catch (err) {
        console.error('SMS error:', err);
      }
    }
    
    await pool.execute('UPDATE dos_report_cards SET status="sent_to_parent" WHERE id=?', [report[0].id]);
    
    res.json({ success: true, message: `SMS sent to ${sent} parents` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS ====================

// Get comprehensive analytics
router.get('/analytics/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { trade_code, level_number, academic_year, term } = req.query;
    const cacheKey = `analytics_${trade_code}_${level_number}_${academic_year}_${term}`;
    
    const [cached] = await pool.execute('SELECT cache_data FROM dos_analytics_cache WHERE cache_key=? AND expires_at > NOW()', [cacheKey]);
    if (cached[0]) return res.json({ success: true, analytics: JSON.parse(cached[0].cache_data), cached: true });
    
    let where = 'enrollment_status="active"';
    const params = [];
    if (trade_code) { where += ' AND trade_code=?'; params.push(trade_code); }
    if (level_number) { where += ' AND level_number=?'; params.push(level_number); }
    if (academic_year) { where += ' AND academic_year=?'; params.push(academic_year); }
    
    const [overall] = await pool.execute(`SELECT COUNT(*) as total, AVG(gpa) as avg_gpa, AVG(attendance_percentage) as avg_attendance, AVG(conduct_score) as avg_conduct, SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) as paid, SUM(CASE WHEN payment_status='unpaid' THEN 1 ELSE 0 END) as unpaid FROM global_student_sheets WHERE ${where}`, params);
    
    const [gradeDistribution] = await pool.execute(`SELECT overall_grade, COUNT(*) as count FROM global_student_sheets WHERE ${where} GROUP BY overall_grade`, params);
    
    const [topPerformers] = await pool.execute(`SELECT student_code, CONCAT(first_name,' ',last_name) as name, gpa, overall_grade FROM global_student_sheets WHERE ${where} ORDER BY gpa DESC LIMIT 10`, params);
    
    const [subjectPerformance] = await pool.execute(`SELECT sp.subject_name, AVG(sp.percentage) as avg_percentage, COUNT(DISTINCT sp.student_id) as student_count FROM student_subject_performance sp JOIN global_student_sheets gs ON sp.student_id=gs.student_id WHERE gs.${where} ${term ? 'AND sp.term=?' : ''} GROUP BY sp.subject_name ORDER BY avg_percentage DESC`, term ? [...params, term] : params);
    
    const [attendanceTrends] = await pool.execute(`SELECT month, AVG(attendance_rate) as avg_rate FROM student_attendance_summary WHERE student_id IN (SELECT student_id FROM global_student_sheets WHERE ${where}) GROUP BY month ORDER BY FIELD(month,'January','February','March','April','May','June','July','August','September','October','November','December')`, params);
    
    const analytics = {
      overall: overall[0],
      gradeDistribution,
      topPerformers,
      subjectPerformance,
      attendanceTrends,
      generated_at: new Date()
    };
    
    await pool.execute(`INSERT INTO dos_analytics_cache (cache_key, cache_data, trade_code, level_number, academic_year, term, expires_at) VALUES (?,?,?,?,?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE cache_data=VALUES(cache_data), expires_at=VALUES(expires_at)`,
      [cacheKey, JSON.stringify(analytics), trade_code, level_number, academic_year, term]);
    
    res.json({ success: true, analytics, cached: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher performance analytics
router.get('/analytics/teacher-performance', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term } = req.query;
    
    const [teacherStats] = await pool.execute(`
      SELECT 
        tca.teacher_id, tca.teacher_name,
        COUNT(DISTINCT tca.subject_code) as subjects_taught,
        COUNT(DISTINCT CONCAT(tca.trade_code,tca.level_number)) as classes_taught,
        AVG(sp.percentage) as avg_student_performance,
        COUNT(sp.id) as total_marks_entered
      FROM dos_teacher_course_assignments tca
      LEFT JOIN student_subject_performance sp ON tca.subject_code=sp.subject_code AND tca.teacher_id=sp.teacher_id
      WHERE tca.academic_year=? ${term ? 'AND sp.term=?' : ''}
      GROUP BY tca.teacher_id, tca.teacher_name
      ORDER BY avg_student_performance DESC
    `, term ? [academic_year, term] : [academic_year]);
    
    res.json({ success: true, teacherStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher schedule
router.get('/teacher-schedule/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { academic_year } = req.query;
    const [schedule] = await pool.execute(`
      SELECT s.*, t.trade_code, t.level_number, t.timetable_name
      FROM dos_timetable_slots s
      JOIN dos_timetables t ON s.timetable_id = t.id
      WHERE s.teacher_id = ? AND t.academic_year = ? AND t.status = 'active'
      ORDER BY FIELD(s.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday'), s.period_number
    `, [req.params.teacherId, academic_year]);
    
    res.json({ success: true, schedule, total_periods: schedule.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all active timetables
router.get('/timetables/all/active', authenticateToken, async (req, res) => {
  try {
    const { academic_year, term } = req.query;
    let q = 'SELECT * FROM dos_timetables WHERE status="active"';
    const p = [];
    if (academic_year) { q += ' AND academic_year=?'; p.push(academic_year); }
    if (term) { q += ' AND term=?'; p.push(term); }
    q += ' ORDER BY trade_code, level_number';
    
    const [timetables] = await pool.execute(q, p);
    res.json({ success: true, timetables, total: timetables.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
