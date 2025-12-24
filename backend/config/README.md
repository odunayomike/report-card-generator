# Backend Configuration Setup

This directory contains sensitive configuration files that are **NOT tracked in git** for security reasons.

## Initial Setup

After cloning this repository, you need to create the configuration files from the provided examples:

### 1. Environment Configuration
```bash
cp env.example.php env.php
```
Then update `env.php` with your actual URLs:
- `BACKEND_URL`: Your backend server URL
- `FRONTEND_URL`: Your frontend application URL

### 2. Database Configuration
```bash
cp database.example.php database.php
```
Then update `database.php` with your database credentials:
- `DB_HOST`: Database host (usually `localhost`)
- `DB_NAME`: Your database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

Or create a `.env` file in the project root with:
```
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. Paystack Configuration
```bash
cp paystack.example.php paystack.php
```
Then update `paystack.php` with your Paystack API keys:

**Test Mode** (for development):
- Get keys from: https://dashboard.paystack.com/#/settings/developer
- Use keys starting with `pk_test_` and `sk_test_`

**Live Mode** (for production):
- Use keys starting with `pk_live_` and `sk_live_`

### 4. CORS Configuration
```bash
cp cors.example.php cors.php
```
This file usually doesn't need modification.

## Security Notes

⚠️ **IMPORTANT**: Never commit the actual configuration files to git:
- ✅ `*.example.php` files are safe to commit
- ❌ `env.php`, `database.php`, `paystack.php`, `cors.php` should NEVER be committed

These files are already listed in `.gitignore` to prevent accidental commits.

## Configuration Files

| File | Purpose | Contains Secrets |
|------|---------|------------------|
| `env.php` | Environment URLs | No |
| `database.php` | Database credentials | Yes ⚠️ |
| `paystack.php` | Paystack API keys | Yes ⚠️ |
| `cors.php` | CORS headers | No |

## Troubleshooting

If you see "Configuration file not found" errors:
1. Make sure you've copied all example files
2. Check file permissions (files should be readable by the web server)
3. Verify the file paths are correct
