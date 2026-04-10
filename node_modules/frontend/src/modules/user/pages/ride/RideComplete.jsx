import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ChevronRight, Share2, Info, Receipt } from 'lucide-react';

const TIP_OPTIONS = [10, 20, 50, 100];

const RideComplete = () => {
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const fare = state.fare || 22;
  const paymentMethod = state.paymentMethod || 'Cash';
  const driver = state.driver || { name: 'Kishan Kumawat', vehicle: 'Grey Honda Shine', plate: 'MP09 CL 5308', rating: '4.9' };
  const pickup = state.pickup || 'Pipaliyahana, Indore';
  const drop = state.drop || 'Vijay Nagar, Indore';
  const stops = state.stops || [];

  const effectiveTip = selectedTip ?? (showCustomTip ? parseInt(customTip || '0', 10) : 0);
  const totalBill = fare + effectiveTip;
  const rideEndTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const rideDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  useEffect(() => {
    if (ratingSubmitted) {
      const t = setTimeout(() => navigate('/'), 1500);
      return () => clearTimeout(t);
    }
  }, [ratingSubmitted, navigate]);

  const handleRating = (num) => {
    setRating(num);
    setTimeout(() => setRatingSubmitted(true), 400);
  };

  const handleShare = () => {
    const text = `Rydon24 Trip Receipt\n${rideDate} · Total ₹${totalBill}\nPayment: ${paymentMethod}\nDriver: ${driver.name}`;
    if (navigator.share) { navigator.share({ title: 'Rydon24 Trip Receipt', text }).catch(() => {}); }
    else { navigator.clipboard?.writeText(text).then(() => { setShareToast(true); setTimeout(() => setShareToast(false), 2500); }); }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans relative overflow-hidden">
      <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-28 left-[-40px] h-40 w-40 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

      {/* Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-[14px] text-[12px] font-black shadow-xl whitespace-nowrap">
            ✅ Receipt copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating submitted overlay */}
      <AnimatePresence>
        {ratingSubmitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-[18px] font-black text-slate-900">Thanks for your feedback!</h2>
            <p className="text-[13px] font-bold text-slate-400">Taking you back to Home...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-10 pb-8 space-y-3">

        {/* Success hero */}
        <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 pb-1">
          <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_6px_16px_rgba(16,185,129,0.25)] shrink-0">
            <CheckCircle2 size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">Ride Completed</p>
            <h1 className="text-[19px] font-black text-slate-900 tracking-tight leading-tight">You've Arrived!</h1>
          </div>
        </motion.div>

        {/* Invoice card */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}
          className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_6px_18px_rgba(15,23,42,0.07)] overflow-hidden">

          {/* Invoice header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-orange-500/20 flex items-center justify-center">
                <Receipt size={13} className="text-orange-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white font-black text-[13px] leading-tight">Trip Invoice</p>
                <p className="text-slate-400 text-[9px] font-bold">{rideDate} · {rideEndTime}</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare}
              className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
              <Share2 size={11} className="text-white" />
              <span className="text-white text-[10px] font-black">Share</span>
            </motion.button>
          </div>

          {/* Route */}
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Route</p>
            <div className="flex gap-2.5">
              <div className="flex flex-col items-center pt-1 gap-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                {stops.map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="w-px h-3 border-l border-dashed border-slate-200" />
                    <div className="w-2 h-2 rounded-full bg-blue-400 border-2 border-white shadow-sm" />
                  </React.Fragment>
                ))}
                <div className="w-px h-3 border-l border-dashed border-slate-200" />
                <div className="w-2 h-2 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div>
                  <p className="text-[12px] font-black text-slate-900 leading-tight">{pickup}</p>
                  <p className="text-[9px] font-bold text-slate-400">Pickup</p>
                </div>
                {stops.map((s, i) => (
                  <div key={i}>
                    <p className="text-[12px] font-black text-blue-600 leading-tight">{s}</p>
                    <p className="text-[9px] font-bold text-slate-400">Stop {i + 1}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[12px] font-black text-slate-900 leading-tight">{drop}</p>
                  <p className="text-[9px] font-bold text-slate-400">Drop</p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[11px] bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
              <img src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=f1f5f9&color=0f172a`}
                className="w-full h-full object-cover" alt="Driver" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-slate-900 leading-tight">{driver.name}</p>
              <p className="text-[10px] font-bold text-slate-400">{driver.vehicle} · {driver.plate}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 rounded-full px-2 py-0.5 shrink-0">
              <Star size={9} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-slate-800">{driver.rating || '4.9'}</span>
            </div>
          </div>

          {/* Fare breakdown */}
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1.5">Fare Breakdown</p>
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-slate-500">Base Fare</span>
              <span className="text-[12px] font-black text-slate-900">₹{fare}.00</span>
            </div>
            {effectiveTip > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-emerald-600">Tip 🙏</span>
                <span className="text-[12px] font-black text-emerald-600">₹{effectiveTip}.00</span>
              </div>
            )}
            <div className="border-t border-slate-50 pt-1.5 flex justify-between items-center">
              <span className="text-[14px] font-black text-slate-900">Total</span>
              <span className="text-[17px] font-black text-slate-900 tracking-tight">₹{totalBill}.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment</span>
              <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{paymentMethod}</span>
            </div>
          </div>
        </motion.div>

        {/* Tip section */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}
          className="rounded-[18px] border border-white/80 bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.05)] px-4 py-3 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 text-center">Tip your captain 🙏</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {TIP_OPTIONS.map((amount) => (
              <motion.button key={amount} whileTap={{ scale: 0.93 }}
                onClick={() => { setSelectedTip(selectedTip === amount ? null : amount); setShowCustomTip(false); setCustomTip(''); }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all border ${
                  selectedTip === amount
                    ? 'bg-orange-500 text-white border-orange-500 shadow-[0_3px_8px_rgba(249,115,22,0.25)]'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                ₹{amount}
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.93 }}
              onClick={() => { setShowCustomTip(!showCustomTip); setSelectedTip(null); }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all border ${
                showCustomTip ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}>
              Custom
            </motion.button>
          </div>
          <AnimatePresence>
            {showCustomTip && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex items-center gap-2 bg-slate-50 rounded-[12px] px-3 py-2.5 border border-slate-100">
                  <span className="text-[13px] font-black text-slate-400">₹</span>
                  <input type="number" placeholder="Enter tip amount" value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[13px] font-black text-slate-900 focus:outline-none placeholder:text-slate-300" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {effectiveTip > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-[10px] font-black text-emerald-600">
              Includes ₹{effectiveTip} tip — Thank you! 🙏
            </motion.p>
          )}
        </motion.div>

        {/* Rating section */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26 }}
          className="rounded-[18px] border border-white/80 bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.05)] px-4 py-3 space-y-2.5 text-center">
          <p className="text-[13px] font-black text-slate-900">How was your ride with {driver.name?.split(' ')[0]}?</p>
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <motion.button key={num} whileTap={{ scale: 0.9 }} onClick={() => handleRating(num)}
                className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all ${
                  rating >= num ? 'bg-orange-500 shadow-[0_3px_10px_rgba(249,115,22,0.25)]' : 'bg-slate-100'
                }`}>
                <Star size={18} className={rating >= num ? 'text-white fill-white' : 'text-slate-300'} />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
              {rating === 5 ? '⭐ Awesome Experience!' : rating >= 3 ? '👍 Thanks for rating!' : '📝 We will improve!'}
            </motion.p>
          )}
        </motion.div>

        {/* Bottom actions */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.34 }}
          className="space-y-2 pb-4">
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] border border-white/80 bg-white/90 py-3 text-[11px] font-black text-slate-700 shadow-[0_3px_10px_rgba(15,23,42,0.05)]">
              <Share2 size={13} strokeWidth={2} /> Share Receipt
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/support')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] border border-white/80 bg-white/90 py-3 text-[11px] font-black text-slate-700 shadow-[0_3px_10px_rgba(15,23,42,0.05)]">
              <Info size={13} strokeWidth={2} /> Support
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/')}
            className="w-full bg-slate-900 py-3.5 rounded-[16px] text-[14px] font-black text-white shadow-[0_6px_20px_rgba(15,23,42,0.18)] flex items-center justify-center gap-2">
            Back to Home <ChevronRight size={15} strokeWidth={3} className="opacity-50" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};

export default RideComplete;
