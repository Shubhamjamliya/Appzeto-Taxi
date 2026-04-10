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
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../shared/api/axiosInstance';
import toast from 'react-hot-toast';

const SectionHeader = ({ title }) => (
  <div className="bg-slate-50 border-l-4 border-emerald-500 p-4 mb-8 rounded-r-lg shadow-sm">
    <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
  </div>
);

const URLExample = ({ base = "https://rydence.com/login/", stub }) => (
  <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-3.5 mt-2 flex items-center justify-center text-[12px] font-medium text-slate-600">
    Example: {base}<span className="bg-emerald-500 text-white px-2 py-0.5 rounded ml-1 font-bold">{stub || "..."}</span>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", sublabel }) => (
  <div className="space-y-1.5 min-w-0">
    <div className="flex items-center gap-1.5">
       <label className="text-[13px] font-bold text-slate-700 block ml-0.5 whitespace-nowrap">
         {label}
       </label>
       {sublabel && <span className="text-[11px] text-slate-400 font-medium">({sublabel})</span>}
    </div>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-[14px] text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
    />
  </div>
);

const ImageUploadBox = ({ title, size, preview, onUpload, onClear }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="space-y-3">
       <div className="flex items-center gap-1.5 px-0.5">
          <label className="text-[13px] font-bold text-slate-700 leading-none">{title}</label>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">({size})</span>
       </div>
       <div className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 bg-white relative overflow-hidden group">
          {preview ? (
            <img src={preview} alt={title} className="w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Upload Image</span>
                <ImageIcon size={32} strokeWidth={1.5} />
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-lg bg-white shadow-lg border border-slate-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors"
             >
                <Upload size={16} />
             </button>
             {preview && (
               <button 
                onClick={onClear}
                className="w-8 h-8 rounded-lg bg-white shadow-lg border border-slate-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
               >
                  <X size={16} />
               </button>
             )}
          </div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => onUpload(e.target.files[0])} />
       </div>
    </div>
  );
};

