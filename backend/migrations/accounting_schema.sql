-- School Accounting & Fee Management System
-- Database Schema

-- School Bank Accounts (For receiving payments)
CREATE TABLE IF NOT EXISTS school_bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type ENUM('savings', 'current', 'domiciliary') DEFAULT 'current',
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_active (school_id, is_active)
);

-- Fee Categories (Types of fees schools charge)
CREATE TABLE IF NOT EXISTS fee_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g., Tuition, Bus, Books, Sports, Lab
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Fee Structure (Define fees for different classes/terms)
CREATE TABLE IF NOT EXISTS fee_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    fee_category_id INT NOT NULL,
    class VARCHAR(100), -- NULL means applies to all classes
    session VARCHAR(50) NOT NULL,
    term VARCHAR(50), -- NULL means for entire session
    amount DECIMAL(10,2) NOT NULL,
    frequency ENUM('one-time', 'per-term', 'per-session', 'monthly') DEFAULT 'per-term',
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id) ON DELETE CASCADE
);

-- Student Fees (Actual fees assigned to students)
CREATE TABLE IF NOT EXISTS student_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_structure_id INT NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
    due_date DATE,
    status ENUM('pending', 'partial', 'paid', 'overdue', 'waived') DEFAULT 'pending',
    session VARCHAR(50) NOT NULL,
    term VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE CASCADE,
    INDEX idx_student_session_term (student_id, session, term),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Fee Payments (Record of all fee payments)
CREATE TABLE IF NOT EXISTS fee_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    student_id INT NOT NULL,
    student_fee_id INT NOT NULL,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'card', 'cheque', 'paystack', 'other') NOT NULL,
    payment_date DATE NOT NULL,
    transaction_reference VARCHAR(255),
    paystack_reference VARCHAR(255), -- For Paystack payments
    transfer_receipt_image LONGTEXT, -- Base64 encoded receipt image for bank transfers
    bank_name VARCHAR(255), -- Bank used for transfer
    account_number VARCHAR(50), -- Account number used
    collected_by VARCHAR(255), -- Name of staff who collected/verified
    notes TEXT,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by VARCHAR(255),
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT,
    is_verified BOOLEAN GENERATED ALWAYS AS (verification_status = 'verified') STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
    INDEX idx_receipt_no (receipt_no),
    INDEX idx_payment_date (payment_date),
    INDEX idx_student (student_id),
    INDEX idx_verification_status (verification_status),
    INDEX idx_payment_method (payment_method)
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g., Salaries, Utilities, Supplies, Maintenance
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Expenses (School expenditure tracking)
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    expense_category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'card', 'cheque', 'other') NOT NULL,
    receipt_no VARCHAR(100),
    vendor_name VARCHAR(255),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE CASCADE,
    INDEX idx_expense_date (expense_date),
    INDEX idx_category (expense_category_id)
);

-- Other Income (Non-fee revenue)
CREATE TABLE IF NOT EXISTS other_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    income_date DATE NOT NULL,
    source VARCHAR(255), -- e.g., Donations, Grants, Events
    receipt_no VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_income_date (income_date)
);

-- Fee Waivers/Discounts
CREATE TABLE IF NOT EXISTS fee_waivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    student_id INT NOT NULL,
    student_fee_id INT NOT NULL,
    waiver_type ENUM('discount', 'scholarship', 'exemption', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2), -- If discount is percentage-based
    reason TEXT NOT NULL,
    approved_by VARCHAR(255),
    approved_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
);

-- Payment Reminders (For tracking when reminders were sent)
CREATE TABLE IF NOT EXISTS payment_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_fee_id INT NOT NULL,
    student_id INT NOT NULL,
    parent_email VARCHAR(255),
    reminder_type ENUM('email', 'sms', 'notification') NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_sent_date (sent_date)
);

-- Insert default fee categories
INSERT INTO fee_categories (school_id, name, description)
SELECT id, 'Tuition Fee', 'Regular tuition charges' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM fee_categories WHERE school_id = schools.id AND name = 'Tuition Fee');

INSERT INTO fee_categories (school_id, name, description)
SELECT id, 'Development Levy', 'School development and infrastructure' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM fee_categories WHERE school_id = schools.id AND name = 'Development Levy');

INSERT INTO fee_categories (school_id, name, description)
SELECT id, 'Examination Fee', 'Internal and external examination fees' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM fee_categories WHERE school_id = schools.id AND name = 'Examination Fee');

-- Insert default expense categories
INSERT INTO expense_categories (school_id, name, description)
SELECT id, 'Staff Salaries', 'Teacher and staff salaries' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE school_id = schools.id AND name = 'Staff Salaries');

INSERT INTO expense_categories (school_id, name, description)
SELECT id, 'Utilities', 'Electricity, water, internet bills' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE school_id = schools.id AND name = 'Utilities');

INSERT INTO expense_categories (school_id, name, description)
SELECT id, 'Supplies', 'Stationery, teaching materials' FROM schools
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE school_id = schools.id AND name = 'Supplies');
