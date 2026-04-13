import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Car, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Filter,
  Upload,
  ChevronDown,
  Info,
  CheckCircle2,
  XCircle,
  MapPin,
  Truck,
  Layers,
  ShieldCheck,
  CreditCard,
  User,
  Zap,
  Save,
  Gift,
  IndianRupee,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Design Tokens from design-system.md
const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

// Icons mapping for selection and map preview
import CarIcon from '../../../../assets/icons/car.png';
import BikeIcon from '../../../../assets/icons/bike.png';
import AutoIcon from '../../../../assets/icons/auto.png';
import TruckIcon from '../../../../assets/icons/truck.png';
import EhcvIcon from '../../../../assets/icons/ehcv.png';
import HcvIcon from '../../../../assets/icons/hcv.png';
import LcvIcon from '../../../../assets/icons/LCV.png';
import McvIcon from '../../../../assets/icons/mcv.png';
import LuxuryIcon from '../../../../assets/icons/Luxury.png';
import PremiumIcon from '../../../../assets/icons/Premium.png';
import SuvIcon from '../../../../assets/icons/SUV.png';
import MapBackground from '../../../../assets/map_image.png';

const iconMap = {
  car: CarIcon,
  bike: BikeIcon,
  auto: AutoIcon,
  truck: TruckIcon,
  ehcb: EhcvIcon,
  HCV: HcvIcon,
  LCV: LcvIcon,
  MCV: McvIcon,
  Luxary: LuxuryIcon,
  premium: PremiumIcon,
  suv: SuvIcon
};

