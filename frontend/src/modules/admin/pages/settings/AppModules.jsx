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
  Check
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

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
      setPagination(res.data?.paginator || { current_page: 1, last_page: 1, total: 0 });
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
          const item = res.data?.results?.find(m => m._id === id);
          if (item) {
            setFormData({
              name: item.name,
              transport_type: item.transport_type,
              service_type: item.service_type,
              order_by: item.order_by || 1,
              short_description: item.short_description || '',
              description: item.description || '',
              active: item.active,
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
      
      navigate('/admin/settings/app/modules');
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

  if (isCreate || isEdit) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header matching Screenshot 2 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">{isCreate ? 'Create' : 'Edit'}</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            <span>App Modules</span>
            <ChevronRight size={10} />
            <span className="text-gray-900">{isCreate ? 'Create' : 'Edit'}</span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Name *</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
              </div>

              {/* Module Service */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Module Service *</label>
                <select 
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none"
                >
                  <option value="normal">Normal</option>
                  <option value="outstation">Outstation</option>
                  <option value="rental">Rental</option>
                  <option value="bid">Bid</option>
                </select>
              </div>

              {/* Transport Type */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Transport Type *</label>
                <select 
                  name="transport_type"
                  value={formData.transport_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none"
                >
                  <option value="taxi">Taxi</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* Icon Type (Placeholder for parity) */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Icon Type</label>
                <select className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none">
                  <option value="image">Image</option>
                  <option value="lucide">Lucide Icon</option>
                </select>
              </div>

              {/* Order Number */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Order Number *</label>
                <input 
                  type="number"
                  name="order_by"
                  value={formData.order_by}
                  onChange={handleInputChange}
                  placeholder="Enter Order Number"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Short Description *</label>
                <input 
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Enter Short Description"
                  className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Description *</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter Description"
                  rows={4}
                  className="w-full bg-gray-50 border border-transparent rounded-[32px] px-8 py-6 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
                />
              </div>

              {/* Thumbnail / Image Upload */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Thumbnail (512px x 512px) *</label>
                <div className="flex flex-col items-center justify-center border-4 border-dashed border-gray-50 rounded-[40px] p-12 transition-all hover:bg-gray-50/50 hover:border-indigo-500/20 group cursor-pointer relative bg-white h-64">
                    {formData.mobile_menu_icon ? (
                      <div className="flex flex-col items-center gap-4">
                        <img src={formData.mobile_menu_icon} className="w-24 h-24 object-contain rounded-2xl" alt="" />
                        <button type="button" onClick={() => setFormData({...formData, mobile_menu_icon: ''})} className="text-[10px] font-black text-red-500 uppercase">Remove</button>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 mb-6 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                           <Upload size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Upload Image</p>
                      </>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files[0];
                      if(file) {
                        toast.success('Image selected');
                        // Simulation of setting a URL
                        setFormData({...formData, mobile_menu_icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png'});
                      }
                    }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (isEdit ? 'Update Module' : 'Create Module')}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/admin/settings/app/modules')}
                className="px-12 py-4 bg-gray-100 text-gray-400 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-200 hover:text-gray-900 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header matching Screenshot 1 */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">App Modules</h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
          <span>App Modules</span>
          <ChevronRight size={10} />
          <span className="text-gray-900">App Modules</span>
        </div>
      </div>

      {/* Control Bar matching Screenshot 1 */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-medium text-gray-400">show</span>
            <div className="relative">
               <select className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 pr-10 text-[13px] font-black text-gray-900 outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <span className="text-[13px] font-medium text-gray-400">entries</span>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
             <div className="h-12 w-12 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all cursor-pointer shadow-sm">
                <Search size={18} />
             </div>
             <button className="flex items-center gap-2 bg-[#F36B4F] text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/10 hover:opacity-90 transition-all">
                <Filter size={16} /> Filters
             </button>
             <button 
                onClick={() => navigate('/admin/settings/app/modules/create')}
                className="flex items-center gap-2 bg-[#1A237E] text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all"
             >
                <Plus size={16} /> Add App Modules
             </button>
          </div>
        </div>
      </div>

      {/* Table Section matching Screenshot 1 */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100">
                <th className="px-10 py-6">Name</th>
                <th className="px-10 py-6">Module Service</th>
                <th className="px-10 py-6">Transport Type</th>
                <th className="px-10 py-6 text-center">Thumbnail</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="6" className="px-10 py-8"><div className="h-8 bg-gray-50 rounded-full"></div></td></tr>
                ))
              ) : modules.length === 0 ? (
                <tr><td colSpan="6" className="px-10 py-24 text-center text-gray-400 text-sm font-bold uppercase italic tracking-widest">System Modules Initializing...</td></tr>
              ) : (
                modules.map((m) => (
                  <tr key={m._id} className="group hover:bg-gray-50/30 transition-all duration-300">
                    <td className="px-10 py-7">
                      <span className="text-sm font-bold text-gray-900 tracking-tight">{m.name}</span>
                    </td>
                    <td className="px-10 py-7 font-medium text-gray-500 capitalize">{m.service_type}</td>
                    <td className="px-10 py-7 font-medium text-gray-500 capitalize">{m.transport_type}</td>
                    <td className="px-10 py-7">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 p-2 flex items-center justify-center transition-all group-hover:scale-110">
                          {m.mobile_menu_icon ? (
                            <img src={m.mobile_menu_icon} className="w-full h-full object-contain" alt="" />
                          ) : (
                            <LayoutGrid size={20} className="text-gray-200" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                       <div className="flex justify-center">
                          <label className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input 
                              type="checkbox" 
                              checked={m.active} 
                              onChange={() => {
                                adminService.updateAppModule(m._id, { active: !m.active })
                                  .then(() => {
                                    toast.success('Status updated');
                                    fetchModules(pagination.current_page);
                                  })
                                  .catch(() => toast.error('Update failed'));
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1DE9B6] shadow-inner"></div>
                          </label>
                       </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center justify-center gap-3">
                         <button 
                            onClick={() => navigate(`/admin/settings/app/modules/edit/${m._id}`)}
                            className="p-2.5 bg-[#FFF4E5] text-[#FFB74D] rounded-lg border border-[#FFE0B2] hover:bg-[#FFB74D] hover:text-white transition-all shadow-sm active:scale-90"
                         >
                            <Edit size={16} />
                         </button>
                         <button 
                            onClick={() => handleDelete(m._id)}
                            className="p-2.5 bg-[#FFE5E5] text-[#FF5252] rounded-lg border border-[#FFCDD2] hover:bg-[#FF5252] hover:text-white transition-all shadow-sm active:scale-90"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export default AppModules;