const ToggleField = ({ label, name, value, onChange }) => {
  const isChecked = value === "1" || value === 1 || value === true;
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group">
      <span className="text-[13px] font-bold text-slate-700 capitalize leading-snug pr-4">
        {label.replace(/_/g, ' ')}
      </span>
      <button
        onClick={() => onChange(name, isChecked ? "0" : "1")}
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
          isChecked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isChecked ? 'right-1' : 'left-1'}`} />
      </button>
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
      toast.success('System parameters updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Synchronizing Global State...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] animate-in fade-in duration-700">
      <div className="max-w-[1500px] mx-auto p-4 md:p-8 space-y-8 pb-32 pt-8">

        
        {/* Identity & Core Branding */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
              <InputField label="Admin Theme Color" name="admin_theme_color" value={settings.customize.admin_theme_color || "#405189"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Landing Website Theme Color" name="landing_theme_color" value={settings.customize.landing_theme_color || "#0ab39c"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Side Text Bar Color (eg:#1c3faa)" name="sidebar_text_color" value={settings.customize.sidebar_text_color || "#ffffff"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="App Name" name="app_name" value={settings.customize.app_name || "Reraid"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Currency Code" name="default_currency_code_for_mobile_app" value={settings.customize.default_currency_code_for_mobile_app} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Currency Symbol" name="currency_symbol" value={settings.customize.currency_symbol || "₹"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Contact Us Mobile 1" name="contact_phone_1" value={settings.customize.contact_phone_1 || "0000000000"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Contact Us Mobile 2" name="contact_phone_2" value={settings.customize.contact_phone_2 || "0000000000"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Default Latitude" name="default_lat" value={settings.customize.default_lat || "11.21215"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Default Longitude" name="default_lng" value={settings.customize.default_lng || "76.54545"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="contact_booking_number" name="contact_booking_number" value={settings.customize.contact_booking_number || "9999999999"} onChange={(n, v) => handleChange('customize', n, v)} />
           </div>

           <SectionHeader title="URL Setup (Login Redirects)" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
              <div>
                 <InputField label="Admin Login URL" name="admin_login_url" value={settings.customize.admin_login_url || "admin"} onChange={(n, v) => handleChange('customize', n, v)} />
                 <URLExample stub={settings.customize.admin_login_url || "admin"} />
              </div>
              <div>
                 <InputField label="Owner Login URL" name="owner_login_url" value={settings.customize.owner_login_url || "owner-login"} onChange={(n, v) => handleChange('customize', n, v)} />
                 <URLExample stub={settings.customize.owner_login_url || "owner-login"} />
              </div>
              <div>
                 <InputField label="Dispatcher Login URL" name="dispatcher_login_url" value={settings.customize.dispatcher_login_url || "dispatch"} onChange={(n, v) => handleChange('customize', n, v)} />
                 <URLExample stub={settings.customize.dispatcher_login_url || "dispatch"} />
              </div>
              <div>
                 <InputField label="User Login URL" name="user_login_url" value={settings.customize.user_login_url || "user-login"} onChange={(n, v) => handleChange('customize', n, v)} />
                 <URLExample stub={settings.customize.user_login_url || "user-login"} />
              </div>
           </div>

           <SectionHeader title="URL Setup (Mobile App Links)" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
              <InputField label="Android User URL" name="android_user_url" value={settings.customize.android_user_url || "Your Android User App Link"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Android Driver URL" name="android_driver_url" value={settings.customize.android_driver_url || "Your Android Driver App Link"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="IOS User URL" name="ios_user_url" value={settings.customize.ios_user_url || "Your IOS User App Link"} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="IOS Driver URL" name="ios_driver_url" value={settings.customize.ios_driver_url || "Your IOS Driver App Link"} onChange={(n, v) => handleChange('customize', n, v)} />
           </div>

           <SectionHeader title="Image Section & Assets" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mb-16">
              <ImageUploadBox title="Admin Login Page Background Image" size="5450px x 3650px" onUpload={() => {}} />
              <ImageUploadBox title="Admin Panel Logo" size="750px x 100px" onUpload={() => {}} />
              <ImageUploadBox title="Favicon" size="80px x 80px" onUpload={() => {}} />
              <ImageUploadBox title="Owner Login Page Background Image" size="5450px x 3650px" onUpload={() => {}} />
           </div>

           <SectionHeader title="Additional Panel Configuration" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
              <InputField label="Footer Content 1" name="footer_1" value={settings.customize.footer_1 || "2024 © Appzeto."} onChange={(n, v) => handleChange('customize', n, v)} />
              <InputField label="Footer Content 2" name="footer_2" value={settings.customize.footer_2 || "Design & Develop by Appzeto"} onChange={(n, v) => handleChange('customize', n, v)} />
           </div>

           <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
              <SectionHeader title="Dispatcher Panel Section" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InputField label="Side Bar Background Color" name="disp_sidebar_bg" value={settings.customize.disp_sidebar_bg || "#000000"} onChange={(n, v) => handleChange('customize', n, v)} />
                <InputField label="Side Menu Text Color" name="disp_side_text" value={settings.customize.disp_side_text || "#000000"} onChange={(n, v) => handleChange('customize', n, v)} />
              </div>
           </div>
        </div>

        {/* Behavioral Toggles & Pricing (JSON Fields) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-10">
           <SectionHeader title="Application Logic & Visibility" />
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.keys(settings.customize).filter(k => k.startsWith('enable_') || k.startsWith('show_')).slice(0, 16).map(key => (
                 <ToggleField key={key} label={key} name={key} value={settings.customize[key]} onChange={(n, v) => handleChange('customize', n, v)} />
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                 <SectionHeader title="Transport & Bidding Parameters" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Trip Dispatch Type" name="trip_dispatch_type" value={settings.transport.trip_dispatch_type} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Driver Search Radius (km)" name="driver_search_radius" value={settings.transport.driver_search_radius} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Min Trip Distance (km)" name="minimum_trip_distane" value={settings.transport.minimum_trip_distane} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Bid Find Drivers Max Time (min)" name="maximum_time_for_find_drivers_for_bitting_ride" value={settings.transport.maximum_time_for_find_drivers_for_bitting_ride} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Bidding Low %" name="bidding_low_percentage" value={settings.transport.bidding_low_percentage} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Bidding High %" name="bidding_high_percentage" value={settings.transport.bidding_high_percentage} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Incr/Decr Amount" name="bidding_amount_increase_or_decrease" value={settings.transport.bidding_amount_increase_or_decrease} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                    <InputField label="Bidding Max Dist" name="bidding_ride_maximum_distance" value={settings.transport.bidding_ride_maximum_distance} onChange={(n, v) => handleChange('transport', n, v)} type="number" />
                 </div>
              </div>
              <div>
                 <SectionHeader title="Wallet Thresholds" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Min Wallet (Driver)" name="driver_wallet_minimum_amount_to_get_an_order" value={settings.wallet.driver_wallet_minimum_amount_to_get_an_order} onChange={(n, v) => handleChange('wallet', n, v)} type="number" />
                    <InputField label="Min Top-up" name="minimum_amount_added_to_wallet" value={settings.wallet.minimum_amount_added_to_wallet} onChange={(n, v) => handleChange('wallet', n, v)} type="number" />
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-white/80 backdrop-blur-md border-t border-slate-200 px-8 py-5 flex flex-col md:flex-row items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
         <div className="flex items-center gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest invisible md:visible">
            <span>2024 © redigo.</span>
            <span>Design & Develop by Redigo Team</span>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-[12px] font-bold text-slate-400 uppercase mr-4 hidden md:block">App version <span className="text-emerald-500 ml-1">2.3.1</span></span>
            <button 
              onClick={handleUpdateAll}
              disabled={saving}
              className="flex-1 md:flex-none bg-[#111827] text-white px-10 py-4 rounded-xl text-[13px] font-black shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 min-w-[220px]"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "SAVING CHANGES..." : "SAVE ALL SETTINGS"}
            </button>
            <button
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               className="bg-[#2563EB] text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0"
            >
               <ChevronUp size={22} />
            </button>
         </div>
      </div>
    </div>
  );
};


export default GeneralSettings;
