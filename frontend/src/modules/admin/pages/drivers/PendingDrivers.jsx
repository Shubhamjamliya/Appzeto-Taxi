import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Download,
  Filter,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  FileText,
  AlertCircle,
  Star,
  ChevronDown,
  Trash2,
  Check,
  Edit2,
  Key,
  Lock,
  ShieldCheck,
  Loader2,
  MoreVertical,
  Plus,
  List,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PendingDrivers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, driverId: null, password: '', isSubmitting: false });

  const providedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInR5cCI6InN1cGVyLWFkbWluIiwiaWF0IjoxNzc1MDQ5MTE3LCJleHAiOjE4MDY1ODUxMTd9.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
  const storedToken = localStorage.getItem('adminToken');
  const token = (storedToken && storedToken !== 'undefined' && storedToken !== 'null') ? storedToken : providedToken;

  const handleAction = async (action, driverId) => {
    const confirmMsg = action === 'delete' ? 'Are you sure you want to delete this pending request?' : 'Are you sure you want to APPROVE this driver?';
    if (action !== 'view' && action !== 'edit' && action !== 'password' && !window.confirm(confirmMsg)) return;

    if (action === 'view') {
      navigate(`/admin/drivers/${driverId}`);
      return;
    }
    if (action === 'edit') {
      navigate(`/admin/drivers/edit/${driverId}`);
      return;
    }

    try {
      if (action === 'password') {
        setPasswordModal(prev => ({ ...prev, isSubmitting: true }));
      }

      const url = action === 'delete' 
        ? `https://taxi-a276.onrender.com/api/v1/admin/drivers/${driverId}`
        : action === 'password'
          ? `https://taxi-a276.onrender.com/api/v1/admin/drivers/update-password/${driverId}`
          : `https://taxi-a276.onrender.com/api/v1/admin/drivers/${driverId}`;
      
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      let bodyData = null;
      if (action === 'approve') {
        bodyData = { approve: true, active: true };
      } else if (action === 'password') {
        bodyData = { password: passwordModal.password };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: bodyData ? JSON.stringify(bodyData) : null
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} successful`);
        if (action === 'delete' || action === 'approve') {
          setPendingDrivers(prev => prev.filter(d => d.id !== driverId));
        }
        if (action === 'password') {
          setPasswordModal({ isOpen: false, driverId: null, password: '', isSubmitting: false });
        }
      } else {
        alert(data.message || `Failed to ${action}`);
        if (action === 'password') setPasswordModal(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (err) {
      alert(`Network error during ${action}`);
      if (action === 'password') setPasswordModal(prev => ({ ...prev, isSubmitting: false }));
    } finally {
      setActiveMenu(null);
    }
  };

  const fetchPendingDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://taxi-a276.onrender.com/api/v1/admin/drivers?page=1&limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseData = await response.json();
      if (response.ok && responseData.success) {
        const driversList = responseData.data?.results || [];
        const pending = driversList.filter(d => d.approve === false).map(d => ({
          id: d._id,
          name: d.name || d.user_id?.name || 'Unknown',
          location: d.service_location?.service_location_name || d.city || 'India',
          email: d.email || d.user_id?.email || 'N/A',
          phone: d.mobile || d.user_id?.mobile || 'N/A',
          transport: d.transport_type || 'N/A',
          docs: 'View Docs',
          status: 'DISAPPROVED',
          reason: d.rejectionReason || '-',
          rating: d.rating || 0.0,
          registeredAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'
        }));
        
        setPendingDrivers(pending);
      } else {
        setError(responseData.message || 'Failed to fetch pending drivers');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const filteredDrivers = pendingDrivers.filter(driver => 
    (driver.name && driver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (driver.phone && driver.phone.includes(searchTerm)) ||
    (driver.location && driver.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent p-1 font-sans text-gray-950 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 px-1">
         <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">Pending Drivers</h1>
         </motion.div>
         <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer text-gray-400">Drivers</span>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-gray-950 font-black">Pending Drivers</span>
         </motion.div>
      </div>

      {/* CONTROLS */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6"
      >
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center shadow-lg"><List size={18} /></button>
              <button className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-all"><LayoutGrid size={18} /></button>
              <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 ml-4 uppercase tracking-[0.2em]">
                 show 
                 <select 
                   value={itemsPerPage}
                   onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                   className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 outline-none font-black text-gray-900 shadow-sm mx-2 appearance-none cursor-pointer"
                 >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                 </select>
                 entries
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative group">
                 <input type="text" placeholder="Search drivers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold outline-none focus:bg-white transition-all w-64" />
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-lg uppercase tracking-widest">
                 <Filter size={16} /> Filters
              </button>
              <button onClick={() => navigate('/admin/drivers/create')} className="bg-[#2D3A6E] text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 shadow-xl uppercase tracking-widest hover:bg-black transition-colors">
                 <Plus size={20} /> Add Fleet Drivers
              </button>
           </div>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                <th className="px-8 py-6">Service Locations</th>
                <th className="px-6 py-6">Email</th>
                <th className="px-6 py-6 font-medium">Mobile Number</th>
                <th className="px-6 py-6">Transport Type</th>
                <th className="px-6 py-6 text-center">Document View</th>
                <th className="px-6 py-6 text-center">Approved Status</th>
                <th className="px-6 py-6 text-center">Declined Reason</th>
                <th className="px-6 py-6 text-center">Rating</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px] font-bold text-gray-600">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-8 py-20 text-center opacity-40">Compiling Driver Dossiers...</td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-8 py-24 text-center opacity-20 uppercase font-black tracking-widest text-[14px]">No Pending Applications</td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-indigo-50/30 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600 group">
                    <td className="px-8 py-6 text-gray-950 capitalize">{driver.location}</td>
                    <td className="px-6 py-6 font-medium lowercase overflow-hidden text-ellipsis max-w-[150px]">{driver.email}</td>
                    <td className="px-6 py-6 font-black text-gray-800">{driver.phone}</td>
                    <td className="px-6 py-6 uppercase tracking-wider">{driver.transport}</td>
                    <td className="px-6 py-6 text-center">
                       <button onClick={() => navigate(`/admin/drivers/audit/${driver.id}`)} className="w-10 h-10 m-auto bg-white border border-gray-100 text-[#2D3A6E] rounded-xl flex items-center justify-center hover:bg-indigo-950 hover:text-white transition-all shadow-sm">
                          <FileText size={18} />
                       </button>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <span className="bg-rose-500 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                          {driver.status}
                       </span>
                    </td>
                    <td className="px-6 py-6 text-center italic text-gray-400">{driver.reason}</td>
                    <td className="px-6 py-6 text-center text-gray-200">
                        <div className="flex items-center justify-center gap-0.5">
                           {[1,2,3,4,5].map(i => <Star key={i} size={12} strokeWidth={2.5} />)}
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="relative inline-block">
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setActiveMenu(activeMenu === driver.id ? null : driver.id);
                            }}
                            className="w-10 h-10 ml-auto bg-[#E8F1FF] text-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm"
                          >
                             <MoreVertical size={20} />
                          </button>

                          <AnimatePresence>
                            {activeMenu === driver.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                  className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 min-w-[180px] text-left"
                                >
                                   <button onClick={() => handleAction('approve', driver.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors text-[12px] font-black uppercase tracking-widest">
                                      <CheckCircle2 size={16} /> Approve
                                   </button>
                                   <button onClick={() => handleAction('edit', driver.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-amber-500 rounded-xl transition-colors text-[12px] font-black uppercase tracking-widest">
                                      <Edit2 size={16} /> Edit
                                   </button>
                                   <button 
                                      onClick={() => {
                                        setActiveMenu(null);
                                        setPasswordModal({ isOpen: true, driverId: driver.id, password: '', isSubmitting: false });
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors text-[12px] font-black uppercase tracking-widest"
                                   >
                                      <Key size={16} /> Password
                                   </button>
                                   <button onClick={() => handleAction('view', driver.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors text-[12px] font-black uppercase tracking-widest">
                                      <Eye size={16} /> View Profile
                                   </button>
                                   <div className="h-px bg-gray-50 my-1 mx-2" />
                                   <button onClick={() => handleAction('delete', driver.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors text-[12px] font-black uppercase tracking-widest">
                                      <Trash2 size={16} /> Delete
                                   </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-8 flex items-center justify-between bg-gray-50/50 border-t border-gray-50">
           <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Showing 1 to {filteredDrivers.length} of {filteredDrivers.length} entries</span>
           <div className="flex items-center gap-1.5">
              <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Prev</button>
              <button className="w-10 h-10 rounded-xl bg-indigo-950 text-white text-[13px] font-black shadow-xl shadow-indigo-100">1</button>
              <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Next</button>
           </div>
        </div>
      </motion.div>

      {/* OPERATIONAL INTEGRITY */}
      {isLoading === false && (
        <div className="mt-8 bg-[#2D3A6E] rounded-[32px] p-8 text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-8 group-hover:scale-110 transition-transform duration-700">
              <UserCheck size={140} strokeWidth={1} />
           </div>
           <div className="relative z-10 max-w-xl">
              <h4 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">Operational Integrity</h4>
              <p className="text-[13px] font-bold text-gray-200 leading-relaxed italic opacity-80">
                 "Reviewing documents and approval status ensures fleet safety. Please verify all documents before granting access to live passenger requests."
              </p>
           </div>
           <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
      )}

      {/* PASSWORD MODAL */}
      <AnimatePresence>
        {passwordModal.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 p-8 space-y-6"
             >
                <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight">Security Update</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Driver Password</p>
                   </div>
                   <button onClick={() => setPasswordModal({ isOpen: false, driverId: null, password: '', isSubmitting: false })} className="text-gray-400 hover:text-gray-900 transition-colors">
                      <XCircle size={24} />
                   </button>
                </div>
                <div className="space-y-4">
                   <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                         <Lock size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="New password"
                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-inner"
                        value={passwordModal.password}
                        onChange={(e) => setPasswordModal(prev => ({ ...prev, password: e.target.value }))}
                      />
                   </div>
                </div>
                <button 
                  onClick={() => handleAction('password', passwordModal.driverId)}
                  disabled={passwordModal.isSubmitting || !passwordModal.password}
                  className="w-full py-4 bg-gray-950 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all shadow-xl disabled:opacity-50"
                >
                  {passwordModal.isSubmitting ? 'Updating...' : 'COMMIT NEW PASSWORD'}
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PendingDrivers;
