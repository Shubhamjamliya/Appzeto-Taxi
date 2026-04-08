import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);
    const [timer, setTimer] = useState(30);

    const phone = location.state?.phone || '95898 14119';
    const role = location.state?.role || 'driver';

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = () => {
        if (otp.join('').length === 6) {
            navigate('/taxi/driver/step-personal', { state: { ...location.state, phone, role } });
        } else {
            alert('Please enter a valid 6-digit OTP');
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans p-5 pt-8 select-none overflow-x-hidden">
            <header className="mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 active:scale-95 transition-transform"
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
            </header>

            <main className="space-y-5 max-w-sm mx-auto">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Verify {role === 'owner' ? 'Owner' : 'Mobile'}
                    </h1>
                    <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Identity Check for +91 {phone}</p>
                </div>

                <div className="flex justify-between gap-1.5 py-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputs.current[index] = el}
                            type="tel"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-11 h-14 bg-slate-50 rounded-xl text-center text-xl font-black text-slate-900 transition-all caret-taxi-primary focus:outline-none focus:ring-0"
                        />
                    ))}
                </div>

                <div className="text-center space-y-4 mt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {timer > 0 ? `Resend Code in ${timer}s` : <span className="text-slate-900 underline underline-offset-4 decoration-slate-200 cursor-pointer" onClick={() => setTimer(30)}>Resend Now</span>}
                    </p>

                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerify}
                        disabled={otp.join('').length !== 6}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${
                            otp.join('').length === 6 ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-slate-100 text-slate-300 pointer-events-none'
                        }`}
                    >
                        Verify & Join <CheckCircle2 size={16} strokeWidth={3} />
                    </motion.button>
                </div>

                <div className="pt-10 flex flex-col items-center gap-3 opacity-20 grayscale pointer-events-none">
                   <div className="flex items-center gap-2">
                      <ShieldAlert size={12} className="text-rose-500" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Checkpoint</p>
                   </div>
                   <div className="h-0.5 w-10 bg-slate-100 rounded-full" />
                </div>
            </main>
        </div>
    );
};

export default OTPVerification;
