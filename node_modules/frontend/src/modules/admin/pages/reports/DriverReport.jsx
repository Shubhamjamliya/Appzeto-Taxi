import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Car,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { triggerFileDownload } from '../../../../shared/utils/downloadHelper';

const DriverReport = () => {
  const [filters, setFilters] = useState({
    transport_type: '',
    vehicle_type: '',
    approval_status: '',
    date_option: '',
    file_format: ''
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [stats, setStats] = useState({ totalDrivers: 0, approvedDrivers: 0, onlineDrivers: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardData();
        setStats({
          totalDrivers: data.total_drivers || 0,
          approvedDrivers: data.approved_drivers || 0,
          onlineDrivers: data.online_drivers || 0
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await adminService.downloadDriverReport(filters);

      const success = triggerFileDownload(response, `driver_report_${Date.now()}`, filters.file_format);
      if (success) {
        alert('Driver report downloaded successfully!');
      } else {
        throw new Error('Trigger failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate report. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = filters.approval_status && filters.date_option && filters.file_format;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Driver Report</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">Driver Report</span>
            <ChevronRight size={12} strokeWidth={3} />
            <span className="text-primary italic">Driver Report</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Select Transport Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Select Transport Type
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Car size={18} />
                </div>
                <select 
                  value={filters.transport_type}
                  onChange={(e) => updateFilter('transport_type', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="taxi">Taxi / Cabs</option>
                  <option value="delivery">Delivery</option>
                  <option value="bike">Bike / Moto</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Select Vehicle Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Select Vehicle Type
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Briefcase size={18} />
                </div>
                <select 
                  value={filters.vehicle_type}
                  onChange={(e) => updateFilter('vehicle_type', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="mini">Mini / Hatchback</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Select Approval Status */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Select Approval Status <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <select 
                  value={filters.approval_status}
                  onChange={(e) => updateFilter('approval_status', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="disapproved">Disapproved</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Date Option */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Date Option <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Calendar size={18} />
                </div>
                <select 
                  value={filters.date_option}
                  onChange={(e) => updateFilter('date_option', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* File Format */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                File Format <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <FileText size={18} />
                </div>
                <select 
                  value={filters.file_format}
                  onChange={(e) => updateFilter('file_format', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select File Format</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="xlsx">Excel Workbook</option>
                  <option value="pdf">PDF Document</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50 mt-10">
            <button 
              onClick={handleDownload}
              disabled={!isFormValid || isDownloading}
              className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all ${
                (!isFormValid || isDownloading)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white shadow-xl shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/30 active:translate-y-[1px]'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Driver Context Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 translate-y-0 hover:translate-y-[-4px] transition-all shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Fleet</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.totalDrivers.toLocaleString()} Drivers</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 translate-y-0 hover:translate-y-[-4px] transition-all shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">KYC Approved</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.approvedDrivers.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 translate-y-0 hover:translate-y-[-4px] transition-all shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Signals</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.onlineDrivers.toLocaleString()} Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverReport;
