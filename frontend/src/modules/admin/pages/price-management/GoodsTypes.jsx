import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Layers,
  ArrowLeft,
  Globe,
  Package,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronLeft,
  Activity,
  Tag,
  Info,
  Save,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-colors relative ${active ? 'bg-[#00BFA5]' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

const formatVehicleOption = (vehicle) => {
  const rawName = String(vehicle?.name || vehicle?.vehicle_type || vehicle?.title || '').trim();
  const transportType = String(vehicle?.transport_type || '').trim();
  const label = transportType
    ? `${rawName} (${transportType.replace(/_/g, ' ')})`
    : rawName;

  return {
    id: String(vehicle?._id || vehicle?.id || rawName),
    value: rawName,
    label: label || rawName,
  };
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read icon file'));
    reader.readAsDataURL(file);
  });

const GoodsTypes = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreateOrEdit = mode === 'create' || mode === 'edit';
  
  const [goods, setGoods] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('English');
  const [searchTerm, setSearchTerm] = useState('');
  
  const languages = ['English', 'Arabic', 'French', 'Spanish', 'Tamil', 'Kannada'];

  const [formData, setFormData] = useState({
    name: '',
    goods_type_for: '',
    active: 1,
    icon: '',
    iconFile: null,
  });

  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && id && goods.length > 0) {
      const item = goods.find(g => String(g._id || g.id) === String(id));
      if (item) {
        setFormData({
          name: item.name || item.goods_type_name || '',
          goods_type_for: item.goods_types_for || item.goods_type_for || 'both',
          active: item.active !== undefined ? Number(item.active) : 1,
          icon: item.icon || '',
          iconFile: null,
        });
      }
    } else if (mode === 'create') {
      setFormData({ name: '', goods_type_for: '', active: 1, icon: '', iconFile: null });
    }
  }, [mode, id, goods]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [goodsRes, vehicleRes] = await Promise.all([
        fetch(`${baseUrl}/goods-types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/types/vehicle-types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [goodsData, vehicleData] = await Promise.all([goodsRes.json(), vehicleRes.json()]);

      if (goodsData.success) {
        const items = goodsData.results || goodsData.data?.results || goodsData.data?.goods_types || [];
        setGoods(items);
      }

      if (vehicleData.success) {
        const rawVehicles = vehicleData.results || vehicleData.data?.vehicle_types || vehicleData.data || [];
        const items = Array.isArray(rawVehicles)
          ? rawVehicles
          : (rawVehicles?.results || rawVehicles?.vehicle_types || []);
        const safeItems = Array.isArray(items) ? items.filter((item) => item && typeof item === 'object') : [];
        const mappedOptions = safeItems
          .map(formatVehicleOption)
          .filter((item) => item.value);

        setVehicleOptions(mappedOptions);
      }
    } catch (error) {
      console.error("Error fetching goods types form data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSaving(true);
    try {
      const isEdit = mode === 'edit' && id;
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit ? `${baseUrl}/goods-types/${id}` : `${baseUrl}/goods-types`;
      const icon = formData.iconFile ? await readFileAsDataUrl(formData.iconFile) : formData.icon;
      const payload = {
        name: formData.name,
        goods_type_for: formData.goods_type_for,
        active: formData.active,
        goods_type_name: formData.name,
        icon,
      };
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        navigate('/admin/pricing/goods-types');
        fetchInitialData();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const sid = item._id || item.id;
    const nextActive = (Number(item.active) === 1) ? 0 : 1;
    try {
      const res = await fetch(`${baseUrl}/goods-types/${sid}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ active: nextActive })
      });
      const data = await res.json();
      if (data.success) {
        setGoods(prev => prev.map(g => (String(g._id || g.id) === String(sid)) ? { ...g, active: nextActive } : g));
      }
    } catch (e) {}
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this goods category permanently?")) return;
    try {
      const res = await fetch(`${baseUrl}/goods-types/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchInitialData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredGoods = goods.filter(g => (g.name || g.goods_type_name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const previewIcon = formData.iconFile ? URL.createObjectURL(formData.iconFile) : formData.icon;
  const availableForOptions = (() => {
    const dynamicOptions = vehicleOptions.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    if (mode === 'edit' && formData.goods_type_for && !dynamicOptions.some((option) => option.value === formData.goods_type_for)) {
      dynamicOptions.unshift({
        value: formData.goods_type_for,
        label: `${formData.goods_type_for} (Current)`,
      });
    }

    return dynamicOptions;
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AnimatePresence mode="wait">
        {!isCreateOrEdit ? (
          <motion.div 
            key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-4"
          >
            {/* Top Fixed Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h1 className="text-base font-bold text-gray-800 uppercase tracking-wide">GOODS TYPE</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="hover:text-gray-600 cursor-pointer">Goods Type</span>
                <ChevronRight size={10} className="text-gray-300" />
                <span className="text-gray-400">Goods Type</span>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-md border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Controls Bar */}
              <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span>show</span>
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer text-gray-700 font-bold">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                    <Search size={18} />
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 bg-[#FF7E5F] text-white rounded text-sm font-semibold hover:bg-[#FF6A45] transition-all shadow-sm">
                    <Activity size={16} className="rotate-90" /> Filters
                  </button>
                  <button 
                    onClick={() => navigate('/admin/pricing/goods-types/create')}
                    className="flex items-center gap-2 px-6 py-2 bg-[#334155] text-white rounded text-sm font-semibold hover:bg-[#1E293B] transition-all shadow-sm"
                  >
                    <Plus size={18} /> Add Goods Type
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-bold text-gray-800">Name</th>
                      <th className="px-6 py-4 text-sm font-bold text-gray-800">Goods Type For</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-24 text-center">
                          <Loader2 className="animate-spin text-[#00BFA5] mx-auto mb-2" size={32} />
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fetching Logistics...</p>
                        </td>
                      </tr>
                    ) : filteredGoods.length > 0 ? (
                      filteredGoods.map(item => (
                        <tr key={item._id || item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <span className="text-sm font-medium text-gray-700">{item.name || item.goods_type_name}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm text-gray-600 font-medium">
                              {item.goods_types_for || item.goods_type_for === 'both' ? 'All' : (item.goods_types_for || item.goods_type_for || 'All')}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center">
                              <StatusToggle 
                                active={Number(item.active) === 1} 
                                onToggle={() => handleToggleStatus(item)} 
                              />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => navigate(`/admin/pricing/goods-types/edit/${item._id || item.id}`)}
                                className="w-8 h-8 flex items-center justify-center bg-[#FFF8E1] text-[#FFA000] rounded hover:bg-[#FFECB3] transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(item._id || item.id)}
                                className="w-8 h-8 flex items-center justify-center bg-[#FFEBEE] text-[#D32F2F] rounded hover:bg-[#FFCDD2] transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-24 text-center">
                          <div className="text-gray-300 mb-2"><Package size={40} className="mx-auto" /></div>
                          <p className="text-sm font-bold text-gray-800">No Goods Types Found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Floating Action Menu Button */}
            <div className="fixed right-6 top-[60%] z-50">
              <button className="w-12 h-12 bg-[#00BFA5] text-white rounded-full flex items-center justify-center shadow-lg hover:rotate-90 transition-all duration-300">
                <div className="flex flex-col gap-1.5 items-center">
                  <div className="w-5 h-0.5 bg-white rounded-full" />
                  <div className="w-5 h-0.5 bg-white rounded-full" />
                </div>
              </button>
            </div>
          </motion.div>

        ) : (
          <motion.div 
            key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-6"
          >
            {/* Header Block as per Mockup */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
               <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">{mode === 'edit' ? 'EDIT' : 'CREATE'}</h1>
               <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                  <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/admin/pricing/goods-types')}>Goods Type</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span className="text-gray-400">{mode === 'edit' ? 'Edit' : 'Create'}</span>
               </div>
            </div>

            <div className="relative">
              {/* Main Form Container */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Multilingual Tabs */}
                <div className="flex items-center border-b border-gray-100 bg-white">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveTab(lang)}
                      className={`px-8 py-5 text-[13px] font-semibold transition-all relative ${activeTab === lang ? 'text-[#00BFA5]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {lang}
                      {activeTab === lang && (
                        <motion.div layoutId="tab-underline-create" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00BFA5]" />
                      )}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSave} className="p-8">
                  <div className="max-w-2xl space-y-10">
                    {/* Name Input */}
                    <div className="space-y-2.5">
                      <label className="block text-[13px] font-semibold text-gray-600">
                        Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" required value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder={`Enter Name in ${activeTab}`} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm text-gray-800 bg-white focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5] outline-none transition-all"
                      />
                    </div>

                    {/* Compatibility Select */}
                    <div className="space-y-2.5">
                      <label className="block text-[13px] font-semibold text-gray-600">
                         Goods Type For <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          required value={formData.goods_type_for}
                          onChange={(e) => setFormData(p => ({ ...p, goods_type_for: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm text-gray-800 bg-white focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5] outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select</option>
                          <option value="both">All Vehicles (Universal)</option>
                          <option value="truck">Logistics (Trucks)</option>
                          <option value="motor_bike">Courier (Bikes)</option>
                          {availableForOptions.length > 0 && availableForOptions.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#00BFA5]" />
                        <span className="text-xs font-semibold text-gray-600">Publish immediately upon creation</span>
                      </div>
                      <StatusToggle 
                        active={formData.active === 1} 
                        onToggle={() => setFormData(p => ({ ...p, active: p.active === 1 ? 0 : 1 }))} 
                      />
                    </div>
                  </div>

                  {/* Floating Menu Action (Visual reference to mockup) */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <button 
                      type="button"
                      className="w-12 h-12 bg-[#00BFA5] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,191,165,0.3)] hover:scale-110 active:scale-95 transition-all"
                    >
                      <div className="flex flex-col gap-1 items-center">
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                      </div>
                    </button>
                  </div>

                  {/* Footer Save Button */}
                  <div className="flex items-center justify-end pt-12">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-10 py-3 bg-[#334155] text-white rounded-md text-sm font-bold hover:bg-[#1E293B] transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={16} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoodsTypes;
