# Report Card Generator - Backend Setup

This is the PHP backend for the Report Card Generator application.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server (or use PHP built-in server for development)
- PDO PHP Extension

## Installation Steps

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE report_card_db;
```

2. Import the database schema:
```bash
mysql -u root -p report_card_db < database.sql
```

Or manually run the SQL in `database.sql` using phpMyAdmin or MySQL Workbench.

### 2. Configure Database Connection

Edit `config/database.php` and update the database credentials:

```php
private $host = "localhost";
private $db_name = "report_card_db";
private $username = "root";      // Your MySQL username
private $password = "";          // Your MySQL password
```

### 3. Web Server Setup

#### Option A: Using PHP Built-in Server (Development)

```bash
cd backend
php -S localhost:8000
```

Your API will be available at: `http://localhost:8000/api/`

#### Option B: Using XAMPP/WAMP/MAMP

1. Copy the entire `report-card-generator` folder to your htdocs directory:
   - XAMPP: `C:\xampp\htdocs\` (Windows) or `/Applications/XAMPP/htdocs/` (Mac)
   - WAMP: `C:\wamp64\www\`
   - MAMP: `/Applications/MAMP/htdocs/`

2. Your API will be available at: `http://localhost/report-card-generator/backend/api/`

### 4. Update Frontend API URL

Edit `src/services/api.js` in the frontend and update the API base URL:

```javascript
const API_BASE_URL = 'http://localhost:8000/api'; // For PHP built-in server
// OR
const API_BASE_URL = 'http://localhost/report-card-generator/backend/api'; // For XAMPP/WAMP/MAMP
```

## API Endpoints

### 1. Save Report Card
- **URL:** `/api/save-report.php`
- **Method:** POST
- **Body:** JSON object with complete report card data
- **Response:**
```json
{
  "success": true,
  "message": "Report card saved successfully",
  "student_id": 1
}
```

### 2. Get Report Card
- **URL:** `/api/get-report.php?id={student_id}`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    ...
  }
}
```

### 3. Get All Students
- **URL:** `/api/get-all-students.php`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### 4. Delete Report Card
- **URL:** `/api/delete-report.php?id={student_id}`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "message": "Report card deleted successfully"
}
```

## Database Schema

The database consists of the following tables:

1. **students** - Main student information
2. **attendance** - Attendance records
3. **subjects** - Subject grades and scores
4. **affective_domain** - Behavioral trait ratings
5. **psychomotor_domain** - Physical/practical skill ratings
6. **remarks** - Teacher and principal remarks

## Security Notes

- The CORS configuration in `config/cors.php` currently allows all origins. For production, update it to allow only your frontend domain.
- Always use HTTPS in production
- Never commit database credentials to version control
- Consider implementing authentication/authorization for API endpoints

## Troubleshooting

### Error: "Connection error: SQLSTATE[HY000] [1045] Access denied"
- Check your database credentials in `config/database.php`
- Ensure MySQL is running

### Error: "CORS policy" in browser console
- Verify CORS headers are properly set in `config/cors.php`
- Check that the API URL in frontend matches your backend URL

### Error: "404 Not Found" on API endpoints
- Verify your web server is running
- Check the API base URL in `src/services/api.js`
- Ensure `.htaccess` or server configuration allows API routes

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Browser DevTools

Example cURL command:
```bash
curl -X GET http://localhost:8000/api/get-all-students.php
```
