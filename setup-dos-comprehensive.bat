@echo off
echo ========================================
echo DOS COMPREHENSIVE MANAGEMENT SETUP
echo ========================================
echo.

cd backend

echo Creating DOS management tables...
node -e "const {pool}=require('./config/database');(async()=>{try{await pool.execute('CREATE TABLE IF NOT EXISTS dos_teacher_class_assignments(id INT PRIMARY KEY AUTO_INCREMENT,teacher_id INT,teacher_name VARCHAR(255),trade_code VARCHAR(50),level_number INT,class_name VARCHAR(100),role VARCHAR(50),academic_year INT,assigned_by INT,assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,is_active TINYINT DEFAULT 1)');await pool.execute('CREATE TABLE IF NOT EXISTS dos_teacher_course_assignments(id INT PRIMARY KEY AUTO_INCREMENT,teacher_id INT,teacher_name VARCHAR(255),subject_code VARCHAR(50),subject_name VARCHAR(255),trade_code VARCHAR(50),level_number INT,academic_year INT,assigned_by INT,assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,is_active TINYINT DEFAULT 1,UNIQUE KEY unique_assignment(teacher_id,subject_code,trade_code,level_number,academic_year))');await pool.execute('CREATE TABLE IF NOT EXISTS dos_timetables(id INT PRIMARY KEY AUTO_INCREMENT,timetable_name VARCHAR(255),trade_code VARCHAR(50),level_number INT,academic_year INT,term VARCHAR(50),start_date DATE,end_date DATE,status VARCHAR(50) DEFAULT \"draft\",created_by INT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await pool.execute('CREATE TABLE IF NOT EXISTS dos_timetable_slots(id INT PRIMARY KEY AUTO_INCREMENT,timetable_id INT,day_of_week VARCHAR(20),period_number INT,start_time TIME,end_time TIME,subject_code VARCHAR(50),subject_name VARCHAR(255),teacher_id INT,teacher_name VARCHAR(255),room VARCHAR(100),notes TEXT,FOREIGN KEY(timetable_id) REFERENCES dos_timetables(id) ON DELETE CASCADE)');await pool.execute('CREATE TABLE IF NOT EXISTS dos_report_cards(id INT PRIMARY KEY AUTO_INCREMENT,student_id INT,student_code VARCHAR(50),student_name VARCHAR(255),trade_code VARCHAR(50),level_number INT,term VARCHAR(50),academic_year INT,total_subjects INT DEFAULT 0,total_marks DECIMAL(10,2) DEFAULT 0,average_marks DECIMAL(10,2) DEFAULT 0,percentage DECIMAL(5,2) DEFAULT 0,gpa DECIMAL(3,2) DEFAULT 0,overall_grade VARCHAR(5),class_rank INT,total_students INT,attendance_rate DECIMAL(5,2),days_present INT,days_absent INT,days_late INT,conduct_score INT,conduct_grade VARCHAR(5),total_incidents INT,class_teacher_comment TEXT,dos_comment TEXT,principal_comment TEXT,status VARCHAR(50) DEFAULT \"draft\",pdf_path VARCHAR(500),pdf_generated TINYINT DEFAULT 0,generated_by INT,generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY unique_report(student_id,term,academic_year))');await pool.execute('CREATE TABLE IF NOT EXISTS dos_parent_sms_notifications(id INT PRIMARY KEY AUTO_INCREMENT,student_id INT,parent_phone VARCHAR(20),parent_name VARCHAR(255),message_type VARCHAR(50),message_content TEXT,sms_status VARCHAR(50),sms_provider VARCHAR(50),sms_id VARCHAR(255),cost DECIMAL(10,4),sent_by INT,sent_by_name VARCHAR(255),sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');await pool.execute('CREATE TABLE IF NOT EXISTS dos_bulk_report_queue(id INT PRIMARY KEY AUTO_INCREMENT,batch_id VARCHAR(100) UNIQUE,trade_code VARCHAR(50),level_number INT,term VARCHAR(50),academic_year INT,total_students INT,processed_students INT DEFAULT 0,failed_students INT DEFAULT 0,status VARCHAR(50) DEFAULT \"pending\",started_by INT,started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,completed_at TIMESTAMP NULL)');await pool.execute('CREATE TABLE IF NOT EXISTS dos_analytics_cache(id INT PRIMARY KEY AUTO_INCREMENT,cache_key VARCHAR(255) UNIQUE,cache_data LONGTEXT,trade_code VARCHAR(50),level_number INT,academic_year INT,term VARCHAR(50),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,expires_at TIMESTAMP)');console.log('✅ All DOS management tables created successfully');process.exit(0)}catch(e){console.error('❌ Error:',e.message);process.exit(1)}})();"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create tables
    pause
    exit /b 1
)

echo.
echo ✅ DOS Comprehensive Management System Setup Complete!
echo.
echo 📋 Features Available:
echo    - Teacher-Class Assignments
echo    - Teacher-Course Assignments
echo    - Auto Timetable Generation (12 periods/day)
echo    - Report Card Generation
echo    - SMS to Parents
echo    - Analytics Dashboard
echo.
echo 🚀 API Endpoint: /api/dos-comprehensive
echo.
echo 📖 Check DOS_COMPREHENSIVE_GUIDE.md for usage
echo.
pause
