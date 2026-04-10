import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Phone, Plus, Trash2, Zap, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecuritySOS = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([
        { id: 1, name: 'Police Helpline', phone: '100', type: 'Official' },
        { id: 2, name: 'Redigo Support', phone: '1800 123 456', type: 'Official' }
    ]);
    const [showToast, setShowToast] = useState(false);

    const triggerSOS = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10">
            <header className="flex items-center gap-4 mb-8 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight">Security & SOS</h1>
            </header>

            <AnimatePresence>
                {showToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-10 left-6 right-6 z-[100] bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-rose-500/20"
                    >
                         <Zap size={20} fill="currentColor" strokeWidth={3} className="animate-pulse" />
                         <p className="text-[12px] font-black uppercase tracking-widest">SOS Triggered Globally</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl" onClick={triggerSOS}>
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-rose-500/20 rounded-full blur-3xl" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[14px] font-black uppercase tracking-widest text-rose-500">Panic SOS</h3>
                                <p className="text-[20px] font-black tracking-tighter">Emergency Contacts</p>
                            </div>
                            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/5 transition-transform group-hover:scale-110">
                                <Zap size={24} fill="currentColor" strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-white/40 leading-tight">These contacts will be alerted instantly when you trigger the in-trip emergency SOS button.</p>
                        <button className="h-12 w-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/10 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all">Setup Panic Mode</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Emergency List</h3>
                         <button onClick={() => alert('Add Contact feature upcoming')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-0.5">+ Add New</button>
                    </div>
                    
                    {contacts.map((contact, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors bg-slate-50`}>
                                    <Phone size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight">{contact.name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 opacity-60 leading-tight uppercase tracking-widest">{contact.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trash2 size={16} className="text-slate-200 hover:text-rose-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SecuritySOS;
