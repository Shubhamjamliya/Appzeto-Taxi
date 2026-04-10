import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Phone, MessageCircle, Shield, CheckCircle2, Navigation, AlertTriangle, Star } from 'lucide-react';

const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));
const MOCK_DRIVERS = [
  { name: 'Kishan Kumawat', rating: '4.9', vehicle: 'Grey Honda Shine', plate: 'MP09 CL 5308', phone: '+919876543210', eta: 2 },
  { name: 'Rajesh Patel',   rating: '4.7', vehicle: 'Black Royal Enfield', plate: 'MP09 AB 1234', phone: '+919876543211', eta: 3 },
  { name: 'Sunil Sharma',   rating: '4.8', vehicle: 'Blue Activa 6G',   plate: 'MP09 CD 9876', phone: '+919876543212', eta: 2 },
];
const STAGES = { SEARCHING: 'searching', ASSIGNED: 'assigned', ACCEPTED: 'accepted', COMPLETING: 'completing' };

const ActionBtn = ({ icon: Icon, label, onClick }) => (
  <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[12px] border border-slate-100 bg-slate-50/80 transition-all">
    <Icon size={15} className="text-slate-700" strokeWidth={2} />
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
  </motion.button>
);

const DriverCard = ({ driver, banner, bannerGradient, children }) => (
  <div className="rounded-[20px] border border-white/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.14)] overflow-hidden">
    <div className={`px-4 py-2.5 flex items-center gap-2.5 ${bannerGradient}`}>
      {banner}
    </div>
    <div className="px-4 pt-3 pb-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-[13px] bg-slate-100 overflow-hidden border border-slate-100">
            <img src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ','+')}&background=f1f5f9&color=0f172a`}
              className="w-full h-full object-cover" alt="Driver" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 px-1 py-0.5 rounded-[6px] border-2 border-white flex items-center gap-0.5 shadow-sm">
            <Star size={8} className="text-slate-900 fill-slate-900" />
            <span className="text-[8px] font-black text-slate-900">{driver.rating}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">{driver.name}</h3>
          <p className="text-[11px] font-black text-orange-500 mt-0.5">Arriving in {driver.eta} mins</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{driver.plate} · {driver.vehicle}</p>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const SearchingDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const [stage, setStage] = useState(STAGES.SEARCHING);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [otp] = useState(generateOTP);
  const [driver] = useState(() => MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)]);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setStage(STAGES.ASSIGNED);
      timerRef.current = setTimeout(() => {
        setStage(STAGES.ACCEPTED);
        timerRef.current = setTimeout(() => {
          setStage(STAGES.COMPLETING);
          setTimeout(() => navigate('/ride/complete', { state: { ...routeState, otp, driver, fare: routeState.fare || routeState.vehicle?.price || 22, paymentMethod: routeState.paymentMethod || 'Cash' } }), 800);
        }, 5000);
      }, 5000);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleCancel = () => { clearTimeout(timerRef.current); navigate('/'); };
  const isSearching = stage === STAGES.SEARCHING;
  const isAssigned  = stage === STAGES.ASSIGNED;
  const isAccepted  = stage === STAGES.ACCEPTED || stage === STAGES.COMPLETING;

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0 z-0 scale-110">
        <img src="/map image.avif" className="w-full h-full object-cover blur-[2px] opacity-70" alt="Map" />
      </div>

      {/* Pulse rings while searching */}
      <AnimatePresence>
        {isSearching && (
          <motion.div key="pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative">
              {[1.5, 2].map((s, i) => (
                <motion.div key={i} animate={{ scale: [1, s, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-400/20 rounded-full" />
              ))}
              <div className="relative w-16 h-16 bg-white/95 rounded-full shadow-xl flex items-center justify-center border-4 border-orange-100">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route pill */}
      <div className="absolute top-8 left-4 right-16 z-20 bg-white/90 backdrop-blur-md rounded-[14px] px-4 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.22em] leading-none mb-0.5">Route</p>
        <p className="text-[12px] font-black text-slate-900 leading-tight truncate">{routeState.pickup || 'Pickup'} → {routeState.drop || 'Drop'}</p>
      </div>
      {isSearching && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCancelConfirm(true)}
          className="absolute top-8 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80 flex items-center justify-center">
          <X size={16} className="text-slate-900" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Bottom card */}
      <div className="absolute bottom-8 left-4 right-4 z-20">
        <AnimatePresence mode="wait">

          {/* Searching */}
          {isSearching && (
            <motion.div key="searching" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="rounded-[20px] border border-white/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.14)] px-5 py-4 space-y-3">
              <div className="text-center space-y-0.5">
                <h1 className="text-[17px] font-black text-slate-900 tracking-tight">Finding your captain...</h1>
                <p className="text-[11px] font-bold text-slate-400">Connecting with drivers nearby</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0,1,2,3].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-2 h-2 bg-orange-400 rounded-full" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">High Chance</span>
                </div>
                <div className="w-px h-3 bg-slate-100" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-blue-500" strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Safety Verified</span>
                </div>
              </div>
              <button onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Cancel My Search
              </button>
            </motion.div>
          )}

          {/* Assigned */}
          {isAssigned && (
            <motion.div key="assigned" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <DriverCard driver={driver}
                bannerGradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
                banner={<>
                  <CheckCircle2 size={16} className="text-white shrink-0" strokeWidth={2.5} />
                  <div className="flex-1">
                    <p className="text-white font-black text-[13px] leading-tight">Captain Found!</p>
                    <p className="text-emerald-100 text-[10px] font-bold">Waiting for captain to accept</p>
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2].map(d => (
                      <motion.div key={d} animate={{ opacity:[0.3,1,0.3] }} transition={{ repeat:Infinity, duration:1.2, delay:d*0.25 }}
                        className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    ))}
                  </div>
                </>}>
                <div className="flex gap-2">
                  <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
                  <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat', { state: { driver } })} />
                  <ActionBtn icon={Shield} label="Safety" onClick={() => navigate('/support')} />
                </div>
                <div className="flex items-center gap-3 rounded-[12px] border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2.5">
                  <div className="w-7 h-7 rounded-[8px] bg-slate-200/60 flex items-center justify-center text-sm">🔒</div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">OTP</p>
                    <p className="text-[11px] font-bold text-slate-400">Shown after captain accepts</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-2.5 rounded-[12px] border border-red-100 bg-red-50/50 text-[11px] font-black text-red-400 uppercase tracking-widest">
                  Cancel Ride
                </motion.button>
              </DriverCard>
            </motion.div>
          )}

          {/* Accepted */}
          {isAccepted && (
            <motion.div key="accepted" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <DriverCard driver={driver}
                bannerGradient="bg-gradient-to-r from-orange-500 to-orange-400"
                banner={<>
                  <Navigation size={16} className="text-white shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-white font-black text-[13px] leading-tight">Ride Accepted!</p>
                    <p className="text-orange-100 text-[10px] font-bold">Your captain is on the way</p>
                  </div>
                </>}>
                <div className="flex gap-2">
                  <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
                  <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat', { state: { driver } })} />
                  <ActionBtn icon={Shield} label="Safety" onClick={() => navigate('/support')} />
                </div>
                <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="rounded-[14px] border border-orange-100 bg-orange-50/60 px-3 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Share OTP with Captain</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">To start your ride</p>
                  </div>
                  <div className="flex gap-1">
                    {otp.split('').map((d, i) => (
                      <motion.div key={i} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                        className="w-8 h-9 bg-white rounded-[8px] border-2 border-orange-200 flex items-center justify-center shadow-sm">
                        <span className="text-[17px] font-black text-slate-900">{d}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ride in Progress</span>
                </div>
              </DriverCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              <h3 className="text-[18px] font-black text-slate-900 mb-1.5">Cancel ride?</h3>
              <p className="text-[13px] font-bold text-slate-400 mb-6 leading-relaxed">
                {isAssigned ? 'A captain has been assigned. Sure you want to cancel?' : "We're still searching. Stop looking?"}
              </p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCancel}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-[16px] text-[13px] font-black uppercase tracking-widest">
                  Yes, Cancel
                </motion.button>
                <button onClick={() => setShowCancelConfirm(false)}
                  className="w-full py-3.5 text-[13px] font-black text-slate-400 uppercase tracking-widest">
                  {isSearching ? 'Keep Searching' : 'Go Back'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchingDriver;
