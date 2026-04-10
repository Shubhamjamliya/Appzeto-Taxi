import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    Navigation, 
    MapPin, 
    CreditCard, 
    Bike, 
    Banknote, 
    CheckCircle2, 
    X, 
    ChevronRight,
    CircleDashed,
    ScanLine,
    Package,
    ArrowRightLeft,
    TrendingUp,
    IndianRupee,
    ArrowRight
} from 'lucide-react';

const IncomingRideRequest = ({ visible, onAccept, onDecline, requestData }) => {
    const [timer, setTimer] = useState(15);

    const data = requestData || {
        type: 'ride',
        title: 'Bike Taxi',
        fare: '₹145',
        payment: 'Cash',
        pickup: 'Crystal IT Park, Indore',
        drop: 'Vijay Nagar Square',
        distance: '1.2 km away'
    };

    const isParcel = data.type === 'parcel';

    useEffect(() => {
        let interval;
        if (visible) {
            setTimer(15);
            interval = setInterval(() => {
                setTimer((t) => {
                    if (t <= 1) {
                        onDecline();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [visible, onDecline]);

    if (!visible) return null;

    const radius = 35;
    const circumference = 2 * Math.PI * radius;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] p-4 flex items-end justify-center"
            >
                {/* Main Card */}
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 relative p-5 pt-8"
                >
                    {/* Timer Circle */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-16 h-16 bg-white rounded-full p-1 shadow-xl border border-slate-50 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90 absolute inset-0">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="#F1F5F9"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="#0F172A"
                                    strokeWidth="4"
                                    strokeDasharray={2 * Math.PI * 28}
                                    animate={{ strokeDashoffset: (2 * Math.PI * 28) * (1 - timer / 15) }}
                                    className="transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="text-xl font-black text-slate-900 z-10">{timer}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="text-center space-y-3">
                        <div className="space-y-1 pt-1">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isParcel ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white'}`}>
                                {isParcel ? <Package size={14} strokeWidth={2.5} /> : <Bike size={14} strokeWidth={2.5} />}
                                <span className="text-[9px] font-black uppercase tracking-[0.15em]">{data.title} Request</span>
                             </div>
                             <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mt-2 leading-none">
                                Incoming Order
                             </h2>
                        </div>

                        {/* Amount & Distance Stats */}
                        <div className="flex items-center justify-center gap-4 py-1.5 bg-slate-50 rounded-2xl border border-slate-100/50 mx-2">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Distance</p>
                                <p className="text-[12px] font-black text-slate-800 leading-none">{data.distance}</p>
                            </div>
                            <div className="w-[1px] h-6 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Earnings</p>
                                <p className="text-lg font-black text-slate-900 leading-none">{data.fare}</p>
                            </div>
                            <div className="w-[1px] h-6 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Method</p>
                                <p className="text-[12px] font-black text-emerald-600 uppercase leading-none">{data.payment}</p>
                            </div>
                        </div>

                        {/* Route Details - Very Compact */}
                        <div className="px-2 space-y-2 mt-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full border-2 border-slate-900 bg-white" />
                                </div>
                                <div className="flex-1 text-left">
                                     <p className="text-[12px] font-black text-slate-900 leading-tight uppercase line-clamp-1">{data.pickup}</p>
                                     <p className="text-[8px] font-bold text-slate-400 tracking-[0.1em] uppercase">Pickup Point</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 border-t border-dashed border-slate-100 pt-2">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full border-2 border-rose-500 bg-white" />
                                </div>
                                <div className="flex-1 text-left">
                                     <p className="text-[12px] font-black text-slate-900 leading-tight uppercase line-clamp-1">{data.drop}</p>
                                     <p className="text-[8px] font-bold text-slate-400 tracking-[0.1em] uppercase">Drop Point</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2.5 pt-3">
                            <button 
                                onClick={onDecline}
                                className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors bg-white shadow-sm"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onAccept(data)}
                                className="flex-1 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[14px] font-black uppercase tracking-[0.15em] shadow-xl shadow-slate-900/20"
                            >
                                Accept <ArrowRight size={20} strokeWidth={2.5} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default IncomingRideRequest;
