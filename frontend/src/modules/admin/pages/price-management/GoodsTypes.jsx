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
  ChevronLeft,
  Activity,
  Tag,
  Info,
  Save,
  Info,
  Upload
} from 'lucide-react';
import { motion } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";
const Motion = motion;

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

const normalizeGoodsTypeFor = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const formatGoodsTypeForDisplay = (value) => {
  const items = normalizeGoodsTypeFor(value);
  return items.length > 0 ? items.join(', ') : 'BOTH';
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
    goods_type_for: [],
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
          goods_type_for: normalizeGoodsTypeFor(item.goods_types_for || item.goods_type_for || 'both'),
          active: item.active !== undefined ? Number(item.active) : 1,
          icon: item.icon || '',
          iconFile: null,
        });
      }
    } else if (mode === 'create') {
      setFormData({ name: '', goods_type_for: [], active: 1, icon: '', iconFile: null });
    }
  }, [mode, id, goods]);

  useEffect(() => {
    if (mode === 'create' && formData.goods_type_for.length === 0 && vehicleOptions.length > 0) {
      setFormData((current) => ({
        ...current,
        goods_type_for: [vehicleOptions[0].value],
      }));
    }
  }, [mode, formData.goods_type_for.length, vehicleOptions]);

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
    const selectedVehicles = normalizeGoodsTypeFor(formData.goods_type_for);

    if (!formData.name) {
      return;
    }

    if (selectedVehicles.length === 0) {
      alert('Select at least one available vehicle type.');
      return;
    }

    setSaving(true);
    try {
      const isEdit = mode === 'edit' && id;
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit ? `${baseUrl}/goods-types/${id}` : `${baseUrl}/goods-types`;
      const icon = formData.iconFile ? await readFileAsDataUrl(formData.iconFile) : formData.icon;
      const payload = {
        name: formData.name,
        goods_type_for: selectedVehicles.join(','),
        goods_types_for: selectedVehicles.join(','),
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
    } catch (error) {
      console.error("Error toggling status:", error);
    }
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

    formData.goods_type_for.forEach((selectedValue) => {
      if (selectedValue && !dynamicOptions.some((option) => option.value === selectedValue)) {
        dynamicOptions.unshift({
          value: selectedValue,
          label: `${selectedValue} (Current)`,
        });
      }
    });

    return dynamicOptions;
  })();

  const toggleAvailableVehicle = (value) => {
    setFormData((current) => {
      const currentValues = normalizeGoodsTypeFor(current.goods_type_for);
      const exists = currentValues.includes(value);
      const nextValues = exists
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];

      return {
        ...current,
        goods_type_for: nextValues,
      };
    });
  };

  const selectAllAvailableVehicles = () => {
    const selectableValues = vehicleOptions.length > 0
      ? vehicleOptions.map((option) => option.value)
      : availableForOptions.map((option) => option.value);

    setFormData((current) => ({
      ...current,
      goods_type_for: selectableValues,
    }));
  };

  const clearAvailableVehicles = () => {
    setFormData((current) => ({
      ...current,
      goods_type_for: [],
    }));
  };

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
              <button
                onClick={() => navigate('/admin/pricing/goods-types/create')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={18} /> New Goods Type
              </button>
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
          {/* List Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
              <div className="relative w-full max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search goods categories..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Indexing Logistics Clusters</p>
                </div>
              ) : filteredGoods.length > 0 ? (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200">
                              {formatGoodsTypeForDisplay(item.goods_types_for || item.goods_type_for || 'Universal')}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex justify-center"><StatusToggle active={Number(item.active) === 1} onToggle={() => handleToggleStatus(item)} /></div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                             <button onClick={() => navigate(`/admin/pricing/goods-types/edit/${item._id || item.id}`)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Edit2 size={16} /></button>
                             <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                           </div>
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

            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronized Recordset</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                <button className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md">1</button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
              </div>
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
        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/20 overflow-hidden">
          {/* Language Tabs */}
          <div className="flex items-center px-4 border-b border-gray-100 bg-gray-50/20">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-8 py-5 text-[10px] font-black tracking-[0.2em] transition-all relative uppercase ${activeTab === lang ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {lang}
                {activeTab === lang && (
                  <Motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
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
          <form onSubmit={handleSave} className="p-8 lg:p-10 space-y-10">
            <div className="space-y-8">
               <div className="flex items-center gap-3 mb-2 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm"><Tag size={20} /></div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Module Parameters</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Classification Settings</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1.5">
                    <label className={labelClass}>Goods Name ({activeTab}) *</label>
                    <div className="relative">
                       <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input
                          type="text" required value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Fragile Electronics" className={inputClass + " pl-11"}
                       />
                    </div>
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
                 <div className="space-y-2">
                    <label className={labelClass}>
                      <Plus size={11} className="inline mr-1 text-gray-400" />
                      Available For *
                    </label>
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      {availableForOptions.length > 0 ? (
                        <>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {formData.goods_type_for.length} selected
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={selectAllAvailableVehicles}
                                className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 transition-all hover:bg-indigo-100"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={clearAvailableVehicles}
                                className="rounded-lg bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-100"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                            {availableForOptions.map((option) => {
                              const checked = formData.goods_type_for.includes(option.value);
                              return (
                                <label
                                  key={option.value}
                                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                                    checked
                                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleAvailableVehicle(option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="truncate">{option.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="px-2 py-3 text-xs font-semibold text-gray-400">
                          {loading ? 'Loading vehicle types...' : 'No vehicle types found'}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-gray-400">
                      Select one or more active vehicle types from the admin vehicle type catalog.
                    </p>
                  </div>
               </div>

               <div className="mt-8 border-t border-gray-100 pt-8">
                  <label className={labelClass}>Goods Icon</label>
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-36 w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                      {previewIcon ? (
                        <img src={previewIcon} alt="Goods icon preview" className="h-full w-full object-contain p-4" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Package size={28} className="mx-auto mb-2" />
                          <p className="text-[11px] font-semibold uppercase tracking-wider">No Icon</p>
                        </div>
                      )}
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
                    <div className="flex-1 space-y-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
                        <Upload size={15} />
                        Upload Icon
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData((current) => ({
                              ...current,
                              iconFile: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </label>
                      <p className="text-[11px] text-gray-500">
                        This icon will be shown on the parcel type screen in the user app.
                      </p>
                      {(formData.icon || formData.iconFile) ? (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              icon: '',
                              iconFile: null,
                            }))
                          }
                          className="text-[11px] font-semibold text-rose-500 transition-colors hover:text-rose-600"
                        >
                          Remove current icon
                        </button>
                      ) : null}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-indigo-50/20 rounded-2xl border border-indigo-50 shadow-inner">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Discovery</p>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mt-0.5">Visible to dispatchers</p>
                  </div>
               </div>
               <StatusToggle 
                 active={formData.active === 1} 
                 onToggle={() => setFormData(p => ({ ...p, active: p.active === 1 ? 0 : 1 }))}
               />
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
               <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[11px] font-bold text-amber-800 leading-relaxed">Defining correct goods types ensures that drivers with incompatible vehicles are not matched with specific cargo types.</p>
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
            <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
               <button 
                  type="button" onClick={() => navigate('/admin/pricing/goods-types')}
                  className="px-8 py-3.5 bg-white text-gray-400 border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
               >
                 Cancel
               </button>
               <button 
                  type="submit" disabled={saving}
                  className="px-10 py-3.5 bg-[#0F172A] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
               >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Processing' : (mode === 'edit' ? 'Update Definition' : 'Publish Category')}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoodsTypes;
