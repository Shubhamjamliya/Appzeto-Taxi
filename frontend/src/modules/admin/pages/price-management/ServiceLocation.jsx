import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Globe, 
  Clock, 
  IndianRupee, 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Map as MapIcon,
  Navigation,
  Save,
  ArrowLeft,
  Loader2,
  Trash2,
  Edit2,
  Layers,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceLocation = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    country: '', // Should be ID
    currency_name: 'Indian Rupee',
    currency_symbol: '₹',
    currency_code: 'INR',
    timezone: 'Asia/Kolkata',
    unit: 'km',
    status: 'active',
    latitude: 22.7196,
    longitude: 75.8577
  });

  const token = localStorage.getItem('adminToken') || '';
  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Locations
      const locRes = await fetch(`${baseUrl}/service-locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (locRes.ok) {
        const data = await locRes.json();
        if (data.success) {
          setLocations(Array.isArray(data.data) ? data.data : (data.data?.results || []));
        }
      }

      // Fetch Countries
      setFetchingCountries(true);
      const countRes = await fetch('https://taxi-a276.onrender.com/api/v1/countries');
      const countData = await countRes.json();
      if (countData.success) {
        const counts = Array.isArray(countData.data) ? countData.data : (countData.data?.results || []);
        setCountries(counts);
        if (counts.length > 0 && !formData.country) {
            // Find India by default if exists
            const india = counts.find(c => c.name?.toLowerCase() === 'india');
            if (india) {
                setFormData(prev => ({ ...prev, country: india._id }));
            } else {
                setFormData(prev => ({ ...prev, country: counts[0]._id }));
            }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setFetchingCountries(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.country) {
      alert("Please fill all required fields, including Country");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/service-locations`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setView('list');
        fetchData();
        // Reset to defaults
        const india = countries.find(c => c.name?.toLowerCase() === 'india');
        setFormData({
            name: '', address: '', country: india?._id || countries[0]?._id || '', 
            currency_name: 'Indian Rupee', currency_symbol: '₹', currency_code: 'INR', 
            timezone: 'Asia/Kolkata', unit: 'km', status: 'active', 
            latitude: 22.7196, longitude: 75.8577
        });
      } else {
        alert(data.message || "Failed to save location");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
      status === 'active' || status === 1 || status === true
        ? 'bg-emerald-50 text-emerald-600' 
        : 'bg-rose-50 text-rose-600'
    }`}>
      {status === 'active' || status === 1 || status === true ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {status === 'active' || status === 1 || status === true ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
               <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <MapPin className="text-indigo-600" size={28} />
                     Service Location
                  </h1>
                  <p className="text-gray-500 text-[13px] font-medium mt-1">Manage operational cities and their localized configurations</p>
               </div>
               <button 
                 onClick={() => setView('create')}
                 className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
               >
                 <Plus size={18} /> Add Service Location
               </button>
            </div>

            {/* List Content */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
               <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div className="relative w-72">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input 
                       type="text" 
                       placeholder="Search locations..." 
                       className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-[13px] focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Layers size={18} /></button>
                     <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Settings size={18} /></button>
                  </div>
               </div>

               {loading ? (
                 <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="relative">
                       <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1.5} />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <MapPin size={16} className="text-indigo-400" />
                       </div>
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Syncing locations...</p>
                 </div>
               ) : locations.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-white">
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">S.No</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Name</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Time Zone</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Currency</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {locations.map((loc, idx) => (
                             <tr key={loc._id || idx} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                   <span className="text-[12px] font-black text-gray-400">{(idx + 1).toString().padStart(2, '0')}</span>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                         <Globe size={18} />
                                      </div>
                                      <div>
                                         <p className="text-[14px] font-black text-gray-900 leading-none">{loc.name}</p>
                                         <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                           {typeof loc.country === 'object' ? loc.country?.name : loc.country || 'Global'}
                                         </p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2 text-gray-600 font-bold text-[13px]">
                                      <Clock size={14} className="text-gray-400" />
                                      {loc.timezone || 'UTC'}
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2 text-emerald-600 font-black text-[13px] bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                                      {loc.currency_symbol || '₹'}
                                      <span className="text-gray-400 font-bold ml-1">{loc.currency_code || 'INR'}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex justify-center">
                                      <StatusBadge status={loc.status} />
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all outline-none border border-transparent hover:border-indigo-100">
                                         <Edit2 size={16} />
                                      </button>
                                      <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all outline-none border border-transparent hover:border-rose-100">
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-96 text-center px-10">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                       <MapIcon size={40} strokeWidth={1} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">No Operational Areas Defined</h3>
                    <p className="text-gray-500 text-sm max-w-xs mt-2 font-medium italic">You haven't added any service locations yet. Define your first city to start accepting rides.</p>
                    <button 
                      onClick={() => setView('create')}
                      className="mt-8 text-indigo-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                       Add First Location <ChevronRight size={14} />
                    </button>
                 </div>
               )}
               
               {/* Pagination UI Mock */}
               <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Showing 1 to {locations.length} of {locations.length} Entries</p>
                  <div className="flex items-center gap-1">
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 pointer-events-none"><ChevronLeft size={16} /></button>
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0F172A] text-white font-black text-xs">1</button>
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 pointer-events-none"><ChevronRight size={16} /></button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="create"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl mx-auto space-y-6 pb-20"
          >
             {/* Form Header */}
             <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-[11px] uppercase tracking-widest transition-all group"
                >
                   <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                   Discard & Go Back
                </button>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Setup New Service Location</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                   {/* Main Settings Card */}
                   <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Plus size={24} />
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Basic Credentials</h3>
                            <p className="text-gray-400 text-[12px] font-bold">Standard naming and operational state</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location Name</label>
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. Indore, Madhya Pradesh" 
                              className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 shadow-inner"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country *</label>
                            <select 
                              value={formData.country}
                              onChange={(e) => setFormData({...formData, country: e.target.value})}
                              className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner appearance-none ${fetchingCountries ? 'opacity-50' : ''}`}
                              disabled={fetchingCountries}
                            >
                               <option value="">Select Country</option>
                               {countries.map(c => (
                                 <option key={c._id} value={c._id}>{c.name}</option>
                               ))}
                            </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <select 
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                              className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner appearance-none"
                            >
                               <option value="active">Operational (Active)</option>
                               <option value="inactive">Under Maintenance (Inactive)</option>
                            </select>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Operational Address</label>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                               <Navigation size={10} /> Auto Detect
                            </button>
                         </div>
                         <textarea 
                           rows="3"
                           value={formData.address}
                           onChange={(e) => setFormData({...formData, address: e.target.value})}
                           placeholder="Enter the full central terminal address or head office location in this city"
                           className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 shadow-inner resize-none"
                         ></textarea>
                      </div>

                      {/* Map Simulation */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spatial Geometry (Boundary)</label>
                         <div className="w-full h-48 bg-slate-100 rounded-[24px] overflow-hidden relative border-2 border-gray-50 group flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/75.8577,22.7196,12/800x450?access_token=pk.placeholder')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                            <div className="z-10 flex flex-col items-center">
                               <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-indigo-600 mb-3 animate-bounce">
                                  <MapPin size={20} />
                               </div>
                               <button className="bg-white border border-gray-100 text-[#0F172A] px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all shadow-xl shadow-black/5">
                                  Mark Boundary Area
                               </button>
                            </div>
                            <div className="absolute top-4 left-4 flex gap-2">
                               <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                                  <Navigation size={10} className="text-primary" /> Lat: {formData.latitude}
                               </div>
                               <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                                  Lng: {formData.longitude}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   {/* Localization & Finance */}
                   <div className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <IndianRupee size={20} />
                         </div>
                         <h4 className="text-[14px] font-black text-gray-900 tracking-tight">Localization Settings</h4>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency Code</label>
                            <input 
                              type="text" 
                              value={formData.currency_code}
                              onChange={(e) => setFormData({...formData, currency_code: e.target.value.toUpperCase()})}
                              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-gray-900 focus:ring-1 focus:ring-emerald-500/20"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Symbol</label>
                               <input 
                                 type="text" 
                                 value={formData.currency_symbol}
                                 onChange={(e) => setFormData({...formData, currency_symbol: e.target.value})}
                                 className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-center text-emerald-600"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Units</label>
                               <select 
                                 value={formData.unit}
                                 onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                 className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-gray-900"
                               >
                                  <option value="km">Kilometres</option>
                                  <option value="miles">Miles</option>
                               </select>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Time Zone</label>
                            <div className="relative">
                               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                               <select 
                                 value={formData.timezone}
                                 onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                                 className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-[12px] font-bold text-gray-900 appearance-none"
                               >
                                  <option value="Asia/Kolkata">(GMT+5:30) Asia/Kolkata</option>
                                  <option value="America/New_York">(GMT-5:00) America/New_York</option>
                                  <option value="Europe/London">(GMT+0:00) Europe/London</option>
                                  <option value="Asia/Dubai">(GMT+4:00) Asia/Dubai</option>
                               </select>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Quick Tips */}
                   <div className="bg-indigo-600 p-8 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-xl shadow-indigo-200">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <Globe className="text-white/20 absolute -right-2 top-8" size={80} strokeWidth={1} />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Pro Tip</h4>
                      <p className="text-[13px] font-bold leading-relaxed relative z-10">
                        Defining a specific <strong>Time Zone</strong> ensures that scheduled promo codes and surge pricing activate exactly when local demand shifts.
                      </p>
                      <div className="pt-2">
                        <StatusBadge status="active" />
                      </div>
                   </div>

                   {/* CTA Button */}
                   <button 
                     onClick={handleSave}
                     disabled={saving}
                     className="w-full bg-black text-white p-5 rounded-[24px] font-black text-[15px] uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:bg-gray-400"
                   >
                     {saving ? (
                       <>
                         <Loader2 className="animate-spin" size={20} />
                         INITIALIZING CITY...
                       </>
                     ) : (
                       <>
                         <Save size={20} />
                         CREATE SERVICE UNIT
                       </>
                     )}
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Mock */}
      <AnimatePresence>
        {false && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl z-[100]"
          >
             <CheckCircle2 className="text-emerald-400" size={20} />
             <span className="text-[13px] font-black uppercase tracking-tight">Location Synchronized</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceLocation;
