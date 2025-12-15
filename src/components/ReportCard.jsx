import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function ReportCard({ data }) {
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

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: [10, 10, 10, 10], // top, right, bottom, left in mm
      filename: `Report_Card_${data.name || 'Student'}_${data.session || ''}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
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

      <div ref={reportRef} className="bg-white p-4 border-4 border-black report-card-pdf" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2 pb-2 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">LOGO</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">BAILEY'S BOWEN COLLEGE</h1>
              <p className="text-xs mt-1">No 14 Davis Cole Crescent, Pineville Estate, Sunrise, Lagos State.</p>
              <p className="text-xs">TEL: 08115414915, 07034552256, Email: baileysbowencollege@gmail.com</p>
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
        <div className="text-center mb-2 pb-2 border-b-2 border-black">
          <h2 className="text-sm font-bold">{data.term?.toUpperCase()} STUDENT'S PERFORMANCE REPORT</h2>
        </div>

        {/* Student Information Grid */}
        <div className="grid grid-cols-2 gap-x-8 text-xs mb-2 pb-2 border-b-2 border-black">
          <div className="space-y-1">
            <div className="flex">
              <span className="font-bold w-32">NAME:</span>
              <span className="flex-1 border-b border-black">{data.name?.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">CLASS:</span>
              <span className="flex-1 border-b border-black">{data.class}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">AGE:</span>
              <span className="flex-1 border-b border-black">{data.age || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">CLUB/SOCIETY:</span>
              <span className="flex-1 border-b border-black">{data.clubSociety}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="font-bold w-32">GENDER:</span>
              <span className="flex-1 border-b border-black">{data.gender}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">SESSION:</span>
              <span className="flex-1 border-b border-black">{data.session}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">ADMISSION NO.:</span>
              <span className="flex-1 border-b border-black">{data.admissionNo}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">HT:</span>
              <span className="w-20 border-b border-black">{data.height}</span>
              <span className="font-bold w-24 ml-2">WT:</span>
              <span className="w-20 border-b border-black">{data.weight}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">FAV. COL:</span>
              <span className="flex-1 border-b border-black">{data.favCol}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left Column - Cognitive Domain */}
          <div className="col-span-2">
            <table className="w-full border-2 border-black text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">COGNITIVE DOMAIN</th>
                  <th className="border border-black p-1 text-center font-bold" colSpan="3">SCORE</th>
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">GRADE</th>
                  <th className="border border-black p-1 text-center font-bold" rowSpan="2">REMARKS</th>
                </tr>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 text-center text-[10px]">CA<br/>40</th>
                  <th className="border border-black p-1 text-center text-[10px]">EXAM<br/>60</th>
                  <th className="border border-black p-1 text-center text-[10px]">TOTAL<br/>100</th>
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
                      <td className="border border-black p-1 text-[10px]">{subject.name}</td>
                      <td className="border border-black p-1 text-center">{subject.ca}</td>
                      <td className="border border-black p-1 text-center">{subject.exam}</td>
                      <td className="border border-black p-1 text-center font-bold">{subject.total}</td>
                      <td className="border border-black p-1 text-center font-bold">{grade}</td>
                      <td className="border border-black p-1 text-center text-[10px]">{remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Performance Summary */}
            <div className="mt-2 border-2 border-black">
              <table className="w-full text-xs">
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
                    <td className="border border-black p-1 text-center font-bold text-lg" colSpan="2">{performance.grade}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold" colSpan="2">REMARK:</td>
                    <td className="border border-black p-1 text-center font-bold" colSpan="2">{performance.remark}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grading Scale */}
            <div className="mt-4 text-[10px] leading-tight">
              <p><strong>70-100%=EXCELLENT; 60-69.9%=VERY GOOD; 50-59.9%=GOOD; 40-</strong></p>
              <p><strong>49.9%=AVERAGE; 30-39.9%=FAIR; 0-29.9%=POOR</strong></p>
            </div>
          </div>

          {/* Right Column - Attendance, Affective, and Psychomotor */}
          <div className="space-y-4">
            {/* Attendance Summary */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                ATTENDANCE SUMMARY
              </div>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="border border-black p-1 text-[10px]">No of Times School Opened</td>
                    <td className="border border-black p-1 text-center">{data.noOfTimesSchoolOpened}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-[10px]">No of Times Present</td>
                    <td className="border border-black p-1 text-center">{data.noOfTimesPresent}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-[10px]">No of Times Absent</td>
                    <td className="border border-black p-1 text-center">{data.noOfTimesAbsent}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Affective Domain */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                AFFECTIVE DOMAIN
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-[10px]"></th>
                    <th className="border border-black p-1 text-center text-[10px]">1</th>
                    <th className="border border-black p-1 text-center text-[10px]">2</th>
                    <th className="border border-black p-1 text-center text-[10px]">3</th>
                    <th className="border border-black p-1 text-center text-[10px]">4</th>
                    <th className="border border-black p-1 text-center text-[10px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.affectiveDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black p-1 text-[9px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black p-1 text-center text-[10px]">
                          {value == rating ? '✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Psychomotor Domain */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                PSYCHOMOTOR DOMAIN
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-[10px]"></th>
                    <th className="border border-black p-1 text-center text-[10px]">1</th>
                    <th className="border border-black p-1 text-center text-[10px]">2</th>
                    <th className="border border-black p-1 text-center text-[10px]">3</th>
                    <th className="border border-black p-1 text-center text-[10px]">4</th>
                    <th className="border border-black p-1 text-center text-[10px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.psychomotorDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black p-1 text-[9px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black p-1 text-center text-[10px]">
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
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                Rating Indices
              </div>
              <div className="p-2 text-[9px] leading-tight">
                <p>1 - Maintains a high level of Observable traits.</p>
                <p>2 - Observable traits.</p>
                <p>3 - Maintaining a high level of Observable traits.</p>
                <p>4 - Shows Minimal regard for Observable traits.</p>
                <p>5 - Has No regard for Observable traits.</p>
              </div>
            </div>

            {/* Grade Summary */}
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                GRADE SUMMARY
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="border border-black p-1 text-[10px]">GRADE</th>
                    <th className="border border-black p-1 text-center text-[10px]">A</th>
                    <th className="border border-black p-1 text-center text-[10px]">B</th>
                    <th className="border border-black p-1 text-center text-[10px]">C</th>
                    <th className="border border-black p-1 text-center text-[10px]">D</th>
                    <th className="border border-black p-1 text-center text-[10px]">E</th>
                    <th className="border border-black p-1 text-center text-[10px]">F</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1 text-[10px]">NO</td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1 text-center"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-[10px] font-bold" colSpan="3">TOTAL SUBJECTS OFFERED</td>
                    <td className="border border-black p-1 text-center font-bold" colSpan="4">{subjectsWithGrades.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Teacher and Principal Remarks */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="border-2 border-black">
            <div className="flex">
              <span className="font-bold p-2 border-r-2 border-black w-32">Teacher's Remark:</span>
              <span className="p-2 flex-1 italic">{data.teacherRemark}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <span className="font-bold">Teacher's Name:</span>
              <span className="ml-2 border-b-2 border-black">{data.teacherName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32"></span>
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
              <span className="ml-2 border-b-2 border-black">{data.principalName?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Sign:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32"></span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <span className="font-bold">Next Term Begins:</span>
              <span className="ml-2 border-b-2 border-black">{data.nextTermBegins}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold">Date:</span>
              <span className="ml-2 border-b-2 border-black inline-block w-32"></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-right text-xs italic">
          <p>BAILEY'S BOWEN BRDA. © 2019</p>
        </div>
      </div>
    </div>
  );
}
