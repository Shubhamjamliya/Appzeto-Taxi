import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight,
  Loader2,
  X,
  Upload,
  Car,
  Package,
  ArrowLeft,
  LayoutGrid,
  Filter,
  Check,
  Globe,
  Settings2,
  Layers,
  FileText,
  Clock,
  Zap,
  Tag,
  AlignLeft,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useImageUpload } from '../../../../shared/hooks/useImageUpload';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

const StatusToggle = ({ active, onToggle }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-emerald-400' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm ${active ? 'left-6.5' : 'left-0.5'}`} />
  </button>
);

const AppModules = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const isCreate = mode === 'create' || location.pathname.endsWith('/create');
  const isEdit = mode === 'edit' || location.pathname.includes('/edit/');
  const isList = !isCreate && !isEdit;

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    transport_type: 'taxi',
    service_type: 'normal',
    icon_type: 'default',
    order_by: 1,
    short_description: '',
    description: '',
    active: true,
    mobile_menu_icon: ''
  });

  const fetchModules = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getAppModules({ page });
      setModules(res.data?.results || []);
      setPagination(res.data?.paginator || { current_page: 1, last_page: 1, total: modules.length });
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load application modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isList) {
      fetchModules();
    } else if (isEdit && id) {
      const fetchItem = async () => {
        try {
          const res = await adminService.getAppModules({});
          const item = res.data?.results?.find(m => String(m._id || m.id) === String(id));
          if (item) {
            setFormData({
              name: item.name || '',
              transport_type: item.transport_type || 'taxi',
              service_type: item.service_type || 'normal',
              icon_type: item.icon_type || 'default',
              order_by: item.order_by || 1,
              short_description: item.short_description || '',
              description: item.description || '',
              active: item.active !== false,
              mobile_menu_icon: item.mobile_menu_icon || ''
            });
          }
        } catch (err) {
          toast.error('Failed to fetch module details');
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    } else {
      setLoading(false);
    }
  }, [isList, isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const { 
    uploading: imageUploading, 
    preview: imagePreview, 
    handleFileChange: onImageFileChange,
    setPreview: setImagePreview
  } = useImageUpload({
    folder: 'app-modules',
    onSuccess: (url) => setFormData(prev => ({ ...prev, mobile_menu_icon: url }))
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        order_by: Number(formData.order_by),
      };

      if (isEdit) {
        await adminService.updateAppModule(id, payload);
        toast.success('Module updated successfully');
      } else {
        await adminService.createAppModule(payload);
        toast.success('Module integrated successfully');
      }
      
      navigate('/admin/pricing/app-modules');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to save module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mid) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await adminService.deleteAppModule(mid);
      toast.success('Module deleted');
      fetchModules(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete module');
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5";
  const sectionCardClass = "bg-white rounded-xl border border-gray-200 p-6 shadow-sm";

  if (isCreate || isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{isCreate ? 'CREATE' : 'EDIT'}</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            <span>App Modules</span>
            <ChevronRight size={10} />
            <span className="text-gray-900">{isCreate ? 'Create' : 'Edit'}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={sectionCardClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Name *</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter Name"
                    className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Module Service *</label>
                  <div className="relative">
                    <select 
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm appearance-none cursor-pointer outline-none focus:border-indigo-500"
                    >
                      <option value="">Choose Module Service</option>
                      <option value="normal">Normal</option>
                      <option value="outstation">Outstation</option>
                      <option value="rental">Rental</option>
                      <option value="bid">Bid</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Transport Type *</label>
                  <div className="relative">
                    <select 
                      name="transport_type"
                      value={formData.transport_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm appearance-none cursor-pointer outline-none focus:border-indigo-500"
                    >
                      <option value="">Choose Transport Type</option>
                      <option value="taxi">Taxi</option>
                      <option value="delivery">Delivery</option>
                      <option value="both">Both</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-gray-700">Icon Type</label>
                  <div className="relative">
                    <select 
                      name="icon_type"
                      value={formData.icon_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm appearance-none cursor-pointer outline-none focus:border-indigo-500"
                    >
                      <option value="">Choose Icon Type</option>
                      <option value="default">Default</option>
                      <option value="custom">Custom</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Order Number *</label>
                  <input 
                    type="number"
                    name="order_by"
                    value={formData.order_by}
                    onChange={handleInputChange}
                    placeholder="Enter Order Number"
                    className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Short Description *</label>
                  <input 
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    placeholder="Enter Short Description"
                    className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[14px] font-bold text-rose-400">Description *</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter Description"
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-5 py-3.5 text-sm outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="md:col-span-1 space-y-2">
                   <label className="text-[14px] font-bold text-gray-700">Thumbnail <span className="text-gray-400 font-medium">(512px x 512px)</span>*</label>
                   <div 
                    onClick={() => document.getElementById('thumbnail_input').click()}
                    className="w-52 h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-all cursor-pointer group"
                   >
                     { (formData.mobile_menu_icon || imagePreview) ? (
                        <div className="relative">
                           <img src={imagePreview || formData.mobile_menu_icon} className="w-40 h-40 object-contain p-2" alt="" />
                           {imageUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}
                        </div>
                     ) : (
                       <>
                         <p className="text-[12px] font-bold text-gray-500 mb-2">Upload Image</p>
                         <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-gray-100">
                            <ImageIcon size={24} />
                         </div>
                       </>
                     )}
                     <input id="thumbnail_input" type="file" accept="image/*" className="hidden" onChange={onImageFileChange} />
                   </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-3">
                 <button 
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-3 bg-[#1A237E] text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                 >
                   {submitting ? 'Saving...' : 'Save'}
                 </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">App Modules</h1>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 capitalize whitespace-nowrap">
           <span className="hover:text-indigo-600 cursor-pointer">App Modules</span>
           <ChevronRight size={14} className="text-gray-300" />
           <span className="text-gray-500">List</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-400">show</span>
             <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 outline-none focus:border-indigo-500">
                   <option>10</option>
                   <option>25</option>
                   <option>50</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>
             <span className="text-sm font-medium text-gray-400">entries</span>
          </div>

          <div className="flex items-center gap-3">
             <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all">
                <Search size={18} />
             </button>
             <button className="flex items-center gap-2 bg-[#F36B4F] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-orange-900/10 hover:opacity-90 transition-all">
                <Filter size={16} /> Filters
             </button>
             <button 
                onClick={() => navigate('/admin/pricing/app-modules/create')}
                className="flex items-center gap-2 bg-[#1A237E] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all"
             >
                <Plus size={16} /> Add App Modules
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-[13px] font-bold text-gray-900 border-b border-gray-100">
                <th className="px-6 py-5 text-left">Name</th>
                <th className="px-6 py-5 text-left">Module Service</th>
                <th className="px-6 py-5 text-left">Transport Type</th>
                <th className="px-6 py-5 text-center">Thumbnail</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-full w-full"></div></td></tr>
                ))
              ) : modules.length > 0 ? (
                modules.map((m) => (
                  <tr key={m._id || m.id} className="hover:bg-gray-50/50 transition-all duration-300">
                    <td className="px-6 py-6 ring-inset">
                       <span className="text-[14px] font-medium text-gray-700">{m.name}</span>
                    </td>
                    <td className="px-6 py-6 font-medium text-gray-500 capitalize">{m.service_type || 'Normal'}</td>
                    <td className="px-6 py-6 font-medium text-gray-500 capitalize">{m.transport_type || 'Taxi'}</td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex justify-center">
                          <img 
                            src={m.mobile_menu_icon || 'https://via.placeholder.com/40'} 
                            className="w-10 h-10 object-contain rounded-lg shadow-sm" 
                            alt="" 
                          />
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex justify-center">
                          <StatusToggle 
                            active={m.active} 
                            onToggle={() => {
                              adminService.updateAppModule(m._id || m.id, { active: !m.active })
                                .then(() => {
                                  toast.success('Status toggled');
                                  fetchModules();
                                });
                            }} 
                          />
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => navigate(`/admin/pricing/app-modules/edit/${m._id || m.id}`)}
                            className="p-2.5 bg-[#FFF4E4] text-[#F9A825] rounded-lg hover:bg-[#F9A825] hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(m._id || m.id)}
                            className="p-2.5 bg-[#FFE4E4] text-[#FF5252] rounded-lg hover:bg-[#FF5252] hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="px-6 py-20 text-center">
                      <LayoutGrid size={48} className="mx-auto text-gray-100 mb-4" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Registry Empty</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-sm font-medium text-gray-400">
             Showing 1 to {modules.length} of {pagination.total || modules.length} entries
           </p>
           <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all cursor-default" disabled>Prev</button>
              <button className="w-10 h-10 bg-[#1A237E] text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/20">1</button>
              <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all cursor-default" disabled>Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AppModules;
