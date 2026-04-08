import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Phone, MessageCircle, Share2, AlertTriangle, Shield, Star, Package } from 'lucide-react';

const ActionBtn = ({ icon: Icon, label, onClick }) => (
  <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[14px] border border-slate-100 bg-slate-50/80">
    <Icon size={16} className="text-slate-700" strokeWidth={2} />
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
  </motion.button>
);

const ParcelTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const driver = state.driver || { name: 'Kishan Kumawat', rating: '4.9', vehicle: 'Grey Honda Shine', plate: 'MP09 CL 5308', phone: '+919876543210', eta: 2 };
  const otp = state.otp || '4821';
  const pickup = state.pickup || 'Pickup Location';
  const drop = state.drop || 'Drop Location';
  const fare = state.fare || 45;
  const paymentMethod = state.paymentMethod || 'Cash';

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    const text = `Parcel delivery in progress!\nAgent: ${driver.name}\nPickup: ${pickup}\nDrop: ${drop}\nOTP: ${otp}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(text).catch(() => {});
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <img src="/map image.avif" className="w-full h-full object-cover" alt="Map" />
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[12px] font-black shadow-2xl whitespace-nowrap border border-white/10">
            📋 Delivery details copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
        className="absolute top-8 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80 flex items-center justify-center">
        <ChevronLeft size={18} className="text-slate-900" strokeWidth={2.5} />
      </motion.button>

      {/* Safety badge */}
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/support')}
        className="absolute top-8 right-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.08)] flex items-center gap-1.5">
        <Shield size={13} className="text-blue-500" strokeWidth={2.5} />
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Safety</span>
      </motion.button>

      {/* Delivery status pill */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Delivery in Progress</span>
      </div>

      {/* Bottom drawer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.12)] px-5 pt-4 pb-8">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Agent info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-[14px] bg-slate-100 overflow-hidden border border-slate-100">
              <img src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ','+')}&background=f1f5f9&color=0f172a`}
                className="w-full h-full object-cover" alt="Agent" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 px-1 py-0.5 rounded-[6px] border-2 border-white flex items-center gap-0.5 shadow-sm">
              <Star size={8} className="text-slate-900 fill-slate-900" />
              <span className="text-[8px] font-black text-slate-900">{driver.rating}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Delivery Agent</p>
            <h3 className="text-[16px] font-black text-slate-900 leading-tight">{driver.name}</h3>
            <p className="text-[11px] font-bold text-slate-400">{driver.plate} · {driver.vehicle}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ETA</p>
            <p className="text-[15px] font-black text-orange-500">{driver.eta} min</p>
          </div>
        </div>

        {/* OTP */}
        <div className="rounded-[14px] border border-orange-100 bg-orange-50/60 px-4 py-3 flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Parcel OTP</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Share with agent on delivery</p>
          </div>
          <div className="flex gap-1">
            {otp.split('').map((d, i) => (
              <div key={i} className="w-9 h-10 bg-white rounded-[8px] border-2 border-orange-200 flex items-center justify-center shadow-sm">
                <span className="text-[18px] font-black text-slate-900">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
          <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat')} />
          <ActionBtn icon={Share2} label="Share" onClick={handleShare} />
          <ActionBtn icon={AlertTriangle} label="Help" onClick={() => navigate('/support')} />
        </div>

        {/* Fare row */}
        <div className="flex items-center justify-between px-1 mb-4">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-400" strokeWidth={2} />
            <span className="text-[12px] font-black text-slate-600">Delivery Fare</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-black text-slate-900">₹{fare}</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{paymentMethod}</span>
          </div>
        </div>

        {/* Cancel */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowCancelModal(true)}
          className="w-full py-3 rounded-[14px] border border-red-100 bg-red-50/50 text-[11px] font-black text-red-400 uppercase tracking-widest">
          Cancel Delivery
        </motion.button>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-sm bg-white rounded-[28px] p-7 z-[101] shadow-2xl text-center">
              <div className="w-14 h-14 bg-red-50 rounded-[18px] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={26} className="text-red-400" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-black text-slate-900 mb-1.5">Cancel delivery?</h3>
              <p className="text-[13px] font-bold text-slate-400 mb-6 leading-relaxed">Your agent is already on the way. Are you sure you want to cancel?</p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-[16px] text-[13px] font-black uppercase tracking-widest">
                  Yes, Cancel
                </motion.button>
                <button onClick={() => setShowCancelModal(false)}
                  className="w-full py-3.5 text-[13px] font-black text-slate-400 uppercase tracking-widest">
                  Keep Delivery
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParcelTracking;
