import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  Users, 
  CheckCircle2,
  Globe,
  Car
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateDriver = () => {
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(true);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    area: '',
    country: '',
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
    vehicleNumber: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem('adminToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTc3NTA0OTExNywiZXhwIjoxODA2NTg1MTE3fQ.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
        
        // Fetch Service Locations
        const locRes = await fetch('https://taxi-a276.onrender.com/api/v1/admin/service-locations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const locData = await locRes.json();
        
        // Fetch Countries
        const countRes = await fetch('https://taxi-a276.onrender.com/api/v1/countries');
        const countData = await countRes.json();

        if (locData.success) {
          const locs = Array.isArray(locData.data) ? locData.data : (locData.data?.results || []);
          setLocations(locs);
          if (locs.length > 0) {
            const firstLoc = locs[0];
            setFormData(prev => ({ 
              ...prev, 
              area: firstLoc._id,
              country: firstLoc.country?._id || firstLoc.country || ''
            }));
          }
        }
        
        if (countData.success) {
          setCountries(Array.isArray(countData.data) ? countData.data : (countData.data?.results || []));
        }

        // Correct Transport Types API
        try {
          const transRes = await fetch('https://taxi-a276.onrender.com/api/v1/common/ride_modules');
          const transData = await transRes.json();
          if (transData.success) {
            // ride_modules often returns keys or simple list
            const rawTrans = Array.isArray(transData.data) ? transData.data : Object.keys(transData.data || {});
            const mapped = rawTrans.map(t => ({ 
              _id: typeof t === 'string' ? t.toLowerCase() : (t.id || t._id), 
              name: typeof t === 'string' ? t.charAt(0).toUpperCase() + t.slice(1) : (t.name || t.id)
            }));
            setTransportTypes(mapped.length > 0 ? mapped : [
              { _id: 'taxi', name: 'Taxi' },
              { _id: 'delivery', name: 'Delivery' }
            ]);
          }
        } catch (e) {
          console.error("Transport types fetch failed:", e);
          setTransportTypes([{ _id: 'taxi', name: 'Taxi' }, { _id: 'delivery', name: 'Delivery' }]);
        }

      } catch (err) {
        console.error('Data Fetch Error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  // Reactive Vehicle Types Fetching based on selected area AND transport type
  useEffect(() => {
    const fetchVehiclesForArea = async () => {
      if (!formData.area || !formData.transportType) return;
      try {
        const typeFilter = formData.transportType.toLowerCase();
        const res = await fetch(`https://taxi-a276.onrender.com/api/v1/types/${formData.area}?transport_type=${typeFilter}`);
        const data = await res.json();
        if (data.success) {
          setVehicleTypes(Array.isArray(data.data) ? data.data : (data.data?.results || []));
        }
      } catch (e) {
        console.error("Vehicle types error:", e);
      }
    };
    fetchVehiclesForArea();
  }, [formData.area, formData.transportType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-update country if area changes
    if (name === 'area') {
      const selectedLoc = locations.find(l => l._id === value);
      if (selectedLoc) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          country: selectedLoc.country?._id || selectedLoc.country || prev.country
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const providedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzdiZTZhYmJlOTJlYjYwMGYwMmQxNiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibW9iaWxlIjoiOTk5OTk5OTk5OSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTc3NTA0OTExNywiZXhwIjoxODA2NTg1MTE3fQ.5KJmXJwaVefWhnc97EqtArkA1z7ZOhsJwA9fbyRVPdQ';
      const storedToken = localStorage.getItem('adminToken');
      const token = (storedToken && storedToken !== 'undefined' && storedToken !== 'null') ? storedToken : providedToken;

      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        password: formData.password,
        gender: formData.gender.toLowerCase(),
        transport_type: formData.transportType.toLowerCase(),
        car_make: formData.vehicleMake,
        car_model: formData.vehicleModel,
        car_color: formData.vehicleColor,
        car_number: formData.vehicleNumber,
        registration_plate: formData.vehicleNumber,
        car_type: formData.vehicleType,
        service_location_id: formData.area,
        country: formData.country,
        approve: true,
        active: true,
        driver_type: 'normal'
      };

      console.log('Registering Driver with payload:', payload);
      const response = await fetch('https://taxi-a276.onrender.com/api/v1/admin/drivers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Registration Response Data:', data); // DEBUG LOG

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/drivers'), 2000);
      } else {
        // If 422, the server likely returned which fields failed in data.errors or data.message
        const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Validation failed');
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Waking up Fleet Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-8 font-sans text-gray-950 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400 mb-2">
            <span className="text-gray-950 uppercase tracking-widest">Admin Create</span>
            <ChevronRight size={14} />
            <span className="uppercase tracking-widest">Approved Drivers</span>
            <ChevronRight size={14} />
            <span className="text-gray-950 uppercase tracking-widest">Create</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Add New Driver</h1>
        </div>
        <button 
          onClick={() => navigate('/admin/drivers')}
          className="bg-white border border-gray-200 text-gray-950 px-6 py-3 rounded-2xl text-[14px] font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: BASIC INFO */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-10">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-950">Personal Information</h3>
                <p className="text-[13px] font-bold text-gray-400">Core identity and contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12px] font-black uppercase tracking-widest">
              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-400" /> Select Area *
                </label>
                 <select 
                   name="area"
                   required
                   value={formData.area}
                   onChange={handleChange}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner"
                 >
                   <option value="">Select Area</option>
                   {locations.map(loc => (
                     <option key={loc._id} value={loc._id}>{loc.service_location_name}</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-3">
                 <label className="text-gray-400 flex items-center gap-2">
                   <Globe size={14} className="text-indigo-400" /> Country *
                 </label>
                 <select 
                   name="country"
                   required
                   value={formData.country}
                   onChange={handleChange}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner"
                 >
                   <option value="">Select Country</option>
                   {countries.map(c => (
                     <option key={c._id} value={c._id}>{c.name}</option>
                   ))}
                 </select>
               </div>

              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <User size={14} className="text-indigo-400" /> Name *
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <Phone size={14} className="text-indigo-400" /> Mobile *
                </label>
                <input 
                  type="tel" 
                  name="mobile"
                  required
                  placeholder="Enter Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" /> Select Gender *
                </label>
                <select 
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner"
                >
                  <option value="">Choose Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-gray-400 flex items-center gap-2">
                  <Mail size={14} className="text-indigo-400" /> Email *
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <Lock size={14} className="text-indigo-400" /> Password *
                </label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400" /> Confirm Password *
                </label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-10">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Car size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-950">Vehicle Information</h3>
                <p className="text-[13px] font-bold text-gray-400">Fleet and transport specifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12px] font-black uppercase tracking-widest text-gray-400">
               <div className="space-y-3">
                  <label className="flex items-center gap-2"><Car size={14} className="text-emerald-400" /> Transport Type *</label>
                  <select 
                     name="transportType"
                     required
                     value={formData.transportType}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner"
                  >
                     <option value="">Select</option>
                     <option value="Bike">Bike</option>
                     <option value="Car">Car</option>
                     <option value="Auto">Auto</option>
                  </select>
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2">Vehicle Type *</label>
                  <select 
                     name="vehicleType"
                     required
                     value={formData.vehicleType}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner"
                  >
                     <option value="">Select</option>
                     <option value="Sedan">Sedan</option>
                     <option value="SUV">SUV</option>
                     <option value="Hatchback">Hatchback</option>
                  </select>
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2">Vehicle Make *</label>
                  <input 
                     type="text" 
                     name="vehicleMake"
                     required
                     placeholder="Enter Vehicle Make"
                     value={formData.vehicleMake}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                  />
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2">Vehicle Model *</label>
                  <input 
                     type="text" 
                     name="vehicleModel"
                     required
                     placeholder="Enter Vehicle Model"
                     value={formData.vehicleModel}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                  />
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2">Vehicle Color *</label>
                  <input 
                     type="text" 
                     name="vehicleColor"
                     required
                     placeholder="Enter Vehicle Color"
                     value={formData.vehicleColor}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                  />
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2">Vehicle Number *</label>
                  <input 
                     type="text" 
                     name="vehicleNumber"
                     required
                     placeholder="Enter Vehicle Number"
                     value={formData.vehicleNumber}
                     onChange={handleChange}
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-950 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all shadow-inner placeholder:text-gray-300"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & IMAGE */}
        <div className="space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-10">
              <h3 className="text-[14px] font-black text-gray-950 uppercase tracking-widest mb-8 text-center">Profile Photo</h3>
              
              <div className="relative group cursor-pointer">
                 <div className="w-full aspect-square rounded-[32px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30">
                    {imagePreview ? (
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="flex flex-col items-center text-gray-400">
                          <Upload size={40} strokeWidth={1.5} className="mb-4" />
                          <p className="text-[12px] font-black uppercase tracking-widest">Upload Image</p>
                       </div>
                    )}
                 </div>
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                 />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-6">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
           </div>

           <div className="bg-gray-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><CheckCircle2 size={120} strokeWidth={1} /></div>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-8 leading-none">Final Step</p>
              
              <div className="space-y-4 relative z-10">
                 <button 
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full py-5 bg-white text-gray-950 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    {isLoading ? (
                       <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-950 rounded-full animate-spin"></div>
                    ) : success ? (
                       <CheckCircle2 className="text-emerald-500" />
                    ) : (
                       <Save size={18} />
                    )}
                    {success ? 'Driver Created!' : isLoading ? 'Saving...' : 'Register Driver'}
                 </button>
                 
                 <button 
                    type="button"
                    onClick={() => navigate('/admin/drivers')}
                    className="w-full py-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all"
                 >
                    Cancel Request
                 </button>
              </div>

              {success && (
                 <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                    <p className="text-[12px] font-bold text-emerald-400 text-center">New operator has been added to the fleet successfully.</p>
                 </div>
              )}

              {error && (
                 <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                    <p className="text-[12px] font-bold text-rose-500 text-center">{error}</p>
                 </div>
              )}
           </div>

           <div className="bg-indigo-50 rounded-[32px] p-8 border border-indigo-100">
              <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-4">Registration Policy</p>
              <p className="text-[12px] font-bold text-indigo-900 leading-relaxed italic opacity-70">
                 "All newly created drivers will be marked as 'Approved' by default. Please ensure manual verification of physical documents is completed before issuing fleet access."
              </p>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDriver;
