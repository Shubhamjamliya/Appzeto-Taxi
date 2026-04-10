import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Save, 
  Loader2,
  ChevronUp,
  Gift,
  Smartphone,
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const TipSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/general-settings/tip');
      setSettings(res.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load tip configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.patch('/admin/general-settings/tip', { settings });
      toast.success('Tip preferences updated!');
    } catch (err) {
      toast.error('Failed to save tip settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-40">
        
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Tip Settings</h1>
           <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
             <span>App Settings</span>
             <ChevronRight size={14} />
             <span className="text-indigo-600">Tip Configurations</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           <div className="space-y-8">
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 flex items-center justify-between">
                 <span className="text-[14px] font-bold text-slate-700 uppercase tracking-wider">Enable Driver Tips Feature</span>
                 <button
                   onClick={() => setSettings(s => ({ ...s, enable_tips: s.enable_tips === "1" ? "0" : "1" }))}
                   className={`w-12 h-6 rounded-full relative transition-all ${settings.enable_tips === "1" ? 'bg-indigo-600' : 'bg-slate-300'}`}
                 >
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.enable_tips === "1" ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 space-y-6">
                 <div>
                    <label className="text-[13px] font-bold text-slate-700 block mb-2">Minimum tip amount *</label>
                    <input 
                      type="number" 
                      value={settings.min_tip_amount || '10'} 
                      onChange={(e) => setSettings(s => ({ ...s, min_tip_amount: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-xl font-black focus:border-indigo-500 outline-none transition-all"
                    />
                 </div>
                 <div className="flex justify-end">
                    <button onClick={handleUpdate} disabled={saving} className="bg-[#2563EB] text-white px-10 py-3.5 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                       {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                       {saving ? "SAVING..." : "SAVE"}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 flex flex-col items-center">
              <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-8 self-start">Mobile Preview</h4>
              <div className="w-[300px] h-[600px] bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden group">
                 <div className="h-full bg-slate-50 pb-20">
                    <div className="h-40 bg-slate-200 animate-pulse mb-6"></div>
                    <div className="px-6 space-y-4">
                       <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                       <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                       <div className="bg-white rounded-t-[32px] p-8 -mx-6 -mb-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                          <h5 className="text-[14px] font-black text-center mb-1">Trip Fare $550</h5>
                          <p className="text-[11px] text-slate-400 text-center mb-6">Show appreciation with a tip!</p>
                          <div className="flex items-center gap-2 mb-8">
                             {['10', '20', '30'].map(val => (
                               <div key={val} className="flex-1 border border-slate-200 rounded-xl py-3 text-center text-[12px] font-black text-indigo-600 transition-all hover:bg-indigo-50 cursor-pointer">$ {val}</div>
                             ))}
                          </div>
                          <div className="flex gap-4">
                             <button className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-black text-[12px]">Cancel</button>
                             <button className="flex-2 bg-indigo-600 text-white py-3.5 rounded-xl font-black text-[12px] shadow-lg shadow-indigo-600/30 px-6">Add Tip</button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TipSettings;
