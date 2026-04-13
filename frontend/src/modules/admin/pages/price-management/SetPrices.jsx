import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Car, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Save, 
  ArrowLeft,
  Loader2,
  CreditCard,
  User,
  Zap,
  Truck,
  Layers,
  ShieldCheck,
  Activity,
  DollarSign,
  Tag,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all";
const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-colors relative ${active ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

const SetPrices = () => {
  const [view, setView] = useState('list');
  const [prizes, setPrizes] = useState([]);
  const [prizesFull, setPrizesFull] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lookup data
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [appModules, setAppModules] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [formData, setFormData] = useState({
    zone_id: '',
    transport_type: 'taxi',
    vehicle_type: '',
    app_modules: '',
    payment_type: ['cash'],
    admin_commision: '',
    service_tax: '',
    admin_commission_from_driver: '',
    base_price: '',
    base_distance: '',
    price_per_distance: '',
    time_price: '',
    waiting_charge: '',
    free_waiting_before: '',
    free_waiting_after: '',
    enable_airport_ride: false,
    enable_outstation_ride: false,
    enable_shared_ride: false,
    status: 'active'
  });

  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prizesRes, zonesRes, vehiclesRes, modulesRes, locationsRes] = await Promise.all([
        fetch(`${baseUrl}/types/set-prices`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/zones`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/types/vehicle-types`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/common/app-modules`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/service-locations`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [prizesData, zonesData, vehiclesData, modulesData, locationsData] = await Promise.all([
        prizesRes.json(), zonesRes.json(), vehiclesRes.json(), modulesRes.json(), locationsRes.json()
      ]);

      if (prizesData.success) {
        const items = prizesData.results || prizesData.data?.results || prizesData.data?.set_prices || (Array.isArray(prizesData.data) ? prizesData.data : []);
        setPrizes(items);
        setPrizesFull(prizesData.paginator?.data || items);
      }
      if (zonesData.success) {
        setZones(zonesData.data?.zones || zonesData.data?.results || zonesData.results || []);
      }
      if (vehiclesData.success) {
        setVehicleTypes(vehiclesData.data?.vehicle_types || vehiclesData.data?.results || vehiclesData.results || []);
      }
      if (modulesData.success) {
        setAppModules(modulesData.data?.app_modules || modulesData.data?.results || modulesData.results || []);
      }
      if (locationsData.success) {
        setServiceLocations(locationsData.data?.service_locations || locationsData.data?.results || locationsData.results || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.zone_id || !formData.vehicle_type) return alert("Zone and Vehicle Type are required.");
    setSaving(true);
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
        alert(data.message || "Failed to save pricing matrix");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pricing configuration?")) return;
    try {
      const res = await fetch(`${baseUrl}/types/set-prices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchInitialData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (prize) => {
    setEditingId(prize._id || prize.id);
    const pData = prizesFull.find(d => (d._id || d.id) === (prize._id || prize.id)) || prize;
    setFormData({
      ...pData,
      zone_id: pData.zone_id?._id || pData.zone_id || pData.zone?._id || '',
      vehicle_type: pData.vehicle_type?._id || pData.vehicle_type || '',
      app_modules: pData.app_modules?._id || pData.app_modules || '',
    });
    setView('create');
  };

  const filteredPrizes = prizes.filter(p => {
    const q = searchTerm.toLowerCase();
    const zoneName = p.zone_name || p.zone_id?.name || '';
    const vName = p.vehicle_type_name || p.vehicle_type?.name || '';
    return zoneName.toLowerCase().includes(q) || vName.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 animate-in fade-in duration-500">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium">
                <span>Pricing</span>
                <ChevronRight size={12} />
                <span className="text-gray-700">Set Prices</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vehicle Pricing Registry</h1>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Map distance, time, and commission rules across operational zones.</p>
                </div>
                <button 
                  onClick={() => { setEditingId(null); setView('create'); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <Plus size={18} /> Add Price Rule
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Active Rules', value: prizes.filter(p => p.status === 'active' || p.active === 1).length, icon: DollarSign, color: 'indigo' },
                { label: 'Market Zones', value: zones.length, icon: MapPin, color: 'emerald' },
                { label: 'Price Matrix Nodes', value: prizes.length, icon: Activity, color: 'blue' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-colors">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100 shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <div className="relative w-full max-w-sm">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search pricing mappings..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Compiling Revenue Metrics</p>
                  </div>
                ) : filteredPrizes.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        <th className="px-6 py-4">Operational Sector</th>
                        <th className="px-6 py-4">Vehicle Identity</th>
                        <th className="px-6 py-4 text-center">Vertical</th>
                        <th className="px-6 py-4 text-center">Base Unit</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPrizes.map(prize => (
                        <tr key={prize._id || prize.id} className="hover:bg-gray-50/20 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                                <MapPin size={18} />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{prize.zone_name || prize.zone_id?.name || 'Global Cluster'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 p-1 flex items-center justify-center">
                                {prize.icon ? <img src={prize.icon} className="w-full h-full object-contain" alt="" /> : <Car size={18} className="text-indigo-600" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{prize.vehicle_type_name || prize.vehicle_type?.name || 'Unlinked'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${prize.transport_type === 'taxi' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                              {prize.transport_type || 'Taxi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-xs font-bold text-gray-500">
                            ${prize.base_price || '0.00'}
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className="flex justify-center">
                               <StatusToggle 
                                 active={prize.status === 'active' || prize.active === 1 || prize.active === true} 
                                 onToggle={async () => {
                                   const sid = prize._id || prize.id;
                                   const active = prize.status === 'active' || prize.active === 1 || prize.active === true;
                                   try {
                                      await fetch(`${baseUrl}/types/set-prices/${sid}`, {
                                        method: 'PATCH',
                                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: active ? 'inactive' : 'active', active: !active ? 1 : 0 })
                                      });
                                      fetchInitialData();
                                   } catch(e) {}
                                 }} 
                               />
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                             <div className="flex items-center justify-end gap-2">
                               <button onClick={() => handleEdit(prize)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Edit2 size={16} /></button>
                               <button onClick={() => handleDelete(prize._id || prize.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200 mx-auto mb-4 tracking-tighter"><DollarSign size={32} /></div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Pricing Inventory Empty</h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">Map vehicle classes to market zones to enable operational bookings.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto space-y-6 pb-20"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium">
                <span>Pricing</span>
                <ChevronRight size={12} />
                <span>Set Prices</span>
                <ChevronRight size={12} />
                <span className="text-gray-700">{editingId ? 'Refine' : 'Initialize'}</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{editingId ? 'Refine Pricing Matrix' : 'Establish New Price Node'}</h1>
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                  <ArrowLeft size={16} /> Back to Registry
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32">
              <div className="lg:col-span-8 space-y-8">
                {/* Geographic Scoping */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm"><MapPin size={20} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Market Segmentation</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cluster & Category Mapping</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Operational Zone *</label>
                        <select value={formData.zone_id} onChange={(e) => setFormData(p => ({ ...p, zone_id: e.target.value }))} className={inputClass}>
                           <option value="">Select Zone</option>
                           {zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Service Vertical *</label>
                        <select value={formData.transport_type} onChange={(e) => setFormData(p => ({ ...p, transport_type: e.target.value }))} className={inputClass}>
                           <option value="taxi">Taxi / Ride-Hailing</option>
                           <option value="delivery">Logistics / Delivery</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Vehicle Class *</label>
                        <select value={formData.vehicle_type} onChange={(e) => setFormData(p => ({ ...p, vehicle_type: e.target.value }))} className={inputClass}>
                           <option value="">Select Category</option>
                           {vehicleTypes.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Operational Module *</label>
                        <select value={formData.app_modules} onChange={(e) => setFormData(p => ({ ...p, app_modules: e.target.value }))} className={inputClass}>
                           <option value="">Select Module</option>
                           {appModules.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name || m.module_name}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                {/* Economic Matrix */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm"><CreditCard size={20} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Economic Parameters</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commissions & Multipliers</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Client Commision (%) *</label>
                        <div className="relative">
                          <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" value={formData.admin_commision} onChange={(e) => setFormData(p => ({ ...p, admin_commision: e.target.value, customer_commission: e.target.value }))} className={inputClass + " pl-11"} placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Driver Commision (%) *</label>
                        <div className="relative">
                          <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" value={formData.admin_commission_from_driver} onChange={(e) => setFormData(p => ({ ...p, admin_commission_from_driver: e.target.value }))} className={inputClass + " pl-11"} placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Service Tax (%) *</label>
                        <div className="relative">
                          <ShieldCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" value={formData.service_tax} onChange={(e) => setFormData(p => ({ ...p, service_tax: e.target.value }))} className={inputClass + " pl-11"} placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Settlement Channel</label>
                        <select value={formData.payment_type?.[0] || 'cash'} onChange={(e) => setFormData(p => ({ ...p, payment_type: [e.target.value] }))} className={inputClass}>
                           <option value="cash">Hybrid (Cash / Digital)</option>
                           <option value="wallet">Closed-Loop Wallet Only</option>
                           <option value="card">Prepaid Card Segment</option>
                        </select>
                      </div>
                   </div>
                </div>

                {/* Unit Pricing Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm"><Zap size={20} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Unit Calculations</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Ledger Rules</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Base Price (Flag Fall)</label>
                        <input type="number" value={formData.base_price} onChange={(e) => setFormData(p => ({ ...p, base_price: e.target.value }))} className={inputClass} placeholder="0.00" />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Base Distance (Free Range)</label>
                        <input type="number" value={formData.base_distance} onChange={(e) => setFormData(p => ({ ...p, base_distance: e.target.value }))} className={inputClass} placeholder="0.00" />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Distance Fee (per KM/MI)</label>
                        <input type="number" value={formData.price_per_distance} onChange={(e) => setFormData(p => ({ ...p, price_per_distance: e.target.value }))} className={inputClass} placeholder="0.00" />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Time Value (per Min)</label>
                        <input type="number" value={formData.time_price} onChange={(e) => setFormData(p => ({ ...p, time_price: e.target.value }))} className={inputClass} placeholder="0.00" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Sidebar Controls */}
              <div className="lg:col-span-4 sticky top-8">
                 <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-8">
                    <div>
                       <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Pricing Policies</h3>
                       <div className="space-y-4">
                          {[
                            { label: 'Pooled Ride Support', key: 'enable_shared_ride' },
                            { label: 'Airport Surcharge Node', key: 'enable_airport_ride' },
                            { label: 'Intercity/Outstation', key: 'enable_outstation_ride' }
                          ].map((policy, i) => (
                            <label key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 font-bold text-gray-700 text-sm">
                               <span>{policy.label}</span>
                               <input 
                                  type="checkbox" checked={formData[policy.key] || formData.enable_ride_sharing && i === 0} 
                                  onChange={(e) => setFormData(p => ({ ...p, [policy.key]: e.target.checked, enable_ride_sharing: i === 0 ? e.target.checked : p.enable_ride_sharing }))}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-offset-0" 
                               />
                            </label>
                          ))}
                       </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 border border-indigo-100 shadow-sm shadow-indigo-100/50">
                       <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-indigo-900 mb-1">Matrix Integrity</p>
                          <p className="text-[11px] font-semibold text-indigo-700 leading-relaxed">Defining these rules will overwrite any legacy distance multipliers in the selected zone.</p>
                       </div>
                    </div>

                    <div className="space-y-3 pt-2">
                       <button 
                          onClick={handleSave} disabled={saving}
                          className="w-full h-12 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          {editingId ? 'Push Amendments' : 'Activate Ledger'}
                       </button>
                       <button 
                          onClick={() => setView('list')}
                          className="w-full h-12 bg-white text-gray-400 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                       >
                          Discard
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetPrices;
