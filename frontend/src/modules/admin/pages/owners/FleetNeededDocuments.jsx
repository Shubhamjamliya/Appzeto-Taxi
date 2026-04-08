import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronRight, Edit2, Trash2, FileText, Save, X, Check,
  ChevronDown, LayoutGrid, List, Loader2, AlertCircle, ArrowLeft,
  Settings, Shield, ClipboardCheck, Info, FileStack
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = 'https://taxi-a276.onrender.com/api/v1/admin/owner-management';

const FleetNeededDocuments = () => {
  const [view, setView] = useState('list');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    image_type: '',
    has_expiry_date: '',
    has_identify_number: '',
    is_editable: false,
    is_required: false,
    active: true
  });

  const token = localStorage.getItem('adminToken') || '';

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/fleet-needed-document`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(Array.isArray(data.data) ? data.data : (data.data?.results || []));
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

  const resetForm = () => {
    setFormData({
      name: '',
      image_type: '',
      has_expiry_date: '',
      has_identify_number: '',
      is_editable: false,
      is_required: false,
      active: true
    });
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image_type || formData.has_expiry_date === '' || formData.has_identify_number === '') {
        alert("Please fill all required fields");
        return;
    }

    setSubmitting(true);
    const isEditing = !!editingId;
    const url = isEditing ? `${BASE}/fleet-needed-document/${editingId}` : `${BASE}/fleet-needed-document`;
    
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formData,
            has_expiry_date: formData.has_expiry_date === '1' ? true : false,
            has_identify_number: formData.has_identify_number === '1' ? true : false
        })
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document requirement?")) return;
    try {
      const res = await fetch(`${BASE}/fleet-needed-document/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        fetchDocuments();
      }
    } catch (err) {
      alert("Error deleting document");
    }
  };

  const handleEdit = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.name,
      image_type: doc.image_type,
      has_expiry_date: doc.has_expiry_date ? '1' : '0',
      has_identify_number: doc.has_identify_number ? '1' : '0',
      is_editable: doc.is_editable,
      is_required: doc.is_required,
      active: doc.active
    });
    setView('create');
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950 pb-20">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {view === 'create' && (
             <button 
               onClick={() => { setView('list'); resetForm(); }}
               className="p-4 bg-white border border-gray-100 rounded-[20px] hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-all shadow-sm active:scale-95"
             >
               <ArrowLeft size={24} />
             </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
                {view === 'list' ? 'Fleet Needed Documents' : (editingId ? 'Edit Requirement' : 'Create Requirement')}
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">
               <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => setView('list')}>Fleet Document Mgmt</span>
               <ChevronRight size={10} className="opacity-50" />
               <span className="text-gray-900">{view === 'list' ? 'List View' : 'Configuration'}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* TOOLBAR */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-3">
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Show</span>
                    <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-[13px] font-black text-gray-900 outline-none appearance-none pr-10 relative">
                       <option>10</option>
                       <option>25</option>
                       <option>50</option>
                    </select>
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Entries</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search requirements..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-14 pl-14 pr-6 bg-gray-50 border-transparent rounded-[24px] text-[14px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                    />
                 </div>
                 <button 
                   onClick={() => { resetForm(); setView('create'); }}
                   className="h-14 px-8 bg-[#2D3A6E] text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#1e274a] transition-all shadow-xl shadow-indigo-900/10 active:scale-95 shrink-0"
                 >
                    <Plus size={18} strokeWidth={3} /> Add Fleet Needed Documents
                 </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden border-b-8 border-b-indigo-50/20 min-h-[500px]">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50">
                           <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Document Name</th>
                           <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Document Type</th>
                           <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-widest italic text-center">Has Expiry</th>
                           <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Status</th>
                           <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-widest italic text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 uppercase tracking-tight">
                        {isLoading ? (
                           <tr>
                              <td colSpan="5" className="py-32 text-center text-gray-300 font-bold">
                                 <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                                 <span className="uppercase tracking-[0.3em] text-[10px]">Accessing Record Vault...</span>
                              </td>
                           </tr>
                        ) : filteredDocs.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="py-32 text-center">
                                 <div className="flex flex-col items-center gap-6 opacity-30">
                                    <FileStack size={80} strokeWidth={1} />
                                    <div className="space-y-1">
                                       <p className="text-[14px] font-black text-gray-900 italic underline decoration-indigo-200 decoration-4 uppercase">No Data Found</p>
                                       <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">The requirement registry is currently empty</p>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           filteredDocs.map((doc) => (
                              <tr key={doc._id} className="group hover:bg-indigo-50/10 transition-all border-l-4 border-l-transparent hover:border-l-[#2D3A6E]">
                                 <td className="px-10 py-7">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm">
                                          {doc.name[0]}
                                       </div>
                                       <span className="text-[14px] font-black text-gray-950 uppercase">{doc.name}</span>
                                    </div>
                                 </td>
                                 <td className="px-10 py-7">
                                    <span className="text-[12px] font-bold text-gray-400">{(doc.image_type || 'image').replace('_', ' ')}</span>
                                 </td>
                                 <td className="px-10 py-7 text-center">
                                    <span className={`text-[12px] font-black italic ${doc.has_expiry_date ? 'text-indigo-600' : 'text-gray-300'}`}>
                                       {doc.has_expiry_date ? 'YES' : 'NO'}
                                    </span>
                                 </td>
                                 <td className="px-10 py-7">
                                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-current italic ${doc.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                       {doc.active ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                 </td>
                                 <td className="px-10 py-7 text-right">
                                    <div className="flex items-center justify-end gap-2 pr-2">
                                       <button 
                                         onClick={() => handleEdit(doc)}
                                         className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-indigo-600 hover:bg-white/50 transition-all shadow-sm active:scale-95"
                                       >
                                          <Edit2 size={18} />
                                       </button>
                                       <button 
                                         onClick={() => handleDelete(doc._id)}
                                         className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-rose-600 hover:bg-white/50 transition-all shadow-sm active:scale-95"
                                       >
                                          <Trash2 size={18} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               <div className="p-10 bg-gray-50/10 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Showing 0 to 0 of 0 entries</span>
                  <div className="flex items-center gap-1.5">
                     <button className="px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>PREV</button>
                     <button className="h-12 w-12 bg-[#2D3A6E] text-white rounded-2xl text-[14px] font-black shadow-xl ring-8 ring-indigo-50/50">1</button>
                     <button className="px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>NEXT</button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex justify-center py-4"
          >
            <div className="w-full max-w-5xl bg-white rounded-[48px] border border-gray-100 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 to-purple-500" />
               
               <div className="p-12">
                  <div className="flex items-center justify-between mb-12">
                     <div>
                        <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tight italic leading-none mb-3">CREATE RECORD</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Configure Document Compliance Protocol</p>
                     </div>
                     <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-[#2D3A6E] group-hover:rotate-12 transition-transform">
                        <Shield size={32} strokeWidth={2.5} />
                     </div>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                           Document Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                           <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <input 
                             type="text" 
                             placeholder="Enter Name"
                             required
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             className="w-full h-16 pl-14 pr-6 bg-gray-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-gray-900 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                           Image Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                           <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.image_type}
                             onChange={(e) => setFormData({...formData, image_type: e.target.value})}
                             className="w-full h-16 pl-14 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner cursor-pointer"
                           >
                             <option value="">Select</option>
                             <option value="front_back">Front & Back Side</option>
                             <option value="front">Front Side Only</option>
                             <option value="back">Back Side Only</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                           Has Expiry Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                           <ClipboardCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.has_expiry_date}
                             onChange={(e) => setFormData({...formData, has_expiry_date: e.target.value})}
                             className="w-full h-16 pl-14 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner cursor-pointer"
                           >
                             <option value="">Select</option>
                             <option value="1">Yes</option>
                             <option value="0">No</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                           Has Identify Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                           <Info className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.has_identify_number}
                             onChange={(e) => setFormData({...formData, has_identify_number: e.target.value})}
                             className="w-full h-16 pl-14 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner cursor-pointer font-sans"
                           >
                             <option value="">Select</option>
                             <option value="1">Yes</option>
                             <option value="0">No</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     <div className="col-span-full flex flex-wrap items-center gap-10 pt-4 px-2">
                        <label className="flex items-center gap-4 cursor-pointer group/check">
                           <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={formData.is_editable}
                                onChange={(e) => setFormData({...formData, is_editable: e.target.checked})}
                                className="peer hidden"
                              />
                              <div className="w-7 h-7 border-2 border-gray-200 rounded-lg group-hover/check:border-[#2D3A6E]/50 transition-all peer-checked:bg-[#2D3A6E] peer-checked:border-[#2D3A6E] flex items-center justify-center text-white">
                                 <Check size={16} strokeWidth={4} className="scale-0 peer-checked:scale-100 transition-transform" />
                              </div>
                           </div>
                           <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest italic group-hover/check:text-[#2D3A6E] transition-colors">Is Editable?</span>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer group/check">
                           <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={formData.is_required}
                                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                                className="peer hidden"
                              />
                              <div className="w-7 h-7 border-2 border-gray-200 rounded-lg group-hover/check:border-[#2D3A6E]/50 transition-all peer-checked:bg-[#2D3A6E] peer-checked:border-[#2D3A6E] flex items-center justify-center text-white">
                                 <Check size={16} strokeWidth={4} className="scale-0 peer-checked:scale-100 transition-transform" />
                              </div>
                           </div>
                           <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest italic group-hover/check:text-[#2D3A6E] transition-colors">Is Required?</span>
                        </label>
                     </div>

                     <div className="col-span-full pt-10 border-t border-gray-50 flex items-center justify-end gap-5">
                         <button 
                           type="button"
                           onClick={() => { setView('list'); resetForm(); }}
                           className="h-16 px-10 rounded-[28px] text-[13px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-950 transition-colors"
                         >
                            Cancel
                         </button>
                         <button 
                           type="submit"
                           disabled={submitting}
                           className="h-16 px-12 bg-[#2D3A6E] text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#1e274a] transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
                         >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {editingId ? 'Update Requirement' : 'Save'}
                         </button>
                     </div>
                  </form>
               </div>
               
               <div className="bg-indigo-50/30 p-10 flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-1 italic">Validation Logic</p>
                     <p className="text-[12px] font-bold text-gray-400 leading-relaxed max-w-2xl">
                        Ensuring all fleet documents meet strict verification standards. Identify numbers and expiry dates will be mandatory for OCR processing if enabled.
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetNeededDocuments;
