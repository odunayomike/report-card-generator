import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReportCard from '../components/ReportCard';
import { getReportCard } from '../services/api';

export default function ViewReport({ school }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getReportCard(id);
      if (response.success) {
        setReportData(response.data);
      } else {
        alert('Error loading report: ' + response.message);
        navigate('/dashboard/students');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load report. Please try again.');
      navigate('/dashboard/students');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      setIsGeneratingPDF(true);

      // Get actual dimensions - 210mm x 297mm at 96 DPI
      const mmToPx = 3.7795275591; // 1mm = 3.78 pixels at 96 DPI
      const a4Width = 210 * mmToPx; // ~794px
      const a4Height = 297 * mmToPx; // ~1123px

      // Capture the report card as canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Good quality without being too large
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: a4Width,
        height: a4Height,
        windowWidth: a4Width,
        windowHeight: a4Height
      });

      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Add image to fill entire A4 page
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      // Save PDF with filename
      const filename = `${reportData.studentName}_${reportData.term}_${reportData.session}_Report.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 print:hidden flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/students')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>

          <button
            onClick={() => navigate(`/dashboard/reports/${id}/edit`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Report
          </button>
        </div>
      </div>
      <div ref={reportRef} className="bg-white flex justify-center items-start" style={{ width: '210mm', margin: '0 auto' }}>
        <ReportCard data={reportData} school={school} hideButtons={true} />
      </div>
    </div>
  );
}
