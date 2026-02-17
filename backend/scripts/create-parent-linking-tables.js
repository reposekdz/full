const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('Creating parent linking tables...');

    try {
        // 1. Create parent_student_links table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        relationship_type VARCHAR(50) DEFAULT 'Parent',
        status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending',
        match_confidence DECIMAL(5,2) DEFAULT 0,
        match_metadata JSON,
        verification_method VARCHAR(50),
        verified_by INT,
        verified_at TIMESTAMP NULL,
        rejection_reason TEXT,
        linked_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_parent_student (parent_id, student_id),
        INDEX idx_parent (parent_id),
        INDEX idx_student (student_id),
        INDEX idx_status (status)
      )
    `);
        console.log('✅ Created parent_student_links table');

        // 2. Create parent_student_link_activity table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_student_link_activity (
        id INT PRIMARY KEY AUTO_INCREMENT,
        link_id INT NOT NULL,
        action ENUM('created', 'approved', 'rejected', 'updated', 'deleted', 'reactivated') NOT NULL,
        details TEXT,
        performed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (link_id) REFERENCES parent_student_links(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_link (link_id),
        INDEX idx_action (action)
      )
    `);
        console.log('✅ Created parent_student_link_activity table');

        // 3. Create parent_linking_help_requests table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_linking_help_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_name VARCHAR(200),
        student_code VARCHAR(50),
        trade VARCHAR(20),
        level VARCHAR(20),
        message TEXT,
        preferred_contact VARCHAR(50),
        status ENUM('pending', 'resolved', 'closed') DEFAULT 'pending',
        response_message TEXT,
        responded_by INT,
        responded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_status (status)
      )
    `);
        console.log('✅ Created parent_linking_help_requests table');

        // 4. Create parent_notifications table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT,
        data JSON,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_parent (parent_id),
        INDEX idx_is_read (is_read),
        INDEX idx_type (type)
      )
    `);
        console.log('✅ Created parent_notifications table');

        // 5. Create parent_communications table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_communications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        direction ENUM('incoming', 'outgoing') DEFAULT 'outgoing',
        channel ENUM('app', 'sms', 'email', 'whatsapp') DEFAULT 'app',
        sent_by INT,
        status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_student (student_id),
        INDEX idx_direction (direction)
      )
    `);
        console.log('✅ Created parent_communications table');

        // 6. Create parent_meetings table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_meetings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        scheduled_by INT,
        meeting_date DATE NOT NULL,
        meeting_time TIME,
        meeting_type ENUM('in_person', 'virtual', 'phone') DEFAULT 'in_person',
        purpose TEXT,
        status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scheduled_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_meeting_date (meeting_date),
        INDEX idx_status (status)
      )
    `);
        console.log('✅ Created parent_meetings table');

        // 7. Create parent_documents table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        document_type VARCHAR(50) NOT NULL,
        document_name VARCHAR(200) NOT NULL,
        file_path VARCHAR(500),
        file_size INT,
        uploaded_by INT,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_document_type (document_type)
      )
    `);
        console.log('✅ Created parent_documents table');

        // 8. Create parent_visit_logs table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS parent_visit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        parent_id INT NOT NULL,
        student_id INT,
        visit_date DATE NOT NULL,
        visit_time TIME,
        visit_purpose VARCHAR(200),
        check_in_time TIMESTAMP NULL,
        check_out_time TIMESTAMP NULL,
        received_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_visit_date (visit_date)
      )
    `);
        console.log('✅ Created parent_visit_logs table');

        // 9. Create support_tickets table if not exists
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subject VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        resolved_at TIMESTAMP NULL,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_category (category)
      )
    `);
        console.log('✅ Created/verified support_tickets table');

        console.log('\n✅ All parent linking tables created successfully!');

        // Show all tables
        const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME LIKE 'parent%'
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);

        console.log('\nParent-related tables in database:');
        tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

    } catch (err) {
        console.error('Migration error:', err.message);
        throw err;
    } finally {
        await connection.end();
    }
}

migrate().catch(console.error);
