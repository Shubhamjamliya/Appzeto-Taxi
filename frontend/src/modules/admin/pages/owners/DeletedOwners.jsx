import React, { useState, useEffect } from 'react';
import { 
  Trash2, UserX, Search, Calendar, AlertCircle, CheckCircle2, 
  XCircle, MoreHorizontal, Mail, Phone, Clock, ArrowRight, 
  ChevronRight, ChevronDown, ChevronLeft, X, FileText, RotateCcw,
  Loader2, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DeletedOwners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeletedOwners = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // following the established pattern: /api/v1/admin/owners/deleted
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/owners/deleted?limit=${itemsPerPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOwners(data.data?.results || []);
      }
    } catch (err) {
      console.error('Fetch deleted owners error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedOwners();
  }, [itemsPerPage]);

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this owner account?')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/owners/deleted/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Owner restored successfully');
        fetchDeletedOwners();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE? This cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/owners/deleted/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Owner deleted permanently');
        fetchDeletedOwners();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filteredOwners = owners.filter(owner => {
    const name = owner.name || owner.user_id?.name || 'Unknown';
    const email = owner.email || owner.user_id?.email || 'N/A';
    const mobile = owner.mobile || owner.user_id?.mobile || 'N/A';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mobile.includes(searchTerm);
  });

  return (
    <div className="space-y-6 p-1 animate-in fade-in duration-700 font-sans text-gray-950 pb-20">
      {/* SCREEN HEADER - MATCHING SCREENSHOT 100% */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-black text-[#2D3A6E] uppercase tracking-tight">Manage Deleted Owners</h1>
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
           <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => navigate('/admin/owners')}>Manage Owners</span>
           <ChevronRight size={14} className="opacity-50" />
           <span className="text-gray-900">Manage Deleted Owners</span>
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden border-b-8 border-b-indigo-50/20">
        {/* TOOLBAR */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
           <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
              show 
              <div className="relative group mx-2">
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="bg-white border border-gray-100 rounded-xl px-5 py-2 text-gray-900 font-black outline-none appearance-none transition-all shadow-sm pr-10 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={14} />
              </div>
              entries
           </div>
           
           <div className="relative group w-full max-w-md ml-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#2D3A6E] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search archived owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-gray-50/50 border border-transparent rounded-[20px] text-[14px] font-bold outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
              />
           </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto no-scrollbar min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 uppercase tracking-[0.15em] text-[11px] font-black text-gray-400 italic">
                <th className="px-10 py-7">Name</th>
                <th className="px-10 py-7">Email</th>
                <th className="px-10 py-7">Mobile Number</th>
                <th className="px-10 py-7 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#2D3A6E] opacity-20" size={48} />
                  </td>
                </tr>
              ) : filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-32 text-center text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                       <FileText size={80} strokeWidth={1} />
                       <p className="text-[14px] font-black uppercase tracking-widest text-[#2D3A6E]">No Data Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => {
                  const name = owner.name || owner.user_id?.name || 'Unknown';
                  const email = owner.email || owner.user_id?.email || 'N/A';
                  const mobile = owner.mobile || owner.user_id?.mobile || 'N/A';
                  return (
                    <tr key={owner._id} className="group hover:bg-indigo-50/5 transition-colors">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[#2D3A6E] text-white flex items-center justify-center font-black text-[12px] shadow-lg group-hover:scale-110 transition-transform">
                              {name[0].toUpperCase()}
                           </div>
                           <span className="text-[14px] font-black text-gray-900 uppercase tracking-tight">{name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                         <span className="text-[13px] font-bold text-gray-400 lowercase">{email}</span>
                      </td>
                      <td className="px-10 py-7">
                         <span className="text-[14px] font-black text-gray-900 tracking-tight">{mobile}</span>
                      </td>
                      <td className="px-10 py-7 text-right">
                         <div className="flex items-center justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <button 
                              onClick={() => handleRestore(owner._id)}
                              disabled={isSubmitting}
                              className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 flex items-center gap-2"
                            >
                               <RotateCcw size={14} /> Restore
                            </button>
                            <button 
                              onClick={() => handlePermanentDelete(owner._id)}
                              disabled={isSubmitting}
                              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-rose-600 hover:bg-rose-50/30 transition-all shadow-sm"
                              title="Purge Record"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION - MATCHING SCREENSHOT STYLE */}
        <div className="p-10 bg-gray-50/20 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Showing 0 to 0 of 0 entries</span>
           <div className="flex items-center gap-1.5 leading-none">
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>Prev</button>
              <button className="w-10 h-10 bg-[#2D3A6E] text-white rounded-xl text-[13px] font-black shadow-xl shadow-indigo-200 ring-4 ring-indigo-50/30">1</button>
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>Next</button>
           </div>
        </div>
      </div>

      {/* COMPLIANCE FOOTER */}
      <div className="bg-[#0F172A] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 translate-x-4">
            <Shield size={120} strokeWidth={1} />
         </div>
         <div className="relative z-10 max-w-3xl flex items-start gap-8">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-rose-400 border border-white/10 shrink-0">
               <AlertCircle size={32} />
            </div>
            <div>
               <h4 className="text-[14px] font-black uppercase tracking-[0.2em] mb-3 text-rose-400 italic leading-none">Safety Archive Lockdown</h4>
               <p className="text-[12px] font-bold text-gray-400 leading-relaxed italic">
                  Deleting an owner record from this archive is a final, destructive action. All associated PII, fleet history, and sensitive logs will be scrubbed from the active mirrors according to GDPR compliance standards. Use "Restore" to reactivate the account without data loss.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const Shield = ({ size, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default DeletedOwners;
