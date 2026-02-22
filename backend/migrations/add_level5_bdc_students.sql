-- ========================================
-- ADD 28 LEVEL 5 BDC STUDENTS TO GLOBAL STUDENT SHEETS
-- ========================================

-- Insert 28 Level 5 BDC students
INSERT INTO global_student_sheets 
(student_id, first_name, last_name, student_code, class_name, trade_code, trade_name, level_number, level_suffix, status, conduct_score, attendance_percentage) 
VALUES 
(900, 'BENINGABO', 'EMMANUEL', 'BDC5-001', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(901, 'ASIFIWE', 'SERGE', 'BDC5-002', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(902, 'CYANGWEGE', 'John', 'BDC5-003', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(903, 'HAKIZIYAREMYE', 'Papias', 'BDC5-004', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(904, 'IRAFASHA', 'AUGUSTIN', 'BDC5-005', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(905, 'IRAKIZA', 'Verite', 'BDC5-006', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(906, 'ISIMBI', 'SYLVIE', 'BDC5-007', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(907, 'IZABAYO', 'JOSUE', 'BDC5-008', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(908, 'IZABAYO', 'PATRICK', 'BDC5-009', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(909, 'MIZERO', 'Emile', 'BDC5-010', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(910, 'MUGISHA', 'Eric', 'BDC5-011', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(911, 'MUKAMUNYANA', 'Marie Chantal', 'BDC5-012', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(912, 'MUKASEKURU', 'SOLANGE', 'BDC5-013', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(913, 'MUKAWIZEYE', 'DIVINE', 'BDC5-014', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(914, 'MUTINYIMANA', 'Ange', 'BDC5-015', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(915, 'NIYOGUSHIMWA', 'Jean Robert', 'BDC5-016', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(916, 'NIYOMUGABO', 'Jean De Dieu', 'BDC5-017', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(917, 'NIYONGABO', 'Jean Pierre', 'BDC5-018', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(918, 'NKUMBUYE', 'Elysee', 'BDC5-019', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(919, 'NZAMURAMBAHO', 'GIRBERT', 'BDC5-020', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(920, 'RAFIKI', 'Suwayibu', 'BDC5-021', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(921, 'RUDAHUNDAGARA', 'Jonathan', 'BDC5-022', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(922, 'RUKUNDO', 'JONATHAN', 'BDC5-023', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(923, 'SHUKURU', 'ALICE', 'BDC5-024', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(924, 'TUYISHIMIRE', 'Francois', 'BDC5-025', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(925, 'TUYIZERE', 'Théodole', 'BDC5-026', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(926, 'UWIRAGIYE', 'JACKSON', 'BDC5-027', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00),
(927, 'YEHOVAYIRE', 'Adamusowari', 'BDC5-028', 'BDC 5', 'BDC', 'Building & Construction', 5, '', 'active', 40.00, 100.00)
ON DUPLICATE KEY UPDATE 
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  trade_code = VALUES(trade_code),
  level_number = VALUES(level_number);

-- Verify insertion
SELECT COUNT(*) as total_level5_bdc FROM global_student_sheets WHERE trade_code = 'BDC' AND level_number = 5;
SELECT * FROM global_student_sheets WHERE trade_code = 'BDC' AND level_number = 5 ORDER BY student_code;
