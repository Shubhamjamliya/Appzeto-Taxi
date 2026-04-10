import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Autocomplete, DrawingManager, GoogleMap, MarkerF, Polygon } from '@react-google-maps/api';
import { ArrowLeft, Edit2, Eraser, Loader2, MapPin, Minus, MousePointer2, Phone, Plane, Plus, Save, Search, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DELHI_CENTER, HAS_VALID_GOOGLE_MAPS_KEY, useAppGoogleMapsLoader } from '../../utils/googleMaps';
import { BACKEND_LABEL } from '../../../../shared/api/runtimeConfig';

const defaultFormData = {
  name: '',
  code: '',
  service_location_id: '',
  zone_id: '',
  terminal: '',
  address: '',
  contact_number: '',
  latitude: '',
  longitude: '',
  status: 'active',
};

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const fitMapToPaths = (map, paths) => {
  if (!map || !window.google || !Array.isArray(paths) || paths.length === 0) {
    return;
  }

  const bounds = new window.google.maps.LatLngBounds();
  let hasPoint = false;

  paths.forEach((point) => {
    if (Number.isFinite(point?.lat) && Number.isFinite(point?.lng)) {
      bounds.extend(point);
      hasPoint = true;
    }
  });

  if (hasPoint) {
    map.fitBounds(bounds, 60);
  }
};

const EmptyState = ({ title, message }) => (
  <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
      <Plane size={28} />
    </div>
    <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">{message}</p>
  </div>
);

const MotionDiv = motion.div;

