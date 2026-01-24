const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/academic-years', async (req, res) => {
  try {
    const { isActive, sortBy = 'start_date', sortOrder = 'DESC' } = req.query;
    
    let query = 'SELECT * FROM academic_years WHERE 1=1';
    const params = [];

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const validSortFields = ['id', 'name', 'start_date', 'end_date', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'start_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${order}`;

    const [years] = await pool.query(query, params);

    res.json({ success: true, data: years });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic years', error: error.message });
  }
});

router.post('/academic-years', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, startDate, endDate, isActive } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, start date, and end date are required' 
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date must be before end date' 
      });
    }

    if (isActive) {
      await connection.query('UPDATE academic_years SET is_active = 0');
    }

    const [result] = await connection.query(`
      INSERT INTO academic_years (name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?)
    `, [name, startDate, endDate, isActive ? 1 : 0]);

    await connection.commit();

    const [newYear] = await connection.query('SELECT * FROM academic_years WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      data: newYear[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating academic year:', error);
    res.status(500).json({ success: false, message: 'Failed to create academic year', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/academic-years/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;

    const [existing] = await connection.query('SELECT * FROM academic_years WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Academic year not found' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (startDate) { updates.push('start_date = ?'); params.push(startDate); }
    if (endDate) { updates.push('end_date = ?'); params.push(endDate); }
    
    if (isActive !== undefined) {
      if (isActive) {
        await connection.query('UPDATE academic_years SET is_active = 0 WHERE id != ?', [id]);
      }
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE academic_years SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await connection.commit();

    const [updated] = await connection.query('SELECT * FROM academic_years WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Academic year updated successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating academic year:', error);
    res.status(500).json({ success: false, message: 'Failed to update academic year', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/academic-years/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM academic_years WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Academic year not found' });
    }

    const [classCheck] = await connection.query('SELECT COUNT(*) as count FROM classes WHERE academic_year_id = ?', [id]);
    if (classCheck[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete academic year with associated classes' 
      });
    }

    await connection.query('DELETE FROM academic_years WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Academic year deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting academic year:', error);
    res.status(500).json({ success: false, message: 'Failed to delete academic year', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/courses', async (req, res) => {
  try {
    const { search = '', isActive, page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const validSortFields = ['id', 'name', 'code', 'duration_months', 'fee_amount', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [courses] = await pool.query(query, params);

    for (let course of courses) {
      const [subjectCount] = await pool.query('SELECT COUNT(*) as count FROM subjects WHERE course_id = ?', [course.id]);
      const [classCount] = await pool.query('SELECT COUNT(*) as count FROM classes WHERE course_id = ?', [course.id]);
      course.subject_count = subjectCount[0].count;
      course.class_count = classCount[0].count;
    }

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [subjects] = await pool.query('SELECT * FROM subjects WHERE course_id = ? AND is_active = 1', [id]);
    const [classes] = await pool.query(`
      SELECT c.*, ay.name as academic_year_name, 
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM classes c
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.course_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...courses[0],
        subjects,
        classes
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { name, description, code, durationMonths, feeAmount, isActive } = req.body;

    if (!name || !code || !durationMonths) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, code, and duration are required' 
      });
    }

    const [existing] = await pool.query('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const [result] = await pool.query(`
      INSERT INTO courses (name, description, code, duration_months, fee_amount, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, code, durationMonths, feeAmount || 0, isActive !== undefined ? isActive : true]);

    const [newCourse] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse[0]
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, code, durationMonths, feeAmount, isActive } = req.body;

    const [existing] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (code && code !== existing[0].code) {
      const [duplicate] = await pool.query('SELECT id FROM courses WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ success: false, message: 'Course code already exists' });
      }
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (code) { updates.push('code = ?'); params.push(code); }
    if (durationMonths) { updates.push('duration_months = ?'); params.push(durationMonths); }
    if (feeAmount !== undefined) { updates.push('fee_amount = ?'); params.push(feeAmount); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [classCheck] = await connection.query('SELECT COUNT(*) as count FROM classes WHERE course_id = ?', [id]);
    if (classCheck[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete course with associated classes' 
      });
    }

    await connection.query('DELETE FROM courses WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const { courseId, search = '', isActive, isPractical, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, c.name as course_name, c.code as course_code
      FROM subjects s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ' AND s.course_id = ?';
      params.push(courseId);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (isActive !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    if (isPractical !== undefined) {
      query += ' AND s.is_practical = ?';
      params.push(isPractical === 'true' ? 1 : 0);
    }

    const countQuery = query.replace(/SELECT s\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY s.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [subjects] = await pool.query(query, params);

    res.json({
      success: true,
      data: subjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { name, code, description, courseId, credits, isPractical, isActive } = req.body;

    if (!name || !code || !courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, code, and course ID are required' 
      });
    }

    const [courseCheck] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courseCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [existing] = await pool.query('SELECT id FROM subjects WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Subject code already exists' });
    }

    const [result] = await pool.query(`
      INSERT INTO subjects (name, code, description, course_id, credits, is_practical, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, code, description, courseId, credits || 1, isPractical ? 1 : 0, isActive !== undefined ? isActive : true]);

    const [newSubject] = await pool.query(`
      SELECT s.*, c.name as course_name
      FROM subjects s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: newSubject[0]
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to create subject', error: error.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, courseId, credits, isPractical, isActive } = req.body;

    const [existing] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (code && code !== existing[0].code) {
      const [duplicate] = await pool.query('SELECT id FROM subjects WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ success: false, message: 'Subject code already exists' });
      }
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (code) { updates.push('code = ?'); params.push(code); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (courseId) { updates.push('course_id = ?'); params.push(courseId); }
    if (credits) { updates.push('credits = ?'); params.push(credits); }
    if (isPractical !== undefined) { updates.push('is_practical = ?'); params.push(isPractical); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE subjects SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT s.*, c.name as course_name
      FROM subjects s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to update subject', error: error.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await pool.query('DELETE FROM subjects WHERE id = ?', [id]);

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject', error: error.message });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const { 
      courseId, academicYearId, teacherId, isActive,
      page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC'
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
             co.name as course_name, co.code as course_code,
             ay.name as academic_year_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             u.email as teacher_email
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ' AND c.course_id = ?';
      params.push(courseId);
    }

    if (academicYearId) {
      query += ' AND c.academic_year_id = ?';
      params.push(academicYearId);
    }

    if (teacherId) {
      query += ' AND c.teacher_id = ?';
      params.push(teacherId);
    }

    if (isActive !== undefined) {
      query += ' AND c.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const countQuery = query.replace(/SELECT c\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    const validSortFields = ['name', 'capacity', 'current_enrollment', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY c.${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [classes] = await pool.query(query, params);

    res.json({
      success: true,
      data: classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classes', error: error.message });
  }
});

router.get('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.query(`
      SELECT c.*, 
             co.name as course_name, co.code as course_code,
             ay.name as academic_year_name, ay.start_date, ay.end_date,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             u.email as teacher_email, u.phone as teacher_phone
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const [schedules] = await pool.query(`
      SELECT cs.*, s.name as subject_name, s.code as subject_code,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM class_schedules cs
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.teacher_id = u.id
      WHERE cs.class_id = ? AND cs.is_active = 1
      ORDER BY 
        FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        cs.start_time
    `, [id]);

    const [students] = await pool.query(`
      SELECT e.*, u.username, u.email, u.first_name, u.last_name, u.student_id
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY u.last_name, u.first_name
    `, [id]);

    res.json({
      success: true,
      data: {
        ...classes[0],
        schedules,
        students
      }
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch class', error: error.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const { name, courseId, academicYearId, teacherId, capacity, isActive } = req.body;

    if (!name || !courseId || !academicYearId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, course ID, and academic year ID are required' 
      });
    }

    const [courseCheck] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courseCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [yearCheck] = await pool.query('SELECT id FROM academic_years WHERE id = ?', [academicYearId]);
    if (yearCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Academic year not found' });
    }

    if (teacherId) {
      const [teacherCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [teacherId]);
      if (teacherCheck.length === 0) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }
    }

    const [result] = await pool.query(`
      INSERT INTO classes (name, course_id, academic_year_id, teacher_id, capacity, current_enrollment, is_active)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `, [name, courseId, academicYearId, teacherId, capacity || 30, isActive !== undefined ? isActive : true]);

    const [newClass] = await pool.query(`
      SELECT c.*, 
             co.name as course_name,
             ay.name as academic_year_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass[0]
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ success: false, message: 'Failed to create class', error: error.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, courseId, academicYearId, teacherId, capacity, isActive } = req.body;

    const [existing] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (courseId) { updates.push('course_id = ?'); params.push(courseId); }
    if (academicYearId) { updates.push('academic_year_id = ?'); params.push(academicYearId); }
    if (teacherId !== undefined) { updates.push('teacher_id = ?'); params.push(teacherId); }
    if (capacity) { updates.push('capacity = ?'); params.push(capacity); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE classes SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT c.*, 
             co.name as course_name,
             ay.name as academic_year_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM classes c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ success: false, message: 'Failed to update class', error: error.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [existing] = await connection.query('SELECT * FROM classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const [enrollmentCheck] = await connection.query('SELECT COUNT(*) as count FROM enrollments WHERE class_id = ?', [id]);
    if (enrollmentCheck[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete class with enrolled students' 
      });
    }

    await connection.query('DELETE FROM class_schedules WHERE class_id = ?', [id]);
    await connection.query('DELETE FROM classes WHERE id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, message: 'Failed to delete class', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/schedules', async (req, res) => {
  try {
    const { classId, teacherId, dayOfWeek, subjectId } = req.query;

    let query = `
      SELECT cs.*, 
             c.name as class_name,
             s.name as subject_name, s.code as subject_code,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM class_schedules cs
      LEFT JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.teacher_id = u.id
      WHERE cs.is_active = 1
    `;
    const params = [];

    if (classId) {
      query += ' AND cs.class_id = ?';
      params.push(classId);
    }

    if (teacherId) {
      query += ' AND cs.teacher_id = ?';
      params.push(teacherId);
    }

    if (dayOfWeek) {
      query += ' AND cs.day_of_week = ?';
      params.push(dayOfWeek);
    }

    if (subjectId) {
      query += ' AND cs.subject_id = ?';
      params.push(subjectId);
    }

    query += ` ORDER BY 
      FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      cs.start_time
    `;

    const [schedules] = await pool.query(query, params);

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules', error: error.message });
  }
});

router.post('/schedules', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, isActive } = req.body;

    if (!classId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID, subject ID, teacher ID, day of week, start time, and end time are required' 
      });
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(dayOfWeek)) {
      return res.status(400).json({ success: false, message: 'Invalid day of week' });
    }

    const [conflict] = await connection.query(`
      SELECT id FROM class_schedules
      WHERE teacher_id = ? AND day_of_week = ? AND is_active = 1
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [teacherId, dayOfWeek, startTime, startTime, endTime, endTime, startTime, endTime]);

    if (conflict.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher has a schedule conflict at this time' 
      });
    }

    const [result] = await connection.query(`
      INSERT INTO class_schedules (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, isActive !== undefined ? isActive : true]);

    await connection.commit();

    const [newSchedule] = await connection.query(`
      SELECT cs.*, 
             c.name as class_name,
             s.name as subject_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM class_schedules cs
      LEFT JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.teacher_id = u.id
      WHERE cs.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newSchedule[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/schedules/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, isActive } = req.body;

    const [existing] = await connection.query('SELECT * FROM class_schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    if (teacherId && dayOfWeek && startTime && endTime) {
      const [conflict] = await connection.query(`
        SELECT id FROM class_schedules
        WHERE teacher_id = ? AND day_of_week = ? AND is_active = 1 AND id != ?
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `, [teacherId, dayOfWeek, id, startTime, startTime, endTime, endTime, startTime, endTime]);

      if (conflict.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Teacher has a schedule conflict at this time' 
        });
      }
    }

    const updates = [];
    const params = [];

    if (classId) { updates.push('class_id = ?'); params.push(classId); }
    if (subjectId) { updates.push('subject_id = ?'); params.push(subjectId); }
    if (teacherId) { updates.push('teacher_id = ?'); params.push(teacherId); }
    if (dayOfWeek) { updates.push('day_of_week = ?'); params.push(dayOfWeek); }
    if (startTime) { updates.push('start_time = ?'); params.push(startTime); }
    if (endTime) { updates.push('end_time = ?'); params.push(endTime); }
    if (room !== undefined) { updates.push('room = ?'); params.push(room); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE class_schedules SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await connection.commit();

    const [updated] = await connection.query(`
      SELECT cs.*, 
             c.name as class_name,
             s.name as subject_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM class_schedules cs
      LEFT JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.teacher_id = u.id
      WHERE cs.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM class_schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await pool.query('DELETE FROM class_schedules WHERE id = ?', [id]);

    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule', error: error.message });
  }
});

router.post('/enrollments', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { studentId, classId, enrollmentDate, status } = req.body;

    if (!studentId || !classId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID and class ID are required' 
      });
    }

    const [studentCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [studentId]);
    if (studentCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [classCheck] = await connection.query('SELECT * FROM classes WHERE id = ?', [classId]);
    if (classCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classCheck[0].current_enrollment >= classCheck[0].capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class is at full capacity' 
      });
    }

    const [existing] = await connection.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?',
      [studentId, classId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student is already enrolled in this class' 
      });
    }

    const [result] = await connection.query(`
      INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
      VALUES (?, ?, ?, ?)
    `, [studentId, classId, enrollmentDate || new Date(), status || 'active']);

    await connection.query(
      'UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = ?',
      [classId]
    );

    await connection.commit();

    const [newEnrollment] = await connection.query(`
      SELECT e.*, 
             u.username, u.first_name, u.last_name, u.email,
             c.name as class_name
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      INNER JOIN classes c ON e.class_id = c.id
      WHERE e.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: newEnrollment[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating enrollment:', error);
    res.status(500).json({ success: false, message: 'Failed to create enrollment', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/enrollments/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [enrollment] = await connection.query('SELECT * FROM enrollments WHERE id = ?', [id]);
    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    await connection.query('DELETE FROM enrollments WHERE id = ?', [id]);
    await connection.query(
      'UPDATE classes SET current_enrollment = current_enrollment - 1 WHERE id = ?',
      [enrollment[0].class_id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete enrollment', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
