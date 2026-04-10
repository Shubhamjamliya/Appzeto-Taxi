import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Minus,
  ArrowUp
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const SMSGateways = () => {
  const [loading, setLoading] = useState(true);
  const [settingsRows, setSettingsRows] = useState([]);
  const [submitting, setSubmitting] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSMSSettings();
      setSettingsRows(res.data?.rows || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load SMS settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (slug, data) => {
    try {
      setSubmitting(prev => ({ ...prev, [slug]: true }));
      await adminService.updateSMSSettings(data);
      toast.success(`${slug} configuration updated`);
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSubmitting(prev => ({ ...prev, [slug]: false }));
    }
  };

  const getSettingValue = (key) => {
    return settingsRows.find(r => r.key === key)?.value || '';
  };

  const updateLocalValue = (key, value) => {
    setSettingsRows(prev => prev.map(row => row.key === key ? { ...row, value } : row));
  };

  const handleToggle = async (slug, key) => {
    try {
      const currentValue = getSettingValue(key);
      const newValue = currentValue === "1" ? "0" : "1";
      await adminService.updateSMSSettings({ [key]: newValue });
      updateLocalValue(key, newValue);
      toast.success(`${slug} ${newValue === "1" ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const smsProviders = [
    { name: 'Twilio', slug: 'twilio', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo.svg', enableKey: 'enable_twilio', fields: [
      { label: 'Sid', key: 'twilio_sid' },
      { label: 'Token', key: 'twilio_token' },
      { label: 'Twilio Mobile Number', key: 'twilio_from_number' }
    ]},
    { name: 'SMS ALA', slug: 'smsala', logo: 'https://smsala.com/wp-content/uploads/2021/04/smsala-logo-1.png', enableKey: 'enable_sms_ala', fields: [
      { label: 'Api Key', key: 'smsala_api_key' },
      { label: 'Api Secret Key', key: 'smsala_secrect_key' },
      { label: 'Token', key: 'smsala_token' },
      { label: 'SMS ALA Mobile Number', key: 'smsala_from_number' }
    ]},
    { name: 'SMS India Hub', slug: 'sms_india_hub', logo: 'https://www.smsindiahub.in/wp-content/uploads/2019/11/sms-india-hub-logo-1.png', enableKey: 'enable_sms_india_hub', fields: [
      { label: 'SMS India Hub Api Key', key: 'sms_india_hub_api_key' },
      { label: 'SMS India Hub SID', key: 'sms_india_hub_sid' }
    ]},
    { name: 'Kudi SMS', slug: 'kudi_sms', logo: 'https://kudisms.com/img/logo.png', enableKey: 'enable_kudi_sms_api_key', fields: [
      { label: 'Kudi SMS Api Key', key: 'kudi_sms_api_key' },
      { label: 'Kudi SMS Sender ID', key: 'kudi_sms_sender_id' }
    ]}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">SMS Gateway</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>SMS Gateway</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">SMS Gateway</span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Top Feature Toggle Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex items-center justify-between">
           <span className="text-[14px] font-bold text-gray-700">Enable Firebase OTP</span>
           <label className="relative inline-flex items-center cursor-pointer">
              <input 
                 type="checkbox" 
                 checked={getSettingValue('enable_firebase_otp') === "1"} 
                 onChange={() => handleToggle('Firebase OTP', 'enable_firebase_otp')}
                 className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51B5]"></div>
           </label>
        </div>

        {/* SMS Provider Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {smsProviders.map((provider) => (
              <div key={provider.slug} className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex flex-col min-h-[480px]">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[13px] font-black text-gray-800 tracking-tight">{provider.name}</h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                          type="checkbox" 
                          checked={getSettingValue(provider.enableKey) === "1"} 
                          onChange={() => handleToggle(provider.name, provider.enableKey)}
                          className="sr-only peer" 
                       />
                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51B5]"></div>
                    </label>
                 </div>

                 <div className="flex justify-center mb-10">
                    <img src={provider.logo} alt={provider.name} className="h-10 object-contain" />
                 </div>

                 <div className="space-y-5 flex-1">
                    {provider.fields.map((field) => (
                       <div key={field.key}>
                          <label className="block text-[11px] font-black text-gray-700 mb-2 uppercase tracking-tight">{field.label}</label>
                          <input 
                             type="text"
                             value={getSettingValue(field.key)}
                             onChange={(e) => updateLocalValue(field.key, e.target.value)}
                             placeholder={`Your ${provider.name} ${field.label}`}
                             className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-600 outline-none focus:border-[#3F51B5]"
                          />
                       </div>
                    ))}
                 </div>

                 <div className="flex justify-end mt-8">
                    <button 
                       onClick={() => {
                          const data = {};
                          provider.fields.forEach(f => data[f.key] = getSettingValue(f.key));
                          handleSave(provider.name, data);
                       }}
                       disabled={submitting[provider.name]}
                       className="px-6 py-2 bg-[#3F51B5] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#303F9F] shadow-md transition-all flex items-center gap-2"
                    >
                       {submitting[provider.name] ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                    </button>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
         <button className="w-12 h-12 bg-[#00A99D] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
           <Minus size={24} strokeWidth={3} className="rotate-90" />
         </button>
         <button className="w-12 h-12 bg-[#F44336] text-white rounded-lg shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
           <ArrowUp size={20} strokeWidth={3} />
         </button>
      </div>

    </div>
  );
};

export default SMSGateways;
