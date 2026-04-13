import React, { useEffect, useState } from 'react';
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
  Loader2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { adminService } from '../../services/adminService';
import OwnerFormPanel from './OwnerFormPanel';

const initialFormData = {
  company_name: '',
  name: '',
  mobile: '',
  email: '',
  password: '',
  password_confirmation: '',
  service_location_id: '',
  transport_type: '',
};

const defaultTransportTypes = [
  { transport_type: 'all' },
  { transport_type: 'taxi' },
  { transport_type: 'delivery' },
  { transport_type: 'intercity' },
];

const ManageOwners = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [areas, setAreas] = useState([]);
  const [transportTypes, setTransportTypes] = useState(defaultTransportTypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [ownersResponse, locationsResponse, modulesResponse] = await Promise.all([
        adminService.getOwners(),
        adminService.getServiceLocations(),
        adminService.getRideModules(),
      ]);

      if (ownersResponse.success) {
        setOwners(ownersResponse.data?.results || []);
      }

      if (locationsResponse.success) {
        const locations = Array.isArray(locationsResponse.data)
          ? locationsResponse.data
          : locationsResponse.data?.results || [];
        setAreas(locations);
      }

      if (modulesResponse.success) {
        const rawModules = modulesResponse.data;
        const mappedModules = Array.isArray(rawModules)
          ? rawModules
          : Object.keys(rawModules || {}).map((key) => ({ transport_type: key }));

        if (mappedModules.length > 0) {
          setTransportTypes(mappedModules);
        }
      }
    } catch (error) {
      console.error('Owner fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [view]);

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
      transport_type: owner.transport_type || '',
    });
    setView('edit');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await adminService.updateOwner(editingId, formData);

      if (response.success) {
        setView('list');
        setFormData(initialFormData);
        fetchInitialData();
      } else {
        alert(response.message || 'Failed to update owner');
      }
    } catch (error) {
      alert(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await adminService.updateOwner(id, { active: !currentStatus });
      if (response.success) {
        setOwners((currentOwners) =>
          currentOwners.map((owner) => (owner._id === id ? { ...owner, active: !currentStatus } : owner))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this owner?')) return;

    try {
      const response = await adminService.deleteOwner(id);
      if (response.success) {
        fetchInitialData();
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredOwners = owners.filter((owner) =>
    owner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <button className="w-10 h-10 bg-indigo-950 text-white rounded-xl flex items-center justify-center shadow-xl">
                    <List size={18} />
                  </button>
                  <button className="w-10 h-10 bg-white border border-gray-100 text-gray-300 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                    <LayoutGrid size={18} />
                  </button>
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
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-10 pr-4 h-11 bg-white border border-gray-100 rounded-full text-[13px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 transition-all w-64 shadow-inner"
                    />
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
                    <Filter size={16} /> Filters
                  </button>
                  <button
                    onClick={() => navigate('/owner/create')}
                    className="bg-indigo-950 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
                  >
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
                    ) : filteredOwners.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 py-10 opacity-20">
                            <XCircle size={48} strokeWidth={1.5} />
                            <p className="text-[14px] font-black uppercase tracking-widest">No Partners Found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOwners.map((owner) => (
                        <tr key={owner._id} className="hover:bg-indigo-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600">
                          <td className="px-8 py-6">
                            <div className="flex flex-col truncate">
                              <span className="text-[14px] font-black text-gray-950 tracking-tight group-hover:text-indigo-600 transition-all uppercase">
                                {owner.company_name || owner.name}
                              </span>
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
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                  owner.active ? 'bg-emerald-500 shadow-emerald-100' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    owner.active ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => handleEditClick(owner)}
                                className="p-2.5 bg-white border border-gray-100 text-amber-500 rounded-xl hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"
                              >
                                <Edit size={16} />
                              </button>
                              <button className="p-2.5 bg-white border border-gray-100 text-indigo-500 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm">
                                <Lock size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(owner._id)}
                                className="p-2.5 bg-white border border-gray-100 text-rose-500 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button className="p-2.5 bg-white border border-gray-100 text-teal-500 rounded-xl hover:bg-teal-50 hover:border-teal-100 transition-all shadow-sm">
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-8 flex items-center justify-between bg-gray-50/50 border-t border-gray-50">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Index Mapping: 1 to {filteredOwners.length} Summary
                </span>
                <div className="flex items-center gap-1.5">
                  <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                    Prev
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-indigo-950 text-white text-[13px] font-black shadow-xl shadow-indigo-100">
                    1
                  </button>
                  <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                    Next
                  </button>
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
            <OwnerFormPanel
              mode="edit"
              formData={formData}
              setFormData={setFormData}
              areas={areas}
              transportTypes={transportTypes}
              submitting={submitting}
              onSubmit={handleSave}
              onCancel={() => setView('list')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOwners;
