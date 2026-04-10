import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Share2, Gift, CheckCircle2, Users, IndianRupee } from 'lucide-react';
import BottomNavbar from '../components/BottomNavbar';

const REFERRAL_CODE = 'RYDON-HR24';

const MOCK_HISTORY = [
  { id: '1', name: 'Priya Sharma',   joinDate: '28 Mar 2026', reward: 50, status: 'Earned'  },
  { id: '2', name: 'Rahul Verma',    joinDate: '20 Mar 2026', reward: 50, status: 'Earned'  },
  { id: '3', name: 'Anjali Patel',   joinDate: '10 Mar 2026', reward: 50, status: 'Earned'  },
  { id: '4', name: 'Suresh Kumar',   joinDate: '01 Mar 2026', reward: 0,  status: 'Pending' },
];

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 py-3 border-b border-slate-50">
    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-slate-200 rounded-full w-1/2" />
      <div className="h-2.5 bg-slate-100 rounded-full w-1/3" />
    </div>
    <div className="h-5 w-12 bg-slate-100 rounded-full" />
  </div>
);

const Referral = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      await new Promise(r => setTimeout(r, 700));
      setHistory(MOCK_HISTORY);
      setLoading(false);
    };
    load();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast('Copied!');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleShare = async () => {
    const text = `Join Rydon24 — Indore's fastest ride app! Use my code ${REFERRAL_CODE} to get ₹50 off your first ride. Download: https://rydon24.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join Rydon24', text });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch { /* user cancelled */ }
  };

  const totalInvites = history.length;
  const totalEarned  = history.reduce((sum, r) => sum + (r.reward || 0), 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans pb-28 relative overflow-hidden">
      <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-yellow-100/60 blur-3xl pointer-events-none" />
      <div className="absolute top-52 left-[-60px] h-52 w-52 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-5 pt-10 pb-4 sticky top-0 z-20 border-b border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-[12px] border border-white/80 bg-white/90 flex items-center justify-center shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} className="text-slate-900" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">Earn Together</p>
            <h1 className="text-[19px] font-black tracking-tight text-slate-900">Referral</h1>
          </div>
          <Gift size={20} className="text-yellow-500" strokeWidth={2} />
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Referral code card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] bg-gradient-to-br from-orange-500 to-orange-600 p-5 shadow-[0_12px_32px_rgba(249,115,22,0.25)] text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-100 mb-1">Your Referral Code</p>
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-[28px] font-black tracking-widest">{REFERRAL_CODE}</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy}
              className="w-10 h-10 bg-white/20 rounded-[12px] flex items-center justify-center border border-white/30 active:bg-white/30 transition-all">
              {copied ? <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} /> : <Copy size={18} className="text-white" strokeWidth={2} />}
            </motion.button>
          </div>
          <p className="text-[12px] font-bold text-orange-100 mb-4">Share your code and earn ₹50 for every friend who joins and completes their first ride.</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
            className="w-full bg-white text-orange-600 py-3 rounded-[14px] text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
            <Share2 size={15} strokeWidth={2.5} /> Share Invite
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={16} className="text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[22px] font-black text-slate-900 leading-none">{totalInvites}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Invites Sent</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center shrink-0">
              <IndianRupee size={16} className="text-emerald-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[22px] font-black text-slate-900 leading-none">₹{totalEarned}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Total Earned</p>
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 mb-1">Referral History</p>
          <h2 className="text-[16px] font-black tracking-tight text-slate-900 mb-3">Your invites</h2>

          <div className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4"><SkeletonRow /></div>
            ))}

            {!loading && history.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <Gift size={32} className="text-slate-300" strokeWidth={1.5} />
                <p className="text-[13px] font-black text-slate-500">No referrals yet — share your code to start earning</p>
              </div>
            )}

            {!loading && history.map((r, i) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i < history.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-black text-orange-600">{r.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-slate-900 leading-tight truncate">{r.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Joined {r.joinDate}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  r.status === 'Earned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                }`}>
                  {r.status === 'Earned' ? `+₹${r.reward}` : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copied toast */}
      <AnimatePresence>
        {(copied || toast) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[12px] font-black shadow-2xl z-50 whitespace-nowrap">
            ✓ Code copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavbar />
    </div>
  );
};

export default Referral;
