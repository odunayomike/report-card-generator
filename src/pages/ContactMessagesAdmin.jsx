import { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Calendar, Check, X, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { useToastContext } from '../context/ToastContext';

export default function ContactMessagesAdmin() {
  const { toast } = useToastContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sent, pending
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchMessages();
  }, [filter, pagination.page]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/super-admin/get-contact-messages?status=${filter}&page=${pagination.page}&limit=${pagination.limit}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages
        }));
      } else {
        toast.error(data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectLabel = (subject) => {
    const subjects = {
      sales: 'Sales Inquiry',
      support: 'Technical Support',
      billing: 'Billing Question',
      feature: 'Feature Request',
      other: 'Other'
    };
    return subjects[subject] || subject;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            View and manage all contact form submissions
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Messages ({pagination.total})</option>
            <option value="pending">Pending Email</option>
            <option value="sent">Email Sent</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'No contact form submissions yet'
              : `No ${filter} messages`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(message.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{message.name}</div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {message.email}
                        </div>
                        {message.phone && message.phone !== 'Not provided' && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {message.phone}
                          </div>
                        )}
                        {message.school_name && message.school_name !== 'Not provided' && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {message.school_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getSubjectLabel(message.subject)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.email_sent == 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <Check className="w-3 h-3" />
                          Email Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <X className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(message);
                        }}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Details</h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedMessage.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-base text-gray-900 mt-1">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-base text-gray-900 mt-1">
                      <a href={`mailto:${selectedMessage.email}`} className="text-primary-600 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  {selectedMessage.phone && selectedMessage.phone !== 'Not provided' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base text-gray-900 mt-1">
                        <a href={`tel:${selectedMessage.phone}`} className="text-primary-600 hover:underline">
                          {selectedMessage.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedMessage.school_name && selectedMessage.school_name !== 'Not provided' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">School</label>
                      <p className="text-base text-gray-900 mt-1">{selectedMessage.school_name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-base text-gray-900 mt-1">{getSubjectLabel(selectedMessage.subject)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-base text-gray-900 mt-1">{selectedMessage.ip_address || 'Unknown'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email Status</label>
                  <p className="mt-1">
                    {selectedMessage.email_sent == 1 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        <Check className="w-4 h-4" />
                        Email Sent Successfully
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <X className="w-4 h-4" />
                        Email Sending Failed - Message Stored in Database
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${getSubjectLabel(selectedMessage.subject)}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
