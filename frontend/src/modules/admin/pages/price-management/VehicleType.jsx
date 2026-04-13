import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Car,
  ChevronRight,
  Trash2,
  Edit2,
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Car, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Upload,
  Info,
  Save,
  Activity,
  X,
  CheckCircle2,
  Package,
  Layers,
  Save,
  Activity,
  Table as TableIcon,
  Loader2,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../shared/api/axiosInstance';

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Assets
import CarIcon from '../../../../assets/icons/car.png';
import BikeIcon from '../../../../assets/icons/bike.png';
import AutoIcon from '../../../../assets/icons/auto.png';
import TruckIcon from '../../../../assets/icons/truck.png';
import EhcvIcon from '../../../../assets/icons/ehcv.png';
import HcvIcon from '../../../../assets/icons/hcv.png';
import LcvIcon from '../../../../assets/icons/LCV.png';
import McvIcon from '../../../../assets/icons/mcv.png';
import LuxuryIcon from '../../../../assets/icons/Luxury.png';
import PremiumIcon from '../../../../assets/icons/Premium.png';
import SuvIcon from '../../../../assets/icons/SUV.png';
import MapBackground from '../../../../assets/map_image.png';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100';
const labelClass = 'mb-2 block text-[12px] font-bold text-slate-700';

const iconMap = {
  car: CarIcon,
  bike: BikeIcon,
  auto: AutoIcon,
  truck: TruckIcon,
  motor_bike: BikeIcon,
  ehcb: EhcvIcon,
  HCV: HcvIcon,
  LCV: LcvIcon,
  MCV: McvIcon,
  Luxary: LuxuryIcon,
  premium: PremiumIcon,
  suv: SuvIcon,
};

const ICON_TYPE_ALIASES = {
  motor_bike: 'bike',
  motorbike: 'bike',
  hcv: 'HCV',
  lcv: 'LCV',
  mcv: 'MCV',
  luxary: 'Luxary',
};

const normalizeIconType = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return 'car';
  const lower = raw.toLowerCase();
  if (ICON_TYPE_ALIASES[lower]) return ICON_TYPE_ALIASES[lower];
  const exactKey = Object.keys(iconMap).find((key) => key.toLowerCase() === lower);
  return exactKey || 'car';
};

const defaultFormData = {
  name: '',
  short_description: '',
  description: '',
  transport_type: 'taxi',
  dispatch_type: 'normal',
  icon_types: 'car',
  image: '',
  capacity: 0,
  size: '',
  is_taxi: 'taxi',
  is_accept_share_ride: 0,
  status: 1,
  active: true,
  supported_other_vehicle_types: [],
  vehicle_preference: [],
};

const unwrap = (response) => response?.data?.data || response?.data || response;

