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

const FleetDrivers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);

  const token = localStorage.getItem('adminToken') || '';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetching all drivers but filtering for those belonging to an owner (fleet)
      // Usually the owner-management backend has a specific endpoint or we filter.
      // Assuming drivers with 'owner_id' != null are fleet drivers.
      const res = await fetch(`${BASE}/drivers?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        const allDrivers = json.data?.results || [];
        // Only show approved drivers who belong to an owner
        const fleetList = allDrivers.filter(d => d.approve === true && (d.owner_id || d.fleet_id));
        setDrivers(fleetList);
      }
    } catch (err) {
      console.error('Failed to fetch fleet drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (action, id) => {
    if (action === 'view') navigate(`/admin/drivers/${id}`);
    else if (action === 'edit') navigate(`/admin/drivers/edit/${id}`);
    setActiveMenu(null);
  };

  const filtered = drivers.filter(d =>
    (d.name || d.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.mobile || d.user_id?.mobile || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-1 font-sans">
      <div className="flex items-center justify-between mb-8 px-1 text-gray-950">
        <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">Fleet Active Drivers</h1>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Fleet Management</span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-gray-950 font-black tracking-widest">Active Drivers</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:border-indigo-200 transition-all w-64 shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-indigo-600 transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/drivers/create')}
            className="bg-[#2D3A6E] hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={2.5} /> Add New Driver
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                {['Driver Info', 'Owner / Fleet', 'Vehicle', 'Area', 'Status', 'Wallet', 'Actions'].map(col => (
                  <th key={col} className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <Loader2 className="animate-spin" size={36} />
                      <span className="text-[12px] font-black uppercase tracking-widest">Gathering Fleet Intelligence...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-28 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-200">
                      <User size={48} strokeWidth={1} />
                      <p className="text-[14px] font-black uppercase tracking-widest text-gray-300">No Fleet Drivers Found</p>
                      <p className="text-[12px] text-gray-400 font-bold max-w-xs mx-auto">No drivers currently associated with a fleet owner were found in our records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((driver) => (
                  <tr key={driver._id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#E8F1FF] flex items-center justify-center text-[#2D3A6E] font-black text-[14px] shadow-inner group-hover:scale-110 transition-transform">
                          {driver.profile_pic ? (
                            <img src={driver.profile_pic} alt="" className="w-full h-full rounded-2xl object-cover" />
                          ) : (
                            (driver.name || driver.user_id?.name || 'D').charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-900 tracking-tight">{driver.name || driver.user_id?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                              <Phone size={10} /> {driver.mobile || driver.user_id?.mobile || 'N/A'}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                              <Mail size={10} /> {driver.email || driver.user_id?.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider shadow-sm shadow-indigo-50">
                        {driver.owner_id?.company_name || driver.fleet_id?.name || 'Global Fleet'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-gray-700 flex items-center gap-1.5 uppercase">
                          <Car size={14} className="text-gray-400" /> {driver.car_type || 'Taxi'}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 ml-5">{driver.car_number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-bold text-gray-600 flex items-center gap-1.5 tracking-tight uppercase">
                        <MapPin size={12} className="text-gray-300" /> {driver.service_location_id?.service_location_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm shadow-emerald-50">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[13px] font-black text-gray-950">₹{(driver.wallet?.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === driver._id ? null : driver._id)}
                        className="w-10 h-10 ml-auto flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 shadow-sm overflow-visible"
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
                              className="absolute right-16 top-0 z-30 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 min-w-[160px] text-left ring-1 ring-black/5"
                            >
                              <button onClick={() => handleAction('view', driver._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest">
                                <Eye size={16} /> View Profile
                              </button>
                              <button onClick={() => handleAction('edit', driver._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest">
                                <Eye size={16} /> Edit Driver
                              </button>
                              <div className="h-px bg-gray-50 my-1 mx-2" />
                              <button onClick={() => handleAction('block', driver._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest">
                                <XCircle size={16} /> Block Driver
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

export default FleetDrivers;
