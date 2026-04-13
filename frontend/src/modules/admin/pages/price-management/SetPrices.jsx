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

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${active ? 'left-6' : 'left-1'}`} />
  </button>
);

const SetPrices = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [prizes, setPrizes] = useState([]);
  const [prizesFull, setPrizesFull] = useState([]);
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

  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';
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
        const items = prizesData.results || prizesData.data?.results || prizesData.data?.set_prices || (Array.isArray(prizesData.data) ? prizesData.data : []);
        setPrizes(items);
        setPrizesFull(prizesData.paginator?.data || items);
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
    const pData = prizesFull.find(d => (d._id || d.id) === (prize._id || prize.id)) || prize;
    
    setFormData({
      ...pData,
      zone_id: pData.zone_id?._id || pData.zone_id || pData.zone?._id || '',
      vehicle_type: pData.vehicle_type?._id || pData.vehicle_type || '',
      app_modules: pData.app_modules?._id || pData.app_modules || '',
      vehicle_preference: pData.vehicle_preference?._id || pData.vehicle_preference || '',
    });
    setView('create');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header Block */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Pricing</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Set Prices</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {view === 'list' ? 'Vehicle Pricing Registry' : editingId ? 'Update Price Configuration' : 'Establish New Pricing Rule'}
          </h1>
          {view !== 'list' && (
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} /> Back
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
              <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-gray-500">Show</span>
                    <select className="bg-transparent border-none text-xs font-semibold text-gray-900 focus:ring-0 p-0">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-1 max-w-md items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search price mappings..."
                      className="w-full bg-gray-50 border-gray-200 border rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all" onClick={() => { setEditingId(null); setView('create'); }}>
                    <Plus size={16} /> Create New
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Zone</th>
                        <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transport</th>
                        <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Vehicle Type</th>
                        <th className="px-6 py-4 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
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
                          <tr key={prize._id || idx} className="hover:bg-gray-50/50 transition-colors group text-sans font-sans">
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-900">{prize.zone_name || prize.zone_id?.name || 'Global'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">{prize.transport_type || 'Taxi'}</span>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2.5">
                              {prize.icon ? (
                                <img src={prize.icon} alt="" className="w-6 h-6 rounded border border-gray-100 object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Car size={12} /></div>
                              )}
                              <span className="text-sm font-medium text-gray-600">{prize.vehicle_type_name || prize.vehicle_type?.name || 'Standard'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <StatusToggle 
                                  active={prize.status === "active" || prize.status === 1 || prize.active === 1 || prize.active === true} 
                                  onToggle={async () => {
                                    const currentIsActive = (prize.status === "active" || prize.status === 1 || prize.active === 1 || prize.active === true);
                                    const nextStatus = currentIsActive ? "inactive" : "active";
                                    const nextActive = currentIsActive ? 0 : 1;
                                    
                                    try {
                                      const res = await fetch(`${baseUrl}/types/set-prices/${prize._id || prize.id}`, {
                                        method: 'PATCH',
                                        headers: { 
                                          'Authorization': `Bearer ${token}`,
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ status: nextStatus, active: nextActive })
                                      });
                                      if ((await res.json()).success) fetchInitialData();
                                    } catch (e) { console.error(e); }
                                  }} 
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(prize)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(prize._id || prize.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={14} /></button>
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
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Showing {prizes.length} configurations</p>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                    <button className="w-7 h-7 rounded bg-indigo-600 text-white text-xs font-semibold">1</button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Form Content Side */}
              <div className="lg:col-span-2 space-y-8 pb-32">
                
                {/* Section 1: Scoping */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Geographic Scoping</h3>
                      <p className="text-xs text-gray-400">Define the operational zone and transport vertical</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}><MapPin size={10} className="inline mr-1" /> Service Zone *</label>
                      <select 
                        value={formData.zone_id}
                        onChange={(e) => setFormData({...formData, zone_id: e.target.value})}
                        className={inputClass}
                      >
                        <option value="">Select Zone</option>
                        {zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}><Truck size={10} className="inline mr-1" /> Transport Mode *</label>
                      <select 
                        value={formData.transport_type}
                        onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                        className={inputClass}
                      >
                        <option value="">Select Mode</option>
                        <option value="taxi">Taxi / Ride-Hailing</option>
                        <option value="delivery">Logistics / Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}><Car size={10} className="inline mr-1" /> Vehicle Category *</label>
                      <select
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                        className={inputClass}
                      >
                        <option value="">Select Vehicle Type</option>
                        {vehicleTypes.map((v) => (
                          <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}><Layers size={10} className="inline mr-1" /> Operational Module *</label>
                      <select 
                        value={formData.app_modules}
                        onChange={(e) => setFormData({...formData, app_modules: e.target.value})}
                        className={inputClass}
                      >
                        <option value="">Select Module</option>
                        {appModules.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name || m.module_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Financial Configuration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Revenue & Commissions</h3>
                      <p className="text-xs text-gray-400">Set platform fees and tax parameters</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}><User size={10} className="inline mr-1" /> Client Commission (%) *</label>
                      <input 
                        type="number" 
                        value={formData.admin_commision}
                        onChange={(e) => setFormData({...formData, admin_commision: e.target.value, customer_commission: e.target.value})}
                        className={inputClass} 
                        placeholder="10.00"
                      />
                    </div>

                    <div>
                      <label className={labelClass}><ShieldCheck size={10} className="inline mr-1" /> Service Tax (%) *</label>
                      <input 
                        type="number" 
                        value={formData.service_tax}
                        onChange={(e) => setFormData({...formData, service_tax: e.target.value})}
                        className={inputClass} 
                        placeholder="18.00"
                      />
                    </div>

                    <div>
                      <label className={labelClass}><CreditCard size={10} className="inline mr-1" /> Driver Commission (%) *</label>
                      <input 
                        type="number" 
                        value={formData.admin_commission_from_driver}
                        onChange={(e) => setFormData({...formData, admin_commission_from_driver: e.target.value})}
                        className={inputClass} 
                        placeholder="15.00"
                      />
                    </div>

                    <div>
                      <label className={labelClass}><IndianRupee size={10} className="inline mr-1" /> Payment Method *</label>
                      <select 
                        value={formData.payment_type?.[0] || 'cash'}
                        onChange={(e) => setFormData({...formData, payment_type: [e.target.value]})}
                        className={inputClass}
                      >
                        <option value="cash">Multi-Channel (Cash/Wallet/Card)</option>
                        <option value="wallet">Wallet Only</option>
                        <option value="card">Card Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Base Matrix */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Base Unit Matrix</h3>
                      <p className="text-xs text-gray-400">Core pricing for distance and time</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Base Price (Flag Fall) *</label>
                      <input type="number" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Base Distance (Free Km) *</label>
                      <input type="number" value={formData.base_distance} onChange={(e) => setFormData({...formData, base_distance: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Price Per Km *</label>
                      <input type="number" value={formData.price_per_distance} onChange={(e) => setFormData({...formData, price_per_distance: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Time Price (Per Min) *</label>
                      <input type="number" value={formData.time_price} onChange={(e) => setFormData({...formData, time_price: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Actions Content Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Status & Options */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Policy Options</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" checked={formData.enable_shared_ride || formData.enable_ride_sharing} onChange={(e) => setFormData({...formData, enable_shared_ride: e.target.checked ? 1 : 0, enable_ride_sharing: e.target.checked})} className="w-4 h-4 rounded text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Ride Sharing</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" checked={formData.enable_airport_ride} onChange={(e) => setFormData({...formData, enable_airport_ride: e.target.checked})} className="w-4 h-4 rounded text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Airport Surge Support</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" checked={formData.enable_outstation_ride} onChange={(e) => setFormData({...formData, enable_outstation_ride: e.target.checked})} className="w-4 h-4 rounded text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Outstation Support</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions card from Design System */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 shadow-xl shadow-gray-200/20">
                    <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <Save size={16} /> {editingId ? 'Update Matrix' : 'Activate Pricing'}
                    </button>
                    <button onClick={() => setView('list')} className="w-full py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      Cancel 
                    </button>
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

