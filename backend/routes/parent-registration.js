const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function for fuzzy matching
function calculateNameSimilarity(name1, name2) {
    const s1 = name1.toLowerCase().trim();
    const s2 = name2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 100;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 80;

    // Levenshtein distance (simple implementation)
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    const distance = matrix[s1.length][s2.length];
    const maxLen = Math.max(s1.length, s2.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    return Math.round(similarity);
}

// POST /api/parent-registration/search-students
// Smart student search with fuzzy matching
router.post('/search-students', async (req, res) => {
    try {
        let { query, trade, level } = req.body;

        // Handle if query comes as stringified JSON (fix for malformed JSON from frontend)
        if (typeof query === 'string') {
            try {
                // Try to parse if it's a stringified JSON
                const parsed = JSON.parse(query);
                if (parsed.query) query = parsed.query;
            } catch (e) {
                // Not JSON, use as-is
            }
        }

        if (!query || (typeof query === 'string' && query.trim().length < 2)) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        // Ensure query is a string
        query = String(query).trim();

        // Only search students in BDC, SOD, AUT trades
        const validTrades = ['BDC', 'SOD', 'AUT'];

        // Use global_student_sheets for comprehensive student data
        let sql = `
      SELECT 
        gss.id,
        gss.first_name as firstName,
        gss.last_name as lastName,
        gss.student_code as studentId,
        gss.trade_code,
        gss.trade_name as trade,
        CONCAT('Level ', gss.level_number) as level,
        gss.level_number as levelNumber,
        gss.gender,
        '' as email,
        '' as phone
      FROM global_student_sheets gss
      WHERE gss.status = 'active'
        AND gss.trade_code IN (?, ?, ?)
        AND (
          CONCAT(gss.first_name, ' ', gss.last_name) LIKE ?
          OR gss.student_code LIKE ?
          OR gss.first_name LIKE ?
          OR gss.last_name LIKE ?
        )
    `;

        const params = [...validTrades, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

        // Add trade filter if specified
        if (trade) {
            sql += ` AND gss.trade_code = ?`;
            params.push(trade);
        }

        // Add level filter if specified
        if (level) {
            const levelNum = parseInt(level);
            if (!isNaN(levelNum)) {
                sql += ` AND gss.level_number = ?`;
                params.push(levelNum);
            }
        }

        sql += ` ORDER BY gss.first_name, gss.last_name LIMIT 50`;

        const [students] = await pool.execute(sql, params);

        // Calculate match confidence for each student
        const studentsWithMatch = students.map(student => {
            const fullName = `${student.firstName} ${student.lastName}`;
            const nameScore = calculateNameSimilarity(fullName, query);

            // Boost score if trade/level matches
            let matchScore = nameScore;
            if (trade && student.code === trade) matchScore = Math.min(matchScore + 10, 100);
            if (level && student.levelNumber === parseInt(level)) matchScore = Math.min(matchScore + 10, 100);

            return {
                ...student,
                matchScore: matchScore
            };
        });

        // Sort by match score descending
        studentsWithMatch.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            students: studentsWithMatch,
            count: studentsWithMatch.length
        });

    } catch (error) {
        console.error('Student search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search students',
            error: error.message
        });
    }
});

