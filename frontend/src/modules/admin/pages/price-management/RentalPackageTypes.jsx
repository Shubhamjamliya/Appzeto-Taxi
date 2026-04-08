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
  Car
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

const RentalPackageTypes = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    transport_type: '',
    name: '',
    short_description: '',
    description: '',
    status: 'active'
  });

  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/types/rental-packages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Robust extraction
        const items = data.data?.rental_packages || (Array.isArray(data.data) ? data.data : (data.data?.results || data.results || []));
        setPackages(items);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `${baseUrl}/types/rental-packages/${editingId}` : `${baseUrl}/types/rental-packages`;
      
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
        setFormData({ transport_type: '', name: '', short_description: '', description: '', status: 'active' });
        fetchPackages();
      } else {
        alert(data.message || "Failed to save package");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg._id || pkg.id);
    setFormData({
      transport_type: pkg.transport_type || '',
      name: pkg.name || '',
      short_description: pkg.short_description || '',
      description: pkg.description || '',
      status: pkg.status || 'active'
    });
    setView('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rental package type?")) return;
    try {
      const res = await fetch(`${baseUrl}/types/rental-packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchPackages();
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
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Rental Package Types</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  <span>Price Management</span>
                  <ChevronRight size={14} />
                  <span className="text-indigo-600">Rental Package Types</span>
                </div>
              </div>
              <button 
                onClick={() => { setEditingId(null); setFormData({ transport_type: '', name: '', short_description: '', description: '', status: 'active' }); setView('create'); }}
                className="bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} /> ADD RENTAL PACKAGE TYPES
              </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
               {/* Filters */}
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
                  <div className="flex items-center gap-2">
                    <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 flex items-center gap-2">
                      <Filter size={16} /> Filters
                    </button>
                  </div>
               </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Transport Type</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[...Array(4)].map((_, j) => <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>)}
                        </tr>
                      ))
                    ) : packages.length > 0 ? (
                      packages.map((pkg, idx) => (
                        <tr key={pkg._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-900">{pkg.name}</span>
                          </td>
                          <td className="px-8 py-6 uppercase tracking-wider">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{pkg.transport_type || 'Taxi'}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex justify-center">
                              <StatusToggle 
                                active={pkg.status === 'active' || pkg.active === true} 
                                onToggle={async () => {
                                  const nextStatus = (pkg.status === 'active' || pkg.active === true) ? 'inactive' : 'active';
                                  try {
                                    const res = await fetch(`${baseUrl}/types/rental-packages/${pkg._id || pkg.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: nextStatus, active: nextStatus === 'active' })
                                    });
                                    if ((await res.json()).success) fetchPackages();
                                  } catch (e) { console.error(e); }
                                }} 
                              />
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(pkg)} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-90 shadow-sm"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(pkg._id || pkg.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-90 shadow-sm"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Layers size={48} className="mb-4 text-slate-300" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No rental packages found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing {packages.length} entries</p>
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
                  <span>Rental Package Types</span>
                  <ChevronRight size={14} />
                  <span className="text-indigo-600">{editingId ? 'Edit' : 'Create'}</span>
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
               <form onSubmit={handleSave} className="p-8 lg:p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Transport Type */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Transport Type *</label>
                      <div className="relative group">
                        <select 
                          required
                          value={formData.transport_type}
                          onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                          className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none appearance-none"
                        >
                          <option value="">Select Transport Type</option>
                          <option value="taxi">Taxi</option>
                          <option value="delivery">Delivery</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none placeholder:text-slate-300"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Short Description *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter Short Description"
                        value={formData.short_description}
                        onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none placeholder:text-slate-300"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Description *</label>
                      <textarea 
                        required
                        placeholder="Enter Description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none resize-none placeholder:text-slate-300"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      className="bg-[#0F172A] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                    >
                      Save Changes
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

export default RentalPackageTypes;
