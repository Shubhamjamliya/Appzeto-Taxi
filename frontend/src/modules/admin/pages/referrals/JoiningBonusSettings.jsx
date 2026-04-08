import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, CheckCircle2, Gift } from 'lucide-react';

const JoiningBonusSettings = () => {
  const [formData, setFormData] = useState({
    joining_bonus_enabled: "0",
    joining_bonus_amount_for_user: 0,
    joining_bonus_amount_for_driver: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('adminToken') || '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/joining-bonus', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setFormData({
            joining_bonus_enabled: json.data.joining_bonus_enabled || "0",
            joining_bonus_amount_for_user: json.data.joining_bonus_amount_for_user || 0,
            joining_bonus_amount_for_driver: json.data.joining_bonus_amount_for_driver || 0
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
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/referral/settings/joining-bonus', {
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

  if (loading) return <div className="flex items-center justify-center min-h-[500px]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-gray-900 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[12px] font-black tracking-widest text-[#2D3748] uppercase">JOINING BONUS SETTINGS</h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <span>Joining Bonus Settings</span>
           <ChevronRight size={12} />
           <span className="text-gray-950">Joining Bonus Settings</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8 space-y-10">
        <div className="flex items-start justify-between border border-[#E2E8F0] rounded-xl p-8 bg-gray-50/20">
           <div className="space-y-1">
              <h3 className="text-[18px] font-bold text-[#2D3748]">Joining Bonus Activation</h3>
              <p className="text-[14px] text-gray-500">Provide incentives to new users and drivers upon successful registration.</p>
           </div>
           <button 
             onClick={() => setFormData({...formData, joining_bonus_enabled: formData.joining_bonus_enabled === "1" ? "0" : "1"})}
             className={`relative inline-flex h-[24px] w-[46px] items-center rounded-full transition-colors duration-300 ${formData.joining_bonus_enabled === "1" ? 'bg-[#3F51B5]' : 'bg-gray-200'}`}
           >
             <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-300 ${formData.joining_bonus_enabled === "1" ? 'translate-x-[24px]' : 'translate-x-[4px]'}`} />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 space-y-6">
              <h4 className="text-[16px] font-bold text-[#2D3748]">Rider Joining Bonus</h4>
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <label className="block text-[14px] font-medium text-[#4A5568] mb-3">Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.joining_bonus_amount_for_user}
                  onChange={(e) => setFormData({...formData, joining_bonus_amount_for_user: Number(e.target.value)})}
                  className="w-full h-[48px] px-4 border border-[#E2E8F0] rounded-lg text-[14px] text-[#2D3748] outline-none"
                />
              </div>
           </div>
           <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 space-y-6">
              <h4 className="text-[16px] font-bold text-[#2D3748]">Driver Joining Bonus</h4>
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <label className="block text-[14px] font-medium text-[#4A5568] mb-3">Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.joining_bonus_amount_for_driver}
                  onChange={(e) => setFormData({...formData, joining_bonus_amount_for_driver: Number(e.target.value)})}
                  className="w-full h-[48px] px-4 border border-[#E2E8F0] rounded-lg text-[14px] text-[#2D3748] outline-none"
                />
              </div>
           </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="px-6 py-3.5 bg-[#3F51B5] text-white rounded-lg text-[14px] font-bold hover:bg-[#303F9F] transition-all flex items-center gap-2"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Update Bonus Policy
        </button>
      </div>
    </div>
  );
};

export default JoiningBonusSettings;
