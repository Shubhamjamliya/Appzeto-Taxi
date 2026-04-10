import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, MessageSquare, Tag } from 'lucide-react';

const Toggle = ({ active, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-green-500' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${active ? 'right-1' : 'left-1'}`}></div>
  </button>
);

const NotificationSettings = () => {
  const [offers, setOffers] = useState(true);
  const [updates, setUpdates] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans">
      <header className="bg-white p-5 flex items-center gap-6 border-b border-gray-50 sticky top-0 z-20">
         <button onClick={() => navigate(-1)} className="p-2 active:scale-95"><ArrowLeft size={24} /></button>
         <h1 className="text-[18px] font-black">Notifications</h1>
      </header>
      <div className="p-5 space-y-4">
         <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center"><Tag /></div>
               <p className="font-black">Offers & Promotions</p>
            </div>
            <Toggle active={offers} onToggle={() => setOffers(!offers)} />
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Bell /></div>
               <p className="font-black">App Updates</p>
            </div>
            <Toggle active={updates} onToggle={() => setUpdates(!updates)} />
         </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
