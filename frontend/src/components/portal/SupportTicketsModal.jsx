import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  HelpCircle, Plus, ClipboardList, CheckCircle2, 
  Clock, AlertTriangle, X, Send, Paperclip, 
  MessageSquare, Star, ChevronRight, ShieldCheck 
} from 'lucide-react';

const CATEGORIES = [
  'Hardware & Gateway',
  'Sensor Offline Signal',
  'Calibration Certificate',
  'Temperature & Humidity Deviation',
  'Threshold & Alert Configuration',
  'General Technical Query'
];

const PRIORITIES = [
  { id: 'Low', label: 'Low (Within 48 hrs)', color: 'text-gray-600 bg-gray-100' },
  { id: 'Medium', label: 'Medium (Within 24 hrs)', color: 'text-blue-700 bg-blue-100' },
  { id: 'High', label: 'High (Immediate / 4 hrs)', color: 'text-amber-700 bg-amber-100' },
  { id: 'Critical', label: 'Critical (Cold Chain Breach)', color: 'text-red-700 bg-red-100' },
];

const SupportTicketsModal = ({ isOpen, onClose, meterId = 225, meterName = 'Temp' }) => {
  const [activeTab, setActiveTab] = useState('raise'); // 'raise', 'track'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'in-progress', 'closed'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  // Closing & Feedback Modal state
  const [closingTicket, setClosingTicket] = useState(null);
  const [rating1, setRating1] = useState(5);
  const [rating2, setRating2] = useState(5);
  const [rating3, setRating3] = useState(5);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/tickets');
      if (res && res.list_of_complaints) {
        setTickets(res.list_of_complaints);
      }
    } catch (err) {
      console.warn('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!subject.trim() || !description.trim()) {
      setErrorMessage('Please fill all the fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject,
        category,
        priority,
        meter_id: meterId,
        meter_name: meterName,
        description
      };
      const res = await api.post('/users/me/tickets', payload);
      setSuccessMessage('Complaint Registered Successfully!!');
      setSubject('');
      setDescription('');
      setFileName('');
      fetchTickets();
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('track');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Error submitting complaint. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicketSubmit = async () => {
    if (!closingTicket) return;
    try {
      await api.patch(`/users/me/tickets/${closingTicket.ticket_number}/close`, {
        satisfaction_rating: {
          solution: rating1,
          responseSpeed: rating2,
          easeOfSupport: rating3
        }
      });
      setClosingTicket(null);
      fetchTickets();
    } catch (err) {
      alert('Failed to close ticket');
    }
  };

  if (!isOpen) return null;

  const charsLeft = 500 - description.length;

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'open') return t.status.toLowerCase() === 'open';
    if (statusFilter === 'in-progress') return t.status.toLowerCase().includes('progress');
    if (statusFilter === 'closed') return t.status.toLowerCase() === 'closed' || t.status.toLowerCase() === 'resolved';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-primary-600 flex items-center justify-center shadow-2xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Support Desk & Complaints Portal</h3>
              <p className="text-xs text-gray-500">
                Mew Technical Support • Node #{meterId} ({meterName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('raise')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'raise'
                ? 'bg-navy-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Raise Support Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'track'
                ? 'bg-navy-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Track My Tickets ({tickets.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              {errorMessage}
            </div>
          )}

          {/* TAB 1: RAISE TICKET FORM */}
          {activeTab === 'raise' && (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ticket Subject / Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Gateway Offline Signal in Server Room Section 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Describe your issue *
                  </label>
                  <span className={`text-[10px] font-mono ${charsLeft <= 50 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                    {charsLeft <= 50 ? `You have only last ${charsLeft} chars left` : `${charsLeft} chars remaining`}
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specifics: observed readings, physical inspection status, power supply check..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Upload File trigger */}
              <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span>{fileName || 'Attach diagnostics log, calibration report or photo (optional)'}</span>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                    }}
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-navy-700 to-primary-600 text-white rounded-xl text-xs font-bold hover:from-navy-800 hover:to-primary-700 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Raise Ticket'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TRACK TICKETS VIEW */}
          {activeTab === 'track' && (
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Tickets' },
                  { id: 'open', label: 'Open Tickets' },
                  { id: 'in-progress', label: 'In-Progress' },
                  { id: 'closed', label: 'Closed Tickets' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === f.id
                        ? 'bg-navy-800 text-white font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-500">Loading tickets...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                  No tickets found in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map(t => {
                    const isOpenStatus = t.status.toLowerCase() === 'open';
                    const isInProgress = t.status.toLowerCase().includes('progress');
                    const isClosed = t.status.toLowerCase() === 'closed' || t.status.toLowerCase() === 'resolved';

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-primary-700 bg-blue-50 px-2 py-0.5 rounded">
                                {t.ticket_number || t.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOpenStatus
                                  ? 'bg-amber-100 text-amber-800'
                                  : isInProgress
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {t.status}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold uppercase">
                                {t.priority} Priority
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 mt-1">
                              {t.subject}
                            </h4>
                          </div>

                          {!isClosed && (
                            <button
                              onClick={() => setClosingTicket(t)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
                            >
                              Close Ticket
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {t.description}
                        </p>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                          <span>Category: <strong className="text-gray-600">{t.category}</strong></span>
                          <span>Logged: {t.created_at}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FEEDBACK & CLOSURE MODAL (3 Satisfaction Questions) */}
        {closingTicket && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-sm font-bold text-gray-900">Close Ticket & Share Feedback</h4>
                <button onClick={() => setClosingTicket(null)} className="text-gray-400">&times;</button>
              </div>

              <p className="text-xs text-gray-500">
                Ticket <strong className="text-gray-800">{closingTicket.ticket_number}</strong> will be marked as Resolved. Please rate our service:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">
                    1. How satisfied are you with the final solution provided?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating1(star)}
                        className={`p-1.5 rounded-lg border text-xs font-bold ${rating1 >= star ? 'bg-amber-400 text-white' : 'border-gray-200 text-gray-400'}`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-1">
                    2. How quickly did our support team respond and handle your issue?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating2(star)}
                        className={`p-1.5 rounded-lg border text-xs font-bold ${rating2 >= star ? 'bg-amber-400 text-white' : 'border-gray-200 text-gray-400'}`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-1">
                    3. How easy was it to get support from us?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating3(star)}
                        className={`p-1.5 rounded-lg border text-xs font-bold ${rating3 >= star ? 'bg-amber-400 text-white' : 'border-gray-200 text-gray-400'}`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setClosingTicket(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCloseTicketSubmit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700"
                >
                  Confirm Closure
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsModal;
