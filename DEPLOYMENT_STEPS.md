# Quick Deployment Steps for Production

## ⚠️ CRITICAL: Your Production Environment

**Server Type**: Windows Shared Hosting
**Issue**: exec() function is DISABLED
**Solution**: TCPDF fallback is now implemented and will work automatically

## Step 1: Upload Backend Files

Upload these NEW files to your production server:

```
backend/
├── routes/
│   ├── generate-pdf-tcpdf.php (NEW)
│   └── pdf-debug.php (NEW - Updated)
├── composer.json (NEW)
└── vendor/ (will be created by composer)
```

## Step 2: Install TCPDF on Production

### Option A: Via SSH (if available)
```bash
cd /path/to/backend
composer install
```

### Option B: Via FTP/File Manager
1. Run `composer install` on your LOCAL machine
2. This creates the `vendor/` folder with all dependencies
3. Upload the entire `vendor/` folder to your production server
4. Final structure:
   ```
   backend/
   ├── vendor/
   │   ├── autoload.php
   │   ├── composer/
   │   └── tecnickcom/
   │       └── tcpdf/
   ├── routes/
   └── temp/
   ```

## Step 3: Verify temp Directory

Ensure the temp directory exists and is writable:

### Via SSH:
```bash
cd backend
mkdir -p temp
chmod 755 temp
```

### Via FTP/File Manager:
1. Create `backend/temp/` folder if it doesn't exist
2. Set permissions to 755 (read, write, execute)

## Step 4: Update Frontend

Replace the updated frontend files:

```
src/
├── services/
│   └── api.js (UPDATED - with fallback logic)
└── pages/
    └── ViewReport.jsx (UPDATED - shows PDF method)
```

Then rebuild and deploy your frontend:
```bash
npm run build
# Upload dist/ folder to production
```

## Step 5: Test the System

### 5.1 Check Diagnostic Endpoint
Access: `https://schoolhub.ng/backend/routes/pdf-debug.php`

**Expected Output** (for your hosting):
```json
{
  "exec_available": false,
  "shell_exec_available": false,
  "CRITICAL_WARNING": {
    "message": "exec() function is DISABLED on this server",
    "impact": "PDF generation using Node.js/Puppeteer will NOT work",
    "solutions": [...]
  },
  "temp_directory": {
    "exists": true,
    "writable": true
  }
}
```

### 5.2 Test PDF Generation
1. Log into your SchoolHub account
2. Navigate to a student's report card
3. Click "Download PDF"
4. **Expected Behavior**:
   - System tries Puppeteer first (will fail due to exec disabled)
   - Automatically falls back to TCPDF
   - PDF downloads successfully
   - Toast shows: "PDF downloaded successfully using TCPDF (Pure PHP)!"

## Step 6: Verify PDF Content

Open the downloaded PDF and check:
- [ ] School logo appears (if enabled)
- [ ] School name and details
- [ ] Student information
- [ ] All subjects with scores
- [ ] Performance summary
- [ ] Attendance records
- [ ] Affective and Psychomotor domains
- [ ] Teacher and Principal remarks
- [ ] Grading scale

## Common Issues & Quick Fixes

### Issue 1: "Class TCPDF not found"
**Cause**: Composer dependencies not installed
**Fix**:
```bash
cd backend
composer install
# OR upload vendor/ folder via FTP
```

### Issue 2: "Failed to create PDF file"
**Cause**: temp directory not writable
**Fix**:
```bash
chmod 755 backend/temp
# Make sure web server user can write to it
```

### Issue 3: PDF downloads but is empty
**Cause**: Student data is incomplete
**Fix**: Ensure student has:
- At least one subject with grades
- Attendance data filled
- Basic student info (name, class, session, term)

### Issue 4: "Both PDF generation methods failed"
**Cause**: TCPDF not installed or temp directory issue
**Fix**:
1. Check if `vendor/tecnickcom/tcpdf/` exists
2. Check if `backend/temp/` exists and is writable
3. Check PHP error logs for specific errors

## Rollback Plan (if needed)

If something goes wrong, you can rollback:

1. **Frontend**: Deploy previous version from git:
   ```bash
   git checkout <previous-commit>
   npm run build
   ```

2. **Backend**: Remove new files:
   - Delete `generate-pdf-tcpdf.php`
   - Keep `generate-pdf.php` (original)
   - Frontend will show error but app will still work

3. **Temporary workaround**: Users can use browser's "Print to PDF" feature

## Post-Deployment Monitoring

### Day 1-3: Monitor Closely
- Check if PDFs are generating successfully
- Monitor which method is being used (check console logs)
- Verify temp directory isn't filling up with old PDFs
- Check user feedback for PDF quality issues

### Week 1: Verify Automatic Cleanup
- Check `backend/temp/` directory size
- Old PDFs should auto-delete after 1 hour
- If directory grows too large, check cleanup code in `generate-pdf-tcpdf.php:280`

### Monthly: Performance Check
- Track average PDF generation time
- Monitor server disk space
- Check error logs for any PDF-related issues

## Success Criteria

✅ PDF download works on production
✅ Toast message confirms TCPDF method
✅ PDF contains all student data correctly
✅ No PHP errors in logs
✅ temp/ directory stays under 100MB
✅ Old PDFs are being cleaned up automatically

## Support Contacts

- **Technical Issue**: Check `/URGENT_PDF_FIX.md` for detailed troubleshooting
- **Implementation Questions**: See `/PDF_GENERATION_IMPLEMENTATION.md`
- **PHP Errors**: Check server error logs at `/logs/php_errors.log`

## Next Steps After Successful Deployment

1. ✅ Test with 5-10 different report cards
2. ✅ Get user feedback on PDF quality
3. ✅ Monitor for any edge cases or errors
4. 📝 Consider adding admin setting to manually choose PDF method
5. 📝 Consider batch PDF export for multiple students at once

---

**Last Updated**: December 2024
**Production Server**: H:\root\home\odunayomike-002\www\schoolhub\
**Status**: Ready for Deployment
