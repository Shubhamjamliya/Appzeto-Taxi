import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, Globe2, Loader2, Plus, Save, Search, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { BACKEND_LABEL } from '../../../../shared/api/runtimeConfig';

const LANGUAGE_TABS = ['English', 'Arabic', 'French', 'Spanish', 'Tamil', 'Kannada'];
const DEFAULT_COUNTRIES = [
  { _id: 'country-in', name: 'India', code: 'IN' },
  { _id: 'country-ae', name: 'United Arab Emirates', code: 'AE' },
  { _id: 'country-gb', name: 'United Kingdom', code: 'GB' },
  { _id: 'country-us', name: 'United States', code: 'US' }
];
const DEFAULT_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles'
];

const defaultFormData = {
  name: '',
  country: '',
  currency_code: 'INR',
  currency_symbol: '₹',
  timezone: 'Asia/Kolkata'
};

const EmptyState = ({ title, message }) => (
  <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
      <Globe2 size={28} />
    </div>
    <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">{message}</p>
  </div>
);

const ServiceLocation = () => {
  const [view, setView] = useState('list');
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLanguage] = useState('English');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    ...defaultFormData,
    country: DEFAULT_COUNTRIES[0]._id
  });

  const resetForm = (countryId = DEFAULT_COUNTRIES[0]._id) => {
    setSelectedLocation(null);
    setFormData({ ...defaultFormData, country: countryId });
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [locationsRes, countriesRes] = await Promise.allSettled([
        adminService.getServiceLocations(),
        adminService.getCountries()
      ]);

      const nextLocations =
        locationsRes.status === 'fulfilled'
          ? Array.isArray(locationsRes.value?.data)
            ? locationsRes.value.data
            : (locationsRes.value?.data?.results || [])
          : [];

      const nextCountries =
        countriesRes.status === 'fulfilled'
          ? Array.isArray(countriesRes.value?.data?.results)
            ? countriesRes.value.data.results
            : (countriesRes.value?.data || [])
          : DEFAULT_COUNTRIES;

      const normalizedCountries = nextCountries.length ? nextCountries : DEFAULT_COUNTRIES;

      setLocations(nextLocations);
      setCountries(normalizedCountries);
      setFormData((prev) => ({
        ...prev,
        country: prev.country || normalizedCountries[0]?._id || DEFAULT_COUNTRIES[0]._id
      }));

      if (locationsRes.status === 'rejected') {
        setErrorMessage(`Service locations could not be loaded. Make sure the backend is running on ${BACKEND_LABEL}.`);
      }
    } catch (error) {
      console.error('Service location fetch error:', error);
      setCountries(DEFAULT_COUNTRIES);
      setErrorMessage(`Service locations could not be loaded. Make sure the backend is running on ${BACKEND_LABEL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return locations;
    }

    return locations.filter((location) => {
      const countryName = typeof location.country === 'object' ? location.country?.name : location.country;
      return [location.name, location.service_location_name, location.currency_code, location.timezone, countryName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [locations, searchTerm]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.country || !formData.currency_code.trim() || !formData.currency_symbol.trim() || !formData.timezone) {
      alert('Please fill all required fields.');
      return;
    }

    setSaving(true);

    try {
      const selectedCountry = countries.find((country) => country._id === formData.country);
      const payload = {
        name: formData.name.trim(),
        country: selectedCountry?.name || formData.country,
        currency_code: formData.currency_code.trim().toUpperCase(),
        currency_symbol: formData.currency_symbol.trim(),
        timezone: formData.timezone,
        currency_name: formData.currency_code.trim().toUpperCase(),
      };

      const response = selectedLocation?._id
        ? await adminService.updateServiceLocation(selectedLocation._id, payload)
        : await adminService.createServiceLocation(payload);

      if (response?.success) {
        resetForm(countries[0]?._id || DEFAULT_COUNTRIES[0]._id);
        setView('list');
        fetchData();
      } else {
        alert(response?.message || 'Failed to save location');
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
      countries.find((country) => country.name === location.country?.name) ||
      DEFAULT_COUNTRIES[0];

    setSelectedLocation(location);
    setFormData({
      name: location.name || location.service_location_name || '',
      country: matchedCountry?._id || DEFAULT_COUNTRIES[0]._id,
      currency_code: location.currency_code || 'INR',
      currency_symbol: location.currency_symbol || '₹',
      timezone: location.timezone || 'Asia/Kolkata'
    });
    setView('create');
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm('Delete this service location?')) {
      return;
    }

    try {
      const response = await adminService.deleteServiceLocation(locationId);
      if (response?.success) {
        setLocations((prev) => prev.filter((item) => item._id !== locationId && item.id !== locationId));
      }
    } catch (error) {
      console.error('Service location delete error:', error);
      alert('Failed to delete service location');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Service Location</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Manage only the core locale settings for each service location.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm(countries[0]?._id || DEFAULT_COUNTRIES[0]._id);
                  setView('create');
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Plus size={16} />
                Add Service Location
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
                    placeholder="Search locations"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={30} />
                  </div>
                ) : filteredLocations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-left">
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Name</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Country</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Currency Code</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Currency Symbol</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Timezone</th>
                          <th className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLocations.map((location) => (
                          <tr key={location._id || location.id} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">{location.name || location.service_location_name}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                              {typeof location.country === 'object' ? location.country?.name : location.country || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{location.currency_code || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{location.currency_symbol || '-'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-600">{location.timezone || '-'}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(location)}
                                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(location._id || location.id)}
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
                    title={errorMessage ? 'Backend Unavailable' : 'No Service Locations Yet'}
                    message={
                      errorMessage ||
                      'Create your first service location to define country, currency, and timezone settings.'
                    }
                  />
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView('list')}
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Discard & Go Back
              </button>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {selectedLocation ? 'Update Service Location' : 'Create Service Location'}
              </h2>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[#f5f7fc] p-5 shadow-sm">
              <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-4">
                  {LANGUAGE_TABS.map((language) => (
                    <button
                      key={language}
                      type="button"
                      className={`border-b-2 pb-3 text-sm font-bold transition ${
                        language === selectedLanguage
                          ? 'border-teal-500 text-teal-600'
                          : 'border-transparent text-slate-500'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[12px] font-bold text-slate-600">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Enter Name in English"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[12px] font-bold text-slate-600">
                      Currency Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.currency_code}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, currency_code: event.target.value.toUpperCase() }))
                      }
                      placeholder="Enter Currency Code"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[12px] font-bold text-slate-600">
                      Select Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(event) => setFormData((prev) => ({ ...prev, country: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                    >
                      <option value="">Choose Country</option>
                      {countries.map((country) => (
                        <option key={country._id} value={country._id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[12px] font-bold text-slate-600">
                      Select Timezone <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(event) => setFormData((prev) => ({ ...prev, timezone: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                    >
                      <option value="">Choose Timezone</option>
                      {DEFAULT_TIMEZONES.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[12px] font-bold text-slate-600">
                      Currency Symbol <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.currency_symbol}
                      onChange={(event) => setFormData((prev) => ({ ...prev, currency_symbol: event.target.value }))}
                      placeholder="Enter Currency Symbol"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300"
                    />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceLocation;