const Airport = () => {
  const [view, setView] = useState('list');
  const [airports, setAirports] = useState([]);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [mapCenter, setMapCenter] = useState(DELHI_CENTER);
  const [autocomplete, setAutocomplete] = useState(null);
  const [boundaryCoords, setBoundaryCoords] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded, loadError } = useAppGoogleMapsLoader();

  const resetForm = (serviceLocationId = '', serviceLocation = null) => {
    setSelectedAirport(null);
    setFormData({ ...defaultFormData, service_location_id: serviceLocationId });
    setBoundaryCoords([]);
    setDrawingMode(null);

    if (serviceLocation) {
      const lat = Number(serviceLocation.latitude);
      const lng = Number(serviceLocation.longitude);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMapCenter({ lat, lng });
        return;
      }
    }

    setMapCenter(DELHI_CENTER);
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [airportsRes, serviceLocationsRes, zonesRes] = await Promise.allSettled([
        adminService.getAirports(),
        adminService.getServiceLocations(),
        adminService.getZones(),
      ]);

      const nextAirports =
        airportsRes.status === 'fulfilled'
          ? airportsRes.value?.data?.airports || airportsRes.value?.data?.results || airportsRes.value?.data || []
          : [];

      const nextServiceLocations =
        serviceLocationsRes.status === 'fulfilled'
          ? serviceLocationsRes.value?.data?.results || serviceLocationsRes.value?.data || []
          : [];

      const nextZones =
        zonesRes.status === 'fulfilled'
          ? zonesRes.value?.data?.results || zonesRes.value?.data || []
          : [];

      const normalizedServiceLocations = Array.isArray(nextServiceLocations) ? nextServiceLocations : [];

      setAirports(Array.isArray(nextAirports) ? nextAirports : []);
      setServiceLocations(normalizedServiceLocations);
      setZones(Array.isArray(nextZones) ? nextZones : []);

      const defaultServiceLocation = normalizedServiceLocations[0] || null;
      const defaultServiceLocationId = defaultServiceLocation?._id || '';

      setFormData((prev) => ({
        ...prev,
        service_location_id: prev.service_location_id || defaultServiceLocationId,
      }));

      if (!selectedAirport && !formData.latitude && !formData.longitude && defaultServiceLocation) {
        const lat = Number(defaultServiceLocation.latitude);
        const lng = Number(defaultServiceLocation.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setMapCenter({ lat, lng });
        }
      }

      if (airportsRes.status === 'rejected') {
        setErrorMessage(`Airport data could not be loaded. Make sure the backend is running on ${BACKEND_LABEL}.`);
      }
    } catch (error) {
      console.error('Airport fetch error:', error);
      setErrorMessage(`Airport data could not be loaded. Make sure the backend is running on ${BACKEND_LABEL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedServiceLocation = useMemo(
    () =>
      serviceLocations.find(
        (item) => String(item._id || item.id) === String(formData.service_location_id),
      ) || null,
    [serviceLocations, formData.service_location_id],
  );

  const filteredZones = useMemo(() => {
    if (!formData.service_location_id) {
      return zones;
    }

    return zones.filter((zone) => {
      const zoneServiceLocationId = zone.service_location_id?._id || zone.service_location_id;
      return String(zoneServiceLocationId || '') === String(formData.service_location_id);
    });
  }, [formData.service_location_id, zones]);

  const filteredAirports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return airports;
    }

    return airports.filter((airport) =>
      [
        airport.name,
        airport.code,
        airport.terminal,
        airport.address,
        airport.contact_number,
        airport.service_location_id?.name,
        airport.zone_id?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [airports, searchTerm]);

  useEffect(() => {
    if (!selectedServiceLocation || selectedAirport || formData.latitude !== '' || formData.longitude !== '') {
      return;
    }

    const lat = Number(selectedServiceLocation.latitude);
    const lng = Number(selectedServiceLocation.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapCenter({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
    }
  }, [selectedServiceLocation, selectedAirport, formData.latitude, formData.longitude]);

  const updatePinnedLocation = (lat, lng) => {
    const nextLat = Number(lat);
    const nextLng = Number(lng);

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      latitude: nextLat.toFixed(6),
      longitude: nextLng.toFixed(6),
    }));
    setMapCenter({ lat: nextLat, lng: nextLng });
  };

  const handleMapClick = (event) => {
    updatePinnedLocation(event.latLng?.lat(), event.latLng?.lng());
  };

  const handleMarkerDragEnd = (event) => {
    updatePinnedLocation(event.latLng?.lat(), event.latLng?.lng());
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) {
      return;
    }

    const place = autocomplete.getPlace();
    const lat = place.geometry?.location?.lat?.();
    const lng = place.geometry?.location?.lng?.();

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      updatePinnedLocation(lat, lng);
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(15);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.service_location_id) {
      alert('Airport name and service location are required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        service_location_id: formData.service_location_id,
        zone_id: formData.zone_id || null,
        terminal: formData.terminal.trim(),
        address: formData.address.trim(),
        contact_number: formData.contact_number.trim(),
        latitude: formData.latitude === '' ? null : Number(formData.latitude),
        longitude: formData.longitude === '' ? null : Number(formData.longitude),
        boundary_coordinates: boundaryCoords,
        status: formData.status,
      };

      const response = selectedAirport?._id
        ? await adminService.updateAirport(selectedAirport._id, payload)
        : await adminService.createAirport(payload);

      if (response?.success) {
        resetForm(serviceLocations[0]?._id || '', serviceLocations[0] || null);
        setView('list');
        fetchData();
      } else {
        alert(response?.message || 'Failed to save airport');
      }
    } catch (error) {
      console.error('Airport save error:', error);
      alert(error?.response?.data?.message || 'Failed to save airport');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (airport) => {
    setSelectedAirport(airport);
    setFormData({
      name: airport.name || '',
      code: airport.code || '',
      service_location_id: airport.service_location_id?._id || '',
      zone_id: airport.zone_id?._id || '',
      terminal: airport.terminal || '',
      address: airport.address || '',
      contact_number: airport.contact_number || '',
      latitude: airport.latitude ?? '',
      longitude: airport.longitude ?? '',
      status: airport.status || 'active',
    });
    setBoundaryCoords(Array.isArray(airport.boundary_coordinates) ? airport.boundary_coordinates : []);

    const lat = Number(airport.latitude);
    const lng = Number(airport.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapCenter({ lat, lng });
    }
    if (Array.isArray(airport.boundary_coordinates) && airport.boundary_coordinates.length > 0) {
      setTimeout(() => {
        fitMapToPaths(mapRef.current, airport.boundary_coordinates);
      }, 0);
    }

    setView('create');
  };

  const handleDelete = async (airportId) => {
    if (!window.confirm('Delete this airport?')) {
      return;
    }

    try {
      const response = await adminService.deleteAirport(airportId);
      if (response?.success) {
        setAirports((prev) => prev.filter((item) => item._id !== airportId && item.id !== airportId));
      }
    } catch (error) {
      console.error('Airport delete error:', error);
      alert('Failed to delete airport');
    }
  };

  const hasPinnedLocation = formData.latitude !== '' && formData.longitude !== '';
  const markerPosition = hasPinnedLocation
    ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
    : null;

  const handleBoundaryComplete = (polygon) => {
    const coords = polygon.getPath().getArray().map((point) => ({
      lat: point.lat(),
      lng: point.lng(),
    }));
    setBoundaryCoords(coords);
    setDrawingMode(null);
    polygon.setMap(null);
  };

  const setPolygonDrawingMode = () => {
    if (!window.google?.maps?.drawing?.OverlayType?.POLYGON) {
      return;
    }

    setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
  };

  const clearBoundary = () => {
    setBoundaryCoords([]);
    setDrawingMode(null);
  };

  const zoomMap = (delta) => {
    if (!mapRef.current) {
      return;
    }

    const currentZoom = mapRef.current.getZoom() || 11;
    mapRef.current.setZoom(currentZoom + delta);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <MotionDiv
            key="list"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Airport Management</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Create airports per service location and optionally link them to a zone.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm(serviceLocations[0]?._id || '', serviceLocations[0] || null);
                  setView('create');
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Plus size={16} />
                Add Airport
              </button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-sm">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search airports"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={30} />
                  </div>
                ) : filteredAirports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-left">
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Airport</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Code</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Service Location</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Zone</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Terminal</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAirports.map((airport) => (
                          <tr key={airport._id || airport.id} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">{airport.name || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{airport.code || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{airport.service_location_id?.name || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{airport.zone_id?.name || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{airport.terminal || '-'}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                airport.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {airport.status || 'active'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(airport)}
                                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(airport._id || airport.id)}
                                  className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
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
                ) : (
                  <EmptyState
                    title={errorMessage ? 'Backend Unavailable' : 'No Airports Yet'}
                    message={
                      errorMessage ||
                      'Create your first airport so airport pricing and service-location mapping have a real record to use.'
                    }
                  />
                )}
              </div>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="create"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {selectedAirport ? 'Update Airport' : 'Create'}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Pick the service location, name the airport, then draw the airport area directly on the map.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView('list')}
                className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[28px] border border-slate-200 bg-[#f5f7fc] p-5 shadow-sm">
                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm">
                          <Plane size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Airport Code</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{formData.code || 'Not set yet'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Service Location</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {selectedServiceLocation?.name || selectedServiceLocation?.service_location_name || 'Choose location'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Contact Number</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{formData.contact_number || 'Optional'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">
                        Service Location <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.service_location_id}
                        onChange={(event) => {
                          const nextServiceLocation = serviceLocations.find(
                            (location) => String(location._id || location.id) === String(event.target.value),
                          );

                          setSelectedAirport(null);
                          clearBoundary();
                          setFormData((prev) => ({
                            ...prev,
                            service_location_id: event.target.value,
                            zone_id: '',
                            latitude: '',
                            longitude: '',
                          }));

                          if (nextServiceLocation) {
                            const lat = Number(nextServiceLocation.latitude);
                            const lng = Number(nextServiceLocation.longitude);

                            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                              setMapCenter({ lat, lng });
                              mapRef.current?.panTo({ lat, lng });
                            }
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      >
                        <option value="">Select Service Location</option>
                        {serviceLocations.map((location) => (
                          <option key={location._id} value={location._id}>
                            {location.name || location.service_location_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">
                        Airport Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Enter Name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Airport Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                        placeholder="Example: DEL"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Zone</label>
                      <select
                        value={formData.zone_id}
                        onChange={(event) => setFormData((prev) => ({ ...prev, zone_id: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      >
                        <option value="">No Zone</option>
                        {filteredZones.map((zone) => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Terminal</label>
                      <input
                        type="text"
                        value={formData.terminal}
                        onChange={(event) => setFormData((prev) => ({ ...prev, terminal: event.target.value }))}
                        placeholder="Terminal 1"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Contact Number</label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(event) => setFormData((prev) => ({ ...prev, contact_number: event.target.value }))}
                        placeholder="Enter contact number"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[12px] font-bold text-slate-600">Address</label>
                      <textarea
                        rows="3"
                        value={formData.address}
                        onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Airport address"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Latitude</label>
                      <input
                        type="number"
                        value={formData.latitude}
                        onChange={(event) => {
                          const nextLatitude = event.target.value;
                          setFormData((prev) => ({ ...prev, latitude: nextLatitude }));
                          const lat = Number(nextLatitude);
                          const lng = Number(formData.longitude);
                          if (Number.isFinite(lat) && Number.isFinite(lng)) {
                            setMapCenter({ lat, lng });
                          }
                        }}
                        placeholder="28.5562"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Longitude</label>
                      <input
                        type="number"
                        value={formData.longitude}
                        onChange={(event) => {
                          const nextLongitude = event.target.value;
                          setFormData((prev) => ({ ...prev, longitude: nextLongitude }));
                          const lat = Number(formData.latitude);
                          const lng = Number(nextLongitude);
                          if (Number.isFinite(lat) && Number.isFinite(lng)) {
                            setMapCenter({ lat, lng });
                          }
                        }}
                        placeholder="77.1000"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Map Tools</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                          Click the map to pin the airport. Use the polygon tool to draw the airport boundary. Drag the marker if you need to fine-tune the airport point.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-600">Status</label>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5468a5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#475993] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Airport Area</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Search, pin, and draw the airport boundary directly on the map.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Boundary Points</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{boundaryCoords.length || 0}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    {HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                      <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search for a city"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                          />
                        </div>
                      </Autocomplete>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        Add a valid Google Maps browser key in `frontend/.env` to enable airport map tools.
                      </div>
                    )}
                  </div>

                  <div className="relative h-[560px] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                    {loadError ? (
                      <div className="flex h-full items-center justify-center p-6 text-center">
                        <div>
                          <p className="text-sm font-black uppercase tracking-widest text-rose-600">Google Maps failed to load</p>
                          <p className="mt-2 text-sm text-slate-500">Check your browser API key and Maps JavaScript API setup.</p>
                        </div>
                      </div>
                    ) : HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        center={markerPosition || mapCenter}
                        zoom={hasPinnedLocation ? 15 : 11}
                        onLoad={(map) => {
                          mapRef.current = map;
                          if (boundaryCoords.length > 0) {
                            fitMapToPaths(map, boundaryCoords);
                          }
                        }}
                        onClick={handleMapClick}
                        options={{
                          mapTypeControl: true,
                          streetViewControl: true,
                          fullscreenControl: true,
                          clickableIcons: false,
                        }}
                      >
                        <DrawingManager
                          onPolygonComplete={handleBoundaryComplete}
                          options={{
                            drawingControl: false,
                            drawingMode,
                            polygonOptions: {
                              fillColor: '#2563eb',
                              fillOpacity: 0.18,
                              strokeColor: '#1d4ed8',
                              strokeWeight: 2,
                              editable: false,
                            },
                          }}
                        />
                        {boundaryCoords.length > 0 ? (
                          <Polygon
                            paths={boundaryCoords}
                            options={{
                              fillColor: '#2563eb',
                              fillOpacity: 0.18,
                              strokeColor: '#1d4ed8',
                              strokeWeight: 2,
                              editable: false,
                              draggable: false,
                            }}
                          />
                        ) : null}
                        {markerPosition ? (
                          <MarkerF
                            position={markerPosition}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            title={formData.name || 'Airport location'}
                          />
                        ) : null}
                      </GoogleMap>
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center">
                        <div>
                          <p className="text-sm font-black uppercase tracking-widest text-slate-600">Map unavailable</p>
                          <p className="mt-2 text-sm text-slate-500">Set `VITE_GOOGLE_MAPS_API_KEY` to enable airport pinning and boundary drawing.</p>
                        </div>
                      </div>
                    )}
                    {HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                      <div className="absolute left-5 top-16 z-10 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={setPolygonDrawingMode}
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition ${
                            drawingMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#4f7cf7] hover:bg-[#416be0]'
                          }`}
                          title="Draw airport boundary"
                        >
                          <MousePointer2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => zoomMap(1)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f7cf7] text-white shadow-lg transition hover:bg-[#416be0]"
                          title="Zoom in"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => zoomMap(-1)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f7cf7] text-white shadow-lg transition hover:bg-[#416be0]"
                          title="Zoom out"
                        >
                          <Minus size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={clearBoundary}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f7cf7] text-white shadow-lg transition hover:bg-[#416be0]"
                          title="Clear boundary"
                        >
                          <Eraser size={18} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">Boundary Actions</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={clearBoundary}
                      className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                    >
                      Clear Boundary
                    </button>
                    <button
                      type="button"
                      onClick={() => markerPosition && mapRef.current?.panTo(markerPosition)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Focus Pin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Airport;
