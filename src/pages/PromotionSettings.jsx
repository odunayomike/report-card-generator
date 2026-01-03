import { useState, useEffect } from 'react';
import { Check, X, TrendingUp, Users, Award, Clock, Settings, History, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { useToastContext } from '../context/ToastContext';

const PromotionSettings = () => {
  const { toast } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const [settings, setSettings] = useState({
    promotion_threshold: 45,
    auto_promotion_enabled: true
  });

  const [classHierarchy, setClassHierarchy] = useState([]);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [stats, setStats] = useState({
    total_promotions: 0,
    promoted_count: 0,
    retained_count: 0,
    completed_count: 0
  });

  // Bulk promotion state
  const [bulkForm, setBulkForm] = useState({
    from_class: '',
    session: '',
    term: 'Third Term'
  });
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchPromotionHistory();
    fetchAvailableClasses();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/school/get-promotion-settings`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setClassHierarchy(data.class_hierarchy);
      } else {
        toast.error(data.message || 'Failed to load promotion settings');
      }
    } catch (error) {
      console.error('Error fetching promotion settings:', error);
      toast.error('Failed to load promotion settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotionHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/school/get-promotion-history`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setPromotionHistory(data.promotions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching promotion history:', error);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/school/get-classes`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setAvailableClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/school/update-promotion-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Promotion settings updated successfully');
        setSettings(data.settings);
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving promotion settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkPreview = async () => {
    if (!bulkForm.from_class || !bulkForm.session || !bulkForm.term) {
      toast.error('Please select class, session, and term');
      return;
    }

    try {
      setBulkProcessing(true);
      const response = await fetch(`${API_BASE_URL}/school/bulk-promote-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          from_class: bulkForm.from_class,
          session: bulkForm.session,
          term: bulkForm.term,
          preview_only: true
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server error response:', text);
        toast.error('Server error. Check browser console for details.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setBulkPreview(data);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to preview promotions');
      }
    } catch (error) {
      console.error('Error previewing bulk promotions:', error);
      toast.error('Failed to preview promotions');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkExecute = async () => {
    if (!bulkPreview) {
      toast.error('Please preview promotions first');
      return;
    }

    try {
      setBulkProcessing(true);
      const response = await fetch(`${API_BASE_URL}/school/bulk-promote-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          from_class: bulkForm.from_class,
          session: bulkForm.session,
          term: bulkForm.term,
          preview_only: false
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setBulkPreview(null);
        setBulkForm({ from_class: '', session: '', term: 'Third Term' });
        fetchPromotionHistory();
      } else {
        toast.error(data.message || 'Failed to execute promotions');
      }
    } catch (error) {
      console.error('Error executing bulk promotions:', error);
      toast.error('Failed to execute promotions');
    } finally {
      setBulkProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'promoted':
        return 'bg-green-100 text-green-800';
      case 'retained':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Primary':
        return 'bg-purple-50 border-purple-200';
      case 'Junior Secondary':
        return 'bg-blue-50 border-blue-200';
      case 'Senior Secondary':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotion settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                Student Promotion System
              </h1>
              <p className="text-gray-600 mt-1">
                Configure automatic promotion rules and view promotion history
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_promotions}</p>
              </div>
              <Users className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promoted</p>
                <p className="text-2xl font-bold text-green-600">{stats.promoted_count}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retained</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.retained_count}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graduated</p>
                <p className="text-2xl font-bold text-primary-600">{stats.completed_count}</p>
              </div>
              <Award className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline-block mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'hierarchy'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline-block mr-2" />
                Class Hierarchy
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bulk'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="w-4 h-4 inline-block mr-2" />
                Bulk Promotion
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="w-4 h-4 inline-block mr-2" />
                Promotion History
              </button>
            </div>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Promotion Configuration</h2>

                {/* Auto Promotion Toggle */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-900">
                        Automatic Promotion
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatically promote students when Third Term reports are saved
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          auto_promotion_enabled: !settings.auto_promotion_enabled
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.auto_promotion_enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.auto_promotion_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Promotion Threshold */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Promotion Threshold (%)
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Minimum average score required for promotion to next class
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={settings.promotion_threshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          promotion_threshold: parseFloat(e.target.value)
                        })
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.promotion_threshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          promotion_threshold: parseFloat(e.target.value)
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-primary-900 mb-2">How It Works</h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Promotion is checked only for <strong>Third Term</strong> report cards</li>
                    <li>• Student's average score is calculated from all subjects</li>
                    <li>• If average ≥ {settings.promotion_threshold}%, student is promoted to next class</li>
                    <li>• If average &lt; {settings.promotion_threshold}%, student is retained</li>
                    <li>• Terminal class (SSS 3) students are marked as graduated</li>
                  </ul>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Class Hierarchy Tab */}
          {activeTab === 'hierarchy' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Progression Hierarchy</h2>
              <p className="text-sm text-gray-600 mb-6">
                This shows how students progress through classes when promoted
              </p>

              <div className="space-y-4">
                {['Primary', 'Junior Secondary', 'Senior Secondary'].map((category) => {
                  const classes = classHierarchy.filter((c) => c.class_category === category);

                  return (
                    <div key={category} className={`border rounded-lg p-4 ${getCategoryColor(category)}`}>
                      <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {classes.map((cls, index) => (
                          <div key={cls.id} className="flex items-center">
                            <div className="bg-white px-4 py-2 rounded-lg border-2 border-gray-300 font-medium text-sm">
                              {cls.class_name}
                              {cls.is_terminal === 1 && (
                                <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                                  Final
                                </span>
                              )}
                            </div>
                            {index < classes.length - 1 && !classes[index + 1].is_terminal && (
                              <TrendingUp className="w-5 h-5 text-gray-400 mx-2" />
                            )}
                            {cls.next_class && cls.next_class !== classes[index + 1]?.class_name && (
                              <>
                                <TrendingUp className="w-5 h-5 text-primary-600 mx-2" />
                                <div className="text-sm text-gray-600 italic">
                                  → {cls.next_class}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bulk Promotion Tab */}
          {activeTab === 'bulk' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Promote Students</h2>
              <p className="text-sm text-gray-600 mb-6">
                Promote all students in a class at once based on their Third Term report cards
              </p>

              {/* Selection Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      value={bulkForm.from_class}
                      onChange={(e) => {
                        setBulkForm({ ...bulkForm, from_class: e.target.value });
                        setBulkPreview(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Class</option>
                      {[...new Set(availableClasses.map(c => c.class_name))].map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session
                    </label>
                    <select
                      value={bulkForm.session}
                      onChange={(e) => {
                        setBulkForm({ ...bulkForm, session: e.target.value });
                        setBulkPreview(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Session</option>
                      {[...new Set(availableClasses.map(c => c.session))].map((session) => (
                        <option key={session} value={session}>
                          {session}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term
                    </label>
                    <select
                      value={bulkForm.term}
                      onChange={(e) => {
                        setBulkForm({ ...bulkForm, term: e.target.value });
                        setBulkPreview(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleBulkPreview}
                    disabled={bulkProcessing || !bulkForm.from_class || !bulkForm.session || !bulkForm.term}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bulkProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Preview Promotions
                      </>
                    )}
                  </button>

                  {bulkPreview && (
                    <button
                      onClick={handleBulkExecute}
                      disabled={bulkProcessing}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Execute Promotions
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Results */}
              {bulkPreview && (
                <div>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{bulkPreview.summary.total}</p>
                    </div>
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Will Be Promoted</p>
                      <p className="text-2xl font-bold text-green-600">{bulkPreview.summary.promoted}</p>
                    </div>
                    <div className="bg-white border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Will Be Retained</p>
                      <p className="text-2xl font-bold text-yellow-600">{bulkPreview.summary.retained}</p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Will Graduate</p>
                      <p className="text-2xl font-bold text-blue-600">{bulkPreview.summary.completed}</p>
                    </div>
                  </div>

                  {/* Preview Message */}
                  {bulkPreview.preview_mode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Preview Mode:</strong> No changes have been made yet. Review the results below and click "Execute Promotions" to apply changes.
                      </p>
                    </div>
                  )}

                  {/* Results Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              From Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              To Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Average Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bulkPreview.results.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{result.name}</div>
                                <div className="text-sm text-gray-500">{result.admission_no}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.from_class}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.to_class || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {result.average_score !== null ? `${result.average_score}%` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    result.action
                                  )}`}
                                >
                                  {result.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {result.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Info */}
              {!bulkPreview && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-medium text-primary-900 mb-2">How Bulk Promotion Works</h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Select the class, session, and term to promote from</li>
                    <li>• Only Third Term reports are eligible for promotion</li>
                    <li>• Preview shows which students will be promoted, retained, or graduated</li>
                    <li>• Students must meet the promotion threshold ({settings.promotion_threshold}%) to be promoted</li>
                    <li>• Terminal class students (SSS 3) will be marked as graduated</li>
                    <li>• Click "Execute Promotions" to apply the changes</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Promotions</h2>

              {promotionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No promotion history yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Promotions will appear here after Third Term reports are saved
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session/Term
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {promotionHistory.map((promotion) => (
                        <tr key={promotion.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {promotion.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {promotion.student_admission_no}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {promotion.from_class}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {promotion.to_class || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {promotion.session} / {promotion.term}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {promotion.average_score}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                promotion.promotion_status
                              )}`}
                            >
                              {promotion.promotion_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(promotion.promoted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionSettings;