const normalizeVehicle = (item = {}) => ({
  ...item,
  id: String(item?._id || item?.id || ''),
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const StatusToggle = ({ active, onToggle }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`relative h-6 w-12 rounded-full transition-all ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
  >
    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

const VehicleMultiSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options',
}) => {
  const selectedItems = options.filter((item) => value.includes(String(item.id || item._id)));

  const handleSelect = (event) => {
    const nextValue = event.target.value;
    if (!nextValue || value.includes(nextValue)) {
      return;
    }
    onChange([...value, nextValue]);
  };

  const removeItem = (id) => onChange(value.filter((item) => item !== id));

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedItems.length ? selectedItems.map((item) => (
            <span
              key={String(item.id || item._id)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              {item.name}
              <button
                type="button"
                onClick={() => removeItem(String(item.id || item._id))}
                className="opacity-80 transition hover:opacity-100"
              >
                <X size={12} />
              </button>
            </span>
          )) : (
            <p className="text-[12px] text-slate-400">{placeholder}</p>
          )}
        </div>
        <select value="" onChange={handleSelect} className={inputClass}>
          <option value="">Add option</option>
          {options
            .filter((item) => !value.includes(String(item.id || item._id)))
            .map((item) => (
              <option key={String(item.id || item._id)} value={String(item.id || item._id)}>
                {item.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

const StatusToggle = ({ active, onToggle }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${active ? 'bg-[#26C2A3]' : 'bg-gray-200'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const VehicleType = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditor = propMode === 'create' || propMode === 'edit';
  const location = useLocation();
  
  const isCreate = propMode === 'create' || (location?.pathname || '').endsWith('/create');
  const isEdit = propMode === 'edit' || (location?.pathname || '').includes('/edit/');
  const isList = !isCreate && !isEdit;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehiclePreferences, setVehiclePreferences] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1 });
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const [vehicleResponse, preferenceResponse] = await Promise.all([
          api.get('/admin/types/vehicle-types'),
          api.get('/admin/vehicle_preference'),
        ]);

        if (!mounted) {
          return;
        }

        const vehiclePayload = unwrap(vehicleResponse);
        const vehicleResults = Array.isArray(vehiclePayload?.results)
          ? vehiclePayload.results
          : Array.isArray(vehiclePayload)
            ? vehiclePayload
            : [];
        const normalizedVehicles = vehicleResults.map(normalizeVehicle);
        setVehicles(normalizedVehicles);
        setPagination(vehiclePayload?.paginator || { total: normalizedVehicles.length, current_page: 1 });

        const prefPayload = unwrap(preferenceResponse);
        const prefResults = Array.isArray(prefPayload?.data)
          ? prefPayload.data
          : Array.isArray(prefPayload)
            ? prefPayload
            : [];
        setVehiclePreferences(prefResults);

        if (id) {
          const selectedVehicle = normalizedVehicles.find((item) => String(item.id) === String(id));
          if (selectedVehicle) {
            setFormData({
              name: selectedVehicle.name || '',
              short_description: selectedVehicle.short_description || '',
              description: selectedVehicle.description || '',
              transport_type: selectedVehicle.transport_type || 'taxi',
              dispatch_type: selectedVehicle.dispatch_type || selectedVehicle.trip_dispatch_type || 'normal',
              icon_types: normalizeIconType(selectedVehicle.icon_types || selectedVehicle.icon_types_for),
              image: selectedVehicle.icon || selectedVehicle.image || '',
              capacity: Number(selectedVehicle.capacity || 0),
              size: String(selectedVehicle.size || ''),
              is_taxi: selectedVehicle.is_taxi || 'taxi',
              is_accept_share_ride: Number(selectedVehicle.is_accept_share_ride || 0),
              status: Number(selectedVehicle.status ?? (selectedVehicle.active !== false ? 1 : 0)),
              active: selectedVehicle.active !== false && Number(selectedVehicle.status ?? 1) !== 0,
              supported_other_vehicle_types: Array.isArray(selectedVehicle.supported_other_vehicle_types)
                ? selectedVehicle.supported_other_vehicle_types.map((item) => String(item?._id || item))
                : typeof selectedVehicle.supported_vehicles === 'string' && selectedVehicle.supported_vehicles
                  ? selectedVehicle.supported_vehicles.split(',').map((item) => item.trim()).filter(Boolean)
                  : [],
              vehicle_preference: Array.isArray(selectedVehicle.vehicle_preference)
                ? selectedVehicle.vehicle_preference.map((item) => String(item?._id || item))
                : [],
            });
          }
        } else if (propMode === 'create') {
          setFormData(defaultFormData);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error.message || 'Could not load vehicle types.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, propMode]);

  const previewImage = useMemo(() => {
    if (formData.image && typeof formData.image === 'string') {
      return formData.image;
    }
    return '';
  }, [formData.image]);

  const currentIconPreview = iconMap[formData.icon_types] || CarIcon;

  const availableSupportVehicles = useMemo(
    () => vehicles.filter((item) => String(item.id) !== String(id)),
    [id, vehicles],
  );

  const preferenceOptions = useMemo(
    () => vehiclePreferences.map((item) => ({ ...item, id: String(item._id || item.id) })),
    [vehiclePreferences],
  );

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    updateForm('image', dataUrl);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    transport_type: 'taxi',
    trip_dispatch_type: 'normal',
    icon_types_for: 'car',
    is_taxi: 'taxi',
    is_accept_share_ride: 0,
    active: 1,
    image: null,
    icon: '',
    capacity: 4,
    size: '',
    supported_vehicles: []
  });

  const baseUrl = (typeof window !== 'undefined' && window.__LEGACY_BACKEND_ORIGIN__) || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/types/vehicle-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        // Handle priority of 'results' then 'paginator.data' as per user JSON
        const rawResults = data.results || data.data?.results || data.paginator?.data || data.data?.vehicle_types || (Array.isArray(data.data) ? data.data : []);
        setVehicles(Array.isArray(rawResults) ? rawResults : []);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchVehicles();
      
      if (isEdit && id) {
        try {
          const res = await fetch(`${baseUrl}/api/v1/admin/types/vehicle-types/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data && data.success && data.data) {
            const v = data.data;
            setFormData({
              name: v.name || '',
              short_description: v.short_description || '',
              description: v.description || '',
              transport_type: v.transport_type || 'taxi',
              trip_dispatch_type: v.trip_dispatch_type || 'normal',
              capacity: v.capacity || 4,
              size: v.size || '',
              icon_types_for: v.icon_types_for || 'car',
              is_taxi: v.is_taxi || 'taxi',
              is_accept_share_ride: v.is_accept_share_ride || 0,
              active: v.active === 1 || v.active === true ? 1 : 0,
              icon: v.icon || '',
              supported_vehicles: typeof v.supported_vehicles === 'string' 
                ? v.supported_vehicles.split(',').filter(Boolean) 
                : (Array.isArray(v.supported_vehicles) ? v.supported_vehicles : []),
              image: null
            });
          }
        } catch (error) {
          console.error("Error fetching vehicle details:", error);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.name) return toast.error("Vehicle Type Name is required");
    setIsSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        short_description: formData.short_description.trim(),
        description: formData.description.trim(),
        transport_type: formData.transport_type,
        dispatch_type: formData.dispatch_type,
        icon_types: normalizeIconType(formData.icon_types),
        image: formData.image || '',
        icon: formData.image || '',
        capacity: Number(formData.capacity || 0),
        size: formData.size,
        is_taxi: formData.is_taxi,
        is_accept_share_ride: Number(formData.is_accept_share_ride || 0),
        status: formData.active ? 1 : 0,
        active: formData.active,
        supported_other_vehicle_types: formData.supported_other_vehicle_types,
        vehicle_preference: formData.vehicle_preference,
      };

      if (id) {
        await api.patch(`/admin/types/vehicle-types/${id}`, payload);
      } else {
        await api.post('/admin/types/vehicle-types', payload);
      }

      navigate('/admin/pricing/vehicle-type');
      const url = id 
        ? `${baseUrl}/api/v1/admin/types/vehicle-types/${id}/update` 
        : `${baseUrl}/api/v1/admin/types/vehicle-types`;
      
      const body = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          body.append('icon', formData[key]);
        } else if (key === 'supported_vehicles') {
          // Convert array back to comma-separated string for DB storage
          body.append('supported_vehicles', formData[key].join(','));
        } else if (key !== 'icon' && key !== 'image') {
          body.append(key, formData[key] === null ? '' : formData[key]);
        }
      });
      if (id) body.append('_method', 'PATCH');

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });

      const result = await res.json();
      if (result.success) {
        toast.success(id ? "Record Updated" : "Record Created");
        navigate('/admin/pricing/vehicle-type');
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      setErrorMessage(error.message || 'Could not save vehicle type.');
      toast.error("Network communication error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Delete this vehicle type?')) {
      return;
    }

    try {
      await api.delete(`/admin/types/vehicle-types/${vehicleId}`);
      setVehicles((prev) => prev.filter((item) => String(item.id) !== String(vehicleId)));
    } catch (error) {
      setErrorMessage(error.message || 'Could not delete vehicle type.');
    }
  };

  if (!isEditor) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-6 lg:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Pricing</span>
            <ChevronRight size={12} />
            <span className="text-slate-700">Vehicle Type</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Vehicle Type</h1>
              <p className="mt-1 text-sm text-slate-500">Manage the ride and delivery vehicle catalog.</p>
            </div>
            <button
              onClick={() => navigate('/admin/pricing/vehicle-type/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff6b4a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#f55a37]"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        </div>
  const filteredVehicles = useMemo(() => {
    const query = (searchTerm || '').toLowerCase();
    return vehicles.filter(v => v && (v.name || '').toLowerCase().includes(query));
  }, [vehicles, searchTerm]);

  if (isList) {
    return (
      <div className="min-h-screen bg-[#F1F3F9] p-4 lg:p-6 font-sans animate-in fade-in duration-500">
        <div className="max-w-[1400px] mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <h1 className="text-sm font-bold text-[#444] uppercase tracking-wide">VEHICLE TYPE</h1>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
              <span className="hover:text-indigo-600 cursor-pointer">Vehicle Type</span>
              <ChevronRight size={10} />
              <span className="text-gray-500">Vehicle Type</span>
            </div>
          </div>

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Car size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Types</p>
                <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Active</p>
                <p className="text-2xl font-bold text-slate-900">{vehicles.filter((item) => item.active !== false).length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <Package size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Delivery Types</p>
                <p className="text-2xl font-bold text-slate-900">{vehicles.filter((item) => item.transport_type === 'delivery').length}</p>
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Vehicle</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Transport</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Dispatch</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Active</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-sm text-slate-400">Loading vehicle types...</td>
                  </tr>
                ) : !vehicles.length ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-sm text-slate-400">No vehicle types found.</td>
                  </tr>
                ) : vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                          <img src={vehicle.icon || vehicle.image || currentIconPreview} alt={vehicle.name} className="h-10 w-10 object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{vehicle.name}</p>
                          <p className="text-xs text-slate-500">{vehicle.short_description || vehicle.description || 'No description added'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vehicle.transport_type === 'delivery' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {vehicle.transport_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">{vehicle.trip_dispatch_type || vehicle.dispatch_type || 'normal'}</td>
                    <td className="px-6 py-5">
                      <StatusToggle active={vehicle.active !== false} onToggle={() => {}} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/pricing/vehicle-type/edit/${vehicle.id}`)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Pricing</span>
            <ChevronRight size={12} />
            <span className="text-slate-700">Vehicle Type</span>
            <ChevronRight size={12} />
            <span className="text-slate-700">{id ? 'Edit' : 'Create'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Vehicle Type' : 'Create Vehicle Type'}</h1>
          <p className="mt-1 text-sm text-slate-500">Update the live vehicle catalog with real transport, icon, dispatch, and compatibility data.</p>
        </div>
        <button
          onClick={() => navigate('/admin/pricing/vehicle-type')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
             <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span>show</span>
                  <div className="relative">
                    <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-md bg-white outline-none cursor-pointer">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50 transition-colors"><Search size={16} /></button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#F66C44] text-white rounded-lg text-xs font-bold hover:bg-[#e55b35] transition-colors"><Filter size={14} /> Filters</button>
                  <button onClick={() => navigate('/admin/pricing/vehicle-type/create')} className="flex items-center gap-2 px-4 py-2 bg-[#3B488C] text-white rounded-lg text-xs font-bold hover:bg-[#2D3870] transition-colors"><Plus size={14} /> Add Vehicle</button>
                </div>
             </div>

             <div className="flex-1 overflow-x-auto px-6 pb-20">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[#F9FAFB] border-y border-gray-100">
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Vehicle</th>
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Dispatch Type</th>
                     <th className="px-4 py-3 text-left font-bold text-[#444] text-[13px]">Transport Type</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Image</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Status</th>
                     <th className="px-4 py-3 text-center font-bold text-[#444] text-[13px]">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {loading ? (
                      <tr><td colSpan="6" className="py-24 text-center"><Loader2 className="animate-spin inline-block text-indigo-200" size={32} /></td></tr>
                   ) : filteredVehicles.length > 0 ? (
                      filteredVehicles.slice(0, entriesPerPage).map((v, idx) => (
                        <tr key={v.id || v._id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-600">{v.name || '---'}</td>
                          <td className="px-4 py-4 text-gray-500 capitalize">{v.trip_dispatch_type || 'normal'}</td>
                          <td className="px-4 py-4 text-gray-500 capitalize">{v.transport_type || (v.is_taxi === 'taxi' ? 'Taxi' : 'All')}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex w-10 h-10 items-center justify-center p-1 border border-gray-100 rounded-md bg-white">
                              <img src={v.icon || v.image || CarIcon} className="w-full h-full object-contain" alt="" />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center"><StatusToggle active={Number(v.active) === 1} onToggle={() => {}} /></div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button onClick={() => navigate(`/admin/pricing/vehicle-type/edit/${v.id || v._id}`)} className="p-1.5 bg-[#FFF4E4] text-[#F6B344] rounded hover:bg-[#FFE8CC] transition-colors"><Edit2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                   ) : (
                      <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-medium">No records found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>

             <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
                <div className="text-xs text-gray-400 font-medium whitespace-nowrap">Showing 1 to {Math.min(filteredVehicles.length, entriesPerPage)} of {filteredVehicles.length} entries</div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 rounded transition-colors disabled:opacity-30" disabled>Prev</button>
                  <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white bg-[#3B488C] rounded shadow">1</button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 rounded transition-colors disabled:opacity-30" disabled>Next</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F9] p-4 lg:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-sm font-bold text-[#444] uppercase tracking-wide">{isEdit ? 'EDIT' : 'CREATE'}</h1>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
            <span className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate('/admin/pricing/vehicle-type')}>Vehicle Type</span>
            <ChevronRight size={10} />
            <span className="text-gray-500 uppercase">{isEdit ? 'Edit' : 'Create'}</span>
          </div>
        </div>

      {errorMessage ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-8">
          <div>
            <label className={labelClass}>Transport Type *</label>
            <select value={formData.transport_type} onChange={(e) => updateForm('transport_type', e.target.value)} className={inputClass}>
              <option value="all">All</option>
              <option value="taxi">Taxi</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Icon Type *</label>
            <select value={formData.icon_types} onChange={(e) => updateForm('icon_types', e.target.value)} className={inputClass}>
              {Object.keys(iconMap).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Vehicle Image</label>
            <div className="rounded-2xl border border-dashed border-slate-300 p-4">
              <div className="group relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Vehicle preview" className="max-h-[280px] w-full object-contain p-4" />
                    <button
                      type="button"
                      onClick={() => updateForm('image', '')}
                      className="absolute right-3 top-3 rounded-xl bg-white p-2 text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                      <Upload size={20} />
                    </span>
                    <span className="text-sm font-semibold text-slate-700">Upload image</span>
                    <span className="text-xs text-slate-400">Use a square image for the cleanest card preview</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 space-y-10 min-h-[700px] relative pb-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Transport Type <span className="text-rose-500">*</span></label>
                  <select value={formData.transport_type} onChange={(e) => setFormData(p => ({ ...p, transport_type: e.target.value }))} className={inputClass}>
                    <option value="">Choose Transport Type</option>
                    <option value="taxi">Taxi</option>
                    <option value="delivery">Delivery</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Vehicle Image <span className="text-gray-400 text-[10px] font-normal">(512px x 512px)</span> <span className="text-rose-500">*</span></label>
                  <div className="w-full max-w-[400px] aspect-square bg-[#FAFAFA] border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors group">
                    {formData.image || formData.icon ? (
                       <div className="relative w-full h-full flex items-center justify-center p-4">
                          <img src={formData.image instanceof File ? URL.createObjectURL(formData.image) : (formData.image || formData.icon)} className="max-w-full max-h-full object-contain" alt="" />
                          <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><Plus className="text-white" size={32} /><input type="file" className="hidden" onChange={(e) => setFormData(p => ({ ...p, image: e.target.files[0] }))} /></label>
                       </div>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer">
                        <span className="text-sm font-semibold text-gray-700">Upload Image</span>
                        <div className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center"><TableIcon size={18} className="text-gray-400" /></div>
                        <input type="file" className="hidden" onChange={(e) => setFormData(p => ({ ...p, image: e.target.files[0] }))} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Live Map Icon Preview</p>
              <div className="relative h-[228px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img src={MapBackground} alt="Map preview" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={currentIconPreview} alt="Icon preview" className="h-16 w-16 object-contain drop-shadow-xl" />
                </div>
              </div>
            </div>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Icon Type <span className="text-rose-500">*</span></label>
                  <select value={formData.icon_types_for} onChange={(e) => setFormData(p => ({ ...p, icon_types_for: e.target.value }))} className={inputClass}>
                    <option value="car">Car</option>
                    <option value="motor_bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="truck">Truck</option>
                    {Object.keys(iconMap).filter(k => !['car','motor_bike','auto','truck'].includes(k)).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1).replace('_',' ')}</option>)}
                  </select>
                </div>

            <div>
              <label className={labelClass}>Maximum Weight / Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => updateForm('capacity', e.target.value)}
                className={inputClass}
                placeholder="12"
              />
            </div>

            <div>
              <label className={labelClass}>Short Description *</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => updateForm('short_description', e.target.value)}
                className={inputClass}
                placeholder="Normal Delivery"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className={inputClass}
              placeholder="Parcel"
            />
          </div>

          <div>
            <label className={labelClass}>Trip Dispatch Type *</label>
            <select value={formData.dispatch_type} onChange={(e) => updateForm('dispatch_type', e.target.value)} className={inputClass}>
              <option value="normal">Normal</option>
              <option value="bidding">Bidding</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Size *</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => updateForm('size', e.target.value)}
              className={inputClass}
              placeholder="2"
            />
          </div>

          <div>
            <label className={labelClass}>Operational Scope *</label>
            <select value={formData.is_taxi} onChange={(e) => updateForm('is_taxi', e.target.value)} className={inputClass}>
              <option value="taxi">Taxi</option>
              <option value="delivery">Delivery</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => updateForm('description', e.target.value)}
              className={inputClass}
              placeholder="Parcel Delivery"
            />
          </div>
                <div className="w-full max-w-[500px] aspect-[4/3] bg-[#E5E9EC] rounded-md relative overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                    <img src={MapBackground} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="" />
                    <img src={iconMap[formData.icon_types_for] || CarIcon} className="w-24 h-24 object-contain drop-shadow-2xl z-20 animate-pulse" alt="" />
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <label className={labelClass}>Name <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter Name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Short Description <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.short_description} onChange={(e) => setFormData(p => ({ ...p, short_description: e.target.value }))} placeholder="Enter Short Description" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description <span className="text-rose-500">*</span></label>
                <textarea rows="4" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Enter Description" className={inputClass + " resize-none"} />
              </div>
              <div className="space-y-6">
                <div>
                   <label className={labelClass}>Trip Dispatch Type <span className="text-rose-500">*</span></label>
                   <select value={formData.trip_dispatch_type} onChange={(e) => setFormData(p => ({ ...p, trip_dispatch_type: e.target.value }))} className={inputClass}>
                      <option value="normal">Normal</option>
                      <option value="bidding">Bidding</option>
                      <option value="both">Both</option>
                   </select>
                </div>
              </div>
           </div>

          <div className="lg:col-span-2">
            <VehicleMultiSelect
              label="Supported Other Vehicle Types"
              options={availableSupportVehicles}
              value={formData.supported_other_vehicle_types}
              onChange={(next) => updateForm('supported_other_vehicle_types', next)}
              placeholder="No supporting vehicle types selected"
            />
          </div>

          <div className="lg:col-span-2">
            <VehicleMultiSelect
              label="Vehicle Preferences"
              options={preferenceOptions}
              value={formData.vehicle_preference}
              onChange={(next) => updateForm('vehicle_preference', next)}
              placeholder="No preferences selected"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50/50 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3">
              <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                This form is fully dynamic from your DB. Transport type, icon type, supported vehicles, and preferences all save to the real vehicle catalog.
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_accept_share_ride === 1}
                onChange={(e) => updateForm('is_accept_share_ride', e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Accept share ride
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => {
                  updateForm('active', e.target.checked);
                  updateForm('status', e.target.checked ? 1 : 0);
                }}
                className="h-4 w-4 rounded border-slate-300"
              />
              Active vehicle type
            </label>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <button
              onClick={handleSave}
              disabled={isSaving || loading}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#2e3c78] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24305f] disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : id ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => navigate('/admin/pricing/vehicle-type')}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!loading && formData.active ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#14b8a6] text-white shadow-2xl"
          >
            <CheckCircle2 size={24} />
          </motion.div>
        ) : null}
      </AnimatePresence>
           <div>
             <label className={labelClass}>Supported Other Vehicle Types</label>
             <div className="relative font-sans shadow-sm">
                <button 
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`${inputClass} flex items-center justify-between bg-white cursor-pointer group hover:border-indigo-400 min-h-[46px]`}
                >
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {formData.supported_vehicles.length > 0 ? (
                      formData.supported_vehicles.map(svId => {
                        const vObj = vehicles.find(v => String(v.id || v._id) === String(svId));
                        return (
                          <span key={svId} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md flex items-center gap-1.5 border border-indigo-100 animate-in zoom-in-95 duration-200">
                             {vObj?.name || 'Unknown'}
                             <span 
                               className="hover:text-rose-500 cursor-pointer p-0.5 rounded-full hover:bg-rose-50 transition-colors"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setFormData(p => ({ ...p, supported_vehicles: p.supported_vehicles.filter(item => item !== svId) }));
                               }}
                             >
                               <Trash2 size={10} strokeWidth={3} />
                             </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">Select supported vehicles...</span>
                    )}
                  </div>
                  <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto overflow-x-hidden py-2"
                      >
                        {vehicles.filter(v => String(v.id || v._id) !== String(id)).length > 0 ? (
                          vehicles.filter(v => String(v.id || v._id) !== String(id)).map(v => {
                            const vId = v.id || v._id;
                            const isSelected = formData.supported_vehicles.includes(vId);
                            return (
                              <div 
                                key={vId}
                                onClick={() => {
                                  setFormData(p => ({
                                    ...p,
                                    supported_vehicles: isSelected 
                                      ? p.supported_vehicles.filter(item => item !== vId)
                                      : [...p.supported_vehicles, vId]
                                  }));
                                }}
                                className={`px-6 py-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50 group border-b border-gray-50 last:border-0 ${isSelected ? 'bg-indigo-50/30' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5">
                                    <img src={v.icon || v.image || CarIcon} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                  </div>
                                  <span className={`text-[13px] font-semibold transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>{v.name}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100' : 'bg-white border-gray-200'}`}>
                                  {isSelected && <div className="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-6 py-8 text-center text-gray-400 text-xs italic">No other vehicle types available to dependency mapping</div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
             </div>
           </div>

           <div className="flex justify-end pr-4">
              <button onClick={handleSave} disabled={isSaving} className="flex items-center bg-[#3B488C] text-white rounded-md overflow-hidden shadow hover:scale-[1.01] transition-all disabled:opacity-50">
                <div className="px-8 py-3 text-xs font-bold uppercase tracking-widest">{isSaving ? 'Saving...' : 'Save'}</div>
                <div className="px-4 py-3 bg-[#F66C44] flex items-center justify-center">
                  <Plus size={18} />
                </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleType;
