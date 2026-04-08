import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Phone, 
  CreditCard, 
  Calendar,
  AlertCircle,
  FileText,
  ShieldCheck,
  Building,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Search,
  Loader2,
  Wallet
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const WithdrawalRequestOwnerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMenu = (e, idx) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === idx ? null : idx);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        // following driver pattern: /api/v1/admin/wallet/drivers/${id}/withdrawals
        const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/wallet/owners/${id}/withdrawals?limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOwner(data.data?.owner);
          const mapped = (data.data?.results || []).map(r => ({
            id: r._id,
            date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(r.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            name: data.data?.owner?.name || 'Unknown',
            phone: data.data?.owner?.mobile || 'N/A',
            amount: `${r.requested_currency || 'INR'} ${r.amount}`,
            status: r.status
          }));
          setHistory(mapped);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, itemsPerPage]);

  useEffect(() => {
    const handleClose = () => setActiveMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/owners/wallet/withdrawals')}
            className="p-4 bg-white border border-gray-100 rounded-[20px] hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">Audit Ledger</h1>
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
               <span>Owner Wallet</span>
               <ChevronRight size={10} className="opacity-50" />
               <span className="text-gray-900">Withdrawal Transactions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
         {/* LEFT COLUMN: Owner Info & Balance */}
         <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-5">
            <div className="bg-[#2D3A6E] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform">
                  <Wallet size={120} strokeWidth={1} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                        <User size={32} strokeWidth={2.5} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase">Owner Profile</p>
                        <h2 className="text-xl font-black uppercase tracking-tight">{owner?.name || 'Loading...'}</h2>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 italic">Account Balance</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-[14px] font-black text-white/60">INR</span>
                           <h3 className="text-6xl font-black tracking-tighter">
                              {owner?.wallet_balance || '0.00'}
                           </h3>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                           <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Total Earned</p>
                           <p className="text-[16px] font-black italic">₹{owner?.total_earned || '0'}</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 text-emerald-300">
                           <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Paid Out</p>
                           <p className="text-[16px] font-black italic">₹{owner?.total_withdrawn || '0'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                <h4 className="text-[12px] font-black text-gray-950 uppercase tracking-widest border-b border-gray-50 pb-4 italic">Verification Status</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" size={18} />
                            <span className="text-[11px] font-black uppercase text-gray-500">Identity Docs</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Building className="text-indigo-500" size={18} />
                            <span className="text-[11px] font-black uppercase text-gray-500">Fleet Active</span>
                        </div>
                        <span className="text-[10px] font-black text-[#2D3A6E] bg-indigo-50 px-3 py-1 rounded-full uppercase italic">7 Vehicles</span>
                    </div>
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Transaction History */}
         <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden border-b-8 border-b-indigo-50/20">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
                  <h4 className="text-[14px] font-black text-gray-950 uppercase tracking-[0.2em] italic underline decoration-indigo-200 decoration-4">Transaction Vault</h4>
                  <div className="flex items-center gap-2">
                      <Search className="text-gray-300" size={18} />
                      <input type="text" placeholder="Filter audit..." className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-900 w-32 focus:w-48 transition-all" />
                  </div>
               </div>

               <div className="p-0 overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50">
                           <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Date/Time</th>
                           <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest italic text-center">Reference</th>
                           <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Amount</th>
                           <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest italic text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                           <tr>
                              <td colSpan="4" className="py-20 text-center">
                                 <Loader2 className="animate-spin mx-auto text-indigo-900 opacity-20" size={40} strokeWidth={3} />
                              </td>
                           </tr>
                        ) : history.length === 0 ? (
                           <tr>
                              <td colSpan="4" className="py-32 text-center opacity-20">
                                 <FileText className="mx-auto mb-4" size={56} />
                                 <p className="text-[12px] font-black uppercase tracking-[0.3em]">No Historical Vaults Found</p>
                              </td>
                           </tr>
                        ) : (
                           history.map((tx) => (
                              <tr key={tx.id} className="hover:bg-indigo-50/10 transition-colors group">
                                 <td className="px-10 py-7">
                                    <div className="flex flex-col">
                                       <span className="text-[13px] font-black text-gray-900 uppercase italic">{tx.date}</span>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.time}</span>
                                    </div>
                                 </td>
                                 <td className="px-10 py-7 text-center">
                                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">REF-{tx.id.slice(-8).toUpperCase()}</span>
                                 </td>
                                 <td className="px-10 py-7">
                                    <span className="text-[16px] font-black text-gray-950 italic">{tx.amount}</span>
                                 </td>
                                 <td className="px-10 py-7 text-right">
                                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-current shadow-sm ${
                                       tx.status === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                       {tx.status}
                                    </span>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Vault Index: Tier 1 Security</span>
                  <div className="flex items-center gap-1.5 opacity-50">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronized with Core Bank</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WithdrawalRequestOwnerDetail;
