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
  Info
  Loader2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all";
const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-colors relative ${active ? 'bg-indigo-600' : 'bg-gray-200'}`}
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
  
  const [goods, setGoods] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('English');
  const [searchTerm, setSearchTerm] = useState('');
  
  const languages = ['English', 'Arabic', 'French', 'Spanish'];

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

  useEffect(() => {
    if (mode === 'create' && !formData.goods_type_for && vehicleOptions.length > 0) {
      setFormData((current) => ({
        ...current,
        goods_type_for: vehicleOptions[0].value,
      }));
    }
  }, [mode, formData.goods_type_for, vehicleOptions]);

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
      if (data.success) fetchGoods();
    } catch (err) {}
      if (data.success) fetchInitialData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredGoods = goods.filter(g => (g.name || g.goods_type_name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider";
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

  if (!mode) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium uppercase tracking-widest">
              <span>Pricing</span>
              <ChevronRight size={12} />
              <span className="text-gray-700">Goods Types</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Goods Configuration</h1>
                <p className="text-xs text-gray-500 mt-1 font-medium">Categorize transportable items for delivery and logistics modules.</p>
              </div>
              <button 
                onClick={() => navigate('/admin/pricing/goods-types/create')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={18} /> New Goods Type
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Categories', value: goods.filter(g => Number(g.active) === 1).length, icon: Package, color: 'indigo' },
              { label: 'Universal Support', value: goods.filter(g => (g.goods_type_for || 'both') === 'both').length, icon: Globe, color: 'emerald' },
              { label: 'Total Definitions', value: goods.length, icon: Activity, color: 'blue' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100 shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

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
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                      <th className="px-6 py-4">Goods Identity</th>
                      <th className="px-6 py-4">Module Compatibility</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGoods.map(item => (
                      <tr key={item._id || item.id} className="hover:bg-gray-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm group-hover:rotate-12 transition-transform">
                              <Package size={18} />
                            </div>
                            <span className="text-sm font-bold text-gray-900 leading-tight">{item.name || item.goods_type_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200">
                              {item.goods_types_for || item.goods_type_for || 'Universal'}
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
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200 mx-auto mb-4"><Package size={32} /></div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">No Goods Records</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">Define transportable items to enable delivery pricing rules.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronized Recordset</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                <button className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md">1</button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium uppercase tracking-widest">
            <span>Goods Configuration</span>
            <ChevronRight size={12} />
            <span className="text-gray-700">{mode === 'edit' ? 'Refine' : 'Initialize'}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{mode === 'edit' ? 'Edit Goods Type' : 'Add New Category'}</h1>
            <button 
              onClick={() => navigate('/admin/pricing/goods-types')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Registry
            </button>
          </div>
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
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
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

                 <div className="space-y-1.5">
                    <label className={labelClass}>Compatibility Module *</label>
                    <div className="relative group">
                      <select 
                        required value={formData.goods_type_for}
                        onChange={(e) => setFormData(p => ({ ...p, goods_type_for: e.target.value }))}
                        className={inputClass + " appearance-none cursor-pointer"}
                      >
                        <option value="both">Universal (Combined)</option>
                        <option value="truck">Heavy Logistics (Truck)</option>
                        <option value="motor_bike">Quick Dispatch (Bike)</option>
                        {availableForOptions.length > 0 ? (
                          availableForOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))
                        ) : (
                          <option value={formData.goods_type_for || ''}>
                            {loading ? 'Loading vehicle types...' : 'No vehicle types found'}
                          </option>
                        )}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-400">
                      Vehicle types are loaded from the admin vehicle type catalog.
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
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
