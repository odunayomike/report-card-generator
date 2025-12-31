import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/env';

export default function StudentImportModal({ isOpen, onClose, onImportComplete }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map/Preview, 3: Results
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Preview data
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [tempFile, setTempFile] = useState('');

  // Results
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('phase', 'preview');

    try {
      const response = await fetch(`${API_BASE_URL}/students/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setHeaders(data.headers);
        setMappings(data.mappings);
        setPreviewData(data.previewData);
        setTotalRows(data.totalRows);
        setTempFile(data.tempFile);
        setStep(2);
      } else {
        alert('Error: ' + (data.message || 'Upload failed'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleMappingChange = (columnIndex, fieldName) => {
    setMappings(prev => ({
      ...prev,
      [columnIndex]: fieldName
    }));
  };

  const handleImport = async () => {
    setImporting(true);

    const formData = new FormData();
    formData.append('phase', 'import');
    formData.append('tempFile', tempFile);
    formData.append('mappings', JSON.stringify(mappings));

    try {
      const response = await fetch(`${API_BASE_URL}/students/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setImportResults(data);
        setStep(3);
      } else {
        alert('Error: ' + (data.message || 'Import failed'));
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import students. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setMappings({});
    setPreviewData([]);
    setImportResults(null);
    onClose();
  };

  const handleComplete = () => {
    if (onImportComplete) {
      onImportComplete();
    }
    handleClose();
  };

  const downloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/students/download-template`;
  };

  const fieldOptions = [
    { value: null, label: '-- Skip Column --' },
    { value: 'admission_no', label: 'Admission No' },
    { value: 'name', label: 'Name (Required)' },
    { value: 'gender', label: 'Gender' },
    { value: 'class', label: 'Class' },
    { value: 'session', label: 'Session' },
    { value: 'term', label: 'Term' },
    { value: 'guardian_email', label: 'Guardian Email' },
    { value: 'height', label: 'Height' },
    { value: 'weight', label: 'Weight' },
    { value: 'club_society', label: 'Club/Society' },
    { value: 'fav_col', label: 'Favourite Color' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Students</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 && 'Upload your CSV file'}
              {step === 2 && 'Review and map columns'}
              {step === 3 && 'Import complete'}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Before you import:</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Prepare your data in CSV format</li>
                      <li>Our system will auto-detect your column names</li>
                      <li>You can review and adjust mappings before importing</li>
                      <li>Duplicate admission numbers will be skipped</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <Download className="w-4 h-4" />
                  Download Sample Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      Choose a CSV file
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">or drag and drop</p>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4" />
                      {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">File uploaded successfully!</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Found {totalRows} student record{totalRows !== 1 ? 's' : ''}. Review the column mappings below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          CSV Column
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Maps To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Preview
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {headers.map((header, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {header}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={mappings[index] || ''}
                              onChange={(e) => handleMappingChange(index, e.target.value || null)}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {fieldOptions.map(option => (
                                <option key={option.value || 'skip'} value={option.value || ''}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {previewData[0]?.[index] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Preview (First 5 rows):</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        {headers.map((header, idx) => (
                          <th key={idx} className="px-2 py-1 text-left font-medium text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-2 py-1 text-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && importResults && (
            <div className="space-y-6">
              <div className={`border rounded-lg p-6 ${
                importResults.imported > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className={`w-8 h-8 ${
                    importResults.imported > 0 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Import Complete!</h3>
                    <p className="text-sm text-gray-600 mt-1">Your student data has been processed</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Successfully Imported</p>
                    <p className="text-3xl font-bold text-green-600">{importResults.imported}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Skipped</p>
                    <p className="text-3xl font-bold text-yellow-600">{importResults.skipped}</p>
                  </div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResults.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                    {importResults.totalErrors > importResults.errors.length && (
                      <li className="text-red-600 font-medium">
                        ... and {importResults.totalErrors - importResults.errors.length} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            {step === 3 ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? 'Uploading...' : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? 'Importing...' : `Import ${totalRows} Student${totalRows !== 1 ? 's' : ''}`}
                </button>
              </>
            )}

            {step === 3 && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
