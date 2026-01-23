const mysql = require('mysql2/promise');

async function setupAccountantSystem() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    // Fee payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        student_name VARCHAR(255),
        amount DECIMAL(15,2) NOT NULL,
        payment_type ENUM('tuition', 'exam', 'uniform', 'transport', 'meals', 'other') NOT NULL,
        payment_method ENUM('cash', 'bank', 'mobile_money', 'card') NOT NULL,
        reference_number VARCHAR(100),
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_by INT,
        notes TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id)
      )
    `);

    // Invoices table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        student_id INT NOT NULL,
        student_code VARCHAR(50),
        student_name VARCHAR(255),
        total_amount DECIMAL(15,2) NOT NULL,
        paid_amount DECIMAL(15,2) DEFAULT 0,
        balance DECIMAL(15,2) NOT NULL,
        due_date DATE,
        status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Budget table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(100) NOT NULL,
        allocated_amount DECIMAL(15,2) NOT NULL,
        spent_amount DECIMAL(15,2) DEFAULT 0,
        remaining_amount DECIMAL(15,2) NOT NULL,
        fiscal_year VARCHAR(20) NOT NULL,
        status ENUM('active', 'completed', 'exceeded') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Expenses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        expense_date DATE NOT NULL,
        payment_method ENUM('cash', 'bank', 'mobile_money', 'card') NOT NULL,
        reference_number VARCHAR(100),
        approved_by INT,
        processed_by INT,
        status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (approved_by) REFERENCES users(id),
        FOREIGN KEY (processed_by) REFERENCES users(id)
      )
    `);

    // Salary payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS salary_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        staff_id INT NOT NULL,
        staff_name VARCHAR(255) NOT NULL,
        basic_salary DECIMAL(15,2) NOT NULL,
        allowances DECIMAL(15,2) DEFAULT 0,
        deductions DECIMAL(15,2) DEFAULT 0,
        net_salary DECIMAL(15,2) NOT NULL,
        payment_month VARCHAR(20) NOT NULL,
        payment_date DATE,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        processed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id)
      )
    `);

    // Financial reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS financial_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        report_type ENUM('income', 'expense', 'balance', 'profit_loss', 'cash_flow') NOT NULL,
        report_period VARCHAR(50) NOT NULL,
        total_income DECIMAL(15,2) DEFAULT 0,
        total_expense DECIMAL(15,2) DEFAULT 0,
        net_balance DECIMAL(15,2) DEFAULT 0,
        generated_by INT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (generated_by) REFERENCES users(id)
      )
    `);

    console.log('✅ Accountant system tables created successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up accountant system:', error);
    await connection.end();
    process.exit(1);
  }
}

setupAccountantSystem();
