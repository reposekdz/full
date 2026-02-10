-- Role-Specific Column Templates Migration
-- Adds default columns for each staff role with proper permissions and calculations

-- Accountant Columns (Financial Management)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order)
VALUES 
('paid_amount', 'Paid Amount', 'number', NULL, 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 1),
('unpaid_amount', 'Unpaid Amount', 'number', NULL, 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 2),
('remaining_balance', 'Remaining Balance', 'calculated', NULL, 'accountant', '["accountant", "admin", "headmaster"]', '[]', 'global', 1, 3),
('payment_status', 'Payment Status', 'select', '["Paid", "Partial", "Unpaid", "Overdue"]', 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 4),
('payment_date', 'Last Payment Date', 'date', NULL, 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 5),
('fee_category', 'Fee Category', 'select', '["Tuition", "Exam", "Uniform", "Transport", "Hostel", "Cafeteria", "Other"]', 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 6),
('payment_method', 'Payment Method', 'select', '["Cash", "Bank Transfer", "Mobile Money", "Cheque", "Other"]', 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 7),
('discount_applied', 'Discount Applied', 'number', NULL, 'accountant', '["accountant", "admin", "headmaster"]', '["accountant", "admin"]', 'global', 1, 8);

-- Teacher Columns (Academic Management)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order, calculation_formula)
VALUES 
('quiz_marks', 'Quiz Marks', 'number', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 10, NULL),
('midterm_marks', 'Midterm Marks', 'number', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 11, NULL),
('final_marks', 'Final Marks', 'number', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 12, NULL),
('total_marks', 'Total Marks', 'calculated', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '[]', 'global', 1, 13, 'quiz_marks + midterm_marks + final_marks'),
('percentage', 'Percentage', 'calculated', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '[]', 'global', 1, 14, '(total_marks / 100) * 100'),
('grade', 'Grade', 'calculated', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '[]', 'global', 1, 15, 'CASE WHEN percentage >= 90 THEN "A" WHEN percentage >= 80 THEN "B" WHEN percentage >= 70 THEN "C" WHEN percentage >= 60 THEN "D" ELSE "F" END'),
('subject_name', 'Subject Name', 'text', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 16, NULL),
('course_code', 'Course Code', 'text', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 17, NULL),
('assignment_marks', 'Assignment Marks', 'number', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 18, NULL),
('participation_score', 'Participation Score', 'number', NULL, 'teacher', '["teacher", "dos", "admin", "headmaster"]', '["teacher", "dos", "admin"]', 'global', 1, 19, NULL);

-- Director of Studies Columns (Academic Oversight)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order, calculation_formula)
VALUES 
('academic_performance', 'Academic Performance', 'number', NULL, 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 20, NULL),
('class_rank', 'Class Rank', 'number', NULL, 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 21, NULL),
('gpa', 'GPA', 'calculated', NULL, 'dos', '["dos", "admin", "headmaster"]', '[]', 'global', 1, 22, 'percentage / 20'),
('study_plan', 'Study Plan', 'textarea', NULL, 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 23, NULL),
('academic_status', 'Academic Status', 'select', '["Excellent", "Good", "Average", "Poor", "At Risk"]', 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 24, NULL),
('remedial_needed', 'Remedial Needed', 'boolean', NULL, 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 25, NULL),
('promotion_status', 'Promotion Status', 'select', '["Promoted", "Repeat", "Conditional", "Pending"]', 'dos', '["dos", "admin", "headmaster"]', '["dos", "admin"]', 'global', 1, 26, NULL);

-- Director of Discipline Columns (Behavior Management)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order)
VALUES 
('behavior_score', 'Behavior Score', 'number', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 30),
('discipline_incidents', 'Discipline Incidents', 'number', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 31),
('conduct_grade', 'Conduct Grade', 'select', '["A", "B", "C", "D", "F"]', 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 32),
('counseling_sessions', 'Counseling Sessions', 'number', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 33),
('parent_meetings', 'Parent Meetings', 'number', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 34),
('suspension_days', 'Suspension Days', 'number', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 35),
('behavior_improvement_plan', 'Behavior Improvement Plan', 'textarea', NULL, 'dod', '["dod", "admin", "headmaster"]', '["dod", "admin"]', 'global', 1, 36);

-- Headmaster Columns (Overall Management)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order, calculation_formula)
VALUES 
('overall_rating', 'Overall Rating', 'calculated', NULL, 'headmaster', '["headmaster", "admin"]', '[]', 'global', 1, 40, '(academic_performance + conduct_score + attendance_percentage) / 3'),
('recommendation', 'Principal Recommendation', 'textarea', NULL, 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global', 1, 41, NULL),
('awards', 'Awards & Recognition', 'text', NULL, 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global', 1, 42, NULL),
('leadership_potential', 'Leadership Potential', 'select', '["High", "Medium", "Low", "Not Assessed"]', 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global', 1, 43, NULL),
('special_programs', 'Special Programs', 'text', NULL, 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global', 1, 44, NULL),
('graduation_readiness', 'Graduation Readiness', 'select', '["Ready", "Needs Improvement", "At Risk", "Not Ready"]', 'headmaster', '["headmaster", "admin"]', '["headmaster", "admin"]', 'global', 1, 45, NULL);

-- Admin Columns (System Management)
INSERT INTO student_sheet_custom_columns 
(column_name, column_label, column_type, select_options, created_by_role, visible_to_roles, editable_by_roles, scope, is_active, display_order)
VALUES 
('system_notes', 'System Notes', 'textarea', NULL, 'admin', '["admin"]', '["admin"]', 'global', 1, 50),
('data_quality_score', 'Data Quality Score', 'number', NULL, 'admin', '["admin"]', '["admin"]', 'global', 1, 51),
('last_updated_by', 'Last Updated By', 'text', NULL, 'admin', '["admin"]', '[]', 'global', 1, 52),
('verification_status', 'Verification Status', 'select', '["Verified", "Pending", "Needs Review", "Rejected"]', 'admin', '["admin"]', '["admin"]', 'global', 1, 53);

-- Update calculation formulas for existing columns
UPDATE student_sheet_custom_columns SET calculation_formula = 'total_fees - paid_amount' WHERE column_name = 'remaining_balance';
UPDATE student_sheet_custom_columns SET calculation_formula = 'quiz_marks + midterm_marks + final_marks' WHERE column_name = 'total_marks';
UPDATE student_sheet_custom_columns SET calculation_formula = '(total_marks / 100) * 100' WHERE column_name = 'percentage';
UPDATE student_sheet_custom_columns SET calculation_formula = 'percentage / 20' WHERE column_name = 'gpa';
UPDATE student_sheet_custom_columns SET calculation_formula = '(academic_performance + conduct_score + attendance_percentage) / 3' WHERE column_name = 'overall_rating';