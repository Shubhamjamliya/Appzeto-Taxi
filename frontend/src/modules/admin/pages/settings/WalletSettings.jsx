import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Save, 
  Loader2,
  Wallet,
  ArrowLeft,
  CreditCard,
  Plus
} from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8 h-full">
    {title && (
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-8 h-full">
      {children}
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, required }) => {
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";
  
  return (
    <div className="space-y-1 w-full">
      <label className={labelClass}>{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type="text"
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
      toast.success('Wallet settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
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
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans">
      
      {/* Header Block */}
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-[15px] font-black text-gray-800 uppercase tracking-widest">WALLET SETTINGS</h1>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
           <span>Wallet Settings</span>
           <ChevronRight size={12} strokeWidth={3} />
           <span className="text-gray-600">Wallet Settings</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-32">
         
         {/* Form Section */}
         <div className="h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
               <div className="p-10 flex-grow space-y-8">
                  <InputField 
                    label="Minimum Wallet Amount For Transfer" 
                    name="minimum_wallet_amount_for_transfer" 
                    value={settings.minimum_wallet_amount_for_transfer} 
                    onChange={handleChange} 
                    placeholder="100" 
                    required 
                  />
                  <InputField 
                    label="Driver Wallet Minimum Amount To Get An Order" 
                    name="driver_wallet_minimum_amount_to_get_an_order" 
                    value={settings.driver_wallet_minimum_amount_to_get_an_order} 
                    onChange={handleChange} 
                    placeholder="-10000" 
                    required 
                  />
                  <InputField 
                    label="Owner Wallet Minimum Amount To Get An Order" 
                    name="owner_wallet_minimum_amount_to_get_an_order" 
                    value={settings.owner_wallet_minimum_amount_to_get_an_order} 
                    onChange={handleChange} 
                    placeholder="-10000" 
                    required 
                  />
                  <InputField 
                    label="Minimum amount added to wallet" 
                    name="minimum_amount_added_to_wallet" 
                    value={settings.minimum_amount_added_to_wallet} 
                    onChange={handleChange} 
                    placeholder="50" 
                    required 
                  />
               </div>
               <div className="px-10 py-6 border-t border-gray-50 bg-white flex justify-end">
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="bg-[#405189] text-white px-8 py-2 rounded-lg text-sm font-semibold hover:bg-[#344475] transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                  </button>
               </div>
            </div>
         </div>

         {/* Mobile Preview Block */}
         <SectionCard title="Mobile View">
            <div className="flex justify-center py-4 bg-gray-50/50 rounded-xl">
                {/* Mobile Mockup Structure */}
                <div className="w-[300px] bg-white rounded-[40px] shadow-2xl border-[6px] border-[#313131] h-[600px] overflow-hidden flex flex-col relative">
                    {/* App Header */}
                    <div className="bg-[#313131] p-4 flex items-center gap-3">
                        <ArrowLeft size={16} className="text-white" />
                        <span className="text-white text-xs font-semibold">Wallet</span>
                    </div>

                    <div className="flex-grow bg-[#F3F5F7] p-4 space-y-4 overflow-y-auto hide-scrollbar">
                        {/* Balance Card */}
                        <div className="bg-[#2B3B93] rounded-xl p-6 text-white text-center shadow-lg">
                            <p className="text-[10px] opacity-70 mb-2">Wallet Balance</p>
                            <h2 className="text-2xl font-bold">₹ -47.55</h2>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                           {['Add Money', 'Withdraw', 'Transfer'].map(action => (
                              <button key={action} className="text-[9px] font-bold text-gray-500 bg-white py-2.5 rounded-lg shadow-sm">{action}</button>
                           ))}
                        </div>

                        {/* Saved Cards */}
                        <div className="space-y-3">
                           <h4 className="text-[11px] font-bold text-gray-700">Saved Cards</h4>
                           <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                               <CreditCard size={24} className="text-gray-300 mb-2" />
                               <p className="text-[9px] text-gray-400 text-center">No cards added. Add a card to link to your wallet.</p>
                           </div>
                           <button className="w-full bg-[#2B3B93] text-white py-2.5 rounded-lg text-[10px] font-bold shadow-md">Add a card</button>
                        </div>

                        {/* Money Input Modal Peek */}
                        <div className="bg-white rounded-t-2xl shadow-xl p-4 space-y-4 pt-6 border border-gray-100">
                           <div className="flex items-center gap-2 border border-blue-100 bg-blue-50/30 rounded-lg px-3 py-2">
                              <span className="text-gray-400 text-sm">$</span>
                              <span className="text-gray-600 text-sm">50</span>
                           </div>
                           <div className="flex justify-between gap-2">
                               {['$50', '$100', '$150'].map(val => (
                                  <div key={val} className="flex-1 py-1 px-2 border border-gray-100 rounded text-center text-[10px] text-gray-600 bg-white">{val}</div>
                               ))}
                           </div>
                           <div className="flex gap-2">
                              <button className="flex-1 border border-blue-600 text-blue-600 font-bold py-2 rounded-lg text-[10px]">Cancel</button>
                              <button className="flex-1 bg-blue-700 text-white font-bold py-2 rounded-lg text-[10px]">Add Money</button>
                           </div>
                        </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="bg-white py-4 flex flex-col items-center">
                       <div className="flex justify-between w-full px-12 mb-2">
                          <div className="w-4 h-4 text-gray-300"><ChevronRight size={16} /></div>
                          <div className="w-4 h-4 rounded-lg border-2 border-gray-300"></div>
                          <div className="w-4 h-4 text-gray-300"><Loader2 size={16} /></div>
                       </div>
                       <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </div>
         </SectionCard>

      </div>
    </div>
  );
};

export default WalletSettings;
