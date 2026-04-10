import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, User, Phone, Mail, Check, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Hritik Raghuwanshi',
        phone: '+91 95898 14119',
        email: 'hritik@redigo.in'
    });

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate(-1);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 overflow-hidden">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Profile</h1>
            </header>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-10 left-6 right-6 z-[100] bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
                    >
                         <CheckCircle2 size={20} strokeWidth={3} />
                         <p className="text-[12px] font-black uppercase tracking-widest">Changes Saved Successfully</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-premium relative">
                            <User size={48} className="text-white" strokeWidth={1.5} />
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-taxi-primary rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                            <Camera size={14} />
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Photo</p>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'name', label: 'Full Name', value: formData.name, icon: <User size={16} /> },
                        { key: 'phone', label: 'Mobile Number', value: formData.phone, icon: <Phone size={16} /> },
                        { key: 'email', label: 'Email Address', value: formData.email, icon: <Mail size={16} /> }
                    ].map((field, idx) => (
                        <div key={idx} className="bg-white p-4 py-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 focus-within:ring-2 focus-within:ring-taxi-primary/20 transition-all">
                            <div className="flex items-center gap-2 text-slate-400">
                                {field.icon}
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{field.label}</span>
                            </div>
                            <input 
                                type="text" 
                                defaultValue={field.value}
                                className="w-full text-[14px] font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 uppercase tracking-tight"
                            />
                        </div>
                    ))}
                </div>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest mt-10 shadow-xl"
                >
                    Save Changes <Check size={18} strokeWidth={3} />
                </motion.button>
            </main>
        </div>
    );
};

export default EditProfile;
