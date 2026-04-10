import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar,
  MapPin,
  User,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { triggerFileDownload } from '../../../../shared/utils/downloadHelper';

const DriverDutyReport = () => {
  const [filters, setFilters] = useState({
    service_location_id: '',
    driver: '',
    date_option: '',
    file_format: ''
  });

  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, locationsRes] = await Promise.all([
          adminService.getDrivers(1, 500),
          adminService.getServiceLocations()
        ]);

        // Mapping Drivers properly based on typical backend response
        if (driversRes.success) {
          const rawDrivers = driversRes.data?.results || driversRes.data || [];
          const mappedDrivers = rawDrivers.map(d => ({
            _id: d._id,
            name: d.name || d.user_id?.name || 'Unknown Driver',
            mobile: d.mobile || d.user_id?.mobile || ''
          }));
          setDrivers(mappedDrivers);
        }

        // Mapping Locations properly
        if (locationsRes.success) {
          const rawLocations = locationsRes.data?.results || locationsRes.data || [];
          setLocations(rawLocations);
        }
      } catch (err) {
        console.error('Error fetching duty report meta-data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await adminService.downloadDriverDutyReport(filters);

      const success = triggerFileDownload(response, `driver_duty_${Date.now()}`, filters.file_format);
      if (success) {
        alert('Driver duty report downloaded successfully!');
      } else {
        throw new Error('Trigger failure');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate duty report. Please ensure a driver and date are selected.');
    } finally {
      setIsDownloading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = filters.driver && filters.date_option && filters.file_format;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Driver Duty Report</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">Driver Duty Report</span>
            <ChevronRight size={12} strokeWidth={3} />
            <span className="text-primary italic">Driver Duty Report</span>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Service Location */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Service Location <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <MapPin size={18} />
                </div>
                <select 
                  value={filters.service_location_id}
                  onChange={(e) => updateFilter('service_location_id', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                  <option value="test">India - New Delhi</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Driver */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                Driver <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <select 
                  value={filters.driver}
                  onChange={(e) => updateFilter('driver', e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl text-[14px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.mobile})</option>
                  ))}
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
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* File Format */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-black text-gray-700 uppercase tracking-wider">
                File Format
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
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
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

      {/* Stats Board for context */}
      <div className="mt-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm border-l-4 border-l-primary">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shadow-inner">
            <Clock size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Punctuality</p>
             <p className="text-xl font-black text-gray-900">98.2%</p>
          </div>
          <div className="ml-auto text-emerald-500 flex items-center gap-1 font-bold text-[12px]">
             <ArrowUpRight size={14} /> +0.4%
          </div>
        </div>
        <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm border-l-4 border-l-indigo-500">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
            <CheckCircle2 size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved Records</p>
             <p className="text-xl font-black text-gray-900">12,401</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDutyReport;
