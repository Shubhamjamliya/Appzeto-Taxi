import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  FileText,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WithdrawalRequestOwners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        // pattern follows the driver module: /api/v1/admin/wallet/drivers/withdrawals
        const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/wallet/owners/withdrawals?limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const mapped = (data.data?.results || []).map(r => ({
            id: r.owner_id || r._id,
            date: new Date(r.last_request_at || r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            name: r.owner?.name || 'Unknown Owner',
            phone: r.owner?.mobile || 'N/A',
            amount: `INR ${r.amount || 0}`,
            status: r.status || 'pending'
          }));
          setRequests(mapped);
          setPagination(data.data?.paginator);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWithdrawals();
  }, [itemsPerPage]);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  useEffect(() => {
    const handleClose = () => setActiveMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'requested':
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'processed':
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-transparent p-1 font-sans text-gray-950">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <h1 className="text-[17px] font-black tracking-tight text-gray-900 uppercase italic">Withdrawal Request Owners</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate('/admin/owners/dashboard')}>Owner Management</span>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-gray-900 font-black">Settlement Audit</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR & TABLE CARD */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-20 border-b-8 border-b-indigo-50/20">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
              show 
              <div className="relative group">
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="bg-white border border-gray-100 rounded-xl px-5 py-2 text-gray-900 font-black outline-none appearance-none transition-all shadow-sm pr-10 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              entries
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 h-14 pl-14 pr-6 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner shadow-gray-50/50"
              />
            </div>
            <button className="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                <Filter size={20} />
            </button>
            <button className="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Date</th>
                <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Name</th>
                <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Requested Amount</th>
                <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Status</th>
                <th className="px-10 py-7 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Loader2 className="animate-spin text-indigo-950" size={48} strokeWidth={3} />
                      <p className="text-[12px] font-black uppercase tracking-[0.4em]">Compiling Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                        <FileText size={48} className="text-gray-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-900 italic underline decoration-indigo-200 decoration-4">No Data Found</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase italic">The vault is currently balanced</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600">
                    <td className="px-10 py-7 whitespace-nowrap">
                       <span className="text-[13px] font-black text-gray-900 italic uppercase">{req.date}</span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                           <User size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-[15px] font-black text-gray-950 uppercase">{req.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{req.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-[16px] font-black text-gray-950 italic tracking-tight">{req.amount}</span>
                    </td>
                    <td className="px-10 py-7 text-center">
                       <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm ${getStatusStyle(req.status)}`}>
                          {req.status}
                       </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                       <div className="relative inline-block text-left">
                          <button 
                            onClick={(e) => toggleMenu(e, req.id)}
                            className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-950 hover:border-gray-200 transition-all shadow-sm active:scale-90"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenu === req.id && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-56 bg-white rounded-[28px] shadow-2xl border border-gray-100 p-2.5 z-[100] backdrop-blur-xl ring-8 ring-black/5"
                              >
                                <button
                                  onClick={() => navigate(`/admin/owners/wallet/withdrawals/${req.id}`)}
                                  className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-black text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all uppercase tracking-[0.2em]"
                                >
                                  Review Account <Eye size={16} />
                                </button>
                                <button
                                  className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-black text-emerald-500 hover:bg-emerald-50/50 rounded-2xl transition-all uppercase tracking-[0.2em]"
                                >
                                  Process Bank <CheckCircle2 size={16} />
                                </button>
                                <button
                                  className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50/50 rounded-2xl transition-all uppercase tracking-[0.2em]"
                                >
                                  Decline Payment <XCircle size={16} />
                                </button>
                              </motion.div>
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

        <div className="p-10 bg-gray-50/30 border-t border-gray-50/50 flex items-center justify-between">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Audit Trail: {filteredRequests.length} Transactions</span>
           <div className="flex items-center gap-1.5">
              <button className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm">Prev</button>
              <button className="h-12 w-12 bg-[#2D3A6E] text-white rounded-2xl text-[14px] font-black shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">1</button>
              <button className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequestOwners;
