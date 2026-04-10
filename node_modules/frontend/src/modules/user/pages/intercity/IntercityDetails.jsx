import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, ChevronRight } from 'lucide-react';

const IntercityDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { fromCity, toCity, tripType, date, fare, vehicle, passengers } = state;

  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');

  if (!fromCity || !vehicle) {
    navigate('/intercity');
    return null;
  }

  const handleContinue = () => {
    if (!pickup.trim() || !drop.trim()) {
      alert("Please enter both exact pickup and drop locations within the selected cities.");
      return;
    }
    navigate('/intercity/confirm', {
      state: { ...state, pickup, drop }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] max-w-lg mx-auto font-sans pb-32">
       {/* Header */}
       <div className="bg-white px-5 pt-10 pb-6 sticky top-0 z-20 shadow-sm border-b border-gray-50 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
          <ArrowLeft size={24} className="text-gray-900" strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-[22px] font-black text-gray-900 leading-none tracking-tight">Exact Addresses</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{fromCity} to {toCity}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
         
         <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex flex-col gap-6 relative">
            {/* Connecting line */}
            <div className="absolute left-[33px] top-[48px] bottom-[48px] w-0.5 bg-gray-100 border-l border-dashed border-gray-300" />
            
            {/* Pickup */}
            <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 pl-8">Pickup in {fromCity}</label>
                <div className="mt-1.5 flex items-center gap-3">
                   <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 border border-green-200 z-10">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="e.g. 102 Apollo Tower, MG Road"
                      value={pickup}
                      onChange={e => setPickup(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-bold text-gray-900 focus:outline-none focus:border-yellow-400 transition-colors"
                   />
                </div>
            </div>

            {/* Drop */}
            <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 pl-8">Drop in {toCity}</label>
                <div className="mt-1.5 flex items-center gap-3">
                   <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 border border-red-200 z-10">
                      <MapPin size={12} className="text-red-500" strokeWidth={3} />
                   </div>
                   <input 
                      type="text" 
                      placeholder="e.g. Railway Station Main Gate, Platform 1"
                      value={drop}
                      onChange={e => setDrop(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-bold text-gray-900 focus:outline-none focus:border-yellow-400 transition-colors"
                   />
                </div>
            </div>

         </div>

         <div className="bg-[#1C2833] rounded-[24px] p-4 flex items-center gap-4 text-white shadow-md">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
               <Navigation size={20} className="text-yellow-400" />
            </div>
            <div>
               <p className="text-[13px] font-black leading-tight">Door-to-Door Service</p>
               <p className="text-[10px] font-bold text-white/50 mt-0.5">Your driver will pick you up and drop you exactly at these locations.</p>
            </div>
         </div>
      </div>

      {/* Book CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-5 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB]/95 to-transparent z-30">
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="w-full bg-yellow-400 text-[#1C2833] py-4 rounded-2xl text-[16px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          Confirm Details <ChevronRight size={18} strokeWidth={3} />
        </motion.button>
      </div>

    </div>
  );
};

export default IntercityDetails;
