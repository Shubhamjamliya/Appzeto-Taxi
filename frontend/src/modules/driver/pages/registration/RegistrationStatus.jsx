import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, 
    ShieldCheck, 
    CheckCircle2, 
    ShieldAlert, 
    ChevronRight,
    Zap,
    Stars,
    ArrowRight
} from 'lucide-react';
import Rydon24Logo from '@/assets/rydon24_logo.png';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ShieldCheck, Mail, Phone, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const RegistrationStatus = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [timeLeft, setTimeLeft] = useState(10);

    const handleDashboard = () => {
        navigate('/taxi/driver/home');
    };

    useEffect(() => {
        if (location.state?.role) {
            localStorage.setItem('role', location.state.role);
        }
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/taxi/driver/home');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate, location.state]);

    return (
        <div className="min-h-screen bg-taxi-bg font-sans select-none overflow-x-hidden flex flex-col pt-8 pb-6">
            {/* Branded Header */}
            <div className="px-8 mb-6 flex items-center justify-center">
                 <img src={Rydon24Logo} alt="Rydon24" className="h-8 object-contain drop-shadow-sm" />
            </div>

            <main className="flex-1 px-8 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
                {status === 'pending' ? (
                    <motion.div 
                        key="pending"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="space-y-8 flex flex-col items-center max-w-sm"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
                                <Clock size={36} strokeWidth={2.5} className="animate-spin-slow" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-amber-400 border-2 border-amber-50">
                                <span className="text-[12px] font-black">{countdown}s</span>
                            </div>
                        </div>
        <div className="min-h-screen bg-slate-50 font-sans p-5 pt-12 select-none overflow-x-hidden flex flex-col items-center text-center">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10 mb-6"
            >
                <Clock size={32} strokeWidth={2.5} className="animate-pulse" />
            </motion.div>

            <div className="space-y-2 max-w-sm">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Verification Pending</h1>
                <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Account under review by our team</p>
                <div className="pt-2">
                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Auto-redirect in {timeLeft}s
                    </span>
                </div>
            </div>

            <div className="mt-8 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm w-full max-w-sm space-y-4">
                <div className="flex items-center gap-3 text-left">
                     <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                         <ShieldCheck size={20} />
                     </div>
                     <div className="flex-1 space-y-0.5">
                         <h4 className="text-[13px] font-black text-slate-900 leading-none">Security Check Passed</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Initial KYC Verified</p>
                     </div>
                     <CheckCircle2 size={16} className="text-emerald-500" />
                </div>

                <div className="flex items-center gap-3 text-left opacity-60 grayscale scale-95 origin-left">
                     <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                         <Mail size={18} />
                     </div>
                     <div className="flex-1 space-y-0.5">
                         <h4 className="text-[13px] font-black text-slate-900 leading-none">Manual Audit</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Waiting for Admin Signature</p>
                     </div>
                     <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
            </div>

            <div className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 max-w-sm">
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                    "Registration on Redigo usually takes <span className="text-amber-600 font-extrabold underline decoration-amber-500/20 underline-offset-4">2 - 4 hours</span>. We will notify you once your account is active."
                </p>
            </div>

            <div className="flex-1" />

            <div className="w-full max-w-sm space-y-4 pb-8">
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDashboard}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10"
                >
                    Go to Dashboard <ChevronRight size={16} strokeWidth={3} />
                </motion.button>
                <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Phone size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">+91 0000 0000 00 · Help Center</span>
                </div>
            </div>
        </div>
    );
};

export default RegistrationStatus;
