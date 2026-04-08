import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Smartphone, Camera, CheckCircle2 } from 'lucide-react';

const ProfileSettings = () => {
  const [name, setName] = useState('Hritik Raghuwanshi');
  const [email, setEmail] = useState('hritik@rydon24.com');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans relative">
      <header className="bg-white px-5 py-8 flex items-center gap-6 border-b border-gray-50 shadow-sm sticky top-0 z-20">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-95 transition-all">
            <ArrowLeft size={24} className="text-gray-900" strokeWidth={3} />
         </button>
         <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none uppercase tracking-widest text-xs opacity-50 mb-2">Settings</h1>
            <h2 className="text-[17px] font-black text-gray-900 leading-none">Your Profile</h2>
         </div>
      </header>

      <div className="flex-1 p-5 space-y-10 overflow-y-auto no-scrollbar">
         {/* AVATAR EDIT AREA */}
         <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative group cursor-pointer">
               <div className="w-[100px] h-[100px] rounded-[40px] bg-white p-1 border-2 border-primary/20 shadow-xl overflow-hidden active:scale-95 transition-all">
                  <img src="https://ui-avatars.com/api/?name=Hritik+Raghuwanshi&background=E85D04&color=fff" className="w-(full h-full rounded-[34px] object-cover" alt="User" />
               </div>
               <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-2xl shadow-xl border border-gray-50 text-primary">
                  <Camera size={18} strokeWidth={3} />
               </div>
            </div>
         </div>

         {/* FORM FIELDS - COMPACT */}
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
               <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-[28px] p-4 px-5 focus-within:border-primary transition-all shadow-sm">
                  <User size={18} className="text-gray-300" />
                  <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-950 focus:outline-none"
                  />
                  <CheckCircle2 size={16} className="text-green-500" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
               <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-[28px] p-4 px-5 focus-within:border-primary transition-all shadow-sm">
                  <Mail size={18} className="text-gray-300" />
                  <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-950 focus:outline-none"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Phone Number</label>
               <div className="flex items-center gap-4 bg-gray-50/50 border border-gray-50 rounded-[28px] p-4 px-5 shadow-sm opacity-80 cursor-not-allowed">
                  <Smartphone size={18} className="text-gray-300" />
                  <span className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-400">+91 98765 43210</span>
                  <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Verified</div>
               </div>
            </div>
         </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-50 pb-10">
         <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className="w-full bg-[#1C2833] py-5 rounded-[28px] text-[18px] font-black text-white shadow-xl shadow-gray-200 active:bg-black transition-all"
         >
            Save Changes
         </motion.button>
      </div>
    </div>
  );
};

export default ProfileSettings;
