import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, AlertTriangle, Shield, Star, ChevronLeft, Share2 } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import { HAS_VALID_GOOGLE_MAPS_KEY, useAppGoogleMapsLoader } from '../../../admin/utils/googleMaps';
import { socketService } from '../../../../shared/api/socket';
import api from '../../../../shared/api/axiosInstance';
import { clearCurrentRide, getCurrentRide, saveCurrentRide } from '../../services/currentRideService';
import carIcon from '../../../../assets/icons/car.png';
import bikeIcon from '../../../../assets/icons/bike.png';
import autoIcon from '../../../../assets/icons/auto.png';
import deliveryIcon from '../../../../assets/icons/Delivery.png';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 22.7196, lng: 75.8577 };
const TERMINAL_STATUSES = new Set(['completed', 'cancelled', 'delivered']);

const toLatLng = (coords, fallback = DEFAULT_CENTER) => {
  const [lng, lat] = coords || [];

  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return { lat: Number(lat), lng: Number(lng) };
  }

  return fallback;
};

const arePositionsNearlyEqual = (first, second, threshold = 0.0002) => (
  Math.abs(Number(first?.lat ?? 0) - Number(second?.lat ?? 0)) < threshold &&
  Math.abs(Number(first?.lng ?? 0) - Number(second?.lng ?? 0)) < threshold
);

const getTrackingVehicleIcon = (ride, driver) => {
  const serviceType = String(ride?.serviceType || ride?.type || '').toLowerCase();
  const iconType = String(ride?.vehicleIconType || driver?.vehicleIconType || driver?.vehicleType || '').toLowerCase();

  if (serviceType === 'parcel') return deliveryIcon;
  if (iconType.includes('bike')) return bikeIcon;
  if (iconType.includes('auto')) return autoIcon;
  return carIcon;
};

const unwrapApiPayload = (response) => response?.data?.data || response?.data || response;

