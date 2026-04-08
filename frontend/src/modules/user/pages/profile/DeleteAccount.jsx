import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertTriangle, ChevronRight, X } from 'lucide-react';

const REASONS = [
  'I use another app',
  'Too expensive',
  'Privacy concerns',
  'Technical issues',
  'Taking a break',
  'Other',
];

const CONSEQUENCES = [
  'All ride history and receipts will be permanently deleted',
  'Your wallet balance will be forfeited and cannot be recovered',
  'Saved addresses and preferences will be removed',
  'Active bookings will be cancelled',
  'Your referral rewards will be lost',
];

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [reason, setReason]           = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1000)); // POST /api/v1/user/delete-user-account
      navigate('/login', { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans pb-12 relative overflow-hidden">
      <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-5 pt-10 pb-4 sticky top-0 z-20 border-b border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-[12px] border border-white/80 bg-white/90 flex items-center justify-center shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-slate-900" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-red-400">Danger Zone</p>
            <h1 className="text-[19px] font-black tracking-tight text-red-600">Delete Account</h1>
          </div>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-[16px] px-4 py-3">
              <AlertTriangle size={14} className="text-red-500 shrink-0" strokeWidth={2.5} />
              <p className="text-[12px] font-black text-red-600 flex-1">{error}</p>
              <button onClick={() => setError(null)}><X size={13} className="text-red-400" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border-2 border-red-100 bg-red-50/60 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-black text-red-700 leading-tight">This action is permanent</p>
              <p className="text-[11px] font-bold text-red-400">Your account cannot be recovered</p>
            </div>
          </div>
          <ul className="space-y-2">
            {CONSEQUENCES.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <p className="text-[12px] font-bold text-red-600 leading-relaxed">{c}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Reason selector */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 mb-2">Why are you leaving?</p>
          <div className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden">
            {REASONS.map((r, i) => (
              <button key={r} type="button" onClick={() => setReason(r)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${i < REASONS.length - 1 ? 'border-b border-slate-50' : ''} ${reason === r ? 'bg-red-50/60' : 'active:bg-slate-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${reason === r ? 'border-red-500 bg-red-500' : 'border-slate-200'}`}>
                  {reason === r && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-[13px] font-black ${reason === r ? 'text-red-600' : 'text-slate-700'}`}>{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfirm(true)}
            disabled={!reason}
            className={`w-full py-4 rounded-[18px] text-[14px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              reason ? 'bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.25)]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}>
            <AlertTriangle size={15} strokeWidth={2.5} /> Delete My Account
          </motion.button>
          <button onClick={() => navigate('/profile')}
            className="w-full py-4 rounded-[18px] text-[14px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 bg-white/80">
            Cancel
          </button>
        </div>
      </div>

      {/* Final confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-sm bg-white rounded-[28px] p-7 z-[101] shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-50 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={30} className="text-red-500" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-black text-slate-900 mb-2">Are you absolutely sure?</h3>
              <p className="text-[13px] font-bold text-slate-500 mb-1 leading-relaxed">This action cannot be undone.</p>
              <p className="text-[12px] font-bold text-red-400 mb-6">Your account and all data will be permanently deleted.</p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete} disabled={loading}
                  className="w-full bg-red-500 text-white py-3.5 rounded-[16px] text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yes, Delete My Account'}
                </motion.button>
                <button onClick={() => setShowConfirm(false)}
                  className="w-full py-3.5 text-[13px] font-black text-slate-400 uppercase tracking-widest">
                  No, Keep My Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeleteAccount;
