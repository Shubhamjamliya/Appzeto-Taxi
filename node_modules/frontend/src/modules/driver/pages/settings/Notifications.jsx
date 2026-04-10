import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverNotifications = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        push: true,
        sms: false,
        email: true,
        offers: true
    });

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10">
            <header className="flex items-center gap-4 mb-8 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight underline-offset-4 decoration-taxi-primary">Notifications</h1>
            </header>

            <main className="space-y-4">
                {[
                    { key: 'push', label: 'Push Notifications', sub: 'In-app alerts on ride & payments', icon: <Bell size={18} /> },
                    { key: 'sms', label: 'SMS Notifications', sub: 'Text alerts for safety & urgent', icon: <Smartphone size={18} /> },
                    { key: 'email', label: 'Email Notifications', sub: 'Weekly earnings and news', icon: <Mail size={18} /> },
                    { key: 'offers', label: 'Promotional Offers', sub: 'Bonuses, incentives & discount', icon: <MessageSquare size={18} /> }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors`}>
                                {item.icon}
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight">{item.label}</h4>
                                <p className="text-[10px] font-bold text-slate-400 opacity-60 leading-tight">{item.sub}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggle(item.key)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${
                                settings[item.key] ? 'bg-taxi-primary' : 'bg-slate-200'
                            }`}
                        >
                            <motion.div 
                                layout
                                animate={{ x: settings[item.key] ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default DriverNotifications;
