import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, GoogleMap, MarkerF } from '@react-google-maps/api';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Globe,
  IndianRupee,
  Layers,
  Loader2,
  Map as MapIcon,
  MapPin,
  Navigation,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  XCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { HAS_VALID_GOOGLE_MAPS_KEY, INDIA_CENTER, useAppGoogleMapsLoader } from '../../utils/googleMaps';

const mapContainerStyle = { width: '100%', height: '100%' };

const defaultFormData = {
  name: '',
  address: '',
  country: '',
  currency_name: 'Indian Rupee',
  currency_symbol: '₹',
  currency_code: 'INR',
  timezone: 'Asia/Kolkata',
  unit: 'km',
  status: 'active',
  latitude: 22.7196,
  longitude: 75.8577
};

const StatusBadge = ({ status }) => {
  const active = status === 'active' || status === 1 || status === true;

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
        active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}
    >
      {active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const ServiceLocation = () => {
  const [view, setView] = useState('list');
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [mapRef, setMapRef] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded, loadError } = useAppGoogleMapsLoader();

  const resetForm = (countryId = '') => {
    setSelectedLocation(null);
    setFormData({ ...defaultFormData, country: countryId });
  };

  const fetchData = async () => {
    setLoading(true);
    setFetchingCountries(true);
    setErrorMessage('');

    try {
      const [locationsRes, countriesRes] = await Promise.all([
        adminService.getServiceLocations(),
        adminService.getCountries()
      ]);

      const nextLocations = Array.isArray(locationsRes?.data?.data)
        ? locationsRes.data.data
        : (locationsRes?.data?.data?.results || []);
      const nextCountries = Array.isArray(countriesRes?.data?.data?.results)
        ? countriesRes.data.data.results
        : (countriesRes?.data?.data || []);

      setLocations(nextLocations);
      setCountries(nextCountries);

      if (!selectedLocation && nextCountries.length > 0 && !formData.country) {
        const india = nextCountries.find((country) => country.name?.toLowerCase() === 'india');
        setFormData((prev) => ({ ...prev, country: india?._id || nextCountries[0]._id || '' }));
      }
    } catch (error) {
      console.error('Service location fetch error:', error);
      setErrorMessage('Service locations could not be loaded. Make sure the backend is running on http://localhost:4000.');
    } finally {
      setLoading(false);
      setFetchingCountries(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return locations;

    return locations.filter((location) => {
      const countryName = typeof location.country === 'object' ? location.country?.name : location.country;
      return [location.name, location.service_location_name, location.timezone, countryName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [locations, searchTerm]);

  const mapCenter = {
    lat: Number(formData.latitude) || INDIA_CENTER.lat,
    lng: Number(formData.longitude) || INDIA_CENTER.lng
  };

  const updateCoordinates = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6))
    }));
  };

  const handleMapClick = (event) => {
    const latLng = event.latLng;
    if (!latLng) return;
    updateCoordinates(latLng.lat(), latLng.lng());
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    updateCoordinates(lat, lng);

    if (mapRef) {
      mapRef.panTo({ lat, lng });
      mapRef.setZoom(13);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.country) {
      alert('Please fill all required fields, including Country');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        country: countries.find((country) => country._id === formData.country)?.name || formData.country
      };

      const response = selectedLocation?._id
        ? await adminService.updateServiceLocation(selectedLocation._id, payload)
        : await adminService.createServiceLocation(payload);

      if (response?.data?.success) {
        const india = countries.find((country) => country.name?.toLowerCase() === 'india');
        resetForm(india?._id || countries[0]?._id || '');
        setView('list');
        fetchData();
      } else {
        alert(response?.data?.message || 'Failed to save location');
      }
    } catch (error) {
      console.error('Service location save error:', error);
      alert('Failed to save service location');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location) => {
    const matchedCountry =
      countries.find((country) => country._id === location.country) ||
      countries.find((country) => country.name === location.country) ||
      countries.find((country) => country.name === location.country?.name);

    setSelectedLocation(location);
    setFormData({
      name: location.name || location.service_location_name || '',
      address: location.address || '',
      country: matchedCountry?._id || '',
      currency_name: location.currency_name || 'Indian Rupee',
      currency_symbol: location.currency_symbol || '₹',
      currency_code: location.currency_code || 'INR',
      timezone: location.timezone || 'Asia/Kolkata',
      unit: location.unit || 'km',
      status: location.status || (location.active ? 'active' : 'inactive'),
      latitude: Number(location.latitude || 22.7196),
      longitude: Number(location.longitude || 75.8577)
    });
    setView('create');
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm('Delete this service location?')) return;

    try {
      const response = await adminService.deleteServiceLocation(locationId);
      if (response?.data?.success) {
        setLocations((prev) => prev.filter((item) => item._id !== locationId && item.id !== locationId));
      }
    } catch (error) {
      console.error('Service location delete error:', error);
      alert('Failed to delete service location');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <MapPin className="text-indigo-600" size={28} />
                  Service Location
                </h1>
                <p className="text-gray-500 text-[13px] font-medium mt-1">Manage operational cities and their localized configurations</p>
              </div>
              <button
                onClick={() => {
                  const india = countries.find((country) => country.name?.toLowerCase() === 'india');
                  resetForm(india?._id || countries[0]?._id || '');
                  setView('create');
                }}
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                <Plus size={18} /> Add Service Location
              </button>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search locations..."
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-[13px] focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Layers size={18} /></button>
                  <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Settings size={18} /></button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={1.5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin size={16} className="text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Syncing locations...</p>
                </div>
              ) : errorMessage ? (
                <div className="flex flex-col items-center justify-center h-96 text-center px-10">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6">
                    <MapIcon size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Backend Unavailable</h3>
                  <p className="text-gray-500 text-sm max-w-md mt-2 font-medium">{errorMessage}</p>
                </div>
              ) : filteredLocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">S.No</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Time Zone</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Currency</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredLocations.map((location, idx) => (
                        <tr key={location._id || idx} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-[12px] font-black text-gray-400">{(idx + 1).toString().padStart(2, '0')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Globe size={18} />
                              </div>
                              <div>
                                <p className="text-[14px] font-black text-gray-900 leading-none">{location.name}</p>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                  {typeof location.country === 'object' ? location.country?.name : location.country || 'Global'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600 font-bold text-[13px]">
                              <Clock size={14} className="text-gray-400" />
                              {location.timezone || 'UTC'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[13px] bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                              {location.currency_symbol || '₹'}
                              <span className="text-gray-400 font-bold ml-1">{location.currency_code || 'INR'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <StatusBadge status={location.status || location.active} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(location)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(location._id || location.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center px-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                    <MapIcon size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">No Operational Areas Defined</h3>
                  <p className="text-gray-500 text-sm max-w-xs mt-2 font-medium italic">You haven&apos;t added any service locations yet. Define your first city to start accepting rides.</p>
                </div>
              )}

              <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Showing 1 to {filteredLocations.length} of {filteredLocations.length} Entries
                </p>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 pointer-events-none"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0F172A] text-white font-black text-xs">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 pointer-events-none"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl mx-auto space-y-6 pb-20"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-[11px] uppercase tracking-widest transition-all group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Discard & Go Back
              </button>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {selectedLocation ? 'Edit Service Location' : 'Setup New Service Location'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country *</label>
                      <select
                        value={formData.country}
                        onChange={(event) => setFormData({ ...formData, country: event.target.value })}
                        disabled={fetchingCountries}
                        className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country._id} value={country._id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
                    <textarea
                      rows="3"
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10"
                      >
                        <option value="active">Operational (Active)</option>
                        <option value="inactive">Under Maintenance (Inactive)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10"
                      >
                        <option value="km">Kilometres</option>
                        <option value="miles">Miles</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                      <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search city, terminal or landmark"
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-[13px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/10"
                          />
                        </div>
                      </Autocomplete>
                    ) : null}

                    <div className="w-full h-64 bg-slate-100 rounded-[24px] overflow-hidden relative border-2 border-gray-50">
                      {loadError ? (
                        <div className="h-full flex items-center justify-center p-6 text-center">
                          <div>
                            <p className="text-[12px] font-black text-rose-600 uppercase tracking-widest">Google Maps failed to load</p>
                            <p className="text-sm text-gray-500 mt-2">Check your browser key and Maps JavaScript API settings.</p>
                          </div>
                        </div>
                      ) : HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={12}
                          onLoad={setMapRef}
                          onClick={handleMapClick}
                          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
                        >
                          <MarkerF
                            position={mapCenter}
                            draggable
                            onDragEnd={(event) => {
                              const latLng = event.latLng;
                              if (!latLng) return;
                              updateCoordinates(latLng.lat(), latLng.lng());
                            }}
                          />
                        </GoogleMap>
                      ) : (
                        <div className="h-full flex items-center justify-center p-6 text-center bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)]">
                          <div>
                            <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-indigo-600 mb-3 mx-auto">
                              <MapPin size={20} />
                            </div>
                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Add your Google Maps key</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                          <Navigation size={10} className="text-primary" /> Lat: {formData.latitude}
                        </div>
                        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                          Lng: {formData.longitude}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency Code</label>
                      <input
                        type="text"
                        value={formData.currency_code}
                        onChange={(event) => setFormData({ ...formData, currency_code: event.target.value.toUpperCase() })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Symbol</label>
                        <input
                          type="text"
                          value={formData.currency_symbol}
                          onChange={(event) => setFormData({ ...formData, currency_symbol: event.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-center text-emerald-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                        <input
                          type="text"
                          value={formData.timezone}
                          onChange={(event) => setFormData({ ...formData, timezone: event.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-[13px] font-black text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-black text-white p-5 rounded-[24px] font-black text-[15px] uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:bg-gray-400"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {selectedLocation ? 'Update Service Unit' : 'Create Service Unit'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceLocation;
