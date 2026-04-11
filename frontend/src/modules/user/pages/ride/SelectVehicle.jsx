import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, X, Banknote, CreditCard, ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';

const toLatLng = (coords, fallback = { lat: 22.7196, lng: 75.8577 }) => {
  const [lng, lat] = coords || [];

  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return { lat: Number(lat), lng: Number(lng) };
  }

  return fallback;
};

const getDriverPosition = (driver) => toLatLng(driver?.location?.coordinates, null);

const getMarkerPosition = (driver, index, center) => {
  const position = getDriverPosition(driver);

  if (!position) {
    return {
      left: `${18 + ((index * 23) % 62)}%`,
      top: `${18 + ((index * 17) % 46)}%`,
    };
  }

  const latDelta = (position.lat - center.lat) * 460;
  const lngDelta = (position.lng - center.lng) * 460;
  const left = Math.max(10, Math.min(88, 50 + lngDelta));
  const top = Math.max(10, Math.min(82, 50 - latDelta));

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
};

const VehicleMapPreview = ({ center, drivers, selectedVehicle }) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#dfe8ef]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.38)_1px,transparent_1px)] bg-[length:52px_52px]" />
      <div className="absolute -left-10 top-[25%] h-9 w-[120%] -rotate-[8deg] rounded-full bg-white/95 shadow-[0_0_0_1px_rgba(148,163,184,.22)]" />
      <div className="absolute left-[8%] top-[13%] h-8 w-[112%] rotate-[4deg] rounded-full bg-white/90 shadow-[0_0_0_1px_rgba(148,163,184,.18)]" />
      <div className="absolute left-[46%] top-[-12%] h-[120%] w-9 rotate-[18deg] rounded-full bg-white/95 shadow-[0_0_0_1px_rgba(148,163,184,.22)]" />
      <div className="absolute left-[17%] top-[-18%] h-[125%] w-7 -rotate-[2deg] rounded-full bg-white/80" />
      <div className="absolute right-[9%] top-0 h-full w-8 rotate-[1deg] rounded-full bg-white/75" />
      <div className="absolute left-[12%] top-[54%] h-20 w-24 rounded-[12px] bg-emerald-200/50" />
      <div className="absolute right-[15%] top-[18%] h-24 w-28 rounded-[14px] bg-sky-200/45" />
      <div className="absolute left-[43%] top-[34%] h-14 w-20 rounded-[10px] bg-amber-200/60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#f8e001] text-[12px] font-black text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
        P
      </div>
      {drivers.slice(0, 8).map((driver, index) => (
        <div
          key={driver.id || index}
          className="pointer-events-none absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
          style={getMarkerPosition(driver, index, center)}
          title={`${driver.name || 'Driver'} - ${driver.vehicleNumber || selectedVehicle?.name || 'Vehicle'}`}
        >
          <img src={selectedVehicle?.icon || '/4_Taxi.png'} alt="" className="h-7 w-7 object-contain" />
        </div>
      ))}
      <div className="absolute bottom-24 left-4 rounded-[12px] border border-white/70 bg-white/85 px-3 py-2 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pickup</p>
        <p className="text-[11px] font-black text-slate-800">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
      </div>
    </div>
  );
};

const unwrap = (response) => response?.data?.data || response?.data || response;

const getVehicleTypes = (response) => {
  const data = unwrap(response);
  return data?.vehicle_types || data?.results || (Array.isArray(data) ? data : []);
};

const getTypeLabel = (type) => type?.name || type?.vehicle_type || type?.label || 'Vehicle';

const getIconValue = (type) => String(type?.icon_types || type?.vehicleIconType || type?.name || '').toLowerCase();

const getVehicleIcon = (type) => {
  const value = getIconValue(type);

  if (value.includes('bike')) {
    return '/1_Bike.png';
  }

  if (value.includes('auto')) {
    return '/2_AutoRickshaw.png';
  }

  return type?.image || '/4_Taxi.png';
};

const getCapacity = (type) => {
  const value = getIconValue(type);

  if (value.includes('bike')) {
    return 1;
  }

  if (value.includes('auto')) {
    return 3;
  }

  if (value.includes('suv')) {
    return 6;
  }

  return 4;
};

const getFareEstimate = (type) => {
  const value = getIconValue(type);
  const label = getTypeLabel(type).toLowerCase();

  if (value.includes('bike') || label.includes('bike')) {
    return 22;
  }

  if (value.includes('auto') || label.includes('auto')) {
    return 40;
  }

  if (value.includes('premium') || value.includes('lux') || label.includes('premium') || label.includes('lux')) {
    return 130;
  }

  if (value.includes('suv') || label.includes('suv')) {
    return 150;
  }

  return 106;
};

