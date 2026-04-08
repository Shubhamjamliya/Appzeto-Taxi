import React, { useState } from 'react';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  IndianRupee, 
  AlertCircle, 
  ArrowRight,
  TrendingDown,
  Bell,
  MoreHorizontal
} from 'lucide-react';

const NegativeBalanceDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [negativeDrivers] = useState([
    { id: 'DRV901', name: 'Ramesh Kumar', balance: '-₹450.00', lastRide: '30 Mar, 02:40 PM', status: 'Notice Sent' },
    { id: 'DRV902', name: 'Sunil Verma', balance: '-₹1,240.00', lastRide: '29 Mar, 11:15 AM', status: 'Paused' },
    { id: 'DRV903', name: 'Pankaj S.', balance: '-₹89.00', lastRide: '31 Mar, 04:30 PM', status: 'Active' },
    { id: 'DRV904', name: 'Vinay G.', balance: '-₹542.50', lastRide: '28 Mar, 09:00 AM', status: 'Notice Sent' },
  ]);

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2 leading-none uppercase tracking-tighter">Negative Wallet Ledger</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none">Wallet Mgmt</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Negative Balance</span>
            </div>
         </div>
         <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-col items-end shadow-sm">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Total Outstanding</p>
            <p className="text-2xl font-black text-rose-600 leading-none tracking-tighter">₹ 1.28,450.00</p>
         </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by driver name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[13px] font-bold focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-inner" 
            />
         </div>
         <div className="flex items-center gap-3">
            <button className="px-5 py-3 bg-white border border-gray-100 text-gray-950 text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
               <Download size={16} className="text-gray-400" /> Export Defaulters
            </button>
            <button className="px-5 py-3 bg-gray-950 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-xl flex items-center gap-2">
               <Bell size={16} /> Bulk Notify
            </button>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden">
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/20 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                     <th className="px-8 py-5">Driver Details</th>
                     <th className="px-6 py-5">Current Deficit</th>
                     <th className="px-6 py-5">Last Active</th>
                     <th className="px-6 py-5 text-center">Status</th>
                     <th className="px-8 py-5 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {negativeDrivers.map(drv => (
                     <tr key={drv.id} className="hover:bg-rose-50/10 transition-all group cursor-default">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-[12px] shadow-lg group-hover:scale-110 transition-transform">
                                 {drv.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                 <p className="text-[13px] font-bold text-gray-950 leading-none mb-1.5">{drv.name}</p>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{drv.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 font-black text-[15px] text-rose-600 tracking-tight">
                           {drv.balance}
                        </td>
                        <td className="px-6 py-6">
                           <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              {drv.lastRide}
                           </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              drv.status === 'Paused' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              drv.status === 'Notice Sent' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-100 text-gray-400'
                           }`}>
                              {drv.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-2 text-gray-400 hover:text-gray-950 hover:bg-white rounded-lg transition-all shadow-sm">
                              <MoreHorizontal size={18} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default NegativeBalanceDrivers;
