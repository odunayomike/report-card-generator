import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function ReportCard({ data, school, hideButtons = false }) {
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
      {!hideButtons && (
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
      )}

      <div ref={reportRef} className="bg-white report-card-pdf" style={{ fontFamily: 'Arial, sans-serif', width: '210mm', minHeight: '297mm', padding: '8mm', boxSizing: 'border-box' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2 pb-2 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center overflow-hidden bg-white">
              {school?.logo ? (
                <img
                  src={school.logo}
                  alt="School Logo"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Logo failed to load');
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-xs font-bold">LOGO</span>';
                  }}
                />
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
        <div className="grid grid-cols-5 gap-2">
          {/* Left Column - Cognitive Domain */}
          <div className="col-span-3">
            <table className="w-full border-2 border-black text-[9px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-1 py-0.5 text-center font-bold text-[8px]" rowSpan="2">COGNITIVE DOMAIN</th>
                  <th className="border border-black px-1 py-0.5 text-center font-bold text-[8px]" colSpan="3">SCORE</th>
                  <th className="border border-black px-1 py-0.5 text-center font-bold text-[8px]" rowSpan="2">GRADE</th>
                  <th className="border border-black px-1 py-0.5 text-center font-bold text-[8px]" rowSpan="2">REMARKS</th>
                </tr>
                <tr className="bg-gray-200">
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">CA<br/>40</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">EXAM<br/>60</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">TOTAL<br/>100</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-1 py-0.5 font-bold bg-gray-100 text-[8px]">SUBJECTS</td>
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
                      <td className="border border-black px-1 py-0.5 text-[7px]">{subject.name}</td>
                      <td className="border border-black px-1 py-0.5 text-center text-[7px]">{subject.ca}</td>
                      <td className="border border-black px-1 py-0.5 text-center text-[7px]">{subject.exam}</td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold text-[7px]">{subject.total}</td>
                      <td className="border border-black px-1 py-0.5 text-center font-bold text-[7px]">{grade}</td>
                      <td className="border border-black px-1 py-0.5 text-center text-[7px]">{remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Performance Summary */}
            <div className="mt-2 ">
               <table className="w-full border-2 border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black px-1 py-0.5 font-bold text-[8px]" colSpan="4">PERFORMANCE SUMMARY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-1 py-0.5 font-bold text-[7px]">Total Obtained:</td>
                    <td className="border border-black px-1 py-0.5 text-center text-[7px]">{performance.total}</td>
                    <td className="border border-black px-1 py-0.5 font-bold text-[7px]">Total Obtainable:</td>
                    <td className="border border-black px-1 py-0.5 text-center text-[7px]">{performance.obtainable}</td>
                  </tr>
                  <tr>
                    <td className="border border-black px-1 py-0.5 font-bold text-[7px]" colSpan="2">GRADE:</td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold text-[7px]" colSpan="2">{performance.grade}</td>
                  </tr>
                  <tr>
                    <td className="border border-black px-1 py-0.5 font-bold text-[7px]" colSpan="2">REMARK:</td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold text-[7px]" colSpan="2">{performance.remark}</td>
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
          <div className="col-span-2 space-y-1">
            {/* Attendance Summary */}
            <div className="">
              <div className="bg-gray-200 border-1 border-black px-1 py-0.5 text-center font-bold text-[8px]">
                ATTENDANCE SUMMARY
              </div>
              <table className="w-full text-[7px]">
                <tbody>
                  <tr>
                    <td className="border border-black px-1 py-0.5 text-[7px]">No of Times School Opened</td>
                    <td className="border border-black px-1 py-0.5 text-center text-[7px]">{data.noOfTimesSchoolOpened}</td>
                  </tr>
                  <tr>
                    <td className="border border-black px-1 py-0.5 text-[7px]">No of Times Present</td>
                    <td className="border border-black px-1 py-0.5 text-center text-[7px]">{data.noOfTimesPresent}</td>
                  </tr>
                  <tr>
                    <td className="border border-black px-1 py-0.5 text-[7px]">No of Times Absent</td>
                    <td className="border border-black px-1 py-0.5 text-center text-[7px]">{data.noOfTimesAbsent}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Affective Domain */}
            <div className="mt-2">
              <div className="bg-gray-200 border-b-2 border-black px-1 py-0.5 text-center font-bold text-[8px]">
                AFFECTIVE DOMAIN
              </div>
              <table className="w-full text-[7px]" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-1 py-0.5 text-[7px]"></th>
                    <th className="border border-black px-1 py-0.5 text-center text-[7px]">1</th>
                    <th className="border border-black px-1 py-0.5 text-center text-[7px]">2</th>
                    <th className="border border-black px-1 py-0.5 text-center text-[7px]">3</th>
                    <th className="border border-black px-1 py-0.5 text-center text-[7px]">4</th>
                    <th className="border border-black px-1 py-0.5 text-center text-[7px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.affectiveDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black px-1 py-0.5 text-[6px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black px-1 py-0.5 text-center text-[7px]">
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
        <div className="mt-1 grid grid-cols-3 gap-2">
          {/* Psychomotor Domain */}
          <div className="">
            <div className="bg-gray-200 border-b-2 border-black px-1 py-0.5 text-center font-bold text-[8px]">
              PSYCHOMOTOR DOMAIN
            </div>
            <table className="w-full text-[7px]" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '50%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-1 py-0.5 text-[7px]"></th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">1</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">2</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">3</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">4</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">5</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.psychomotorDomain || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border border-black px-1 py-0.5 text-[6px]">{key}</td>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <td key={rating} className="border border-black px-1 py-0.5 text-center text-[7px]">
                        {value == rating ? '✓' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grade Summary */}
          <div className="">
            <div className="bg-gray-200 border-b-2 border-black px-1 py-0.5 text-center font-bold text-[8px]">
              GRADE SUMMARY
            </div>
            <table className="w-full text-[7px]" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '12.5%' }} />
                <col style={{ width: '12.5%' }} />
                <col style={{ width: '12.5%' }} />
                <col style={{ width: '12.5%' }} />
                <col style={{ width: '12.5%' }} />
                <col style={{ width: '12.5%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="border border-black px-1 py-0.5 text-[7px]">GRADE</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">A</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">B</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">C</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">D</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">E</th>
                  <th className="border border-black px-1 py-0.5 text-center text-[7px]">F</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-1 py-0.5 text-[7px]">NO</td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                  <td className="border border-black px-1 py-0.5 text-center text-[7px]"></td>
                </tr>
                <tr>
                  <td className="border border-black px-1 py-0.5 text-[7px] font-bold" colSpan="3">TOTAL SUBJECTS OFFERED</td>
                  <td className="border border-black px-1 py-0.5 text-center font-bold text-[7px]" colSpan="4">{subjectsWithGrades.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher and Principal Remarks */}
        <div className="mt-1 space-y-1 text-[8px]">
          <div className="border-2 border-gray-400">
            <div className="flex">
              <span className="font-bold px-1 py-1 border-r-2 border-black w-32 text-[7px]">Teacher's Remark:</span>
              <span className="px-1 py-1 flex-1 italic text-[7px]">{data.teacherRemark}</span>
            </div>
          </div>

          <div className="flex gap-4 text-[7px]">
            <div className="flex-1">
              <span className="font-bold">Teacher's Name:</span>
              <span className="ml-2 border-b-2 border-black pb-1 inline-block">{data.teacherName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32 pb-1">&nbsp;</span>
            </div>
          </div>

          <div className="border-2 border-gray-400">
            <div className="flex">
              <span className="font-bold px-1 py-1 border-r-2 border-black w-32 text-[7px]">Principal's Remark:</span>
              <span className="px-1 py-1 flex-1 italic text-[7px]">{data.principalRemark}</span>
            </div>
          </div>

          <div className="flex gap-4 text-[7px]">
            <div className="flex-1">
              <span className="font-bold">Principal's Name:</span>
              <span className="ml-2 border-b-2 border-black pb-1 inline-block">{data.principalName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32 pb-1">&nbsp;</span>
            </div>
          </div>

          <div className="flex gap-4 mt-1 text-[7px]">
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
        <div className="mt-1 text-right text-[7px] italic">
          <p>{school?.school_name?.toUpperCase() || 'SCHOOL NAME'} © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
