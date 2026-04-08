import React, { useState, useEffect } from 'react';
import { 
  Trash2, UserX, Search, Calendar, AlertCircle, CheckCircle2, 
  XCircle, MoreHorizontal, Mail, Phone, Clock, ArrowRight, 
  ChevronRight, ChevronDown, ChevronLeft, X, FileText, RotateCcw
} from 'lucide-react';

const DeleteRequestUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeletedUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/users/deleted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data?.results || []);
      }
    } catch (err) {
      console.error('Fetch deleted users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('Are you sure you want to restore this user?')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/users/deleted/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('User restored successfully');
        fetchDeletedUsers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE? This cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/users/deleted/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('User deleted permanently');
        fetchDeletedUsers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(r => r._id));
    }
  };

  const toggleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rid => rid !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
      'In Review': 'bg-blue-50 text-blue-600 border-blue-100',
      'Approved': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 w-fit ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Pending' ? 'bg-amber-500' : status === 'In Review' ? 'bg-blue-500' : status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        {status}
      </span>
    );
  };

   const filteredUsers = users.filter(user => {
      const name = user.name || user.user_id?.name || 'Unknown';
      const email = user.email || user.user_id?.email || 'N/A';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
   });

   if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
          <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Fetching Deletion Queue...</p>
        </div>
      );
   }

   return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 relative text-gray-950 font-sans">
      {/* MATE STYLE HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Delete Queue</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950">Safety</span>
               <ChevronRight size={14} />
               <span>User Deletion Queue</span>
            </div>
         </div>
      </div>

      {/* FILTER BAR - MATE STYLE */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1 bg-black text-white text-[12px] font-bold rounded-lg cursor-pointer">Managed Users</div>
         </div>
         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
               type="text" 
               placeholder="Search deleted users..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-gray-100 outline-none transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
         {/* TABLE CONTAINER */}
         <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-visible">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                           <th className="px-6 py-5">
                              <div 
                                onClick={toggleSelectAll}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${selectedRows.length === users.length && users.length > 0 ? 'bg-black border-black text-white' : 'border-gray-200 hover:border-gray-300'}`}
                              >
                                 {selectedRows.length === users.length && users.length > 0 && <CheckCircle2 size={12} />}
                              </div>
                           </th>
                           <th className="px-4 py-5 font-bold">User</th>
                           <th className="px-4 py-5 font-bold">Status</th>
                           <th className="px-4 py-5 font-bold">Deleted Date</th>
                           <th className="px-6 py-5 text-right font-bold">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50 text-[10px]">No users found in deletion queue</td>
                           </tr>
                        ) : (
                           filteredUsers.map((user) => (
                              <tr key={user._id} className={`group hover:bg-gray-50/50 transition-all ${selectedRows.includes(user._id) ? 'bg-gray-50/80 shadow-inner' : ''}`}>
                                 <td className="px-6 py-4">
                                    <div 
                                      onClick={(e) => { e.stopPropagation(); toggleRowSelect(user._id); }}
                                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${selectedRows.includes(user._id) ? 'bg-black border-black text-white' : 'border-gray-100 group-hover:border-gray-300'}`}
                                    >
                                       {selectedRows.includes(user._id) && <CheckCircle2 size={12} />}
                                    </div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-[13px] flex items-center justify-center shadow-sm">
                                          {(user.name || user.user_id?.name || 'U')[0]}
                                       </div>
                                       <div>
                                          <p className="text-[14px] font-bold text-gray-900 tracking-tight leading-none">{user.name || user.user_id?.name || 'Unknown'}</p>
                                          <p className="text-[12px] text-gray-400 mt-1 font-medium">{user.email || user.user_id?.email || 'N/A'}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 italic">Deleted</span>
                                 </td>
                                 <td className="px-4 py-4">
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">{user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'Unknown'}</p>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 relative">
                                       <button 
                                         disabled={isSubmitting}
                                         onClick={() => handleRestore(user._id)}
                                         title="Restore User"
                                         className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                       >
                                          <RotateCcw size={18} />
                                       </button>
                                       <button 
                                         disabled={isSubmitting}
                                         onClick={() => handlePermanentDelete(user._id)}
                                         title="Permanent Delete"
                                         className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
            </div>
         </div>

         {/* RIGHT SIDE STATS - MATE STYLE */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
               <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6">Request Statistics</h4>
               
               <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="180" className="text-rose-500" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-black text-gray-950 leading-none">52%</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Pending</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-[12px] font-bold text-gray-500">New requests</span>
                     </div>
                     <span className="text-[12px] font-black text-gray-950">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[12px] font-bold text-gray-500">In review</span>
                     </div>
                     <span className="text-[12px] font-black text-gray-950">28</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[12px] font-bold text-gray-500">Approved</span>
                     </div>
                     <span className="text-[12px] font-black text-gray-950">152</span>
                  </div>
               </div>

               <div className="mt-8">
                  <p className="text-xl font-black text-gray-950">14 Hours</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">Avg Response Time</p>
               </div>
            </div>

            <div className="bg-rose-50 p-8 rounded-[32px] border border-rose-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-20 text-rose-500"><Trash2 size={100} strokeWidth={1} /></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4"><AlertCircle size={28} /></div>
                  <h4 className="text-[14px] font-black text-gray-900 uppercase tracking-widest mb-2">Legal Compliance</h4>
                  <p className="text-[12px] font-bold text-gray-500 leading-relaxed">Account deletion is permanent. PII masking will occur after 30 days of approval.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DeleteRequestUsers;
