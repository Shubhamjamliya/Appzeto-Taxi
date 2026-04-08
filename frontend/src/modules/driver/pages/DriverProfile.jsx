import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Car, 
    FileText, 
    Bell, 
    History, 
    CreditCard, 
    UserPlus, 
    ShieldCheck, 
    HelpCircle, 
    LogOut, 
    Settings, 
    ArrowRight, 
    Star, 
    Route, 
    ChevronRight,
    Camera,
    CheckCircle2,
    ArrowLeft,
    Wallet,
    Info,
    Gift,
    Shield,
    BarChart3,
    Languages,
    BadgePercent,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DriverBottomNav from '../../shared/components/DriverBottomNav';

const DriverProfile = () => {
    const navigate = useNavigate();
    const [isRouteBookingEnabled, setIsRouteBookingEnabled] = useState(false);

    // Dynamic Section Data with Project-mapped Paths
    const role = localStorage.getItem('role') || 'driver';
    const isOwner = role === 'owner';

    const sections = [
        ...(isOwner ? [{
            title: 'Fleet Management',
            items: [
                { id: 'fleet', label: 'Manage Fleet', icon: <Car size={20} />, path: '/taxi/driver/vehicle-fleet' },
                { id: 'drivers', label: 'Manage Drivers', icon: <UserPlus size={20} />, path: '/taxi/driver/manage-drivers' },
            ]
        }] : []),
        {
            title: 'Your Account',
            items: [
                { id: 'personal', label: 'Personal Information', sub: '+91 95898 14119', icon: <User size={20} />, path: '/taxi/driver/edit-profile' },
                { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} />, path: '/taxi/driver/wallet' },
                ...(!isOwner ? [
                    { id: 'vehicle', label: 'My Vehicle', icon: <Car size={20} />, path: '/taxi/driver/vehicle-fleet' },
                ] : []),
                { id: 'docs', label: 'Documents', icon: <FileText size={20} />, path: '/taxi/driver/documents' },
                { id: 'history', label: 'History', icon: <History size={20} />, path: '/taxi/driver/history' },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/taxi/driver/notifications' },
            ]
        },
        {
            title: 'Benefits',
            items: [
                { id: 'refer', label: 'Refer & Earn', icon: <Gift size={20} />, path: '/taxi/driver/referral' },
                { id: 'incentives', label: 'Incentives', icon: <BadgePercent size={20} />, path: '/taxi/driver/wallet' },
                { id: 'sos', label: 'SOS', icon: <Shield size={20} />, path: '/taxi/driver/security' },
            ]
        },
        {
            title: 'Earnings',
            items: [
                { id: 'earnings', label: 'My Earnings', icon: <Wallet size={20} />, path: '/taxi/driver/wallet' },
                { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/taxi/driver/history' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { id: 'languages', label: 'Languages', icon: <Languages size={20} />, path: '/taxi/driver/lang-select' },
                { id: 'routeBooking', label: 'MyRouteBooking', icon: <Route size={20} />, type: 'toggle' },
            ]
        },
        {
            title: 'Settings',
            items: [
                { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/taxi/driver/settings' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans select-none overflow-x-hidden pb-32">
            {/* Header - Compact & Aligned */}
            <header className="px-5 pt-4 pb-4 border-b border-slate-50 sticky top-0 bg-white z-[60]">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-slate-600 active:scale-95">
                        <ArrowLeft size={22} strokeWidth={2.5} />
                    </button>
                    <button className="flex items-center gap-1.5 text-[#88B04B] font-black text-[13px] uppercase tracking-wider">
                        <Info size={18} />
                        Help
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h2 className="text-[22px] font-black text-slate-900 leading-tight uppercase">
                            hritik<br/>raghuwanshi
                        </h2>
                        <div className="flex items-center gap-1.5 text-sky-500">
                            <Star size={14} fill="currentColor" />
                            <span className="text-[14px] font-black">0</span>
                        </div>
                    </div>
                    {/* Integrated Profile Image */}
                    <div className="relative">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                             <User size={32} className="text-white" strokeWidth={1.5} />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Camera size={16} className="text-white" />
                             </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                             <Check size={12} className="text-white" strokeWidth={4} />
                        </div>
                    </div>
                </div>
            </header>

            {/* List Menu */}
            <main className="space-y-1">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="pt-5">
                        <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{section.title}</h3>
                        <div className="space-y-0">
                            {section.items.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    whileTap={item.type !== 'toggle' ? { backgroundColor: '#F8F9FA' } : {}}
                                    onClick={() => item.path && navigate(item.path)}
                                    className="flex items-center justify-between px-6 py-4 group cursor-pointer border-b border-slate-50/50"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">{item.label}</h4>
                                            {item.sub && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.sub}</p>}
                                        </div>
                                    </div>
                                    {item.type === 'toggle' ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsRouteBookingEnabled(!isRouteBookingEnabled); }}
                                            className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 ${isRouteBookingEnabled ? 'bg-slate-900' : 'bg-slate-200'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: isRouteBookingEnabled ? 20 : 2 }}
                                                className="absolute top-1 w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                                            />
                                        </button>
                                    ) : (
                                        <ChevronRight size={16} className="text-slate-200" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>

            {/* Sign Out Section */}
            <div className="px-6 py-10">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-3 text-rose-500 font-black text-[12px] uppercase tracking-[0.2em] active:translate-x-1 transition-transform"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    Terminate Session
                </button>
            </div>

            <DriverBottomNav />
        </div>
    );
};

export default DriverProfile;
