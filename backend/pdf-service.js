const puppeteer = require('puppeteer');
const fs = require('fs');

function generateReportHTML(data) {
  const student = data.student;
  const attendance = data.attendance || {};
  const subjects = data.subjects || [];
  const affective = data.affective || [];
  const psychomotor = data.psychomotor || [];
  const remarks = data.remarks || {};
  const school = data.school || {};

  // Default grading scale
  const defaultGradingScale = {
    A: [75, 100],
    B: [65, 74],
    C: [55, 64],
    D: [45, 54],
    F: [0, 44]
  };

  // Use school's grading scale or fall back to default
  const gradingScale = school.grading_scale || defaultGradingScale;

  // Helper function to calculate grade and remark using dynamic grading scale
  const getGradeAndRemark = (total) => {
    const score = parseFloat(total) || 0;

    // Check each grade range dynamically
    if (score >= gradingScale.A[0] && score <= gradingScale.A[1]) {
      return { grade: 'A', remark: 'EXCELLENT' };
    }
    if (score >= gradingScale.B[0] && score <= gradingScale.B[1]) {
      return { grade: 'B', remark: 'VERY GOOD' };
    }
    if (score >= gradingScale.C[0] && score <= gradingScale.C[1]) {
      return { grade: 'C', remark: 'GOOD' };
    }
    if (score >= gradingScale.D[0] && score <= gradingScale.D[1]) {
      return { grade: 'D', remark: 'FAIR' };
    }
    return { grade: 'F', remark: 'FAIL' };
  };

  // Calculate overall performance
  const validSubjects = subjects.filter(s => s.total);
  let performance = { total: 0, obtainable: 0, average: 0, grade: 'N/A', remark: 'N/A' };

  if (validSubjects.length > 0) {
    const totalObtained = validSubjects.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const totalObtainable = validSubjects.length * 100;
    const average = totalObtained / validSubjects.length;
    const gradeInfo = getGradeAndRemark(average);

    performance = {
      total: totalObtained.toFixed(0),
      obtainable: totalObtainable,
      average: average.toFixed(2),
      grade: gradeInfo.grade,
      remark: gradeInfo.remark
    };
  }

  // Calculate grade counts
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  validSubjects.forEach(subject => {
    const { grade } = getGradeAndRemark(subject.total);
    if (gradeCounts.hasOwnProperty(grade)) {
      gradeCounts[grade]++;
    }
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; }
    .report-card-pdf {
      width: 210mm;
      min-height: 297mm;
      padding: 8mm;
      background: white;
    }

    /* Custom Header Text */
    .custom-header {
      text-align: center;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #d1d5db;
    }
    .custom-header p {
      font-size: 9px;
      font-style: italic;
    }

    /* Header Styles */
    .header {
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 2px solid black;
      position: relative;
    }
    .header-content {
      display: flex;
      align-items: flex-start;
    }
    .logo-container {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: white;
      flex-shrink: 0;
      position: absolute;
      left: 0;
      top: -32px;
    }
    .logo-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .logo-placeholder {
      font-size: 10px;
      font-weight: bold;
    }
    .school-info {
      text-align: center;
      flex: 1;
      margin-top: -8px;
    }
    .school-info h1 {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1.2;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    .school-info p {
      font-size: 10px;
      margin-top: 2px;
    }
    .school-motto {
      font-size: 10px;
      font-style: italic;
      margin-top: 2px;
    }
    .student-photo {
      width: 96px;
      height: 96px;
      border: 2px solid black;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      flex-shrink: 0;
    }
    .student-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      font-size: 10px;
      color: #6b7280;
    }

    /* Report Title */
    .report-title {
      text-align: center;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 2px solid black;
    }
    .report-title h2 {
      font-size: 13px;
      font-weight: bold;
    }

    /* Student Info Grid */
    .student-info {
      font-size: 9px;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 2px solid black;
    }
    .info-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    .info-field {
      display: flex;
      flex: 1;
      gap: 4px;
    }
    .info-field .label {
      font-weight: bold;
      flex-shrink: 0;
      font-size: 8px;
    }
    .info-field .value {
      flex: 1;
      border-bottom: 1px solid black;
      padding-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 8px;
    }

    /* Main Grid Layout */
    .main-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 10px;
      margin-bottom: 6px;
    }

    /* Table Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid black;
    }
    th, td {
      border: 1px solid #666;
      padding: 5px;
      text-align: center;
    }
    th {
      background-color: #e5e7eb;
      font-weight: bold;
      font-size: 9px;
    }
    td {
      font-size: 8px;
    }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .bg-gray { background-color: #f3f4f6; }

    /* Performance Summary */
    .performance-summary {
      margin-top: 10px;
    }

    /* Grading Scale */
    .grading-scale {
      margin-top: 10px;
      font-size: 9px;
      line-height: 1.4;
    }
    .grading-scale strong {
      font-weight: bold;
    }

    /* Attendance/Affective Section */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .section-header {
      background-color: #e5e7eb;
      border: 1px solid black;
      padding: 2px;
      text-align: center;
      font-weight: bold;
      font-size: 9px;
    }

    /* Bottom Grid */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 6px;
    }

    /* Remarks Section */
    .remarks-section {
      margin-top: 8px;
      font-size: 9px;
    }
    .remark-box {
      border: 2px solid #9ca3af;
      display: flex;
      margin-bottom: 8px;
    }
    .remark-box .label {
      font-weight: bold;
      padding: 8px;
      border-right: 2px solid black;
      width: 128px;
      font-size: 8px;
    }
    .remark-box .content {
      padding: 8px;
      flex: 1;
      font-style: italic;
      font-size: 8px;
    }
    .signature-row {
      display: flex;
      gap: 16px;
      font-size: 8px;
      margin-bottom: 8px;
    }
    .signature-field {
      flex: 1;
    }
    .signature-field .label {
      font-weight: bold;
    }
    .signature-field .line {
      display: inline-block;
      border-bottom: 2px solid black;
      margin-left: 8px;
      min-width: 128px;
      padding-bottom: 2px;
    }

    /* Footer */
    .footer {
      margin-top: 6px;
      font-size: 8px;
    }
    .custom-footer {
      text-align: center;
      font-style: italic;
      margin-bottom: 4px;
      padding-bottom: 4px;
      padding-top: 4px;
      border-top: 1px solid #d1d5db;
    }
    .footer-copyright {
      text-align: right;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="report-card-pdf">
    <!-- Custom Header Text -->
    ${school.header_text ? `
    <div class="custom-header">
      <p>${school.header_text}</p>
    </div>
    ` : ''}

    <!-- Header -->
    <div class="header">
      <div class="header-content">
        ${school.show_logo_on_report !== false ? `
        <div class="logo-container">
          ${student.school_logo ? `<img src="${student.school_logo}" alt="School Logo" />` : '<span class="logo-placeholder">LOGO</span>'}
        </div>
        ` : ''}
        <div class="school-info">
          <h1>${(student.school_name || 'SCHOOL NAME').toUpperCase()}</h1>
          ${school.show_motto_on_report !== false && school.motto ? `<p class="school-motto">"${school.motto}"</p>` : ''}
          <p>${student.school_address || 'School Address'}</p>
          <p>TEL: ${student.school_phone || 'N/A'}, Email: ${student.school_email || 'N/A'}</p>
        </div>
      </div>
    </div>

    <!-- Report Title -->
    <div class="report-title">
      <h2>${(student.term || 'FIRST TERM').toUpperCase()} STUDENT'S PERFORMANCE REPORT</h2>
    </div>

    <!-- Student Information Grid with Photo -->
    <div style="display: flex; gap: 8px; font-size: 9px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 2px solid black;">
      <!-- Student Details - Left Side -->
      <div style="flex: 1;" class="student-info">
      <div class="info-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px;">
        <div class="info-field">
          <span class="label">NAME:</span>
          <span class="value">${(student.name || '').toUpperCase()}</span>
        </div>
        <div class="info-field">
          <span class="label">CLASS:</span>
          <span class="value">${student.class || ''}</span>
        </div>
        <div class="info-field">
          <span class="label">GENDER:</span>
          <span class="value">${student.gender || ''}</span>
        </div>
      </div>

      <div class="info-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div class="info-field">
          <span class="label">SESSION:</span>
          <span class="value">${student.session || ''}</span>
        </div>
        <div class="info-field">
          <span class="label">ADMISSION NO.:</span>
          <span class="value">${student.admission_no || ''}</span>
        </div>
        <div class="info-field">
          <span class="label">CLUB/SOCIETY:</span>
          <span class="value">${student.club_society || ''}</span>
        </div>
      </div>

      <div class="info-row" style="display: grid; grid-template-columns: 0.5fr 0.5fr 1fr 1fr; gap: 12px; margin-bottom: 0;">
        <div class="info-field">
          <span class="label">HT:</span>
          <span class="value">${student.height || ''}</span>
        </div>
        <div class="info-field">
          <span class="label">WT:</span>
          <span class="value">${student.weight || ''}</span>
        </div>
        <div class="info-field">
          <span class="label">AGE:</span>
          <span class="value">${student.age || 'N/A'}</span>
        </div>
        <div class="info-field">
          <span class="label">FAV. COL:</span>
          <span class="value">${student.fav_col || ''}</span>
        </div>
      </div>
      </div>

      <!-- Student Photo - Right Side -->
      <div class="student-photo" style="flex-shrink: 0;">
        ${student.photo ? `<img src="${student.photo}" alt="Student Photo" />` : '<span class="photo-placeholder">PHOTO</span>'}
      </div>
    </div>

    <!-- Main Grid: Cognitive Domain & Attendance/Affective -->
    <div class="main-grid">
      <!-- Left Column: Cognitive Domain -->
      <div>
        <table>
          <thead>
            <tr class="bg-gray">
              <th rowspan="2">COGNITIVE DOMAIN</th>
              <th colspan="3">SCORE</th>
              <th rowspan="2">GRADE</th>
              <th rowspan="2">REMARKS</th>
            </tr>
            <tr class="bg-gray">
              <th style="font-size: 8px;">CA<br/>40</th>
              <th style="font-size: 8px;">EXAM<br/>60</th>
              <th style="font-size: 8px;">TOTAL<br/>100</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-bold bg-gray text-left" style="font-size: 9px;">SUBJECTS</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            ${validSubjects.map(subject => {
              const { grade, remark } = getGradeAndRemark(subject.total);
              return `
                <tr>
                  <td class="text-left">${subject.subject_name || subject.name || ''}</td>
                  <td>${subject.ca || 0}</td>
                  <td>${subject.exam || 0}</td>
                  <td class="font-bold">${subject.total || 0}</td>
                  <td class="font-bold">${grade}</td>
                  <td>${remark}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Performance Summary -->
        <div class="performance-summary">
          <table>
            <thead>
              <tr class="bg-gray">
                <th colspan="4">PERFORMANCE SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold text-left">Total Obtained:</td>
                <td>${performance.total}</td>
                <td class="font-bold text-left">Total Obtainable:</td>
                <td>${performance.obtainable}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-bold text-left">PERCENTAGE:</td>
                <td colspan="2" class="font-bold">${performance.average}%</td>
              </tr>
              <tr>
                <td colspan="2" class="font-bold text-left">GRADE:</td>
                <td colspan="2" class="font-bold">${performance.grade}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-bold text-left">REMARK:</td>
                <td colspan="2" class="font-bold">${performance.remark}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Right Column: Attendance & Affective Domain -->
      <div class="right-column">
        <!-- Attendance Summary -->
        <div>
          <div class="section-header">ATTENDANCE SUMMARY</div>
          <table>
            <tbody>
              <tr>
                <td class="text-left" style="font-size: 8px;">No of Times School Opened</td>
                <td>${attendance.no_of_times_school_opened || 0}</td>
              </tr>
              <tr>
                <td class="text-left" style="font-size: 8px;">No of Times Present</td>
                <td>${attendance.no_of_times_present || 0}</td>
              </tr>
              <tr>
                <td class="text-left" style="font-size: 8px;">No of Times Absent</td>
                <td>${attendance.no_of_times_absent || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Affective Domain -->
        <div style="margin-top: 10px;">
          <div class="section-header">AFFECTIVE DOMAIN</div>
          <table>
            <thead>
              <tr class="bg-gray">
                <th></th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
              </tr>
            </thead>
            <tbody>
              ${affective.map(item => `
                <tr>
                  <td class="text-left" style="font-size: 7px;">${item.trait_name || ''}</td>
                  ${[1, 2, 3, 4, 5].map(rating => `
                    <td>${item.rating == rating ? '✓' : ''}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bottom Grid: Psychomotor, Grade Summary & Grading Scale -->
    <div class="bottom-grid">
      <!-- Psychomotor Domain -->
      <div>
        <div class="section-header">PSYCHOMOTOR DOMAIN</div>
        <table>
          <thead>
            <tr class="bg-gray">
              <th></th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
            </tr>
          </thead>
          <tbody>
            ${psychomotor.map(item => `
              <tr>
                <td class="text-left" style="font-size: 7px;">${item.skill_name || ''}</td>
                ${[1, 2, 3, 4, 5].map(rating => `
                  <td>${item.rating == rating ? '✓' : ''}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Grade Summary -->
      <div>
        <div class="section-header">GRADE SUMMARY</div>
        <table>
          <thead>
            <tr>
              <th>GRADE</th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
              <th>F</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-left">NO</td>
              <td>${gradeCounts.A}</td>
              <td>${gradeCounts.B}</td>
              <td>${gradeCounts.C}</td>
              <td>${gradeCounts.D}</td>
              <td>${gradeCounts.E || 0}</td>
              <td>${gradeCounts.F}</td>
            </tr>
            <tr>
              <td colspan="3" class="font-bold text-left">TOTAL SUBJECTS OFFERED</td>
              <td colspan="4" class="font-bold">${validSubjects.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grading Scale -->
      <div>
        <div class="section-header">GRADING SCALE</div>
        <table>
          <thead>
            <tr class="bg-gray">
              <th>SCORE</th>
              <th>GRADE</th>
              <th>REMARK</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${gradingScale.A[0]}-${gradingScale.A[1]}%</td>
              <td class="font-bold">A</td>
              <td>EXCELLENT</td>
            </tr>
            <tr>
              <td>${gradingScale.B[0]}-${gradingScale.B[1]}%</td>
              <td class="font-bold">B</td>
              <td>VERY GOOD</td>
            </tr>
            <tr>
              <td>${gradingScale.C[0]}-${gradingScale.C[1]}%</td>
              <td class="font-bold">C</td>
              <td>GOOD</td>
            </tr>
            <tr>
              <td>${gradingScale.D[0]}-${gradingScale.D[1]}%</td>
              <td class="font-bold">D</td>
              <td>FAIR</td>
            </tr>
            <tr>
              <td>${gradingScale.F[0]}-${gradingScale.F[1]}%</td>
              <td class="font-bold">F</td>
              <td>FAIL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Remarks Section -->
    <div class="remarks-section">
      <div class="remark-box">
        <div class="label">Teacher's Remark:</div>
        <div class="content">${remarks.teacher_remark || ''}</div>
      </div>

      <div class="signature-row">
        <div class="signature-field">
          <span class="label">Teacher's Name:</span>
          <span class="line">${(remarks.teacher_name || '').toUpperCase()}</span>
        </div>
        <div class="signature-field">
          <span class="label">Sign:</span>
          <span class="line">&nbsp;</span>
        </div>
      </div>

      <div class="remark-box">
        <div class="label">Principal's Remark:</div>
        <div class="content">${remarks.principal_remark || ''}</div>
      </div>

      <div class="signature-row">
        <div class="signature-field">
          <span class="label">Principal's Name:</span>
          <span class="line">${(remarks.principal_name || '').toUpperCase()}</span>
        </div>
        <div class="signature-field">
          <span class="label">Sign:</span>
          <span class="line">&nbsp;</span>
        </div>
      </div>

      <div class="signature-row" style="margin-top: 4px;">
        <div class="signature-field">
          <span class="label">Next Term Begins:</span>
          <span class="line">${remarks.next_term_begins || ''}</span>
        </div>
        <div class="signature-field">
          <span class="label">Date:</span>
          <span class="line">&nbsp;</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      ${school.footer_text ? `
      <div class="custom-footer">
        <p>${school.footer_text}</p>
      </div>
      ` : ''}
      <div class="footer-copyright">
        <p>${(student.school_name || 'SCHOOL NAME').toUpperCase()} © ${new Date().getFullYear()}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function generatePDF(reportId, dataFilePath, outputPath) {
  let browser;

  try {
    // Read the report data from the JSON file
    const reportData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    // Generate HTML content
    const html = generateReportHTML(reportData);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // Set the HTML content directly
    await page.setContent(html, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Generate PDF with A4 settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: false
    });

    await browser.close();

    return pdfBuffer;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const reportId = args[0];
  const dataFilePath = args[1];
  const outputPath = args[2] || 'output.pdf';

  if (!reportId || !dataFilePath) {
    console.error('Usage: node pdf-service.js <reportId> <dataFilePath> [outputPath]');
    process.exit(1);
  }

  generatePDF(reportId, dataFilePath, outputPath)
    .then((pdfBuffer) => {
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log(JSON.stringify({ success: true, path: outputPath }));
      process.exit(0);
    })
    .catch((error) => {
      console.error(JSON.stringify({ success: false, error: error.message }));
      process.exit(1);
    });
}

module.exports = { generatePDF };
