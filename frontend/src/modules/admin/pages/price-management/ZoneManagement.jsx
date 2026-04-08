import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, MapPin, Globe, Trash2, Edit2, 
  Map as MapIcon, Navigation, Save, ArrowLeft, 
  Loader2, Zap, Target, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GoogleMap, useJsApiLoader, DrawingManager, Polygon, Autocomplete 
} from '@react-google-maps/api';

import { adminService } from '../../services/adminService';

const libraries = ['drawing', 'places'];
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '40px'
};

const ZoneManagement = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [zones, setZones] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enablePeakZoneGlobal, setEnablePeakZoneGlobal] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('English');
  const [mapCenter, setMapCenter] = useState({ lat: 21.1458, lng: 79.0882 }); // Default India (Nagpur approx)
  const [autocomplete, setAutocomplete] = useState(null);

  // Map & Drawing States
  const [polygonCoords, setPolygonCoords] = useState([]);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Form State
  const [formData, setFormData] = useState({
    service_location_id: '',
    name: { English: '', Arabic: '', French: '', Spanish: '' },
    unit: 'km',
    peak_zone_ride_count: '',
    peak_zone_radius: '',
    peak_zone_selection_duration: '',
    peak_zone_duration: '',
    peak_zone_surge_percentage: '',
    maximum_distance_for_regular_rides: '',
    maximum_distance_for_outstation_rides: '',
    status: 'active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zoneRes, slRes] = await Promise.all([
        adminService.getZones(),
        adminService.getServiceLocations()
      ]);

      // Robust Zone Parsing
      if (zoneRes) {
        const zoneData = zoneRes.success ? (zoneRes.data?.results || zoneRes.data) : zoneRes;
        setZones(Array.isArray(zoneData) ? zoneData : []);
      }

      // Robust Service Location Parsing
      if (slRes) {
        const locs = slRes.success ? (slRes.data?.results || slRes.data) : slRes;
        setServiceLocations(Array.isArray(locs) ? locs : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onPolygonComplete = (polygon) => {
    const coords = polygon.getPath().getArray().map(p => ({
      lat: p.lat(),
      lng: p.lng()
    }));
    setPolygonCoords(coords);
    polygon.setMap(null);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.service_location_id || !formData.name.English || polygonCoords.length === 0) {
      alert("Please complete the form and draw a zone boundary.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        coordinates: polygonCoords,
        name: formData.name.English
      };

      const res = editingId 
        ? await adminService.updateZone(editingId, payload)
        : await adminService.createZone(payload);
      
      if (res.success) {
        setView('list');
        setEditingId(null);
        fetchData();
        setFormData({
          service_location_id: '',
          name: { English: '', Arabic: '', French: '', Spanish: '' },
          unit: 'km',
          peak_zone_ride_count: '',
          peak_zone_radius: '',
          peak_zone_selection_duration: '',
          peak_zone_duration: '',
          peak_zone_surge_percentage: '',
          maximum_distance_for_regular_rides: '',
          maximum_distance_for_outstation_rides: '',
          status: 'active'
        });
        setPolygonCoords([]);
      } else {
        alert(res.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error connecting to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (zoneId, currentIsActive) => {
    try {
      const res = await adminService.toggleZoneStatus(zoneId);
      if (res.success) {
        setZones(prev => prev.map(z => (z._id === zoneId || z.id === zoneId) ? { ...z, active: !currentIsActive } : z));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      const res = await adminService.deleteZone(zoneId);
      if (res.success) {
        setZones(prev => prev.filter(z => (z._id !== zoneId && z.id !== zoneId)));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (zone) => {
    console.log("Editing Zone Data:", zone);
    const zid = zone._id || zone.id;
    if (!zid) {
      console.warn("Zone ID missing, edit might fail.");
    }
    
    setEditingId(zid);
    
    // Safety check for name
    let zoneName = '';
    if (typeof zone.name === 'string') {
      zoneName = zone.name;
    } else if (zone.name && zone.name.English) {
      zoneName = zone.name.English;
    } else if (zone.zone_name) {
      zoneName = zone.zone_name;
    }

    setFormData({
      service_location_id: zone.service_location_id || '',
      name: { 
        English: zoneName,
        Arabic: '', French: '', Spanish: '' 
      },
      unit: zone.unit || 'km',
      peak_zone_ride_count: zone.peak_zone_ride_count || '',
      peak_zone_radius: zone.peak_zone_radius || '',
      peak_zone_selection_duration: zone.peak_zone_selection_duration || '',
      peak_zone_duration: zone.peak_zone_duration || '',
      peak_zone_surge_percentage: zone.peak_zone_surge_percentage || '',
      maximum_distance_for_regular_rides: zone.maximum_distance_for_regular_rides || '',
      maximum_distance_for_outstation_rides: zone.maximum_distance_for_outstation_rides || '',
      status: zone.active ? 'active' : 'inactive'
    });

    // Parse coordinates safely
    let parsedCoords = [];
    if (Array.isArray(zone.coordinates)) {
      parsedCoords = zone.coordinates.map(coord => {
        // Handle [lng, lat] array or {lat, lng} object
        if (Array.isArray(coord)) return { lat: coord[1], lng: coord[0] };
        if (coord && typeof coord === 'object') return { lat: Number(coord.lat), lng: Number(coord.lng) };
        return coord;
      });
    }
    
    if (parsedCoords.length > 0) {
      setMapCenter(parsedCoords[0]);
    }
    
    setPolygonCoords(parsedCoords);
    setView('create');
  };

  const handleViewInMap = (zone) => {
    handleEdit(zone);
  };

  const StatusToggle = ({ active, onToggle }) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${active ? 'bg-emerald-500 shadow-inner' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${active ? 'translate-x-6' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-6 min-h-screen pb-20">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
               <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <Target className="text-indigo-600" size={32} />
                     Zone Management
                  </h1>
                  <p className="text-gray-500 text-[14px] font-medium mt-1">Configure and oversee operational geofenced sectors</p>
               </div>
               <button 
                 onClick={() => {
                   setEditingId(null);
                   setFormData({
                     service_location_id: '',
                     name: { English: '', Arabic: '', French: '', Spanish: '' },
                     unit: 'km',
                     peak_zone_ride_count: '',
                     peak_zone_radius: '',
                     peak_zone_selection_duration: '',
                     peak_zone_duration: '',
                     peak_zone_surge_percentage: '',
                     maximum_distance_for_regular_rides: '',
                     maximum_distance_for_outstation_rides: '',
                     status: 'active'
                   });
                   setPolygonCoords([]);
                   setView('create');
                 }}
                 className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
               >
                 <Plus size={20} /> Add Market Zone
               </button>
            </div>

            {/* Peak Toggle */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group">
               <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${enablePeakZoneGlobal ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                     <Zap size={28} className={enablePeakZoneGlobal ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                     <p className="text-lg font-black text-gray-900">Enable Peak Zone</p>
                     <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Toggle dynamic pricing modifiers globally</p>
                  </div>
               </div>
               <StatusToggle active={enablePeakZoneGlobal} onToggle={() => setEnablePeakZoneGlobal(!enablePeakZoneGlobal)} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div className="relative w-96">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                       type="text" 
                       placeholder="Search zones by identifier..." 
                       className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-6 text-[14px] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black placeholder:text-gray-300"
                     />
                  </div>
                  <button className="flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
                     <Trash2 size={16} /> Bulk Delete
                  </button>
               </div>

               {loading ? (
                 <div className="flex flex-col items-center justify-center h-[500px] gap-6">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[12px]">Acquiring Spatial Data...</p>
                 </div>
               ) : zones.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                       <thead>
                          <tr className="bg-white">
                             <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center w-24">S.No</th>
                             <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Market Zone Identity</th>
                             <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Status</th>
                             <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {zones.map((zone, idx) => {
                             const zid = zone._id || zone.id;
                             return (
                                <tr key={zid || idx} className="hover:bg-indigo-50/30 transition-all group">
                                   <td className="px-8 py-6 text-center">
                                      <span className="text-[14px] font-black text-gray-400">{(idx + 1).toString().padStart(2, '0')}</span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                            <MapIcon size={22} />
                                         </div>
                                         <span className="text-[16px] font-black text-gray-900 tracking-tight">{zone.name || zone.zone_name}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex justify-center">
                                         <StatusToggle 
                                           active={zone.active === true || zone.status === 'active'} 
                                           onToggle={() => handleStatusToggle(zid, zone.active)} 
                                         />
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                         <button 
                                           onClick={() => handleEdit(zone)}
                                           className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-all active:scale-90 shadow-sm"
                                         >
                                           <Edit2 size={18} />
                                         </button>
                                         <button 
                                           onClick={() => handleViewInMap(zone)}
                                           className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-90 shadow-sm"
                                         >
                                           <Globe size={18} />
                                         </button>
                                         <button 
                                           onClick={() => handleDelete(zid)}
                                           className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-90 shadow-sm"
                                         >
                                           <Trash2 size={18} />
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                       <Navigation size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">No Market Zones Configured</h3>
                    <p className="text-slate-400 text-[14px] max-w-xs mt-3 font-medium px-4 leading-relaxed">Map your operational sector boundaries to initiate geofencing and dynamic pricing.</p>
                 </div>
               )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Page Header as per image */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                {editingId ? 'Edit' : 'Add Market Zone'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Zone</span>
                <span>{'>'}</span>
                <span className="text-slate-600 font-medium">{editingId ? 'Edit' : 'Add'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Form Fields */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {/* Service Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Service Location</label>
                  <select 
                    value={formData.service_location_id}
                    onChange={(e) => setFormData({...formData, service_location_id: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg py-3 px-4 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select Location</option>
                    {serviceLocations.map(sl => (
                      <option key={sl._id || sl.id} value={sl._id || sl.id}>
                        {sl.service_location_name || sl.name || 'Unknown Location'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Tabs */}
                <div className="space-y-4">
                  <div className="flex items-center border-b border-gray-100 gap-6">
                    {['English', 'Arabic', 'French', 'Spanish'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === lang ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {lang}
                        {activeTab === lang && (
                          <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      value={formData.name[activeTab]}
                      onChange={(e) => setFormData({
                        ...formData, 
                        name: { ...formData.name, [activeTab]: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Select Unit */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Select Unit</label>
                    <select 
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-3 px-4 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="km">Kilometers</option>
                      <option value="miles">Miles</option>
                    </select>
                  </div>

                  {localStorage.getItem('enable_max_distance') === 'true' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 border-t border-slate-50 pt-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Maximum Distance for Regular Rides <span className="text-rose-500">*</span></label>
                        <input 
                          type="number" 
                          placeholder="Enter Maximum Distance for Regular Rides"
                          value={formData.maximum_distance_for_regular_rides}
                          onChange={(e) => setFormData({...formData, maximum_distance_for_regular_rides: e.target.value})}
                          className="w-full border border-gray-200 rounded-lg py-3 px-4 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Maximum Distance for Outstation Rides <span className="text-rose-500">*</span></label>
                        <input 
                          type="number" 
                          placeholder="Enter Maximum Distance for Outstation Rides"
                          value={formData.maximum_distance_for_outstation_rides}
                          onChange={(e) => setFormData({...formData, maximum_distance_for_outstation_rides: e.target.value})}
                          className="w-full border border-gray-200 rounded-lg py-3 px-4 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Peak Zone Parameters Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Peak Zone Ride Count <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.peak_zone_ride_count}
                      onChange={(e) => setFormData({...formData, peak_zone_ride_count: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Peak Zone Radius <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.peak_zone_radius}
                      onChange={(e) => setFormData({...formData, peak_zone_radius: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Peak Zone Selection Duration in mins <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.peak_zone_selection_duration}
                      onChange={(e) => setFormData({...formData, peak_zone_selection_duration: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Peak Zone Duration in mins <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.peak_zone_duration}
                      onChange={(e) => setFormData({...formData, peak_zone_duration: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Peak Zone Surge percentage <span className="text-rose-500">*</span> <span className="text-cyan-500 cursor-pointer">How It Works</span></label>
                    <input 
                      type="number" 
                      value={formData.peak_zone_surge_percentage}
                      onChange={(e) => setFormData({...formData, peak_zone_surge_percentage: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#415385] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#34446b] transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>

              {/* Right Column: Map */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  {/* Search Bar inside map container area */}
                  <div className="mb-4 relative z-10">
                    <Autocomplete
                      onLoad={setAutocomplete}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search for a city"
                          className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </Autocomplete>
                  </div>

                  <div className="h-[550px] w-full bg-slate-100 rounded-lg overflow-hidden border border-gray-100 relative shadow-inner">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={12}
                        options={{
                          mapTypeControl: true,
                          streetViewControl: true,
                          fullscreenControl: true,
                          mapTypeControlOptions: {
                            position: isLoaded ? window.google.maps.ControlPosition.TOP_LEFT : 0
                          }
                        }}
                      >
                        <DrawingManager
                          onPolygonComplete={onPolygonComplete}
                          options={{
                            drawingControl: true,
                            drawingControlOptions: {
                              position: isLoaded ? window.google.maps.ControlPosition.LEFT_CENTER : 0,
                              drawingModes: [isLoaded ? window.google.maps.drawing.OverlayType.POLYGON : 'polygon'],
                            },
                            polygonOptions: {
                              fillColor: '#6366f1',
                              fillOpacity: 0.3,
                              strokeWeight: 2,
                              strokeColor: '#6366f1',
                              editable: true,
                            },
                          }}
                        />
                        {polygonCoords.length > 0 && (
                          <Polygon
                            paths={polygonCoords}
                            options={{
                              fillColor: '#6366f1',
                              fillOpacity: 0.35,
                              strokeColor: '#6366f1',
                              strokeWeight: 3,
                              editable: true,
                              draggable: true
                            }}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Loader2 className="animate-spin text-slate-300" size={40} />
                      </div>
                    )}

                    {/* Vertices indicator overlay (optional, but keeping it for UX) */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Vertices: {polygonCoords.length}</span>
                    </div>
                  </div>
                </div>

                {/* Overlap Warning Box as per image */}
                <div className="bg-[#fff9e6] border border-[#ffecb3] p-4 rounded-lg flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-400 rounded-full" />
                   <p className="text-amber-800 text-xs font-semibold">
                     Avoid make new polygons that overlap with existing zones.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZoneManagement;
