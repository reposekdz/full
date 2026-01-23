const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ============ TEACHERS MANAGEMENT ============

// Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const [teachers] = await pool.query(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM teacher_assignments WHERE teacher_id = t.id AND is_active = true) as active_assignments
      FROM dos_teachers t
      WHERE t.is_active = true
      ORDER BY t.last_name, t.first_name
    `);
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

// Get single teacher
router.get('/teachers/:id', async (req, res) => {
  try {
    const [teachers] = await pool.query('SELECT * FROM dos_teachers WHERE id = ?', [req.params.id]);
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get assignments
    const [assignments] = await pool.query(`
      SELECT ta.*, c.name as class_name, co.name as course_name, co.code as course_code
      FROM teacher_assignments ta
      JOIN dos_classes c ON ta.class_id = c.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.teacher_id = ? AND ta.is_active = true
    `, [req.params.id]);
    
    teachers[0].assignments = assignments;
    res.json(teachers[0]);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Error fetching teacher' });
  }
});

// Create teacher
router.post('/teachers', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, qualification, experience_years, employee_id, hire_date } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO dos_teachers (first_name, last_name, email, phone, specialization, qualification, experience_years, employee_id, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, specialization, qualification, experience_years || 0, employee_id, hire_date]
    );
    
    res.status(201).json({ message: 'Teacher created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Error creating teacher' });
  }
});

// Update teacher
router.put('/teachers/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, qualification, experience_years, employee_id, hire_date } = req.body;
    
    await pool.query(
      'UPDATE dos_teachers SET first_name = ?, last_name = ?, email = ?, phone = ?, specialization = ?, qualification = ?, experience_years = ?, employee_id = ?, hire_date = ? WHERE id = ?',
      [first_name, last_name, email, phone, specialization, qualification, experience_years, employee_id, hire_date, req.params.id]
    );
    
    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Error updating teacher' });
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req, res) => {
  try {
    await pool.query('UPDATE dos_teachers SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Error deleting teacher' });
  }
});

// ============ TRADES MANAGEMENT ============

// Get all trades
router.get('/trades', async (req, res) => {
  try {
    const [trades] = await pool.query(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM dos_classes WHERE trade_id = t.id AND is_active = true) as class_count,
        (SELECT COUNT(*) FROM dos_courses WHERE trade_id = t.id AND is_active = true) as course_count
      FROM dos_trades t
      WHERE t.is_active = true
      ORDER BY t.name
    `);
    res.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ message: 'Error fetching trades' });
  }
});

// Create trade
router.post('/trades', async (req, res) => {
  try {
    const { name, code, description, duration_years } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO dos_trades (name, code, description, duration_years) VALUES (?, ?, ?, ?)',
      [name, code, description, duration_years || 3]
    );
    
    res.status(201).json({ message: 'Trade created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ message: 'Error creating trade' });
  }
});

// Update trade
router.put('/trades/:id', async (req, res) => {
  try {
    const { name, code, description, duration_years } = req.body;
    
    await pool.query(
      'UPDATE dos_trades SET name = ?, code = ?, description = ?, duration_years = ? WHERE id = ?',
      [name, code, description, duration_years, req.params.id]
    );
    
    res.json({ message: 'Trade updated successfully' });
  } catch (error) {
    console.error('Error updating trade:', error);
    res.status(500).json({ message: 'Error updating trade' });
  }
});

// Delete trade
router.delete('/trades/:id', async (req, res) => {
  try {
    await pool.query('UPDATE dos_trades SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Error deleting trade:', error);
    res.status(500).json({ message: 'Error deleting trade' });
  }
});

// ============ COURSES MANAGEMENT ============

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT c.*, t.name as trade_name, t.code as trade_code
      FROM dos_courses c
      LEFT JOIN dos_trades t ON c.trade_id = t.id
      WHERE c.is_active = true
      ORDER BY t.name, c.level, c.name
    `);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Create course
router.post('/courses', async (req, res) => {
  try {
    const { name, code, trade_id, level, credits, hours_per_week, description } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO dos_courses (name, code, trade_id, level, credits, hours_per_week, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, code, trade_id, level, credits || 3, hours_per_week || 4, description]
    );
    
    res.status(201).json({ message: 'Course created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const { name, code, trade_id, level, credits, hours_per_week, description } = req.body;
    
    await pool.query(
      'UPDATE dos_courses SET name = ?, code = ?, trade_id = ?, level = ?, credits = ?, hours_per_week = ?, description = ? WHERE id = ?',
      [name, code, trade_id, level, credits, hours_per_week, description, req.params.id]
    );
    
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    await pool.query('UPDATE dos_courses SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

// ============ CLASSES MANAGEMENT ============

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.*, t.name as trade_name, t.code as trade_code,
        (SELECT COUNT(*) FROM teacher_assignments WHERE class_id = c.id AND is_active = true) as assignment_count
      FROM dos_classes c
      LEFT JOIN dos_trades t ON c.trade_id = t.id
      WHERE c.is_active = true
      ORDER BY t.name, c.level, c.name
    `);
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Error fetching classes' });
  }
});