const RideTracking = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [rideRealtime, setRideRealtime] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [map, setMap] = useState(null);
  const fittedRouteKeyRef = useRef('');
  const navigate = useNavigate();
  const location = useLocation();
  const storedRide = useMemo(() => getCurrentRide(), []);
  const state = useMemo(() => location.state || storedRide || {}, [location.state, storedRide]);
  const { isLoaded, loadError } = useAppGoogleMapsLoader();

  const rideId = state.rideId || '';
  const otp = state.otp || '1234';
  const fare = state.fare || 22;
  const paymentMethod = state.paymentMethod || 'Cash';
  const fallbackDriver = useMemo(
    () => state.driver || { name: 'Captain', rating: '4.9', vehicle: 'Taxi', plate: 'Assigned', phone: '' },
    [state.driver],
  );
  const pickupLabel = rideRealtime?.pickup?.address || state.pickup || 'Pipaliyahana, Indore';
  const dropLabel = rideRealtime?.drop?.address || state.drop || 'Vijay Nagar, Indore';
  const pickupPosition = useMemo(
    () => toLatLng(rideRealtime?.pickup?.coordinates || state.pickupCoords || [75.9048, 22.7039]),
    [rideRealtime?.pickup?.coordinates, state.pickupCoords],
  );
  const dropPosition = useMemo(
    () => toLatLng(rideRealtime?.drop?.coordinates || state.dropCoords || [75.8937, 22.7533], pickupPosition),
    [pickupPosition, rideRealtime?.drop?.coordinates, state.dropCoords],
  );
  const driverPosition = useMemo(
    () => toLatLng(rideRealtime?.driverLocation?.coordinates, pickupPosition),
    [pickupPosition, rideRealtime?.driverLocation?.coordinates],
  );
  const tripStatus = String(rideRealtime?.status || state.liveStatus || state.status || 'accepted').toLowerCase();
  const serviceType = String(state.serviceType || state.type || 'ride').toLowerCase();
  const activeDestination = useMemo(
    () => (tripStatus === 'started' ? dropPosition : pickupPosition),
    [dropPosition, pickupPosition, tripStatus],
  );
  const driver = rideRealtime?.driver || fallbackDriver;
  const vehicleIcon = getTrackingVehicleIcon(state, driver);
  const vehicleLabel = driver.vehicle || driver.vehicleType || (serviceType === 'parcel' ? 'Parcel' : 'Taxi');

  useEffect(() => {
    let active = true;

    if (!rideId) {
      clearCurrentRide();
      navigate(location.pathname.startsWith('/taxi/user') ? '/taxi/user' : '/', { replace: true });
      return () => {
        active = false;
      };
    }

    const hydrateRideState = async () => {
      try {
        const response = await api.get(`/rides/${rideId}`);
        const payload = unwrapApiPayload(response);
        const nextStatus = String(payload?.liveStatus || payload?.status || '').toLowerCase();

        if (!active) {
          return;
        }

        if (TERMINAL_STATUSES.has(nextStatus)) {
          clearCurrentRide();
          navigate(location.pathname.startsWith('/taxi/user') ? '/taxi/user' : '/', { replace: true });
          return;
        }

        setRideRealtime({
          pickup: {
            coordinates: payload?.pickupLocation?.coordinates,
            address: state.pickup || 'Pickup',
          },
          drop: {
            coordinates: payload?.dropLocation?.coordinates,
            address: state.drop || 'Drop',
          },
          driverLocation: payload?.lastDriverLocation
            ? { coordinates: payload.lastDriverLocation.coordinates }
            : null,
          status: payload?.liveStatus || payload?.status || 'accepted',
          driver: payload?.driver || fallbackDriver,
        });

        saveCurrentRide({
          ...state,
          rideId,
          driver: payload?.driver || fallbackDriver,
          status: payload?.status || state.status || 'accepted',
          liveStatus: payload?.liveStatus || payload?.status || state.liveStatus || state.status || 'accepted',
        });
      } catch {
        // Keep socket and stored state as fallback when direct fetch is unavailable.
      }
    };

    hydrateRideState();

    return () => {
      active = false;
    };
  }, [fallbackDriver, location.pathname, navigate, rideId, state]);

  useEffect(() => {
    if (!TERMINAL_STATUSES.has(tripStatus)) {
      return;
    }

    clearCurrentRide();
    const timeoutId = window.setTimeout(() => {
      navigate(location.pathname.startsWith('/taxi/user') ? '/taxi/user' : '/');
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, navigate, tripStatus]);

  useEffect(() => {
    if (!rideId) {
      return () => {};
    }

    const socket = socketService.connect({ role: 'user' });

    if (!socket) {
      return () => {};
    }

    const onRideState = (payload) => {
      if (!payload || String(payload.rideId || '') !== String(rideId)) {
        return;
      }

      setRideRealtime({
        pickup: {
          coordinates: payload.pickupLocation?.coordinates,
          address: state.pickup || 'Pickup',
        },
        drop: {
          coordinates: payload.dropLocation?.coordinates,
          address: state.drop || 'Drop',
        },
        driverLocation: payload.lastDriverLocation
          ? { coordinates: payload.lastDriverLocation.coordinates }
          : null,
        status: payload.liveStatus || payload.status || 'accepted',
        driver: payload.driver || fallbackDriver,
      });
    };

    const onLocationUpdated = (payload) => {
      if (!payload || String(payload.rideId || '') !== String(rideId)) {
        return;
      }

      setRideRealtime((prev) => ({
        ...(prev || {}),
        driverLocation: {
          coordinates: payload.coordinates,
        },
      }));
    };

    const onStatusUpdated = (payload) => {
      if (!payload || String(payload.rideId || '') !== String(rideId)) {
        return;
      }

      const nextStatus = payload.liveStatus || payload.status || 'accepted';
      if (['completed', 'cancelled'].includes(String(nextStatus).toLowerCase())) {
        clearCurrentRide();
      } else {
        saveCurrentRide({
          ...state,
          rideId,
          driver,
          status: nextStatus,
        });
      }

      setRideRealtime((prev) => ({
        ...(prev || {}),
        status: nextStatus,
      }));
    };

    socketService.on('ride:state', onRideState);
    socketService.on('ride:driver-location:updated', onLocationUpdated);
    socketService.on('ride:status:updated', onStatusUpdated);
    socketService.emit('ride:join', { rideId });

    return () => {
      socketService.off('ride:state', onRideState);
      socketService.off('ride:driver-location:updated', onLocationUpdated);
      socketService.off('ride:status:updated', onStatusUpdated);
    };
  }, [fallbackDriver, rideId, state, state.drop, state.pickup]);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.DirectionsService) {
      setRoutePath([driverPosition, activeDestination]);
      setRouteError('');
      return;
    }

    if (arePositionsNearlyEqual(driverPosition, activeDestination)) {
      setRoutePath([driverPosition]);
      setRouteError('');
      return;
    }

    let active = true;
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: driverPosition,
        destination: activeDestination,
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

        setRoutePath([driverPosition, activeDestination]);
        setRouteError(status || 'Directions unavailable');
      },
    );

    return () => {
      active = false;
    };
  }, [activeDestination, driverPosition, isLoaded]);

  useEffect(() => {
    if (!map || !window.google?.maps) {
      return;
    }

    if (routePath.length > 1) {
      const fitKey = `${tripStatus}:${activeDestination.lat.toFixed(5)},${activeDestination.lng.toFixed(5)}`;
      if (fittedRouteKeyRef.current === fitKey) {
        map.panTo(driverPosition);
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { top: 120, right: 48, bottom: 300, left: 48 });
      fittedRouteKeyRef.current = fitKey;
      return;
    }

    map.panTo(driverPosition);
    if (!fittedRouteKeyRef.current) {
      map.setZoom(15);
      fittedRouteKeyRef.current = `${tripStatus}:single-point`;
    }
  }, [activeDestination, driverPosition, map, routePath, tripStatus]);

  const handleShare = () => {
    const text = `I'm riding with Rydon24!\nDriver: ${driver.name} (${driver.plate || driver.vehicleNumber || 'Assigned'})\nFrom: ${pickupLabel}\nTo: ${dropLabel}`;
    if (navigator.share) {
      navigator.share({ title: 'Track My Ride', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    }
  };

  const ActionBtn = ({ icon: Icon, label, onClick, colorClass }) => (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[14px] border border-slate-100 bg-slate-50/80 transition-all ${colorClass || ''}`}
    >
      <Icon size={17} className="text-slate-700" strokeWidth={2} />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-[14px] text-[12px] font-black shadow-xl whitespace-nowrap"
          >
            Ride details copied!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0 bg-slate-200">
        {!HAS_VALID_GOOGLE_MAPS_KEY ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center">
            <div className="rounded-[18px] bg-white/90 px-4 py-4 shadow-sm">
              <p className="text-[12px] font-bold text-slate-900">Google Maps key missing</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">Set `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env`.</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center">
            <div className="rounded-[18px] bg-white/90 px-4 py-4 shadow-sm">
              <p className="text-[12px] font-bold text-slate-900">Google Maps failed to load</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">Check the browser key restrictions and reload.</p>
            </div>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={driverPosition}
            zoom={14}
            onLoad={setMap}
            onUnmount={() => setMap(null)}
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
            {routePath.length > 1 && (
              <PolylineF
                path={routePath}
                options={{
                  strokeColor: '#111827',
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                }}
              />
            )}
            <MarkerF
              position={driverPosition}
              title="Driver"
              icon={{
                url: vehicleIcon,
                scaledSize: new window.google.maps.Size(42, 42),
                anchor: new window.google.maps.Point(21, 21),
              }}
            />
            <MarkerF
              position={activeDestination}
              title={tripStatus === 'started' ? 'Drop' : 'Pickup'}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: tripStatus === 'started' ? '#ef4444' : '#10b981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 7,
              }}
            />
          </GoogleMap>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            <div className="rounded-[16px] bg-white/90 px-4 py-3 shadow-sm text-[12px] font-bold text-slate-700">
              Loading map
            </div>
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/taxi/user')}
        className="absolute top-8 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80 flex items-center justify-center"
      >
        <ChevronLeft size={18} className="text-slate-900" strokeWidth={2.5} />
      </motion.button>

      <div className="absolute top-8 left-16 right-4 z-10 bg-white/90 backdrop-blur-md rounded-[14px] px-3.5 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.08)] border border-white/80">
        <p className="text-[11px] font-black text-slate-500 truncate">{pickupLabel} → {dropLabel}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/support')}
        className="absolute top-24 right-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.08)] flex items-center gap-1.5"
      >
        <Shield size={13} className="text-blue-500" strokeWidth={2.5} />
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Safety</span>
      </motion.button>

      {routeError && (
        <div className="absolute top-24 left-4 z-10 rounded-[12px] border border-amber-100 bg-white/90 px-3 py-2 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route</p>
          <p className="text-[11px] font-bold text-slate-700">Using fallback path while directions load.</p>
        </div>
      )}

      <motion.div
        animate={{ y: drawerOpen ? 0 : 340 }}
        className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.10)] z-20 border-t border-white/80"
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-4 cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)} />

        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-50">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-[16px] bg-slate-100 overflow-hidden border border-slate-100">
                <img
                  src={`https://ui-avatars.com/api/?name=${String(driver.name || 'Captain').replace(' ', '+')}&background=f1f5f9&color=0f172a`}
                  className="w-full h-full object-cover"
                  alt="Driver"
                />
              </div>
              <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-[9px] border-2 border-white bg-slate-900 shadow-sm">
                <img src={vehicleIcon} alt={vehicleLabel} className="h-5 w-5 object-contain" draggable={false} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 px-1.5 py-0.5 rounded-[8px] border-2 border-white flex items-center gap-0.5 shadow-sm">
                <Star size={9} className="text-slate-900 fill-slate-900" />
                <span className="text-[9px] font-bold text-slate-900">{driver.rating || '4.9'}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-bold text-slate-900 leading-tight">{driver.name || 'Captain'}</h3>
              <p className="text-[12px] font-bold text-orange-500 mt-0.5">
                {tripStatus === 'started' ? (serviceType === 'parcel' ? 'Parcel picked up' : 'Trip started') : serviceType === 'parcel' ? 'Delivery agent is on the way' : 'Captain is on the way'}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{driver.plate || driver.vehicleNumber || 'Assigned'} · {driver.vehicle || driver.vehicleType || 'Taxi'}</p>
            </div>
            <div className="shrink-0 bg-orange-50 border border-orange-100 rounded-[12px] px-3 py-2 text-right">
              <p className="text-[8px] font-black text-orange-400 uppercase tracking-wider">OTP</p>
              <p className="text-[16px] font-bold text-slate-900 tracking-widest leading-tight">{otp}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone || ''}`)} />
            <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat')} />
            <ActionBtn icon={Share2} label="Share" onClick={handleShare} />
            <ActionBtn icon={AlertTriangle} label="Help" onClick={() => navigate('/support')} />
          </div>

          <div className="flex items-center justify-between rounded-[18px] border border-white/80 bg-slate-50/80 px-4 py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Fare</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[20px] font-bold text-slate-900 tracking-tighter leading-none">Rs {fare}.00</span>
                <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">{paymentMethod}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCancelConfirm(true)}
              className="bg-white border border-red-100 text-red-400 font-bold text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-[12px] shadow-sm"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-sm bg-white rounded-[28px] p-7 z-[101] shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-[18px] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={26} className="text-red-400" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-bold text-slate-900 mb-1.5">Cancel your ride?</h3>
              <p className="text-[13px] font-bold text-slate-400 mb-6 leading-relaxed">Your captain is already on the way.</p>
              <div className="space-y-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    clearCurrentRide();
                    navigate('/taxi/user');
                  }}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-[16px] text-[13px] font-bold uppercase tracking-widest"
                >
                  Yes, Cancel
                </motion.button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full py-3.5 text-[13px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  No, Go Back
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideTracking;
