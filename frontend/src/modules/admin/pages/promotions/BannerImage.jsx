import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Search,
  Trash2,
  ExternalLink,
  Eye,
  Bell,
  ToggleRight as ToggleIcon,
  ToggleLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BannerImage = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    image_url: '',
    use_url: false,
    link_type: 'external_link', // external_link, deep_link
    redirect_url: '',
    active: true
  });
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem('adminToken') || '';
  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';

  // Helper to resolve image URL
  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    // For relative paths, prepend the server's root URL
    const rootUrl = baseUrl.replace('/api/v1/admin', '');
    return `${rootUrl}/${img.startsWith('/') ? img.slice(1) : img}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Handle various response structures: data.data.results, data.data, or data.results
          const items = data.data?.results || (Array.isArray(data.data) ? data.data : (data.results || []));
          setBanners(items);
        }
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, use_url: false });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert("Please enter a title");
      return;
    }
    if (!formData.redirect_url) {
      alert("Please enter a redirect URL");
      return;
    }
    if (!formData.use_url && !formData.image) {
      alert("Please upload a banner image");
      return;
    }
    if (formData.use_url && !formData.image_url) {
      alert("Please enter an image URL");
      return;
    }

    setSaving(true);
    try {
      let imageData = formData.use_url ? formData.image_url : null;
      
      // If image is a File, convert to base64 for JSON body
      if (!formData.use_url && formData.image instanceof File) {
         imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(formData.image);
         });
      }

      const payload = {
        title: formData.title,
        link_type: formData.link_type,
        active: formData.active ? 1 : 0,
        image: imageData || formData.image_url // Ensure we have something
      };

      // Set the dynamic key based on link_type
      if (formData.link_type === 'external_link') {
        payload.external_link = formData.redirect_url;
      } else {
        payload.deep_link = formData.redirect_url;
      }

      console.log("Sending payload:", payload);

      const res = await fetch(`${baseUrl}/banners`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setToastMsg("Banner added successfully");
        setShowToast(true);
        setView('list');
        fetchData();
        // Reset form
        setFormData({ title: '', image: null, image_url: '', use_url: false, link_type: 'external_link', redirect_url: '', active: true });
        setImagePreview(null);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // More descriptive error handling
        let errorMsg = data.message || "Failed to save banner";
        if (data.errors) {
          const details = Object.entries(data.errors)
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');
          errorMsg += `\n\nDetails:\n${details}`;
        }
        alert(errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`${baseUrl}/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBanners(banners.filter(b => (b._id || b.id) !== id));
        setToastMsg("Banner deleted successfully");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleStatus = async (item) => {
    const id = item._id || item.id;
    try {
      const res = await fetch(`${baseUrl}/banners/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !item.active })
      });
      const data = await res.json();
      if (data.success) {
        setBanners(banners.map(b => (b._id || b.id) === id ? { ...b, active: !item.active } : b));
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  if (loading && view === 'list') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#2D3A6E]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-1 space-y-8 font-sans text-gray-950 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-black text-[#2D3A6E] uppercase tracking-tight italic mb-1">
            {view === 'list' ? 'BANNER IMAGE' : 'CREATE'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
             <span>Banner Image</span>
             <ChevronRight size={12} className="opacity-50" />
             <span className="text-gray-900 font-black">{view === 'list' ? 'Banner Image' : 'Create'}</span>
          </div>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="bg-[#2D3A6E] text-white h-12 px-6 rounded-xl flex items-center gap-2 text-[13px] font-black uppercase tracking-tight hover:bg-[#1a234a] transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Add Banner Image
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Controls */}
            <div className="p-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-gray-500">show</span>
                <select className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[13px] font-bold outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-[13px] font-bold text-gray-500">entries</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50 py-4 px-10 text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <div>Icon</div>
              <div>Title</div>
              <div className="text-center">Status</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Body */}
            {banners.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {banners.map((item) => (
                  <div key={item._id || item.id} className="grid grid-cols-4 items-center py-6 px-10 text-[14px] font-bold text-gray-900 hover:bg-gray-50/50 transition-colors">
                    <div className="w-20 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative group-hover:scale-105 transition-transform flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={resolveImageUrl(item.image)} 
                          alt="Banner" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="flex flex-col items-center justify-center text-gray-300 w-full h-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                          }}
                        />
                      ) : (
                         <div className="flex items-center justify-center text-gray-300 w-full h-full">
                            <ImageIcon size={20} />
                         </div>
                      )}
                    </div>
                    <div className="truncate pr-4 text-gray-500">{item.title || "No Title"}</div>
                    <div className="flex justify-center">
                       <button 
                        onClick={() => toggleStatus(item)}
                        className="flex items-center gap-2 group"
                       >
                          {item.active ? (
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                              <CheckCircle2 size={12} />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-gray-100">
                              <X size={12} />
                              Inactive
                            </div>
                          )}
                       </button>
                    </div>
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={async () => {
                           const bid = item._id || item.id;
                           try {
                             const res = await fetch(`${baseUrl}/banners/${bid}/push`, {
                               method: 'POST',
                               headers: { 'Authorization': `Bearer ${token}` }
                             });
                             const data = await res.json();
                             if (data.success) {
                               alert("Push notification sent successfully!");
                             } else {
                               alert(data.message || "Failed to send notification");
                             }
                           } catch (err) {
                             alert("Network Error");
                           }
                         }}
                         title="Send Push Notification"
                         className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <Bell size={16} />
                        </button>
                       <button 
                        onClick={() => window.open(resolveImageUrl(item.image), '_blank')}
                        className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-sm active:scale-90"
                       >
                         <Eye size={16} />
                       </button>
                       <button 
                        onClick={() => handleDelete(item._id || item.id)}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center space-y-6">
                 <div className="w-24 h-24 bg-blue-50/50 rounded-full flex items-center justify-center relative">
                    <div className="w-16 h-20 bg-white border-2 border-blue-100 rounded-lg relative flex flex-col p-3 overflow-hidden shadow-sm">
                       <div className="w-full h-6 bg-blue-50 rounded-md mb-2 flex items-center justify-center">
                          <Search className="text-blue-500" size={14} strokeWidth={3} />
                       </div>
                       <div className="w-full h-1 bg-gray-100 rounded-full mb-1" />
                       <div className="w-2/3 h-1 bg-gray-50 rounded-full mb-3" />
                       <div className="w-full h-1 bg-blue-100/50 rounded-full" />
                       <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-[10px]">
                          -
                       </div>
                    </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] font-black text-gray-950 uppercase tracking-tight italic">No Data Found</h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1 max-w-xs uppercase leading-tight tracking-wider opacity-60">Looks like you haven't uploaded any banner images yet.</p>
                </div>
              </div>
            )}

            {/* Pagination Placeholder */}
            <div className="p-8 bg-gray-50/20 flex items-center justify-between border-t border-gray-100">
               <span className="text-[13px] font-bold text-gray-400">Showing 0 to 0 of 0 entries</span>
               <div className="flex items-center gap-2">
                  <button className="h-10 w-20 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-400 flex items-center justify-center cursor-not-allowed">Prev</button>
                  <button className="h-10 w-10 bg-[#2D3A6E] text-white rounded-xl text-[12px] font-black flex items-center justify-center shadow-lg">1</button>
                  <button className="h-10 w-20 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-400 flex items-center justify-center cursor-not-allowed">Next</button>
               </div>
            </div>
          </div>
        </div>
      ) : (
        /* CREATE VIEW CARD */
         <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Title */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    Banner Title <span className="text-rose-500">*</span>
                 </label>
                 <input 
                   type="text" 
                   placeholder="Enter Banner Title"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner placeholder:text-gray-300"
                 />
              </div>

              {/* Link Type (Radio Buttons) */}
              <div className="space-y-4">
                 <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    Link <span className="text-rose-500">*</span>
                 </label>
                 <div className="flex items-center gap-8 h-12">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio" 
                         name="link_type" 
                         value="external_link" 
                         checked={formData.link_type === 'external_link'}
                         onChange={(e) => setFormData({...formData, link_type: e.target.value})}
                         className="hidden"
                       />
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.link_type === 'external_link' ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'}`}>
                          {formData.link_type === 'external_link' && <div className="w-3 h-3 rounded-full bg-[#2D3A6E] animate-in zoom-in duration-300" />}
                       </div>
                       <span className={`text-[14px] font-bold transition-colors ${formData.link_type === 'external_link' ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-600'}`}>External URL</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio" 
                         name="link_type" 
                         value="deep_link" 
                         checked={formData.link_type === 'deep_link'}
                         onChange={(e) => setFormData({...formData, link_type: e.target.value})}
                         className="hidden"
                       />
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.link_type === 'deep_link' ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'}`}>
                          {formData.link_type === 'deep_link' && <div className="w-3 h-3 rounded-full bg-[#2D3A6E] animate-in zoom-in duration-300" />}
                       </div>
                       <span className={`text-[14px] font-bold transition-colors ${formData.link_type === 'deep_link' ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-600'}`}>App Link (Deep Link)</span>
                    </label>
                 </div>
              </div>

              {/* Status (Radio Buttons) */}
              <div className="space-y-4">
                 <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    Status <span className="text-rose-500">*</span>
                 </label>
                 <div className="flex items-center gap-8 h-12">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio" 
                         name="active" 
                         checked={formData.active}
                         onChange={() => setFormData({...formData, active: true})}
                         className="hidden"
                       />
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.active ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'}`}>
                          {formData.active && <div className="w-3 h-3 rounded-full bg-[#2D3A6E] animate-in zoom-in duration-300" />}
                       </div>
                       <span className={`text-[14px] font-bold transition-colors ${formData.active ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-600'}`}>Active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio" 
                         name="active" 
                         checked={!formData.active}
                         onChange={() => setFormData({...formData, active: false})}
                         className="hidden"
                       />
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${!formData.active ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'}`}>
                          {!formData.active && <div className="w-3 h-3 rounded-full bg-[#2D3A6E] animate-in zoom-in duration-300" />}
                       </div>
                       <span className={`text-[14px] font-bold transition-colors ${!formData.active ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-600'}`}>Inactive</span>
                    </label>
                 </div>
              </div>

              {/* Redirect URL */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    Redirect URL <span className="text-rose-500">*</span>
                 </label>
                 <input 
                   type="text" 
                   placeholder={formData.link_type === 'external_link' ? "Enter External URL (e.g. https://...)" : "Enter Deep Link Route (e.g. /offers)"}
                   value={formData.redirect_url}
                   onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                   className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner placeholder:text-gray-300"
                 />
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    Banner Image (Recommended 500x100) <span className="text-rose-500">*</span>
                 </label>
                 
                 <div className="relative group w-full">
                    <div className={`w-full h-48 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:bg-gray-100 group-hover:border-gray-300'}`}>
                       {imagePreview ? (
                          <div className="relative w-full h-full p-4">
                             <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-[24px]" />
                             <button 
                                onClick={() => {setImagePreview(null); setFormData({...formData, image: null})}}
                                className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                             >
                                <X size={20} strokeWidth={3} />
                             </button>
                          </div>
                       ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center space-y-4">
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                             <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-gray-300 transition-transform group-hover:scale-110">
                                <Upload size={32} />
                             </div>
                             <div>
                                <p className="text-[15px] font-black text-gray-950 uppercase tracking-tight italic">Drag & Drop or Click to Upload</p>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">PNG, JPG or WebP (max 2MB)</p>
                             </div>
                          </label>
                       )}
                    </div>
                 </div>
              </div>
          </div>

          <div className="flex justify-end gap-5 pt-8 border-t border-gray-50">
             <button 
               onClick={() => setView('list')}
               className="h-16 px-10 bg-gray-100 text-gray-500 rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95 transition-all"
             >
                Cancel
             </button>
             <button 
                onClick={handleSave}
                disabled={saving}
                className="h-16 px-20 bg-[#2D3A6E] text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#1a234a] transition-all shadow-2xl shadow-indigo-900/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
             >
                {saving ? (
                   <>
                     <Loader2 className="animate-spin" size={20} />
                     Saving...
                   </>
                ) : (
                   <>
                     Save
                   </>
                )}
             </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl p-6"
          >
             <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-8 py-5 rounded-[28px] shadow-2xl flex items-center justify-between ring-1 ring-emerald-200/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                      <CheckCircle2 size={24} strokeWidth={3} />
                   </div>
                   <span className="text-[14px] font-black uppercase tracking-tight italic">{toastMsg}</span>
                </div>
                <button onClick={() => setShowToast(false)} className="text-emerald-400 hover:text-emerald-800 transition-colors">
                   <X size={20} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BannerImage;