const getDropTime = (index) => {
  const date = new Date(Date.now() + (12 + index) * 60 * 1000);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const normalizeVehicleType = (type, index) => {
  const id = String(type?._id || type?.id || type?.name || index);
  const iconValue = getIconValue(type);

  return {
    id,
    vehicleTypeId: type?._id || type?.id || '',
    iconType: type?.icon_types || 'car',
    icon: getVehicleIcon(type),
    name: getTypeLabel(type),
    capacity: getCapacity(type),
    badge: iconValue.includes('bike') ? 'FASTEST' : null,
    badgeColor: 'bg-orange-50 text-orange-500 border-orange-100',
    sublabel: type?.short_description || type?.description || 'Available ride',
    eta: 2 + Math.min(index, 3),
    dropTime: getDropTime(index),
    price: getFareEstimate(type),
    raw: type,
  };
};

const SelectVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const [selected, setSelected] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [vehicleLoadError, setVehicleLoadError] = useState('');
  const [driverLoadError, setDriverLoadError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const pickup = routeState.pickup || 'Pipaliyahana, Indore';
  const drop = routeState.drop || 'Vijay Nagar, Indore';
  const pickupCoords = useMemo(() => routeState.pickupCoords || [75.9048, 22.7039], [routeState.pickupCoords]);
  const dropCoords = useMemo(() => routeState.dropCoords || [75.8937, 22.7533], [routeState.dropCoords]);
  const stops = routeState.stops || [];
  const routePrefix = location.pathname.startsWith('/taxi/user') ? '/taxi/user' : '';
  const pickupPosition = useMemo(() => toLatLng(pickupCoords), [pickupCoords]);

  useEffect(() => {
    let active = true;

    const loadVehicleTypes = async () => {
      setIsLoadingVehicles(true);
      setVehicleLoadError('');

      try {
        const response = await api.get('/admin/types/vehicle-types');

        if (!active) {
          return;
        }

        const nextVehicles = getVehicleTypes(response)
          .filter((type) => {
            const isActive = type.active !== false && Number(type.status ?? 1) !== 0;
            return isActive && String(type.transport_type || 'taxi').toLowerCase() === 'taxi';
          })
          .map(normalizeVehicleType);

        setVehicles(nextVehicles);
        setSelected((current) => current || nextVehicles[0]?.id || '');
      } catch (error) {
        if (active) {
          setVehicleLoadError(error.message || 'Could not load vehicle types.');
        }
      } finally {
        if (active) {
          setIsLoadingVehicles(false);
        }
      }
    };

    loadVehicleTypes();

    return () => {
      active = false;
    };
  }, []);

  const selectedVehicle = useMemo(() => vehicles.find((v) => v.id === selected), [selected, vehicles]);
  const selectedVehicleName = selectedVehicle?.name || 'vehicle';

  useEffect(() => {
    let active = true;

    const loadOnlineDrivers = async () => {
      if (!selectedVehicle?.vehicleTypeId) {
        setOnlineDrivers([]);
        return;
      }

      setIsLoadingDrivers(true);
      setDriverLoadError('');

      try {
        const response = await api.get('/rides/available-drivers', {
          params: {
            vehicleTypeId: selectedVehicle.vehicleTypeId,
            lng: pickupCoords[0],
            lat: pickupCoords[1],
          },
        });
        const data = unwrap(response);

        if (active) {
          setOnlineDrivers(data?.drivers || []);
        }
      } catch (error) {
        if (active) {
          setOnlineDrivers([]);
          setDriverLoadError(error.message || 'Could not load online drivers.');
        }
      } finally {
        if (active) {
          setIsLoadingDrivers(false);
        }
      }
    };

    loadOnlineDrivers();

    return () => {
      active = false;
    };
  }, [pickupCoords, selectedVehicle]);

  const handleBook = () => {
    if (!selectedVehicle) {
      return;
    }

    navigate(`${routePrefix}/ride/searching`, {
      state: {
        pickup,
        drop,
        pickupCoords,
        dropCoords,
        stops,
        vehicle: selectedVehicle,
        vehicleTypeId: selectedVehicle.vehicleTypeId,
        vehicleIconType: selectedVehicle.iconType,
        paymentMethod,
        fare: selectedVehicle.price,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      <div className="h-[44%] w-full relative bg-gray-200">
        <VehicleMapPreview
          center={pickupPosition}
          drivers={onlineDrivers}
          selectedVehicle={selectedVehicle}
        />

        <div className="absolute top-6 left-4 right-4 z-20 flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/95 rounded-[14px] shadow-[0_4px_14px_rgba(15,23,42,0.12)] flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-slate-900" strokeWidth={2.5} />
          </motion.button>
          <div className="flex-1 bg-white/95 rounded-[14px] px-4 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] flex items-center gap-2">
            <span className="text-[14px] font-black text-slate-800 truncate flex-1">{pickup}</span>
            <X size={15} className="text-slate-400 shrink-0" />
          </div>
        </div>

        <AnimatePresence>
          {showPromo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-md border border-white/80 rounded-[18px] flex items-center overflow-hidden z-30 shadow-[0_8px_24px_rgba(15,23,42,0.10)] pr-3"
            >
              <div className="flex-1 px-4 py-3">
                <p className="text-[12px] font-black text-slate-900 leading-tight">Going a few kms away?</p>
                <p className="text-[10px] font-black text-orange-500 mt-0.5 uppercase tracking-wider">Use GOFREE on 1st cab ride</p>
              </div>
              <img src="/ride_now_banner.png" className="h-12 w-16 object-cover rounded-[10px] shrink-0" alt="Promo" />
              <button onClick={() => setShowPromo(false)} className="ml-2.5 pl-2.5 border-l border-slate-100">
                <X size={13} className="text-slate-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute left-4 right-4 bottom-4 z-20 flex items-center justify-between gap-3">
          <div className="bg-white/95 rounded-[14px] px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.10)] border border-white/80">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Online {selectedVehicleName}</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-1">
              {isLoadingDrivers ? 'Checking...' : `${onlineDrivers.length} online`}
            </p>
          </div>
          {driverLoadError && (
            <div className="bg-red-50/95 rounded-[14px] px-3 py-2 border border-red-100 max-w-[190px]">
              <p className="text-[10px] font-black text-red-500 leading-tight">{driverLoadError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 top-[41%] bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_100%)] rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.08)] flex flex-col z-40 overflow-hidden">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-36 space-y-2">
          {isLoadingVehicles && (
            <div className="min-h-[220px] flex flex-col items-center justify-center gap-3 text-slate-400">
              <LoaderCircle size={26} className="animate-spin" />
              <p className="text-[11px] font-black uppercase tracking-widest">Loading vehicle types</p>
            </div>
          )}

          {!isLoadingVehicles && vehicleLoadError && (
            <div className="bg-white/90 border border-red-100 rounded-[18px] px-4 py-5 text-center">
              <p className="text-[12px] font-black text-red-500">{vehicleLoadError}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Ask admin to check vehicle type catalog.</p>
            </div>
          )}

          {!isLoadingVehicles && !vehicleLoadError && vehicles.length === 0 && (
            <div className="bg-white/90 border border-slate-100 rounded-[18px] px-4 py-5 text-center">
              <p className="text-[13px] font-black text-slate-900">No vehicle types available</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Admin needs to create active taxi vehicle types first.</p>
            </div>
          )}

          {!isLoadingVehicles && !vehicleLoadError && vehicles.map((v, i) => {
            const isSelected = selected === v.id;
            return (
              <motion.button
                key={v.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(v.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[18px] border transition-all text-left ${
                  isSelected
                    ? 'bg-white border-orange-200 shadow-[0_4px_16px_rgba(249,115,22,0.12)]'
                    : 'bg-white/80 border-white/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
                }`}
              >
                <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'bg-orange-50' : 'bg-slate-50'
                }`}>
                  <img src={v.icon} alt={v.name} className="w-11 h-11 object-contain drop-shadow-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] font-black text-slate-900 leading-tight">{v.name}</span>
                    <div className="flex items-center gap-0.5 text-slate-400">
                      <Users size={11} strokeWidth={2.5} />
                      <span className="text-[10px] font-black">{v.capacity}</span>
                    </div>
                    {v.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${v.badgeColor}`}>
                        {v.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 leading-tight">{v.sublabel}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Available nearby - {v.eta} mins away - Drop {v.dropTime}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[17px] font-black text-slate-900 tracking-tighter leading-none">Rs {v.price}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-orange-500"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pt-3 pb-6 space-y-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPaymentModal(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-[14px] border border-white/80 bg-slate-50 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[9px] bg-white flex items-center justify-center shadow-sm">
                {paymentMethod === 'Cash' ? <Banknote size={14} className="text-slate-600" strokeWidth={2} /> : <CreditCard size={14} className="text-slate-600" strokeWidth={2} />}
              </div>
              <span className="text-[13px] font-black text-slate-800">{paymentMethod}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </motion.button>

          <motion.button
            whileTap={selectedVehicle ? { scale: 0.98 } : undefined}
            disabled={!selectedVehicle}
            onClick={handleBook}
            className="w-full bg-[#f8e001] py-4 rounded-[18px] text-[15px] font-black text-slate-900 shadow-[0_6px_20px_rgba(248,224,1,0.35)] uppercase tracking-tight disabled:opacity-50 disabled:shadow-none"
          >
            {selectedVehicle ? `Book ${selectedVehicle.name}` : 'Select Vehicle'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[28px] px-5 pt-4 pb-10 z-[101]"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 mb-1">Payment</p>
              <h3 className="text-[18px] font-black text-slate-900 mb-5">Select Method</h3>
              <div className="space-y-2.5">
                {[
                  { id: 'Cash', label: 'Cash', sub: 'Pay after ride', Icon: Banknote, bg: 'bg-green-50', color: 'text-green-600' },
                  { id: 'Online Payment', label: 'Online Payment', sub: 'UPI, Cards or Wallets', Icon: CreditCard, bg: 'bg-blue-50', color: 'text-blue-600' },
                ].map(({ id, label, sub, Icon, bg, color }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setPaymentMethod(id); setShowPaymentModal(false); }}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-[18px] border-2 transition-all ${
                      paymentMethod === id ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-[12px] ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-black text-slate-900">{label}</p>
                      <p className="text-[11px] font-bold text-slate-400">{sub}</p>
                    </div>
                    {paymentMethod === id && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectVehicle;
