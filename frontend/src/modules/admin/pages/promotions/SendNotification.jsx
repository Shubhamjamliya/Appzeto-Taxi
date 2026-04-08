import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SendNotification = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [notifications, setNotifications] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    service_location_id: '',
    send_to: '',
    push_title: '',
    message: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem('adminToken') || '';
  const baseUrl = 'https://taxi-a276.onrender.com/api/v1/admin';
  const dashboardUrl = 'https://taxi-a276.onrender.com/api/v1/admin/dashboard';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Notifications
      // Based on common backend patterns and user feedback, using /notifications instead of /dashboard/push-notifications
      const notiRes = await fetch(`${baseUrl}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notiRes.ok) {
        const notiData = await notiRes.json();
        if (notiData.success) {
          setNotifications(Array.isArray(notiData.data) ? notiData.data : (notiData.data?.results || []));
        }
      } else if (notiRes.status === 501 || notiRes.status === 404) {
        // Try fallback to just 'push-notifications' if 'notifications' fails
        const fallbackRes = await fetch(`${baseUrl}/push-notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fallbackRes.ok) {
           const fallbackData = await fallbackRes.json();
           if (fallbackData.success) {
             setNotifications(Array.isArray(fallbackData.data) ? fallbackData.data : (fallbackData.data?.results || []));
             return;
           }
        }
        console.warn("Notifications List API not implemented yet at root or dashboard");
        setNotifications([]);
      }

      // Fetch Service Locations
      const slRes = await fetch(`${baseUrl}/service-locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (slRes.ok) {
        const slData = await slRes.json();
        if (slData.success) {
          setServiceLocations(Array.isArray(slData.data) ? slData.data : (slData.data?.results || []));
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setNotifications([]);
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
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.service_location_id || !formData.send_to || !formData.push_title || !formData.message) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      let imageData = null;
      if (formData.image) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(formData.image);
        });
      }

      const payload = {
        service_location_id: formData.service_location_id,
        send_to: formData.send_to,
        title: formData.push_title, // Use 'title' which is more standard
        message: formData.message,
        image: imageData
      };

      // Use the endpoint defined in adminService
      const res = await fetch(`${baseUrl}/notifications/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (data.success) {
        setToastMsg("Notification sent successfully");
        setShowToast(true);
        setView('list');
        fetchData();
        setFormData({ service_location_id: '', send_to: '', push_title: '', message: '', image: null });
        setImagePreview(null);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // Fallback to /notifications without /send if needed, but keeping JSON
        const fallbackRes = await fetch(`${baseUrl}/notifications`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) {
           setToastMsg("Notification sent successfully");
           setShowToast(true);
           setView('list');
           fetchData();
           setFormData({ service_location_id: '', send_to: '', push_title: '', message: '', image: null });
           setImagePreview(null);
           setTimeout(() => setShowToast(false), 3000);
        } else {
          alert(fallbackData.message || data.message || "Failed to send notification");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      // First try root notifications
      let res = await fetch(`${baseUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
         // Try path with push-notifications
         res = await fetch(`${baseUrl}/push-notifications/${id}`, {
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${token}` }
         });
      }

      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
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
            {view === 'list' ? 'SEND NOTIFICATIONS' : 'CREATE'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
             <span>Send Notifications</span>
             <ChevronRight size={12} className="opacity-50" />
             <span className="text-gray-900 font-black">{view === 'list' ? 'Send Notifications' : 'Create'}</span>
          </div>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="bg-[#2D3A6E] text-white h-12 px-6 rounded-xl flex items-center gap-2 text-[13px] font-black uppercase tracking-tight hover:bg-[#1a234a] transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Send Push Notifications
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {/* LIST VIEW CARD */}
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
              <div>Push Title</div>
              <div>Message</div>
              <div className="text-center">User Type</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Body */}
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 items-center py-6 px-10 text-[14px] font-bold text-gray-900 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#2D3A6E]">
                        <Bell size={18} />
                      </div>
                      <span className="truncate">{item.push_title}</span>
                    </div>
                    <div className="text-gray-500 font-medium truncate max-w-md">{item.message}</div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[11px] uppercase tracking-wider text-gray-600">
                        {item.send_to || 'All'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleDelete(item.id)}
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
                <div className="w-24 h-24 bg-indigo-50/50 rounded-full flex items-center justify-center relative">
                    <Search className="text-indigo-400 absolute opacity-20" size={80} strokeWidth={1} />
                    <div className="w-16 h-20 bg-white border-2 border-indigo-100 rounded-lg relative flex flex-col p-3 overflow-hidden shadow-sm">
                       <div className="w-full h-1 bg-indigo-100 rounded-full mb-1" />
                       <div className="w-full h-1 bg-indigo-50 rounded-full mb-1" />
                       <div className="w-2/3 h-1 bg-indigo-50 rounded-full mb-3" />
                       <Search className="text-[#2D3A6E] mt-auto self-center" size={24} strokeWidth={3} />
                    </div>
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] font-black text-gray-950 uppercase tracking-tight italic">No Data Found</h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1 max-w-xs uppercase leading-tight tracking-wider opacity-60">Looks like you haven't sent any notifications yet.</p>
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
             {/* Service Location */}
             <div className="space-y-4">
                <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                   Service Location <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.service_location_id}
                  onChange={(e) => setFormData({...formData, service_location_id: e.target.value})}
                  className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                >
                   <option value="">Select Service Location</option>
                    {serviceLocations.map((loc) => (
                       <option key={loc._id || loc.id} value={loc._id || loc.id}>
                         {loc.service_location_name || loc.name}
                       </option>
                    ))}
                </select>
             </div>

             {/* Send To */}
             <div className="space-y-4">
                <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                   Send To <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.send_to}
                  onChange={(e) => setFormData({...formData, send_to: e.target.value})}
                  className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                >
                   <option value="">Select</option>
                   <option value="all">All</option>
                   <option value="drivers">Drivers</option>
                   <option value="users">Users</option>
                </select>
             </div>

             {/* Push Title */}
             <div className="space-y-4 md:col-span-2">
                <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                   Push Title <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Push Title"
                  value={formData.push_title}
                  onChange={(e) => setFormData({...formData, push_title: e.target.value})}
                  className="w-full h-16 px-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner placeholder:text-gray-300"
                />
             </div>

             {/* Message */}
             <div className="space-y-4 md:col-span-2">
                <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                   Message <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows="4"
                  placeholder="Enter Message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full p-6 bg-gray-50/50 border border-transparent rounded-3xl text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner placeholder:text-gray-300 resize-none"
                />
             </div>

             {/* Notification Banner */}
             <div className="space-y-4 md:col-span-2">
                <label className="text-[12px] font-black text-gray-950 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                   Notification Banner(320px x 320px)
                </label>
                <div className="relative group">
                   <div className={`w-64 h-64 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-[#2D3A6E] bg-white' : 'border-gray-200 bg-gray-50 group-hover:bg-gray-100 group-hover:border-gray-300'}`}>
                      {imagePreview ? (
                         <div className="relative w-full h-full p-2">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[24px]" />
                            <button 
                              onClick={() => {setImagePreview(null); setFormData({...formData, image: null})}}
                              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                            >
                               <X size={18} strokeWidth={3} />
                            </button>
                         </div>
                      ) : (
                         <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center space-y-4">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-gray-300 transition-transform group-hover:scale-110">
                               <ImageIcon size={32} />
                            </div>
                            <div>
                               <p className="text-[14px] font-black text-gray-950 uppercase tracking-tight">Upload Image</p>
                               <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">Square image recommended (Max 2MB)</p>
                            </div>
                         </label>
                      )}
                   </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
             <button 
               onClick={() => setView('list')}
               className="h-16 px-10 bg-gray-100 text-gray-500 rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-lg shadow-gray-200/20 active:scale-95"
             >
                Cancel
             </button>
             <button 
                onClick={handleSave}
                disabled={saving}
                className="h-16 px-16 bg-[#2D3A6E] text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#1a234a] transition-all shadow-2xl shadow-indigo-900/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
             >
                {saving ? (
                   <>
                     <Loader2 className="animate-spin" size={20} />
                     Sending...
                   </>
                ) : (
                   <>
                     <Upload size={18} strokeWidth={3} />
                     Save Notification
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

export default SendNotification;
