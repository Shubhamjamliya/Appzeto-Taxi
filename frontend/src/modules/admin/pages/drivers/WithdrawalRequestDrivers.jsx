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
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WithdrawalRequestDrivers = () => {
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
        const token = localStorage.getItem('adminToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTc3NTA0OTExNywiZXhwIjoxODA2NTg1MTE3fQ.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
        const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/wallet/drivers/withdrawals?limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const mapped = (data.data?.results || []).map(r => ({
            id: r.driver_id,
            date: new Date(r.last_request_at).toLocaleDateString('en-GB', { day: 'j', month: 'short', hour: '2-digit', minute: '2-digit' }),
            name: r.driver?.name || 'Unknown',
            phone: r.driver?.mobile || 'N/A',
            amount: `${r.pending_count} Pending`,
            status: r.pending_count > 0 ? 'requested' : 'processed'
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

  useEffect(() => {
    const handleClose = () => setActiveMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none uppercase tracking-tighter">Withdrawal Request Drivers</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none">Wallet Mgmt</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Withdrawal Requests</span>
            </div>
         </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-gray-400">
            show 
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-950 font-black focus:outline-none focus:border-indigo-200 transition-all cursor-pointer shadow-inner"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Search by name or phone..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[20px] text-[13px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6 w-48">Date</th>
                <th className="px-4 py-6 w-56">Name</th>
                <th className="px-4 py-6 w-44">Mobile Number</th>
                <th className="px-4 py-6 w-44">Requested Amount</th>
                <th className="px-4 py-6 text-center w-36">Status</th>
                <th className="px-8 py-6 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-8 py-20 text-center opacity-30">
                      <div className="flex flex-col items-center gap-4">
                         <AlertCircle size={48} strokeWidth={1} />
                         <p className="text-[14px] font-bold uppercase tracking-widest text-gray-950">No Requests Found</p>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                    <td className="px-8 py-6">
                       <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tight">{req.date}</span>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-indigo-600 text-[12px] shadow-inner group-hover:scale-110 transition-transform">
                            {req.name.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <p className="text-[14px] font-black text-gray-950 tracking-tight leading-none uppercase truncate">{req.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                       <p className="text-[14px] font-black text-gray-950 tracking-tight">{req.phone}</p>
                    </td>
                    <td className="px-4 py-6">
                       <span className="text-[14px] font-black text-indigo-600 tracking-tight">{req.amount} Request</span>
                    </td>
                    <td className="px-4 py-6 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-current opacity-70 ${
                         req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                         req.status === 'Declined' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                         {req.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="relative">
                          <button 
                            onClick={(e) => toggleMenu(e, req.id)}
                            className="p-2.5 text-gray-400 hover:text-gray-950 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-50"
                          >
                             <MoreHorizontal size={18} />
                          </button>
                          {activeMenu === req.id && (
                             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                  onClick={() => navigate(`/admin/drivers/wallet/withdrawals/${req.id}`)}
                                  className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                   <Eye size={16} className="text-indigo-500" /> View Details
                                </button>
                                <button className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                   <CheckCircle2 size={16} className="text-emerald-500" /> Approve Payout
                                </button>
                                <button className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                   <XCircle size={16} className="text-rose-500" /> Decline Payout
                                </button>
                             </div>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between p-2">
         <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">
            Showing <span className="text-gray-950 not-italic">1</span> to <span className="text-gray-950 not-italic">{filteredRequests.length}</span> of <span className="text-gray-950 not-italic">{filteredRequests.length}</span> entries
         </p>
         <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-100 rounded-xl text-[11px] font-black text-gray-400 hover:text-gray-950 transition-all uppercase tracking-widest disabled:opacity-30" disabled>
               Prev
            </button>
            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-indigo-100">1</button>
            <button className="px-4 py-2 border border-gray-100 rounded-xl text-[11px] font-black text-gray-400 hover:text-gray-950 transition-all uppercase tracking-widest disabled:opacity-30" disabled>
               Next
            </button>
         </div>
      </div>
    </div>
  );
};

export default WithdrawalRequestDrivers;
