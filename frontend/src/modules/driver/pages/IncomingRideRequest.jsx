import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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

const IncomingRideRequest = ({ visible, onAccept, onDecline, requestData, isAccepting = false }) => {
    const [timer, setTimer] = useState(15);
    const slideX = useMotionValue(0);
    const slideFillWidth = useTransform(slideX, [0, 160], ['52px', '100%']);

    const data = requestData;

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

    useEffect(() => {
        slideX.set(0);
    }, [slideX, visible, data?.rideId]);

    const handleSlideEnd = (_event, info) => {
        if (isAccepting) {
            return;
        }

        if (info.offset.x >= 110) {
            slideX.set(160);
            onAccept(data);
            return;
        }

        slideX.set(0);
    };

    if (!visible || !data) return null;

    const isParcel = data.type === 'parcel';

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
                    className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 relative p-6 pt-10"
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
                    <div className="text-center space-y-4">
                        <div className="space-y-1.5 pt-1">
                             <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${isParcel ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white'}`}>
                                {isParcel ? <Package size={14} strokeWidth={2.5} /> : <Bike size={14} strokeWidth={2.5} />}
                                <span className="text-[9px] font-black uppercase tracking-[0.15em]">{data.title} Request</span>
                             </div>
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mt-2 leading-none">
                                Incoming Order
                             </h2>
                        </div>

                        {/* Amount & Distance Stats */}
                        <div className="flex items-center justify-center gap-5 py-3 bg-slate-50 rounded-2xl border border-slate-100/50 mx-1">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Distance</p>
                                <p className="text-[13px] font-black text-slate-800 leading-none">{data.distance}</p>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Earnings</p>
                                <p className="text-xl font-black text-slate-900 leading-none">{data.fare}</p>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Method</p>
                                <p className="text-[13px] font-black text-emerald-600 uppercase leading-none">{data.payment}</p>
                            </div>
                        </div>

                        {/* Route Details - Very Compact */}
                        <div className="px-2 space-y-3 mt-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full border-2 border-slate-900 bg-white" />
                                </div>
                                <div className="flex-1 text-left">
                                     <p className="text-[13px] font-black text-slate-900 leading-tight uppercase line-clamp-1">{data.pickup}</p>
                                     <p className="text-[8px] font-bold text-slate-400 tracking-[0.1em] uppercase">Pickup Point</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 border-t border-dashed border-slate-100 pt-3">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full border-2 border-rose-500 bg-white" />
                                </div>
                                <div className="flex-1 text-left">
                                     <p className="text-[13px] font-black text-slate-900 leading-tight uppercase line-clamp-1">{data.drop}</p>
                                     <p className="text-[8px] font-bold text-slate-400 tracking-[0.1em] uppercase">Drop Point</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={onDecline}
                                disabled={isAccepting}
                                className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors bg-white shadow-sm shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                            <div 
                                className="relative h-14 flex-1 overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20"
                            >
                                <motion.div
                                    style={{ width: slideFillWidth }}
                                    className="absolute inset-y-0 left-0 rounded-2xl bg-emerald-500"
                                />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-12 pr-3">
                                    <span className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-white/75">
                                        {isAccepting ? 'Accepting...' : 'Slide to accept'}
                                    </span>
                                    <ArrowRight size={15} className="ml-1.5 shrink-0 text-white/70" strokeWidth={3} />
                                </div>
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 160 }}
                                    dragElastic={0.02}
                                    dragMomentum={false}
                                    style={{ x: slideX }}
                                    onDragEnd={handleSlideEnd}
                                    className="absolute left-1.5 top-1.5 z-10 flex h-[44px] w-[44px] cursor-grab items-center justify-center rounded-[14px] bg-white text-slate-900 shadow-lg active:cursor-grabbing"
                                >
                                    <ChevronRight size={24} strokeWidth={3} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default IncomingRideRequest;
