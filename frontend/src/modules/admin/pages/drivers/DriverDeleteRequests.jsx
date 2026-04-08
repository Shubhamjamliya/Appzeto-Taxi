const DriverDeleteRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeletedDrivers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('https://taxi-a276.onrender.com/api/v1/admin/drivers/deleted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedDrivers();
  }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('Restore driver account?')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/deleted/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Driver restored');
        fetchDeletedDrivers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE DRIVER? This cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/deleted/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Driver deleted permanently');
        fetchDeletedDrivers();
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filteredDrivers = drivers.filter(req => {
    const name = req.name || req.user_id?.name || 'Unknown';
    const mobile = req.mobile || 'Unknown';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || mobile.includes(searchTerm);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Accessing Secure Archive...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none uppercase tracking-tighter">Archive Queue</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none">Security</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Driver Deletion Queue</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-950 px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Download size={16} className="text-gray-400" /> Export Blacklist
            </button>
         </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-gray-400">
            Total Archivists: {drivers.length}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Search archive..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[20px] text-[13px] font-bold focus:bg-white focus:border-rose-100 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Captain</th>
                <th className="px-6 py-6">Deletion Date</th>
                <th className="px-6 py-6 font-bold uppercase tracking-widest">Mobile Number</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDrivers.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-8 py-24 text-center opacity-30">
                      <div className="flex flex-col items-center gap-4 text-center">
                         <UserX size={64} strokeWidth={1} />
                         <p className="text-[14px] font-black uppercase tracking-widest text-gray-950">No Deleted Captains Found</p>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredDrivers.map((req) => (
                  <tr key={req._id} className="group hover:bg-rose-50/10 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center font-black text-[12px] shadow-lg group-hover:scale-110 transition-transform">
                           {(req.name || req.user_id?.name || 'C')[0]}
                        </div>
                        <p className="text-[14px] font-black text-gray-950 tracking-tight leading-none uppercase">{req.name || req.user_id?.name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tight italic">{req.deletedAt ? new Date(req.deletedAt).toLocaleDateString() : 'N/A'}</span>
                    </td>
                    <td className="px-6 py-6 font-black text-[14px] text-gray-950 tracking-tight">
                       {req.mobile || req.user_id?.mobile || 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            disabled={isSubmitting}
                            onClick={() => handleRestore(req._id)}
                            className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 border border-emerald-100"
                            title="Restore Account"
                          >
                             <RotateCcw size={14} /> Restore
                          </button>
                          <button 
                             disabled={isSubmitting}
                             onClick={() => handlePermanentDelete(req._id)}
                             className="p-2 text-gray-300 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                             title="Permanent Deletion"
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

        {/* FOOTER */}
        <div className="p-8 bg-gray-50/20 border-t border-gray-50 flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
           <p>Archive Registry: {filteredDrivers.length} units</p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-100 rounded-xl hover:text-gray-950 disabled:opacity-30 transition-all font-black text-gray-400" disabled>PREV</button>
              <button className="w-10 h-10 bg-rose-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-rose-100">1</button>
              <button className="px-4 py-2 border border-gray-100 rounded-xl hover:text-gray-950 disabled:opacity-30 transition-all font-black text-gray-400" disabled>NEXT</button>
           </div>
        </div>
      </div>

      {/* SECURITY NOTICE */}
      <div className="bg-rose-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4">
            <AlertCircle size={100} strokeWidth={1} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h4 className="text-[14px] font-black uppercase tracking-[0.15em] mb-3 text-rose-400">Deletion Integrity Protocol</h4>
            <p className="text-[12px] font-bold text-rose-200/80 leading-relaxed italic">
               "Restoring a driver reactivates their earnings dashboard immediately. Permanent deletion is irreversible and removes all KYC data from our active mirrors while following 90-day retention policies."
            </p>
         </div>
      </div>

    </div>
  );
};

export default DriverDeleteRequests;
