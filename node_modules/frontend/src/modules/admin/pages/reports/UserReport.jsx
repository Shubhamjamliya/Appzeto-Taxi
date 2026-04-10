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
  FileSpreadsheet,
  FileJson,
  FileCode
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { triggerFileDownload } from '../../../../shared/utils/downloadHelper';

const UserReport = () => {
  const [status, setStatus] = useState('');
  const [dateOption, setDateOption] = useState('');
  const [fileFormat, setFileFormat] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await adminService.downloadUserReport({ 
        status, 
        date_option: dateOption, 
        file_format: fileFormat 
      });

      const success = triggerFileDownload(response, `user_report_${Date.now()}`, fileFormat);
      if (success) {
        alert('User report downloaded successfully!');
      } else {
        throw new Error('Trigger failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate report. Please check server availability.');
    } finally {
      setIsDownloading(false);
    }
  };

  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, newRequests: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardData();
        setStats({
          totalUsers: data.total_users || 0,
          activeToday: data.active_users || 0,
          newRequests: data.new_requests || 0
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">User Report</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">User Report</span>
            <ChevronRight size={12} strokeWidth={3} />
            <span className="text-primary italic">User Report</span>
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
            {/* Select Status */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Select Status <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Filter size={18} />
                </div>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[15px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select User Status</option>
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="pending">Pending Verification</option>
                  <option value="blocked">Blocked Users</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
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
                  value={dateOption}
                  onChange={(e) => setDateOption(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[15px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
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
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[15px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select File Format</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="excel">Excel Document</option>
                  <option value="pdf">PDF Document</option>
                  <option value="json">JSON Data</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50 mt-10">
            <button 
              onClick={handleDownload}
              disabled={!status || !dateOption || !fileFormat || isDownloading}
              className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all ${
                (!status || !dateOption || !fileFormat || isDownloading)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white shadow-xl shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/30 active:translate-y-[1px]'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
              {isDownloading ? 'Generating...' : 'Download'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Placeholder for Data visualization or recent reports */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Today</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.activeToday.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Requests</p>
             <p className="text-lg font-black text-gray-900">{loading ? '...' : stats.newRequests.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReport;