// Create class
router.post('/classes', async (req, res) => {
  try {
    const { name, code, trade_id, level, capacity, academic_year } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO dos_classes (name, code, trade_id, level, capacity, academic_year) VALUES (?, ?, ?, ?, ?, ?)',
      [name, code, trade_id, level, capacity || 30, academic_year]
    );
    
    res.status(201).json({ message: 'Class created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Error creating class' });
  }
});

// Update class
router.put('/classes/:id', async (req, res) => {
  try {
    const { name, code, trade_id, level, capacity, academic_year } = req.body;
    
    await pool.query(
      'UPDATE dos_classes SET name = ?, code = ?, trade_id = ?, level = ?, capacity = ?, academic_year = ? WHERE id = ?',
      [name, code, trade_id, level, capacity, academic_year, req.params.id]
    );
    
    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Error updating class' });
  }
});

// Delete class
router.delete('/classes/:id', async (req, res) => {
  try {
    await pool.query('UPDATE dos_classes SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Error deleting class' });
  }
});

// ============ TEACHER ASSIGNMENTS ============

// Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const [assignments] = await pool.query(`
      SELECT ta.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        c.name as class_name, c.code as class_code,
        co.name as course_name, co.code as course_code, co.hours_per_week
      FROM teacher_assignments ta
      JOIN dos_teachers t ON ta.teacher_id = t.id
      JOIN dos_classes c ON ta.class_id = c.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.is_active = true
      ORDER BY t.last_name, c.name, co.name
    `);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// Check for conflicts before creating assignment
router.post('/assignments/check-conflicts', async (req, res) => {
  try {
    const { teacher_id, class_id, course_id, day_of_week, start_time, end_time } = req.body;
    
    // Check teacher conflicts
    const [teacherConflicts] = await pool.query(`
      SELECT ta.id, c.name as class_name, co.name as course_name, ts.day_of_week, ts.start_time, ts.end_time
      FROM teacher_assignments ta
      JOIN timetable_slots ts ON ta.id = ts.assignment_id
      JOIN dos_classes c ON ta.class_id = c.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.teacher_id = ? 
        AND ts.day_of_week = ?
        AND ta.is_active = true
        AND (
          (ts.start_time <= ? AND ts.end_time > ?) OR
          (ts.start_time < ? AND ts.end_time >= ?) OR
          (ts.start_time >= ? AND ts.end_time <= ?)
        )
    `, [teacher_id, day_of_week, start_time, start_time, end_time, end_time, start_time, end_time]);
    
    // Check class conflicts
    const [classConflicts] = await pool.query(`
      SELECT ta.id, CONCAT(t.first_name, ' ', t.last_name) as teacher_name, co.name as course_name, ts.day_of_week, ts.start_time, ts.end_time
      FROM teacher_assignments ta
      JOIN timetable_slots ts ON ta.id = ts.assignment_id
      JOIN dos_teachers t ON ta.teacher_id = t.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.class_id = ? 
        AND ts.day_of_week = ?
        AND ta.is_active = true
        AND (
          (ts.start_time <= ? AND ts.end_time > ?) OR
          (ts.start_time < ? AND ts.end_time >= ?) OR
          (ts.start_time >= ? AND ts.end_time <= ?)
        )
    `, [class_id, day_of_week, start_time, start_time, end_time, end_time, start_time, end_time]);
    
    res.json({
      hasConflicts: teacherConflicts.length > 0 || classConflicts.length > 0,
      teacherConflicts,
      classConflicts
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ message: 'Error checking conflicts' });
  }
});

// Create assignment
router.post('/assignments', async (req, res) => {
  try {
    const { teacher_id, class_id, course_id, academic_year, semester } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO teacher_assignments (teacher_id, class_id, course_id, academic_year, semester) VALUES (?, ?, ?, ?, ?)',
      [teacher_id, class_id, course_id, academic_year, semester || 1]
    );
    
    res.status(201).json({ message: 'Assignment created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  }
});

// Delete assignment
router.delete('/assignments/:id', async (req, res) => {
  try {
    await pool.query('UPDATE teacher_assignments SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
});

// ============ TIMETABLE SLOTS ============

// Create timetable slot
router.post('/timetable-slots', async (req, res) => {
  try {
    const { assignment_id, day_of_week, start_time, end_time, room } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO timetable_slots (assignment_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)',
      [assignment_id, day_of_week, start_time, end_time, room]
    );
    
    res.status(201).json({ message: 'Timetable slot created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating timetable slot:', error);
    res.status(500).json({ message: 'Error creating timetable slot' });
  }
});

// Get timetable for class
router.get('/timetable/class/:classId', async (req, res) => {
  try {
    const [slots] = await pool.query(`
      SELECT ts.*, 
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        co.name as course_name, co.code as course_code
      FROM timetable_slots ts
      JOIN teacher_assignments ta ON ts.assignment_id = ta.id
      JOIN dos_teachers t ON ta.teacher_id = t.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.class_id = ? AND ta.is_active = true
      ORDER BY 
        FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        ts.start_time
    `, [req.params.classId]);
    
    res.json(slots);
  } catch (error) {
    console.error('Error fetching class timetable:', error);
    res.status(500).json({ message: 'Error fetching class timetable' });
  }
});

// Get timetable for teacher
router.get('/timetable/teacher/:teacherId', async (req, res) => {
  try {
    const [slots] = await pool.query(`
      SELECT ts.*, 
        c.name as class_name, c.code as class_code,
        co.name as course_name, co.code as course_code
      FROM timetable_slots ts
      JOIN teacher_assignments ta ON ts.assignment_id = ta.id
      JOIN dos_classes c ON ta.class_id = c.id
      JOIN dos_courses co ON ta.course_id = co.id
      WHERE ta.teacher_id = ? AND ta.is_active = true
      ORDER BY 
        FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        ts.start_time
    `, [req.params.teacherId]);
    
    res.json(slots);
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ message: 'Error fetching teacher timetable' });
  }
});

// ============ STUDENTS MANAGEMENT (Using existing students table) ============

// Get all students
router.get('/students', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT * FROM students 
      WHERE is_active = true 
      ORDER BY last_name, first_name
    `);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Get single student
