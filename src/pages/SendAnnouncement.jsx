import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/env';
import { School, Users, DollarSign, FileText } from 'lucide-react';

export default function SendAnnouncement() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'all', // 'all' or 'specific'
    selectedParent: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sendResult, setSendResult] = useState(null);
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Fetch all parents when component mounts
  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const response = await fetch(`${API_BASE_URL}/parent/get-all-parents`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setParents(data.parents || []);
      }
    } catch (err) {
      console.error('Failed to fetch parents:', err);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setSendResult(null);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
      };

      // If sending to specific parent, add parent_id
      if (formData.recipientType === 'specific') {
        if (!formData.selectedParent) {
          setError('Please select a parent to send to');
          setLoading(false);
          return;
        }
        payload.parent_id = formData.selectedParent;
      }

      const response = await fetch(`${API_BASE_URL}/parent/notifications/send-announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setSendResult({
          sent: data.sent_count || 0,
          failed: data.failed_count || 0,
        });
        // Reset form
        setFormData({
          title: '',
          message: '',
          recipientType: 'all',
          selectedParent: ''
        });
        setSearchTerm('');
      } else {
        setError(data.message || 'Failed to send announcement');
      }
    } catch (err) {
      setError('An error occurred while sending the announcement');
      console.error('Send announcement error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const useTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
    });
  };

  // Filter parents based on search term
  const filteredParents = parents.filter(parent =>
    (parent.full_name && parent.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected parent details
  const selectedParentDetails = parents.find(p => p.id === parseInt(formData.selectedParent));

  const templates = [
    {
      title: 'School Closure Notice',
      message: 'Dear Parents,\n\nPlease be informed that the school will be closed on [DATE] due to [REASON]. Regular classes will resume on [DATE].\n\nThank you for your understanding.',
      icon: School,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Parent-Teacher Meeting',
      message: 'Dear Parents,\n\nYou are invited to our Parent-Teacher Meeting scheduled for [DATE] at [TIME]. We look forward to discussing your child\'s progress.\n\nKindly confirm your attendance.',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Fee Payment Reminder',
      message: 'Dear Parents,\n\nThis is a reminder that school fees for the current term are due by [DATE]. Please ensure payment is made to avoid any inconvenience.\n\nThank you for your cooperation.',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Report Cards Available',
      message: 'Dear Parents,\n\nReport cards for the current term are now available in the parent app. Please log in to view your child\'s academic progress.\n\nBest regards,\nSchool Management',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white p-4 h-[calc(100vh-64px)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Announcement to Parents</h1>
              <p className="text-sm text-gray-600">Broadcast messages or send to specific parents</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && sendResult && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-3 mb-3 animate-fadeIn">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900">Announcement sent successfully!</p>
                <p className="text-sm text-green-800">
                  Delivered to <span className="font-bold">{sendResult.sent}</span> parent(s)
                  {sendResult.failed > 0 && <span className="text-red-600 ml-2">({sendResult.failed} failed)</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-3 mb-3 animate-fadeIn">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 rounded-t-xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Compose Announcement
                </h2>
              </div>

              {/* Card Body */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Recipient Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Send To</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, recipientType: 'all', selectedParent: '' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.recipientType === 'all'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          formData.recipientType === 'all' ? 'bg-primary-500' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${formData.recipientType === 'all' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold text-sm ${formData.recipientType === 'all' ? 'text-primary-700' : 'text-gray-700'}`}>All Parents</p>
                          <p className="text-xs text-gray-500">Broadcast to everyone</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, recipientType: 'specific' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.recipientType === 'specific'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          formData.recipientType === 'specific' ? 'bg-primary-500' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${formData.recipientType === 'specific' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold text-sm ${formData.recipientType === 'specific' ? 'text-primary-700' : 'text-gray-700'}`}>Specific Parent</p>
                          <p className="text-xs text-gray-500">Choose recipient</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Parent Selector with Search */}
                {formData.recipientType === 'specific' && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Parent <span className="text-red-500">*</span>
                    </label>
                    {loadingParents ? (
                      <div className="flex items-center justify-center py-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setShowParentDropdown(true);
                            }}
                            onFocus={() => setShowParentDropdown(true)}
                            placeholder="Search parent by name or email..."
                            className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>

                        {/* Selected Parent Display */}
                        {selectedParentDetails && !showParentDropdown && (
                          <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {selectedParentDetails.full_name ? selectedParentDetails.full_name.charAt(0) : 'P'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{selectedParentDetails.full_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-600">{selectedParentDetails.email || 'No email'}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, selectedParent: '' });
                                setSearchTerm('');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Dropdown List */}
                        {showParentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                            {filteredParents.length > 0 ? (
                              filteredParents.map((parent) => (
                                <button
                                  type="button"
                                  key={parent.id}
                                  onClick={() => {
                                    setFormData({ ...formData, selectedParent: parent.id.toString() });
                                    setSearchTerm(parent.full_name);
                                    setShowParentDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <p className="font-semibold text-sm text-gray-900">{parent.full_name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-600">{parent.email || 'No email'} • {parent.children_count || 0} child(ren)</p>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-sm text-gray-500">
                                No parents found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {parents.length === 0 && !loadingParents && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        No parents found. Please add parents first.
                      </p>
                    )}
                  </div>
                )}

                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g., School Closure Notice"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{formData.title.length}/100</p>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    maxLength={500}
                    placeholder="Write your announcement message here..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{formData.message.length}/500</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !formData.title || !formData.message}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Announcement
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ title: '', message: '', recipientType: 'all', selectedParent: '' });
                      setSearchTerm('');
                      setError('');
                      setSuccess(false);
                      setSendResult(null);
                    }}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Templates Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Templates Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 rounded-t-xl">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Quick Templates
                </h3>
                <p className="text-primary-100 text-xs mt-1">Click to use</p>
              </div>

              {/* Templates List */}
              <div className="p-3 space-y-2">
                {templates.map((template, index) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => useTemplate(template)}
                      className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 ${template.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${template.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 transition-colors">
                            {template.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {template.message.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info Footer */}
              <div className="bg-gradient-to-br from-blue-50 to-primary-50 border-t border-gray-200 p-3 rounded-b-xl">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-gray-700">
                    <p className="font-semibold text-primary-900">How it works</p>
                    <ul className="mt-1 space-y-0.5 text-gray-600">
                      <li>• Stored in parent app</li>
                      <li>• Push notification sent</li>
                      <li>• Instant delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
