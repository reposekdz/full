-- ========================================
-- ADD 24 LEVEL 3 SOD STUDENTS TO GLOBAL STUDENT SHEETS
-- ========================================

-- Insert 24 Level 3 SOD students
INSERT INTO global_student_sheets 
(student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
VALUES 
-- Generate student_id starting from 600 (adjust if needed)
(600, 'Akimana', 'Ange Benita', 'SOD3-001', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(601, 'BAHATI', 'Noella', 'SOD3-002', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(602, 'CYOMORO', 'ARIHO RICKEY', 'SOD3-003', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(603, 'CYUZUZO', 'Aime Prince', 'SOD3-004', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(604, 'DUSHIME', 'MUTIMUTUJE Napoleon', 'SOD3-005', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(605, 'GATSINZI', 'Frank', 'SOD3-006', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(606, 'IMANIZABAYO', 'Alpha', 'SOD3-007', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(607, 'ISHIMWE', 'AIME ENOCK', 'SOD3-008', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(608, 'MANIRAREBA', 'Stiven', 'SOD3-009', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(609, 'MFASHWANABO', 'Hybert', 'SOD3-010', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(610, 'MUGISHA', 'Elissa', 'SOD3-011', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(611, 'MUGISHA', 'Dieu Merci', 'SOD3-012', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(612, 'MUGISHA', 'Prince', 'SOD3-013', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(613, 'MUNEZERO', 'DARIUS', 'SOD3-014', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(614, 'Mutsindashyaka', 'Alexis', 'SOD3-015', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(615, 'NIYONSHUTI', 'Costase', 'SOD3-016', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(616, 'NSHIMIYIMANA', 'Raphael', 'SOD3-017', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(617, 'RUGAMBAGE', 'Yannick Seviye', 'SOD3-018', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(618, 'RUTAYISIRE', 'EMILE', 'SOD3-019', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(619, 'SHEMA', 'Alexandre', 'SOD3-020', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(620, 'TUYISINGIZE', 'Pacifique', 'SOD3-021', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(621, 'UWAMAHORO', 'JEANNETTE', 'SOD3-022', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(622, 'UWARUGIRA', 'DANNY', 'SOD3-023', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00),
(623, 'UWIMANA', 'CHANTAL', 'SOD3-024', 'SOD 3A', 'SOD', 'Software Development', 3, 'A', 'active', 40.00, 100.00)
ON DUPLICATE KEY UPDATE 
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  trade_code = VALUES(trade_code),
  level_number = VALUES(level_number);

-- Verify insertion
SELECT COUNT(*) as total_level3_sod FROM global_student_sheets WHERE trade_code = 'SOD' AND level_number = 3;
SELECT * FROM global_student_sheets WHERE trade_code = 'SOD' AND level_number = 3 ORDER BY student_code;
