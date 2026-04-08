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
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';

const GlobalDocuments = () => {
  const [view, setView] = useState('list'); // 'list' or 'edit' or 'add'
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [documents, setDocuments] = useState([]);

  const token = localStorage.getItem('adminToken') || '';
  const BASE = 'https://taxi-a276.onrender.com/api/v1/admin/owner-management/driver-needed-document';

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(BASE, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : (data.data?.results || []);
        setDocuments(list);
      }
    } catch (err) {
      console.error('Failed to fetch driver documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const [formData, setFormData] = useState({
    name: '',
    image_type: 'image',
    has_identify_number: '0',
    has_expiry_date: '0',
    is_editable: true,
    is_required: true,
    active: true
  });

  const resetForm = () => {
    setFormData({ name: '', image_type: 'image', has_identify_number: '0', has_expiry_date: '0', is_editable: true, is_required: true, active: true });
    setEditingId(null);
  };

  const handleEdit = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.name || '',
      image_type: doc.image_type || 'image',
      has_identify_number: doc.has_identify_number?.toString() || '0',
      has_expiry_date: doc.has_expiry_date?.toString() || '0',
      is_editable: !!doc.is_editable,
      is_required: !!doc.is_required,
      active: !!doc.active
    });
    setView('edit');
  };

  const handleSaveDoc = async () => {
    setSubmitting(true);
    const isEditing = !!editingId;
    const url = isEditing ? `${BASE}/${editingId}` : BASE;
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) { setView('list'); fetchDocuments(); resetForm(); }
      else alert(json.message || 'Operation failed');
    } catch (err) { alert('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document type?')) return;
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) fetchDocuments();
    } catch (err) { alert('Delete failed'); }
  };

  const handleToggle = async (id, current) => {
    try {
      await fetch(`${BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current })
      });
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, active: !current } : d));
    } catch (err) { console.error(err); }
  };

  const filteredDocs = documents.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'edit' || view === 'add') {
    return (
      <div className="space-y-8 p-1 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-gray-950 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => setView('list')} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-all shadow-sm">
                 <X size={20} />
              </button>
              <div>
                 <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1.5">{view === 'edit' ? 'Edit Document' : 'Add New Document'}</h1>
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Masters</span>
                    <ChevronRight size={10} />
                    <span>Needed Documents</span>
                    <ChevronRight size={10} />
                    <span className="text-indigo-600">Config</span>
                 </div>
              </div>
           </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm p-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Document Name */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Document Name <span className="text-rose-500">*</span>
                 </label>
                 <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter Document Name"
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
                 />
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Account Type <span className="text-rose-500">*</span>
                 </label>
                 <div className="relative">
                    <select 
                       value={formData.accountType}
                       onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                       className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option>Individual</option>
                       <option>Corporate</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                 </div>
              </div>

              {/* Has Expiry Date */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Has Expiry Date <span className="text-rose-500">*</span>
                 </label>
                 <div className="relative">
                    <select 
                       value={formData.hasExpiryDate}
                       onChange={(e) => setFormData({...formData, hasExpiryDate: e.target.value})}
                       className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option>No</option>
                       <option>Yes</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                 </div>
              </div>

              {/* Image Type */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Image Type <span className="text-rose-500">*</span>
                 </label>
                 <div className="relative">
                    <select 
                       value={formData.imageType}
                       onChange={(e) => setFormData({...formData, imageType: e.target.value})}
                       className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option>Front&Back</option>
                       <option>Front Only</option>
                       <option>Back Only</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                 </div>
              </div>

              {/* Document Name Front */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Document Name Front <span className="text-rose-500">*</span>
                 </label>
                 <input 
                    type="text" 
                    value={formData.nameFront}
                    onChange={(e) => setFormData({...formData, nameFront: e.target.value})}
                    placeholder="e.g. Aadhar Front"
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
                 />
              </div>

              {/* Document Name Back */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Document Name Back <span className="text-rose-500">*</span>
                 </label>
                 <input 
                    type="text" 
                    value={formData.nameBack}
                    onChange={(e) => setFormData({...formData, nameBack: e.target.value})}
                    placeholder="e.g. Aadhar Back"
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
                 />
              </div>

              {/* Has Identify Number */}
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    Has Identify Number <span className="text-rose-500">*</span>
                 </label>
                 <div className="relative">
                    <select 
                       value={formData.hasIdentifyNumber}
                       onChange={(e) => setFormData({...formData, hasIdentifyNumber: e.target.value})}
                       className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                       <option>No</option>
                       <option>Yes</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                 </div>
              </div>

              {/* Checkboxes */}
              <div className="col-span-2 flex items-center gap-12 pt-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isEditable ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-gray-200 group-hover:border-indigo-200'}`}>
                       {formData.isEditable && <Check size={14} className="text-white" strokeWidth={4} />}
                       <input type="checkbox" className="hidden" checked={formData.isEditable} onChange={() => setFormData({...formData, isEditable: !formData.isEditable})} />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-widest text-gray-700">Is Editable?</span>
                 </label>

                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isRequired ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-gray-200 group-hover:border-indigo-200'}`}>
                       {formData.isRequired && <Check size={14} className="text-white" strokeWidth={4} />}
                       <input type="checkbox" className="hidden" checked={formData.isRequired} onChange={() => setFormData({...formData, isRequired: !formData.isRequired})} />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-widest text-gray-700">Is Required?</span>
                 </label>
              </div>

               {/* Document For Selector */}
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                     Document For <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                     <select 
                        value={formData.document_for}
                        onChange={(e) => setFormData({...formData, document_for: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                     >
                        <option value="driver">Driver</option>
                        <option value="owner">Owner</option>
                        <option value="fleet">Fleet</option>
                        <option value="both">Both (Driver & Owner)</option>
                     </select>
                     <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
               </div>

               {/* Existing fields with updated names for backend */}
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Identify Number Locale Key</label>
                  <input 
                     type="text" 
                     value={formData.identify_number_locale_key}
                     onChange={(e) => setFormData({...formData, identify_number_locale_key: e.target.value})}
                     placeholder="e.g. pan_number"
                     className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] text-[14px] font-bold focus:bg-white outline-none transition-all shadow-inner"
                  />
               </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-50 flex justify-end gap-4">
               <button onClick={() => { setView('list'); resetForm(); }} className="px-10 py-4 border border-gray-100 rounded-[24px] text-[13px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all">Cancel</button>
               <button 
                 onClick={handleSaveDoc}
                 disabled={submitting}
                 className="px-12 py-4 bg-indigo-600 text-white rounded-[24px] text-[13px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
               >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingId ? 'Update Document' : 'Save Document'}</>}
               </button>
            </div>
        </div>

        {/* INFO FOOTER */}
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] flex gap-5 text-amber-900 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4"><AlertCircle size={80} strokeWidth={1} /></div>
           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-amber-100 shrink-0 shadow-sm"><Info size={24} className="text-amber-500" /></div>
           <div className="relative z-10">
              <h4 className="text-[14px] font-black uppercase tracking-widest mb-1.5 focus:outline-none">Configuration Notice</h4>
              <p className="text-[12px] font-bold leading-relaxed max-w-4xl opacity-80 italic">Changes to global document requirements for drivers will reflect immediately on the mobile application for all agents. Ensure OCR compatibility before requiring specific image types (Front/Back/Merge).</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none uppercase tracking-tighter">Driver Needed Documents</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none">Masters</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Global Config</span>
            </div>
         </div>
         <button 
            onClick={() => { resetForm(); setView('add'); }}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-[24px] text-[13px] font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest"
         >
            <Plus size={18} /> Add Driver Needed Documents
         </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-gray-400 leading-none">
            show 
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-950 font-black focus:outline-none focus:border-indigo-200 transition-all cursor-pointer shadow-inner"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            entries
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Filter documents..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[20px] text-[13px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Name</th>
                <th className="px-6 py-6 text-center">Account Type</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-400 italic">Loading documents...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">No Documents Configured</td></tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc._id || doc.id} className="group hover:bg-indigo-50/10 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-gray-100 rounded-xl text-indigo-500 shadow-inner group-hover:bg-gray-950 group-hover:text-white transition-all"><FileText size={18} /></div>
                       <p className="text-[15px] font-black text-gray-950 uppercase tracking-tight leading-none">{doc.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-[13px] font-black text-gray-400 uppercase tracking-widest italic">{doc.image_type || 'image'}</span>
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex justify-center items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={!!doc.active} onChange={() => handleToggle(doc._id, !!doc.active)} />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-amber-100"
                        >
                           <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-8 border-t border-gray-50 flex items-center justify-between">
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Showing 1 to {filteredDocs.length} of {filteredDocs.length} entries</p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:text-gray-950 transition-all" disabled>PREV</button>
              <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-indigo-100">1</button>
              <button className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:text-gray-950 transition-all font-black" disabled>NEXT</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDocuments;
