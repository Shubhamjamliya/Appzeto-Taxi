import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, FileText, CheckCircle2, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const StepDocuments = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [docs, setDocs] = useState({
        aadharFront: null,
        aadharBack: null,
        drivingLicense: null,
        vehicleRC: null
    });

    const [uploading, setUploading] = useState(null);

    const handleUpload = (key) => {
        setUploading(key);
        // Simulate upload
        setTimeout(() => {
            setDocs(p => ({ ...p, [key]: true }));
            setUploading(null);
        }, 1500);
    };

    const isComplete = docs.aadharFront && docs.aadharBack && docs.drivingLicense && docs.vehicleRC;

    const handleSubmit = () => {
        if (isComplete) {
            navigate('/taxi/driver/registration-status', { state: { ...location.state, ...docs } });
        } else {
            alert('Please upload all required documents');
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans p-5 pt-8 select-none overflow-x-hidden pb-32">
            <header className="mb-6">
                <button onClick={() => navigate(-1)} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 active:scale-95 transition-transform">
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
            </header>

            <main className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">KYC Vault</h1>
                    <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Identity and vehicle verification</p>
                </div>

                <div className="space-y-5">
                    {/* Aadhar Card Group */}
                    <div className="space-y-2.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Aadhar Card Verification</label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { key: 'aadharFront', label: 'Front Side', icon: <Smartphone size={14} /> },
                                { key: 'aadharBack', label: 'Back Side', icon: <FileText size={14} /> }
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleUpload(item.key)}
                                    className={`relative h-24 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 overflow-hidden shadow-sm ${
                                        docs[item.key] 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : 'bg-slate-50 text-slate-400'
                                    }`}
                                >
                                    {uploading === item.key ? (
                                        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                    ) : docs[item.key] ? (
                                        <CheckCircle2 size={20} strokeWidth={3} className="text-emerald-500" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5">
                                            {item.icon}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                        </div>
                                    )}
                                    {!docs[item.key] && (
                                        <div className="absolute top-1.5 right-1.5 p-1 bg-white rounded-lg shadow-sm">
                                            <Camera size={10} className="text-slate-900" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Standard Documents */}
                    {[
                        { key: 'drivingLicense', label: 'Driving License', sub: 'License (Front)' },
                        { key: 'vehicleRC', label: 'Vehicle registration', sub: 'RC / Blue Book' }
                    ].map((item) => (
                        <div key={item.key} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between group active:bg-white shadow-sm transition-all border-none">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                     docs[item.key] ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-white shadow-sm text-slate-300'
                                 }`}>
                                     {docs[item.key] ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                                 </div>
                                 <div className="space-y-0.5">
                                     <h4 className="text-[13px] font-black text-slate-900 leading-none">{item.label}</h4>
                                     <p className="text-[9px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">{item.sub}</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => handleUpload(item.key)}
                                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                     docs[item.key] ? 'text-emerald-500 hover:bg-emerald-50' : 'bg-slate-950 text-white'
                                 }`}
                             >
                                 {uploading === item.key ? '...' : docs[item.key] ? 'Edit' : 'Upload'}
                             </button>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl flex gap-3 mt-4">
                     <AlertCircle size={16} className="text-amber-500 shrink-0" />
                     <p className="text-[10px] font-bold text-slate-600 leading-snug">
                        Ensure all photos are <span className="text-amber-600 font-black tracking-tight">clear & legible</span>.
                     </p>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-50">
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${
                            isComplete 
                            ? 'bg-slate-900 text-white shadow-slate-900/10' 
                            : 'bg-slate-100 text-slate-300 pointer-events-none'
                        }`}
                    >
                        Review & Submit <ShieldCheck size={16} strokeWidth={3} />
                    </motion.button>
                </div>
            </main>
        </div>
    );
};

export default StepDocuments;
