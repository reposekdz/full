/**
 * Setup test parent with linked student
 */
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function setupTestParent() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Create test parent with password_hash
        const hashedPassword = await bcrypt.hash('parent123', 10);

        // Check if test parent exists
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['testparent@gardentvet.rw']
        );

        let parentId;

        if (existing.length > 0) {
            parentId = existing[0].id;
            console.log(`Test parent already exists with ID: ${parentId}`);

            // Update password
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashedPassword, parentId]
            );
            console.log('Updated parent password');
        } else {
            // Get parent role_id
            const [roleRows] = await connection.execute(
                'SELECT id FROM roles WHERE name = ?',
                ['parent']
            );
            const parentRoleId = roleRows.length > 0 ? roleRows[0].id : 8;

            // Create new parent
            const [result] = await connection.execute(`
        INSERT INTO users (
          username, first_name, last_name, email, phone, password_hash,
          role, role_id, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'parent', ?, 1, NOW())
      `, [
                'test_parent_2026',
                'Test',
                'Parent',
                'testparent@gardentvet.rw',
                '+250788999999',
                hashedPassword,
                parentRoleId
            ]);

            parentId = result.insertId;
            console.log(`Created test parent with ID: ${parentId}`);
        }

        // Get first student from global_student_sheets
        const [students] = await connection.execute(
            'SELECT id, first_name, last_name, student_code FROM global_student_sheets WHERE status = \'active\' LIMIT 1'
        );

        if (students.length > 0) {
            const student = students[0];

            // Check if link already exists
            const [existingLink] = await connection.execute(
                'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
                [parentId, student.id]
            );

            if (existingLink.length === 0) {
                // Create parent-student link
                await connection.execute(`
          INSERT INTO parent_student_links (
            parent_id, student_id, relationship_type, status, 
            match_confidence, linked_at, created_at
          ) VALUES (?, ?, 'Parent', 'approved', 100.00, NOW(), NOW())
        `, [parentId, student.id]);

                console.log(`Linked parent to student: ${student.first_name} ${student.last_name} (${student.student_code})`);
            } else {
                console.log('Parent-student link already exists');
            }
        } else {
            console.log('No students found in global_student_sheets');
        }

        await connection.commit();

        console.log('\n========================================');
        console.log('TEST PARENT CREDENTIALS:');
        console.log('========================================');
        console.log('Email: testparent@gardentvet.rw');
        console.log('Phone: +250788999999');
        console.log('Password: parent123');
        console.log('========================================\n');

    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

setupTestParent();
