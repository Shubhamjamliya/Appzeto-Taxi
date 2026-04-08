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
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const StatusToggle = ({ active, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

const GoodsTypes = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('English');
  
  const languages = ['English', 'Arabic', 'French', 'Spanish'];

  const [formData, setFormData] = useState({
    name: '',
    goods_type_for: 'all', // 'truck', 'motor_bike', 'all'
    status: 'active'
  });

  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/goods-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("GOODS API RESPONSE:", data);
      if (data.success) {
        // More robust extraction logic
        const items = data.data?.goods_types || 
                      (Array.isArray(data.data) ? data.data : null) || 
                      data.data?.results || 
                      data.results || 
                      [];
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
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `${baseUrl}/goods-types/${editingId}` : `${baseUrl}/goods-types`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setView('list');
        setEditingId(null);
        setFormData({ name: '', goods_type_for: 'all', status: 'active' });
        fetchGoods();
      } else {
        alert(data.message || "Failed to save goods type");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setFormData({
      name: item.name || '',
      goods_type_for: item.goods_type_for || 'all',
      status: item.status || 'active'
    });
    setView('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goods type?")) return;
    try {
      const res = await fetch(`${baseUrl}/goods-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchGoods();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-['Inter']">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header Area */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Goods Type</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-['Inter']">
                  <span>Price Management</span>
                  <ChevronRight size={14} />
                  <span className="text-indigo-600 font-black">Goods Type</span>
                </div>
              </div>
              <button 
                onClick={() => { setEditingId(null); setFormData({ name: '', goods_type_for: 'all', status: 'active' }); setView('create'); }}
                className="bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} /> ADD GOODS TYPE
              </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
               {/* Search/Filters */}
               <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <span className="text-[12px] font-bold text-slate-500">show</span>
                      <select className="bg-transparent border-none text-[12px] font-black text-slate-900 focus:ring-0">
                        <option>10</option>
                      </select>
                      <span className="text-[12px] font-bold text-slate-500">entries</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                       <input type="text" placeholder="Search..." className="bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600/20 outline-none w-64" />
                    </div>
                    <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-orange-100 flex items-center gap-2">
                       <Filter size={16} /> Filters
                    </button>
                  </div>
               </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Goods Type For</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[...Array(4)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>)}
                        </tr>
                      ))
                    ) : goods.length > 0 ? (
                      goods.map((item, idx) => (
                        <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-900">{item.name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">{item.goods_type_for || 'All'}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex justify-center">
                              <StatusToggle 
                                active={item.status === 'active' || item.active === true} 
                                onToggle={async () => {
                                  const nextStatus = (item.status === 'active' || item.active === true) ? 'inactive' : 'active';
                                  try {
                                    const res = await fetch(`${baseUrl}/goods-types/${item._id || item.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: nextStatus, active: nextStatus === 'active' })
                                    });
                                    if ((await res.json()).success) fetchGoods();
                                  } catch (e) { console.error(e); }
                                }} 
                              />
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(item)} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-90"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(item._id || item.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Layers size={48} className="mb-4 text-slate-300" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No goods types found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
               <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing {goods.length} entries</p>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 rounded-lg bg-[#0F172A] text-white text-[12px] font-bold">1</button>
                  <button className="p-2 text-slate-400 hover:text-slate-600"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
             <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{editingId ? 'Edit' : 'Create'}</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-['Inter']">
                  <span>Goods Type</span>
                  <ChevronRight size={14} />
                  <span className="text-indigo-600 font-black">{editingId ? 'Edit' : 'Create'}</span>
                </div>
              </div>
              <button 
                onClick={() => setView('list')}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={18} /> BACK TO LIST
              </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden">
               {/* Language Tabs */}
               <div className="flex items-center px-8 border-b border-slate-100">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-8 py-5 text-sm font-black transition-all relative ${activeTab === lang ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {lang}
                      {activeTab === lang && (
                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                      )}
                    </button>
                  ))}
               </div>

               <form onSubmit={handleSave} className="p-8 lg:p-12 space-y-10">
                  <div className="grid grid-cols-1 gap-y-10">
                    {/* Name */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder={`Enter Name in ${activeTab}`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none placeholder:text-slate-300"
                      />
                    </div>

                    {/* Goods Type For */}
                    <div className="max-w-md space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Goods Type For *</label>
                      <div className="relative group">
                        <select 
                          required
                          value={formData.goods_type_for}
                          onChange={(e) => setFormData({...formData, goods_type_for: e.target.value})}
                          className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="select">Select</option>
                          <option value="truck">Truck</option>
                          <option value="motor_bike">Motor Bike</option>
                          <option value="all">All</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="bg-[#0F172A] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                    >
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
