import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, AlertTriangle, Shield, Star, ChevronLeft, Share2 } from 'lucide-react';

const RideTracking = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const otp = state.otp || '1234';
  const fare = state.fare || 22;
  const paymentMethod = state.paymentMethod || 'Cash';
  const driver = state.driver || { name: 'Kishan Kumawat', rating: '4.9', vehicle: 'Grey Honda Shine', plate: 'MP09 CL 5308', phone: '+919876543210', eta: 2 };
  const pickupLocation = state.pickup || 'Pipaliyahana, Indore';
  const dropLocation = state.drop || 'Vijay Nagar, Indore';

  const handleShare = () => {
    const text = `I'm riding with Rydon24!\nDriver: ${driver.name} (${driver.plate})\nFrom: ${pickupLocation}\nTo: ${dropLocation}`;
    if (navigator.share) { navigator.share({ title: 'Track My Ride', text }).catch(() => {}); }
    else { navigator.clipboard?.writeText(text).then(() => { setShareToast(true); setTimeout(() => setShareToast(false), 2500); }); }
  };

  const ActionBtn = ({ icon: Icon, label, onClick, colorClass }) => (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[14px] border border-slate-100 bg-slate-50/80 transition-all ${colorClass || ''}`}>
      <Icon size={17} className="text-slate-700" strokeWidth={2} />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">

      <AnimatePresence>
        {shareToast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-[14px] text-[12px] font-black shadow-xl whitespace-nowrap">
            ✅ Ride details copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <img src="/map image.avif" className="w-full h-full object-cover" alt="Map" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Back */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
        className="absolute top-8 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80 flex items-center justify-center">
        <ChevronLeft size={18} className="text-slate-900" strokeWidth={2.5} />
      </motion.button>

      {/* Route pill */}
      <div className="absolute top-8 left-16 right-4 z-10 bg-white/90 backdrop-blur-md rounded-[14px] px-3.5 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.08)] border border-white/80">
        <p className="text-[11px] font-black text-slate-500 truncate">{pickupLocation} → {dropLocation}</p>
      </div>

      {/* Safety badge */}
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/support')}
        className="absolute top-24 right-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.08)] flex items-center gap-1.5">
        <Shield size={13} className="text-blue-500" strokeWidth={2.5} />
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Safety</span>
      </motion.button>

      {/* Bottom sheet */}
      <motion.div animate={{ y: drawerOpen ? 0 : 340 }}
        className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.10)] z-20 border-t border-white/80">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-4 cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)} />

        <div className="px-5 pb-8 space-y-4">
          {/* Driver row */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-50">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-[16px] bg-slate-100 overflow-hidden border border-slate-100">
                <img src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ','+')}&background=f1f5f9&color=0f172a`}
                  className="w-full h-full object-cover" alt="Driver" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 px-1.5 py-0.5 rounded-[8px] border-2 border-white flex items-center gap-0.5 shadow-sm">
                <Star size={9} className="text-slate-900 fill-slate-900" />
                <span className="text-[9px] font-black text-slate-900">{driver.rating}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-black text-slate-900 leading-tight">{driver.name}</h3>
              <p className="text-[12px] font-black text-orange-500 mt-0.5">Arriving in {driver.eta} mins</p>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{driver.plate} · {driver.vehicle}</p>
            </div>
            {/* OTP pill */}
            <div className="shrink-0 bg-orange-50 border border-orange-100 rounded-[12px] px-3 py-2 text-right">
              <p className="text-[8px] font-black text-orange-400 uppercase tracking-wider">OTP</p>
              <p className="text-[16px] font-black text-slate-900 tracking-widest leading-tight">{otp}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
            <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat')} />
            <ActionBtn icon={Share2} label="Share" onClick={handleShare} />
            <ActionBtn icon={AlertTriangle} label="Help" onClick={() => navigate('/support')} />
          </div>

          {/* Fare + cancel */}
          <div className="flex items-center justify-between rounded-[18px] border border-white/80 bg-slate-50/80 px-4 py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Fare</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[20px] font-black text-slate-900 tracking-tighter leading-none">₹{fare}.00</span>
                <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">{paymentMethod}</span>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowCancelConfirm(true)}
              className="bg-white border border-red-100 text-red-400 font-black text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-[12px] shadow-sm">
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCancelConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-sm bg-white rounded-[28px] p-7 z-[101] shadow-2xl text-center">
              <div className="w-14 h-14 bg-red-50 rounded-[18px] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={26} className="text-red-400" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-black text-slate-900 mb-1.5">Cancel your ride?</h3>
              <p className="text-[13px] font-bold text-slate-400 mb-6 leading-relaxed">Your captain is already on the way.</p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-[16px] text-[13px] font-black uppercase tracking-widest">
                  Yes, Cancel
                </motion.button>
                <button onClick={() => setShowCancelConfirm(false)}
                  className="w-full py-3.5 text-[13px] font-black text-slate-400 uppercase tracking-widest">
                  No, Go Back
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideTracking;
