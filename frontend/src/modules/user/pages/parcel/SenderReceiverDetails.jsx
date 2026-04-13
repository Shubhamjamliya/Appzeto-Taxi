import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Navigation,
  X,
} from 'lucide-react';
import { GoogleMap } from '@react-google-maps/api';
import { HAS_VALID_GOOGLE_MAPS_KEY, useAppGoogleMapsLoader } from '../../../admin/utils/googleMaps';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const LOCATION_COORDS = {
  'Pipaliyahana, Indore': [75.9048, 22.7039],
  'Vijay Nagar': [75.8937, 22.7533],
  'Vijay Nagar Square': [75.8947, 22.7518],
  Rajwada: [75.8553, 22.7187],
  Bhawarkua: [75.8586, 22.6926],
  'MG Road': [75.8721, 22.7196],
  'Palasia Square': [75.8863, 22.7242],
  'LIG Colony': [75.8904, 22.7322],
  'Scheme No 54': [75.8978, 22.7567],
  'AB Road': [75.8878, 22.7423],
  'Geeta Bhawan': [75.8834, 22.7208],
  'Sapna Sangeeta': [75.8587, 22.6984],
  'Mahalaxmi Nagar': [75.9114, 22.7676],
};
const POPULAR_LOCATIONS = Object.keys(LOCATION_COORDS);
const DEFAULT_COORDS = { lat: 22.7196, lng: 75.8577 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const getCoords = (title, fallback = [75.8577, 22.7196]) => LOCATION_COORDS[title] || fallback;

const readStoredUserInfo = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem('userInfo') || '{}');
  } catch {
    return {};
  }
};

