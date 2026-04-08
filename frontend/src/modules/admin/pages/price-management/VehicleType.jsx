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
  ChevronDown
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

const VehicleType = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehiclePreferences, setVehiclePreferences] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    transport_type: '',
    dispatch_type: '',
    icon_types: 'car',
    image: null,
    status: true,
    supported_other_vehicle_types: [],
    vehicle_preference: []
  });

  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, prefsRes] = await Promise.all([
        fetch(`${baseUrl}/types/vehicle-types`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/vehicle_preference`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const vData = await vehiclesRes.json();
      const pData = await prefsRes.json();

      if (vData.success) {
        const items = vData.data?.vehicle_types || (Array.isArray(vData.data) ? vData.data : (vData.data?.results || vData.results || []));
        setVehicles(items);
      }
      
      if (pData.success) {
        const rawItems = pData.data || [];
        const items = Array.isArray(rawItems) ? rawItems : (rawItems.results || rawItems.vehicle_preferences || rawItems.vehicle_preference || []);
        setVehiclePreferences(items);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async () => {
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `${baseUrl}/types/vehicle-types/${editingId}` : `${baseUrl}/types/vehicle-types`;
      
      let imageData = formData.image;
      if (formData.image instanceof File) {
         imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(formData.image);
         });
      }

      const payload = {
        name: formData.name,
        short_description: formData.short_description,
        description: formData.description,
        transport_type: formData.transport_type,
        dispatch_type: formData.dispatch_type,
        icon_types: formData.icon_types,
        status: formData.status ? 1 : 0,
        image: imageData,
        supported_other_vehicle_types: formData.supported_other_vehicle_types,
        vehicle_preference: formData.vehicle_preference
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setView('list');
        setEditingId(null);
        fetchInitialData();
        setFormData({ name: '', short_description: '', description: '', transport_type: '', dispatch_type: '', icon_types: 'car', image: null, status: true, supported_other_vehicle_types: [], vehicle_preference: [] });
      } else {
        alert(result.message || "Failed to save vehicle type");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle type?")) return;
    try {
      const res = await fetch(`${baseUrl}/types/vehicle-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchVehicles();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      name: vehicle.name,
      short_description: vehicle.short_description || '',
      description: vehicle.description || '',
      transport_type: vehicle.transport_type,
      dispatch_type: vehicle.dispatch_type || '',
      icon_types: vehicle.icon_types || 'car',
      image: vehicle.image,
      status: vehicle.status !== false && vehicle.status !== 0,
      supported_other_vehicle_types: vehicle.supported_other_vehicle_types || [],
      vehicle_preference: vehicle.vehicle_preference || []
    });
    setView('create');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-900 pb-20">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[17px] font-black text-[#2D3A6E] uppercase tracking-tight italic mb-1">
              {view === 'list' ? 'VEHICLE TYPE' : 'CREATE'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
               <span>Vehicle Type</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-gray-900 font-black">{view === 'list' ? 'Vehicle Type' : 'Create'}</span>
            </div>
          </div>
          {view === 'list' ? (
             <button 
                onClick={() => { setEditingId(null); setView('create'); }}
                className="bg-[#2D3A6E] text-white h-12 px-6 rounded-xl flex items-center gap-2 text-[13px] font-black uppercase tracking-tight hover:bg-[#1a234a] transition-all shadow-lg active:scale-95"
             >
                <Plus size={18} strokeWidth={3} /> Add Vehicle Type
             </button>
          ) : (
            <button 
               onClick={() => setView('list')}
               className="bg-white text-[#2D3A6E] h-12 px-6 rounded-xl flex items-center gap-2 text-[13px] font-black uppercase tracking-tight border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            >
               <ArrowLeft size={18} strokeWidth={3} /> Back To List
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50 uppercase tracking-[0.1em] text-[11px] font-black text-gray-400">
                           <th className="px-10 py-7 italic">Vehicle</th>
                           <th className="px-10 py-7 italic">Dispatch Type</th>
                           <th className="px-10 py-7 italic">Transport Type</th>
                           <th className="px-10 py-7 italic text-center">Image</th>
                           <th className="px-10 py-7 italic text-center">Status</th>
                           <th className="px-10 py-7 italic text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {loading ? (
                           <tr><td colSpan="6" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Loading...</td></tr>
                        ) : vehicles.length === 0 ? (
                           <tr><td colSpan="6" className="py-20 text-center text-gray-400">No vehicles found</td></tr>
                        ) : vehicles.map(v => (
                           <tr key={v._id} className="hover:bg-indigo-50/10 transition-all">
                              <td className="px-10 py-7 font-black text-slate-800 uppercase italic text-[14px]">{v.name}</td>
                              <td className="px-10 py-7 text-gray-400 font-bold uppercase text-[12px]">{v.dispatch_type}</td>
                              <td className="px-10 py-7 text-indigo-500 font-black uppercase text-[11px] tracking-widest">{v.transport_type}</td>
                              <td className="px-10 py-7">
                                 <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-2 mx-auto">
                                    <img src={v.image} className="w-full h-full object-contain" />
                                 </div>
                              </td>
                              <td className="px-10 py-7 text-center">
                                 <StatusToggle active={v.status !== 0 && v.status !== false} onToggle={() => {}} />
                              </td>
                              <td className="px-10 py-7 text-right space-x-2">
                                 <button onClick={() => handleEdit(v)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-95"><Edit2 size={16} /></button>
                                 <button onClick={() => handleDelete(v._id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-95"><Trash2 size={16} /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 space-y-12">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* Transport Type */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Transport Type <span className="text-rose-500">*</span>
                     </label>
                     <div className="relative group">
                        <select 
                           value={formData.transport_type}
                           onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                           className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner appearance-none"
                        >
                           <option value="">Choose Transport Type</option>
                           <option value="taxi">Taxi / Cab</option>
                           <option value="delivery">Delivery / Goods</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                     </div>
                  </div>

                  {/* Icon Type */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Icon Type <span className="text-rose-500">*</span>
                     </label>
                     <div className="relative group">
                        <select 
                           value={formData.icon_types}
                           onChange={(e) => setFormData({...formData, icon_types: e.target.value})}
                           className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner appearance-none"
                        >
                           <option value="car">Car</option>
                           <option value="bike">Bike</option>
                           <option value="auto">Auto Rikshaw</option>
                           <option value="truck">Truck</option>
                           <option value="ehcb">E-Rickshaw</option>
                           <option value="HCV">HCV</option>
                           <option value="LCV">LCV</option>
                           <option value="MCV">MCV</option>
                           <option value="Luxary">Luxury</option>
                           <option value="premium">Premium</option>
                           <option value="suv">SUV</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                     </div>
                  </div>

                  {/* Vehicle Image Upload */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Vehicle Image (512px x 512px) <span className="text-rose-500">*</span>
                     </label>
                     <div className="relative group w-full">
                        <div className="w-full h-72 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[32px] flex flex-col items-center justify-center transition-all group-hover:border-[#2D3A6E]/20 group-hover:bg-white overflow-hidden relative">
                           {formData.image ? (
                              <div className="relative w-full h-full p-6">
                                 <img src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image} alt="Preview" className="w-full h-full object-contain" />
                                 <button onClick={() => setFormData({...formData, image: null})} className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-full shadow-sm hover:bg-rose-500 hover:text-white transition-all"><Plus className="rotate-45" size={16} /></button>
                              </div>
                           ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 space-y-4">
                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
                                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                                    <Upload size={28} />
                                 </div>
                                 <div className="text-center">
                                    <p className="text-[14px] font-black text-gray-950 uppercase tracking-tight italic">Upload Image</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PNG, JPG or WebP</p>
                                 </div>
                              </label>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Map Preview with Icon */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic opacity-0">Map Preview</label>
                     <div className="w-full h-72 rounded-[32px] overflow-hidden border border-gray-100 shadow-sm relative group bg-gray-50 flex items-center justify-center">
                        <img src={MapBackground} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 p-4 bg-white/40 backdrop-blur-md rounded-full shadow-2xl ring-8 ring-white/10 animate-pulse">
                           <img src={iconMap[formData.icon_types] || car} className="w-12 h-12 object-contain filter drop-shadow-lg" />
                        </div>
                     </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Name <span className="text-rose-500">*</span>
                     </label>
                     <input 
                        type="text" 
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                     />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-4">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Short Description <span className="text-rose-500">*</span>
                     </label>
                     <input 
                        type="text" 
                        placeholder="Enter Short Description"
                        value={formData.short_description}
                        onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                        className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                     />
                  </div>

                  {/* Description */}
                  <div className="space-y-4 md:col-span-1">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Description <span className="text-rose-500">*</span>
                     </label>
                     <textarea 
                        rows="4"
                        placeholder="Enter Description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-6 bg-gray-50/50 border border-transparent rounded-[32px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner resize-none h-[140px]"
                     ></textarea>
                  </div>

                  <div className="space-y-10">
                     {/* Trip Dispatch Type */}
                     <div className="space-y-4">
                        <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                           Trip Dispatch Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                           <select 
                              value={formData.dispatch_type}
                              onChange={(e) => setFormData({...formData, dispatch_type: e.target.value})}
                              className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner appearance-none"
                           >
                              <option value="">Choose Trip Dispatch Type</option>
                              <option value="normal">Normal Dispatch</option>
                              <option value="bidding">Bidding System</option>
                              <option value="both">Both (Classic & Bid)</option>
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                        </div>
                     </div>
                  </div>

                  {/* Supported Other Vehicle Types */}
                  <div className="space-y-4 md:col-span-2">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Supported Other Vehilce Types
                     </label>
                     <div className="relative group">
                        <select 
                           value={formData.supported_other_vehicle_types}
                           onChange={(e) => setFormData({...formData, supported_other_vehicle_types: Array.from(e.target.selectedOptions, option => option.value)})}
                           className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner appearance-none"
                        >
                           <option value="">Select Vehicle Type</option>
                           {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                     </div>
                  </div>

                  {/* Vehicle Preference */}
                  <div className="space-y-4 md:col-span-2">
                     <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        Vehicle Preference
                     </label>
                     <div className="flex flex-wrap gap-3 p-6 bg-gray-50/50 rounded-[32px] border border-transparent shadow-inner">
                        {vehiclePreferences.length > 0 ? (
                           vehiclePreferences.map(pref => (
                              <button
                                 key={pref._id || pref.id}
                                 type="button"
                                 onClick={() => {
                                    const current = formData.vehicle_preference || [];
                                    const id = pref._id || pref.id;
                                    if (current.includes(id)) {
                                       setFormData({...formData, vehicle_preference: current.filter(x => x !== id)});
                                    } else {
                                       setFormData({...formData, vehicle_preference: [...current, id]});
                                    }
                                 }}
                                 className={`px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                    (formData.vehicle_preference || []).includes(pref._id || pref.id)
                                       ? 'bg-[#2D3A6E] text-white shadow-lg'
                                       : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                 }`}
                              >
                                 {pref.name}
                              </button>
                           ))
                        ) : (
                           <p className="text-[11px] font-bold text-gray-400 italic">No preferences available for selection</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* BUTTONS */}
               <div className="flex justify-end pt-12 border-t border-gray-50">
                  <button 
                     onClick={handleSave}
                     className="bg-[#2D3A6E] text-white h-16 px-20 rounded-[24px] text-[13px] font-black uppercase tracking-[0.3em] hover:bg-[#1a234a] transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                  >
                     Save <ChevronRight size={18} strokeWidth={3} className="ml-2" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VehicleType;
