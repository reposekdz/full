const db = require('../config/database');

async function setupTicketSystem() {
  try {
    console.log('🎫 Setting up Ticket Payment System...');

    // Create ticket_menus table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ticket_menus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        category ENUM('tuition', 'transport', 'meals', 'uniform', 'books', 'activities', 'exam', 'hostel', 'other') NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        term VARCHAR(20),
        due_date DATE NOT NULL,
        is_mandatory BOOLEAN DEFAULT 0,
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_academic_year (academic_year),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ ticket_menus table created');

    // Create ticket_payments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ticket_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        menu_id INT NOT NULL,
        student_id INT NOT NULL,
        parent_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('momo', 'bank_transfer', 'cash', 'card') NOT NULL,
        transaction_reference VARCHAR(255),
        payment_proof VARCHAR(255),
        notes TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        remarks TEXT,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_id) REFERENCES ticket_menus(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_menu (menu_id),
        INDEX idx_student (student_id),
        INDEX idx_parent (parent_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ ticket_payments table created');

    // Create ticket_notifications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ticket_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        menu_id INT NOT NULL,
        parent_id INT NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('sent', 'failed') DEFAULT 'sent',
        FOREIGN KEY (menu_id) REFERENCES ticket_menus(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        INDEX idx_parent (parent_id),
        INDEX idx_sent (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ ticket_notifications table created');

    // Insert sample ticket menus
    await db.execute(`
      INSERT IGNORE INTO ticket_menus (id, title, description, amount, category, academic_year, term, due_date, is_mandatory, status)
      VALUES 
        (1, 'First Term Tuition Fees', 'Tuition fees for the first term of academic year 2024', 150000.00, 'tuition', '2024', 'Term 1', '2024-03-15', 1, 'active'),
        (2, 'School Transport - Term 1', 'Transportation fees for first term', 30000.00, 'transport', '2024', 'Term 1', '2024-03-10', 0, 'active'),
        (3, 'Lunch Program - Term 1', 'School lunch program for the term', 45000.00, 'meals', '2024', 'Term 1', '2024-03-10', 0, 'active'),
        (4, 'School Uniform', 'Complete school uniform set', 25000.00, 'uniform', '2024', NULL, '2024-03-20', 1, 'active'),
        (5, 'Books and Materials', 'Required textbooks and learning materials', 35000.00, 'books', '2024', 'Term 1', '2024-03-05', 1, 'active'),
        (6, 'Sports Activities', 'Sports and extra-curricular activities', 15000.00, 'activities', '2024', 'Term 1', '2024-03-25', 0, 'active'),
        (7, 'Mid-Term Examination', 'Mid-term examination fees', 10000.00, 'exam', '2024', 'Term 1', '2024-04-30', 1, 'active')
    `);
    console.log('✅ Sample ticket menus inserted');

    console.log('✅ Ticket Payment System setup complete!');
    console.log('\n📊 System Features:');
    console.log('   - Accountants can create and manage ticket menus');
    console.log('   - Parents can view available tickets for their children');
    console.log('   - Parents can submit payments with proof');
    console.log('   - Accountants can approve/reject payments');
    console.log('   - Real-time statistics and reporting');
    console.log('   - Payment history tracking');
    console.log('   - Notification system');

  } catch (error) {
    console.error('❌ Setup error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupTicketSystem()
    .then(() => {
      console.log('\n✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupTicketSystem;
