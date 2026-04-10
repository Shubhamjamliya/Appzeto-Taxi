import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Shield, Eye, Smartphone, LogOut, ChevronRight, Globe, Info, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverSettings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        faceId: true,
        darkMode: false,
        onlineVisibility: true
    });

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10">
            <header className="flex items-center gap-4 mb-10 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight">App Settings</h1>
            </header>

            <main className="space-y-8">
                 {/* Preferences */}
                 <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 ml-2">Personalization</h3>
                     <div className="bg-white rounded-[2rem] border border-white shadow-sm divide-y divide-slate-50 overflow-hidden">
                         {[
                             { id: 'faceId', label: 'Face ID / Bio-metric', icon: <Shield size={18} /> },
                             { id: 'darkMode', label: 'Dark Mode (System)', icon: <Eye size={18} /> },
                             { id: 'onlineVisibility', label: 'Live Visibility', icon: <Globe size={18} /> }
                         ].map((item) => (
                             <div key={item.id} className="p-5 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">{item.icon}</div>
                                     <span className="text-[14px] font-black text-slate-900">{item.label}</span>
                                 </div>
                                 <button 
                                    onClick={() => setSettings(p => ({ ...p, [item.id]: !p[item.id] }))}
                                    className={`w-11 h-6 rounded-full p-1 transition-colors ${settings[item.id] ? 'bg-taxi-primary' : 'bg-slate-200'}`}
                                 >
                                     <motion.div layout animate={{ x: settings[item.id] ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                 </button>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Information */}
                 <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 ml-2">General Info</h3>
                     <div className="bg-white rounded-[2rem] border border-white shadow-sm overflow-hidden">
                          {[
                              { label: 'About Redigo', icon: <Info size={18} />, sub: 'v2.4.0 (Latest)' },
                              { label: 'Support & Feedback', icon: <HelpCircle size={18} />, sub: 'Get help' }
                          ].map((item, idx) => (
                              <div key={idx} className="p-5 flex items-center justify-between border-b border-slate-50 last:border-none group active:bg-slate-50">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:text-white">{item.icon}</div>
                                       <div>
                                           <p className="text-[14px] font-black text-slate-900 leading-none">{item.label}</p>
                                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{item.sub}</p>
                                       </div>
                                   </div>
                                   <ChevronRight size={18} className="text-slate-200" />
                              </div>
                          ))}
                     </div>
                 </div>

                 <motion.button 
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-rose-50 text-rose-500 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-widest transition-all shadow-sm shadow-rose-500/5"
                >
                    Sign Out Everywhere <LogOut size={18} strokeWidth={3} />
                </motion.button>
            </main>
        </div>
    );
};

export default DriverSettings;
