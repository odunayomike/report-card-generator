-- Add school_expenses table for simplified expense tracking
-- This is separate from the main expenses table which uses expense_categories

CREATE TABLE IF NOT EXISTS school_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    reference_no VARCHAR(255),
    receipt_image LONGTEXT, -- Base64 encoded receipt
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_expense_date (school_id, expense_date),
    INDEX idx_category (category)
);
