import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Car, 
  FileText, 
  IndianRupee, 
  History, 
  Star, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  LayoutDashboard,
  Wallet,
  Settings,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  CreditCard,
  Banknote,
  Navigation,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const DriverDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('General Report');
  const [driver, setDriver] = useState(null);
  const [requests, setRequests] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTc3NTA0OTExNywiZXhwIjoxODA2NTg1MTE3fQ.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
      const headers = { 'Authorization': `Bearer ${token}` };

      // Driver Profile
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}`, { headers });
      const data = await res.json();

      if (data.success) {
        const d = data.data;
        setDriver({
          id: d._id,
          name: d.name || d.user_id?.name || 'Unknown',
          mobile: d.mobile || 'N/A',
          email: d.user_id?.email || 'N/A',
          city: d.city || d.service_location?.name || 'Global',
          rating: d.rating || 0,
          vehicle: d.transport_type || 'N/A',
          plate: d.car_number || 'N/A',
          rides: d.total_rides || 0,
          wallet: d.wallet_balance || 0,
          joined: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A',
          image: d.user_id?.profile_picture || 'https://via.placeholder.com/200x200'
        });
      }

      // Driver Requests
      const reqRes = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}/requests`, { headers });
      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.data?.results || []);
      }

      // Driver Wallet History
      const walletRes = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}/wallet-history`, { headers });
      const walletData = await walletRes.json();
      if (walletData.success) {
        setWalletHistory(walletData.data?.results || []);
      }

      // Driver Review History
      const reviewRes = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}/review-history`, { headers });
      const reviewData = await reviewRes.json();
      if (reviewData.success) {
        setReviews(reviewData.data?.results || []);
      }

    } catch (err) {
      console.error('Driver Fetch Error:', err);
      setError('Failed to load driver details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleWalletAction = async (type) => {
    const amount = prompt(`Enter amount to ${type}:`);
    if (!amount || isNaN(amount)) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/wallet/drivers/${id}/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_type: type,
          remarks: `Admin ${type} adjustment`
        })
      });

      const result = await res.json();
      if (result.success) {
        alert(`${type.toUpperCase()} successful!`);
        fetchData();
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Wallet error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tripsByStatus = (status) => requests.filter(r => r.status === status).length;
  
  const stats = [
    { label: 'Total Trips', value: requests.length, icon: Car, color: 'text-blue-500' },
    { label: 'Completed', value: tripsByStatus('Completed'), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Cancelled', value: tripsByStatus('Cancelled'), icon: XCircle, color: 'text-rose-500' },
    { label: 'Ongoing', value: tripsByStatus('Ongoing'), icon: Clock, color: 'text-indigo-500' },
    { label: 'Total Wallet', value: `₹ ${driver?.wallet || '0'}`, icon: Wallet, color: 'text-amber-500' },
  ];

  // TAB CONTENT COMPONENTS
  const TabContent = () => {
    switch (activeTab) {
      case 'Request List':
        return (
          <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
             <div className="p-8 border-b border-gray-50 bg-gray-50/20"><h4 className="text-[14px] font-black uppercase tracking-widest text-gray-950">Recent Driver Requests</h4></div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                         <th className="px-8 py-5">Request ID</th>
                         <th className="px-5 py-5">Location Details</th>
                         <th className="px-5 py-5 text-center">Amount</th>
                         <th className="px-5 py-5 text-center">Status</th>
                         <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {requests.length === 0 ? (
                        <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50 text-[10px]">No requests found for this captain</td></tr>
                      ) : (
                        requests.map((r, i) => (
                           <tr key={r._id || i} className="hover:bg-gray-50/20 transition-all group">
                              <td className="px-8 py-6 text-[12px] font-bold text-gray-950 uppercase tracking-tight italic">{r.request_number || 'N/A'}</td>
                              <td className="px-5 py-6">
                                 <p className="text-[13px] font-black text-gray-950 uppercase tracking-tight leading-none mb-1">{r.pick_location || 'Pick-up Location'}</p>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}</p>
                              </td>
                              <td className="px-5 py-6 text-center font-black text-[13px] text-gray-900 tracking-tight italic">₹ {r.total_amount || '0.00'}</td>
                              <td className="px-5 py-6 text-center">
                                 <span className={`px-2.5 py-1 ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} rounded-lg text-[9px] font-black uppercase tracking-widest border italic`}>{r.status}</span>
                              </td>
                              <td className="px-8 py-6 text-right"><button className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><Eye size={16} /></button></td>
                           </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
             <div className="p-8 text-center text-gray-400 italic font-bold uppercase text-[10px] tracking-widest">End of results</div>
          </div>
        );
      case 'Payment History':
        return (
          <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                <div>
                   <h4 className="text-[14px] font-black uppercase tracking-widest text-gray-950">Earnings & Payments</h4>
                   <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Current Balance: ₹ {driver?.wallet || '0'}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    disabled={isSubmitting}
                    onClick={() => handleWalletAction('credit')}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
                   >
                     <ArrowUpRight size={14} /> Credit Amount
                   </button>
                   <button 
                    disabled={isSubmitting}
                    onClick={() => handleWalletAction('debit')}
                    className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
                   >
                     <ArrowDownRight size={14} /> Debit Amount
                   </button>
                </div>
             </div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                         <th className="px-8 py-5">Transaction ID</th>
                         <th className="px-5 py-5">Type / Description</th>
                         <th className="px-5 py-5 text-center">Amount</th>
                         <th className="px-8 py-5 text-right">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {walletHistory.length === 0 ? (
                        <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50 text-[10px]">No wallet transactions found</td></tr>
                      ) : (
                        walletHistory.map((w, i) => {
                          const isCredit = w.transaction_alias === 'ADMIN_CREDIT' || w.amount > 0;
                          return (
                            <tr key={w._id || i} className="hover:bg-gray-50/20 transition-all group">
                               <td className="px-8 py-6 text-[12px] font-bold text-gray-900 uppercase tracking-tight italic">TRX-{w._id?.slice(-6).toUpperCase() || 'N/A'}</td>
                               <td className="px-5 py-6">
                                  <div className="flex items-center gap-3">
                                     <div className={`p-2 ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-lg`}>
                                        {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                     </div>
                                     <div>
                                        <p className="text-[13px] font-black text-gray-950 uppercase tracking-tight">{w.remarks || (isCredit ? 'Admin Credit' : 'Admin Debit')}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{isCredit ? 'Credit' : 'Debit'}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className={`px-5 py-6 text-center font-black text-[14px] italic ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {isCredit ? '+' : '-'} ₹ {Math.abs(w.amount || 0).toFixed(2)}
                               </td>
                               <td className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 tracking-widest uppercase italic">
                                 {w.createdAt ? new Date(w.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                               </td>
                            </tr>
                          );
                        })
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'Withdrawal History':
        return (
          <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-gray-50 bg-gray-50/20"><h4 className="text-[14px] font-black uppercase tracking-widest text-gray-950">Cash-out History</h4></div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                         <th className="px-8 py-5">Ref ID</th>
                         <th className="px-5 py-5">Payout Method</th>
                         <th className="px-5 py-5 text-center">Requested Amount</th>
                         <th className="px-5 py-5 text-center">Settlement Status</th>
                         <th className="px-8 py-5 text-right">Requested At</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {[1, 2].map((_, i) => (
                         <tr key={i} className="hover:bg-gray-50/20 transition-all group">
                            <td className="px-8 py-6 text-[12px] font-bold text-gray-950 uppercase tracking-tight italic">WDR-0102{i}</td>
                            <td className="px-5 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Banknote size={14} /></div>
                                  <p className="text-[13px] font-black text-gray-950 uppercase tracking-tight">Bank Transfer</p>
                               </div>
                            </td>
                            <td className="px-5 py-6 text-center font-black text-[13px] text-indigo-600">₹ 2,500.00</td>
                            <td className="px-5 py-6 text-center">
                               <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">In Review</span>
                            </td>
                            <td className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 tracking-widest uppercase italic">Mar {24+i} | 09:20 AM</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );
      case 'Review History':
        return (
          <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
             <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                <h4 className="text-[14px] font-black uppercase tracking-widest text-gray-950">Passenger Feedback</h4>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-[12px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                   <Star size={14} fill="currentColor" /> {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)).toFixed(1)} Avg Rating
                </div>
             </div>
             <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.length > 0 ? (
                  reviews.map((rev, i) => (
                    <div key={rev._id || i} className="p-8 bg-gray-50/30 rounded-[32px] border border-gray-100 flex gap-6 group hover:bg-white transition-all shadow-sm">
                       <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xl uppercase shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                          {rev.user_id?.name?.charAt(0) || 'U'}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                             <p className="text-[14px] font-black text-gray-950 uppercase tracking-tight leading-none italic">{rev.user_id?.name || 'Verified Rider'}</p>
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 mb-4">
                             {[1,2,3,4,5].map(s => (
                               <Star 
                                 key={s} 
                                 size={12} 
                                 fill={s <= rev.rating ? 'currentColor' : 'none'} 
                                 className={s <= rev.rating ? 'text-amber-500' : 'text-gray-200'}
                               />
                             ))}
                          </div>
                          <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic opacity-90">"{rev.comment || 'Smooth ride, no issues reported.'}"</p>
                          <div className="mt-5 pt-5 border-t border-gray-100/50 flex gap-2">
                             <span className="px-3 py-1 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 italic shadow-sm">Trip Reference</span>
                             <span className="px-3 py-1 bg-amber-50/50 border border-amber-100/50 rounded-xl text-[8px] font-black uppercase tracking-widest text-amber-600/60 italic shadow-sm">Rating: {rev.rating}/5</span>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-50 shadow-inner">
                      <Star size={40} />
                    </div>
                    <p className="text-[16px] font-black uppercase tracking-[0.2em] text-gray-950 mb-2">Pristine Reputation</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 italic">No reviews recorded for this captain yet</p>
                  </div>
                )}
             </div>
          </div>
        );
      case 'Documents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {[
               { name: 'Aadhar Card', status: 'Verified', color: 'emerald' },
               { name: 'Driving License', status: 'Verified', color: 'emerald' },
               { name: 'Vehicle RC', status: 'Verified', color: 'emerald' },
               { name: 'Vehicle Insurance', status: 'Expiring', color: 'amber' },
               { name: 'Pollution Certificate', status: 'Verified', color: 'emerald' },
             ].map((doc, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 scale-[2] -rotate-12 translate-x-4"><FileText size={80} strokeWidth={1} /></div>
                   <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="p-3 bg-gray-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                      <span className={`px-3 py-1 bg-${doc.color}-50 text-${doc.color}-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-${doc.color}-100`}>{doc.status}</span>
                   </div>
                   <h5 className="text-[16px] font-black text-gray-950 uppercase tracking-tight mb-2 relative z-10">{doc.name}</h5>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-8 relative z-10">Updated: 01 Apr 2024</p>
                   <button className="w-full py-4 bg-gray-50 hover:bg-gray-950 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 transition-all shadow-sm focus:ring-4 focus:ring-gray-100">View Document</button>
                </div>
             ))}
          </div>
        );
      default: // General Report
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-50 shadow-sm p-10">
                   <div className="flex items-center gap-3 mb-10">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl scale-125"><History size={20} /></div>
                      <h4 className="text-[14px] font-black text-gray-950 uppercase tracking-widest">Fleet Operations Audit</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-8">
                         {[
                           { label: 'Total Completed Trips', value: '432', color: 'text-emerald-500' },
                           { label: 'System Uptime Rate', value: '98.4%', color: 'text-indigo-500' },
                           { label: 'Average Trip Rating', value: '4.8/5', color: 'text-amber-500' },
                         ].map((item, i) => (
                           <div key={i} className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{item.label}</span>
                              <span className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.value}</span>
                           </div>
                         ))}
                      </div>
                      <div className="space-y-8">
                         {[
                           { label: 'Active Subscription', value: 'Pro Monthly', color: 'text-gray-950' },
                           { label: 'KYC Verification Status', value: 'Fully Audited', color: 'text-emerald-600' },
                           { label: 'Commission Tier', value: 'Bronze (15%)', color: 'text-amber-600' },
                         ].map((item, i) => (
                           <div key={i} className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 focus:outline-none">{item.label}</span>
                              <span className={`text-xl font-black ${item.color} uppercase italic tracking-tight`}>{item.value}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                   <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 translate-x-4"><ShieldCheck size={140} strokeWidth={1} /></div>
                   <div className="relative z-10">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8 italic">Security Intelligence</h4>
                      <p className="text-[15px] font-black leading-relaxed italic text-gray-300">"Driver account is in good standing. No critical violations found in the last 30 days of telemetry audit."</p>
                   </div>
                   <div className="pt-10 relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner"><AlertCircle size={24} /></div>
                      <div>
                         <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Next Audit Date</p>
                         <p className="text-[14px] font-black text-white italic uppercase">12th May 2024</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  const tabs = [
    'Request List',
    'Payment History',
    'Withdrawal History',
    'Review History',
    'Documents',
    'General Report'
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full"><AlertCircle size={40} /></div>
        <p className="text-[14px] font-black text-gray-950 uppercase tracking-widest">{error || 'Driver Not Found'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-900 max-w-[1600px] mx-auto pb-20">
      {/* HEADER & TOP INFO */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Card */}
        <div className="w-full lg:w-[400px] bg-white rounded-[40px] border border-gray-50 shadow-sm p-10 flex flex-col items-center text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 scale-[2] -rotate-12 translate-x-4"><User size={120} strokeWidth={1} /></div>
           
           <div className="relative w-48 h-48 mb-6 ring-[12px] ring-gray-50 rounded-[48px] overflow-hidden group-hover:scale-105 transition-all duration-500 shadow-2xl">
              <img src={driver.image} alt="Driver" className="w-full h-full object-cover" />
           </div>
           
           <h2 className="text-3xl font-black tracking-tight text-gray-950 uppercase leading-none mb-2">{driver.name}</h2>
           <div className="flex items-center gap-2 text-gray-400 font-black text-[12px] uppercase tracking-widest mb-6 px-1.5 py-0.5">
              <MapPin size={14} className="text-rose-500" /> {driver.city}
           </div>

           <div className="w-full space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 rounded-[24px] border border-gray-100 group/item hover:bg-white transition-all cursor-pointer">
                 <Phone size={18} className="text-indigo-500" />
                 <span className="text-[15px] font-black tracking-tight">{driver.mobile}</span>
              </div>
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 rounded-[24px] border border-gray-100 italic">
                 <Calendar size={18} className="text-gray-400" />
                 <span className="text-[13px] font-bold text-gray-500">Joined {driver.joined}</span>
              </div>
           </div>

           {/* Vehicle Info */}
           <div className="w-full pt-1 border-t border-gray-50 text-left">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                 <Car size={14} /> Registered Fleet Info
              </h3>
              <div className="flex gap-4">
                 <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 p-2 overflow-hidden shrink-0">
                    <img src="https://img.freepik.com/free-vector/yellow-passenger-transport-taxi-car_1017-4886.jpg" alt="Vehicle" className="w-full h-full object-cover rounded-xl" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <p className="text-[16px] font-black text-gray-950 uppercase leading-none italic">{driver.vehicle}</p>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-rose-500 uppercase tracking-tight">{driver.plate}</p>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Verified Unit</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 space-y-8 min-w-0">
           {/* Navigation Tabs */}
           <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-2 flex overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[140px] py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-gray-950 text-white shadow-lg shadow-gray-200' 
                      : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                 >
                    {tab}
                 </button>
              ))}
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.map((stat, i) => (
                 <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm group hover:scale-[1.02] transition-all">
                    <div className={`p-3 w-fit rounded-2xl bg-gray-50 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                       <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-black text-gray-950 tracking-tighter leading-none mb-2 italic">{stat.value}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 </div>
              ))}
           </div>

           {/* TAB CONTENT AREA */}
           <div className="min-h-[400px]">
              {TabContent()}
           </div>

           {/* Section: Live Location & Financial Breakdown (ONLY ON GENERAL REPORT) */}
           {activeTab === 'General Report' && (
              <div className="grid grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
                 {/* Map & Live Tracking */}
                 <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">Live</div>
                          <h4 className="text-[14px] font-black text-gray-950 uppercase tracking-widest leading-none">Driver Current Location</h4>
                       </div>
                       <button className="flex items-center gap-2 text-indigo-600 text-[11px] font-black uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all opacity-80 italic">
                          <Navigation size={14} /> Full Map view
                       </button>
                    </div>
                    <div className="flex-1 bg-gray-100 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-[#E5E7EB] flex items-center justify-center bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2090,28.6139,12,0/800x400?access_token=pk.xxx')] bg-cover">
                          <div className="relative">
                             <div className="absolute inset-x-0 inset-y-0 w-12 h-12 bg-rose-500/20 rounded-full animate-ping"></div>
                             <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-rose-500 scale-125">
                                <Car size={24} className="text-rose-500" />
                             </div>
                             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest italic">
                                Near South Delhi
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Earnings Breakdown */}
                 <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-gray-950 rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden min-h-[500px] flex flex-col">
                       <div className="absolute top-0 right-0 p-8 opacity-10 scale-[2] -rotate-12 translate-x-4 italic"><IndianRupee size={150} strokeWidth={1} /></div>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Earnings Breakdown</h4>
                       
                       <div className="space-y-6 relative z-10 flex-1">
                          {[
                            { label: 'Today Earnings', value: '₹ 0', color: 'text-white' },
                            { label: 'GST Tax', value: '₹ 0', color: 'text-rose-400' },
                            { label: 'Drivers Earnings', value: '₹ 0', color: 'text-emerald-400' },
                          ].map((item, i) => (
                             <div key={i} className={`flex items-center justify-between ${i<2?'border-b border-white/5 pb-6':''}`}>
                                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                                <span className={`font-black tracking-tighter italic ${i===2?'text-4xl':'text-xl'} ${item.color}`}>{item.value}</span>
                             </div>
                          ))}
                       </div>

                       <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-2 relative z-10">
                          {[
                            { label: 'By Cash', icon: Banknote, value: '0', color: 'text-amber-400' },
                            { label: 'By Wallet', icon: Wallet, value: '0', color: 'text-indigo-400' },
                            { label: 'By Card', icon: CreditCard, value: '0', color: 'text-emerald-400' },
                          ].map((item, i) => (
                            <div key={i} className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                               <item.icon size={16} className={`${item.color} mx-auto mb-2`} />
                               <p className="text-[13px] font-black leading-none mb-1 italic">{item.value}</p>
                               <p className="text-[7px] font-black uppercase tracking-widest text-gray-500 italic">{item.label}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 flex items-center justify-between px-8 py-6 border-t border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
         <div>2025 © REDIGO CAB Pvt Ltd.</div>
         <div>Design & Develop by REDIGO Tech</div>
         <div className="flex items-center gap-2">
            App Version <span className="text-emerald-600 italic">V 3.4.1</span>
         </div>
      </footer>
    </div>
  );
};

export default DriverDetails;
