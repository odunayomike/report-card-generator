# Report Card Generator - Complete Setup Guide

## Overview
The Report Card Generator is a complete web application with authentication system that allows schools to create professional student report cards.

## Features
- School registration and login system
- Multi-step report card creation form
- Live preview of report card
- PDF export functionality
- Database storage of all records
- Secure session management

## Prerequisites
- Node.js 18+ (for frontend)
- PHP 7.4+ (for backend)
- MySQL 5.7+ (for database)
- Apache/Nginx or PHP built-in server

## Installation Steps

### 1. Database Setup

Create the database and import the schema:

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE report_card_db;
USE report_card_db;
SOURCE backend/database.sql;
```

Or import manually using phpMyAdmin.

### 2. Backend Configuration

Edit `backend/config/database.php` and update your database credentials:

```php
private $host = "localhost";
private $db_name = "report_card_db";
private $username = "root";      // Your MySQL username
private $password = "";          // Your MySQL password
```

### 3. Start Backend Server

Option A - PHP Built-in Server (Development):
```bash
cd backend
php -S localhost:8000
```

Option B - Using XAMPP/WAMP/MAMP:
1. Copy entire project to htdocs folder
2. Access via: `http://localhost/report-card-generator/backend/api/`

### 4. Frontend Configuration

Update API URLs in frontend files to match your backend:

**src/services/api.js:**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

**src/App.jsx, src/components/Login.jsx, src/components/Register.jsx, src/components/Dashboard.jsx:**
```javascript
fetch('http://localhost:8000/api/auth/...')
```

### 5. Install Frontend Dependencies

```bash
npm install
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## User Flow

### 1. Landing Page
- Visit `http://localhost:5173`
- View features and benefits
- Click "Create Free Account" or "Sign In"

### 2. School Registration
- Fill in school information (name, email, password, phone, address)
- Password must be at least 6 characters
- Email must be unique
- Submit to create account

### 3. Login
- Enter registered email and password
- Successfully logged in schools are redirected to dashboard

### 4. Dashboard
- Create new report cards
- Multi-step form with live preview
- Save reports to database
- Download as PDF
- Logout option

## Application Structure

```
report-card-generator/
├── backend/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.php      # School registration
│   │   │   ├── login.php          # School login
│   │   │   ├── logout.php         # Logout
│   │   │   └── check-session.php  # Session validation
│   │   ├── save-report.php        # Save report card
│   │   ├── get-report.php         # Get single report
│   │   ├── get-all-students.php   # List all students
│   │   └── delete-report.php      # Delete report
│   ├── config/
│   │   ├── database.php           # Database connection
│   │   └── cors.php               # CORS headers
│   ├── database.sql               # Database schema
│   └── README.md                  # Backend documentation
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx        # Home page
│   │   ├── Login.jsx              # Login form
│   │   ├── Register.jsx           # Registration form
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── StudentForm.jsx        # Report card form
│   │   └── ReportCard.jsx         # Report card display
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── data/
│   │   └── subjects.js            # Subject definitions
│   └── App.jsx                    # Main app with routing
└── package.json
```

## Database Schema

### Tables:
1. **schools** - School accounts
2. **students** - Student information (linked to schools)
3. **attendance** - Attendance records
4. **subjects** - Subject grades
5. **affective_domain** - Behavioral ratings
6. **psychomotor_domain** - Skill ratings
7. **remarks** - Teacher/principal comments

## API Endpoints

### Authentication
- `POST /api/auth/register.php` - Register school
- `POST /api/auth/login.php` - Login
- `GET /api/auth/logout.php` - Logout
- `GET /api/auth/check-session.php` - Check session

### Report Cards
- `POST /api/save-report.php` - Save report card
- `GET /api/get-report.php?id={id}` - Get report card
- `GET /api/get-all-students.php` - List all students
- `GET /api/delete-report.php?id={id}` - Delete report

## Security Features

- Password hashing with PHP `password_hash()`
- PDO prepared statements (SQL injection protection)
- Session-based authentication
- CORS configuration
- Input validation

## Troubleshooting

### "Connection error" in browser console
- Check if PHP backend server is running
- Verify API URLs match your backend location
- Check database credentials in `config/database.php`

### "CORS policy" error
- Ensure `config/cors.php` is included in all API endpoints
- Check if backend server is running on correct port

### Sessions not persisting
- PHP sessions require cookies to be enabled
- Check that backend and frontend are on same domain or CORS is properly configured

### Can't create database tables
- Check MySQL user has CREATE privileges
- Verify database exists before running schema
- Check for syntax errors in SQL file

## Production Deployment

1. Update all API URLs to production domain
2. Use HTTPS for all connections
3. Update CORS to allow only your domain
4. Change database credentials
5. Set strong passwords
6. Enable PHP error logging (not display)
7. Use environment variables for sensitive data

## Default Test Account

After setup, create your first school account through the registration page.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for errors
4. Verify database tables were created correctly

## License

This project is for educational and commercial use.
