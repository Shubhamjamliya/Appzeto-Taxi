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
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  Gem
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

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required }) => {
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";
  
  return (
    <div className="space-y-1 w-full">
      <label className={labelClass}>{label} {required && <span className="text-red-600">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
};

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
         style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
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
          <span className="text-gray-700">Wallet Configuration</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Global Wallet Ledger</h1>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32">
         
         {/* Form Section */}
         <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-10">
            <div>
               <SectionHeader title="Threshold Parameters" description="Define minimum balances required for platform operations" icon={ShieldCheck} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Min Transfer Amount" name="minimum_wallet_amount_for_transfer" value={settings.minimum_wallet_amount_for_transfer} onChange={handleChange} type="number" required />
                  <InputField label="Min Top-up Amount" name="minimum_amount_added_to_wallet" value={settings.minimum_amount_added_to_wallet} onChange={handleChange} type="number" required />
                  <InputField label="Min Driver Balance (Orders)" name="driver_wallet_minimum_amount_to_get_an_order" value={settings.driver_wallet_minimum_amount_to_get_an_order} onChange={handleChange} type="number" required />
                  <InputField label="Min Owner Balance (Orders)" name="owner_wallet_minimum_amount_to_get_an_order" value={settings.owner_wallet_minimum_amount_to_get_an_order} onChange={handleChange} type="number" required />
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
               <button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full md:w-auto bg-indigo-600 text-white px-12 py-4 rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
               >
                 {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {saving ? "SYNCHRONIZING..." : "SAVE CONFIGURATIONS"}
               </button>
            </div>
         </div>

         {/* Visual Preview / Tips Block */}
         <div className="lg:col-span-5 space-y-8">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-2">Ledger Integrity</h4>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                     Wallet thresholds prevent balance depletion and ensure service continuity. Minimum balances enforce credit-first operations for non-cash bookings.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full">
                     <ShieldCheck size={12} /> Compliance Ready
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            </div>

            {/* Simulated UI Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
                <div className="w-full text-center mb-6">
                   <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[.25em]">Mobile App Preview</h5>
                </div>
                
                <div className="w-64 h-[440px] bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 p-5 flex flex-col scale-100 hover:scale-[1.02] transition-transform duration-500">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><ArrowLeft size={14} /></div>
                      <span className="text-xs font-bold text-gray-900">Wallet</span>
                   </div>

                   <div className="bg-indigo-600 rounded-2xl p-5 text-white mb-6">
                      <p className="text-[8px] opacity-60 font-bold mb-1 uppercase">Available Balance</p>
                      <h6 className="text-2xl font-black">₹ 140.00</h6>
                   </div>

                   <div className="flex gap-2 mb-6">
                      {['Add', 'Sent', 'History'].map(btn => (
                        <div key={btn} className="flex-1 text-[8px] font-bold text-indigo-600 bg-indigo-50/50 py-2 rounded-lg text-center">{btn}</div>
                      ))}
                   </div>

                   <div className="space-y-3">
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Recent Activity</p>
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><PlusCircle size={10} /></div>
                              <div className="flex flex-col">
                                 <span className="text-[7px] font-bold text-gray-900">Wallet Refill</span>
                                 <span className="text-[6px] text-gray-400">10 Apr 2026</span>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-green-600">+₹500</span>
                        </div>
                      ))}
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
