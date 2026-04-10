import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, CheckCircle2, ChevronRight, Upload, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddVehicle = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: Document, 3: Success
    const [formData, setFormData] = useState({
        type: '',
        make: '',
        model: '',
        year: '',
        number: '',
        color: '',
        rcFile: null
    });

    const vehicleTypes = [
        { id: 'v1', label: 'Bike', icon: 'Bike' },
        { id: 'v2', label: 'Cab', icon: 'Car' },
        { id: 'v3', label: 'Auto', icon: 'Car' }
    ];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) setFormData(p => ({ ...p, rcFile: file }));
    };

    const handleSubmit = () => {
        setStep(3);
        // Auto approve after 5 seconds
        setTimeout(() => {
            navigate('/taxi/driver/vehicle-fleet');
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-white font-sans p-5 pt-8 select-none overflow-x-hidden pb-32">
            <header className="mb-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 active:scale-95 transition-transform">
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
                <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-6 h-1 rounded-full transition-all ${step >= s ? 'bg-slate-900' : 'bg-slate-100'}`} />
                    ))}
                </div>
            </header>

            <main className="max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Vehicle Details</h1>
                                <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Enter details of the new vehicle</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {vehicleTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData(p => ({ ...p, type: type.label }))}
                                                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all ${
                                                    formData.type === type.label 
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                                                    : 'bg-slate-50 text-slate-400'
                                                }`}
                                            >
                                                <Car size={16} />
                                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Make</label>
                                    <input 
                                        value={formData.make}
                                        onChange={(e) => setFormData(p => ({ ...p, make: e.target.value }))}
                                        placeholder="Suzuki, Hyundai..."
                                        className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Model</label>
                                        <input 
                                            value={formData.model}
                                            onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))}
                                            placeholder="WagonR, i20..."
                                            className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Year</label>
                                        <input 
                                            value={formData.year}
                                            onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                                            placeholder="2024"
                                            className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vehicle Number</label>
                                    <input 
                                        value={formData.number}
                                        onChange={(e) => setFormData(p => ({ ...p, number: e.target.value.toUpperCase() }))}
                                        placeholder="MP 09 AB 1234"
                                        className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-200 uppercase"
                                    />
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Color</label>
                                    <input 
                                        value={formData.color}
                                        onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        placeholder="White, Black, Silver..."
                                        className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-50">
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={!formData.type || !formData.make || !formData.model || !formData.number}
                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${
                                        (formData.type && formData.make && formData.model && formData.number) 
                                        ? 'bg-slate-900 text-white shadow-slate-900/10' 
                                        : 'bg-slate-100 text-slate-300 pointer-events-none'
                                    }`}
                                >
                                    Next: Documents <ChevronRight size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Upload RC</h1>
                                <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Proof of vehicle ownership</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-slate-900 transition-colors cursor-pointer group">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleFileUpload}
                                        accept="image/*,.pdf"
                                    />
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                        <Upload size={28} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h4 className="text-[14px] font-black text-slate-900 uppercase">Click to Upload RC</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image or PDF (Max 5MB)</p>
                                    </div>
                                </div>

                                {formData.rcFile && (
                                    <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between border border-emerald-100">
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck size={18} /></div>
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-black uppercase tracking-tight">{formData.rcFile.name}</p>
                                                <p className="text-[9px] font-bold opacity-60 uppercase">File attached successfully</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFormData(p => ({ ...p, rcFile: null }))} className="text-emerald-900/30 hover:text-rose-500 transition-colors"><X size={18} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-50">
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!formData.rcFile}
                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${
                                        formData.rcFile
                                        ? 'bg-slate-900 text-white shadow-slate-900/10' 
                                        : 'bg-slate-100 text-slate-300 pointer-events-none'
                                    }`}
                                >
                                    Submit for Approval <CheckCircle2 size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center space-y-8 pt-20"
                        >
                            <div className="relative">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                    className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-10"
                                >
                                    <CheckCircle2 size={40} strokeWidth={2.5} />
                                </motion.div>
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.5, 1],
                                        opacity: [0.2, 0, 0.2]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-slate-900 rounded-[2.5rem] -z-0"
                                />
                            </div>

                            <div className="text-center space-y-3">
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">Success!</h1>
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed px-10">
                                    Vehicle submitted for verification. It will be <span className="text-slate-900">auto-approved</span> in 5 seconds.
                                </p>
                            </div>

                            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="h-full bg-slate-900"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AddVehicle;