const coordPairToLatLng = (coords, fallback = DEFAULT_COORDS) => {
  if (Array.isArray(coords) && coords.length >= 2) {
    const [lng, lat] = coords;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return fallback;
};

const latLngToCoordPair = (position) => [Number(position.lng), Number(position.lat)];

const formatCoordLabel = (coords) => {
  const position = coordPairToLatLng(coords);
  return `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
};

const PhoneInput = ({ label, value, onChange, error, name, onClearError }) => (
  <div className="space-y-1">
    <label className="text-[12px] font-black text-gray-400 ml-1">{label}</label>
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 ring-2 transition-all ${
        error
          ? 'bg-red-50 ring-red-100'
          : value && PHONE_REGEX.test(value)
            ? 'bg-green-50 ring-green-100'
            : 'bg-gray-50/50 ring-transparent'
      }`}
    >
      <Phone
        size={18}
        className={
          error ? 'text-red-400' : value && PHONE_REGEX.test(value) ? 'text-green-500' : 'text-gray-400'
        }
      />
      <input
        type="tel"
        maxLength={10}
        className="flex-1 bg-transparent border-none text-[15px] font-bold text-gray-900 focus:outline-none placeholder:text-gray-300"
        value={value}
        placeholder="10-digit mobile number"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          onChange(val);
          if (onClearError) onClearError(name);
        }}
      />
      {value && PHONE_REGEX.test(value) && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1"
        >
          <AlertCircle size={11} strokeWidth={3} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const AddressField = ({ label, value, onChange, error, suggestions, onPickSuggestion }) => (
  <div className="space-y-2">
    <label className="text-[12px] font-black text-gray-400 ml-1">{label}</label>
    <div className={`rounded-2xl p-4 ring-2 transition-all ${error ? 'bg-red-50 ring-red-100' : 'bg-gray-50/50 ring-transparent'}`}>
      <div className="flex items-center gap-3">
        <MapPin size={18} className={error ? 'text-red-400' : 'text-blue-500'} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter area or landmark"
          className="flex-1 bg-transparent border-none text-[15px] font-bold text-gray-900 focus:outline-none placeholder:text-gray-300"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPickSuggestion(item)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1"
        >
          <AlertCircle size={11} strokeWidth={3} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const MapPickerSheet = ({ open, title, confirmLabel, value, initialCoords, onClose, onConfirm }) => {
  const { isLoaded, loadError } = useAppGoogleMapsLoader();
  const [center, setCenter] = useState(coordPairToLatLng(initialCoords));
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCenter(coordPairToLatLng(initialCoords));
  }, [initialCoords, open]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCenter(next);
        if (mapRef.current) {
          mapRef.current.panTo(next);
          mapRef.current.setZoom(16);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] px-4 py-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="mx-auto flex h-full max-w-lg flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">Map Picker</p>
              <h3 className="mt-1 text-[20px] font-black tracking-tight text-gray-900">{title}</h3>
              <p className="mt-1 text-[11px] font-bold text-gray-500">{value || 'Move the map and confirm the exact point.'}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-2xl bg-gray-50 p-2.5 text-slate-700 active:scale-95">
              <X size={18} strokeWidth={2.8} />
            </button>
          </div>

          <div className="relative flex-1 bg-slate-100">
            {!HAS_VALID_GOOGLE_MAPS_KEY && (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div className="rounded-[20px] bg-white/95 px-5 py-4 shadow-sm">
                  <p className="text-[12px] font-black text-slate-900">Google Maps key missing</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">Set `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env`.</p>
                </div>
              </div>
            )}

            {HAS_VALID_GOOGLE_MAPS_KEY && loadError && (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div className="rounded-[20px] bg-white/95 px-5 py-4 shadow-sm">
                  <p className="text-[12px] font-black text-slate-900">Map failed to load</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">Check Google Maps browser key restrictions.</p>
                </div>
              </div>
            )}

            {HAS_VALID_GOOGLE_MAPS_KEY && !loadError && !isLoaded && (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 rounded-[18px] bg-white/95 px-4 py-3 shadow-sm">
                  <LoaderCircle size={18} className="animate-spin text-slate-500" />
                  <span className="text-[12px] font-black text-slate-700">Loading map</span>
                </div>
              </div>
            )}

            {HAS_VALID_GOOGLE_MAPS_KEY && !loadError && isLoaded && (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={16}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onUnmount={() => {
                  mapRef.current = null;
                }}
                onDragStart={() => {
                  draggingRef.current = true;
                  setIsDragging(true);
                }}
                onDragEnd={() => {
                  draggingRef.current = false;
                  setIsDragging(false);

                  if (!mapRef.current) {
                    return;
                  }

                  const mapCenter = mapRef.current.getCenter();
                  if (!mapCenter) {
                    return;
                  }

                  setCenter({ lat: mapCenter.lat(), lng: mapCenter.lng() });
                }}
                onIdle={() => {
                  if (!mapRef.current || draggingRef.current) {
                    return;
                  }

                  const mapCenter = mapRef.current.getCenter();
                  if (!mapCenter) {
                    return;
                  }

                  setCenter({ lat: mapCenter.lat(), lng: mapCenter.lng() });
                }}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  clickableIcons: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  mapTypeControl: false,
                  gestureHandling: 'greedy',
                }}
              />
            )}

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              animate={{ y: isDragging ? -6 : -10, scale: isDragging ? 1.04 : 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="relative">
                <motion.div
                  className="absolute left-1/2 top-[40px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-900/20 blur-[2px]"
                  animate={{ scale: isDragging ? 1.15 : 0.95, opacity: isDragging ? 0.5 : 0.35 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                  <MapPin size={20} strokeWidth={2.7} className="text-primary" />
                </div>
              </div>
            </motion.div>

            <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-2xl bg-white/92 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected Point</p>
              <p className="mt-1 text-[12px] font-black text-slate-900">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</p>
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-3.5 py-2 text-[11px] font-black text-slate-700 shadow-sm active:scale-[0.99]"
            >
              <Navigation size={14} strokeWidth={2.5} />
              Use My Location
            </button>
          </div>

          <div className="border-t border-gray-100 px-5 py-5">
            <button
              type="button"
              onClick={() => onConfirm(latLngToCoordPair(center))}
              className="flex h-14 w-full items-center justify-center rounded-[22px] bg-slate-900 text-[14px] font-black uppercase tracking-wide text-white shadow-lg"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SenderReceiverDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const parcelState = location.state || {};
  const storedUser = useMemo(() => readStoredUserInfo(), []);
  const [senderName, setSenderName] = useState(() => storedUser?.name || '');
  const [senderMobile, setSenderMobile] = useState(() => storedUser?.phone || '');
  const [receiverName, setReceiverName] = useState(() => parcelState.receiverName || '');
  const [receiverMobile, setReceiverMobile] = useState(() => parcelState.receiverMobile || '');
  const [pickup, setPickup] = useState(() => parcelState.pickup || '');
  const [drop, setDrop] = useState(() => parcelState.drop || '');
  const [pickupCoords, setPickupCoords] = useState(() => parcelState.pickupCoords || getCoords(parcelState.pickup || '', [75.8577, 22.7196]));
  const [dropCoords, setDropCoords] = useState(() => parcelState.dropCoords || getCoords(parcelState.drop || '', [75.8577, 22.7196]));
  const [activeMapPicker, setActiveMapPicker] = useState(null);
  const [errors, setErrors] = useState({});

  const pickupSuggestions = useMemo(
    () => POPULAR_LOCATIONS.filter((item) => item.toLowerCase().includes(String(pickup || '').toLowerCase())).slice(0, 4),
    [pickup],
  );
  const dropSuggestions = useMemo(
    () => POPULAR_LOCATIONS.filter((item) => item.toLowerCase().includes(String(drop || '').toLowerCase())).slice(0, 4),
    [drop],
  );

  const validate = () => {
    const nextErrors = {};
    if (!senderName.trim()) nextErrors.senderName = 'Sender name is required';
    if (!PHONE_REGEX.test(senderMobile)) nextErrors.senderMobile = 'Enter a valid 10-digit mobile number';
    if (!receiverName.trim()) nextErrors.receiverName = 'Receiver name is required';
    if (!PHONE_REGEX.test(receiverMobile)) nextErrors.receiverMobile = 'Enter a valid 10-digit mobile number';
    if (!pickup.trim()) nextErrors.pickup = 'Pickup location is required';
    if (!drop.trim()) nextErrors.drop = 'Drop location is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearError = (key) => {
    if (!errors[key]) return;
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleProceed = () => {
    if (!validate()) return;

    navigate('/parcel/searching', {
      state: {
        ...parcelState,
        pickup,
        drop,
        pickupCoords,
        dropCoords,
        senderName,
        senderMobile,
        receiverName,
        receiverMobile,
        paymentMethod: 'Cash',
        fare: parcelState.estimatedFare?.min || 45,
        parcel: {
          category: parcelState.parcelType || 'Parcel',
          weight: parcelState.weight || 'Under 5kg',
          description: parcelState.description || '',
          senderName,
          senderMobile,
          receiverName,
          receiverMobile,
        },
        isParcel: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans relative">
      <MapPickerSheet
        open={activeMapPicker === 'pickup'}
        title="Choose Pickup Point"
        value={pickup}
        initialCoords={pickupCoords}
        confirmLabel="Confirm Pickup on Map"
        onClose={() => setActiveMapPicker(null)}
        onConfirm={(coords) => {
          setPickupCoords(coords);
          clearError('pickup');
          setActiveMapPicker(null);
        }}
      />
      <MapPickerSheet
        open={activeMapPicker === 'drop'}
        title="Choose Delivery Point"
        value={drop}
        initialCoords={dropCoords}
        confirmLabel="Confirm Delivery on Map"
        onClose={() => setActiveMapPicker(null)}
        onConfirm={(coords) => {
          setDropCoords(coords);
          clearError('drop');
          setActiveMapPicker(null);
        }}
      />

      <header className="bg-white px-5 py-6 flex items-center gap-6 border-b border-gray-50 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
          <ArrowLeft size={24} className="text-gray-900" strokeWidth={3} />
        </button>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
            {parcelState.parcelType || 'Parcel'} - {parcelState.weight || 'Under 5kg'}
          </p>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">Contacts & Route</h1>
        </div>
      </header>

      <div className="flex-1 p-5 space-y-8 overflow-y-auto no-scrollbar pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
              <User size={18} strokeWidth={3} />
            </div>
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-none">Sender Details</h3>
          </div>
          <div className="bg-white rounded-[32px] p-5 shadow-lg shadow-gray-100 border border-gray-50 space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-black text-gray-400 ml-1">Sender Name</label>
              <input
                type="text"
                className={`w-full rounded-2xl p-4 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 ring-primary/10 transition-all ${errors.senderName ? 'bg-red-50 ring-2 ring-red-100' : 'bg-gray-50/50'}`}
                value={senderName}
                placeholder="Your name"
                onChange={(e) => {
                  setSenderName(e.target.value);
                  clearError('senderName');
                }}
              />
              {errors.senderName && <p className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1 mt-1"><AlertCircle size={11} strokeWidth={3} /> {errors.senderName}</p>}
            </div>
            <PhoneInput label="Sender Mobile" value={senderMobile} onChange={setSenderMobile} error={errors.senderMobile} name="senderMobile" onClearError={clearError} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin size={18} strokeWidth={3} />
            </div>
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-none">Pickup & Drop</h3>
          </div>
          <div className="bg-white rounded-[32px] p-5 shadow-lg shadow-gray-100 border border-gray-50 space-y-4">
            <AddressField
              label="Pickup"
              value={pickup}
              onChange={(value) => {
                setPickup(value);
                clearError('pickup');
              }}
              error={errors.pickup}
              suggestions={pickupSuggestions}
              onPickSuggestion={(value) => {
                setPickup(value);
                setPickupCoords(getCoords(value));
                clearError('pickup');
              }}
            />
            <div className="rounded-[24px] border border-gray-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pickup Pin</p>
                  <p className="mt-1 text-[12px] font-black text-slate-900">{formatCoordLabel(pickupCoords)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMapPicker('pickup')}
                  className="rounded-full bg-white px-4 py-2 text-[11px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
                >
                  Choose on Map
                </button>
              </div>
            </div>
            <AddressField
              label="Drop"
              value={drop}
              onChange={(value) => {
                setDrop(value);
                clearError('drop');
              }}
              error={errors.drop}
              suggestions={dropSuggestions}
              onPickSuggestion={(value) => {
                setDrop(value);
                setDropCoords(getCoords(value));
                clearError('drop');
              }}
            />
            <div className="rounded-[24px] border border-gray-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Delivery Pin</p>
                  <p className="mt-1 text-[12px] font-black text-slate-900">{formatCoordLabel(dropCoords)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMapPicker('drop')}
                  className="rounded-full bg-white px-4 py-2 text-[11px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
                >
                  Choose on Map
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-24">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <User size={18} strokeWidth={3} />
            </div>
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-none">Receiver Details</h3>
          </div>
          <div className="bg-white rounded-[32px] p-5 shadow-lg shadow-gray-100 border border-gray-50 space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-black text-gray-400 ml-1">Receiver Name</label>
              <input
                type="text"
                placeholder="Enter receiver's name"
                className={`w-full rounded-2xl p-4 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 ring-blue-100 transition-all placeholder:text-gray-300 ${errors.receiverName ? 'bg-red-50 ring-2 ring-red-100' : 'bg-gray-50/50'}`}
                value={receiverName}
                onChange={(e) => {
                  setReceiverName(e.target.value);
                  clearError('receiverName');
                }}
              />
              {errors.receiverName && <p className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1 mt-1"><AlertCircle size={11} strokeWidth={3} /> {errors.receiverName}</p>}
            </div>
            <PhoneInput label="Receiver Mobile" value={receiverMobile} onChange={setReceiverMobile} error={errors.receiverMobile} name="receiverMobile" onClearError={clearError} />

            {parcelState.estimatedFare && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
                <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Est. Delivery Fare</span>
                <span className="text-[16px] font-black text-gray-900">
                  Rs {parcelState.estimatedFare.min}-{parcelState.estimatedFare.max}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-50 pb-10 sticky bottom-0 z-30">
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleProceed} className="w-full bg-[#1C2833] py-5 rounded-[28px] text-[18px] font-black text-white shadow-xl shadow-gray-200 active:bg-black transition-all flex items-center justify-center gap-2">
          <span>Find Delivery Agent</span>
          <ChevronRight size={20} className="opacity-40" />
        </motion.button>
      </div>
    </div>
  );
};

export default SenderReceiverDetails;