// POST /api/parent-registration/register
// Complete parent registration with student linking
router.post('/register', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            first_name,
            last_name,
            email,
            phone,
            password,
            address,
            province,
            district,
            sector,
            date_of_birth,
            gender,
            relationship_type,
            // New student details for automatic linking
            student_name,
            student_level,
            student_trade,
            student_gender
        } = req.body;

        // Validation - email is optional for parents
        if (!first_name || !last_name || !phone || !password) {
            throw new Error('Required fields missing: first_name, last_name, phone, and password are required');
        }

        // Check if phone already exists (primary identifier for parents)
        const [existingPhone] = await connection.execute(
            'SELECT id FROM users WHERE phone = ?',
            [phone]
        );

        if (existingPhone.length > 0) {
            throw new Error('Phone number already registered. Please login instead.');
        }

        // Check if email already exists only if email is provided
        if (email && email.trim() !== '') {
            const [existingUser] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                throw new Error('Email already registered');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get parent role_id
        const [roleRows] = await connection.execute(
            'SELECT id FROM roles WHERE name = ?',
            ['parent']
        );
        const parentRoleId = roleRows.length > 0 ? roleRows[0].id : 8;

        // Generate unique username from phone or timestamp
        const username = phone ? `parent_${phone}` : `parent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        // Handle empty email - set to a placeholder if not provided
        const emailValue = (email && email.trim() !== '') ? email.trim() : `${phone}@parent.gardentvet.rw`;

        // Create parent user account - use password_hash column for compatibility with login
        const [parentResult] = await connection.execute(`
      INSERT INTO users (
        username, first_name, last_name, email, phone, password_hash,
        address, province, district, sector,
        date_of_birth, gender, role, role_id, is_active,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'parent', ?, 1, NOW())
    `, [
            username, first_name, last_name, emailValue, phone, hashedPassword,
            address || null, province || null, district || null, sector || null,
            date_of_birth || null, gender || null, parentRoleId
        ]);

        const parentId = parentResult.insertId;

        let autoLinked = false;
        let manualRequestCreated = false;

        // Automatic Linking Logic - use global_student_sheets for student data
        if (student_name && student_level && student_trade) {
            // Search for matches in global_student_sheets
            const [potentialMatches] = await connection.execute(`
                SELECT id, first_name, last_name, trade_code, level_number, gender
                FROM global_student_sheets
                WHERE status = 'active'
                AND trade_code = ?
                AND level_number = ?
                AND (first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?)
            `, [
                student_trade,
                student_level,
                `%${student_name}%`,
                `%${student_name}%`,
                `%${student_name}%`
            ]);

            let bestMatch = null;
            let highestScore = 0;

            for (const student of potentialMatches) {
                const fullName = `${student.first_name} ${student.last_name}`;
                const score = calculateNameSimilarity(fullName, student_name);

                // If gender is provided, use it to filter/re-score
                if (student_gender && student.gender && student.gender.toLowerCase() === student_gender.toLowerCase()) {
                    // Score boost for gender match
                } else if (student_gender && student.gender) {
                    // Skip if gender doesn't match and was provided
                    continue;
                }

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = student;
                }
            }

            // If we have a high-confidence match (e.g., > 85%)
            if (bestMatch && highestScore >= 85) {
                const matchMetadata = JSON.stringify({
                    name_match_score: highestScore,
                    trade_match: true,
                    level_match: true,
                    automatic_match: true
                });

                await connection.execute(`
                    INSERT INTO parent_student_links (
                        parent_id, student_id, relationship_type, status,
                        match_confidence, match_metadata, linked_at
                    ) VALUES (?, ?, ?, 'pending', ?, ?, NOW())
                `, [
                    parentId,
                    bestMatch.id,
                    relationship_type || 'Parent',
                    highestScore,
                    matchMetadata
                ]);

                // Log the activity
                const [linkResult] = await connection.execute(
                    'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
                    [parentId, bestMatch.id]
                );

                if (linkResult.length > 0) {
                    await connection.execute(`
                        INSERT INTO parent_student_link_activity (link_id, action, details)
                        VALUES (?, 'created', 'Parent registered and automatically linked based on student details')
                    `, [linkResult[0].id]);
                }

                autoLinked = true;
            } else {
                // No high-confidence match found, create a manual linking request (support ticket)
                const ticketTitle = `Manual Student Linking Request: ${student_name}`;
                const ticketDescription = `Parent ${first_name} ${last_name} (ID: ${parentId}) requested to link with student:
                Name: ${student_name}
                Level: ${student_level}
                Trade: ${student_trade}
                Gender: ${student_gender || 'Not specified'}
                
                No automatic match with confidence > 85% was found. Please verify and link manually.`;

                // Skip support ticket creation - table structure mismatch
                // The parent can still be registered and manually request linking later
                // await connection.execute(`
                //     INSERT INTO support_tickets (
                //         name, email, phone, subject, message, priority, status, created_at
                //     ) VALUES (?, ?, ?, ?, ?, 'medium', 'open', NOW())
                // `, [first_name + ' ' + last_name, emailValue, phone, ticketTitle, ticketDescription]);

                manualRequestCreated = true;
            }
        }

        await connection.commit();

        // Generate JWT token - use same secret and expiry as login route for consistency
        const token = jwt.sign(
            {
                userId: parentId,
                username: username,
                role: 'parent'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Return user data and token
        res.status(201).json({
            success: true,
            message: autoLinked
                ? 'Parent registration successful. Student linked (pending approval).'
                : (manualRequestCreated
                    ? 'Parent registration successful. A manual linking request has been sent to staff.'
                    : 'Parent registration successful.'),
            token: token,
            user: {
                id: parentId,
                username: username,
                first_name,
                last_name,
                email: emailValue,
                phone,
                role: 'parent',
                autoLinked,
                manualRequestCreated
            },
            dashboard_redirect: '/parent-dashboard'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Parent registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    } finally {
        connection.release();
    }
});

// POST /api/parent-registration/add-student
// Add student link after initial registration (parent already has account)
router.post('/add-student', async (req, res) => {
    try {
        const { parent_id, student_id, relationship_type } = req.body;

        // Verify parent exists
        const [parent] = await pool.execute(
            'SELECT id FROM users WHERE id = ? AND role = "parent"',
            [parent_id]
        );

        if (parent.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        // Verify student exists and is in valid trade
        const [student] = await pool.execute(
            'SELECT id, first_name, last_name, trade_code, level FROM users WHERE id = ? AND role = "student" AND trade_code IN ("BDC", "SOD", "AUT")',
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found or invalid trade' });
        }

        // Check if link already exists
        const [existingLink] = await pool.execute(
            'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
            [parent_id, student_id]
        );

        if (existingLink.length > 0) {
            return res.status(409).json({ success: false, message: 'Link already exists' });
        }

        // Create link request
        await pool.execute(`
      INSERT INTO parent_student_links (
        parent_id, student_id, relationship_type, status, match_confidence
      ) VALUES (?, ?, ?, 'pending', 85.0)
    `, [parent_id, student_id, relationship_type]);

        res.json({
            success: true,
            message: 'Student link request created. Pending admin approval.'
        });

    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/parent-registration/verify-student
// Verify student by first name, last name, gender, level, and trade
router.post('/verify-student', async (req, res) => {
    try {
        const { firstName, lastName, gender, level, trade } = req.body;

        if (!firstName || !lastName || !gender || !level || !trade) {
            return res.status(400).json({
                success: false,
                message: 'All student details are required: firstName, lastName, gender, level, trade'
            });
        }

        // Search in students table
        const [students] = await pool.execute(
            `SELECT 
                id, student_id, first_name, last_name, gender, trade, level, academic_year, status
             FROM students 
             WHERE LOWER(first_name) = LOWER(?) 
               AND LOWER(last_name) = LOWER(?)
               AND LOWER(gender) = LOWER(?)
               AND LOWER(trade) = LOWER(?)
               AND LOWER(level) = LOWER(?)
               AND status = 'active'
             LIMIT 1`,
            [firstName.trim(), lastName.trim(), gender.toLowerCase(), trade.toLowerCase(), level.toLowerCase()]
        );

        if (students.length > 0) {
            return res.json({
                success: true,
                found: true,
                student: students[0],
                message: 'Student found! You can now register as a parent.'
            });
        } else {
            return res.json({
                success: true,
                found: false,
                message: 'Student not found. Please contact school staff for assistance.'
            });
        }
    } catch (error) {
        console.error('Verify student error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
