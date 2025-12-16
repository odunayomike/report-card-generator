-- Report Card Generator Database Schema

CREATE DATABASE IF NOT EXISTS db_abcb24_school;
USE db_abcb24_school;

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo LONGTEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(100) NOT NULL,
    session VARCHAR(50) NOT NULL,
    admission_no VARCHAR(100) NOT NULL,
    term VARCHAR(50) NOT NULL,
    gender ENUM('MALE', 'FEMALE') NOT NULL,
    height VARCHAR(20),
    weight VARCHAR(20),
    club_society VARCHAR(255),
    fav_col VARCHAR(100),
    photo LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_admission_per_school (school_id, admission_no)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    no_of_times_school_opened INT NOT NULL,
    no_of_times_present INT NOT NULL,
    no_of_times_absent INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    ca DECIMAL(5,2) NOT NULL,
    exam DECIMAL(5,2) NOT NULL,
    total DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2),
    remark VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Affective domain table
CREATE TABLE IF NOT EXISTS affective_domain (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    trait_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Psychomotor domain table
CREATE TABLE IF NOT EXISTS psychomotor_domain (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Remarks table
CREATE TABLE IF NOT EXISTS remarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_remark TEXT NOT NULL,
    principal_name VARCHAR(255) NOT NULL,
    principal_remark TEXT NOT NULL,
    next_term_begins DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_email_per_school (school_id, email)
);

-- Teacher Classes (Junction table for teacher-class assignment)
CREATE TABLE IF NOT EXISTS teacher_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    school_id INT NOT NULL,
    session VARCHAR(50) NOT NULL,
    term VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_class_assignment (teacher_id, class_name, session, term)
);

-- Daily Attendance table (for teacher-marked daily student attendance)
CREATE TABLE IF NOT EXISTS daily_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    marked_by_teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_date_attendance (student_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_student_admission ON students(admission_no);
CREATE INDEX idx_student_id_subjects ON subjects(student_id);
CREATE INDEX idx_student_id_attendance ON attendance(student_id);
CREATE INDEX idx_student_id_affective ON affective_domain(student_id);
CREATE INDEX idx_student_id_psychomotor ON psychomotor_domain(student_id);
CREATE INDEX idx_student_id_remarks ON remarks(student_id);
CREATE INDEX idx_teacher_email ON teachers(email);
CREATE INDEX idx_teacher_school ON teachers(school_id);
CREATE INDEX idx_teacher_class_teacher ON teacher_classes(teacher_id);
CREATE INDEX idx_teacher_class_school ON teacher_classes(school_id);
CREATE INDEX idx_daily_attendance_student ON daily_attendance(student_id);
CREATE INDEX idx_daily_attendance_date ON daily_attendance(date);
CREATE INDEX idx_daily_attendance_teacher ON daily_attendance(marked_by_teacher_id);
