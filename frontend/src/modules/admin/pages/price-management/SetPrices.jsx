import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Car, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit2, 
  Settings, 
  Save, 
  ArrowLeft,
  Filter,
  Info,
  Clock,
  ShieldCheck,
  CreditCard,
  User,
  Zap,
  Truck,
  Layers,
  ChevronDown,
  Gift,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

const SetPrices = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Lookup data
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [appModules, setAppModules] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [vehiclePreferences, setVehiclePreferences] = useState([]);

  const [formData, setFormData] = useState({
    zone_id: '',
    transport_type: '',
    vehicle_type: '',
    app_modules: '',
    vehicle_preference: '',
    payment_type: ['cash'],
    customer_commission_type: 'percentage',
    customer_commission: '',
    driver_commission_type: 'percentage',
    driver_commission: '',
    owner_commission_type: 'percentage',
    owner_commission: '',
    service_tax: '',
    eta_sequence: '',
    base_price: '',
    base_distance: '',
    price_per_distance: '',
    time_price: '',
    waiting_charge: '',
    free_waiting_before: '',
    free_waiting_after: '',
    enable_airport_ride: false,
    enable_outstation_ride: false,
    user_cancellation_fee_type: 'percentage',
    user_cancellation_fee: '',
    driver_cancellation_fee_type: 'percentage',
    driver_cancellation_fee: '',
    cancellation_fee_goes_to: 'admin',
    enable_ride_sharing: false,
    status: 'active'
  });

  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prizesRes, zonesRes, vehiclesRes, modulesRes, locationsRes, prefsRes] = await Promise.all([
        fetch(`${baseUrl}/types/set-prices`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/zones`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/types/vehicle-types`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/common/app-modules`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/service-locations`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/preferences`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const prizesData = await prizesRes.json();
      const zonesData = await zonesRes.json();
      const vehiclesData = await vehiclesRes.json();
      const modulesData = await modulesRes.json();
      const locationsData = await locationsRes.json();
      const prefsData = await prefsRes.json();

      if (prizesData.success) {
        const items = prizesData.data?.set_prices || (Array.isArray(prizesData.data) ? prizesData.data : (prizesData.data?.results || prizesData.results || []));
        setPrizes(items);
      }
      if (zonesData.success) {
        const items = zonesData.data?.zones || (Array.isArray(zonesData.data) ? zonesData.data : (zonesData.data?.results || zonesData.results || []));
        setZones(items);
      }
      if (vehiclesData.success) {
        const items = vehiclesData.data?.vehicle_types || (Array.isArray(vehiclesData.data) ? vehiclesData.data : (vehiclesData.data?.results || vehiclesData.results || []));
        setVehicleTypes(items);
      }
      if (modulesData.success) {
        const items = modulesData.data?.app_modules || (Array.isArray(modulesData.data) ? modulesData.data : (modulesData.data?.results || modulesData.results || []));
        setAppModules(items);
      }
      if (locationsData.success) {
        const items = locationsData.data?.service_locations || (Array.isArray(locationsData.data) ? locationsData.data : (locationsData.data?.results || locationsData.results || []));
        setServiceLocations(items);
      }
      if (prefsData.status === 200 || prefsData.success) {
        const rawItems = prefsData.data || (Array.isArray(prefsData) ? prefsData : []);
        const items = Array.isArray(rawItems) ? rawItems : (rawItems.results || rawItems.preferences || []);
        setVehiclePreferences(items);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `${baseUrl}/types/set-prices/${editingId}` : `${baseUrl}/types/set-prices`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setView('list');
        setEditingId(null);
        fetchInitialData();
      } else {
        alert(data.message || "Failed to save set price");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this price setting?")) return;
    try {
      const res = await fetch(`${baseUrl}/types/set-prices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = (prize) => {
    setEditingId(prize._id || prize.id);
    setFormData({
      ...prize,
      zone_id: prize.zone_id?._id || prize.zone_id || '',
      vehicle_type: prize.vehicle_type?._id || prize.vehicle_type || '',
      app_modules: prize.app_modules?._id || prize.app_modules || '',
      vehicle_preference: prize.vehicle_preference?._id || prize.vehicle_preference || '',
    });
    setView('create');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <IndianRupee size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {view === 'list' ? 'Set Prices' : editingId ? 'Edit Price Configuration' : 'Map New Price Structure'}
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm ml-14">
              {view === 'list' ? 'Manage and oversee vehicle pricing across operational zones' : 'Configure granular pricing parameters for specific vehicle types and zones'}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-14 md:ml-0">
            {view === 'list' ? (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setView('create');
                  setFormData({
                    zone_id: '', transport_type: '', vehicle_type: '', app_modules: '',
                    vehicle_preference: '',
                    payment_type: ['cash'], customer_commission_type: 'percentage',
                    customer_commission: '', driver_commission_type: 'percentage',
                    driver_commission: '', owner_commission_type: 'percentage',
                    owner_commission: '', service_tax: '', eta_sequence: '',
                    base_price: '', base_distance: '', price_per_distance: '',
                    time_price: '', waiting_charge: '', free_waiting_before: '',
                    free_waiting_after: '', enable_airport_ride: false,
                    enable_outstation_ride: false, user_cancellation_fee_type: 'percentage',
                    user_cancellation_fee: '', driver_cancellation_fee_type: 'percentage',
                    driver_cancellation_fee: '', cancellation_fee_goes_to: 'admin',
                    enable_ride_sharing: false, status: 'active'
                  });
                }}
                className="group flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                ADD SET PRICE
              </button>
            ) : (
              <button 
                onClick={() => setView('list')}
                className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft size={18} /> BACK TO LIST
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters / Search Bar (As per Image 1) */}
              <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <span className="text-[12px] font-bold text-slate-500">Show</span>
                    <select className="bg-transparent border-none text-[12px] font-bold text-slate-900 focus:ring-0">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <span className="text-[12px] font-bold text-slate-500">entries</span>
                  </div>
                </div>

                <div className="flex flex-1 max-w-md items-center gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search by zone or vehicle..."
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                  <button className="p-3.5 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 px-6 font-bold text-sm">
                    <Filter size={18} /> FILTERS
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
                        <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Transport Type</th>
                        <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Vehicle Type</th>
                        <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            {[...Array(5)].map((_, j) => (
                              <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                            ))}
                          </tr>
                        ))
                      ) : prizes.length > 0 ? (
                        prizes.map((prize, idx) => (
                          <tr key={prize._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-slate-900 tracking-tight">{prize.zone_id?.name || prize.zone?.name || 'Global'}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-wider">{prize.transport_type || 'Taxi'}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-slate-600">{prize.vehicle_type?.name || prize.vehicle_name || 'Standard'}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center">
                                <StatusToggle 
                                  active={prize.status === "active" || prize.status === 1 || prize.active === true} 
                                  onToggle={async () => {
                                    const currentIsActive = (prize.status === "active" || prize.status === 1 || prize.active === true);
                                    const nextStatus = currentIsActive ? "inactive" : "active";
                                    const nextActive = !currentIsActive;
                                    
                                    try {
                                      console.log(`CURRENT: ${prize.status}, TARGET: ${nextStatus}`);
                                      const res = await fetch(`${baseUrl}/types/set-prices/${prize._id || prize.id}`, {
                                        method: 'PATCH',
                                        headers: { 
                                          'Authorization': `Bearer ${token}`,
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ 
                                          status: nextStatus,
                                          active: nextActive 
                                        })
                                      });
                                      const result = await res.json();
                                      if (result.success) fetchInitialData();
                                    } catch (e) { 
                                      console.error("Toggle error:", e); 
                                    }
                                  }} 
                                />
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEdit(prize)} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-90"><Edit2 size={16} /></button>
                                <button className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all active:scale-90"><Layers size={16} /></button>
                                <button className="p-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-all active:scale-90"><Settings size={16} /></button>
                                <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all active:scale-90"><Zap size={16} /></button>
                                <button onClick={() => handleDelete(prize._id || prize.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center opacity-40">
                              <Layers size={48} className="mb-4 text-slate-300" />
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No price configurations mapped yet</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing {prizes.length} entries</p>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronLeft size={16} /></button>
                    <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-[12px] font-bold shadow-lg shadow-indigo-100">1</button>
                    <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              {/* Form Content (As per Image 2) */}
              <div className="p-8 lg:p-12 space-y-12">
                
                {/* Section 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Zone *</label>
                    <select 
                      value={formData.zone_id}
                      onChange={(e) => setFormData({...formData, zone_id: e.target.value})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="" className="bg-white text-gray-950 font-bold">Select Zone</option>
                      {zones.map(z => <option key={z._id} value={z._id} className="bg-white text-gray-950 font-bold">{z.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Transport Type *</label>
                    <select 
                      value={formData.transport_type}
                      onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="" className="bg-white text-gray-950 font-bold">Select Transport Type</option>
                      <option value="taxi" className="bg-white text-gray-950 font-bold">Taxi</option>
                      <option value="delivery" className="bg-white text-gray-950 font-bold">Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Vehicle Type *</label>
                    <div className="relative">
                      <input 
                        list="vehicle-types-list"
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                        placeholder="Select or Type Vehicle Type"
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                      />
                      <datalist id="vehicle-types-list">
                        {vehicleTypes.map(v => <option key={v._id || v.id} value={v.name}>{v.name}</option>)}
                      </datalist>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">App Modules *</label>
                    <select 
                      value={formData.app_modules}
                      onChange={(e) => setFormData({...formData, app_modules: e.target.value})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="" className="bg-white text-gray-950 font-bold">Select App Modules</option>
                      {appModules.map(m => (
                        <option key={m._id || m.id} value={m._id || m.id} className="bg-white text-gray-950 font-bold">
                          {m.name || m.module_name || m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Vehicle Preference *</label>
                    <div className="relative group">
                      <select 
                        value={formData.vehicle_preference}
                        onChange={(e) => setFormData({...formData, vehicle_preference: e.target.value})}
                        style={{ color: '#000000' }}
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none appearance-none"
                      >
                        <option value="" className="bg-white text-gray-950 font-bold">Select Preference</option>
                        {Array.isArray(vehiclePreferences) && vehiclePreferences.map(pref => (
                          <option key={pref._id || pref.id} value={pref._id || pref.id} className="bg-white text-gray-950 font-bold">
                            {pref.name || pref.vehicle_preference_name || pref.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Payment Type *</label>
                    <select 
                      value={formData.payment_type?.[0] || 'cash'}
                      onChange={(e) => setFormData({...formData, payment_type: [e.target.value]})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="cash" className="bg-white text-gray-950 font-bold">Cash</option>
                      <option value="wallet" className="bg-white text-gray-950 font-bold">Wallet</option>
                      <option value="card" className="bg-white text-gray-950 font-bold">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Admin Commission Type From Customer *</label>
                    <select 
                      value={formData.customer_commission_type}
                      onChange={(e) => setFormData({...formData, customer_commission_type: e.target.value})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="percentage" className="bg-white text-gray-950 font-bold">Percentage</option>
                      <option value="fixed" className="bg-white text-gray-950 font-bold">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Admin Commission From Customer *</label>
                    <input 
                      type="number" 
                      placeholder="Enter Commission" 
                      value={formData.customer_commission}
                      onChange={(e) => setFormData({...formData, customer_commission: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Admin Commission Type From Driver *</label>
                    <select 
                      value={formData.driver_commission_type}
                      onChange={(e) => setFormData({...formData, driver_commission_type: e.target.value})}
                      style={{ color: '#000000' }}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="percentage" className="bg-white text-gray-950 font-bold">Percentage</option>
                      <option value="fixed" className="bg-white text-gray-950 font-bold">Fixed</option>
                    </select>
                  </div>
                  
                  {/* Additional Pricing Fields */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                     <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ETA Sequence *</label>
                        <input 
                           type="number" 
                           placeholder="Enter Order Number" 
                           value={formData.eta_sequence}
                           onChange={(e) => setFormData({...formData, eta_sequence: e.target.value})}
                           className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Base Price *</label>
                        <input 
                           type="number" 
                           placeholder="Enter Base Price" 
                           value={formData.base_price}
                           onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                           className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Base Distance *</label>
                        <input 
                           type="number" 
                           placeholder="Enter Base Distance" 
                           value={formData.base_distance}
                           onChange={(e) => setFormData({...formData, base_distance: e.target.value})}
                           className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                     </div>
                     <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Price Per Distance *</label>
                        <input 
                           type="number" 
                           placeholder="Enter Price Per Distance" 
                           value={formData.price_per_distance}
                           onChange={(e) => setFormData({...formData, price_per_distance: e.target.value})}
                           className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                     </div>
                  </div>
                </div>

                {/* Section 2: Cancellation Fees */}
                <div className="pt-12 border-t border-slate-100">
                  <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Trash2 size={16} /> Cancellation Fee Structure
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Cancellation Fee for User *</label>
                      <div className="flex gap-2">
                        <select 
                          value={formData.user_cancellation_fee_type}
                          onChange={(e) => setFormData({...formData, user_cancellation_fee_type: e.target.value})}
                          style={{ color: '#000000' }}
                          className="w-24 bg-slate-50 border-slate-200 border rounded-2xl py-4 px-3 text-sm font-bold text-slate-900 outline-none"
                        >
                          <option value="percentage" className="bg-white text-gray-950 font-bold">%</option>
                          <option value="fixed" className="bg-white text-gray-950 font-bold">₹</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={formData.user_cancellation_fee}
                          onChange={(e) => setFormData({...formData, user_cancellation_fee: e.target.value})}
                          className="flex-1 bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Cancellation Fee for Driver *</label>
                      <div className="flex gap-2">
                        <select 
                          value={formData.driver_cancellation_fee_type}
                          onChange={(e) => setFormData({...formData, driver_cancellation_fee_type: e.target.value})}
                          style={{ color: '#000000' }}
                          className="w-24 bg-slate-50 border-slate-200 border rounded-2xl py-4 px-3 text-sm font-bold text-slate-900 outline-none"
                        >
                          <option value="percentage" className="bg-white text-gray-950 font-bold">%</option>
                          <option value="fixed" className="bg-white text-gray-950 font-bold">₹</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={formData.driver_cancellation_fee}
                          onChange={(e) => setFormData({...formData, driver_cancellation_fee: e.target.value})}
                          className="flex-1 bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Switches */}
                <div className="pt-12 border-t border-slate-100 flex flex-wrap gap-x-16 gap-y-8">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="airport" 
                      checked={formData.enable_airport_ride}
                      onChange={(e) => setFormData({...formData, enable_airport_ride: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20" 
                    />
                    <label htmlFor="airport" className="text-sm font-bold text-slate-700 tracking-tight">Enable Airport Ride</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="outstation" 
                      checked={formData.enable_outstation_ride}
                      onChange={(e) => setFormData({...formData, enable_outstation_ride: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20" 
                    />
                    <label htmlFor="outstation" className="text-sm font-bold text-slate-700 tracking-tight">Enable Outstation Ride</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="sharing" 
                      checked={formData.enable_ride_sharing}
                      onChange={(e) => setFormData({...formData, enable_ride_sharing: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20" 
                    />
                    <label htmlFor="sharing" className="text-sm font-bold text-slate-700 tracking-tight">Enable Ride Sharing</label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-12 border-t border-slate-100 flex justify-end gap-4">
                   <button 
                    onClick={() => setView('list')}
                    className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 tracking-widest uppercase"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleSave}
                    className="group px-12 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3 tracking-widest uppercase"
                   >
                     <Save size={18} className="group-hover:translate-x-1 transition-transform" />
                     {editingId ? 'Update pricing' : 'Save configuration'}
                   </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SetPrices;
