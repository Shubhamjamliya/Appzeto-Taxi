import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, ChevronRight, Headset, X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Ride Issue', 'Payment', 'Driver Behaviour', 'App Bug', 'Other'];

const STATUS_STYLES = {
  'Open':        'bg-orange-50 text-orange-600 border-orange-100',
  'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
  'Resolved':    'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const MOCK_TICKETS = [
  { id: 't1', subject: 'Driver took wrong route', category: 'Ride Issue',  status: 'Open',        updatedAt: '2 hr ago',   messages: 1 },
  { id: 't2', subject: 'Payment deducted twice',  category: 'Payment',     status: 'In Progress', updatedAt: 'Yesterday',  messages: 3 },
  { id: 't3', subject: 'App crashed on booking',  category: 'App Bug',     status: 'Resolved',    updatedAt: '3 days ago', messages: 5 },
];

const TABS = ['All', 'Open', 'Resolved'];

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets]       = useState(MOCK_TICKETS);
  const [activeTab, setActiveTab]   = useState('All');
  const [showForm, setShowForm]     = useState(false);
  const [subject, setSubject]       = useState('');
  const [category, setCategory]     = useState('');
  const [description, setDesc]      = useState('');
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = tickets.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Open') return t.status === 'Open' || t.status === 'In Progress';
    return t.status === 'Resolved';
  });

  const validate = () => {
    const e = {};
    if (!subject.trim())     e.subject = 'Subject is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const newTicket = {
      id: `t${Date.now()}`,
      subject: subject.trim(),
      category: category || 'Other',
      status: 'Open',
      updatedAt: 'Just now',
      messages: 0,
    };
    setTickets(prev => [newTicket, ...prev]);
    setSubject(''); setCategory(''); setDesc(''); setErrors({});
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans pb-12 relative overflow-hidden">
      <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-5 pt-10 pb-4 sticky top-0 z-20 border-b border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-[12px] border border-white/80 bg-white/90 flex items-center justify-center shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-slate-900" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">Help Center</p>
            <h1 className="text-[19px] font-black tracking-tight text-slate-900">Support Tickets</h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowForm(true)}
            className="w-9 h-9 bg-slate-900 rounded-[12px] flex items-center justify-center shadow-sm">
            <Plus size={16} className="text-white" strokeWidth={3} />
          </motion.button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-[14px]">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 pt-4 space-y-2.5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 bg-white/80 border border-white/80 rounded-3xl flex items-center justify-center">
              <Headset size={36} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-700">No tickets yet</p>
              <p className="text-[12px] font-bold text-slate-400 mt-1">Tap + to get help</p>
            </div>
          </div>
        )}

        {filtered.map((t, i) => (
          <motion.button key={t.id} type="button"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/support/ticket/${t.id}`, { state: { ticket: t } })}
            className="w-full text-left rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex items-center justify-center shrink-0">
              <Headset size={16} className="text-blue-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-black text-slate-900 leading-tight truncate flex-1">{t.subject}</p>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[t.status]}`}>{t.status}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1">{t.category} · {t.updatedAt}</p>
            </div>
            <ChevronRight size={15} className="text-slate-300 shrink-0 mt-1" strokeWidth={2.5} />
          </motion.button>
        ))}
      </div>

      {/* New ticket bottom sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[28px] px-5 pt-4 pb-10 z-[101] max-h-[85vh] overflow-y-auto">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-black text-slate-900">New Ticket</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <X size={15} className="text-slate-500" strokeWidth={2.5} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Subject</label>
                  <input type="text" value={subject} onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: '' })); }}
                    placeholder="Brief description of your issue"
                    className={`w-full rounded-[14px] px-4 py-3 text-[14px] font-bold text-slate-900 border-2 focus:outline-none transition-all placeholder:text-slate-300 ${errors.subject ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`} />
                  {errors.subject && <p className="text-[11px] font-black text-red-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={11} strokeWidth={3} />{errors.subject}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3 text-[14px] font-bold text-slate-900 border-2 border-slate-100 bg-slate-50 focus:outline-none">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Description</label>
                  <textarea value={description} onChange={e => { setDesc(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className={`w-full rounded-[14px] px-4 py-3 text-[14px] font-bold text-slate-900 border-2 focus:outline-none transition-all placeholder:text-slate-300 resize-none ${errors.description ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`} />
                  {errors.description && <p className="text-[11px] font-black text-red-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={11} strokeWidth={3} />{errors.description}</p>}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
                  className="w-full bg-slate-900 text-white py-4 rounded-[16px] text-[14px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                  {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Ticket'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
