-- Parent Dashboard Tables Migration

-- Parent Messages Table
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  recipient_role VARCHAR(50),
  student_id INT,
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
);

-- Parent Activities Table
CREATE TABLE IF NOT EXISTS parent_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  activity_type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_parent_created (parent_id, created_at)
);

-- Parent Notifications Table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT,
  notification_type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  INDEX idx_parent_read (parent_id, read_at)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(100) UNIQUE,
  student_id INT NOT NULL,
  parent_id INT NOT NULL,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  phone_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_parent_status (parent_id, status)
);
