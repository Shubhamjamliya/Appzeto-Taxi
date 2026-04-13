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
  ChevronLeft,
  Gift,
  Settings,
  Filter,
  Cone,
  Info,
  ChevronDown,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from '../../../../shared/api/runtimeConfig';
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-[22px] rounded-full transition-colors relative flex items-center ${active ? 'bg-emerald-500' : 'bg-gray-200 border border-gray-300'}`}
  >
    <div className={`absolute w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${active ? 'translate-x-7' : 'translate-x-[2px]'}`} />
  </button>
);

const initialFormState = {
  zone_id: '',
  transport_type: 'taxi',
  vehicle_type: '',
  app_modules: '',
  payment_type: ['cash'],
  admin_commision: '',
  admin_commision_type: '1',
  admin_commission_from_driver: '',
  admin_commission_type_from_driver: '1',
  admin_commission_for_owner: '',
  admin_commission_type_for_owner: '1',
  service_tax: '',
  order_number: '',
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
  cancellation_fee_for_user: '',
  cancellation_fee_for_driver: '',
  fee_goes_to: '',
  status: 'active'
};

const SetPrices = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreateOrEdit = mode === 'create' || mode === 'edit';
  const view = isCreateOrEdit ? 'create' : 'list';
  const editingId = id || null;

  const [prizes, setPrizes] = useState([]);
  const [prizesFull, setPrizesFull] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lookup data
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [appModules, setAppModules] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);

  const [formData, setFormData] = useState(initialFormState);

  const baseUrl = `${API_BASE_URL}/admin`;
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && id && prizesFull.length > 0) {
      const pData = prizesFull.find(d => (String(d._id) === String(id) || String(d.id) === String(id)));
      if (pData) {
        setFormData({
          ...pData,
          zone_id: pData.zone_id?._id || pData.zone_id || pData.zone?._id || '',
          vehicle_type: pData.vehicle_type?._id || pData.vehicle_type || '',
          app_modules: pData.app_modules?._id || pData.app_modules || '',
          admin_commision: pData.admin_commision ?? pData.customer_commission ?? '',
          admin_commision_type: String(pData.admin_commision_type ?? (pData.customer_commission_type === 'percentage' ? '1' : '0')),
          admin_commission_from_driver: pData.admin_commission_from_driver ?? pData.driver_commission ?? '',
          admin_commission_type_from_driver: String(pData.admin_commission_type_from_driver ?? (pData.driver_commission_type === 'percentage' ? '1' : '0')),
          admin_commission_for_owner: pData.admin_commission_for_owner ?? pData.owner_commission ?? '',
          admin_commission_type_for_owner: String(pData.admin_commission_type_for_owner ?? (pData.owner_commission_type === 'percentage' ? '1' : '0')),
          order_number: pData.order_number ?? pData.eta_sequence ?? '',
          cancellation_fee_for_user: pData.cancellation_fee_for_user ?? pData.user_cancellation_fee ?? '',
          cancellation_fee_for_driver: pData.cancellation_fee_for_driver ?? pData.driver_cancellation_fee ?? '',
          fee_goes_to: pData.fee_goes_to ?? pData.cancellation_fee_goes_to ?? '',
          enable_shared_ride: pData.enable_shared_ride || pData.enable_ride_sharing || false,
        });
      }
    } else if (mode === 'create') {
      setFormData({ ...initialFormState });
    }
  }, [mode, id, prizesFull]);

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
        const items = prizesData.data?.set_prices?.results || prizesData.data?.set_prices || prizesData.data?.results || prizesData.results || (Array.isArray(prizesData.data) ? prizesData.data : []);
        setPrizes(Array.isArray(items) ? items : []);
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

  const handleSave = async (e) => {
    if(e) e.preventDefault();
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
        navigate('/admin/pricing/set-price');
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
    navigate(`/admin/pricing/set-price/edit/${prize._id || prize.id}`);
  };

  const filteredPrizes = prizes.filter(p => {
    const q = searchTerm.toLowerCase();
    const zoneName = p.zone_name || p.zone_id?.name || '';
    const vName = p.vehicle_type_name || p.vehicle_type?.name || '';
    return zoneName.toLowerCase().includes(q) || vName.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-6"
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <span>Pricing</span>
                <ChevronRight size={12} />
                <span className="text-gray-700">Set Prices</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Fare Configuration</h1>
                  <p className="text-xs text-gray-500 mt-1">Manage zone-based pricing strategies and vehicle commissions.</p>
                </div>
                <button 
                  onClick={() => navigate('/admin/pricing/set-price/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                >
                  <Plus size={18} /> Add Price Rule
                </button>
              </div>
            </div>

            {/* List Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="p-4 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="relative w-full max-sm:max-w-none max-w-sm">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by zone or vehicle..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter size={14} /> Filters
                    </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-100">
                       <th className="px-6 py-4 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Zone</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Transport</th>
                       <th className="px-6 py-4 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Vehicle Type</th>
                       <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-900 uppercase tracking-wider w-32">Status</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-900 uppercase tracking-wider">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr><td colSpan="5" className="text-center py-20"><Loader2 className="animate-spin text-indigo-600 mx-auto" size={32}/></td></tr>
                      ) : filteredPrizes.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-20 text-gray-400 text-sm">No price rules found matching your selection.</td></tr>
                      ) : filteredPrizes.map((prize, idx) => (
                         <tr key={prize._id || prize.id || idx} className="hover:bg-gray-50/20 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{prize.zone_name || prize.zone_id?.name || 'Global'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase border border-gray-200">
                                  {prize.transport_type === 'both' ? 'Hybrid' : prize.transport_type}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{prize.vehicle_type_name || prize.vehicle_type?.name}</td>
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
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => handleEdit(prize)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                   <button onClick={() => handleDelete(prize._id || prize.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <span>Price Ledger</span>
                  <ChevronRight size={12} />
                  <span className="text-gray-700 font-medium">{mode === 'edit' ? 'Modify' : 'Initialize'} Rule</span>
                </div>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-gray-900">{mode === 'edit' ? 'Edit Pricing Matrix' : 'Add New Pricing'}</h1>
                  <button 
                    onClick={() => navigate('/admin/pricing/set-price')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {loading ? (
                   <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                      <p className="text-xs font-semibold uppercase tracking-widest">Hydrating Pricing Data</p>
                   </div>
                ) : (
                  <form onSubmit={handleSave} className="p-6 lg:p-8 space-y-10">
                    <div className="space-y-8">
                       {/* Context Section */}
                       <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Layers size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Module Context</h3>
                            <p className="text-xs text-gray-400">Target zone and vehicle compatibility</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div>
                            <label className={labelClass}><MapPin size={12} className="inline mr-1 text-gray-400"/> Zone Selection *</label>
                            <div className="relative">
                               <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.zone_id} onChange={(e) => setFormData(p => ({ ...p, zone_id: e.target.value }))}>
                                  <option value="">Choose Service Zone</option>
                                  {zones.map(z => <option key={z._id || z.id} value={z._id || z.id}>{z.name}</option>)}
                               </select>
                               <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                         </div>

                         <div>
                            <label className={labelClass}><Zap size={12} className="inline mr-1 text-gray-400"/> Transport Module *</label>
                            <div className="relative">
                               <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.transport_type} onChange={(e) => setFormData(p => ({ ...p, transport_type: e.target.value }))}>
                                  <option value="taxi">Ride Hailing (Taxi)</option>
                                  <option value="delivery">Logistics (Delivery)</option>
                                  <option value="both">Universal Hybrid</option>
                               </select>
                               <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                         </div>

                         <div>
                            <label className={labelClass}><Car size={12} className="inline mr-1 text-gray-400"/> Vehicle Definition *</label>
                            <div className="relative">
                               <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.vehicle_type} onChange={(e) => setFormData(p => ({ ...p, vehicle_type: e.target.value }))}>
                                  <option value="">Select Vehicle Class</option>
                                  {vehicleTypes.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
                               </select>
                               <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                         </div>

                         <div>
                            <label className={labelClass}><CreditCard size={12} className="inline mr-1 text-gray-400"/> Enabled Channels</label>
                            <div className="flex flex-wrap gap-2">
                               {['cash', 'wallet', 'online'].map(type => (
                                  <button key={type} type="button" onClick={() => {
                                     const next = formData.payment_type.includes(type) ? formData.payment_type.filter(t => t !== type) : [...formData.payment_type, type];
                                     setFormData(p => ({ ...p, payment_type: next }));
                                  }} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${formData.payment_type.includes(type) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{type.toUpperCase()}</button>
                               ))}
                            </div>
                         </div>
                       </div>

                       {/* Revenue Section */}
                       <div className="flex items-center gap-3 mt-10 mb-6 pb-4 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <DollarSign size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Commission Ecosystem</h3>
                            <p className="text-xs text-gray-400">Revenue distribution for stakeholders</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         <div>
                            <label className={labelClass}>Customer-Side Logic *</label>
                            <div className="flex gap-2">
                               <input type="number" required placeholder="0.00" className={inputClass} value={formData.admin_commision} onChange={(e) => setFormData(p => ({ ...p, admin_commision: e.target.value }))} />
                               <select className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold bg-white focus:border-indigo-500 outline-none" value={formData.admin_commision_type} onChange={(e) => setFormData(p => ({ ...p, admin_commision_type: e.target.value }))}>
                                  <option value="1">%</option>
                                  <option value="2">FIXED</option>
                                </select>
                            </div>
                         </div>

                         <div>
                            <label className={labelClass}>Driver-Side Logic *</label>
                            <div className="flex gap-2">
                               <input type="number" required placeholder="0.00" className={inputClass} value={formData.admin_commission_from_driver} onChange={(e) => setFormData(p => ({ ...p, admin_commission_from_driver: e.target.value }))} />
                               <select className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold bg-white focus:border-indigo-500 outline-none" value={formData.admin_commission_type_from_driver} onChange={(e) => setFormData(p => ({ ...p, admin_commission_type_from_driver: e.target.value }))}>
                                  <option value="1">%</option>
                                  <option value="2">FIXED</option>
                               </select>
                            </div>
                         </div>
                       </div>

                       {/* Fare Matrix */}
                       <div className="flex items-center gap-3 mt-10 mb-6 pb-4 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Tag size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Fare Matrix</h3>
                            <p className="text-xs text-gray-400">Core pricing variables for trip calculation</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                         {[
                            { key: 'base_price', icon: DollarSign, label: 'Standard Base Price' },
                            { key: 'base_distance', icon: MapPin, label: 'Free Base Distance' },
                            { key: 'price_per_distance', icon: Zap, label: 'Rate Per Km/Mi' },
                            { key: 'time_price', icon: Clock, label: 'Rate Per Minute' },
                            { key: 'waiting_charge', icon: Clock, label: 'Wait Fee / Min' },
                            { key: 'service_tax', icon: ShieldCheck, label: 'Service Tax (%)' }
                         ].map(item => (
                            <div key={item.key}>
                               <label className={labelClass}><item.icon size={11} className="inline mr-1 text-gray-400"/> {item.label}</label>
                               <input type="number" required placeholder="0.00" className={inputClass} value={formData[item.key]} onChange={(e) => setFormData(p => ({ ...p, [item.key]: e.target.value }))} />
                            </div>
                         ))}
                       </div>

                       {/* Flags */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
                          {[
                            { key: 'enable_airport_ride', label: 'Airport Integration', icon: ShieldCheck },
                            { key: 'enable_outstation_ride', label: 'Outstation Support', icon: Globe },
                            { key: 'enable_shared_ride', label: 'Share Ride Protocol', icon: User }
                          ].map(flag => (
                            <div key={flag.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors group">
                               <div className="flex items-center gap-3">
                                  <flag.icon size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-semibold text-gray-700">{flag.label}</span>
                               </div>
                               <StatusToggle active={formData[flag.key]} onToggle={() => setFormData(p => ({ ...p, [flag.key]: !p[flag.key] }))} />
                            </div>
                          ))}
                       </div>

                       <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-[11px] font-medium text-amber-800 leading-relaxed shadow-xs">
                          <Info size={16} className="text-amber-600 shrink-0" />
                          Price rules are synchronized across the dispatcher and driver apps instantly upon activation. Please verify tax implications for target zones before publishing.
                       </div>

                       {/* Footer Actions */}
                       <div className="pt-8 flex justify-end gap-3 border-t border-gray-100">
                          <button type="button" onClick={() => navigate('/admin/pricing/set-price')} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                          <button type="submit" disabled={saving} className="px-10 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95">
                             {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                             {saving ? 'Syncing...' : (mode === 'edit' ? 'Update Matrix' : 'Publish Matrix')}
                          </button>
                       </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetPrices;
