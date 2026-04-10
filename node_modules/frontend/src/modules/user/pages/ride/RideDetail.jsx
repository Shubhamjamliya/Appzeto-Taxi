import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Share2, HelpCircle, Star, Repeat, Bike, Clock, Calendar } from 'lucide-react';

const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    const text = `My Rydon24 Trip #RDG${id || '8231'} — Pipaliyahana → Vijay Nagar Square | ₹22.00`;
    if (navigator.share) {
      navigator.share({ title: 'Rydon24 Trip', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans relative">

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-2xl whitespace-nowrap"
          >
            ✅ Trip details copied!
          </motion.div>
        )}
      </AnimatePresence>
      <header className="bg-white p-5 flex items-center justify-between border-b border-gray-50 shadow-sm sticky top-0 z-20">
       <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-95 transition-all">
             <ArrowLeft size={24} className="text-gray-900" strokeWidth={3} />
          </button>
          <div>
             <h1 className="text-[17px] font-black text-gray-900 leading-none">Trip ID: #RDG{id || '8231'}</h1>
             <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Completed: 29 Mar 2026</p>
          </div>
       </div>
       <button onClick={handleShare} className="active:scale-90 transition-all">
         <Share2 size={20} className="text-gray-400 hover:text-gray-900 transition-colors" />
       </button>
      </header>

      <div className="flex-1 p-5 space-y-8 overflow-y-auto no-scrollbar">
         {/* Map Snippet */}
         <div className="h-40 bg-gray-100 rounded-[32px] overflow-hidden relative shadow-sm">
         <img src="/map image.avif" className="w-full h-full object-cover opacity-60" alt="Map View" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
         </div>

         {/* Location Journey (Compact) */}
         <div className="relative pl-8 space-y-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 border-l-2 border-dashed border-gray-100"></div>
            
            <div className="relative">
               <div className="absolute -left-9 top-0.5 w-4 h-4 rounded-full border-2 border-green-500 bg-white shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
               </div>
               <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup</h4>
               <p className="text-[15px] font-black text-gray-800 leading-tight">Pipl, Indore, Madhya Pradesh</p>
               <span className="text-[11px] font-bold text-gray-400 block mt-1">12:32 PM</span>
            </div>

            <div className="relative">
               <div className="absolute -left-9 top-0.5 w-4 h-4 rounded-full border-2 border-orange-500 bg-white shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
               </div>
               <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Drop</h4>
               <p className="text-[15px] font-black text-gray-800 leading-tight">Vijay Nagar Square, Scheme 54</p>
               <span className="text-[11px] font-bold text-gray-400 block mt-1">12:45 PM</span>
            </div>
         </div>

         {/* Fare Breakdown Card (Compact) */}
         <div className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-sm space-y-4">
             <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Bike size={22} />
                </div>
                <div>
                   <h3 className="text-[15px] font-black text-gray-900">Bike Ride</h3>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Payment by Cash</p>
                </div>
             </div>
             
             <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[13px] font-bold text-gray-500">
                   <span>Base Fare</span>
                   <span className="text-gray-900">₹18.00</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold text-gray-500">
                   <span>Taxes & Fees</span>
                   <span className="text-gray-900">₹4.00</span>
                </div>
                <div className="flex justify-between items-center text-[16px] font-black text-gray-900 border-t border-gray-50 pt-3">
                   <span>Total Paid</span>
                   <span>₹22.00</span>
                </div>
             </div>
         </div>

         {/* Driver Rating Feedback */}
         <div className="flex items-center justify-between p-5 bg-orange-50/50 rounded-[28px] border border-orange-50">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 bg-white rounded-2xl p-0.5 overflow-hidden border border-orange-100">
                  <img src="https://ui-avatars.com/api/?name=Kishan+Kumawat&background=f0f0f0&color=000" className="w-full h-full rounded-[14px]" alt="Kishan" />
               </div>
               <div>
                  <h4 className="text-[14px] font-black text-gray-900">Kishan Kumawat</h4>
                  <div className="flex items-center gap-1 text-[11px] font-black text-orange-600">
                     <Star size={12} className="fill-orange-600" />
                     <span>4.9 • Top Captain</span>
                  </div>
               </div>
            </div>
            <button className="bg-white px-4 py-2 rounded-full text-[12px] font-black text-gray-900 border border-orange-100 active:scale-95 transition-all">Support</button>
         </div>
      </div>

      {/* FOOTER ACTIONS - FIXED */}
      <div className="p-6 border-t border-gray-50 flex gap-4 bg-white pb-10">
         <button
           onClick={() => navigate('/ride/select-location')}
           className="flex-[2] bg-[#1C2833] text-white py-5 rounded-[24px] text-[14px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
         >
            <Repeat size={18} />
            <span>Rebook Ride</span>
         </button>
         <button
           onClick={() => navigate('/support')}
           className="flex-1 bg-gray-50 text-gray-900 py-5 rounded-[24px] text-[14px] font-black uppercase tracking-widest border border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
         >
            <HelpCircle size={18} />
            <span>Help</span>
         </button>
      </div>
    </div>
  );
};

export default RideDetail;
