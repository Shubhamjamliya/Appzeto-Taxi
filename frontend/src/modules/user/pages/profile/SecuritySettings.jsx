import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Smartphone, ShieldAlert, Trash2, ChevronRight } from 'lucide-react';

const SecuritySettings = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans">
      <header className="bg-white p-5 flex items-center gap-6 border-b border-gray-50 sticky top-0 z-20">
         <button onClick={() => navigate(-1)} className="p-2 active:scale-95"><ArrowLeft size={24} /></button>
         <h1 className="text-[18px] font-black">Security</h1>
      </header>
      <div className="p-5 space-y-4">
         <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center"><Lock /></div>
               <div><p className="font-black">Fingerprint Lock</p><p className="text-xs text-gray-400">Secure your app</p></div>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div></div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex items-center gap-4 opacity-60">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Smartphone /></div>
            <div><p className="font-black">Active Devices</p><p className="text-xs text-gray-400">Current: Pixel 7 Pro</p></div>
         </div>
         <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/safety/sos')}
           className="w-full bg-white p-5 rounded-[28px] border border-gray-50 flex items-center gap-4 text-left shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0"><ShieldAlert size={22} strokeWidth={2} /></div>
            <div className="flex-1">
              <p className="font-black text-gray-900">SOS Contacts</p>
              <p className="text-xs text-gray-400">Manage emergency contacts</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" strokeWidth={2.5} />
         </motion.button>
         <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/profile/delete-account')}
           className="w-full bg-red-50 p-5 rounded-[28px] border border-red-100 flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center shrink-0"><Trash2 size={20} strokeWidth={2} /></div>
            <div className="flex-1">
              <p className="font-black text-red-600">Delete Account</p>
              <p className="text-xs text-red-400">Permanently remove your account</p>
            </div>
            <ChevronRight size={16} className="text-red-300" strokeWidth={2.5} />
         </motion.button>
      </div>
    </div>
  );
};

export default SecuritySettings;
