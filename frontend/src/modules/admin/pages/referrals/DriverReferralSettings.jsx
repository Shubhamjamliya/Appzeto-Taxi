import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  HelpCircle,
  Loader2,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverReferralSettings = () => {
  const [formData, setFormData] = useState({
    enable_user_referral_earnings: false,
    referral_type: '',
    referral_commission_amount_for_user: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const token = localStorage.getItem('adminToken') || '';

  const fetchSettings = async () => {
    try {
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/driver', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setFormData({
          enable_user_referral_earnings: json.data.enable_user_referral_earnings === true || json.data.enable_user_referral_earnings === 1,
          referral_type: json.data.referral_type || '',
          referral_commission_amount_for_user: json.data.referral_commission_amount_for_user || ''
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/driver', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#2D3A6E]" size={40} strokeWidth={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-black text-[#2D3A6E] uppercase tracking-tight">Driver Referral Settings</h1>
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
           <span className="hover:text-gray-900 cursor-pointer">Driver Referral Settings</span>
           <ChevronRight size={14} className="opacity-50" />
           <span className="text-gray-900">Driver Referral Settings</span>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-12">
        
        {/* EARNINGS SETUP TOGGLE SECTION */}
        <div className="border border-gray-100 rounded-[28px] p-8 flex items-center justify-between group hover:border-[#2D3A6E]/10 transition-colors">
           <div className="space-y-1">
              <h3 className="text-[18px] font-black text-gray-950 uppercase tracking-tight">Driver Referral Earnings Setup</h3>
              <p className="text-[13px] font-medium text-gray-400">Invite others to use our app with your unique referral code and earn exciting rewards!</p>
           </div>
           <button 
             onClick={() => setFormData({...formData, enable_user_referral_earnings: !formData.enable_user_referral_earnings})}
             className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 shadow-inner ${formData.enable_user_referral_earnings ? 'bg-[#2D3A6E]' : 'bg-gray-200'}`}
           >
             <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-500 ${formData.enable_user_referral_earnings ? 'translate-x-7' : 'translate-x-1'}`} />
           </button>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* TYPE SELECT */}
           <div className="space-y-4">
              <label className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                 Driver Referral Type <HelpCircle size={14} className="text-gray-300" />
              </label>
              <div className="relative group">
                 <select 
                   value={formData.referral_type}
                   onChange={(e) => setFormData({...formData, referral_type: e.target.value})}
                   className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner cursor-pointer"
                 >
                    <option value="">Select</option>
                    <option value="instant">Instant for Referrer Driver</option>
                    <option value="instant_both">Instant for Referrer Driver and New Driver</option>
                    <option value="conditional">Conditional for Referrer Driver</option>
                    <option value="conditional_both">Conditional for Referrer Driver and New Driver</option>
                 </select>
                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-950 transition-colors" size={18} />
              </div>
           </div>

           {/* AMOUNT INPUT */}
           <div className="space-y-4">
              <div className="bg-indigo-50/10 rounded-[28px] p-8 border border-transparent hover:border-indigo-100/50 transition-all">
                <label className="text-[12px] font-black text-[#2D3A6E] uppercase tracking-widest mb-4 block">Earnings to Each Referral</label>
                <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm group">
                   <input 
                     type="text" 
                     placeholder="Enter the Amount"
                     value={formData.referral_commission_amount_for_user}
                     onChange={(e) => setFormData({...formData, referral_commission_amount_for_user: e.target.value})}
                     className="w-full h-10 px-3 bg-transparent text-[16px] font-bold text-gray-900 outline-none placeholder:text-gray-200"
                   />
                </div>
                <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none translate-x-1">Enter the amount Drivers earn for each referral.</p>
              </div>
           </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-6">
           <button 
             onClick={handleUpdate}
             disabled={saving}
             className="h-14 px-10 bg-[#2D3A6E] text-white rounded-[20px] text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#1e274a] transition-all shadow-2xl shadow-indigo-900/10 active:scale-95 disabled:opacity-50"
           >
              {saving ? <Loader2 className="animate-spin" size={18} /> : 'Update Referral Settings'}
           </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION - MATCHING SCREENSHOT */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
          >
             <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-8 py-5 rounded-[24px] shadow-2xl flex items-center justify-between ring-1 ring-emerald-200/50">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={18} strokeWidth={3} />
                   </div>
                   <span className="text-[14px] font-black uppercase tracking-tight italic">Referral settings updated successfully</span>
                </div>
                <button onClick={() => setShowToast(false)} className="text-emerald-400 hover:text-emerald-800 transition-colors">
                   <X size={20} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronDown = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default DriverReferralSettings;
