import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Package, 
  Loader2, 
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';

const inputClass = "w-full border border-gray-100 rounded-md px-4 py-3 text-sm text-gray-800 bg-[#FCFCFD] focus:border-indigo-500 transition-colors outline-none";
const labelClass = "block text-[13px] font-medium text-gray-400 mb-2.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-[#00BFA5]' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
  </button>
);

const GoodsTypes = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreateOrEdit = mode === 'create' || mode === 'edit';
  
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('English');
  const [searchTerm, setSearchTerm] = useState('');
  
  const languages = ['English', 'Arabic', 'French', 'Spanish', 'Tamil', 'Kannada'];

  const [formData, setFormData] = useState({
    name: '',
    goods_type_for: 'both',
    active: 1
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
          active: item.active !== undefined ? Number(item.active) : 1
        });
      }
    } else if (mode === 'create') {
      setFormData({ name: '', goods_type_for: 'both', active: 1 });
    }
  }, [mode, id, goods]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/goods-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGoods(data.results || data.data?.results || data.data?.goods_types || []);
      }
    } catch (error) {
      console.error("Error fetching goods types:", error);
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
      
      const payload = {
        name: formData.name,
        goods_type_for: formData.goods_type_for,
        goods_types_for: formData.goods_type_for,
        active: formData.active,
        goods_type_name: formData.name
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
      await fetch(`${baseUrl}/goods-types/${sid}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ active: nextActive })
      });
      fetchInitialData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this goods type permanently?")) return;
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

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {!isCreateOrEdit ? (
          <motion.div 
            key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-4"
          >
            {/* List Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-sm font-bold text-gray-800 uppercase tracking-widest">GOODS TYPES</h1>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <span>Goods Type</span>
                <ChevronRight size={10} className="text-gray-300" />
                <span className="text-gray-600">Listing</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
                <div className="relative w-64">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                   <input 
                      type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..." 
                      className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-md text-xs focus:outline-none focus:border-indigo-400"
                   />
                </div>
                <button 
                  onClick={() => navigate('/admin/pricing/goods-types/create')}
                  className="flex items-center gap-2 px-6 py-2 bg-[#334155] text-white rounded text-xs font-bold hover:bg-[#1E293B] shadow-sm transition-all"
                >
                  <Plus size={16} /> Add Goods Type
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FBFCFF]">
                    <tr className="border-b border-gray-50 text-[11px] text-gray-400 uppercase font-black tracking-widest">
                       <th className="px-6 py-4">Name</th>
                       <th className="px-6 py-4">Compatible With</th>
                       <th className="px-6 py-4 text-center">Status</th>
                       <th className="px-6 py-4 text-right pr-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="4" className="py-20 text-center text-gray-300 animate-pulse font-medium uppercase text-[10px] tracking-widest">Processing Recordset...</td></tr>
                    ) : filteredGoods.length === 0 ? (
                      <tr><td colSpan="4" className="py-20 text-center text-gray-300">No goods types configured.</td></tr>
                    ) : (
                      filteredGoods.map(item => (
                        <tr key={item._id || item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5 text-sm font-semibold text-gray-700">{item.name || item.goods_type_name}</td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded text-[10px] font-bold uppercase border border-gray-100 italic">
                               {item.goods_types_for || item.goods_type_for || 'BOTH'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center"><StatusToggle active={Number(item.active) === 1} onToggle={() => handleToggleStatus(item)} /></div>
                          </td>
                          <td className="px-6 py-5 pr-10">
                            <div className="flex items-center justify-end gap-2">
                               <button onClick={() => navigate(`/admin/pricing/goods-types/edit/${item._id || item.id}`)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                               <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 lg:p-8 space-y-6"
          >
            {/* Create/Edit Header */}
            <div className="flex items-center justify-between mb-8">
               <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">{mode === 'edit' ? 'EDIT' : 'CREATE'}</h1>
               <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                  <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/admin/pricing/goods-types')}>Goods Type</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span className="text-gray-800">{mode === 'edit' ? 'Edit' : 'Create'}</span>
               </div>
            </div>

            <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden relative min-h-[400px]">
              {/* Language Tabs Area */}
              <div className="flex items-center px-4 border-b border-gray-100 bg-white">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-8 py-5 text-[13px] font-semibold transition-all relative ${activeTab === lang ? 'text-[#00BFA5]' : 'text-[#8E9FBC] hover:text-gray-700'}`}
                  >
                    {lang}
                    {activeTab === lang && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00BFA5]" />
                    )}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-8 max-w-2xl">
                {/* Field: Name */}
                <div className="space-y-1.5">
                   <label className={labelClass}>
                     Name <span className="text-rose-500">*</span>
                   </label>
                   <input 
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder={`Enter Name in ${activeTab}`}
                      className={inputClass}
                   />
                </div>

                {/* Field: Goods Type For */}
                <div className="space-y-1.5">
                   <label className={labelClass}>
                     Goods Type For <span className="text-rose-500">*</span>
                   </label>
                   <div className="relative">
                      <select 
                         required value={formData.goods_type_for}
                         onChange={(e) => setFormData(p => ({ ...p, goods_type_for: e.target.value }))}
                         className={inputClass + " appearance-none cursor-pointer pr-10"}
                      >
                         <option value="">Select</option>
                         <option value="both">Both</option>
                         <option value="truck">Truck</option>
                         <option value="motorbike">Motorcycle</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                   </div>
                </div>

                {/* Floating Menu Button (Mockup styling) */}
                <div className="absolute right-8 top-[180px]">
                  <button type="button" className="w-12 h-12 bg-[#00BFA5] text-white rounded-full flex items-center justify-center shadow-lg hover:rotate-180 transition-transform duration-500">
                    <div className="flex flex-col gap-1 items-center">
                       <div className="w-5 h-[2px] bg-white rounded-full"></div>
                       <div className="w-5 h-[2px] bg-white rounded-full"></div>
                       <div className="w-5 h-[2px] bg-white rounded-full"></div>
                    </div>
                  </button>
                </div>

                {/* Footer Action: Save */}
                <div className="pt-10 flex justify-end">
                  <button 
                    type="submit" disabled={saving}
                    className="px-10 py-2.5 bg-[#4F5B71] text-white rounded text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoodsTypes;
