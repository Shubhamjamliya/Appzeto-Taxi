import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Navigation, 
    MessageSquare, 
    Phone, 
    ShieldAlert, 
    MapPin, 
    Check, 
    X, 
    Banknote, 
    CreditCard, 
    Wallet,
    QrCode,
    Scan,
    ChevronRight,
    Star,
    CheckCircle2,
    Package,
    User,
    ArrowUpRight,
    Box,
    ThumbsUp,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapPlaceholder from '@/assets/map_image.png';

const ActiveTrip = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const tripType = location.state?.type || 'ride';
    const isParcel = tripType === 'parcel';

    const [phase, setPhase] = useState('to_pickup'); // to_pickup, otp_verification, in_trip, payment_confirm, review
    const [otp, setOtp] = useState(['', '', '', '']);
    const [selectedRating, setSelectedRating] = useState(0);
    const [driverPaymentStatus, setDriverPaymentStatus] = useState('pending'); // pending, selecting, qr_generated, success
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');

    const tripData = isParcel ? {
        sender: { name: 'Hritik Raghuwanshi', rating: '5.0', phone: '+91 96913 2XXXX' },
        receiver: { name: 'Vinay Kumar', phone: '+91 88712 1XXXX' },
        parcelType: 'Documents / Electronics',
        pickup: 'Flat 402, Swamclose Apts, JP Nagar',
        drop: 'Tea Villa Cafe, 12th Main, HSR Layout',
        fare: '₹120',
        payment: location.state?.paymentMethod || 'Online'
    } : {
        user: { name: 'Vinay Kumar', rating: '4.8', phone: '+91 98765 43210' },
        pickup: 'Swamclose Apartments, JP nagar',
        drop: 'Tea Villa Cafe, HSR Layout',
        fare: '₹120',
        payment: location.state?.paymentMethod || 'Online'
    };

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        if (newOtp.join('').length === 4) {
            if (newOtp.join('') === '1234') {
                setTimeout(() => setPhase('in_trip'), 500);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans select-none overflow-hidden relative">
            {/* Map Area */}
            <div className="absolute inset-0 z-0 h-[60vh]">
                <img src={MapPlaceholder} alt="Map" className="w-full h-full object-cover filter brightness-95 opacity-80" />
                
                {/* Header Badge */}
                <div className="absolute top-12 left-4 right-4 flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl z-50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-xl ${isParcel ? 'bg-orange-500' : 'bg-white'}`}>
                        {isParcel ? <Package size={20} strokeWidth={2.5} /> : <Navigation size={20} fill="currentColor" strokeWidth={2.5} className="-rotate-45" />}
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                        <h4 className={`text-[9px] font-black uppercase tracking-widest leading-none flex items-center gap-2 ${isParcel ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {phase === 'to_pickup' ? 'Pickup' : 'Drop-off'}
                            <ArrowUpRight size={12} strokeWidth={3} />
                        </h4>
                        <p className="text-[13px] font-black text-white leading-tight truncate uppercase">
                            {phase === 'to_pickup' ? tripData.pickup : tripData.drop}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-40">
                <AnimatePresence mode="wait">
                    {/* Phase: To Pickup / Arrived */}
                    {phase === 'to_pickup' && (
                        <motion.div 
                            key="to_pickup" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-5 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                                         {isParcel ? <Package size={22} className="text-slate-900" /> : <User size={22} className="text-slate-400" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[15px] font-black text-slate-900 tracking-tight uppercase">
                                             {isParcel ? tripData.sender.name : tripData.user.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <Star size={10} fill="#f0c419" className="text-yellow-500" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {isParcel ? tripData.sender.rating : tripData.user.rating} • 1.2 KM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-transform"><MessageSquare size={18} strokeWidth={2.5} /></button>
                                    <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500 active:scale-95 transition-transform"><Phone size={18} strokeWidth={2.5} /></button>
                                </div>
                            </div>
                            <motion.button 
                                whileTap={{ scale: 0.98 }} onClick={() => setPhase('otp_verification')}
                                className="w-full h-15 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20"
                            >
                                {isParcel ? 'Arrived at Sender' : 'I Have Arrived'} <CheckCircle2 size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Phase: OTP Verification */}
                    {phase === 'otp_verification' && (
                        <motion.div 
                            key="otp_verification" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Security Pin</h3>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-2">
                                    Ask <span className="text-slate-900">{isParcel ? 'Sender' : 'Passenger'}</span> for Start PIN
                                </p>
                            </div>
                            <div className="flex justify-center gap-3 mb-8">
                                {otp.map((digit, index) => (
                                    <input 
                                        key={index} id={`otp-${index}`} type="tel" maxLength={1} value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        className="w-12 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl font-black text-slate-900 focus:outline-none focus:border-slate-900 transition-all shadow-inner"
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPhase('to_pickup')} className="flex-1 h-13 border-2 border-slate-100 text-slate-400 rounded-xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Go Back</button>
                                <button className="flex-1 h-13 bg-slate-100 text-slate-900 rounded-xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Support</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Phase: In Trip / Delivering */}
                    {phase === 'in_trip' && (
                        <motion.div 
                            key="in_trip" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-5 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-0.5 flex-1 pr-4">
                                     <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none mb-1">Destination</h4>
                                     <p className="text-[16px] font-black text-slate-900 tracking-tight uppercase truncate">{tripData.drop}</p>
                                </div>
                                <button className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ShieldAlert size={22} strokeWidth={2.5} /></button>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 mb-6 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                         {isParcel ? <Package size={18} className="text-white" /> : <User size={18} className="text-white opacity-40" />}
                                     </div>
                                     <div className="space-y-0.5">
                                         <p className="text-[13px] font-black text-slate-900 leading-none uppercase">{isParcel ? tripData.receiver.name : tripData.user.name}</p>
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isParcel ? 'Receiver' : 'Passenger'}</p>
                                     </div>
                                </div>
                                <button className="w-9 h-9 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-emerald-500"><Phone size={16} strokeWidth={2.5} /></button>
                            </div>
                            <motion.button 
                                whileTap={{ scale: 0.96 }} onClick={() => setPhase('payment_confirm')}
                                className="w-full h-15 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl"
                            >
                                {isParcel ? 'Deliver Parcel' : 'Arrived at Destination'} <ChevronRight size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Phase: Completion / Payment */}
                    {phase === 'payment_confirm' && (
                        <motion.div 
                            key="payment_confirm" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg transition-all duration-500 ${driverPaymentStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                                    {driverPaymentStatus === 'success' ? <Check size={32} strokeWidth={4} /> : <QrCode size={32} strokeWidth={2} />}
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase">
                                    {driverPaymentStatus === 'success' ? 'Payment Success!' : 'Collect Amount'}
                                </h2>
                                <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Fare: <span className="text-slate-900 font-black text-lg ml-1">{tripData.fare}</span>
                                </p>
                            </div>
                            {driverPaymentStatus === 'pending' && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { id: 'cash', label: 'Cash', icon: Banknote },
                                        { id: 'online', label: 'Online', icon: Scan },
                                        { id: 'wallet', label: 'Wallet', icon: Wallet }
                                    ].map((mode) => (
                                        <button key={mode.id} onClick={() => { setSelectedPaymentMode(mode.id); setDriverPaymentStatus(mode.id === 'online' ? 'qr_generated' : 'success'); }}
                                            className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${selectedPaymentMode === mode.id ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-slate-50/50'}`}
                                        >
                                            <mode.icon size={22} className={selectedPaymentMode === mode.id ? 'text-slate-900' : 'text-slate-400'} strokeWidth={2.5} />
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mt-2">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {driverPaymentStatus === 'qr_generated' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 rounded-3xl p-6 mb-6 text-center shadow-2xl">
                                    <div className="bg-white p-4 rounded-2xl inline-block mb-3 relative overflow-hidden">
                                        <QrCode size={90} className="text-slate-900 opacity-90" />
                                        <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-0.5 bg-slate-200" />
                                    </div>
                                    <p className="text-white font-black text-sm uppercase tracking-widest mb-4">Scan Code - {tripData.fare}</p>
                                    <button onClick={() => setDriverPaymentStatus('success')} className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">Confirm Received</button>
                                </motion.div>
                            )}
                            <motion.button 
                                whileTap={{ scale: 0.96 }} disabled={driverPaymentStatus !== 'success'}
                                onClick={() => setPhase('review')}
                                className={`w-full h-15 rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl transition-all ${driverPaymentStatus === 'success' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                            >
                                {driverPaymentStatus === 'success' ? 'Finalize Earnings' : 'Waiting...'} <ChevronRight size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Mutual Review */}
                    {phase === 'review' && (
                        <motion.div 
                            key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-50 text-center"
                        >
                             <div className="mb-8 space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-lg"><User size={24} className="text-white" /></div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rate Experience</h3>
                                <div className="flex justify-center gap-2">
                                     {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={28} onClick={() => setSelectedRating(s)} className={`transition-all ${s <= selectedRating ? 'text-yellow-500' : 'text-slate-100'}`} fill={s <= selectedRating ? 'currentColor' : 'transparent'} strokeWidth={2} />
                                     ))}
                                </div>
                             </div>
                             <button onClick={() => navigate('/taxi/driver/home')} className="w-full h-15 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Done <Check size={20} strokeWidth={4} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ActiveTrip;
