import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function ReportCard({ data, school }) {
  const reportRef = useRef();

  // Calculate grade and remark based on total score
  const getGradeAndRemark = (total) => {
    const score = parseFloat(total) || 0;
    if (score >= 70) return { grade: 'A', remark: 'EXCELLENT' };
    if (score >= 60) return { grade: 'B', remark: 'VERY GOOD' };
    if (score >= 50) return { grade: 'C', remark: 'GOOD' };
    if (score >= 40) return { grade: 'D', remark: 'FAIR' };
    return { grade: 'F', remark: 'FAIL' };
  };

  // Calculate overall performance
  const calculateOverallPerformance = () => {
    const validSubjects = data.subjects.filter(s => s.total);
    if (validSubjects.length === 0) return { total: 0, obtainable: 0, grade: 'N/A', remark: 'N/A' };

    const totalObtained = validSubjects.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const totalObtainable = validSubjects.length * 100;
    const average = totalObtained / validSubjects.length;

    return {
      total: totalObtained.toFixed(0),
      obtainable: totalObtainable,
      average: average.toFixed(2),
      ...getGradeAndRemark(average)
    };
  };

  const performance = calculateOverallPerformance();

  // Filter subjects that have grades
  const subjectsWithGrades = data.subjects.filter(s => s.total);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;

      if (!element) {
        console.error('Report element not found');
        alert('Error: Report element not found');
        return;
      }

      // Create filename with school name
      const schoolName = school?.school_name ? school.school_name.replace(/[^a-zA-Z0-9]/g, '_') : 'School';
      const studentName = data.name ? data.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
      const session = data.session ? data.session.replace(/[^a-zA-Z0-9]/g, '_') : '';
      const term = data.term ? data.term.replace(/[^a-zA-Z0-9]/g, '_') : '';

      const filename = `${schoolName}_Report_Card_${studentName}_${term}_${session}.pdf`;

      const opt = {
        margin: [5, 5, 5, 5], // Reduced margins to fit more content
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5, // Reduced scale to fit on one page
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 800, // Fixed width for consistent rendering
          windowHeight: 1200
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('Starting PDF generation...');
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generation completed');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
      // Remove overlay if it exists
      const overlay = document.querySelector('.html2pdf__overlay');
      if (overlay) overlay.remove();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4 print:hidden flex gap-4">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
        >
          Download as PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md"
        >
          Print Report Card
        </button>
      </div>

      <div ref={reportRef} className="bg-white p-2 report-card-pdf" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-1 pb-1 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
              {school?.logo ? (
                <img src={school.logo} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">LOGO</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">{school?.school_name?.toUpperCase() || 'SCHOOL NAME'}</h1>
              <p className="text-[10px] mt-1">{school?.address || 'School Address'}</p>
              <p className="text-[10px]">TEL: {school?.phone || 'N/A'}, Email: {school?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Student Photo */}
          <div className="w-24 h-28 border-2 border-black flex items-center justify-center bg-gray-100">
            {data.photo ? (
              <img src={data.photo} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-500">PHOTO</span>
            )}
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-1 pb-1 border-b-2 border-black">
          <h2 className="text-xs font-bold">{data.term?.toUpperCase()} STUDENT'S PERFORMANCE REPORT</h2>
        </div>

        {/* Student Information Grid */}
        <div className="text-[10px] mb-1 pb-1 border-b-2 border-black">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-2 mb-1">
            <div className="flex">
              <span className="font-bold w-16">NAME:</span>
              <span className="flex-1 border-b border-black pb-1">{data.name?.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">CLASS:</span>
              <span className="flex-1 border-b border-black pb-1">{data.class}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">GENDER:</span>
              <span className="flex-1 border-b border-black pb-1">{data.gender}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">AGE:</span>
              <span className="flex-1 border-b border-black pb-1">{data.age || 'N/A'}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div className="flex">
              <span className="font-bold w-20">SESSION:</span>
              <span className="flex-1 border-b border-black pb-1">{data.session}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">ADMISSION NO.:</span>
              <span className="flex-1 border-b border-black pb-1">{data.admissionNo}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">CLUB/SOCIETY:</span>
              <span className="flex-1 border-b border-black pb-1">{data.clubSociety}</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex">
              <span className="font-bold w-12">HT:</span>
              <span className="flex-1 border-b border-black pb-1">{data.height}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-12">WT:</span>
              <span className="flex-1 border-b border-black pb-1">{data.weight}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">FAV. COL:</span>
              <span className="flex-1 border-b border-black pb-1">{data.favCol}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Left Column - Cognitive Domain */}
          <div className="col-span-3">
            <table className="w-full border-2 border-black text-[9px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">COGNITIVE DOMAIN</th>
                  <th className="border border-black p-1 text-center font-bold" colSpan="3">SCORE</th>
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">GRADE</th>
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">REMARKS</th>
                </tr>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 text-center text-[8px]">CA<br/>40</th>
                  <th className="border border-black p-1 text-center text-[8px]">EXAM<br/>60</th>
                  <th className="border border-black p-1 text-center text-[8px]">TOTAL<br/>100</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold bg-gray-100">SUBJECTS</td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
                {subjectsWithGrades.map((subject, index) => {
                  const { grade, remark } = getGradeAndRemark(subject.total);
                  return (
                    <tr key={index}>
                      <td className="border border-black p-1 text-[8px]">{subject.name}</td>
                      <td className="border border-black p-1 text-center text-[8px]">{subject.ca}</td>
                      <td className="border border-black p-1 text-center text-[8px]">{subject.exam}</td>
                      <td className="border border-black p-1 text-center font-bold text-[8px]">{subject.total}</td>
                      <td className="border border-black p-1 text-center font-bold text-[8px]">{grade}</td>
                      <td className="border border-black p-1 text-center text-[8px]">{remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Performance Summary */}
            <div className="mt-2 border-2 border-black">
              <table className="w-full text-[9px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black p-1 font-bold" colSpan="4">PERFORMANCE SUMMARY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1 font-bold">Total Obtained:</td>
                    <td className="border border-black p-1 text-center">{performance.total}</td>
                    <td className="border border-black p-1 font-bold">Total Obtainable:</td>
                    <td className="border border-black p-1 text-center">{performance.obtainable}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold" colSpan="2">GRADE:</td>
                    <td className="border border-black p-1 text-center font-bold" colSpan="2">{performance.grade}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold" colSpan="2">REMARK:</td>
                    <td className="border border-black p-1 text-center font-bold" colSpan="2">{performance.remark}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grading Scale */}
            <div className="mt-2 text-[8px] leading-tight">
              <p><strong>70-100%=EXCELLENT; 60-69.9%=VERY GOOD; 50-59.9%=GOOD; 40-</strong></p>
              <p><strong>49.9%=AVERAGE; 30-39.9%=FAIR; 0-29.9%=POOR</strong></p>
            </div>
          </div>

          {/* Right Column - Attendance, Affective, and Psychomotor */}
          <div className="space-y-2">
            {/* Attendance Summary */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-[9px]">
                ATTENDANCE SUMMARY
              </div>
              <table className="w-full text-[8px]">
                <tbody>
                  <tr>
                    <td className="border border-black p-1 text-[8px]">No of Times School Opened</td>
                    <td className="border border-black p-1 text-center text-[8px]">{data.noOfTimesSchoolOpened}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-[8px]">No of Times Present</td>
                    <td className="border border-black p-1 text-center text-[8px]">{data.noOfTimesPresent}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-[8px]">No of Times Absent</td>
                    <td className="border border-black p-1 text-center text-[8px]">{data.noOfTimesAbsent}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Affective Domain */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-[9px]">
                AFFECTIVE DOMAIN
              </div>
              <table className="w-full text-[8px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-[8px]"></th>
                    <th className="border border-black p-1 text-center text-[8px]">1</th>
                    <th className="border border-black p-1 text-center text-[8px]">2</th>
                    <th className="border border-black p-1 text-center text-[8px]">3</th>
                    <th className="border border-black p-1 text-center text-[8px]">4</th>
                    <th className="border border-black p-1 text-center text-[8px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.affectiveDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black p-1 text-[7px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black p-1 text-center text-[8px]">
                          {value == rating ? '✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Horizontal Section: Psychomotor Domain, Rating Indices, Grade Summary */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {/* Psychomotor Domain */}
          <div className="border-2 border-black">
            <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-[9px]">
              PSYCHOMOTOR DOMAIN
            </div>
            <table className="w-full text-[8px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1 text-[8px]"></th>
                  <th className="border border-black p-1 text-center text-[8px]">1</th>
                  <th className="border border-black p-1 text-center text-[8px]">2</th>
                  <th className="border border-black p-1 text-center text-[8px]">3</th>
                  <th className="border border-black p-1 text-center text-[8px]">4</th>
                  <th className="border border-black p-1 text-center text-[8px]">5</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.psychomotorDomain || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border border-black p-1 text-[7px]">{key}</td>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <td key={rating} className="border border-black p-1 text-center text-[8px]">
                        {value == rating ? '✓' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rating Indices */}
          <div className="border-2 border-black">
            <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-[9px]">
              Rating Indices
            </div>
            <div className="p-2 text-[7px] leading-tight">
              <p>1 - Maintains a high level of Observable traits.</p>
              <p>2 - Observable traits.</p>
              <p>3 - Maintaining a high level of Observable traits.</p>
              <p>4 - Shows Minimal regard for Observable traits.</p>
              <p>5 - Has No regard for Observable traits.</p>
            </div>
          </div>

          {/* Grade Summary */}
          <div className="border-2 border-black">
            <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-[9px]">
              GRADE SUMMARY
            </div>
            <table className="w-full text-[8px]">
              <thead>
                <tr>
                  <th className="border border-black p-1 text-[8px]">GRADE</th>
                  <th className="border border-black p-1 text-center text-[8px]">A</th>
                  <th className="border border-black p-1 text-center text-[8px]">B</th>
                  <th className="border border-black p-1 text-center text-[8px]">C</th>
                  <th className="border border-black p-1 text-center text-[8px]">D</th>
                  <th className="border border-black p-1 text-center text-[8px]">E</th>
                  <th className="border border-black p-1 text-center text-[8px]">F</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 text-[8px]">NO</td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                  <td className="border border-black p-1 text-center text-[8px]"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-[8px] font-bold" colSpan="3">TOTAL SUBJECTS OFFERED</td>
                  <td className="border border-black p-1 text-center font-bold text-[8px]" colSpan="4">{subjectsWithGrades.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher and Principal Remarks */}
        <div className="mt-2 space-y-1 text-[9px]">
          <div className="border-2 border-black">
            <div className="flex">
              <span className="font-bold p-2 border-r-2 border-black w-32">Teacher's Remark:</span>
              <span className="p-2 flex-1 italic">{data.teacherRemark}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <span className="font-bold">Teacher's Name:</span>
              <span className="ml-2 border-b-2 border-black pb-1 inline-block">{data.teacherName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32 pb-1">&nbsp;</span>
            </div>
          </div>

          <div className="border-2 border-black">
            <div className="flex">
              <span className="font-bold p-2 border-r-2 border-black w-32">Principal's Remark:</span>
              <span className="p-2 flex-1 italic">{data.principalRemark}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <span className="font-bold">Principal's Name:</span>
              <span className="ml-2 border-b-2 border-black pb-1 inline-block">{data.principalName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32 pb-1">&nbsp;</span>
            </div>
          </div>

          <div className="flex gap-4 mt-1">
            <div className="flex-1">
              <span className="font-bold">Next Term Begins:</span>
              <span className="ml-2 border-b-2 border-black pb-1 inline-block">{data.nextTermBegins}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Date:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32 pb-1">&nbsp;</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1 text-right text-[8px] italic">
          <p>{school?.school_name?.toUpperCase() || 'SCHOOL NAME'} © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
