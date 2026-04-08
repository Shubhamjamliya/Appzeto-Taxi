import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight,
  Loader2,
  Smartphone,
  X,
  Upload,
  Car,
  Package,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const BASE_ASSET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const AppModules = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    transport_type: 'taxi',
    service_type: 'normal',
    order_by: 0,
    short_description: '',
    description: '',
    active: true
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

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
    fetchModules();
  }, []);

  const handleOpenModal = (module = null) => {
    if (module) {
      setEditId(module._id);
      setFormData({
        name: module.name,
        transport_type: module.transport_type,
        service_type: module.service_type,
        order_by: module.order_by || 0,
        short_description: module.short_description || '',
        description: module.description || '',
        active: module.active
      });
      const iconUrl = module.mobile_menu_icon?.startsWith('http') 
        ? module.mobile_menu_icon 
        : (module.mobile_menu_icon ? `${BASE_ASSET_URL}${module.mobile_menu_icon}` : null);
      setIconPreview(module.thumbnail || iconUrl);
    } else {
      setEditId(null);
      setFormData({
        name: '',
        transport_type: 'taxi',
        service_type: 'normal',
        order_by: 0,
        short_description: '',
        description: '',
        active: true
      });
      setIconPreview(null);
    }
    setIconFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setIconFile(null);
    setIconPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('transport_type', formData.transport_type);
      payload.append('service_type', formData.service_type);
      payload.append('order_by', formData.order_by);
      payload.append('short_description', formData.short_description);
      payload.append('description', formData.description);
      payload.append('active', formData.active ? '1' : '0');
      
      if (iconFile) {
        payload.append('mobile_menu_icon', iconFile);
      }

      if (editId) {
        await adminService.updateAppModule(editId, payload);
        toast.success('Module updated successfully');
      } else {
        await adminService.createAppModule(payload);
        toast.success('Module created successfully');
      }
      
      handleCloseModal();
      fetchModules(pagination.current_page);
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to save module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await adminService.deleteAppModule(id);
      toast.success('Module deleted');
      fetchModules(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete module');
    }
  };

  const getFullImageUrl = (icon) => {
    if (!icon) return null;
    if (icon.startsWith('http')) return icon;
    return `${BASE_ASSET_URL}${icon}`;
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      
      {/* Header Block */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>App Settings</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">App Modules</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Application Modules</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Module
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter modules..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="text-xs font-medium text-gray-500">
            Total count: <span className="text-gray-900 font-semibold">{pagination.total}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Order</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Service Logic</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Transport</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-r border-gray-100">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                   </tr>
                 ))
              ) : modules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">No modules found.</td>
                </tr>
              ) : (
                modules.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center p-1.5">
                           {m.mobile_menu_icon ? (
                             <img src={getFullImageUrl(m.mobile_menu_icon)} className="w-full h-full object-contain" alt="" />
                           ) : <Layers size={18} className="text-gray-300" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{m.short_description || m.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-600">#{m.order_by}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                        {m.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center gap-0.5">
                         {m.transport_type === 'taxi' ? <Car size={14} className="text-indigo-500" /> : <Package size={14} className="text-orange-500" />}
                         <span className="text-[10px] font-medium text-gray-400">{m.transport_type}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-100">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {m.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(m)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {pagination.current_page} of {pagination.last_page}</p>
            <div className="flex items-center gap-1.5">
               <button 
                disabled={pagination.current_page === 1}
                onClick={() => fetchModules(pagination.current_page - 1)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
               >Prev</button>
               <button 
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchModules(pagination.current_page + 1)}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
               >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">{editId ? 'Edit App Module' : 'New App Module'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1">
                  <label className={labelClass}><Smartphone size={12} className="inline mr-1 text-gray-400" /> Module Name *</label>
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className={inputClass} 
                    placeholder="e.g. Taxi Service" 
                  />
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Order Priority</label>
                  <input 
                    type="number" 
                    name="order_by" 
                    value={formData.order_by} 
                    onChange={handleInputChange} 
                    className={inputClass} 
                  />
                </div>
                
                <div className="col-span-1">
                  <label className={labelClass}>Transport Type</label>
                  <select name="transport_type" value={formData.transport_type} onChange={handleInputChange} className={inputClass}>
                    <option value="taxi">Rideshare / Taxi</option>
                    <option value="delivery">Logistics / Delivery</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className={labelClass}>Service Type</label>
                  <select name="service_type" value={formData.service_type} onChange={handleInputChange} className={inputClass}>
                    <option value="normal">Static / Instant</option>
                    <option value="rental">Rental / Package</option>
                    <option value="outstation">Outstation / Multi-city</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>Short Tagline</label>
                  <input 
                    name="short_description" 
                    value={formData.short_description} 
                    onChange={handleInputChange} 
                    className={inputClass} 
                    placeholder="Brief highlight in 5-6 words" 
                  />
                </div>

                <div className="col-span-2">
                   <label className={labelClass}><Upload size={12} className="inline mr-1 text-gray-400" /> Module Icon</label>
                   <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        {iconPreview ? <img src={iconPreview} className="w-full h-full object-contain" alt="" /> : <Layers size={20} className="text-gray-200" />}
                      </div>
                      <div className="flex-1">
                        <input type="file" onChange={handleFileChange} className="text-xs text-gray-500 mb-1" />
                        <p className="text-[10px] text-gray-400">SVG or transparent PNG recommended.</p>
                      </div>
                   </div>
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-2">
                   <input 
                    type="checkbox" 
                    id="active" 
                    name="active" 
                    checked={formData.active} 
                    onChange={handleInputChange} 
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                   />
                   <label htmlFor="active" className="text-sm font-medium text-gray-700">Module is currently active</label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >Discard</button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex-[2] py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editId ? 'Update Module' : 'Create Module')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppModules;
