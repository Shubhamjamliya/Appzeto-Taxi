import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  FileText,
  Save,
  X,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerNeededDocuments = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    image_type: 'image',
    has_expiry_date: '0', // 0 for No, 1 for Yes (matching typical backend logic)
    has_identify_number: '0',
    is_editable: false,
    is_required: false,
    active: true
  });

  const token = localStorage.getItem('adminToken') || '';

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/owner-management/owner-needed-document', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Handle both direct array and results object logic
        const docList = Array.isArray(data.data) ? data.data : (data.data?.results || []);
        setDocuments(docList);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleEditClick = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.name || '',
      image_type: doc.image_type || 'image',
      has_expiry_date: doc.has_expiry_date?.toString() || '0',
      has_identify_number: doc.has_identify_number?.toString() || '0',
      is_editable: !!doc.is_editable,
      is_required: !!doc.is_required,
      active: !!doc.active
    });
    setView('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isEditing = view === 'edit';
    const url = isEditing
      ? `https://taxi-a276.onrender.com/api/v1/admin/owner-management/owner-needed-document/${editingId}`
      : 'https://taxi-a276.onrender.com/api/v1/admin/owner-management/owner-needed-document';
    
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setView('list');
        fetchDocuments();
        resetForm();
      } else {
        alert(json.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image_type: 'front_back',
      has_expiry_date: '0',
      has_identify_number: '0',
      is_editable: false,
      is_required: false,
      active: true
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document requirement?")) return;
    try {
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/owner-management/owner-needed-document/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) fetchDocuments();
      else alert(json.message || 'Delete failed');
    } catch (err) { alert('Delete failed'); }
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await fetch(`https://taxi-a276.onrender.com/api/v1/admin/owner-management/owner-needed-document/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !current })
      });
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, active: !current } : d));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-transparent p-1 font-sans">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header section as per image */}
            <div className="flex items-center justify-between mb-8 px-1">
              <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">Owner Needed Documents</h1>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Owner Needed Documents</span>
                <ChevronRight size={12} className="opacity-50" />
                <span className="text-gray-900 font-black">Owner Needed Documents</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    show 
                    <select className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 outline-none font-black text-gray-900 shadow-sm mx-2 appearance-none pr-8">
                       <option>10</option>
                    </select>
                    entries
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => { resetForm(); setView('create'); }} className="bg-[#2D3A6E] hover:bg-black text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                    <Plus size={20} strokeWidth={2.5} /> Add Owner Needed Documents
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-50">
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Name</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Document Type</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Has Expiry Date</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Status</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      <tr><td colSpan="5" className="py-20 text-center opacity-40 italic">Syncing Document Master...</td></tr>
                    ) : documents.length === 0 ? (
                      <tr><td colSpan="5" className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest text-lg">No Configuration Found</td></tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc._id} className="hover:bg-indigo-50/20 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600">
                          <td className="px-8 py-6">
                            <span className="text-[14px] font-black text-gray-950 uppercase">{doc.name}</span>
                          </td>
                          <td className="px-8 py-6 text-[13px] font-bold text-gray-400 italic capitalize">
                             {doc.image_type?.replace('_', ' ') || 'Front & Back'}
                          </td>
                          <td className="px-8 py-6 text-[13px] font-bold text-gray-600">{doc.has_expiry_date ? 'Yes' : 'No'}</td>
                          <td className="px-8 py-6 flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={!!doc.active} 
                                onChange={() => handleToggleStatus(doc._id, !!doc.active)} 
                              />
                              <div className="w-11 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2 text-rose-500">
                                <button onClick={() => handleEditClick(doc)} className="p-2.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all shadow-sm"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(doc._id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all shadow-sm"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Showing 1 to {documents.length} entries</span>
                <div className="flex items-center gap-1.5">
                   <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Prev</button>
                   <button className="w-10 h-10 rounded-xl bg-[#2D3A6E] text-white text-[13px] font-black shadow-xl">1</button>
                   <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Next</button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between mb-8 px-1 font-sans">
              <h1 className="text-[16px] font-black tracking-tight text-gray-800 uppercase">{view === 'edit' ? 'Update Document' : 'Create'}</h1>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="cursor-pointer" onClick={() => setView('list')}>Owner Needed Documents</span>
                <ChevronRight size={12} className="opacity-50" />
                <span className="text-gray-900 font-black">{view === 'edit' ? 'Edit' : 'Create'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-10">
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Document Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter Name"
                    className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-xl text-[14px] font-black outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Image Type *</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.image_type}
                      onChange={(e) => setFormData({...formData, image_type: e.target.value})}
                      className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-xl text-[14px] font-black outline-none appearance-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
                    >
                      <option value="">Select</option>
                      <option value="front_back">Front & Back</option>
                      <option value="front">Front Only</option>
                      <option value="back">Back Only</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Has Expiry Date *</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.has_expiry_date}
                      onChange={(e) => setFormData({...formData, has_expiry_date: e.target.value})}
                      className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-xl text-[14px] font-black outline-none appearance-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
                    >
                      <option value="0">Select</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Has Identify Number *</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.has_identify_number}
                      onChange={(e) => setFormData({...formData, has_identify_number: e.target.value})}
                      className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-xl text-[14px] font-black outline-none appearance-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner"
                    >
                      <option value="0">Select</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Checkboxes per image style */}
                <div className="col-span-2 flex items-center gap-14 py-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.is_editable ? 'bg-[#2D3A6E] border-[#2D3A6E]' : 'border-gray-200'}`}>
                       {formData.is_editable && <Check size={14} className="text-white" strokeWidth={4} />}
                       <input type="checkbox" className="hidden" checked={formData.is_editable} onChange={() => setFormData({...formData, is_editable: !formData.is_editable})} />
                    </div>
                    <span className="text-[12px] font-black text-gray-700 tracking-wide uppercase">Is Editable?</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.is_required ? 'bg-[#2D3A6E] border-[#2D3A6E]' : 'border-gray-200'}`}>
                       {formData.is_required && <Check size={14} className="text-white" strokeWidth={4} />}
                       <input type="checkbox" className="hidden" checked={formData.is_required} onChange={() => setFormData({...formData, is_required: !formData.is_required})} />
                    </div>
                    <span className="text-[12px] font-black text-gray-700 tracking-wide uppercase">Is Required?</span>
                  </label>
                </div>

                <div className="col-span-2 flex justify-end pt-10 border-t border-gray-50">
                   <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-[#2D3A6E] hover:bg-black text-white px-12 py-3.5 rounded-xl text-[13px] font-black transition-all shadow-2xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.15em]"
                   >
                     {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
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

export default OwnerNeededDocuments;
