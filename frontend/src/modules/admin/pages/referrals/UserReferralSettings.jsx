import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  HelpCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const UserReferralSettings = () => {
  const [formData, setFormData] = useState({
    enable_user_referral_earnings: false,
    referral_type: 'instant',
    referral_commission_amount_for_user: '0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('adminToken') || '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setFormData({
            enable_user_referral_earnings: json.data.enable_user_referral_earnings === true,
            referral_type: json.data.referral_type || 'instant',
            referral_commission_amount_for_user: json.data.referral_commission_amount_for_user || '0'
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/user', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-gray-900 pb-20">
      {/* BREADCRUMB & TITLE */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[12px] font-black tracking-widest text-[#2D3748] uppercase">USER REFERRAL SETTINGS</h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <span>User Referral Settings</span>
           <ChevronRight size={12} />
           <span className="text-gray-950">User Referral Settings</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8 space-y-10">
        
        {/* Earnings Setup Header Card */}
        <div className="flex items-start justify-between border border-[#E2E8F0] rounded-xl p-8 bg-white">
           <div className="space-y-1">
              <h3 className="text-[18px] font-bold text-[#2D3748]">User Referral Earnings Setup</h3>
              <p className="text-[14px] text-gray-500">Invite others to use our app with your unique referral code and earn exciting rewards!</p>
           </div>
           <button 
             onClick={() => setFormData({...formData, enable_user_referral_earnings: !formData.enable_user_referral_earnings})}
             className={`relative inline-flex h-[24px] w-[46px] items-center rounded-full transition-colors duration-300 focus:outline-none ${formData.enable_user_referral_earnings ? 'bg-[#2D3748]' : 'bg-gray-200'}`}
           >
             <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-300 ${formData.enable_user_referral_earnings ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
           </button>
        </div>

        {/* Commission Selection */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[#2D3748]">Referral Commission Type</span>
              <HelpCircle size={16} className="text-gray-400" />
           </div>
           <div className="relative max-w-lg">
             <select 
               value={formData.referral_type}
               onChange={(e) => setFormData({...formData, referral_type: e.target.value})}
               className="w-full h-[48px] px-4 border border-[#CBD5E0] rounded-lg bg-white text-[14px] font-medium text-[#4A5568] focus:ring-1 focus:ring-indigo-500 outline-none appearance-none transition-all"
             >
                <option value="instant">Instant for Referrer User</option>
                <option value="milestone">Milestone for Referrer User</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={16} className="rotate-90 text-gray-400" />
             </div>
           </div>
        </div>

        {/* Earnings Card Inner */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 space-y-1">
              <h4 className="text-[16px] font-bold text-[#2D3748]">User Share the code To Refer User</h4>
              <p className="text-[14px] text-gray-500">Offer a reward to Users for each referral when they share their code.</p>
           </div>
           <div className="w-full md:w-[450px] bg-white border border-[#E2E8F0] rounded-xl p-6">
              <label className="block text-[14px] font-medium text-[#4A5568] mb-3">Earnings to Each Referral</label>
              <input 
                type="text" 
                value={formData.referral_commission_amount_for_user}
                onChange={(e) => setFormData({...formData, referral_commission_amount_for_user: e.target.value.replace(/[^0-9.]/g, '')})}
                className="w-full h-[48px] px-4 bg-white border border-[#E2E8F0] rounded-lg text-[14px] text-[#2D3748] outline-none mb-2"
                placeholder="0"
              />
              <p className="text-[12px] text-gray-400">Enter the amount Users earn for each referral.</p>
           </div>
        </div>

        {/* Update Button */}
        <div className="pt-4 flex items-center gap-4">
           <button 
             onClick={handleUpdate}
             disabled={saving}
             className="px-6 py-3.5 bg-[#3F51B5] text-white rounded-lg text-[14px] font-bold hover:bg-[#303F9F] transition-all flex items-center gap-2"
           >
             {saving && <Loader2 className="animate-spin" size={16} />}
             Update Referral Settings
           </button>
           {success && (
             <div className="flex items-center gap-2 text-emerald-600 font-bold text-[14px] animate-in fade-in duration-300">
                <CheckCircle2 size={18} /> Settings Updated
             </div>
           )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-20 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-6 opacity-60">
         <div>2026 © Appzeto.</div>
         <div className="flex items-center gap-4">
            <span>Design & Develop by Appzeto</span>
            <span>App version 2.3</span>
         </div>
      </footer>
    </div>
  );
};

export default UserReferralSettings;
