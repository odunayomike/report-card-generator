-- Report Card Generator Database Schema

CREATE DATABASE IF NOT EXISTS report_card_db;
USE report_card_db;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(100) NOT NULL,
    session VARCHAR(50) NOT NULL,
    admission_no VARCHAR(100) NOT NULL UNIQUE,
    term VARCHAR(50) NOT NULL,
    gender ENUM('MALE', 'FEMALE') NOT NULL,
    height VARCHAR(20),
    weight VARCHAR(20),
    club_society VARCHAR(255),
    fav_col VARCHAR(100),
    photo LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Create indexes for better performance
CREATE INDEX idx_student_admission ON students(admission_no);
CREATE INDEX idx_student_id_subjects ON subjects(student_id);
CREATE INDEX idx_student_id_attendance ON attendance(student_id);
CREATE INDEX idx_student_id_affective ON affective_domain(student_id);
CREATE INDEX idx_student_id_psychomotor ON psychomotor_domain(student_id);
CREATE INDEX idx_student_id_remarks ON remarks(student_id);
