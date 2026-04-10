import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  Save, 
  Loader2,
  ChevronUp,
  Wallet,
  Smartphone,
  CheckCircle2,
  Bell,
  Zap,
  ArrowRight
} from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const SectionHeader = ({ title }) => (
  <div className="bg-slate-50 border-l-4 border-indigo-600 p-4 mb-8 rounded-r-lg shadow-sm">
    <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[13px] font-bold text-slate-700 block ml-0.5 whitespace-nowrap">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-[14px] text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm`}
    />
  </div>
);

const WalletSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/general-settings/wallet');
      setSettings(res.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load wallet configurations');
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
      await api.patch('/admin/general-settings/wallet', { settings });
      toast.success('Wallet configurations synchronized successfully!', {
         icon: <Wallet className="text-emerald-500" />,
         style: { borderRadius: '16px', background: '#1e293b', color: '#fff' }
      });
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to commit wallet cycles');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[3px] italic">Accessing Ledger Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-40">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Wallet Settings</h1>
           <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
             <span>Wallet Settings</span>
             <ChevronRight size={14} />
             <span className="text-indigo-600">Global Ledger Config</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           
           {/* Form Section */}
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-8">
              <InputField label="Minimum Wallet Amount For Transfer" name="minimum_wallet_amount_for_transfer" value={settings.minimum_wallet_amount_for_transfer} onChange={handleChange} type="number" required />
              <InputField label="Driver Wallet Minimum Amount To Get An Order" name="driver_wallet_minimum_amount_to_get_an_order" value={settings.driver_wallet_minimum_amount_to_get_an_order} onChange={handleChange} type="number" required />
              <InputField label="Owner Wallet Minimum Amount To Get An Order" name="owner_wallet_minimum_amount_to_get_an_order" value={settings.owner_wallet_minimum_amount_to_get_an_order} onChange={handleChange} type="number" required />
              <InputField label="Minimum amount added to wallet" name="minimum_amount_added_to_wallet" value={settings.minimum_amount_added_to_wallet} onChange={handleChange} type="number" required />
              
              <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-2xl group transition-all hover:bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs tracking-tighter">
                      BONUS
                   </div>
                   <span className="text-[14px] font-bold text-slate-700">Enable Joining Bonus</span>
                </div>
                <button
                  onClick={() => handleChange('enable_joining_bonus', settings.enable_joining_bonus === "1" ? "0" : "1")}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                    settings.enable_joining_bonus === "1" ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${settings.enable_joining_bonus === "1" ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <InputField label="Joining Bonus for User" name="joining_bonus_for_user" value={settings.joining_bonus_for_user} onChange={handleChange} type="number" />
              <InputField label="Joining Bonus for Driver" name="joining_bonus_for_driver" value={settings.joining_bonus_for_driver} onChange={handleChange} type="number" />

              <div className="pt-4 flex justify-end">
                 <button 
                  onClick={handleUpdate}
                  disabled={saving}
                  className="bg-[#2563EB] text-white px-10 py-3.5 rounded-xl text-[14px] font-black shadow-xl shadow-blue-500/20 flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   {saving ? "SAVING..." : "COMMIT CHANGES"}
                 </button>
              </div>
           </div>

           {/* Mobile Preview Section */}
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-8 opacity-40">
                 <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Mobile Preview</h4>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                 </div>
              </div>
              
              <div className="w-[300px] h-[600px] bg-slate-900 rounded-[50px] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 inset-x-0 h-6 flex items-center justify-center">
                    <div className="w-20 h-1 bg-slate-800 rounded-full mt-1"></div>
                 </div>
                 
                 <div className="h-full bg-slate-50 px-6 pt-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm"><ChevronLeft size={20} /></div>
                       <span className="text-[16px] font-black text-slate-800">Wallet</span>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/30 mb-8 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                       <span className="text-[12px] font-bold opacity-60 block mb-2 uppercase tracking-widest">Wallet Balance</span>
                       <div className="text-3xl font-black">₹ -47.55</div>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                       <div className="flex-1 bg-white border border-slate-100 rounded-xl py-3 text-center text-[11px] font-black text-indigo-600 shadow-sm">Add Money</div>
                       <div className="flex-1 bg-white border border-slate-100 rounded-xl py-3 text-center text-[11px] font-black text-indigo-600 shadow-sm">Withdraw</div>
                       <div className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-center text-[11px] font-black text-slate-400">Transfer</div>
                    </div>

                    <div className="space-y-4">
                       <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">SAVED CARDS</div>
                       <button className="w-full bg-[#111827] text-white py-4 rounded-xl text-[13px] font-black shadow-lg">Add a card</button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[40px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] border-t border-slate-100">
                       <div className="relative mb-6">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                         <input type="text" value="50" readOnly className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 flex items-center justify-center pl-10 text-xl font-black text-slate-800" />
                       </div>
                       <div className="flex items-center gap-3 mb-8">
                          {['50', '100', '150'].map(val => (
                            <div key={val} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-center text-[14px] font-black text-slate-700">$ {val}</div>
                          ))}
                       </div>
                       <div className="flex gap-4">
                          <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[12px]">CANCEL</button>
                          <button className="flex-2 bg-indigo-600 text-white py-3 rounded-xl font-black text-[12px] shadow-lg shadow-indigo-600/30 px-6">ADD MONEY</button>
                       </div>
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

export default WalletSettings;
