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
  Globe,
  Eye,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from '../../../../shared/api/runtimeConfig';
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 bg-white focus:border-indigo-500 transition-all outline-none";
const labelClass = "block text-[13px] font-semibold text-gray-700 mb-2.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${active ? 'bg-[#00BFA5]' : 'bg-gray-200'}`}
  >
    <div className={`absolute w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? 'translate-x-[22px]' : 'translate-x-1'}`} />
  </button>
);

const initialFormState = {
  zone_id: '',
  transport_type: 'taxi',
  vehicle_type: '',
  payment_type: ['cash'],
  admin_commision_type: '1',
  admin_commision: '',
  admin_commission_type_from_driver: '1',
  admin_commission_from_driver: '',
  admin_commission_type_for_owner: '1',
  admin_commission_for_owner: '',
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
  enable_ride_sharing: false,
  user_cancellation_fee: '',
  user_cancellation_fee_type: 'percentage',
  driver_cancellation_fee: '',
  driver_cancellation_fee_type: 'percentage',
  cancellation_fee_goes_to: 'admin',
  status: 'active',
  active: 1
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
  
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

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
          zone_id: pData.zone_id?._id || pData.zone_id || '',
          vehicle_type: pData.vehicle_type?._id || pData.vehicle_type || '',
          admin_commision: pData.admin_commision ?? pData.customer_commission ?? '',
          admin_commision_type: String(pData.admin_commision_type ?? 1),
          admin_commission_from_driver: pData.admin_commission_from_driver ?? pData.driver_commission ?? '',
          admin_commission_type_from_driver: String(pData.admin_commission_type_from_driver ?? 1),
          admin_commission_for_owner: pData.admin_commission_for_owner ?? 0,
          admin_commission_type_for_owner: String(pData.admin_commission_type_for_owner ?? 1),
          order_number: pData.order_number ?? pData.eta_sequence ?? '',
        });
      }
    } else if (mode === 'create') {
      setFormData({ ...initialFormState });
    }
  }, [mode, id, prizesFull]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prizesRes, zonesRes, vehiclesRes] = await Promise.all([
        fetch(`${baseUrl}/types/set-prices`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/zones`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/types/vehicle-types`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [prizesData, zonesData, vehiclesData] = await Promise.all([
        prizesRes.json(), zonesRes.json(), vehiclesRes.json()
      ]);

      if (prizesData.success) {
        setPrizes(prizesData.results || []);
        setPrizesFull(prizesData.paginator?.data || prizesData.results || []);
      }
      if (zonesData.success) setZones(zonesData.results || zonesData.data?.zones || []);
      if (vehiclesData.success) setVehicleTypes(vehiclesData.results || vehiclesData.data?.vehicle_types || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `${baseUrl}/types/set-prices/${editingId}` : `${baseUrl}/types/set-prices`;
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin/pricing/set-price');
        fetchInitialData();
      } else alert(data.message || "Failed to save");
    } catch (error) { console.error(error); } finally { setSaving(false); }
  };

  const filteredPrizes = prizes.filter(p => {
    const q = searchTerm.toLowerCase();
    return (p.zone_name || '').toLowerCase().includes(q) || (p.vehicle_type_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
               <h1 className="text-sm font-bold text-[#1E293B] uppercase tracking-[0.15em]">SET PRICES</h1>
               <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium tracking-tight">
                  <span className="hover:text-slate-600 transition-colors cursor-pointer">Set Prices</span>
                  <ChevronRight size={10} className="text-slate-300" />
                  <span className="text-slate-800 font-bold">Set Prices</span>
               </div>
            </div>

            <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-5 flex items-center justify-between border-b border-gray-50 bg-white px-8">
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <span>show</span>
                    <div className="relative">
                      <select className="appearance-none bg-white border border-gray-200 rounded px-4 py-1.5 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700 font-bold text-[13px]">
                        <option>10</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                      <Search size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-[#F37048] text-white rounded text-sm font-bold shadow-sm">
                      <Filter size={16} /> Filters
                    </button>
                    <button onClick={() => navigate('/admin/pricing/set-price/create')} className="flex items-center gap-2 px-6 py-2 bg-[#44516F] text-white rounded text-sm font-bold shadow-sm">
                      <Plus size={18} /> Add Set Price
                    </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-[#FBFCFF]">
                     <tr className="border-b border-gray-100 text-[11px] text-slate-800 uppercase font-black tracking-[0.1em]">
                        <th className="px-8 py-5">Zone</th>
                        <th className="px-8 py-5">Transport Type</th>
                        <th className="px-8 py-5">Vehicle Type</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right pr-12">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                    {loading ? (
                       <tr><td colSpan="5" className="py-24 text-center text-slate-300 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Price Matrix...</td></tr>
                    ) : filteredPrizes.map((prize) => (
                      <tr key={prize.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-sm font-semibold text-slate-700">{prize.zone_name || 'India'}</td>
                        <td className="px-8 py-6 text-sm text-slate-600 font-medium">{prize.transport_type || 'All'}</td>
                        <td className="px-8 py-6 text-sm text-slate-800 font-bold">{prize.vehicle_type_name || 'Premium Car'}</td>
                        <td className="px-8 py-6">
                           <StatusToggle active={Number(prize.active) === 1} onToggle={async () => {
                             await fetch(`${baseUrl}/types/set-prices/${prize.id}`, {
                               method: 'PATCH',
                               headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                               body: JSON.stringify({ active: Number(prize.active) === 1 ? 0 : 1 })
                             });
                             fetchInitialData();
                           }} />
                        </td>
                        <td className="px-8 py-6 text-right pr-12">
                           <div className="flex items-center justify-end gap-2">
                              {/* Action buttons matching screenshot */}
                              <button onClick={() => navigate(`/admin/pricing/set-price/edit/${prize.id}`)} className="w-8 h-8 flex items-center justify-center bg-[#FFF7ED] text-[#F97316] rounded"><Edit2 size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-[#F0FDFA] text-[#14B8A6] rounded"><Gift size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-[#F8FAFC] text-[#64748B] rounded"><Eye size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-[#EFF6FF] text-[#3B82F6] rounded"><Layers size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-[#FEF2F2] text-[#EF4444] rounded"><Zap size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-[#EEF2FF] text-[#6366F1] rounded"><Cone size={14} /></button>
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
            className="p-6 lg:p-8 space-y-6"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-8">
               <h1 className="text-sm font-bold text-[#1E293B] uppercase tracking-[0.15em]">{mode === 'edit' ? 'EDIT' : 'CREATE'}</h1>
               <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/admin/pricing/set-price')}>Set Prices</span>
                  <ChevronRight size={10} className="text-slate-300" />
                  <span className="text-slate-800 font-bold">{mode === 'edit' ? 'Edit' : 'Create'}</span>
               </div>
            </div>

            <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4 lg:p-10 relative">
               <div className="flex justify-end mb-4">
                  <button className="text-[11px] font-bold text-[#00BFA5] underline decoration-dotted underline-offset-4">How It Works</button>
               </div>

               <form onSubmit={handleSave} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                     {/* Row 1 */}
                     <div>
                        <label className={labelClass}>Zone <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.zone_id} onChange={e => setFormData(p=>({...p, zone_id: e.target.value}))}>
                              <option value="">Select Zone</option>
                              {zones.map(z => <option key={z._id || z.id} value={z._id || z.id}>{z.name}</option>)}
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Transport Type <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.transport_type} onChange={e => setFormData(p=>({...p, transport_type: e.target.value}))}>
                              <option value="">Select Transport Type</option>
                              <option value="taxi">Ride Hailing</option>
                              <option value="delivery">Logistics</option>
                              <option value="both">Both</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* Row 2 */}
                     <div>
                        <label className={labelClass}>Vehicle Type <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.vehicle_type} onChange={e => setFormData(p=>({...p, vehicle_type: e.target.value}))}>
                              <option value="">Select Vehicle Type</option>
                              {vehicleTypes.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Payment Type <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.payment_type[0]} onChange={e => setFormData(p=>({...p, payment_type: [e.target.value]}))}>
                              <option value="">Select Payment Type</option>
                              <option value="cash">Cash</option>
                              <option value="online">Online</option>
                              <option value="wallet">Wallet</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* Row 3 - Customer Commission */}
                     <div>
                        <label className={labelClass}>Admin Commission Type From Customer <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.admin_commision_type} onChange={e => setFormData(p=>({...p, admin_commision_type: e.target.value}))}>
                              <option value="">Select Type</option>
                              <option value="1">Percentage</option>
                              <option value="2">Fixed</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Admin Commission From Customer <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Admin Commission From Customer" value={formData.admin_commision} onChange={e => setFormData(p=>({...p, admin_commision: e.target.value}))} />
                     </div>

                     {/* Row 4 - Driver Commission */}
                     <div>
                        <label className={labelClass}>Admin Commission Type From Driver <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.admin_commission_type_from_driver} onChange={e => setFormData(p=>({...p, admin_commission_type_from_driver: e.target.value}))}>
                              <option value="">Select Type</option>
                              <option value="1">Percentage</option>
                              <option value="2">Fixed</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Admin Commission From Driver <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Admin Commission From Driver" value={formData.admin_commission_from_driver} onChange={e => setFormData(p=>({...p, admin_commission_from_driver: e.target.value}))} />
                     </div>

                     {/* Row 5 - Owner Commission */}
                     <div>
                        <label className={labelClass}>Admin Commission Type From Owner <span className="text-rose-500">*</span></label>
                        <div className="relative">
                           <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.admin_commission_type_for_owner} onChange={e => setFormData(p=>({...p, admin_commission_type_for_owner: e.target.value}))}>
                              <option value="">Select Type</option>
                              <option value="1">Percentage</option>
                              <option value="2">Fixed</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Admin Commission From Owner <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Admin Commission From Owner" value={formData.admin_commission_for_owner} onChange={e => setFormData(p=>({...p, admin_commission_for_owner: e.target.value}))} />
                     </div>

                     {/* Row 6 - Fiscal */}
                     <div>
                        <label className={labelClass}>Service Tax (%) <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Service Tax (%)" value={formData.service_tax} onChange={e => setFormData(p=>({...p, service_tax: e.target.value}))} />
                     </div>
                     <div>
                        <label className={labelClass}>ETA Sequence <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Order Number" value={formData.order_number} onChange={e => setFormData(p=>({...p, order_number: e.target.value}))} />
                     </div>

                     {/* Row 7 - Base Pricing */}
                     <div>
                        <label className={labelClass}>Base Price <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Base Price" value={formData.base_price} onChange={e => setFormData(p=>({...p, base_price: e.target.value}))} />
                     </div>
                     <div>
                        <label className={labelClass}>Base Distance <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Base Distance" value={formData.base_distance} onChange={e => setFormData(p=>({...p, base_distance: e.target.value}))} />
                     </div>

                     {/* Row 8 - Distance/Time */}
                     <div>
                        <label className={labelClass}>Price Per Distance <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Price Per Distance" value={formData.price_per_distance} onChange={e => setFormData(p=>({...p, price_per_distance: e.target.value}))} />
                     </div>
                     <div>
                        <label className={labelClass}>Time Price in Mintue <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Time Price" value={formData.time_price} onChange={e => setFormData(p=>({...p, time_price: e.target.value}))} />
                     </div>

                     {/* Row 9 - Waiting */}
                     <div>
                        <label className={labelClass}>Waiting Charge <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Enter Waiting Charge" value={formData.waiting_charge} onChange={e => setFormData(p=>({...p, waiting_charge: e.target.value}))} />
                     </div>
                     <div>
                        <label className={labelClass}>Free Waiting Time In Minutes Before Start A Ride <span className="text-rose-500">*</span></label>
                        <input type="number" required className={inputClass} placeholder="Free Waiting Time In Minutes Before Start A Ride" value={formData.free_waiting_before} onChange={e => setFormData(p=>({...p, free_waiting_before: e.target.value}))} />
                     </div>

                     {/* Row 10 - Flags & Waiting After */}
                     <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <div>
                           <label className={labelClass}>Free Waiting Time In Minutes After Start A Ride <span className="text-rose-500">*</span></label>
                           <input type="number" required className={inputClass} placeholder="Free Waiting Time In Minutes After Start A Ride" value={formData.free_waiting_after} onChange={e => setFormData(p=>({...p, free_waiting_after: e.target.value}))} />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={formData.enable_airport_ride} onChange={e => setFormData(p=>({...p, enable_airport_ride: e.target.checked}))} />
                           <span className="text-[13px] font-semibold text-gray-700">Enable Airport Ride</span>
                        </div>
                     </div>

                     <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={formData.enable_outstation_ride} onChange={e => setFormData(p=>({...p, enable_outstation_ride: e.target.checked}))} />
                           <span className="text-[13px] font-semibold text-gray-700">Enable Outstation Ride</span>
                        </div>
                     </div>
                  </div>

                  {/* Section: Cancellation Fee */}
                  <div className="space-y-6 pt-4 border-t border-gray-50">
                     <h2 className="text-base font-bold text-gray-800 tracking-tight">Cancellation Fee</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                           <label className={labelClass}>Cancellation Fee for User <span className="text-rose-500">*</span></label>
                           <div className="flex border border-gray-200 rounded-md overflow-hidden">
                              <select className="bg-gray-50 px-3 text-xs font-bold border-r outline-none" value={formData.user_cancellation_fee_type} onChange={e => setFormData(p=>({...p, user_cancellation_fee_type: e.target.value}))}>
                                 <option value="percentage">%</option>
                                 <option value="fixed">FIXED</option>
                              </select>
                              <input type="number" className="flex-1 px-4 py-3 text-sm outline-none" placeholder="Enter Cancellation Fee for User" value={formData.user_cancellation_fee} onChange={e => setFormData(p=>({...p, user_cancellation_fee: e.target.value}))} />
                           </div>
                        </div>
                        <div>
                           <label className={labelClass}>Cancellation Fee for Driver <span className="text-rose-500">*</span></label>
                           <div className="flex border border-gray-200 rounded-md overflow-hidden">
                              <select className="bg-gray-50 px-3 text-xs font-bold border-r outline-none" value={formData.driver_cancellation_fee_type} onChange={e => setFormData(p=>({...p, driver_cancellation_fee_type: e.target.value}))}>
                                 <option value="percentage">%</option>
                                 <option value="fixed">FIXED</option>
                              </select>
                              <input type="number" className="flex-1 px-4 py-3 text-sm outline-none" placeholder="Enter Cancellation Fee for Driver" value={formData.driver_cancellation_fee} onChange={e => setFormData(p=>({...p, driver_cancellation_fee: e.target.value}))} />
                           </div>
                        </div>
                        <div>
                           <label className={labelClass}>Fee Goes to <span className="text-rose-500">*</span></label>
                           <div className="relative">
                              <select required className={inputClass + " appearance-none cursor-pointer"} value={formData.cancellation_fee_goes_to} onChange={e => setFormData(p=>({...p, cancellation_fee_goes_to: e.target.value}))}>
                                 <option value="">Select who get cancellation fee</option>
                                 <option value="admin">Admin</option>
                                 <option value="driver">Driver</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Section: Shared Ride */}
                  <div className="space-y-6 pt-4 border-t border-gray-50">
                     <h2 className="text-base font-bold text-gray-800 tracking-tight">Shared Ride</h2>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={formData.enable_ride_sharing} onChange={e => setFormData(p=>({...p, enable_ride_sharing: e.target.checked}))} />
                        <span className="text-[13px] font-semibold text-gray-700">Enable Ride Sharing</span>
                     </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-6 flex justify-end">
                     <button type="submit" disabled={saving} className="px-10 py-3 bg-[#00BFA5] text-white rounded text-sm font-bold shadow-md hover:opacity-90 transition-opacity active:scale-95 flex items-center gap-2">
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Save
                     </button>
                  </div>
               </form>

               {/* Mockup Floating Button */}
               <div className="absolute right-8 top-[360px] z-50">
                  <button type="button" className="w-12 h-12 bg-[#00BFA5] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
                     <div className="flex flex-col gap-1.5 items-center">
                        <div className="w-5 h-[2px] bg-white rounded-full"></div>
                        <div className="w-5 h-[2px] bg-white rounded-full"></div>
                        <div className="w-5 h-[2px] bg-white rounded-full"></div>
                     </div>
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetPrices;
