const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==========================================
// AUTOMATIC TIMETABLE GENERATION (DOD/DOS)
// ==========================================

/**
 * Automatically generate a timetable for a specific class
 * based on subjects assigned to that course/level and available teachers.
 */
router.post('/generate-timetable', [authenticateToken, requireRole('super_admin', 'admin', 'dos')], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { class_id, academic_year_id, term } = req.body;

    await connection.beginTransaction();

    // 1. Get Class Details (including course and level)
    const [[classDetails]] = await connection.query(`
      SELECT c.*, co.id as course_id 
      FROM classes c 
      JOIN courses co ON c.course_id = co.id 
      WHERE c.id = ?
    `, [class_id]);

    if (!classDetails) {
      throw new Error('Class not found');
    }

    // 2. Get Subjects for this Course
    const [subjects] = await connection.query(`
      SELECT * FROM subjects WHERE course_id = ? AND is_active = 1
    `, [classDetails.course_id]);

    // 3. Get Available Teachers for these subjects
    // (Assuming a table or relationship exists, otherwise we'll pick any teacher for now)
    const [teachers] = await connection.query('SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = "teacher") AND is_active = 1');

    if (subjects.length === 0 || teachers.length === 0) {
      throw new Error('Incomplete data: No subjects or teachers available');
    }

    // 4. Time Slots Definition
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
      { start: '08:00', end: '09:30' },
      { start: '10:00', end: '11:30' },
      { start: '11:45', end: '13:15' },
      { start: '14:30', end: '16:00' }
    ];

    // Clear existing timetable for this class and academic year
    await connection.query('DELETE FROM timetable_entries WHERE class_id = ? AND academic_year_id = ?', [class_id, academic_year_id]);

    let subjectIndex = 0;
    const generatedEntries = [];

    // Simple Round-Robin Assignment with Conflict Check
    for (const day of days) {
      for (const slot of slots) {
        const subject = subjects[subjectIndex % subjects.length];
        const teacher = teachers[subjectIndex % teachers.length]; // Simplified: cycle through teachers

        // Check for teacher conflict in other classes
        const [conflicts] = await connection.query(`
          SELECT id FROM timetable_entries 
          WHERE teacher_id = ? AND day_of_week = ? AND academic_year_id = ?
          AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
        `, [teacher.id, day, academic_year_id, slot.start, slot.start, slot.end, slot.end]);

        if (conflicts.length === 0) {
          await connection.query(`
            INSERT INTO timetable_entries (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, academic_year_id, room)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [class_id, subject.id, teacher.id, day, slot.start, slot.end, academic_year_id, 'Room ' + (Math.floor(Math.random() * 10) + 1)]);
          
          generatedEntries.push({ day, slot, subject: subject.name });
          subjectIndex++;
        }
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Timetable generated successfully with conflict resolution', entries_count: generatedEntries.length });
  } catch (error) {
    await connection.rollback();
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// EXAM LOCALS MANAGEMENT (DOD/DOS)
// ==========================================

/**
 * Automate Exam Seating/Local assignment for all students
 */
router.post('/automate-exam-locals', [authenticateToken, requireRole('super_admin', 'admin', 'dos')], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { exam_id, room_capacity_list } = req.body; 
    // room_capacity_list: [{room_name: 'Hall A', capacity: 50}, ...]

    await connection.beginTransaction();

    // 1. Get all students registered for this exam
    const [students] = await connection.query(`
      SELECT er.student_id, u.first_name, u.last_name, c.name as class_name
      FROM exam_registrations er
      JOIN users u ON er.student_id = u.id
      JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      JOIN classes c ON e.class_id = c.id
      WHERE er.exam_id = ?
      ORDER BY c.name, u.last_name, u.first_name
    `, [exam_id]);

    if (students.length === 0) {
      throw new Error('No students registered for this exam');
    }

    // 2. Clear existing seating for this exam
    await connection.query('DELETE FROM exam_seating WHERE exam_id = ?', [exam_id]);

    let studentIndex = 0;
    const assignments = [];

    // 3. Assign students to rooms based on capacity
    for (const room of room_capacity_list) {
      for (let i = 0; i < room.capacity && studentIndex < students.length; i++) {
        const student = students[studentIndex];
        const seat_number = `S-${i + 1}`;

        await connection.query(`
          INSERT INTO exam_seating (exam_id, student_id, room_name, seat_number)
          VALUES (?, ?, ?, ?)
        `, [exam_id, student.student_id, room.room_name, seat_number]);

        assignments.push({ student_name: `${student.first_name} ${student.last_name}`, room: room.room_name, seat: seat_number });
        studentIndex++;
      }
    }

    await connection.commit();
    res.json({ 
      success: true, 
      message: `Successfully assigned ${assignments.length} students to ${room_capacity_list.length} exam locals`,
      total_students: students.length,
      assigned_count: studentIndex
    });
  } catch (error) {
    await connection.rollback();
    console.error('Exam automation error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get ready-to-print class sheet for DOS
 */
router.get('/print-ready-class-sheet/:classId', [authenticateToken], async (req, res) => {
  try {
    const { classId } = req.params;
    const { academic_year_id } = req.query;

    const [classInfo] = await pool.query('SELECT * FROM classes WHERE id = ?', [classId]);
    const [students] = await pool.query(`
      SELECT u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as full_name,
             u.gender, u.serial_code,
             (SELECT SUM(points) FROM student_points WHERE student_id = u.id) as total_points
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [classId]);

    res.json({
      success: true,
      class: classInfo[0],
      students,
      print_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
