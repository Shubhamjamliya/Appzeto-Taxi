import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, X, Banknote, CreditCard, ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import api from '../../../../shared/api/axiosInstance';
import { HAS_VALID_GOOGLE_MAPS_KEY, useAppGoogleMapsLoader } from '../../../admin/utils/googleMaps';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const toLatLng = (coords, fallback = { lat: 22.7196, lng: 75.8577 }) => {
  const [lng, lat] = coords || [];

  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return { lat: Number(lat), lng: Number(lng) };
  }

  return fallback;
};

const getDriverPosition = (driver) => toLatLng(driver?.location?.coordinates, null);

const buildFallbackRoute = (origin, destination) => {
  if (!origin || !destination) {
    return [];
  }

  const latDelta = destination.lat - origin.lat;
  const lngDelta = destination.lng - origin.lng;
  const bendScale = Math.abs(latDelta) > Math.abs(lngDelta) ? 0.28 : -0.28;
  const latBend = latDelta * bendScale;
  const lngBend = lngDelta * bendScale;

  return [
    origin,
    { lat: origin.lat + latDelta * 0.18, lng: origin.lng + lngDelta * 0.08 },
    { lat: origin.lat + latDelta * 0.36 + latBend, lng: origin.lng + lngDelta * 0.34 - lngBend },
    { lat: origin.lat + latDelta * 0.62 - latBend, lng: origin.lng + lngDelta * 0.58 + lngBend },
    { lat: origin.lat + latDelta * 0.84, lng: origin.lng + lngDelta * 0.9 },
    destination,
  ];
};

const VehicleMapPreview = ({ center, dropPosition, drivers, selectedVehicle, isLoaded, loadError }) => {
  const [routePath, setRoutePath] = useState([]);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    if (!isLoaded || !dropPosition || !window.google?.maps?.DirectionsService) {
      setRoutePath([]);
      setRouteError('');
      return;
    }

    let active = true;
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: center,
        destination: dropPosition,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (!active) {
          return;
        }

        if (status === 'OK' && result?.routes?.[0]?.overview_path?.length) {
          setRoutePath(
            result.routes[0].overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            })),
          );
          setRouteError('');
          return;
        }

        setRoutePath(buildFallbackRoute(center, dropPosition));
        setRouteError(status || 'Directions unavailable');
      },
    );

    return () => {
      active = false;
    };
  }, [center, dropPosition, isLoaded]);

  if (!HAS_VALID_GOOGLE_MAPS_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center">
        <div className="rounded-[18px] bg-white/90 px-4 py-4 shadow-sm">
          <p className="text-[12px] font-black text-slate-900">Google Maps key missing</p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">Set `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env`.</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center">
        <div className="rounded-[18px] bg-white/90 px-4 py-4 shadow-sm">
          <p className="text-[12px] font-black text-slate-900">Google Maps failed to load</p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">Check the browser key restrictions and reload.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-200">
        <div className="flex items-center gap-2 rounded-[16px] bg-white/90 px-4 py-3 shadow-sm">
          <LoaderCircle size={18} className="animate-spin text-slate-500" />
          <span className="text-[12px] font-black text-slate-700">Loading map</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={13}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy',
        }}
      >
        <MarkerF
          position={center}
          title="Pickup"
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#f8e001',
            fillOpacity: 1,
            strokeColor: '#111827',
            strokeWeight: 2,
            scale: 8,
          }}
        />
        {dropPosition && (
          <MarkerF
            position={dropPosition}
            title="Drop"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#fb923c',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 7,
            }}
          />
        )}
        {routePath.length > 1 && (
          <PolylineF
            path={routePath}
            options={{
              strokeColor: '#111827',
              strokeOpacity: 0.85,
              strokeWeight: 4,
            }}
          />
        )}
        {drivers.slice(0, 8).map((driver, index) => {
          const position = getDriverPosition(driver);

          if (!position) {
            return null;
          }

          return (
            <MarkerF
              key={driver.id || driver._id || index}
              position={position}
              title={`${driver.name || 'Driver'} - ${driver.vehicleNumber || selectedVehicle?.name || 'Vehicle'}`}
              icon={{
                url: selectedVehicle?.icon || '/4_Taxi.png',
                scaledSize: new window.google.maps.Size(28, 28),
              }}
            />
          );
        })}
      </GoogleMap>

      <div className="pointer-events-none absolute bottom-24 left-4 rounded-[12px] border border-white/70 bg-white/90 px-3 py-2 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pickup</p>
        <p className="text-[11px] font-black text-slate-800">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
      </div>
      {routeError && (
        <div className="pointer-events-none absolute bottom-10 left-4 rounded-[12px] border border-amber-100 bg-white/90 px-3 py-2 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Route</p>
          <p className="text-[11px] font-black text-slate-700">Using fallback path while directions load.</p>
        </div>
      )}
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
  const dropPosition = useMemo(() => toLatLng(dropCoords, null), [dropCoords]);
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useAppGoogleMapsLoader();

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
            vehicleIconType: selectedVehicle.iconType,
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
    <div className="h-[100dvh] bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      <div className="absolute inset-0 w-full bg-gray-200">
        <VehicleMapPreview
          center={pickupPosition}
          dropPosition={dropPosition}
          drivers={onlineDrivers}
          selectedVehicle={selectedVehicle}
          isLoaded={isMapLoaded}
          loadError={mapLoadError}
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

      <div className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[66dvh] min-h-[260px] flex-col overflow-hidden rounded-t-[28px] bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_100%)] shadow-[0_-8px_32px_rgba(15,23,42,0.08)]">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-4 space-y-2">
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

        <div className="shrink-0 border-t border-slate-100 bg-white/95 px-4 pb-6 pt-3 space-y-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md">
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
                    onClick={() => {
                      setPaymentMethod(id);
                      setShowPaymentModal(false);
                    }}
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
