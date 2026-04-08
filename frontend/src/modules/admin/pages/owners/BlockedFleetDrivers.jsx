import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  Loader2,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Car
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = 'https://taxi-a276.onrender.com/api/v1/admin';

const BlockedFleetDrivers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  const token = localStorage.getItem('adminToken') || '';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Assuming blocked drivers have active=false or a specific status
      const res = await fetch(`${BASE}/owner-management/blocked-fleet-drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setDrivers(Array.isArray(json.data) ? json.data : (json.data?.results || []));
      }
    } catch (err) {
      console.error('Failed to fetch blocked fleet drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action, id) => {
    if (action === 'unblock') {
      if(!window.confirm('Unblock this driver?')) return;
      try {
        const res = await fetch(`${BASE}/owner-management/blocked-fleet-drivers/${id}`, {
          method: 'DELETE', // Usually deleting a block record or status
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        if(d.success) fetchData();
        else alert(d.message || "Failed to unblock");
      } catch(e) { alert("Network error"); }
    }
    setActiveMenu(null);
  };

  const filtered = drivers.filter(d =>
    (d.name || d.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.mobile || d.user_id?.mobile || d.phone || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-1 font-sans">
      <div className="flex items-center justify-between mb-8 px-1">
        <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase italic">Blocked Fleet Drivers</h1>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Fleet Management</span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-gray-950 font-black">Blocked Drivers</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-rose-500/20">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search blocked drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:border-rose-200 transition-all w-64 shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-xl text-rose-500 text-[11px] font-black uppercase tracking-widest">
            <XCircle size={16} /> Restricted Access Control
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                {['Driver Info', 'Fleet Owner', 'Blocking Reason', 'Area', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-center">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <Loader2 className="animate-spin text-rose-200 mx-auto" size={48} />
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-200 mt-4 block">Loading Restrictions...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-28 text-center">
                    <CheckCircle2 size={48} className="text-emerald-100 mx-auto" />
                    <p className="text-[12px] font-black uppercase tracking-widest text-gray-300 mt-4 underline decoration-emerald-200 decoration-wavy">Clean Slate</p>
                    <p className="text-[11px] text-gray-200 mt-1 uppercase font-bold tracking-[0.2em]">No restricted fleet drivers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((driver) => (
                  <tr key={driver._id} className="hover:bg-rose-50/10 transition-all group">
                    <td className="px-6 py-5 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 font-black text-[14px] shadow-inner group-hover:-scale-110 transition-transform">
                          { (driver.name || driver.user_id?.name || 'D').charAt(0) }
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-900 tracking-tight">{driver.name || driver.user_id?.name || 'Unknown'}</p>
                          <p className="text-[11px] font-bold text-gray-400 italic">ID: {driver._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 underline decoration-gray-100 underline-offset-4">
                      <span className="text-[11px] font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-wider">
                        {driver.owner_id?.company_name || 'Global Fleet'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest italic">{driver.reason || 'Safety Violation'}</span>
                        <span className="text-[10px] font-bold text-gray-300">{driver.updatedAt ? new Date(driver.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-bold text-gray-500 flex items-center justify-center gap-1.5 uppercase">
                        <MapPin size={12} className="text-gray-300" /> {driver.service_location_id?.service_location_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-rose-50">
                        <XCircle size={12} /> Restricted
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === driver._id ? null : driver._id)}
                        className="w-10 h-10 ml-auto flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <AnimatePresence>
                        {activeMenu === driver._id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className="absolute right-16 top-0 z-30 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 min-w-[160px] text-left"
                            >
                              <button onClick={() => navigate(`/admin/drivers/${driver._id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest">
                                <Eye size={16} /> Audit Trail
                              </button>
                              <div className="h-px bg-gray-50 my-1 mx-2" />
                              <button onClick={() => handleAction('unblock', driver._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest">
                                <CheckCircle2 size={16} /> Unblock Driver
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockedFleetDrivers;
