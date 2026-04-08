import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Search,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = 'https://taxi-a276.onrender.com/api/v1/admin';

const ManageFleet = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [fleet, setFleet] = useState([]);
  const [owners, setOwners] = useState([]); // Added owners state
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    owner_id: '', // Added owner_id
    service_location_id: '',
    transport_type: 'taxi',
    vehicle_type_id: '',
    car_brand: '',
    car_model: '',
    license_plate_number: '',
    car_color: ''
  });

  const token = localStorage.getItem('adminToken') || '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  /* ── Fetch initial data ── */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fleetRes, ownersRes, areasRes, rideRes] = await Promise.all([
        fetch(`${BASE}/owner-management/manage-fleet`, { headers }),
        fetch(`${BASE}/owner-management/manage-owners`, { headers }), // Fetching owners
        fetch(`${BASE}/service-locations`, { headers }),
        fetch(`https://taxi-a276.onrender.com/api/v1/common/ride_modules`, { headers })
      ]);

      const fData = await fleetRes.json();
      const oData = await ownersRes.json();
      const aData = await areasRes.json();
      const rData = await rideRes.json();

      if (fData.success) {
        setFleet(Array.isArray(fData.data) ? fData.data : (fData.data?.results || []));
      }

      if (oData.success) {
        const oList = oData.data?.results || oData.data || [];
        setOwners(Array.isArray(oList) ? oList : []);
        if (oList.length > 0 && !formData.owner_id) {
          setFormData(prev => ({ ...prev, owner_id: oList[0]._id }));
        }
      }

      if (aData.success) {
        const locs = Array.isArray(aData.data) ? aData.data : (aData.data?.results || []);
        setAreas(locs);
        if (locs.length > 0 && !formData.service_location_id) {
          setFormData(prev => ({ ...prev, service_location_id: locs[0]._id }));
        }
      }

      if (rData.success) {
        const raw = rData.data;
        const mapped = Array.isArray(raw) ? raw : Object.keys(raw).map(k => ({ transport_type: k }));
        setTransportTypes(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Fetch vehicle types based on Area ── */
  const fetchVehicleTypes = async () => {
    if (!formData.service_location_id) return;
    try {
      const typeFilter = (formData.transport_type || 'taxi').toLowerCase();
      // Most of the app uses /api/v1/types/{area_id}?transport_type=...
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/types/${formData.service_location_id}?transport_type=${typeFilter}`, { headers });
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : (data.data?.results || []);
        setVehicleTypes(list);
        if (list.length > 0 && !formData.vehicle_type_id) {
          setFormData(prev => ({ ...prev, vehicle_type_id: list[0]._id || list[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicle types:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.service_location_id) {
      fetchVehicleTypes();
    }
  }, [formData.service_location_id, formData.transport_type]);

  const resetForm = () => {
    setFormData({
      owner_id: owners[0]?._id || '',
      service_location_id: areas[0]?._id || '',
      transport_type: 'taxi',
      vehicle_type_id: '',
      car_brand: '',
      car_model: '',
      license_plate_number: '',
      car_color: ''
    });
    setEditingId(null);
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      owner_id: item.owner_id?._id || item.owner_id || owners[0]?._id || '',
      service_location_id: item.service_location_id?._id || item.service_location_id || areas[0]?._id || '',
      transport_type: item.transport_type || 'taxi',
      vehicle_type_id: item.vehicle_type_id?._id || item.vehicle_type_id || '',
      car_brand: item.car_brand || '',
      car_model: item.car_model || '',
      license_plate_number: item.license_plate_number || '',
      car_color: item.car_color || ''
    });
    setView('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isEditing = view === 'edit';
    const url = isEditing
      ? `${BASE}/owner-management/manage-fleet/${editingId}`
      : `${BASE}/owner-management/manage-fleet`;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setView('list');
        fetchData(); // Refresh everything
        resetForm();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fleet vehicle?')) return;
    try {
      const res = await fetch(`${BASE}/owner-management/manage-fleet/${id}`, {
        method: 'DELETE',
        headers
      });
      const json = await res.json();
      if (json.success) fetchData();
      else alert(json.message || 'Delete failed');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredFleet = fleet.filter(item =>
    (item.car_brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.car_model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.license_plate_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Status badge ── */
  const StatusBadge = ({ status }) => {
    const map = {
      approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle size={12} />, label: 'Approved' },
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={12} />, label: 'Pending' },
      rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle size={12} />, label: 'Rejected' },
    };
    const cfg = map[status?.toLowerCase()] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${cfg.color}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  /* ════════════════════════════════════
       CREATE / EDIT FORM
  ════════════════════════════════════ */
  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen p-1 font-sans">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8 px-1">
          <h1 className="text-[16px] font-black tracking-tight text-gray-800 uppercase">
            {view === 'edit' ? 'Edit Fleet' : 'Create'}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-gray-700 transition-colors" onClick={() => { setView('list'); resetForm(); }}>
              Manage Fleet
            </span>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-gray-900 font-black">{view === 'edit' ? 'Edit' : 'Create'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

              {/* Select Owner */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Select Fleet Owner <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                  >
                    <option value="">Select Owner</option>
                    {owners.length > 0 ? (
                      owners.map(owner => (
                        <option key={owner._id} value={owner._id}>
                          {owner.company_name || owner.name || owner._id}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No owners found</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Select Area */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Select Operating Area <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.service_location_id}
                    onChange={(e) => setFormData({ ...formData, service_location_id: e.target.value })}
                    className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all"
                  >
                    <option value="">Select Area</option>
                    {areas.map(area => (
                      <option key={area._id} value={area._id}>
                        {area.service_location_name || area.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Transport Type */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Transport Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.transport_type}
                    onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                    className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all"
                  >
                    {transportTypes.length > 0 ? (
                      transportTypes.map(tt => (
                        <option key={tt.transport_type} value={tt.transport_type}>
                          {tt.transport_type.charAt(0).toUpperCase() + tt.transport_type.slice(1)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="taxi">Taxi</option>
                        <option value="delivery">Delivery</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Select Type (Vehicle Type) */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Select Vehicle Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.vehicle_type_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_type_id: e.target.value })}
                    className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.length > 0 ? (
                      vehicleTypes.map(vt => (
                        <option key={vt._id || vt.id} value={vt._id || vt.id}>
                          {vt.name || vt.type_name || vt.label || vt._id || vt.id}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="mini">Mini</option>
                        <option value="bike">Bike</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Car Brand */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Car Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.car_brand}
                  onChange={(e) => setFormData({ ...formData, car_brand: e.target.value })}
                  placeholder="Enter Car Make"
                  className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Car Model */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Car Model <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.car_model}
                  onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                  placeholder="Enter Car Model"
                  className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                />
              </div>

              {/* License Plate Number */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  License Plate Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.license_plate_number}
                  onChange={(e) => setFormData({ ...formData, license_plate_number: e.target.value })}
                  placeholder="Enter License Plate Number"
                  className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Car Color */}
              <div className="space-y-2 md:col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] block">
                  Car Color <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.car_color}
                  onChange={(e) => setFormData({ ...formData, car_color: e.target.value })}
                  placeholder="Enter Car Color"
                  className="w-full h-13 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-10 pt-8 border-t border-gray-50">
              <button
                type="button"
                onClick={() => { setView('list'); resetForm(); }}
                className="px-8 py-3 mr-3 text-[13px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#2D3A6E] hover:bg-gray-900 text-white px-10 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════
       LIST VIEW
  ════════════════════════════════════ */
  return (
    <div className="min-h-screen p-1 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between mb-8 px-1">
            <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">Manage Fleet</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Manage Fleet</span>
              <ChevronRight size={12} className="opacity-50" />
              <span className="text-gray-900 font-black">Manage Fleet</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
              <div className="flex items-center gap-2 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
                show
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 outline-none font-black text-gray-900 shadow-sm mx-1 appearance-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                entries
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="text"
                    placeholder="Search fleet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50 transition-all w-56"
                  />
                </div>
                <button
                  onClick={() => { resetForm(); setView('create'); }}
                  className="bg-[#2D3A6E] hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-wider whitespace-nowrap"
                >
                  <Plus size={18} strokeWidth={2.5} /> Add Fleet
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-50">
                    {['Vehicle Type', 'Fleet Owner', 'Car Brand', 'Car Model', 'Document View', 'License Plate Number', 'Status', 'Reason', 'Action'].map(col => (
                      <th key={col} className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-300">
                          <Loader2 className="animate-spin" size={32} />
                          <span className="text-[12px] font-black uppercase tracking-widest">Loading Fleet...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredFleet.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-28 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center">
                            <FileText size={36} className="text-gray-200" />
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-gray-300 uppercase tracking-widest">No Data Found</p>
                            <p className="text-[12px] text-gray-200 mt-1">Add fleet vehicles to get started</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFleet.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-indigo-50/20 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                      >
                        {/* Vehicle Type */}
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-black text-gray-800 uppercase">
                            {item.vehicle_type_id?.name || item.vehicle_type_id?.type_name || item.vehicle_type || '—'}
                          </span>
                        </td>

                        {/* Fleet Owner */}
                        <td className="px-6 py-5">
                          <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider shadow-sm shadow-indigo-50">
                            {item.owner_id?.company_name || item.owner_id?.name || '—'}
                          </span>
                        </td>

                        {/* Car Brand */}
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-bold text-gray-600">{item.car_brand || '—'}</span>
                        </td>

                        {/* Car Model */}
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-bold text-gray-600">{item.car_model || '—'}</span>
                        </td>

                        {/* Document View */}
                        <td className="px-6 py-5">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all">
                            <Eye size={12} /> View
                          </button>
                        </td>

                        {/* License Plate */}
                        <td className="px-6 py-5">
                          <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[12px] font-black text-gray-700 tracking-widest uppercase">
                            {item.license_plate_number || '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-5">
                          <span className="text-[12px] text-gray-400 italic">{item.reason || '—'}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all shadow-sm"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all shadow-sm"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">
                Showing {filteredFleet.length > 0 ? 1 : 0} to {filteredFleet.length} of {filteredFleet.length} entries
              </span>
              <div className="flex items-center gap-1.5">
                <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                  Prev
                </button>
                <button className="w-9 h-9 rounded-xl bg-[#2D3A6E] text-white text-[13px] font-black shadow-lg">1</button>
                <button className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ManageFleet;
