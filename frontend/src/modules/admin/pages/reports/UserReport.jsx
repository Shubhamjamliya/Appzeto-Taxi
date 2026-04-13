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
  ArrowLeft
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

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors appearance-none";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header Block */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Reports</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">User Report</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">User Report</h1>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Filter size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Report Filters</h3>
                <p className="text-xs text-gray-400">Select parameters for your user report</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Select Status */}
              <div>
                <label className={labelClass}>
                  <Filter size={12} className="inline mr-1 text-gray-400" />
                  Select Status *
                </label>
                <div className="relative">
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select User Status</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="pending">Pending Verification</option>
                    <option value="blocked">Blocked Users</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Date Option */}
              <div>
                <label className={labelClass}>
                  <Calendar size={12} className="inline mr-1 text-gray-400" />
                  Date Option *
                </label>
                <div className="relative">
                  <select 
                    value={dateOption}
                    onChange={(e) => setDateOption(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select Date Range</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* File Format */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  <FileText size={12} className="inline mr-1 text-gray-400" />
                  File Format *
                </label>
                <div className="relative">
                  <select 
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select File Format</option>
                    <option value="csv">CSV Spreadsheet</option>
                    <option value="excel">Excel Document</option>
                    <option value="pdf">PDF Document</option>
                    <option value="json">JSON Data</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleDownload}
                disabled={!status || !dateOption || !fileFormat || isDownloading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  (!status || !dateOption || !fileFormat || isDownloading)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isDownloading ? 'Generating...' : 'Download Report'}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Stats Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">User Statistics</h3>
                <p className="text-xs text-gray-400">Quick overview of user base</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-indigo-500 shadow-sm">
                    <Users size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Total Users</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{loading ? '...' : stats.totalUsers.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Active Today</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{loading ? '...' : stats.activeToday.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-amber-500 shadow-sm">
                    <Clock size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">New Requests</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{loading ? '...' : stats.newRequests.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Info/Help Card */}
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-semibold">Report Info</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Generate detailed user reports for analysis. Reports include user registration details, status changes, and activity logs.
            </p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button 
                className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors"
                onClick={() => alert('Documentation coming soon!')}
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReport;

