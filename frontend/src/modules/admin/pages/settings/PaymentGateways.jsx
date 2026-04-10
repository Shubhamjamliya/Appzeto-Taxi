import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Search,
  MoreVertical,
  Minus
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const PaymentGateways = () => {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'raw'
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gwRes, setRes] = await Promise.all([
        adminService.getPaymentGateways(),
        adminService.getPaymentSettings()
      ]);
      setGateways(gwRes.data?.results || []);
      setSettings(setRes.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load data');
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
      await adminService.updatePaymentSettings(data);
      toast.success(`Configuration for ${slug} updated`);
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSubmitting(prev => ({ ...prev, [slug]: false }));
    }
  };

  const handleToggle = async (slug, key, currentValue) => {
    try {
      const newValue = currentValue === "1" ? "0" : "1";
      // Send as nested object for update: { razor_pay: { enabled: "0" } }
      const [parent, child] = key.split('.');
      await adminService.updatePaymentSettings({ [parent]: { [child]: newValue } });
      
      setSettings(prev => {
        const next = { ...prev };
        if (!next[parent]) next[parent] = {};
        next[parent][child] = newValue;
        return next;
      });
      toast.success(`${slug} ${newValue === "1" ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const getSettingValue = (key) => {
    const parts = key.split('.');
    if (parts.length === 2) {
      return settings[parts[0]]?.[parts[1]] || '';
    }
    return settings[key] || '';
  };

  const updateLocalValue = (key, value) => {
    const [parent, child] = key.split('.');
    setSettings(prev => {
       const next = { ...prev };
       if (!next[parent]) next[parent] = {};
       next[parent][child] = value;
       return next;
    });
  };

  const gatewayGroups = [
    { name: 'RAZOR PAY', slug: 'razor_pay', logo: 'https://cdn.razorpay.com/logo.svg', enableKey: 'razor_pay.enabled', fields: [
      { label: 'Razor Pay Environment', key: 'razor_pay.environment', type: 'select', options: ['test', 'live'] },
      { label: 'Razor Pay Test Api Key', key: 'razor_pay.test_api_key' },
      { label: 'Razor pay Test Secrect Key', key: 'razor_pay.test_secret_key' },
      { label: 'Razor Pay Live Api Key', key: 'razor_pay.live_api_key' },
      { label: 'Razor Pay Secrect key', key: 'razor_pay.live_secret_key' }
    ]},
    { name: 'PHONE PAY', slug: 'phone_pay', logo: 'https://www.phonepe.com/webstatic/8101/static/m/83f6ed9f4a0a996dc7a69b7.svg', enableKey: 'phone_pay.enabled', fields: [
      { label: 'PhonePay Environment', key: 'phone_pay.environment', type: 'select', options: ['test', 'production'] },
      { label: 'Merchant ID', key: 'phone_pay.merchant_id' },
      { label: 'Salt Key', key: 'phone_pay.salt_key' },
      { label: 'Salt Index', key: 'phone_pay.salt_index' }
    ]},
    { name: 'STRIPE', slug: 'stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', enableKey: 'stripe.enabled', fields: [
      { label: 'Stripe Environment', key: 'stripe.environment', type: 'select', options: ['test', 'live'] },
      { label: 'Stripe Test Secret Key', key: 'stripe.test_secret_key' },
      { label: 'Stripe Test Publishable Key', key: 'stripe.test_publishable_key' },
      { label: 'Stripe Production Secret Key', key: 'stripe.live_secret_key' },
      { label: 'Stripe Production Publishable Key', key: 'stripe.live_publishable_key' }
    ]}
  ];

  const filteredSettings = Object.entries(settings).flatMap(([parentKey, subObj]) => 
     Object.entries(subObj || {}).map(([childKey, value]) => ({
        _id: `${parentKey}.${childKey}`,
        key: `${parentKey}.${childKey}`,
        value: String(value),
        module: 'payment',
        is_active: childKey === 'enabled' ? value === '1' : true
     }))
  ).filter(item => 
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Payment Gateway</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Payment Gateway</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Payment Gateway</span>
        </div>
      </div>

      <div className="p-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-white p-1 rounded-lg w-fit border border-gray-200 shadow-sm">
           <button onClick={() => setActiveTab('config')} className={`px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-[#3F51B5] text-white' : 'text-gray-400'}`}>Configuration</button>
           <button onClick={() => setActiveTab('raw')} className={`px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'raw' ? 'bg-[#3F51B5] text-white' : 'text-gray-400'}`}>Raw Data List</button>
        </div>

        {activeTab === 'config' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {gatewayGroups.map((gw) => (
                <div key={gw.slug} className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex flex-col min-h-[500px]">
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-[13px] font-black text-gray-800 tracking-tight">{gw.name}</h2>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input 
                            type="checkbox" 
                            checked={getSettingValue(gw.enableKey) === "1"} 
                            onChange={() => handleToggle(gw.name, gw.enableKey, getSettingValue(gw.enableKey))}
                            className="sr-only peer" 
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51B5]"></div>
                      </label>
                   </div>

                   <div className="flex justify-center mb-10">
                      <img src={gw.logo} alt={gw.name} className="h-10 object-contain" />
                   </div>

                   <div className="space-y-5 flex-1">
                      {gw.fields.map((field) => (
                         <div key={field.key}>
                            <label className="block text-[11px] font-black text-gray-700 mb-2 uppercase tracking-tight">{field.label}</label>
                            {field.type === 'select' ? (
                               <select 
                                  value={getSettingValue(field.key)} 
                                  onChange={(e) => updateLocalValue(field.key, e.target.value)}
                                  className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-600 outline-none focus:border-[#3F51B5]"
                               >
                                  {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                               </select>
                            ) : (
                               <input 
                                  type="text"
                                  value={getSettingValue(field.key)}
                                  onChange={(e) => updateLocalValue(field.key, e.target.value)}
                                  placeholder={field.label}
                                  className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-600 outline-none focus:border-[#3F51B5]"
                               />
                            )}
                         </div>
                      ))}
                   </div>

                   <div className="flex justify-end mt-8">
                      <button 
                         onClick={() => handleSave(gw.name, { [gw.slug]: settings[gw.slug] })}
                         disabled={submitting[gw.name]}
                         className="px-6 py-2 bg-[#3F51B5] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#303F9F] shadow-md transition-all flex items-center gap-2"
                      >
                         {submitting[gw.name] ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                      </button>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          /* Raw Data Table - "The Image Style" */
          <div className="bg-white rounded-md shadow-sm border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">
            <div className="p-6 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14px] text-gray-500">
                <span>show</span>
                <select value={entries} onChange={(e) => setEntries(parseInt(e.target.value))} className="border border-gray-200 rounded px-2 py-1 outline-none font-bold">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="relative">
                 <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..." 
                  className="pl-4 pr-4 py-2 border border-gray-100 bg-[#F9FAFB] rounded-md text-[13px] outline-none w-64"
                 />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-y border-gray-100">
                    <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Setting Key</th>
                    <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Module</th>
                    <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Current Value</th>
                    <th className="px-6 py-3 text-[13px] font-black text-gray-700 text-center whitespace-nowrap">Status</th>
                    <th className="px-6 py-3 text-[13px] font-black text-gray-700 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loading ? (
                     [...Array(10)].map((_, i) => (
                       <tr key={i} className="animate-pulse">
                         <td colSpan="5" className="px-6 py-6"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                       </tr>
                     ))
                  ) : (
                    filteredSettings.slice(0, entries).map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-5 text-[13px] text-indigo-600 font-bold">{s.key}</td>
                        <td className="px-6 py-5 text-[13px] text-gray-600 uppercase font-bold text-[11px]">{s.module}</td>
                        <td className="px-6 py-5 text-[13px] text-gray-500 max-w-sm truncate italic">{s.value}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black text-white ${s.is_active ? 'bg-[#28A745]' : 'bg-gray-300'}`}>
                            {s.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button className="text-gray-400 hover:text-[#3F51B5]"><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="text-[13px] text-gray-500 font-medium">
                Showing {filteredSettings.length > 0 ? 1 : 0} to {Math.min(entries, filteredSettings.length)} of {filteredSettings.length} entries
              </div>
              <div className="flex items-center gap-0">
                <button className="px-3 py-2 text-[13px] text-gray-500 font-medium">Prev</button>
                <button className="w-8 h-8 flex items-center justify-center bg-[#3F51B5] text-white rounded-[4px] text-[13px] font-bold">1</button>
                <button className="px-3 py-2 text-[13px] text-gray-500 font-medium">Next</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-12 h-12 bg-[#00A99D] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <Minus size={24} strokeWidth={3} className="rotate-90" />
      </button>

    </div>
  );
};

export default PaymentGateways;
