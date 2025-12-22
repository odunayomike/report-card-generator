# PDF Generation Troubleshooting Guide

## Common Production Issues and Solutions

### Issue 1: Node.js Not Found
**Error**: `node: command not found` or similar

**Solutions**:
1. Install Node.js on your production server:
   ```bash
   # For Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # For CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. Verify Node.js installation:
   ```bash
   node --version
   which node
   ```

3. Update the `$nodePath` in `backend/routes/generate-pdf.php` with your server's actual node path

### Issue 2: Puppeteer Dependencies Missing
**Error**: `Error: Failed to launch the browser process`

**Solutions**:
1. Install Chromium dependencies:
   ```bash
   # For Ubuntu/Debian
   sudo apt-get install -y \
     ca-certificates \
     fonts-liberation \
     libappindicator3-1 \
     libasound2 \
     libatk-bridge2.0-0 \
     libatk1.0-0 \
     libc6 \
     libcairo2 \
     libcups2 \
     libdbus-1-3 \
     libexpat1 \
     libfontconfig1 \
     libgbm1 \
     libgcc1 \
     libglib2.0-0 \
     libgtk-3-0 \
     libnspr4 \
     libnss3 \
     libpango-1.0-0 \
     libpangocairo-1.0-0 \
     libstdc++6 \
     libx11-6 \
     libx11-xcb1 \
     libxcb1 \
     libxcomposite1 \
     libxcursor1 \
     libxdamage1 \
     libxext6 \
     libxfixes3 \
     libxi6 \
     libxrandr2 \
     libxrender1 \
     libxss1 \
     libxtst6 \
     lsb-release \
     wget \
     xdg-utils
   ```

2. Install puppeteer with Chromium:
   ```bash
   cd /path/to/backend
   npm install
   ```

### Issue 3: Permission Issues
**Error**: Cannot write to temp directory or execute scripts

**Solutions**:
1. Set proper permissions for temp directory:
   ```bash
   chmod 755 backend/temp
   chown www-data:www-data backend/temp  # For Apache
   # or
   chown nginx:nginx backend/temp  # For Nginx
   ```

2. Ensure PHP can execute shell commands:
   - Check `disable_functions` in php.ini
   - Ensure `exec`, `shell_exec` are not disabled

### Issue 4: Timeout Errors
**Error**: Script execution timeout

**Solutions**:
1. Increase PHP execution time in php.ini:
   ```ini
   max_execution_time = 300
   memory_limit = 512M
   ```

2. Increase timeout in pdf-service.js (already set to 60000ms)

### Diagnostic Steps

1. **Run the debug script**:
   Access: `https://your-domain.com/backend/routes/pdf-debug.php`

   This will show:
   - Node.js installation status
   - Puppeteer installation
   - Directory permissions
   - PHP configuration

2. **Check server logs**:
   ```bash
   # PHP error log
   tail -f /var/log/php_errors.log

   # Apache error log
   tail -f /var/log/apache2/error.log

   # Nginx error log
   tail -f /var/log/nginx/error.log
   ```

3. **Test Node.js execution manually**:
   ```bash
   cd /path/to/backend
   node pdf-service.js 1 /path/to/test-data.json /path/to/output.pdf
   ```

4. **Check file permissions**:
   ```bash
   ls -la backend/temp/
   ls -la backend/pdf-service.js
   ```

### Production Server Setup Checklist

- [ ] Node.js v16+ installed
- [ ] npm packages installed (`npm install` in backend directory)
- [ ] Chromium dependencies installed
- [ ] temp/ directory exists and is writable
- [ ] PHP can execute shell commands (exec not disabled)
- [ ] PHP execution time increased (at least 120 seconds)
- [ ] Memory limit sufficient (at least 256MB)

### Environment Variables

Add to your `.htaccess` or server configuration:
```apache
php_value max_execution_time 300
php_value memory_limit 512M
```

### Alternative: Use Hosted PDF Service

If you continue to have issues, consider using a hosted PDF service:
1. PDF.co
2. DocRaptor
3. CloudConvert

Contact support if issues persist with full debug output from `pdf-debug.php`.
