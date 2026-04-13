import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, CheckCircle2, Gift, Save, ArrowLeft } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const JoiningBonusSettings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    joining_bonus_enabled: "0",
    joining_bonus_amount_for_user: 0,
    joining_bonus_amount_for_driver: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getJoiningBonusSettings();
        if (res.data) {
          setFormData({
            joining_bonus_enabled: String(res.data.joining_bonus_enabled || "0"),
            joining_bonus_amount_for_user: Number(res.data.joining_bonus_amount_for_user || 0),
            joining_bonus_amount_for_driver: Number(res.data.joining_bonus_amount_for_driver || 0)
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateJoiningBonusSettings(formData);
      if (res.data) {
        setSuccess(true);
        toast.success('Joining bonus settings updated successfully');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="text-sm text-gray-500 font-medium">Loading settings...</span>
      </div>
    </div>
  );

  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider";
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Referral Management</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Joining Bonus Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 uppercase tracking-tight">Joining Bonus Settings</h1>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Main Toggle Section */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">Joining Bonus Activation</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Provide incentives to new users and drivers upon successful registration.</p>
              </div>
            </div>
            <button 
              onClick={() => setFormData({...formData, joining_bonus_enabled: formData.joining_bonus_enabled === "1" ? "0" : "1"})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.joining_bonus_enabled === "1" ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.joining_bonus_enabled === "1" ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-8 space-y-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase">Rider Joining Bonus</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <label className={labelClass}>Amount (₹)</label>
                    <input 
                      type="number" 
                      value={formData.joining_bonus_amount_for_user}
                      onChange={(e) => setFormData({...formData, joining_bonus_amount_for_user: Number(e.target.value)})}
                      className={inputClass}
                      placeholder="50"
                    />
                  </div>
               </div>
               <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-8 space-y-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase">Driver Joining Bonus</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <label className={labelClass}>Amount (₹)</label>
                    <input 
                      type="number" 
                      value={formData.joining_bonus_amount_for_driver}
                      onChange={(e) => setFormData({...formData, joining_bonus_amount_for_driver: Number(e.target.value)})}
                      className={inputClass}
                      placeholder="50"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-fit flex items-center gap-2 px-6 py-2.5 bg-indigo-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update Bonus Policy
            </button>

            {success && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-xs font-bold uppercase tracking-tight">Joining bonus policy updated successfully</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoiningBonusSettings;

