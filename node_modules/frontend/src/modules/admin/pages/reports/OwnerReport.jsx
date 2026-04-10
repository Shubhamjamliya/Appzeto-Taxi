import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar,
  MapPin,
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { triggerFileDownload } from '../../../../shared/utils/downloadHelper';

const OwnerReport = () => {
  const [filters, setFilters] = useState({
    service_location_id: '',
    approval_status: '',
    date_option: '',
    file_format: ''
  });

  const [locations, setLocations] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOwners: 0, activeOwners: 0, growthRate: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, dashboardRes] = await Promise.all([
          adminService.getServiceLocations(),
          adminService.getDashboardData()
        ]);

        if (locationsRes.success) {
          setLocations(locationsRes.data?.results || locationsRes.data || []);
        }
        
        if (dashboardRes.success) {
          setStats({
            totalOwners: dashboardRes.data?.total_owners || 0,
            activeOwners: dashboardRes.data?.active_owners || 0,
            growthRate: dashboardRes.data?.owner_growth || 12.5
          });
        }
      } catch (err) {
        console.error('Error fetching owner report meta-data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await adminService.downloadOwnerReport(filters);

      const success = triggerFileDownload(response, `owner_report_${Date.now()}`, filters.file_format);
      if (success) {
        alert('Owner report generated and downloaded!');
      } else {
        throw new Error('Download trigger failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate owner report. Please check your filter settings.');
    } finally {
      setIsDownloading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = filters.approval_status && filters.date_option && filters.file_format;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans text-gray-950">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight uppercase mb-2 leading-none">Owner Report</h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span className="hover:text-primary cursor-pointer transition-colors">Owner Report</span>
            <ChevronRight size={12} strokeWidth={4} />
            <span className="text-gray-900 border-b-2 border-primary/30">Owner Report</span>
          </div>
        </div>
      </div>

      {/* Main filter container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden"
      >
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Briefcase size={200} strokeWidth={1} />
        </div>

        <div className="p-8 md:p-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
            {/* Select Service Location */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[12px] font-black text-gray-400 uppercase tracking-widest pl-1">
                Select Service Location <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                  <MapPin size={20} />
                </div>
                <select 
                  value={filters.service_location_id}
                  onChange={(e) => updateFilter('service_location_id', e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[15px] font-bold text-gray-950 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100/50"
                >
                  <option value="">Select Service Location</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                  <option value="all">Global (All Locations)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} className="rotate-90" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Select Approval Status */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[12px] font-black text-gray-400 uppercase tracking-widest pl-1">
                Select Approval Status <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                  <ShieldCheck size={20} />
                </div>
                <select 
                  value={filters.approval_status}
                  onChange={(e) => updateFilter('approval_status', e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[15px] font-bold text-gray-950 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100/50"
                >
                  <option value="">Select</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} className="rotate-90" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Date Option */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[12px] font-black text-gray-400 uppercase tracking-widest pl-1">
                Date Option <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                  <Calendar size={20} />
                </div>
                <select 
                  value={filters.date_option}
                  onChange={(e) => updateFilter('date_option', e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[15px] font-bold text-gray-950 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100/50"
                >
                  <option value="">Select</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_year">This Year</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} className="rotate-90" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* File Format */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[12px] font-black text-gray-400 uppercase tracking-widest pl-1">
                File Format <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                  <FileText size={20} />
                </div>
                <select 
                  value={filters.file_format}
                  onChange={(e) => updateFilter('file_format', e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[15px] font-bold text-gray-950 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100/50"
                >
                  <option value="">Select File Format</option>
                  <option value="csv">CSV (Comma Separated)</option>
                  <option value="xlsx">Excel Workbook (.xlsx)</option>
                  <option value="pdf">PDF Document</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} className="rotate-90" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-gray-50 mt-4">
            <button 
              onClick={handleDownload}
              disabled={!isFormValid || isDownloading}
              className={`flex items-center gap-4 px-12 py-5 rounded-[24px] font-black text-[13px] uppercase tracking-[0.2em] transition-all duration-500 ${
                (!isFormValid || isDownloading)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                : 'bg-gray-950 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] hover:bg-primary hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={20} strokeWidth={3} />
              )}
              {isDownloading ? 'Processing...' : 'Download Report'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Insights Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[36px] border border-gray-100 flex items-center gap-6 shadow-sm group">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[10deg]">
            <Users size={28} strokeWidth={2.5} />
          </div>
          <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Franchise Owners</p>
             <p className="text-2xl font-black text-gray-950">{loading ? '...' : stats.totalOwners.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[36px] border border-gray-100 flex items-center gap-6 shadow-sm group">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-[10deg]">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Actively Operating</p>
             <p className="text-2xl font-black text-gray-950">{loading ? '...' : stats.activeOwners.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[36px] border border-gray-100 flex items-center gap-6 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-primary to-transparent w-full h-full pointer-events-none"></div>
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[24px] flex items-center justify-center transition-all group-hover:bg-amber-600 group-hover:text-white group-hover:rotate-[10deg]">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MoM Growth Rate</p>
             <p className="text-2xl font-black text-emerald-600">+{loading ? '...' : stats.growthRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerReport;
