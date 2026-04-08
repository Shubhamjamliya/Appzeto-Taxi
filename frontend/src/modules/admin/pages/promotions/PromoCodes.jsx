import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ChevronRight, Edit, Trash2, 
  ChevronDown, LayoutGrid, List, Loader2, Calendar, Ticket,
  MapPin, Users, Zap, Percent, Clock, ArrowLeft, Save, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = 'https://taxi-a276.onrender.com/api/v1/admin/promos';

const PromoCodes = () => {
  const [view, setView] = useState('list');
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for dynamic data
  const [locations, setLocations] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [formData, setFormData] = useState({
    service_location_id: '',
    transport_type: '',
    user_id: '',
    code: '',
    minimum_trip_amount: '',
    maximum_discount_amount: '',
    cumulative_max_discount_amount: '',
    discount_percentage: '',
    from: '',
    to: '',
    uses_per_user: '1',
    active: true
  });

  const token = localStorage.getItem('adminToken') || '';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promosRes, locRes, usersRes] = await Promise.all([
        fetch(BASE, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taxi-a276.onrender.com/api/v1/admin/service-locations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taxi-a276.onrender.com/api/v1/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const pData = await promosRes.json();
      const lData = await locRes.json();
      const uData = await usersRes.json();

      if (pData.success) setPromos(pData.data?.results || []);
      if (lData.success) setLocations(Array.isArray(lData.data) ? lData.data : (lData.data?.results || []));
      if (uData.success) setUsersList(uData.data?.results || []);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setView('list');
        fetchData();
        setFormData({
            service_location_id: '', transport_type: '', user_id: '', code: '',
            minimum_trip_amount: '', maximum_discount_amount: '', cumulative_max_discount_amount: '',
            discount_percentage: '', from: '', to: '', uses_per_user: '1', active: true
        });
      } else {
        alert(data.message || "Failed to create promo");
      }
    } catch (err) { alert("Network Error"); }
    finally { setSubmitting(false); }
  };

  const filteredPromos = promos.filter(p => p.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 p-1 animate-in fade-in duration-500 font-sans text-gray-950 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-black text-[#2D3A6E] uppercase tracking-tight italic leading-none mb-1">
             {view === 'list' ? 'PROMO CODE' : 'CREATE PROMO'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
             <span>Promo Code</span>
             <ChevronRight size={12} className="opacity-50" />
             <span className="text-gray-900">{view === 'list' ? 'Promo Code' : 'Create'}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* TOOLBAR */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                   show 
                   <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 mx-2 text-gray-950 font-black outline-none shadow-sm appearance-none pr-10 relative">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                   </select> 
                   entries
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <button className="h-14 px-8 bg-rose-500 text-white rounded-[24px] text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95">
                    <Filter size={18} /> Filters
                 </button>
                 <button 
                   onClick={() => setView('create')}
                   className="h-14 px-8 bg-[#2D3A6E] text-white rounded-[24px] text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1e2a5a] transition-all shadow-xl shadow-indigo-200 active:scale-95"
                 >
                    <Plus size={18} /> Add Promo Code
                 </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden border-b-8 border-b-indigo-50/20 min-h-[500px]">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-50 uppercase tracking-[0.1em] text-[11px] font-black text-gray-400">
                           <th className="px-10 py-7 italic">Code</th>
                           <th className="px-10 py-7 italic">Transport Type</th>
                           <th className="px-10 py-7 italic">From - To Date</th>
                           <th className="px-10 py-7 italic">Status</th>
                           <th className="px-10 py-7 italic text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                           <tr><td colSpan="5" className="py-32 text-center text-gray-300 font-bold uppercase tracking-widest">Accessing Promotions Vault...</td></tr>
                        ) : filteredPromos.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="py-32 text-center">
                                 <div className="flex flex-col items-center gap-6 opacity-30">
                                    <Ticket size={100} strokeWidth={1} />
                                    <div className="space-y-1">
                                       <p className="text-[14px] font-black uppercase tracking-widest text-[#2D3A6E]">No Data Found</p>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           filteredPromos.map(p => (
                             <tr key={p._id} className="group hover:bg-indigo-50/10 transition-all border-l-4 border-l-transparent hover:border-l-[#2D3A6E]">
                               <td className="px-10 py-7">
                                  <span className="bg-indigo-50 text-[#2D3A6E] px-4 py-2 rounded-xl text-[14px] font-black tracking-tighter shadow-sm border border-indigo-100">
                                     {p.code}
                                  </span>
                               </td>
                               <td className="px-10 py-7">
                                  <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{p.transport_type}</span>
                               </td>
                               <td className="px-10 py-7">
                                  <div className="flex flex-col">
                                     <span className="text-[12px] font-black text-gray-900">{p.from}</span>
                                     <span className="text-[10px] font-bold text-gray-300 uppercase italic">To {p.to}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-7">
                                  <span className={`px-4 py-2 rounded-2xl text-[10px] font-black italic uppercase tracking-widest border border-current ${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                     {p.active ? 'Active' : 'Disabled'}
                                  </span>
                               </td>
                               <td className="px-10 py-7 text-right">
                                  <div className="flex items-center justify-end gap-2 pr-2">
                                     <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-indigo-600 hover:bg-white/50 transition-all shadow-sm active:scale-95"><Edit size={18} /></button>
                                     <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-rose-600 hover:bg-white/50 transition-all shadow-sm active:scale-95"><Trash2 size={18} /></button>
                                  </div>
                               </td>
                             </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
               
               <div className="p-10 bg-gray-50/10 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Showing 0 to 0 of 0 entries</span>
                  <div className="flex items-center gap-1.5 leading-none">
                     <button className="px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>PREV</button>
                     <button className="h-12 w-12 bg-[#2D3A6E] text-white rounded-2xl text-[14px] font-black shadow-xl ring-8 ring-indigo-50/50">1</button>
                     <button className="px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors shadow-sm disabled:opacity-20" disabled>NEXT</button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="pb-10"
          >
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
                  <div className="flex items-center gap-6">
                     <button onClick={() => setView('list')} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-950 transition-all shadow-sm active:scale-95">
                        <ArrowLeft size={20} />
                     </button>
                     <div>
                        <h2 className="text-[20px] font-black text-gray-950 uppercase tracking-tight italic leading-none mb-1">Configuration</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Create a redemption incentive</p>
                     </div>
                  </div>
                  <button className="text-[13px] font-black text-indigo-400 flex items-center gap-2 hover:text-[#2D3A6E] transition-all underline decoration-2 decoration-indigo-100 underline-offset-4">
                     How It Works
                  </button>
               </div>

               <form onSubmit={handleSave} className="p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {/* SERVICE LOCATIONS */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Service Locations <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                           <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.service_location_id}
                             onChange={(e) => setFormData({...formData, service_location_id: e.target.value})}
                             className="w-full h-16 pl-16 pr-10 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           >
                              <option value="">Select Service Locations</option>
                              {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     {/* TRANSPORT TYPE */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Transport Type <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                           <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.transport_type}
                             onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                             className="w-full h-16 pl-16 pr-10 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           >
                              <option value="">Select</option>
                              <option value="taxi">Taxi</option>
                              <option value="delivery">Delivery</option>
                              <option value="all">All</option>
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     {/* USERS */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Users <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                           <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <select 
                             required
                             value={formData.user_id}
                             onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                             className="w-full h-16 pl-16 pr-10 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none appearance-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           >
                              <option value="">Select Users</option>
                              {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none" size={18} />
                        </div>
                     </div>

                     {/* CODE */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Code <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                           <Ticket className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <input 
                              type="text" 
                              placeholder="Enter Code"
                              required
                              value={formData.code}
                              onChange={(e) => setFormData({...formData, code: e.target.value})}
                              className="w-full h-16 pl-16 pr-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     {/* MAX DISCOUNT */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Maximum Discount Amount <span className="text-rose-500">*</span></label>
                        <input 
                           type="text" 
                           placeholder="Enter Maximum Discount Amount"
                           required
                           value={formData.maximum_discount_amount}
                           onChange={(e) => setFormData({...formData, maximum_discount_amount: e.target.value})}
                           className="w-full h-16 px-8 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                        />
                     </div>

                     {/* CUMULATIVE MAX DISCOUNT */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Cumulative Maximum Discount Amount <span className="text-rose-500">*</span></label>
                        <input 
                           type="text" 
                           placeholder="Enter Cumulative Maximum Discount Amount"
                           required
                           value={formData.cumulative_max_discount_amount}
                           onChange={(e) => setFormData({...formData, cumulative_max_discount_amount: e.target.value})}
                           className="w-full h-16 px-8 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                        />
                     </div>

                     {/* DISCOUNT PERCENTAGE */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">Discount Percentage <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                           <Percent className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2D3A6E] transition-colors" size={20} />
                           <input 
                              type="text" 
                              placeholder="Enter Discount Percentage"
                              required
                              value={formData.discount_percentage}
                              onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                              className="w-full h-16 pl-16 pr-6 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     {/* FROM - TO DATE */}
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">From - To Date <span className="text-rose-500">*</span></label>
                        <div className="flex gap-4">
                           <input 
                              type="date"
                              required
                              value={formData.from}
                              onChange={(e) => setFormData({...formData, from: e.target.value})}
                              className="flex-1 h-16 px-8 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           />
                           <input 
                              type="date" 
                              required
                              value={formData.to}
                              onChange={(e) => setFormData({...formData, to: e.target.value})}
                              className="flex-1 h-16 px-8 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     {/* USES PER USER */}
                     <div className="md:col-span-1 space-y-3">
                        <label className="text-[11px] font-black text-gray-950 uppercase tracking-widest italic flex items-center gap-2">How many times the user can use Same promo code? <span className="text-rose-500">*</span></label>
                        <input 
                           type="number" 
                           placeholder="Enter count"
                           required
                           min="1"
                           value={formData.uses_per_user}
                           onChange={(e) => setFormData({...formData, uses_per_user: e.target.value})}
                           className="w-full h-16 px-8 bg-gray-50/50 border border-transparent rounded-[24px] text-[15px] font-bold text-gray-950 outline-none focus:bg-white focus:border-[#2D3A6E]/10 transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-gray-50 flex items-center justify-end gap-5">
                      <button 
                         type="button"
                         onClick={() => setView('list')}
                         className="h-16 px-10 rounded-[28px] text-[13px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-950 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                         type="submit"
                         disabled={submitting}
                         className="h-16 px-14 bg-[#2D3A6E] text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-[#1e2a5a] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                         {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                         Save
                      </button>
                  </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCodes;
