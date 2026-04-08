import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronRight,
  FileText,
  Edit,
  Lock,
  Trash2,
  Eye,
  ChevronDown,
  LayoutGrid,
  List,
  Check,
  Loader2,
  XCircle,
  AlertTriangle,
  MapPin,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { adminService } from '../../services/adminService';

const ManageOwners = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Areas - Initially empty for pure dynamic mapping
  const [areas, setAreas] = useState([]);

  const [transportTypes, setTransportTypes] = useState([
    { transport_type: 'taxi' },
    { transport_type: 'delivery' },
    { transport_type: 'intercity' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    mobile: '',
    email: '',
    password: '',
    password_confirmation: '',
    service_location_id: '',
    transport_type: ''
  });

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // PRO-LEVEL: Standardized async fetching
      const [oData, aData, rData] = await Promise.all([
        adminService.getOwners(),
        adminService.getServiceLocations(),
        adminService.getRideModules()
      ]);

      if (oData.success) {
        setOwners(oData.data?.results || []);
      }

      // Robust mapping for service locations
      if (aData.success) {
        const locs = Array.isArray(aData.data) ? aData.data : (aData.data?.results || []);
        setAreas(locs);
        // Auto-select first area if creating and it exists
        if (locs.length > 0 && view === 'create' && !formData.service_location_id) {
          setFormData(prev => ({ ...prev, service_location_id: locs[0]._id }));
        }
      }

      if (rData.success) {
        const raw = rData.data;
        const mapped = Array.isArray(raw) ? raw : Object.keys(raw).map(k => ({ transport_type: k }));
        if (mapped.length > 0) setTransportTypes(mapped);
      }
    } catch (err) {
      console.error("Owner fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [view]); // Refetch when view changes to ensure fresh data

  const handleEditClick = (owner) => {
    setEditingId(owner._id);
    setFormData({
      company_name: owner.company_name || '',
      name: owner.name || owner.company_name || '',
      mobile: owner.mobile || '',
      email: owner.email || '',
      password: '',
      password_confirmation: '',
      service_location_id: owner.service_location_id || owner.area_id || '',
      transport_type: owner.transport_type || ''
    });
    setView('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEditing = view === 'edit';

    if (!isEditing && formData.password !== formData.password_confirmation) {
      alert("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const json = isEditing
        ? await adminService.updateOwner(editingId, formData)
        : await adminService.createOwner(formData);

      if (json.success) {
        setView('list');
        fetchInitialData();
        setFormData({ company_name: '', name: '', mobile: '', email: '', password: '', password_confirmation: '', service_location_id: '', transport_type: '' });
      } else {
        alert(json.message || `Failed to ${isEditing ? 'update' : 'create'} owner`);
      }
    } catch (err) {
      alert(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const json = await adminService.updateOwner(id, { active: !currentStatus });
      if (json.success) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, active: !currentStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this owner?')) return;
    try {
      const json = await adminService.approveOwner(id, { approve: true });
      if (json.success) fetchInitialData();
      else alert(json.message || 'Approval failed');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this owner?')) return;
    try {
      const json = await adminService.deleteOwner(id);
      if (json.success) fetchInitialData();
      else alert(json.message || 'Delete failed');
    } catch (err) { alert('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-transparent p-1 font-sans">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8 overflow-hidden px-1">
              <div>
                <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">Owner Management</h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="hover:text-indigo-600 transition-colors cursor-pointer">Owners</span>
                <ChevronRight size={12} className="opacity-50" />
                <span className="text-gray-950 font-black">Manage Fleet Owners</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 bg-indigo-950 text-white rounded-xl flex items-center justify-center shadow-xl"><List size={18} /></button>
                  <button className="w-10 h-10 bg-white border border-gray-100 text-gray-300 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><LayoutGrid size={18} /></button>
                  <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 ml-4 uppercase tracking-[0.2em]">
                    show
                    <div className="relative">
                      <select className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 outline-none font-black text-gray-900 shadow-sm mx-2 appearance-none pr-8">
                        <option>10</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                    entries
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 text-gray-300" size={16} />
                    <input
                      type="text"
                      placeholder="Search Partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 h-11 bg-white border border-gray-100 rounded-full text-[13px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 transition-all w-64 shadow-inner"
                    />
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                    <Filter size={16} /> Filters
                  </button>
                  <button onClick={() => { setFormData({ company_name: '', name: '', mobile: '', email: '', password: '', password_confirmation: '', service_location_id: '', transport_type: '' }); setView('create'); }} className="bg-indigo-950 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-2xl active:scale-95 uppercase tracking-widest">
                    <Plus size={20} strokeWidth={2.5} /> Add Fleet Owner
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-50">
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Company Profile</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Contact Channel</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Tele-Connectivity</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Verification</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">Approval</th>
                      <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 py-10 opacity-40">
                            <Loader2 size={32} className="animate-spin text-indigo-950" />
                            <p className="text-[12px] font-black uppercase tracking-widest">Indexing Partners...</p>
                          </div>
                        </td>
                      </tr>
                    ) : owners.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 py-10 opacity-20">
                            <XCircle size={48} strokeWidth={1.5} />
                            <p className="text-[14px] font-black uppercase tracking-widest">No Partners Found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      owners.filter(o =>
                        o.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((owner) => (
                        <tr key={owner._id} className="hover:bg-indigo-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600">
                          <td className="px-8 py-6">
                            <div className="flex flex-col truncate">
                              <span className="text-[14px] font-black text-gray-950 tracking-tight group-hover:text-indigo-600 transition-all uppercase">{owner.company_name || owner.name}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-tight">{owner.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[13px] font-bold text-gray-600 truncate">{owner.email}</td>
                          <td className="px-8 py-6 text-[13px] font-bold text-gray-600 whitespace-nowrap">{owner.mobile}</td>
                          <td className="px-8 py-6">
                            <button className="w-9 h-11 bg-white border border-gray-100 text-indigo-950 rounded-xl flex items-center justify-center hover:bg-indigo-950 hover:text-white transition-all shadow-sm">
                              <FileText size={18} />
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleToggleStatus(owner._id, owner.active)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${owner.active ? 'bg-emerald-500 shadow-emerald-100' : 'bg-gray-200'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${owner.active ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => handleEditClick(owner)} className="p-2.5 bg-white border border-gray-100 text-amber-500 rounded-xl hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"><Edit size={16} /></button>
                              <button className="p-2.5 bg-white border border-gray-100 text-indigo-500 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"><Lock size={16} /></button>
                              <button onClick={() => handleDelete(owner._id)} className="p-2.5 bg-white border border-gray-100 text-rose-500 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"><Trash2 size={16} /></button>
                              <button className="p-2.5 bg-white border border-gray-100 text-teal-500 rounded-xl hover:bg-teal-50 hover:border-teal-100 transition-all shadow-sm"><Eye size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-8 flex items-center justify-between bg-gray-50/50 border-t border-gray-50">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Index Mapping: 1 to {owners.length} Summary</span>
                <div className="flex items-center gap-1.5">
                  <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Prev</button>
                  <button className="w-10 h-10 rounded-xl bg-indigo-950 text-white text-[13px] font-black shadow-xl shadow-indigo-100">1</button>
                  <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Next</button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8 overflow-hidden px-1">
              <div>
                <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">{view === 'edit' ? 'Edit Partner' : 'Create Owner'}</h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                <span className="hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => setView('list')}>Manage Owners</span>
                <ChevronRight size={12} className="opacity-50" />
                <span className="text-gray-800 uppercase tracking-widest">{view === 'edit' ? 'Refine Credentials' : 'New Registration'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-10">
                <div className="mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    {view === 'edit' ? <Edit size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black text-gray-800 tracking-tight leading-none">Account Configuration</h2>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{view === 'edit' ? 'Update partner profile details' : 'Establish new fleet partner credentials'}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Enter Company Name"
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter Owner Name"
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number *</label>
                    <div className="flex gap-0 group h-12">
                      <div className="px-4 bg-indigo-950 text-white border-none rounded-l-xl flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/in.png" alt="IN" className="w-5 h-3.5 object-cover rounded-sm" />
                        <span className="text-[14px] font-black">+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="Enter Number"
                        className="flex-1 px-5 bg-gray-50 border-none rounded-r-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter Business Email"
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">{view === 'edit' ? 'Update Password (optional)' : 'Create Password *'}</label>
                    <input
                      type="password"
                      required={view === 'create'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">{view === 'edit' ? 'Verify New Password' : 'Confirm Password *'}</label>
                    <input
                      type="password"
                      required={view === 'create'}
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                      <MapPin size={14} className="text-indigo-400" /> Select Operating Area *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.service_location_id}
                        onChange={(e) => setFormData({ ...formData, service_location_id: e.target.value })}
                        className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                      >
                        <option value="">Select Area</option>
                        {areas.length > 0 ? (
                          areas.map(a => (
                            <option key={a._id} value={a._id}>
                              {a.service_location_name || a.name || 'Unknown Area'}
                            </option>
                          ))
                        ) : (
                          <option disabled>No areas available from API</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                      <Globe size={14} className="text-indigo-400" /> Transport Module *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.transport_type}
                        onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                        className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                      >
                        <option value="">Select Transport Type</option>
                        {transportTypes.map((t, idx) => (
                          <option key={idx} value={t.transport_type}>
                            {t.transport_type.charAt(0).toUpperCase() + t.transport_type.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-8 py-3 text-[14px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                    >
                      Back to Fleet
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-950 hover:bg-black text-white px-10 py-3 rounded-xl text-[14px] font-black flex items-center gap-3 transition-all shadow-2xl disabled:opacity-50 active:scale-95"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <>{view === 'edit' ? 'Update Credentials' : 'Create Partner'} <Check size={18} strokeWidth={3} /></>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOwners;
