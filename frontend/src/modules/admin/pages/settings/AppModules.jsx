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
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { BACKEND_ORIGIN } from '../../../../shared/api/runtimeConfig';

const BASE_ASSET_URL = BACKEND_ORIGIN;

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setIconPreview(null);
  };

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
        active: formData.active,
      };

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
    if (icon.startsWith('http') || icon.startsWith('data:')) return icon;
    return `${BASE_ASSET_URL}${icon}`;
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans">
      
      {/* Header Block */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Settings</span>
          <ChevronRight size={12} />
          <span>App Configuration</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Service Modules</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Application Modules</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} /> New Module
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by module name..." 
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 rounded-md border border-gray-100">
                Total: {pagination.total} Modules
             </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Module Identifier</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center text-indigo-600">Service Path</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Availability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                   </tr>
                 ))
              ) : modules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400 text-sm italic">No active modules found in the system.</td>
                </tr>
              ) : (
                modules.map((m) => (
                  <tr key={m._id} className="group hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 group-hover:bg-white transition-colors">
                           {m.mobile_menu_icon ? (
                             <img src={getFullImageUrl(m.mobile_menu_icon)} className="w-full h-full object-contain" alt="" />
                           ) : <LayoutGrid size={20} className="text-gray-300" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{m.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium max-w-[200px] truncate">{m.short_description || 'No description provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-[11px] font-black text-gray-500">
                        {m.order_by}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {m.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col items-center gap-1">
                         {m.transport_type === 'taxi' ? (
                           <Car size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                         ) : (
                           <Package size={16} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                         )}
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">{m.transport_type}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {m.active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                           <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
                           Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(m)} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m._id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <Edit size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{editId ? 'Update Module' : 'Add New Module'}</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Configure service accessibility and appearance</p>
                  </div>
               </div>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-7 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Visible System Name *</label>
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className={inputClass} 
                    placeholder="e.g. Premium Cabs" 
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Transport Domain</label>
                  <select name="transport_type" value={formData.transport_type} onChange={handleInputChange} className={inputClass}>
                    <option value="taxi">Rideshare / Taxi</option>
                    <option value="delivery">Logistics / Delivery</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Service Logic Path</label>
                  <select name="service_type" value={formData.service_type} onChange={handleInputChange} className={inputClass}>
                    <option value="normal">Normal Booking</option>
                    <option value="rental">Hourly Rental</option>
                    <option value="outstation">Outstation Trip</option>
                    <option value="bid">Bidding System</option>
                  </select>
                </div>

                <div>
                   <label className={labelClass}>Display Order</label>
                   <input 
                     type="number" 
                     name="order_by" 
                     value={formData.order_by} 
                     onChange={handleInputChange} 
                     className={inputClass} 
                   />
                </div>

                <div>
                   <label className={labelClass}>Status</label>
                   <div className="flex items-center h-10 px-4 bg-gray-50 border border-gray-100 rounded-lg">
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                         <input 
                          type="checkbox" 
                          name="active" 
                          checked={formData.active} 
                          onChange={handleInputChange} 
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                         />
                         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Enabled on App</span>
                      </label>
                   </div>
                </div>

                <div className="md:col-span-2">
                   <label className={labelClass}>Menu Icon Asset</label>
                   <div className="flex items-center gap-6 p-5 border border-dashed border-gray-200 rounded-xl bg-gray-50/20 group hover:border-indigo-300 transition-colors">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-4">
                        {iconPreview ? <img src={iconPreview} className="w-full h-full object-contain" alt="" /> : <LayoutGrid size={24} className="text-gray-200" />}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer bg-white border border-gray-200 text-[11px] font-bold text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-all inline-block mb-2">
                           Select Image Icon
                           <input type="file" className="hidden" />
                        </label>
                        <p className="text-[10px] text-gray-400 font-medium">Recommended SVG or PNG (256x256)</p>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Service Tagline / Description</label>
                  <textarea 
                    name="short_description" 
                    value={formData.short_description} 
                    onChange={handleInputChange} 
                    className={`${inputClass} h-20 resize-none py-3`}
                    placeholder="Explain what this module offers..." 
                  />
                </div>
              </div>
            </form>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
               <button 
                  onClick={handleCloseModal} 
                  className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
               >Discard Settings</button>
               <button 
                  onClick={handleSubmit}
                  disabled={submitting} 
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
               >
                  {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editId ? 'Update Configuration' : 'Integrate Module')}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppModules;
