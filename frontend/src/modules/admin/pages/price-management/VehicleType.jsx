import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Car, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Filter,
  Upload,
  ChevronDown,
  Info,
  Layers,
  Save,
  Activity,
  Table as TableIcon,
  Loader2,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Assets
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
  motor_bike: BikeIcon,
  ehcb: EhcvIcon,
  HCV: HcvIcon,
  LCV: LcvIcon,
  MCV: McvIcon,
  Luxary: LuxuryIcon,
  premium: PremiumIcon,
  suv: SuvIcon
};

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${active ? 'bg-[#26C2A3]' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const VehicleType = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const isCreate = propMode === 'create' || (location?.pathname || '').endsWith('/create');
  const isEdit = propMode === 'edit' || (location?.pathname || '').includes('/edit/');
  const isList = !isCreate && !isEdit;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    transport_type: 'taxi',
    trip_dispatch_type: 'normal',
    icon_types_for: 'car',
    is_taxi: 'taxi',
    is_accept_share_ride: 0,
    active: 1,
    image: null,
    icon: '',
    capacity: 4,
    size: '',
    supported_vehicles: []
  });

  const baseUrl = (typeof window !== 'undefined' && window.__LEGACY_BACKEND_ORIGIN__) || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/types/vehicle-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        // Handle priority of 'results' then 'paginator.data' as per user JSON
        const rawResults = data.results || data.data?.results || data.paginator?.data || data.data?.vehicle_types || (Array.isArray(data.data) ? data.data : []);
        setVehicles(Array.isArray(rawResults) ? rawResults : []);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchVehicles();
      
      if (isEdit && id) {
        try {
          const res = await fetch(`${baseUrl}/api/v1/admin/types/vehicle-types/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data && data.success && data.data) {
            const v = data.data;
            setFormData({
              name: v.name || '',
              short_description: v.short_description || '',
              description: v.description || '',
              transport_type: v.transport_type || 'taxi',
              trip_dispatch_type: v.trip_dispatch_type || 'normal',
              capacity: v.capacity || 4,
              size: v.size || '',
              icon_types_for: v.icon_types_for || 'car',
              is_taxi: v.is_taxi || 'taxi',
              is_accept_share_ride: v.is_accept_share_ride || 0,
              active: v.active === 1 || v.active === true ? 1 : 0,
              icon: v.icon || '',
              supported_vehicles: typeof v.supported_vehicles === 'string' 
                ? v.supported_vehicles.split(',').filter(Boolean) 
                : (Array.isArray(v.supported_vehicles) ? v.supported_vehicles : []),
              image: null
            });
          }
        } catch (error) {
          console.error("Error fetching vehicle details:", error);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.name) return toast.error("Vehicle Type Name is required");
    setIsSaving(true);
    try {
      const url = id 
        ? `${baseUrl}/api/v1/admin/types/vehicle-types/${id}/update` 
        : `${baseUrl}/api/v1/admin/types/vehicle-types`;
      
      const body = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          body.append('icon', formData[key]);
        } else if (key === 'supported_vehicles') {
          // Convert array back to comma-separated string for DB storage
          body.append('supported_vehicles', formData[key].join(','));
        } else if (key !== 'icon' && key !== 'image') {
          body.append(key, formData[key] === null ? '' : formData[key]);
        }
      });
      if (id) body.append('_method', 'PATCH');

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });

      const result = await res.json();
      if (result.success) {
        toast.success(id ? "Record Updated" : "Record Created");
        navigate('/admin/pricing/vehicle-type');
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network communication error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    const query = (searchTerm || '').toLowerCase();
    return vehicles.filter(v => v && (v.name || '').toLowerCase().includes(query));
  }, [vehicles, searchTerm]);

  if (isList) {
    return (
      <div className="min-h-screen bg-[#F1F3F9] p-4 lg:p-6 font-sans animate-in fade-in duration-500">
        <div className="max-w-[1400px] mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <h1 className="text-sm font-bold text-[#444] uppercase tracking-wide">VEHICLE TYPE</h1>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
              <span className="hover:text-indigo-600 cursor-pointer">Vehicle Type</span>
              <ChevronRight size={10} />
              <span className="text-gray-500">Vehicle Type</span>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
             <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span>show</span>
                  <div className="relative">
                    <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-md bg-white outline-none cursor-pointer">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50 transition-colors"><Search size={16} /></button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#F66C44] text-white rounded-lg text-xs font-bold hover:bg-[#e55b35] transition-colors"><Filter size={14} /> Filters</button>
                  <button onClick={() => navigate('/admin/pricing/vehicle-type/create')} className="flex items-center gap-2 px-4 py-2 bg-[#3B488C] text-white rounded-lg text-xs font-bold hover:bg-[#2D3870] transition-colors"><Plus size={14} /> Add Vehicle</button>
                </div>
             </div>

             <div className="flex-1 overflow-x-auto px-6 pb-20">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[#F9FAFB] border-y border-gray-100">
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Vehicle</th>
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Dispatch Type</th>
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Transport Type</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Image</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Status</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {loading ? (
                      <tr><td colSpan="6" className="py-24 text-center"><Loader2 className="animate-spin inline-block text-indigo-200" size={32} /></td></tr>
                   ) : filteredVehicles.length > 0 ? (
                      filteredVehicles.slice(0, entriesPerPage).map((v, idx) => (
                        <tr key={v.id || v._id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-600">{v.name || '---'}</td>
                          <td className="px-4 py-4 text-gray-500 capitalize">{v.trip_dispatch_type || 'normal'}</td>
                          <td className="px-4 py-4 text-gray-500 capitalize">{v.transport_type || (v.is_taxi === 'taxi' ? 'Taxi' : 'All')}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex w-10 h-10 items-center justify-center p-1 border border-gray-100 rounded-md bg-white">
                              <img src={v.icon || v.image || CarIcon} className="w-full h-full object-contain" alt="" />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center"><StatusToggle active={Number(v.active) === 1} onToggle={() => {}} /></div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button onClick={() => navigate(`/admin/pricing/vehicle-type/edit/${v.id || v._id}`)} className="p-1.5 bg-[#FFF4E4] text-[#F6B344] rounded hover:bg-[#FFE8CC] transition-colors"><Edit2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                   ) : (
                      <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-medium">No records found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>

             <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
                <div className="text-xs text-gray-400 font-medium whitespace-nowrap">Showing 1 to {Math.min(filteredVehicles.length, entriesPerPage)} of {filteredVehicles.length} entries</div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 rounded transition-colors disabled:opacity-30" disabled>Prev</button>
                  <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white bg-[#3B488C] rounded shadow">1</button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 rounded transition-colors disabled:opacity-30" disabled>Next</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F9] p-4 lg:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-sm font-bold text-[#444] uppercase tracking-wide">{isEdit ? 'EDIT' : 'CREATE'}</h1>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
            <span className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate('/admin/pricing/vehicle-type')}>Vehicle Type</span>
            <ChevronRight size={10} />
            <span className="text-gray-500 uppercase">{isEdit ? 'Edit' : 'Create'}</span>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 space-y-10 min-h-[700px] relative pb-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Transport Type <span className="text-rose-500">*</span></label>
                  <select value={formData.transport_type} onChange={(e) => setFormData(p => ({ ...p, transport_type: e.target.value }))} className={inputClass}>
                    <option value="">Choose Transport Type</option>
                    <option value="taxi">Taxi</option>
                    <option value="delivery">Delivery</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Vehicle Image <span className="text-gray-400 text-[10px] font-normal">(512px x 512px)</span> <span className="text-rose-500">*</span></label>
                  <div className="w-full max-w-[400px] aspect-square bg-[#FAFAFA] border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors group">
                    {formData.image || formData.icon ? (
                       <div className="relative w-full h-full flex items-center justify-center p-4">
                          <img src={formData.image instanceof File ? URL.createObjectURL(formData.image) : (formData.image || formData.icon)} className="max-w-full max-h-full object-contain" alt="" />
                          <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><Plus className="text-white" size={32} /><input type="file" className="hidden" onChange={(e) => setFormData(p => ({ ...p, image: e.target.files[0] }))} /></label>
                       </div>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer">
                        <span className="text-sm font-semibold text-gray-700">Upload Image</span>
                        <div className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center"><TableIcon size={18} className="text-gray-400" /></div>
                        <input type="file" className="hidden" onChange={(e) => setFormData(p => ({ ...p, image: e.target.files[0] }))} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Icon Type <span className="text-rose-500">*</span></label>
                  <select value={formData.icon_types_for} onChange={(e) => setFormData(p => ({ ...p, icon_types_for: e.target.value }))} className={inputClass}>
                    <option value="car">Car</option>
                    <option value="motor_bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="truck">Truck</option>
                    {Object.keys(iconMap).filter(k => !['car','motor_bike','auto','truck'].includes(k)).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1).replace('_',' ')}</option>)}
                  </select>
                </div>

                <div className="w-full max-w-[500px] aspect-[4/3] bg-[#E5E9EC] rounded-md relative overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                    <img src={MapBackground} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="" />
                    <img src={iconMap[formData.icon_types_for] || CarIcon} className="w-24 h-24 object-contain drop-shadow-2xl z-20 animate-pulse" alt="" />
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <label className={labelClass}>Name <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter Name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Short Description <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.short_description} onChange={(e) => setFormData(p => ({ ...p, short_description: e.target.value }))} placeholder="Enter Short Description" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description <span className="text-rose-500">*</span></label>
                <textarea rows="4" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Enter Description" className={inputClass + " resize-none"} />
              </div>
              <div className="space-y-6">
                <div>
                   <label className={labelClass}>Trip Dispatch Type <span className="text-rose-500">*</span></label>
                   <select value={formData.trip_dispatch_type} onChange={(e) => setFormData(p => ({ ...p, trip_dispatch_type: e.target.value }))} className={inputClass}>
                      <option value="normal">Normal</option>
                      <option value="bidding">Bidding</option>
                      <option value="both">Both</option>
                   </select>
                </div>
              </div>
           </div>

           <div>
             <label className={labelClass}>Supported Other Vehicle Types</label>
             <div className="relative font-sans shadow-sm">
                <button 
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`${inputClass} flex items-center justify-between bg-white cursor-pointer group hover:border-indigo-400 min-h-[46px]`}
                >
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {formData.supported_vehicles.length > 0 ? (
                      formData.supported_vehicles.map(svId => {
                        const vObj = vehicles.find(v => String(v.id || v._id) === String(svId));
                        return (
                          <span key={svId} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md flex items-center gap-1.5 border border-indigo-100 animate-in zoom-in-95 duration-200">
                             {vObj?.name || 'Unknown'}
                             <span 
                               className="hover:text-rose-500 cursor-pointer p-0.5 rounded-full hover:bg-rose-50 transition-colors"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setFormData(p => ({ ...p, supported_vehicles: p.supported_vehicles.filter(item => item !== svId) }));
                               }}
                             >
                               <Trash2 size={10} strokeWidth={3} />
                             </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">Select supported vehicles...</span>
                    )}
                  </div>
                  <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto overflow-x-hidden py-2"
                      >
                        {vehicles.filter(v => String(v.id || v._id) !== String(id)).length > 0 ? (
                          vehicles.filter(v => String(v.id || v._id) !== String(id)).map(v => {
                            const vId = v.id || v._id;
                            const isSelected = formData.supported_vehicles.includes(vId);
                            return (
                              <div 
                                key={vId}
                                onClick={() => {
                                  setFormData(p => ({
                                    ...p,
                                    supported_vehicles: isSelected 
                                      ? p.supported_vehicles.filter(item => item !== vId)
                                      : [...p.supported_vehicles, vId]
                                  }));
                                }}
                                className={`px-6 py-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50 group border-b border-gray-50 last:border-0 ${isSelected ? 'bg-indigo-50/30' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5">
                                    <img src={v.icon || v.image || CarIcon} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                  </div>
                                  <span className={`text-[13px] font-semibold transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>{v.name}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100' : 'bg-white border-gray-200'}`}>
                                  {isSelected && <div className="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-6 py-8 text-center text-gray-400 text-xs italic">No other vehicle types available to dependency mapping</div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
             </div>
           </div>

           <div className="flex justify-end pr-4">
              <button onClick={handleSave} disabled={isSaving} className="flex items-center bg-[#3B488C] text-white rounded-md overflow-hidden shadow hover:scale-[1.01] transition-all disabled:opacity-50">
                <div className="px-8 py-3 text-xs font-bold uppercase tracking-widest">{isSaving ? 'Saving...' : 'Save'}</div>
                <div className="px-4 py-3 bg-[#F66C44] flex items-center justify-center">
                  <Plus size={18} />
                </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleType;
