const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper: Constraint Solver for Timetable Generation
class TimetableConstraintSolver {
    constructor(config) {
        this.trades = config.trades; // ['BDC', 'SOD', 'AUT']
        this.levels = config.levels; // [1, 2, 3, 4]
        this.daysPerWeek = 5; // Monday-Friday
        this.periodsPerDay = 12;
        this.academicYear = config.academic_year;
        this.term = config.term;
    }

    async getCourseAssignments(connection) {
        const [assignments] = await connection.execute(`
      SELECT 
        ca.*,
        c.course_name,
        c.course_code,
        c.course_type,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM course_assignments ca
      JOIN courses c ON ca.course_id = c.id
      JOIN users u ON ca.teacher_id = u.id
      WHERE ca.trade_code IN (?)
        AND ca.level_number IN (?)
        AND ca.academic_year = ?
        AND ca.term = ?
    `, [this.trades, this.levels, this.academicYear, this.term]);

        return assignments;
    }

    async getAvailableRooms(connection) {
        const [rooms] = await connection.execute(
            'SELECT * FROM rooms WHERE is_active = TRUE AND available_for_timetable = TRUE'
        );
        return rooms;
    }

    async getTeacherAvailability(connection) {
        const [availability] = await connection.execute(`
      SELECT * FROM teacher_availability
      WHERE academic_year = ? AND term = ?
    `, [this.academicYear, this.term]);

        // Convert to map: teacher_id -> {day_period -> is_available}
        const availabilityMap = {};
        availability.forEach(item => {
            if (!availabilityMap[item.teacher_id]) {
                availabilityMap[item.teacher_id] = {};
            }
            const key = `${item.day_of_week}_${item.period_number}`;
            availabilityMap[item.teacher_id][key] = item.is_available;
        });

        return availabilityMap;
    }

    // Main algorithm: Greedy constraint satisfaction
    async generateTimetable(connection) {
        const startTime = Date.now();
        const assignments = await this.getCourseAssignments(connection);
        const rooms = await this.getAvailableRooms(connection);
        const teacherAvailability = await this.getTeacherAvailability(connection);

        // Initialize timetable grid
        const timetable = [];
        const teacherBusy = {}; // teacher_id -> day_period -> boolean
        const roomBusy = {}; // room_id -> day_period -> boolean
        const classBusy = {}; // trade_level -> day_period -> boolean

        // Group assignments by class (trade + level)
        const classCourses = {};
        assignments.forEach(assignment => {
            const classKey = `${assignment.code}_${assignment.level_number}`;
            if (!classCourses[classKey]) {
                classCourses[classKey] = [];
            }
            classCourses[classKey].push(assignment);
        });

        let conflictCount = 0;

        // For each class, schedule their courses
        for (const [classKey, courses] of Object.entries(classCourses)) {
            const [trade, level] = classKey.split('_');

            // For each course in the class
            for (const course of courses) {
                const periodsNeeded = course.periods_per_week || 5;
                let assignedPeriods = 0;

                // Try to assign this course to available slots
                for (let day = 1; day <= this.daysPerWeek && assignedPeriods < periodsNeeded; day++) {
                    for (let period = 1; period <= this.periodsPerDay && assignedPeriods < periodsNeeded; period++) {
                        const slotKey = `${day}_${period}`;

                        // Check constraints
                        const teacherKey = `${course.teacher_id}_${slotKey}`;
                        const classSlotKey = `${classKey}_${slotKey}`;

                        // Is teacher available?
                        const teacherAvail = teacherAvailability[course.teacher_id];
                        if (teacherAvail && teacherAvail[slotKey] === false) {
                            continue; // Teacher not available
                        }

                        // Is teacher already busy?
                        if (teacherBusy[teacherKey]) {
                            continue;
                        }

                        // Is class already busy?
                        if (classBusy[classSlotKey]) {
                            continue;
                        }

                        // Find available room
                        let selectedRoom = null;
                        for (const room of rooms) {
                            const roomSlotKey = `${room.id}_${slotKey}`;
                            if (!roomBusy[roomSlotKey]) {
                                // Check room type suitability
                                if (course.course_type === 'practical' && room.room_type === 'classroom') {
                                    continue; // Practical needs lab/workshop
                                }
                                selectedRoom = room;
                                break;
                            }
                        }

                        if (!selectedRoom) {
                            conflictCount++;
                            continue; // No room available, skip this slot
                        }

                        // Assign this slot
                        timetable.push({
                            trade_code: trade,
                            level_number: parseInt(level),
                            day_of_week: day,
                            period_number: period,
                            course_id: course.course_id,
                            teacher_id: course.teacher_id,
                            room_id: selectedRoom.id,
                            is_practical: course.course_type === 'practical',
                            duration_minutes: 60
                        });

                        // Mark as busy
                        teacherBusy[teacherKey] = true;
                        roomBusy[`${selectedRoom.id}_${slotKey}`] = true;
                        classBusy[classSlotKey] = true;

                        assignedPeriods++;
                    }
                }

                if (assignedPeriods < periodsNeeded) {
                    conflictCount++;
                }
            }
        }

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        return {
            assignments: timetable,
            conflictCount,
            duration
        };
    }
}

