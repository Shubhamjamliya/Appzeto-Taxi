import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  Users,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateDriver = () => {
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(true);
  const [locations, setLocations] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    area: '',
    name: '',
    mobile: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    transportType: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleNumber: '',
  });

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem('adminToken');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const locRes = await fetch(
          `${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/admin/service-locations`,
          { headers: authHeader },
        );
        const locData = await locRes.json();
        const locs = Array.isArray(locData.data) ? locData.data : (locData.data?.results || []);
        setLocations(locs);
        if (locs.length > 0) {
          setFormData((prev) => ({ ...prev, area: locs[0]._id }));
        }

        try {
          const transRes = await fetch(`${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/common/ride_modules`);
          const transData = await transRes.json();
          if (transData.success) {
            const rawTrans = Array.isArray(transData.data) ? transData.data : Object.keys(transData.data || {});
            const mapped = rawTrans.map((t) => ({
              _id: typeof t === 'string' ? t.toLowerCase() : (t.id || t._id),
              name: typeof t === 'string' ? t.charAt(0).toUpperCase() + t.slice(1) : (t.name || t.id),
            }));
            setTransportTypes(mapped);
          } else {
            setTransportTypes([]);
          }
        } catch (e) {
          setTransportTypes([]);
        }
      } catch (err) {
        setError('Failed to load driver form data.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.area || !formData.transportType) return;
      try {
        const res = await fetch(
          `${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/types/${formData.area}?transport_type=${formData.transportType.toLowerCase()}`,
        );
        const data = await res.json();
        if (data.success) {
          setVehicleTypes(Array.isArray(data.data) ? data.data : (data.data?.results || []));
        } else {
          setVehicleTypes([]);
        }
      } catch (e) {
        setVehicleTypes([]);
      }
    };
    fetchVehicles();
  }, [formData.area, formData.transportType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        name: formData.name,
        phone: formData.mobile,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        transport_type: formData.transportType,
        vehicle_type: formData.vehicleType,
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        vehicle_color: formData.vehicleColor,
        vehicle_number: formData.vehicleNumber,
        service_location_id: formData.area,
        approve: true,
        status: 'approved',
      };

      const response = await fetch(`${globalThis.__LEGACY_BACKEND_ORIGIN__}/api/v1/admin/drivers`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/drivers'), 1500);
      } else {
        setError(data.message || 'Failed to create driver.');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading driver form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans text-gray-900">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <span>Drivers</span>
          <ChevronRight size={12} />
          <span className="text-gray-700">Create</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Add Driver</h1>
          <button
            onClick={() => navigate('/admin/drivers')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Driver Details</h3>
                <p className="text-xs text-gray-400">Personal and contact information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  <MapPin size={12} className="inline mr-1 text-gray-400" />
                  Select Area *
                </label>
                <select
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.service_location_name || loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <User size={12} className="inline mr-1 text-gray-400" />
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={12} className="inline mr-1 text-gray-400" />
                  Mobile *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="Enter Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <Users size={12} className="inline mr-1 text-gray-400" />
                  Select Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Choose Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={12} className="inline mr-1 text-gray-400" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Lock size={12} className="inline mr-1 text-gray-400" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <CheckCircle2 size={12} className="inline mr-1 text-gray-400" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Car size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Vehicle Details</h3>
                <p className="text-xs text-gray-400">Vehicle and transport information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Transport Type *</label>
                <select
                  name="transportType"
                  required
                  value={formData.transportType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  {transportTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Vehicle Type *</label>
                <select
                  name="vehicleType"
                  required
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  {vehicleTypes.length > 0 ? (
                    vehicleTypes.map((type) => (
                      <option key={type._id || type.id} value={type.name || type._id}>
                        {type.name || type.vehicle_type || type._id}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="bike">Bike</option>
                      <option value="auto">Auto</option>
                      <option value="car">Car</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>Vehicle Make *</label>
                <input
                  type="text"
                  name="vehicleMake"
                  required
                  placeholder="Enter Vehicle Make"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Vehicle Model *</label>
                <input
                  type="text"
                  name="vehicleModel"
                  required
                  placeholder="Enter Vehicle Model"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Vehicle Color *</label>
                <input
                  type="text"
                  name="vehicleColor"
                  required
                  placeholder="Enter Vehicle Color"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Vehicle Number *</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  required
                  placeholder="Enter Vehicle Number"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Upload size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Driver Photo</h3>
                <p className="text-xs text-gray-400">Upload profile image</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-lg" />
              ) : (
                <div className="text-sm text-gray-500">
                  <Upload className="mx-auto mb-3 text-gray-400" />
                  Upload Image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Saving...' : success ? 'Driver Created!' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/drivers')}
              className="w-full py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl p-4">
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateDriver;
