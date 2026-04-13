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
  const baseUrl = globalThis.__LEGACY_BACKEND_ORIGIN__ + '/api/v1/admin';

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
          <h1 className="text-[19px] font-bold text-slate-900 tracking-tight mb-1">
            {view === 'list' ? 'Banner Management' : 'Create New Banner'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
             <span>Promotions</span>
             <ChevronRight size={12} className="opacity-50" />
             <span className="text-slate-900">{view === 'list' ? 'Banner Assets' : 'New Asset'}</span>
          </div>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="bg-slate-900 text-white h-12 px-6 rounded-xl flex items-center gap-2 text-[14px] font-bold tracking-tight hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Create Banner
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Controls */}
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-slate-500">Show</span>
                <select className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[13px] font-bold outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-[13px] font-semibold text-slate-500">entries</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 bg-slate-50/50 py-4 px-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <div>Visual Asset</div>
              <div>Campaign Title</div>
              <div className="text-center">Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Body */}
            {banners.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {banners.map((item) => (
                  <div key={item._id || item.id} className="grid grid-cols-4 items-center py-6 px-10 text-[14px] font-semibold text-slate-900 hover:bg-slate-50/50 transition-colors">
                    <div className="w-24 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-transform flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={resolveImageUrl(item.image)} 
                          alt="Banner" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="flex flex-col items-center justify-center text-slate-300 w-full h-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                          }}
                        />
                      ) : (
                         <div className="flex items-center justify-center text-slate-300 w-full h-full">
                            <ImageIcon size={20} />
                         </div>
                      )}
                    </div>
                    <div className="truncate pr-4 text-slate-600 font-bold">{item.title || "Untitled Campaign"}</div>
                    <div className="flex justify-center">
                       <button 
                        onClick={() => toggleStatus(item)}
                        className="flex items-center gap-2"
                       >
                          {item.active ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                              <CheckCircle2 size={12} />
                              Live
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                              <X size={12} />
                              Inactive
                            </div>
                          )}
                       </button>
                    </div>
                    <div className="flex justify-end gap-2.5">
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
                               alert("Marketing push sent!");
                             }
                           } catch (err) {
                             alert("Network Error");
                           }
                         }}
                         title="Push to Users"
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
                        className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                 <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                    <ImageIcon size={40} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">No Banners Found</h3>
                  <p className="text-[13px] font-medium text-slate-400 mt-1 max-w-xs">Start by creating a promotional banner for your users.</p>
                </div>
              </div>
            )}

            {/* Pagination Placeholder */}
            <div className="p-8 bg-slate-50/20 flex items-center justify-between border-t border-slate-50">
               <span className="text-[13px] font-semibold text-slate-400">Total available results: {banners.length}</span>
               <div className="flex items-center gap-2">
                  <button className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-400 flex items-center justify-center cursor-not-allowed">Previous</button>
                  <button className="h-10 w-10 bg-slate-900 text-white rounded-xl text-[12px] font-bold flex items-center justify-center shadow-lg">1</button>
                  <button className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-400 flex items-center justify-center cursor-not-allowed">Next</button>
               </div>
            </div>
          </div>
        </div>
      ) : (
        /* CREATE VIEW CARD */
         <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Title */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Campaign Title <span className="text-rose-500">*</span>
                 </label>
                 <input 
                   type="text" 
                   placeholder="e.g. Summer Discount 50%"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   className="w-full h-16 px-6 bg-slate-50 border border-transparent rounded-[24px] text-[15px] font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300"
                 />
              </div>

              {/* Link Type (Radio Buttons) */}
              <div className="space-y-4">
                 <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Redirection <span className="text-rose-500">*</span>
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
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.link_type === 'external_link' ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300'}`}>
                          {formData.link_type === 'external_link' && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                       </div>
                       <span className={`text-[14px] font-semibold transition-colors ${formData.link_type === 'external_link' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>External Link</span>
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
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.link_type === 'deep_link' ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300'}`}>
                          {formData.link_type === 'deep_link' && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                       </div>
                       <span className={`text-[14px] font-semibold transition-colors ${formData.link_type === 'deep_link' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>App Route</span>
                    </label>
                 </div>
              </div>

              {/* Status (Radio Buttons) */}
              <div className="space-y-4">
                 <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
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
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.active ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 group-hover:border-slate-400'}`}>
                          {formData.active && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                       </div>
                       <span className={`text-[14px] font-semibold transition-colors ${formData.active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>Live</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="radio" 
                         name="active" 
                         checked={!formData.active}
                         onChange={() => setFormData({...formData, active: false})}
                         className="hidden"
                       />
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!formData.active ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 group-hover:border-slate-400'}`}>
                          {!formData.active && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                       </div>
                       <span className={`text-[14px] font-semibold transition-colors ${!formData.active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>Inactive</span>
                    </label>
                 </div>
              </div>

              {/* Redirect URL */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Target Route URL <span className="text-rose-500">*</span>
                 </label>
                 <input 
                   type="text" 
                   placeholder={formData.link_type === 'external_link' ? "https://rydon24.com/offer" : "/taxi/user/activity"}
                   value={formData.redirect_url}
                   onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                   className="w-full h-16 px-6 bg-slate-50 border border-transparent rounded-[24px] text-[15px] font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300"
                 />
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-4 md:col-span-2">
                 <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Marketing Asset (Optimized WebP) <span className="text-rose-500">*</span>
                 </label>
                 
                 <div className="relative group w-full">
                    <div className={`w-full min-h-[200px] border-4 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-slate-900 bg-white' : 'border-slate-100 bg-slate-50 group-hover:bg-slate-50 group-hover:border-slate-200'}`}>
                       {imagePreview ? (
                          <div className="relative w-full h-full p-8">
                             <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-[24px] shadow-2xl" />
                             <button 
                                onClick={() => {setImagePreview(null); setFormData({...formData, image: null})}}
                                className="absolute top-10 right-10 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all"
                             >
                                <X size={20} strokeWidth={3} />
                             </button>
                          </div>
                       ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-12 text-center space-y-4">
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                             <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-slate-200 transition-transform group-hover:scale-110">
                                <Upload size={32} />
                             </div>
                             <div>
                                <p className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">Choose Marketing Asset</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Recommended: 1000x200 (WebP Enabled)</p>
                             </div>
                          </label>
                       )}
                    </div>
                 </div>
              </div>
          </div>

          <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
             <button 
               onClick={() => setView('list')}
               className="h-15 px-10 bg-slate-50 text-slate-400 rounded-[24px] text-[13px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 transition-all"
             >
                Discard
             </button>
             <button 
                onClick={handleSave}
                disabled={saving}
                className="h-15 px-20 bg-slate-900 text-white rounded-[24px] text-[13px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
             >
                {saving ? (
                   <>
                     <Loader2 className="animate-spin" size={20} />
                     Processing...
                   </>
                ) : (
                   <>Save Campaign</>
                )}
             </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
          >
             <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400">
                <div className="flex items-center gap-3">
                   <CheckCircle2 size={20} strokeWidth={3} />
                   <span className="text-[13px] font-bold tracking-tight">{toastMsg}</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BannerImage;
