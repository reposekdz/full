-- Parent-Student Connection Requests Table
CREATE TABLE IF NOT EXISTS parent_student_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_trade VARCHAR(100) NOT NULL,
  student_level VARCHAR(50) NOT NULL,
  student_id VARCHAR(50),
  relationship_type ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_parent_requests ON parent_student_requests(parent_id, status);
