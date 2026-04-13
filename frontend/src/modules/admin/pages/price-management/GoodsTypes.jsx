import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit2, 
  Layers,
  ChevronDown,
  ArrowLeft,
  Filter,
  Globe,
  Package,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${active ? 'left-6' : 'left-1'}`} />
  </button>
);

const GoodsTypes = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('English');
  
  const languages = ['English', 'Arabic', 'French', 'Spanish'];

  const [formData, setFormData] = useState({
    name: '',
    goods_type_for: 'both',
    active: 1
  });

  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchGoods();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && id && goods.length > 0) {
      const item = goods.find(g => String(g._id || g.id) === String(id));
      if (item) {
        setFormData({
          name: item.name || item.goods_type_name || '',
          goods_type_for: item.goods_types_for || item.goods_type_for || 'both',
          active: item.active !== undefined ? Number(item.active) : 1
        });
      }
    } else if (mode === 'create') {
      setFormData({ name: '', goods_type_for: 'both', active: 1 });
    }
  }, [mode, id, goods]);

  const fetchGoods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/goods-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const items = data.results || data.data?.results || data.data?.goods_types || [];
        setGoods(items);
      }
    } catch (error) {
      console.error("Error fetching goods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = mode === 'edit' && id;
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit ? `${baseUrl}/goods-types/${id}` : `${baseUrl}/goods-types`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          goods_type_name: formData.name
        })
      });

      const data = await res.json();
      if (data.success) {
        navigate('/admin/pricing/goods-types');
        fetchGoods();
      } else {
        alert(data.message || "Failed to save goods type");
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const currentActive = item.active !== undefined ? Number(item.active) : 1;
    const nextActive = currentActive === 1 ? 0 : 1;
    
    try {
      const res = await fetch(`${baseUrl}/goods-types/${item._id || item.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ active: nextActive })
      });
      const data = await res.json();
      if (data.success) {
        setGoods(prev => prev.map(g => 
          (String(g._id || g.id) === String(item._id || item.id)) 
          ? { ...g, active: nextActive } 
          : g
        ));
      }
    } catch (e) {
      console.error("Error toggling status:", e);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this goods type?")) return;
    try {
      const res = await fetch(`${baseUrl}/goods-types/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchGoods();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider";

  if (!mode) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans">
        {/* Header Block */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">
            <span>Price Management</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-indigo-600">Goods Types</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Goods Types</h1>
              <p className="text-xs text-gray-500 mt-1">Manage transportable goods categories and pricing modules</p>
            </div>
            <button 
              onClick={() => navigate('/admin/pricing/goods-types/create')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <Plus size={16} /> ADD GOODS TYPE
            </button>
          </div>
        </div>

        {/* List Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search goods..." 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-indigo-500 w-64 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto text-sans">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goods Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module Access</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(4)].map((_, j) => <td key={j} className="px-6 py-5"><div className="h-3 bg-gray-100 rounded-full w-full"></div></td>)}
                    </tr>
                  ))
                ) : goods.length > 0 ? (
                  goods.map((item) => (
                    <tr key={item._id || item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <Package size={16} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.name || item.goods_type_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {item.goods_types_for || item.goods_type_for || 'BOTH'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <StatusToggle 
                            active={Number(item.active) === 1} 
                            onToggle={() => handleToggleStatus(item)} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 text-sans">
                          <button 
                            onClick={() => navigate(`/admin/pricing/goods-types/edit/${item._id || item.id}`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id || item.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <Layers size={40} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-sm text-gray-400 font-medium">No goods types found in database</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-5 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total: {goods.length} Units</span>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-900 shadow-sm">1</div>
              <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto text-sans">
        {/* Header Block */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">
            <span>Goods Types</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-indigo-600 tracking-tight">{mode === 'edit' ? 'Update Category' : 'New Category'}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {mode === 'edit' ? 'Edit Goods Type' : 'Add New Goods Type'}
            </h1>
            <button 
              onClick={() => navigate('/admin/pricing/goods-types')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={16} /> BACK TO LIST
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/20 overflow-hidden">
          {/* Language Tabs */}
          <div className="flex items-center px-4 border-b border-gray-100 bg-gray-50/30">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-6 py-4 text-[11px] font-bold transition-all relative uppercase tracking-widest ${activeTab === lang ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {lang}
                {activeTab === lang && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} className="p-8 lg:p-10 space-y-8">
            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">General Information</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Basic identity and configuration</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className={labelClass}>
                      <Globe size={11} className="inline mr-1 text-gray-400" />
                      Goods Name ({activeTab}) *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Perishable Food Items"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={inputClass}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className={labelClass}>
                      <Plus size={11} className="inline mr-1 text-gray-400" />
                      Available For *
                    </label>
                    <div className="relative group">
                      <select 
                        required
                        value={formData.goods_type_for}
                        onChange={(e) => setFormData({...formData, goods_type_for: e.target.value})}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="both">Both (Truck & Motor Bike)</option>
                        <option value="truck">Truck Only</option>
                        <option value="motor_bike">Motor Bike Only</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors" />
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-indigo-50/30 rounded-xl border border-indigo-50">
               <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 uppercase">Publish Status</p>
                    <p className="text-[10px] text-gray-500 font-medium">Immediate availability for dispatch modules</p>
                  </div>
               </div>
               <StatusToggle 
                 active={formData.active === 1} 
                 onToggle={() => setFormData({...formData, active: formData.active === 1 ? 0 : 1})} 
               />
            </div>

            <div className="pt-4 flex justify-end gap-3">
               <button 
                  type="button"
                  onClick={() => navigate('/admin/pricing/goods-types')}
                  className="px-8 py-3.5 bg-gray-100 text-gray-600 rounded-xl text-[11px] font-bold hover:bg-gray-200 transition-all uppercase tracking-widest"
               >
                 Cancel
               </button>
               <button 
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
               >
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                 {saving ? 'Processing...' : (mode === 'edit' ? 'Update Goods Type' : 'Create Goods Type')}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoodsTypes;
