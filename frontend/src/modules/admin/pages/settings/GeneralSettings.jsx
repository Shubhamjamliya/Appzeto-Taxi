import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Save, 
  Loader2,
  Image as ImageIcon,
  Upload,
  Globe,
  Settings,
  Car,
  Wallet,
  Gavel,
  CheckCircle2,
  X,
  ChevronUp,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  MousePointer2,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const SectionHeader = ({ title, description, icon: Icon }) => (
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

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => {
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";
  
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
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

const ImageUploadBox = ({ title, size, preview, onUpload, onClear }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between px-0.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">{title}</label>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">{size}</span>
       </div>
       <div className="aspect-video w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 relative overflow-hidden group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <img src={preview} alt={title} className="w-full h-full object-contain p-4" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300 group-hover:text-indigo-400 transition-colors">
                <ImageIcon size={32} strokeWidth={1.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Click to upload</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             {preview && (
               <button 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="w-8 h-8 rounded-lg bg-white shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
               >
                  <X size={16} />
               </button>
             )}
          </div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { onUpload(e.target.files[0]); }} />
       </div>
    </div>
  );
};

const ToggleField = ({ label, name, value, onChange }) => {
  const isChecked = value === "1" || value === 1 || value === true;
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm hover:border-indigo-100 transition-all group cursor-pointer" onClick={() => onChange(name, isChecked ? "0" : "1")}>
      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight pr-4 leading-relaxed group-hover:text-indigo-600 transition-colors">
        {label.replace(/enable_/g, '').replace(/show_/g, '').replace(/_/g, ' ')}
      </span>
      <div
        className={`w-10 h-5.5 rounded-full relative transition-all duration-300 pointer-events-none ${
          isChecked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[4px] transition-all duration-300 ${isChecked ? 'right-[4px]' : 'left-[4px]'}`} />
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    customize: {},
    transport: {},
    bid: {},
    wallet: {}
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [cusRes, transRes, bidRes, walletRes] = await Promise.all([
        api.get('/admin/general-settings/customize'),
        api.get('/admin/general-settings/transport-ride'),
        api.get('/admin/general-settings/bid-ride'),
        api.get('/admin/general-settings/wallet')
      ]);

      setSettings({
        customize: cusRes.data?.settings || {},
        transport: transRes.data?.settings || {},
        bid: bidRes.data?.settings || {},
        wallet: walletRes.data?.settings || {}
      });
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load system parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateAll = async () => {
    try {
      setSaving(true);
      await Promise.all([
        api.patch('/admin/general-settings/customize', { settings: settings.customize }),
        api.patch('/admin/general-settings/transport-ride', { settings: settings.transport }),
        api.patch('/admin/general-settings/bid-ride', { settings: settings.bid }),
        api.patch('/admin/general-settings/wallet', { settings: settings.wallet })
      ]);
      toast.success('Configuration synced successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (category, name, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 lg:p-8">
      
      {/* Header Block */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Settings</span>
          <ChevronRight size={12} />
          <span>General</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Business Configuration</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">General Settings</h1>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 pb-24">

        {/* Branding & Visuals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8">
           <SectionHeader title="Branding & Identity" description="Manage your application name, currency, and primary contact details" icon={Layout} />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <InputField label="App Name" name="app_name" value={settings.customize.app_name} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Currency Symbol" name="currency_symbol" value={settings.customize.currency_symbol} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Currency Code" name="default_currency_code_for_mobile_app" value={settings.customize.default_currency_code_for_mobile_app} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Admin Theme Color" name="admin_theme_color" value={settings.customize.admin_theme_color} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Contact Mobile 1" name="contact_phone_1" value={settings.customize.contact_phone_1} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Contact Mobile 2" name="contact_phone_2" value={settings.customize.contact_phone_2} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Default Latitude" name="default_lat" value={settings.customize.default_lat} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Default Longitude" name="default_lng" value={settings.customize.default_lng} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Booking Help Number" name="contact_booking_number" value={settings.customize.contact_booking_number} onChange={(n, v) => handleChange('customize', n, v)} />
           </div>

           <SectionHeader title="Mobile App Assets" description="Upload logos and favicons for varied app platforms" icon={Smartphone} />
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <ImageUploadBox title="Admin Logo" size="750x100" preview={settings.customize.logo} onUpload={() => {}} />
              <ImageUploadBox title="Favicon" size="80x80" preview={settings.customize.favicon} onUpload={() => {}} />
              <ImageUploadBox title="Login BG" size="5450x3650" preview={settings.customize.login_bg} onUpload={() => {}} />
              <ImageUploadBox title="Owner BG" size="5450x3650" preview={settings.customize.owner_bg} onUpload={() => {}} />
           </div>
        </div>

        {/* Business Logic Toggles */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
           <SectionHeader title="Visibility & logic" description="Toggle core platform features and search parameters" icon={MousePointer2} />
           <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
              {Object.keys(settings.customize).filter(k => k.startsWith('enable_') || k.startsWith('show_')).slice(0, 20).map(key => (
                 <ToggleField key={key} label={key} name={key} value={settings.customize[key]} onChange={(n, v) => handleChange('customize', n, v)} />
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 pt-8 border-t border-gray-100">
              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><Car size={14} /> Ride & Bidding Parameters</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <InputField label="Search Radius (km)" name="driver_search_radius" value={settings.transport.driver_search_radius} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Min Trip Dist (km)" name="minimum_trip_distane" value={settings.transport.minimum_trip_distane} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Incr/Decr Amount" name="bidding_amount_increase_or_decrease" value={settings.transport.bidding_amount_increase_or_decrease} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Bidding Max Dist" name="bidding_ride_maximum_distance" value={settings.transport.bidding_ride_maximum_distance} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><Wallet size={14} /> Financial Thresholds</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <InputField label="Min Wallet (Driver)" name="driver_wallet_minimum_amount_to_get_an_order" value={settings.wallet.driver_wallet_minimum_amount_to_get_an_order} onChange={(n, v) => handleChange('wallet', n, v)} type="number" />
                    <InputField label="Min Top-up Amount" name="minimum_amount_added_to_wallet" value={settings.wallet.minimum_amount_added_to_wallet} onChange={(n, v) => handleChange('wallet', n, v)} type="number" />
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-10 py-5 flex items-center justify-between z-50">
         <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:flex">
            <CheckCircle2 size={16} className="text-green-500" />
            Active Version 2.3.1
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleUpdateAll}
              disabled={saving}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 min-w-[240px]"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "SAVING..." : "SAVE ALL CONFIGURATIONS"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
