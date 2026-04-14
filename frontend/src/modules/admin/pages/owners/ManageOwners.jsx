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
  Menu,
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

const MotionDiv = motion.div;

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
      alert(error.message || 'Delete failed');
    }
  };

  const filteredOwners = owners.filter((owner) =>
    owner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMobile = (mobile) => {
    if (!mobile) return '-';
    return mobile.startsWith('+') ? mobile : `+91${mobile}`;
  };

  const visibleStart = filteredOwners.length > 0 ? 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <MotionDiv
            key="list"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold uppercase tracking-wide text-slate-700">Manage Owners</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-slate-900">Manage Owners</span>
                <ChevronRight size={14} />
                <span>Manage Owners</span>
              </div>
            </div>

            <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-5 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <button className="flex h-11 w-14 items-center justify-center rounded-lg bg-teal-500 text-white transition-colors hover:bg-teal-600">
                    <List size={17} />
                  </button>
                  <button className="flex h-11 w-14 items-center justify-center rounded-lg bg-gray-200 text-indigo-950 transition-colors hover:bg-gray-300">
                    <LayoutGrid size={16} />
                  </button>
                  <div className="ml-5 flex items-center gap-3 text-sm font-semibold text-slate-400">
                    show
                    <div className="relative">
                      <select className="h-9 w-24 appearance-none rounded border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                        <option>10</option>
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700" />
                    </div>
                    entries
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-600"
                  >
                    <Search size={17} />
                  </button>
                  <button className="flex h-12 items-center gap-2 rounded bg-red-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                    <Filter size={15} /> Filters
                  </button>
                  <button
                    onClick={() => navigate('/owner/create')}
                    className="flex h-12 items-center gap-3 rounded bg-indigo-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-900"
                  >
                    <Plus size={16} /> Add Manage Owner
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Company Name</th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Email</th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Mobile Number</th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Document View</th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Approval Status</th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-950">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 py-10 text-slate-400">
                            <Loader2 size={32} className="animate-spin text-teal-500" />
                            <p className="text-sm font-semibold">Loading owners...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOwners.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 py-10 text-slate-300">
                            <XCircle size={48} strokeWidth={1.5} />
                            <p className="text-sm font-semibold">No owners found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOwners.map((owner) => (
                        <tr key={owner._id} className="bg-white transition-colors hover:bg-gray-50">
                          <td className="px-8 py-6 text-sm font-medium text-gray-950">{owner.company_name || owner.name || '-'}</td>
                          <td className="px-8 py-6 text-sm text-gray-950">{owner.email || '-'}</td>
                          <td className="px-8 py-6 text-sm text-gray-950">{formatMobile(owner.mobile)}</td>
                          <td className="px-8 py-6">
                            <button className="text-indigo-950 transition-colors hover:text-indigo-700">
                              <FileText size={31} fill="currentColor" strokeWidth={1.5} />
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleToggleStatus(owner._id, owner.active)}
                              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
                                owner.active ? 'bg-teal-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                  owner.active ? 'translate-x-9' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <button
                                onClick={() => handleEditClick(owner)}
                                className="flex h-9 w-10 items-center justify-center rounded bg-amber-50 text-amber-500 transition-colors hover:bg-amber-100"
                              >
                                <Edit size={17} />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/owners/${owner._id || owner.id}/password`)}
                                className="flex h-9 w-10 items-center justify-center rounded bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                              >
                                <Lock size={17} />
                              </button>
                              <button
                                onClick={() => handleDelete(owner._id)}
                                className="flex h-9 w-10 items-center justify-center rounded bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                              >
                                <Trash2 size={17} />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/owners/${owner._id || owner.id}`)}
                                className="flex h-9 w-10 items-center justify-center rounded bg-teal-50 text-teal-500 transition-colors hover:bg-teal-100"
                              >
                                <Eye size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="absolute -right-1 top-[58%] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 text-white shadow-xl transition-colors hover:bg-teal-600"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">
                Showing {visibleStart} to {filteredOwners.length} of {filteredOwners.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button className="rounded border border-gray-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-gray-50">
                  Prev
                </button>
                <button className="rounded bg-indigo-950 px-4 py-2 text-sm font-semibold text-white">
                  1
                </button>
                <button className="rounded border border-gray-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
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
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOwners;
