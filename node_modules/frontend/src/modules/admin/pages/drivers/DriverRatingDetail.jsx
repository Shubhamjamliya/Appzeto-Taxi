import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Star, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const DriverRatingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock detailed rating data
  const [driver] = useState({
    id: id || 'DRV101',
    name: 'Rahul Sharma',
    avgRating: 4.8,
    totalReviews: 856,
    memberSince: 'Jan 2024'
  });

  const [ratings] = useState([
    { id: 'RT001', passenger: 'Amit G.', rating: 5, comment: 'Excellent service, very polite driver. Reached on time.', date: '31 Mar, 10:30 AM', tags: ['Punctual', 'Clean Car'] },
    { id: 'RT002', passenger: 'Soham K.', rating: 4, comment: 'Good ride, slightly long route but polite behavior.', date: '31 Mar, 08:15 AM', tags: ['Polite'] },
    { id: 'RT003', passenger: 'Priya V.', rating: 5, comment: 'Amazing experience, very helpful with bags.', date: '30 Mar, 09:40 PM', tags: ['Helpful'] },
    { id: 'RT004', passenger: 'Kushal D.', rating: 5, comment: 'Professional and safe driving.', date: '30 Mar, 06:20 PM', tags: ['Safe Driving'] },
    { id: 'RT005', passenger: 'Neha R.', rating: 5, comment: '5 stars clearly!', date: '29 Mar, 11:00 AM', tags: ['Top Rated'] },
  ]);

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/drivers/ratings')}
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1.5">Rating Analysis</h1>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
               <span>Drivers</span>
               <ChevronRight size={10} />
               <span>Ratings</span>
               <ChevronRight size={10} />
               <span className="text-indigo-600">{driver.name}</span>
            </div>
          </div>
        </div>
        <button className="bg-indigo-950 text-white px-5 py-2.5 rounded-xl text-[12px] font-black hover:opacity-90 transition-all shadow-xl flex items-center gap-2 uppercase tracking-widest">
           <Download size={16} /> Export Detailed Log
        </button>
      </div>

      {/* DRIVER SUMMARY CARD */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 scale-[2] -rotate-12 translate-x-4"><Star size={100} strokeWidth={1} /></div>
         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600 shadow-inner">
               {driver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center md:text-left flex-1">
               <h2 className="text-3xl font-black text-gray-950 tracking-tight mb-2 leading-none">{driver.name}</h2>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[12px] font-black border border-amber-100">
                     <Star size={14} className="fill-current" /> {driver.avgRating} Fleet Rating
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                     <Clock size={14} /> Joined {driver.memberSince}
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-8 pl-10 border-l border-gray-50 hidden md:grid">
               <div>
                  <p className="text-3xl font-black text-gray-950 leading-none">{driver.totalReviews}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Total Ratings</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-emerald-500 leading-none">98%</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Happy Rides</p>
               </div>
            </div>
         </div>
      </div>

      {/* RATINGS LIST TABLE */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">Historical Feedback List</h3>
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input type="text" placeholder="Search passenger..." className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-[12px] font-bold outline-none group-focus-within:ring-4 group-focus-within:ring-indigo-50 transition-all w-64" />
               </div>
               <button className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-950 transition-all"><Filter size={18} /></button>
            </div>
         </div>

         <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50/20 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                        <th className="px-8 py-5">Passenger Detail</th>
                        <th className="px-6 py-5">Rating Scope</th>
                        <th className="px-6 py-5">Review Content</th>
                        <th className="px-6 py-5">Timestamp</th>
                        <th className="px-8 py-5 text-right w-10">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {ratings.map((rt, i) => (
                        <tr key={i} className="hover:bg-gray-50/10 transition-all group cursor-default">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-900 text-[12px] group-hover:scale-110 transition-transform shadow-inner">
                                    {rt.passenger.split(' ').map(n => n[0]).join('')}
                                 </div>
                                 <p className="text-[13px] font-bold text-gray-950 tracking-tight">{rt.passenger}</p>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-1">
                                 {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={14} className={`fill-current ${s <= rt.rating ? 'text-amber-400' : 'text-gray-100'}`} />
                                 ))}
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <p className="text-[13px] font-bold text-gray-500 leading-relaxed max-w-sm italic">"{rt.comment}"</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                 {rt.tags.map((tag, j) => (
                                    <span key={j} className="px-2 py-0.5 bg-indigo-50 text-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100/50">
                                       {tag}
                                    </span>
                                 ))}
                              </div>
                           </td>
                           <td className="px-6 py-6 font-bold text-[11px] text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              {rt.date}
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
    </div>
  );
};

export default DriverRatingDetail;
