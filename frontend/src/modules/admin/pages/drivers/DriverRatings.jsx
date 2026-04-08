import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Filter, 
  MoreHorizontal, 
  Download, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Eye,
  Loader2
} from 'lucide-react';

const DriverRatings = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, count: 0, positive: 0, flagged: 0 });

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  useEffect(() => {
    const fetchRatings = async () => {
      setIsLoading(true);
      try {
        const providedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTc3NTA0OTExNywiZXhwIjoxODA2NTg1MTE3fQ.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
        const storedToken = localStorage.getItem('adminToken');
        const token = (storedToken && storedToken !== 'undefined' && storedToken !== 'null') ? storedToken : providedToken;

        const response = await fetch('https://taxi-a276.onrender.com/api/v1/admin/drivers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          const list = (data.data?.results || []).map(d => ({
            id: d._id || d.id,
            name: d.name || d.user_id?.name || 'Unknown',
            rating: d.rating || d.average_rating || d.avg_rating || 0,
            totalRides: d.total_trips || d.total_rides || 0,
            transport: d.transport_type || 'Car',
            location: d.city || 'India',
            lastActive: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'N/A'
          }));
          setDrivers(list);
          
          // Compute Stats
          const total = list.length;
          const avg = list.reduce((a, b) => a + Number(b.rating), 0) / (total || 1);
          const positive = list.filter(d => Number(d.rating) >= 4).length;
          const flagged = list.filter(d => Number(d.rating) < 3 && Number(d.rating) > 0).length;
          
          setStats({
            avg: avg.toFixed(1),
            count: total,
            positive: ((positive / (total || 1)) * 100).toFixed(0),
            flagged
          });
        }
      } catch (err) {
        console.error('Ratings fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRatings();
  }, []);

  return (
    <div className="space-y-10 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* ... previous content ... */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none">Ratings & Reviews</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950">Fleet Control</span>
               <ChevronRight size={14} />
               <span>Service Quality Audit</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-950 px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Download size={16} className="text-gray-400" /> Sentiment Report
            </button>
         </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 scale-[2] -rotate-12 translate-x-4"><Star size={80} strokeWidth={1} /></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Global Average</p>
             <div className="flex items-end gap-3 relative z-10 mb-2">
                <p className="text-6xl font-black text-gray-950 leading-none">{stats.avg}</p>
                <div className="flex flex-col py-1">
                   <div className="flex items-center gap-0.5 text-orange-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={16} className={`fill-orange-400 ${s > Math.round(stats.avg) ? 'opacity-30' : ''}`} />
                      ))}
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Fleet Mean</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 scale-[2] -rotate-12 translate-x-4"><ThumbsUp size={80} strokeWidth={1} /></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Positive Feedback</p>
             <div className="flex items-end gap-3 relative z-10 mb-2">
                <p className="text-6xl font-black text-emerald-600 leading-none">{stats.positive}%</p>
                <p className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-1 pb-1">
                    LIVE
                </p>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 scale-[2] -rotate-12 translate-x-4"><MessageSquare size={80} strokeWidth={1} /></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Total Operators</p>
             <div className="flex items-end gap-3 relative z-10 mb-2">
                <p className="text-6xl font-black text-gray-950 leading-none">{stats.count}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">Verified Fleet</p>
             </div>
          </div>

          <div className="bg-gray-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 scale-[2] -rotate-12 translate-x-4"><ShieldAlert size={80} strokeWidth={1} /></div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 relative z-10">Low performance Alerts</p>
             <div className="flex items-end gap-3 relative z-10 mb-2">
                <p className="text-6xl font-black text-rose-500 leading-none">{stats.flagged}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">Critical Audit</p>
             </div>
          </div>
       </div>

      <div className="space-y-8">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 leading-none">Recent Verified Feedback</h2>
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="text" placeholder="Search driver or passenger..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-[12px] font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
               </div>
               <button className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-950 shadow-sm"><Filter size={18} /></button>
            </div>
         </div>

         <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50/20 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">Reviewer Detail</th>
                        <th className="px-6 py-5">Assigned Operator</th>
                        <th className="px-6 py-5">Rating</th>
                        <th className="px-6 py-5">Feedback Analysis</th>
                        <th className="px-5 py-5 text-center">Outcome</th>
                        <th className="px-8 py-5 text-right w-10"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan="6" className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Aggregating Global Fleet Ratings...</p>
                            </div>
                          </td>
                        </tr>
                      ) : drivers.length === 0 ? (
                        <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No rating patterns detected</td></tr>
                      ) : (
                        drivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((rev) => (
                           <tr key={rev.id} className="hover:bg-gray-50/10 transition-all cursor-pointer group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-950 font-black text-[12px] flex items-center justify-center uppercase shadow-inner group-hover:scale-105 transition-transform">
                                       {rev.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                       <p className="text-[13px] font-bold text-gray-950 tracking-tight leading-none mb-1.5">{rev.name}</p>
                                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{rev.location}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${Number(rev.rating) >= 4 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-[13px] font-black text-gray-800">{rev.transport}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-1.5">
                                    <span className={`text-[15px] font-black ${rev.rating >= 4 ? 'text-emerald-500' : rev.rating >= 3 ? 'text-amber-500' : 'text-rose-500'}`}>
                                       {rev.rating}
                                    </span>
                                    <Star size={14} className={`fill-current ${rev.rating >= 4 ? 'text-emerald-500' : rev.rating >= 3 ? 'text-amber-500' : 'text-rose-500'}`} />
                                 </div>
                              </td>
                              <td className="px-6 py-6 max-w-sm">
                                 <p className="text-[13px] font-bold text-gray-500 leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                   Aggregated performance across {rev.totalRides} verified trips.
                                 </p>
                                 <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-0.5 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 rounded-md">
                                       {rev.totalRides} Total Rides
                                    </span>
                                 </div>
                              </td>
                              <td className="px-5 py-6 text-center">
                                 {rev.rating >= 4 ? (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 rounded-lg">Verified Positive</span>
                                 ) : rev.rating > 0 ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100 rounded-lg">Needs Attention</span>
                                 ) : (
                                    <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100 rounded-lg">No Feedback</span>
                                 )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="relative">
                                    <button 
                                      onClick={(e) => toggleMenu(e, rev.id)}
                                      className="p-2.5 text-gray-400 hover:text-gray-950 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md border border-transparent hover:border-gray-50">
                                       <MoreHorizontal size={18} />
                                    </button>
                                    {activeMenu === rev.id && (
                                       <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                          <button 
                                            onClick={() => navigate(`/admin/drivers/ratings/${rev.id}`)}
                                            className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                             <Eye size={16} className="text-indigo-500" /> View History
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
      </div>
    </div>
  );
};

export default DriverRatings;

