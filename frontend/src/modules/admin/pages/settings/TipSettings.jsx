import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Save, 
  Loader2,
  ChevronUp,
  Gift,
  Smartphone,
  ChevronLeft,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Star
} from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-gray-400 font-medium">{description}</p>
    </div>
  </div>
);

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
      toast.success('Tip preferences synchronized successfully!', {
         icon: <Heart className="text-red-500" />,
         style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch (err) {
      toast.error('Failed to save tip settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans">
      
      {/* Header Block */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Settings</span>
          <ChevronRight size={12} />
          <span>General</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Driver Tip Policy</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Driver Tip Settings</h1>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32">
         
         {/* Form Section */}
         <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-10">
            <div>
               <SectionHeader title="Tip Availability" description="Control whether customers can add tips to their ride fares" icon={Heart} />
               <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Star size={18} />
                     </div>
                     <div>
                        <span className="text-sm font-bold text-gray-900 block">Enable In-App Tipping</span>
                        <p className="text-[11px] text-gray-400">Offer riders a way to appreciate drivers</p>
                     </div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, enable_tips: s.enable_tips === "1" ? "0" : "1" }))}
                    className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                      settings.enable_tips === "1" ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[5px] transition-all duration-300 ${settings.enable_tips === "1" ? 'right-[5px]' : 'left-[5px]'}`} />
                  </button>
               </div>
            </div>

            <div className="pt-4">
               <SectionHeader title="Financial Constraints" description="Set boundaries for tip amounts to ensure fair usage" icon={ShieldCheck} />
               <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block">Minimum Tip Allowed</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                     <input 
                       type="number" 
                       value={settings.min_tip_amount || '10'} 
                       onChange={(e) => setSettings(s => ({ ...s, min_tip_amount: e.target.value }))}
                       className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-10 pr-6 text-xl font-black text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
               <button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full md:w-auto bg-indigo-600 text-white px-12 py-4 rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
               >
                 {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {saving ? "SAVING..." : "SAVE CONFIGURATIONS"}
               </button>
            </div>
         </div>

         {/* Visual Preview */}
         <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
                <div className="w-full text-center mb-6">
                   <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[.25em]">Customer Experience Preview</h5>
                </div>
                
                <div className="w-64 h-[440px] bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden flex flex-col scale-100 hover:scale-[1.02] transition-transform duration-500">
                   <div className="flex-1 bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center">
                       <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
                          <Heart size={32} />
                       </div>
                       <h6 className="text-sm font-black text-gray-900 mb-1">Trip Completed!</h6>
                       <p className="text-[10px] text-gray-400 leading-relaxed">Trip Total: $550.00</p>
                   </div>
                   
                   <div className="bg-white p-6 pt-0 space-y-5">
                      <div className="text-center">
                         <p className="text-[10px] font-bold text-gray-900 mb-3">Add a Tip for Driver</p>
                         <div className="flex gap-2">
                            {['10', '20', '30'].map(val => (
                              <div key={val} className="flex-1 border border-indigo-100 rounded-xl py-2 text-[10px] font-black text-indigo-600 bg-indigo-50/30">$ {val}</div>
                            ))}
                         </div>
                      </div>
                      
                      <div className="flex gap-2">
                         <button className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-xl font-bold text-[9px]">SKIP</button>
                         <button className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold text-[9px] shadow-lg shadow-indigo-100">CONFIRM TIP</button>
                      </div>
                   </div>
                </div>
            </div>
         </div>
      </div>

      <button
         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         className="fixed bottom-10 right-10 bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl hover:bg-slate-900 transition-all z-50 hover:-translate-y-2 active:translate-y-0"
      >
         <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default TipSettings;
