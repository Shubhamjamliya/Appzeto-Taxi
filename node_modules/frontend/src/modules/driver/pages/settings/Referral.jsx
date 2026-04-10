import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Gift, Copy, Share2, TrendingUp, CheckCircle2, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverReferral = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const referralCode = 'ZETO-DRIVER-9080';

    const handleCopy = () => {
        setCopied(true);
        navigator.clipboard.writeText(referralCode);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        const text = `Join Redigo Driver and start earning today! Use my code: ${referralCode}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 pb-32">
            <header className="flex items-center gap-4 mb-10 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight underline dec-taxi-primary">Grow Fleet</h1>
            </header>

            <main className="space-y-6">
                <div className="bg-gradient-to-br from-[#1a1c24] to-[#3a3d4d] p-7 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-30%] right-[-10%] w-48 h-48 bg-taxi-primary/20 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-70" />
                    <div className="relative z-10 space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-taxi-primary/10 rounded-2xl flex items-center justify-center text-taxi-primary border border-white/20 backdrop-blur-md mb-2">
                             <TrendingUp size={32} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                             <h2 className="text-2xl font-black tracking-tighter">Refer & Earn ₹500</h2>
                             <p className="text-[11px] font-bold text-white/40 leading-tight uppercase tracking-widest">For every driver that joins</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4">
                             <p className="text-[14px] font-black tracking-[0.2em] opacity-40 uppercase pl-2">{referralCode}</p>
                             <button onClick={handleCopy} className="w-10 h-10 bg-taxi-primary text-black rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                 {copied ? <CheckCircle2 size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
                             </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Success Tracking</h3>
                          <button onClick={() => alert('Detailed Network list upcoming')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest">My Network</button>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white p-4 rounded-3xl border border-white shadow-sm flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                 <UserPlus size={14} className="text-blue-500" />
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invites</span>
                             </div>
                             <p className="text-[18px] font-black text-slate-900 leading-none tracking-tighter text-center py-2">12</p>
                         </div>
                         <div className="bg-white p-4 rounded-3xl border border-white shadow-sm flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                 <Gift size={15} className="text-rose-500" />
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Earned</span>
                             </div>
                             <p className="text-[18px] font-black text-slate-900 leading-none tracking-tighter text-center py-2">₹2.5k</p>
                         </div>
                     </div>
                </div>

                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWhatsAppShare}
                    className="h-14 w-full bg-slate-900 rounded-2xl flex items-center justify-center gap-3 text-[13px] font-black text-white uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-97 transition-all mt-4"
                >
                     Blast To WhatsApp <Share2 size={18} strokeWidth={3} />
                </motion.button>
            </main>
        </div>
    );
};

export default DriverReferral;
