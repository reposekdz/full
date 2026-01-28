const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.post('/generate', async (req, res) => {
  try {
    const { class_ids, start_date, end_date, days_per_week, periods_per_day } = req.body;
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const selectedDays = daysOfWeek.slice(0, days_per_week || 5);
    
    const [subjects] = await pool.execute(`
      SELECT DISTINCT s.*, tc.id as class_id
      FROM subjects s
      CROSS JOIN trade_classes tc
      WHERE tc.id IN (${class_ids.map(() => '?').join(',')}) AND s.is_active = true
    `, class_ids);
    
    const [teachers] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'teacher' AND u.is_active = true
    `);
    
    const teacherSubjects = {};
    for (const teacher of teachers) {
      const [assigned] = await pool.execute(`
        SELECT DISTINCT subject_id
        FROM grades
        WHERE teacher_id = ?
      `, [teacher.id]);
      teacherSubjects[teacher.id] = assigned.map(a => a.subject_id);
    }
    
    const timetable = {};
    const teacherSchedule = {};
    const classSchedule = {};
    
    const conflicts = [];
    
    for (const classId of class_ids) {
      timetable[classId] = {};
      classSchedule[classId] = {};
      
      for (const day of selectedDays) {
        timetable[classId][day] = [];
        classSchedule[classId][day] = new Set();
        
        const classSubjects = subjects.filter(s => s.class_id === classId);
        
        for (let period = 1; period <= (periods_per_day || 8); period++) {
          let assigned = false;
          let attempts = 0;
          const maxAttempts = classSubjects.length * 2;
          
          while (!assigned && attempts < maxAttempts) {
            const randomSubject = classSubjects[Math.floor(Math.random() * classSubjects.length)];
            
            const availableTeachers = teachers.filter(t => 
              teacherSubjects[t.id]?.includes(randomSubject.id)
            );
            
            if (availableTeachers.length === 0) {
              availableTeachers.push(...teachers.slice(0, 1));
            }
            
            const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
            
            const teacherKey = `${teacher.id}_${day}_${period}`;
            const classKey = `${classId}_${day}_${period}`;
            
            const hasTeacherConflict = teacherSchedule[teacherKey];
            const hasClassConflict = classSchedule[classId][day].has(period);
            
            if (!hasTeacherConflict && !hasClassConflict) {
              timetable[classId][day].push({
                period: period,
                subject_id: randomSubject.id,
                subject_name: randomSubject.subject_name,
                subject_code: randomSubject.subject_code,
                teacher_id: teacher.id,
                teacher_name: `${teacher.first_name} ${teacher.last_name}`,
                start_time: getPeriodTime(period, 'start'),
                end_time: getPeriodTime(period, 'end'),
                venue: `Room ${Math.floor(Math.random() * 20) + 1}`
              });
              
              teacherSchedule[teacherKey] = {
                class_id: classId,
                subject: randomSubject.subject_name
              };
              
              classSchedule[classId][day].add(period);
              assigned = true;
            } else {
              if (hasTeacherConflict) {
                conflicts.push({
                  type: 'teacher',
                  teacher_id: teacher.id,
                  teacher_name: `${teacher.first_name} ${teacher.last_name}`,
                  day: day,
                  period: period,
                  reason: 'Teacher already scheduled'
                });
              }
            }
            
            attempts++;
          }
          
          if (!assigned) {
            timetable[classId][day].push({
              period: period,
              subject_name: 'Free Period',
              start_time: getPeriodTime(period, 'start'),
              end_time: getPeriodTime(period, 'end'),
              is_free: true
            });
          }
        }
      }
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const classId of class_ids) {
        await connection.execute(
          `DELETE FROM timetable_entries 
           WHERE class_id = ? AND week_start_date = ?`,
          [classId, start_date]
        );
        
        for (const [day, periods] of Object.entries(timetable[classId])) {
          for (const entry of periods) {
            if (!entry.is_free) {
              await connection.execute(
                `INSERT INTO timetable_entries 
                 (class_id, day_of_week, period_number, subject_id, teacher_id, 
                  start_time, end_time, venue, week_start_date, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                  classId,
                  day,
                  entry.period,
                  entry.subject_id,
                  entry.teacher_id,
                  entry.start_time,
                  entry.end_time,
                  entry.venue,
                  start_date
                ]
              );
            }
          }
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Timetable generated successfully',
        timetable: timetable,
        statistics: {
          total_classes: class_ids.length,
          total_periods: periods_per_day * selectedDays.length,
          conflicts_detected: conflicts.length,
          conflicts: conflicts
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/view/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { week_start_date } = req.query;
    
    let query = `
      SELECT te.*, s.subject_name, s.subject_code,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM timetable_entries te
      JOIN subjects s ON te.subject_id = s.id
      LEFT JOIN users u ON te.teacher_id = u.id
      WHERE te.class_id = ?
    `;
    
    const params = [classId];
    
    if (week_start_date) {
      query += ' AND te.week_start_date = ?';
      params.push(week_start_date);
    }
    
    query += ' ORDER BY FIELD(te.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"), te.period_number';
    
    const [entries] = await pool.execute(query, params);
    
    const timetable = {};
    entries.forEach(entry => {
      if (!timetable[entry.day_of_week]) {
        timetable[entry.day_of_week] = [];
      }
      timetable[entry.day_of_week].push(entry);
    });
    
    res.json({ success: true, timetable, total_entries: entries.length });
    
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teacher-schedule/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const [entries] = await pool.execute(`
      SELECT te.*, s.subject_name, tc.class_name, tl.trade_name
      FROM timetable_entries te
      JOIN subjects s ON te.subject_id = s.id
      JOIN trade_classes tc ON te.class_id = tc.id
      JOIN trade_levels tl ON tc.trade_level_id = tl.id
      WHERE te.teacher_id = ?
      ORDER BY FIELD(te.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"), 
               te.period_number
    `, [teacherId]);
    
    const schedule = {};
    entries.forEach(entry => {
      if (!schedule[entry.day_of_week]) {
        schedule[entry.day_of_week] = [];
      }
      schedule[entry.day_of_week].push(entry);
    });
    
    res.json({
      success: true,
      schedule: schedule,
      total_periods: entries.length,
      load_distribution: calculateLoadDistribution(schedule)
    });
    
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/check-conflicts', async (req, res) => {
  try {
    const { class_id, day_of_week, period_number, teacher_id } = req.body;
    
    const [teacherConflicts] = await pool.execute(`
      SELECT * FROM timetable_entries
      WHERE teacher_id = ? AND day_of_week = ? AND period_number = ? AND class_id != ?
    `, [teacher_id, day_of_week, period_number, class_id]);
    
    const [classConflicts] = await pool.execute(`
      SELECT * FROM timetable_entries
      WHERE class_id = ? AND day_of_week = ? AND period_number = ?
    `, [class_id, day_of_week, period_number]);
    
    res.json({
      success: true,
      has_conflict: teacherConflicts.length > 0 || classConflicts.length > 0,
      conflicts: {
        teacher: teacherConflicts,
        class: classConflicts
      }
    });
    
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

function getPeriodTime(period, type) {
  const startTimes = {
    1: '08:00', 2: '09:00', 3: '10:00', 4: '11:00',
    5: '13:00', 6: '14:00', 7: '15:00', 8: '16:00'
  };
  
  const endTimes = {
    1: '09:00', 2: '10:00', 3: '11:00', 4: '12:00',
    5: '14:00', 6: '15:00', 7: '16:00', 8: '17:00'
  };
  
  return type === 'start' ? startTimes[period] : endTimes[period];
}

function calculateLoadDistribution(schedule) {
  const distribution = {};
  for (const [day, periods] of Object.entries(schedule)) {
    distribution[day] = periods.length;
  }
  return distribution;
}

module.exports = router;
