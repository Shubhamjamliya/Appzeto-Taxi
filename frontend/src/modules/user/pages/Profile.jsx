import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, Bell, Shield, LogOut, ChevronRight, HelpCircle, MapPin, Star, Package, Wrench, Gift } from 'lucide-react';
import BottomNavbar from '../components/BottomNavbar';

const menuItems = [
  { icon: User,        title: 'Profile Settings',  sub: 'Manage your personal info',        path: '/profile/settings',      bg: 'bg-orange-50',  color: 'text-orange-500' },
  { icon: Wallet,      title: 'Wallet',             sub: 'Balance, transactions & top-up',   path: '/wallet',                bg: 'bg-blue-50',    color: 'text-blue-500'   },
  { icon: MapPin,      title: 'Saved Addresses',    sub: 'Home, office & others',            path: '/profile/addresses',     bg: 'bg-emerald-50', color: 'text-emerald-500'},
  { icon: Package,     title: 'My Rides',           sub: 'History & receipts',               path: '/activity',              bg: 'bg-violet-50',  color: 'text-violet-500' },
  { icon: Bell,        title: 'Notifications',      sub: 'Offers, news & safety alerts',     path: '/notifications',         bg: 'bg-purple-50',  color: 'text-purple-500' },
  { icon: Shield,      title: 'Security',           sub: 'Manage your privacy',              path: '/profile/security',      bg: 'bg-red-50',     color: 'text-red-500'    },
  { icon: Gift,        title: 'Referral',           sub: 'Invite friends & earn ₹50',        path: '/referral',              bg: 'bg-yellow-50',  color: 'text-yellow-500' },
  { icon: HelpCircle,  title: 'Support',            sub: 'Get help with your experience',    path: '/support/tickets',       bg: 'bg-slate-100',  color: 'text-slate-500'  },
  { icon: Wrench,      title: 'Workshop & RSA',     sub: 'Roadside assistance on demand',    path: '/services/workshop-rsa', bg: 'bg-amber-50',   color: 'text-amber-500'  },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans pb-28 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-orange-100/60 blur-3xl pointer-events-none" />
      <div className="absolute top-52 left-[-60px] h-52 w-52 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-12 pb-5">

        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">Account</p>
            <h1 className="text-[19px] font-black tracking-tight text-slate-900 leading-tight">My Profile</h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/profile/settings')}
            className="w-9 h-9 rounded-[12px] border border-white/80 bg-white/90 flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.07)]">
            <User size={16} className="text-slate-700" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-[22px] border border-white/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] px-4 py-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-[18px] bg-orange-500 flex items-center justify-center shadow-[0_6px_16px_rgba(249,115,22,0.25)]">
              <span className="text-[18px] font-black text-white">HR</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-black text-slate-900 leading-tight capitalize">Hritik Raghuwanshi</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">+91 98765 43210</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 rounded-full px-2 py-0.5">
              <Star size={9} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-slate-800">4.9</span>
            </div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Active</span>
          </div>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="px-5 space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400 mb-1 ml-1">Settings</p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden">
          {menuItems.map(({ icon: Icon, title, sub, path, bg, color }, i) => (
            <motion.button key={title} type="button" whileTap={{ scale: 0.99 }}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-slate-50 ${
                i < menuItems.length - 1 ? 'border-b border-slate-50' : ''
              }`}>
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={15} className={color} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-slate-900 leading-tight">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 shrink-0" strokeWidth={2.5} />
            </motion.button>
          ))}
        </motion.div>

        {/* Sign out */}
        <motion.button type="button" whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] border border-red-100 bg-red-50/80 text-[12px] font-black text-red-500 uppercase tracking-widest shadow-[0_2px_8px_rgba(239,68,68,0.08)] mt-1">
          <LogOut size={14} strokeWidth={2.5} />
          Sign Out
        </motion.button>

        {/* App version */}
        <p className="text-center text-[10px] font-bold text-slate-300 pt-1">Rydon24 v2.4.1</p>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Profile;
