import { useState } from 'react';
import StudentForm from './components/StudentForm';
import ReportCard from './components/ReportCard';

function App() {
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const handleFormSubmit = (data) => {
    setReportData(data);
    setShowReport(true);
  };

  const handleBackToForm = () => {
    setShowReport(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className=" mx-auto px-4">
        {!showReport ? (
          <StudentForm onSubmit={handleFormSubmit} />
        ) : (
          <div>
            <div className="mb-6 print:hidden text-center">
              <button
                onClick={handleBackToForm}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold shadow-md"
              >
                ← Back to Form
              </button>
            </div>
            <ReportCard data={reportData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