// POST /api/dos-timetable/generate - Generate timetable
router.post('/generate', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            name,
            academic_year,
            term,
            trades,
            levels,
            user_id
        } = req.body;

        // Validation
        if (!academic_year || !term || !trades || !levels || !user_id) {
            throw new Error('Missing required fields');
        }

        if (!Array.isArray(trades) || !Array.isArray(levels)) {
            throw new Error('Trades and levels must be arrays');
        }

        // Create timetable record
        const [timetableResult] = await connection.execute(`
      INSERT INTO timetables (
        name, academic_year, term, trades, levels, status, created_by
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `, [
            name || `Timetable ${academic_year} Term ${term}`,
            academic_year,
            term,
            JSON.stringify(trades),
            JSON.stringify(levels),
            user_id
        ]);

        const timetableId = timetableResult.insertId;

        // Run constraint solver
        const solver = new TimetableConstraintSolver({
            trades,
            levels,
            academic_year,
            term
        });

        const result = await solver.generateTimetable(connection);

        // Insert all assignments
        if (result.assignments.length > 0) {
            const values = result.assignments.map(a => [
                timetableId,
                a.trade_code,
                a.level_number,
                a.day_of_week,
                a.period_number,
                a.course_id,
                a.teacher_id,
                a.room_id,
                a.is_practical,
                a.duration_minutes
            ]);

            await connection.query(`
        INSERT INTO timetable_assignments (
          timetable_id, trade_code, level_number, day_of_week, period_number,
          course_id, teacher_id, room_id, is_practical, duration_minutes
        ) VALUES ?
      `, [values]);
        }

        // Update timetable with generation stats
        await connection.execute(`
      UPDATE timetables
      SET generated_at = NOW(),
          generation_duration_seconds = ?,
          conflict_count = ?
      WHERE id = ?
    `, [result.duration, result.conflictCount, timetableId]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Timetable generated successfully',
            timetable: {
                id: timetableId,
                academic_year,
                term,
                assigned_periods: result.assignments.length,
                conflict_count: result.conflictCount,
                generation_time_seconds: result.duration
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Timetable generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate timetable'
        });
    } finally {
        connection.release();
    }
});

// GET /api/dos-timetable/:id - Get timetable details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get timetable metadata
        const [timetable] = await pool.execute(
            'SELECT * FROM timetables WHERE id = ?',
            [id]
        );

        if (timetable.length === 0) {
            return res.status(404).json({ success: false, message: 'Timetable not found' });
        }

        // Get all assignments using the view
        const [assignments] = await pool.execute(
            'SELECT * FROM timetable_grid_view WHERE timetable_id = ? ORDER BY day_of_week, period_number',
            [id]
        );

        res.json({
            success: true,
            timetable: timetable[0],
            assignments
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/dos-timetable/:id/adjust - Manual adjustment
router.put('/:id/adjust', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { assignment_id, new_day, new_period, new_teacher_id, new_room_id } = req.body;

        // Get current assignment
        const [current] = await connection.execute(
            'SELECT * FROM timetable_assignments WHERE id = ? AND timetable_id = ?',
            [assignment_id, id]
        );

        if (current.length === 0) {
            throw new Error('Assignment not found');
        }

        const assignment = current[0];

        // Build update query
        const updates = [];
        const values = [];

        if (new_day) {
            updates.push('day_of_week = ?');
            values.push(new_day);
        }
        if (new_period) {
            updates.push('period_number = ?');
            values.push(new_period);
        }
        if (new_teacher_id) {
            updates.push('teacher_id = ?');
            values.push(new_teacher_id);
        }
        if (new_room_id) {
            updates.push('room_id = ?');
            values.push(new_room_id);
        }

        if (updates.length > 0) {
            values.push(assignment_id);
            await connection.execute(
                `UPDATE timetable_assignments SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Timetable adjusted successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Timetable adjustment error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// POST /api/dos-timetable/:id/publish - Publish timetable
router.post('/:id/publish', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        await pool.execute(`
      UPDATE timetables
      SET status = 'published',
          published_by = ?,
          published_at = NOW()
      WHERE id = ?
    `, [user_id, id]);

        res.json({
            success: true,
            message: 'Timetable published successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/dos-timetable/list - List all timetables
router.get('/list/all', async (req, res) => {
    try {
        const [timetables] = await pool.execute(`
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        (SELECT COUNT(*) FROM timetable_assignments WHERE timetable_id = t.id) as total_assignments
      FROM timetables t
      JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);

        res.json({
            success: true,
            timetables
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
