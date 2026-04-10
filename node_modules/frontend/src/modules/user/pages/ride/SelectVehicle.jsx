import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, X, Banknote, CreditCard, ChevronDown, ChevronRight, Zap } from 'lucide-react';

const SelectVehicle = () => {
  const [selected, setSelected] = useState('bike');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const pickup = routeState.pickup || 'Pipaliyahana, Indore';
  const drop = routeState.drop || 'Vijay Nagar, Indore';
  const stops = routeState.stops || [];

  const vehicles = [
    { id: 'bike',    icon: '/1_Bike.png',         name: 'Bike',        capacity: 1, badge: 'FASTEST', badgeColor: 'bg-orange-50 text-orange-500 border-orange-100', sublabel: 'Quick bike rides',      eta: 2, dropTime: '12:24', price: 22  },
    { id: 'economy', icon: '/4_Taxi.png',          name: 'Cab Economy', capacity: 4, badge: null,      badgeColor: '',                                                sublabel: 'Affordable, daily rides', eta: 2, dropTime: '12:25', price: 106 },
    { id: 'auto',    icon: '/2_AutoRickshaw.png',  name: 'Auto',        capacity: 3, badge: null,      badgeColor: '',                                                sublabel: 'Auto, daily rides',       eta: 2, dropTime: '12:25', price: 40  },
    { id: 'daily',   icon: '/4_Taxi.png',          name: 'Cab Daily',   capacity: 4, badge: 'SAVE 30%',badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', sublabel: 'Quality, daily rides',  eta: 2, dropTime: '12:25', price: 79  },
  ];

  const selectedVehicle = vehicles.find(v => v.id === selected);

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">

      {/* Map */}
      <div className="h-[44%] w-full relative bg-gray-200">
        <img src="/map image.avif" className="w-full h-full object-cover" alt="Map" />

        {/* Top bar */}
        <div className="absolute top-6 left-4 right-4 z-20 flex items-center gap-2.5">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/95 rounded-[14px] shadow-[0_4px_14px_rgba(15,23,42,0.12)] flex items-center justify-center shrink-0">
            <ArrowLeft size={18} className="text-slate-900" strokeWidth={2.5} />
          </motion.button>
          <div className="flex-1 bg-white/95 rounded-[14px] px-4 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] flex items-center gap-2">
            <span className="text-[14px] font-black text-slate-800 truncate flex-1">world Cup S...</span>
            <X size={15} className="text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Promo banner */}
        <AnimatePresence>
          {showPromo && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-white/80 rounded-[18px] flex items-center overflow-hidden z-30 shadow-[0_8px_24px_rgba(15,23,42,0.10)] pr-3">
              <div className="flex-1 px-4 py-3">
                <p className="text-[12px] font-black text-slate-900 leading-tight">Going a few kms away?</p>
                <p className="text-[10px] font-black text-orange-500 mt-0.5 uppercase tracking-wider">Use GOFREE on 1st Cab ride</p>
              </div>
              <img src="/ride_now_banner.png" className="h-12 w-16 object-cover rounded-[10px] shrink-0" alt="Promo" />
              <button onClick={() => setShowPromo(false)} className="ml-2.5 pl-2.5 border-l border-slate-100">
                <X size={13} className="text-slate-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 top-[41%] bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_100%)] rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.08)] flex flex-col z-40 overflow-hidden">

        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-36 space-y-2">
          {vehicles.map((v, i) => {
            const isSelected = selected === v.id;
            return (
              <motion.button
                key={v.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(v.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[18px] border transition-all text-left ${
                  isSelected
                    ? 'bg-white border-orange-200 shadow-[0_4px_16px_rgba(249,115,22,0.12)]'
                    : 'bg-white/80 border-white/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
                }`}
              >
                {/* Vehicle image */}
                <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'bg-orange-50' : 'bg-slate-50'
                }`}>
                  <img src={v.icon} alt={v.name} className="w-11 h-11 object-contain drop-shadow-sm" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] font-black text-slate-900 leading-tight">{v.name}</span>
                    <div className="flex items-center gap-0.5 text-slate-400">
                      <Users size={11} strokeWidth={2.5} />
                      <span className="text-[10px] font-black">{v.capacity}</span>
                    </div>
                    {v.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${v.badgeColor}`}>
                        {v.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 leading-tight">{v.sublabel}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">· {v.eta} mins away · Drop {v.dropTime} pm</p>
                </div>

                {/* Price + selected dot */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[17px] font-black text-slate-900 tracking-tighter leading-none">₹{v.price}</span>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pt-3 pb-6 space-y-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
          {/* Payment method */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowPaymentModal(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-[14px] border border-white/80 bg-slate-50 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[9px] bg-white flex items-center justify-center shadow-sm">
                {paymentMethod === 'Cash' ? <Banknote size={14} className="text-slate-600" strokeWidth={2} /> : <CreditCard size={14} className="text-slate-600" strokeWidth={2} />}
              </div>
              <span className="text-[13px] font-black text-slate-800">{paymentMethod}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </motion.button>

          {/* Book button */}
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ride/searching', { state: { pickup, drop, stops, vehicle: selectedVehicle, paymentMethod, fare: selectedVehicle?.price } })}
            className="w-full bg-[#f8e001] py-4 rounded-[18px] text-[15px] font-black text-slate-900 shadow-[0_6px_20px_rgba(248,224,1,0.35)] uppercase tracking-tight">
            Book {selectedVehicle?.name}
          </motion.button>
        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[28px] px-5 pt-4 pb-10 z-[101]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 mb-1">Payment</p>
              <h3 className="text-[18px] font-black text-slate-900 mb-5">Select Method</h3>
              <div className="space-y-2.5">
                {[
                  { id: 'Cash', label: 'Cash', sub: 'Pay after ride', Icon: Banknote, bg: 'bg-green-50', color: 'text-green-600' },
                  { id: 'Online Payment', label: 'Online Payment', sub: 'UPI, Cards or Wallets', Icon: CreditCard, bg: 'bg-blue-50', color: 'text-blue-600' },
                ].map(({ id, label, sub, Icon, bg, color }) => (
                  <motion.button key={id} whileTap={{ scale: 0.98 }}
                    onClick={() => { setPaymentMethod(id); setShowPaymentModal(false); }}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-[18px] border-2 transition-all ${
                      paymentMethod === id ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100 bg-slate-50/50'
                    }`}>
                    <div className={`w-10 h-10 rounded-[12px] ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-black text-slate-900">{label}</p>
                      <p className="text-[11px] font-bold text-slate-400">{sub}</p>
                    </div>
                    {paymentMethod === id && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectVehicle;