router.get('/students/:id', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

// Create student
router.post('/students', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, class_id, enrollment_date } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO students (first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, class_id, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, class_id, enrollment_date]
    );
    
    res.status(201).json({ message: 'Student created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student' });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, class_id } = req.body;
    
    await pool.query(
      'UPDATE students SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, guardian_name = ?, guardian_phone = ?, class_id = ? WHERE id = ?',
      [first_name, last_name, email, phone, date_of_birth, gender, address, guardian_name, guardian_phone, class_id, req.params.id]
    );
    
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    await pool.query('UPDATE students SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

// ============ DASHBOARD STATS ============

router.get('/dashboard/stats', async (req, res) => {
  try {
    const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM dos_teachers WHERE is_active = true');
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students WHERE is_active = true');
    const [classCount] = await pool.query('SELECT COUNT(*) as count FROM dos_classes WHERE is_active = true');
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM dos_courses WHERE is_active = true');
    const [tradeCount] = await pool.query('SELECT COUNT(*) as count FROM dos_trades WHERE is_active = true');
    const [assignmentCount] = await pool.query('SELECT COUNT(*) as count FROM teacher_assignments WHERE is_active = true');
    
    res.json({
      teachers: teacherCount[0].count,
      students: studentCount[0].count,
      classes: classCount[0].count,
      courses: courseCount[0].count,
      trades: tradeCount[0].count,
      assignments: assignmentCount[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