const VehicleType = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [view, setView] = useState(propMode || 'list'); 
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehiclePreferences, setVehiclePreferences] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1 });

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    transport_type: 'taxi',
    dispatch_type: 'normal',
    icon_types: 'car',
    image: null,
    icon: '',
    capacity: 4,
    size: 'M',
    is_taxi: 'taxi',
    is_accept_share_ride: 0,
    status: 1,
    active: true,
    supported_other_vehicle_types: [],
    vehicle_preference: []
  });

  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchVehicle(id);
    }
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, prefsRes] = await Promise.all([
        fetch(`${baseUrl}/types/vehicle-types`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/vehicle_preference`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const vData = await vehiclesRes.json();
      const pData = await prefsRes.json();

      if (vData && vData.success) {
        const rawItems = vData.results || vData.data?.vehicle_types || vData.data || [];
        const items = Array.isArray(rawItems) ? rawItems : (rawItems?.results || rawItems?.vehicle_types || []);
        const safeItems = Array.isArray(items) ? items.filter(i => i && typeof i === 'object') : [];
        setVehicles(safeItems);
        
        if (vData.meta || vData.data?.pagination) {
          setPagination(vData.meta || vData.data?.pagination || { total: safeItems.length, current_page: 1 });
        }
      }
      
      if (pData.success) {
        setVehiclePreferences(pData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicle = async (vehicleId) => {
    try {
      const res = await fetch(`${baseUrl}/types/vehicle-types/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        const v = data.data;
        setFormData(prev => ({
          ...prev,
          name: v.name || '',
          short_description: v.short_description || '',
          description: v.description || '',
          transport_type: v.transport_type || 'taxi',
          capacity: v.capacity || 4,
          size: v.size || 'M',
          icon_types: v.icon_types_for || v.icon_types || 'car',
          is_taxi: v.is_taxi || 'taxi',
          is_accept_share_ride: v.is_accept_share_ride || 0,
          active: v.active !== false,
          icon: v.icon || '',
          vehicle_preference: Array.isArray(v.vehicle_preference) ? v.vehicle_preference : []
        }));
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = id ? 'POST' : 'POST'; // Assuming POST with _method=PATCH for legacy or just POST for create
      const url = id ? `${baseUrl}/types/vehicle-types/${id}/update` : `${baseUrl}/types/vehicle-types`;
      
      const body = new FormData();
      body.append('name', formData.name);
      body.append('transport_type', formData.transport_type);
      body.append('description', formData.description);
      body.append('short_description', formData.short_description);
      body.append('capacity', formData.capacity);
      body.append('size', formData.size);
      body.append('icon_types', formData.icon_types);
      body.append('is_taxi', formData.is_taxi);
      body.append('is_accept_share_ride', formData.is_accept_share_ride);
      body.append('active', formData.active ? 1 : 0);
      
      if (formData.image instanceof File) {
        body.append('icon', formData.image);
      }

      if (id) body.append('_method', 'PATCH');

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });

      const result = await res.json();
      if (result.success) {
        navigate('/admin/pricing/vehicle-type');
        fetchInitialData();
        setView('list');
      }
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Delete this vehicle type?')) return;
    try {
      const res = await fetch(`${baseUrl}/types/vehicle-types/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 200) {
        setVehicles(vehicles.filter(v => (v._id || v.id) !== vehicleId));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header Block */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Pricing</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Vehicle Types</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {view === 'list' ? 'Fleet Categories' : id ? 'Refine Vehicle Class' : 'Define New Category'}
          </h1>
          <div className="flex items-center gap-3">
            {view === 'list' ? (
              <button 
                onClick={() => navigate('/admin/pricing/vehicle-type/create')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus size={18} /> New Vehicle Type
              </button>
            ) : (
              <button 
                onClick={() => navigate('/admin/pricing/vehicle-type')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Fleet
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Car size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Types</p>
                  <h3 className="text-xl font-bold text-gray-900">{vehicles.length}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Services</p>
                  <h3 className="text-xl font-bold text-gray-900">{vehicles.filter(v => v.active !== false).length}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logistics Ready</p>
                  <h3 className="text-xl font-bold text-gray-900">{vehicles.filter(v => v.transport_type === 'delivery').length}</h3>
                </div>
              </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Identities / Category</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Vertical</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Unit Capacity</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Portfolio Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-gray-400">Loading Fleet Registry...</span>
                          </div>
                        </td>
                      </tr>
                    ) : vehicles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-sm text-gray-400">No vehicle types captured in the system.</td>
                      </tr>
                    ) : vehicles.map(v => (
                      <tr key={v._id || v.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                              <img src={v.icon || v.image || CarIcon} className="w-full h-full object-contain" alt={v.name} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{v.short_description || v.description || 'Core fleet unit'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            v.transport_type === 'taxi' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {v.transport_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-sm font-bold text-gray-700 tabular-nums">{v.capacity || 1}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-medium">{v.size || 'STD'} Class</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <StatusToggle active={v.active !== false} onToggle={() => {}} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/admin/pricing/vehicle-type/edit/${v._id || v.id}`)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(v._id || v.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
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
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form Content Side */}
            <div className="lg:col-span-2 space-y-8 pb-32">
              
              {/* Section 1: Core Definitions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Car size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Identity & Branding</h3>
                    <p className="text-xs text-gray-400">Establish the visible identity of the vehicle class</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Vehicle Type Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className={inputClass} 
                      placeholder="e.g. Luxury Sedan"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Transport Vertical *</label>
                      <select 
                        value={formData.transport_type} 
                        onChange={(e) => setFormData({...formData, transport_type: e.target.value})} 
                        className={inputClass}
                      >
                        <option value="taxi">Taxi / Ride-Hailing</option>
                        <option value="delivery">Logistics / Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Operational Scope</label>
                      <select 
                        value={formData.is_taxi} 
                        onChange={(e) => setFormData({...formData, is_taxi: e.target.value})} 
                        className={inputClass}
                      >
                        <option value="taxi">Rider App Only</option>
                        <option value="delivery">Driver App Only</option>
                        <option value="both">Universal (Mixed Mode)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Short Pitch / Tagline</label>
                    <input 
                      type="text" 
                      value={formData.short_description} 
                      onChange={(e) => setFormData({...formData, short_description: e.target.value})} 
                      className={inputClass} 
                      placeholder="e.g. Premium comfort for city rides"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expanded Description</label>
                    <textarea 
                      rows="3" 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className={inputClass} 
                      placeholder="Provide details about the vehicles allowed in this category..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Physical Parameters */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Classification & Capacity</h3>
                    <p className="text-xs text-gray-400">Define the physical constraints of the unit</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Unit Capacity *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input 
                        type="number" 
                        value={formData.capacity} 
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                        className={inputClass + " pl-10"} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Size Category</label>
                    <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} className={inputClass}>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Strategy Icon</label>
                    <select value={formData.icon_types} onChange={(e) => setFormData({...formData, icon_types: e.target.value})} className={inputClass}>
                      {Object.keys(iconMap).map(key => <option key={key} value={key}>{key.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Visual Identity Asset */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Visual Presentation</h3>
                    <p className="text-xs text-gray-400">Media assets used in the passenger application</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/2 aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
                    {formData.image || formData.icon ? (
                      <>
                        <img 
                          src={formData.image instanceof File ? URL.createObjectURL(formData.image) : (formData.image || formData.icon)} 
                          className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" 
                          alt="Preview" 
                        />
                        <button 
                          onClick={() => setFormData({...formData, image: null})} 
                          className="absolute top-3 right-3 p-2 bg-white/90 shadow-lg rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
                        <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                          <Upload size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Upload Asset</span>
                        <span className="text-[10px] text-gray-400">512x512 Transparent PNG</span>
                      </label>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Marker Preview</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">This icon will be used on the live map tracking system to represent vehicles of this category.</p>
                    <div className="w-32 h-32 bg-gray-900 rounded-3xl relative overflow-hidden shadow-2xl border border-gray-800">
                        <img src={MapBackground} className="absolute inset-0 w-full h-full object-cover opacity-20 saturate-0" alt="Map" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img src={iconMap[formData.icon_types] || CarIcon} className="w-16 h-16 object-contain drop-shadow-2xl" alt="Icon" />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions Content Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Rules & Policy Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Policy Configuration</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.is_accept_share_ride === 1} 
                        onChange={(e) => setFormData({...formData, is_accept_share_ride: e.target.checked ? 1 : 0})} 
                        className="w-4 h-4 rounded text-indigo-600" 
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Pooled Rides</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.active} 
                        onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                        className="w-4 h-4 rounded text-indigo-600" 
                      />
                      <span className="text-sm font-medium text-gray-700">Active Service Type</span>
                    </label>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">System Note</h4>
                    <div className="bg-amber-50 p-3 rounded-lg flex gap-3">
                      <Info size={14} className="text-amber-600 shrink-0" />
                      <p className="text-[11px] text-amber-800 leading-normal">
                        Changes to capacity or transport type may affect existing pricing matrices linked to this class.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Actions Container */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 shadow-xl shadow-gray-200/20">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} /> {isSaving ? 'Processing...' : id ? 'Commit Changes' : 'Activate Category'}
                  </button>
                  <button 
                    onClick={() => navigate('/admin/pricing/vehicle-type')} 
                    className="w-full py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Discard 
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

export default VehicleType;
