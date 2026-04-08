import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar,
  Car,
  Briefcase,
  Wallet,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { triggerFileDownload } from '../../../../shared/utils/downloadHelper';

const FinanceReport = () => {
  const [filters, setFilters] = useState({
    transport_type: '',
    vehicle_type: '',
    trip_status: 'completed',
    payment_type: '',
    date_option: '',
    file_format: ''
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [financeStats, setFinanceStats] = useState({ totalRevenue: 0, todayEarnings: 0, successRate: 0 });

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [statsRes, earningsRes] = await Promise.all([
          adminService.getDashboardData(),
          adminService.getOverallEarnings()
        ]);

        if (statsRes.success) {
          setFinanceStats(prev => ({
            ...prev,
            totalRevenue: statsRes.data?.total_earnings || 0,
            successRate: statsRes.data?.payment_success_rate || 99.4
          }));
        }
        
        if (earningsRes.success) {
          setFinanceStats(prev => ({
            ...prev,
            todayEarnings: earningsRes.data?.today || 0
          }));
        }
      } catch (err) {
        console.error('Error fetching finance report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await adminService.downloadFinanceReport(filters);

      const success = triggerFileDownload(response, `finance_report_${Date.now()}`, filters.file_format);
      if (success) {
        alert('Finance report generated successfully!');
      } else {
        throw new Error('Trigger fail');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate finance report. Please ensure Date Option and File Format are selected.');
    } finally {
      setIsDownloading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = filters.date_option && filters.file_format;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans text-gray-950">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Finance Report</h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">Finance Report</span>
            <ChevronRight size={12} strokeWidth={4} />
            <span className="text-primary italic border-b-2 border-primary/20">Finance Report</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-gray-100 shadow-[0_40px_70px_-20px_rgba(0,0,0,0.06)] overflow-hidden relative"
      >
        <div className="p-8 md:p-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Select Transport Type */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                Select Transport Type
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Car size={18} />
                </div>
                <select 
                  value={filters.transport_type}
                  onChange={(e) => updateFilter('transport_type', e.target.value)}
                  className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="taxi">Taxi / Cabs</option>
                  <option value="delivery">Delivery Service</option>
                  <option value="bike">Bike / Moto</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Select Vehicle Type */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                Select Vehicle Type
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Briefcase size={18} />
                </div>
                <select 
                  value={filters.vehicle_type}
                  onChange={(e) => updateFilter('vehicle_type', e.target.value)}
                  className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Trip Status (Radio Buttons) */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                Trip Status
              </label>
              <div className="flex items-center gap-8 py-3 px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="trip_status" 
                      value="completed" 
                      checked={filters.trip_status === 'completed'}
                      onChange={(e) => updateFilter('trip_status', e.target.value)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 peer-checked:border-primary peer-checked:shadow-[0_0_0_4px_rgba(255,107,0,0.1)] transition-all"></div>
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-[14px] font-bold text-gray-700 group-hover:text-primary transition-colors">Completed</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="trip_status" 
                      value="cancelled" 
                      checked={filters.trip_status === 'cancelled'}
                      onChange={(e) => updateFilter('trip_status', e.target.value)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 peer-checked:border-primary peer-checked:shadow-[0_0_0_4px_rgba(255,107,0,0.1)] transition-all"></div>
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-[14px] font-bold text-gray-700 group-hover:text-primary transition-colors">Cancelled</span>
                </label>
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                Payment Type
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Wallet size={18} />
                </div>
                <select 
                  value={filters.payment_type}
                  onChange={(e) => updateFilter('payment_type', e.target.value)}
                  className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Payment Type</option>
                  <option value="cash">Cash Payment</option>
                  <option value="card">Card / Network</option>
                  <option value="upi">UPI / Digital</option>
                  <option value="wallet">In-App Wallet</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Date Option */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                Date Option <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Calendar size={18} />
                </div>
                <select 
                  value={filters.date_option}
                  onChange={(e) => updateFilter('date_option', e.target.value)}
                  className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_year">This Year</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* File Format */}
            <div className="space-y-3">
              <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider pl-1">
                File Format <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <FileText size={18} />
                </div>
                <select 
                  value={filters.file_format}
                  onChange={(e) => updateFilter('file_format', e.target.value)}
                  className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select File Format</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="xlsx">Excel Document</option>
                  <option value="pdf">PDF Statements</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-gray-50 mt-10">
            <button 
              onClick={handleDownload}
              disabled={!isFormValid || isDownloading}
              className={`flex items-center gap-3 px-12 py-5 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${
                (!isFormValid || isDownloading)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#35489B] text-white shadow-2xl shadow-[#35489B]/30 hover:scale-[1.03] active:scale-[0.98]'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Finance Summary Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
              <IndianRupee size={80} />
           </div>
           <div className="flex items-center gap-5 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                 <IndianRupee size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Revenue</p>
           </div>
           <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{loading ? '...' : financeStats.totalRevenue.toLocaleString()}</p>
           <p className="text-[11px] font-bold text-emerald-500 mt-4 flex items-center gap-2">
              <ArrowUpRight size={14} /> +18.4% <span className="text-gray-400">vs last period</span>
           </p>
        </div>

        <div className="bg-[#111] p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
           <div className="absolute bottom-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
              <CheckCircle2 size={100} className="text-white" />
           </div>
           <div className="flex items-center gap-5 mb-8">
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                 <CreditCard size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Success</p>
           </div>
           <p className="text-3xl font-black text-white tracking-tighter">{loading ? '...' : financeStats.successRate}%</p>
           <p className="text-[11px] font-bold text-gray-500 mt-4">Verified gateway uptime active</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group">
           <div className="flex items-center gap-5 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                 <Clock size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Earnings</p>
           </div>
           <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{loading ? '...' : financeStats.todayEarnings.toLocaleString()}</p>
           <div className="h-1.5 w-full bg-gray-50 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
