import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight,
  Loader2,
  X,
  MoreVertical,
  Minus
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const OnboardingScreens = () => {
  const [loading, setLoading] = useState(true);
  const [screens, setScreens] = useState([]);
  const [entries, setEntries] = useState(10);
  
  // We'll fetch all roles together or just one by one as they are presented in the screenshot
  // In the screenshot there are both 'user' and 'driver' screens shown in one table!
  // So we need to fetch user, driver, and owner and combine them.

  const fetchAllScreens = async () => {
    try {
      setLoading(true);
      const [userRes, driverRes, ownerRes] = await Promise.all([
        adminService.getOnboardingScreens('user'),
        adminService.getOnboardingScreens('driver'),
        adminService.getOnboardingScreens('owner').catch(() => ({ results: [] }))
      ]);
      
      const combined = [
        ...(userRes.results || userRes.data?.results || []),
        ...(driverRes.results || driverRes.data?.results || []),
        ...(ownerRes.results || ownerRes.data?.results || [])
      ];
      
      setScreens(combined);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load screens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllScreens();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans">
      
      {/* Top Header / Breadcrumb Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Onboarding Screen</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Onboarding Screen</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Onboarding Screen</span>
        </div>
      </div>

      <div className="p-8">
        {/* Main Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
          
          {/* Table Controls */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 text-[14px] text-gray-500">
              <span>show</span>
              <select 
                value={entries} 
                onChange={(e) => setEntries(e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-y border-gray-100">
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Screen</th>
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Screen Order</th>
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Onboarding Title</th>
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 whitespace-nowrap">Description</th>
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-[13px] font-black text-gray-700 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {loading ? (
                   [...Array(entries)].map((_, i) => (
                     <tr key={i} className="animate-pulse">
                       <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                     </tr>
                   ))
                ) : screens.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">No data available in table</td>
                  </tr>
                ) : (
                  screens.slice(0, entries).map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 text-[13px] text-gray-600">{s.screen}</td>
                      <td className="px-6 py-5 text-[13px] text-gray-600">{s.order}</td>
                      <td className="px-6 py-5 text-[13px] text-gray-600 font-bold">{s.title}</td>
                      <td className="px-6 py-5 text-[12px] text-gray-500 leading-relaxed max-w-xl">{s.description}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black text-white ${s.active ? 'bg-[#28A745]' : 'bg-gray-300'}`}>
                          {s.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="text-gray-400 hover:text-indigo-600 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Area */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div className="text-[13px] text-gray-500 font-medium tracking-tight">
              Showing 1 to {Math.min(entries, screens.length)} of {screens.length} entries
            </div>
            <div className="flex items-center gap-0 tracking-tight">
              <button className="px-3 py-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-medium">Prev</button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#3F51B5] text-white rounded-[4px] text-[13px] font-bold shadow-md">1</button>
              <button className="px-3 py-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-medium">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => toast.error('Management is currently Seed Only')}
        className="fixed bottom-10 right-10 w-12 h-12 bg-[#00A99D] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <Minus size={24} strokeWidth={3} className="rotate-90" />
      </button>

    </div>
  );
};

export default OnboardingScreens;
