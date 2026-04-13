import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Phone, MessageCircle, Shield, CheckCircle2, Navigation, AlertTriangle, Star, Package } from 'lucide-react';
import api from '../../../../shared/api/axiosInstance';
import { socketService } from '../../../../shared/api/socket';
import { getLocalUserToken, userAuthService } from '../../services/authService';
import { saveCurrentRide } from '../../services/currentRideService';

const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));
const unwrap = (response) => response?.data?.data || response?.data || response;
const unwrapLoginPayload = (response) => {
  const payload = unwrap(response);
  return payload?.token ? payload : payload?.data || {};
};
const DRIVER_PLACEHOLDER = { name: 'Delivery Captain', rating: '4.9', vehicle: 'Bike', plate: 'Assigned', phone: '', eta: 2 };
const STAGES = { SEARCHING: 'searching', ASSIGNED: 'assigned', ACCEPTED: 'accepted' };

const normalizeDriver = (driver = {}) => ({
  name: driver.name || 'Delivery Captain',
  rating: driver.rating || '4.9',
  vehicle: driver.vehicleType || 'Bike',
  plate: driver.vehicleNumber || 'Assigned',
  phone: driver.phone || '',
  eta: driver.eta || 2,
});

const pickParcelVehicle = (types = []) => {
  const activeTypes = types.filter((type) => type.active !== false && Number(type.status ?? 1) !== 0);
  const parcelFirst = activeTypes.find((type) => {
    const value = `${type.name || ''} ${type.icon_types || ''} ${type.transport_type || ''}`.toLowerCase();
    return value.includes('bike') || value.includes('delivery') || value.includes('parcel');
  });
  return parcelFirst || activeTypes[0] || null;
};

const ActionBtn = ({ icon: Icon, label, onClick }) => (
  <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[12px] border border-slate-100 bg-slate-50/80 transition-all">
    <Icon size={15} className="text-slate-700" strokeWidth={2} />
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
  </motion.button>
);

const DriverCard = ({ driver, banner, bannerGradient, children }) => (
  <div className="rounded-[20px] border border-white/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.14)] overflow-hidden">
    <div className={`px-4 py-2.5 flex items-center gap-2.5 ${bannerGradient}`}>{banner}</div>
    <div className="px-4 pt-3 pb-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-[13px] bg-slate-100 overflow-hidden border border-slate-100">
            <img src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=f1f5f9&color=0f172a`} className="w-full h-full object-cover" alt="Driver" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 px-1 py-0.5 rounded-[6px] border-2 border-white flex items-center gap-0.5 shadow-sm">
            <Star size={8} className="text-slate-900 fill-slate-900" />
            <span className="text-[8px] font-black text-slate-900">{driver.rating}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">{driver.name}</h3>
          <p className="text-[11px] font-black text-orange-500 mt-0.5">Arriving in {driver.eta} mins</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{driver.plate} · {driver.vehicle}</p>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const ParcelSearchingDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const [stage, setStage] = useState(STAGES.SEARCHING);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [otp] = useState(generateOTP);
  const [driver, setDriver] = useState(DRIVER_PLACEHOLDER);
  const [searchStatus, setSearchStatus] = useState('Preparing your parcel booking...');
  const [bookingError, setBookingError] = useState('');
  const activeRidePollRef = useRef(null);
  const requestStartedRef = useRef(false);
  const trackingStartedRef = useRef(false);
  const driverRef = useRef(driver);
  const activeRideIdRef = useRef('');

  useEffect(() => {
    driverRef.current = driver;
  }, [driver]);

  useEffect(() => {
    if (requestStartedRef.current) return undefined;
    requestStartedRef.current = true;

    const moveToTracking = ({ acceptedDriver, rideId, rideSnapshot }) => {
      if (trackingStartedRef.current) return;

      const nextDriver = normalizeDriver(acceptedDriver);
      driverRef.current = nextDriver;
      setDriver(nextDriver);
      setStage(STAGES.ACCEPTED);
      setSearchStatus('Delivery agent accepted your parcel.');
      activeRideIdRef.current = String(rideId || activeRideIdRef.current || '');
      trackingStartedRef.current = true;

      const nextRide = {
        ...routeState,
        type: 'parcel',
        serviceType: 'parcel',
        rideId: activeRideIdRef.current,
        otp,
        driver: nextDriver,
        fare: rideSnapshot?.fare || routeState.fare || routeState.estimatedFare?.min || 45,
        paymentMethod: routeState.paymentMethod || 'Cash',
        status: 'accepted',
        parcel: rideSnapshot?.parcel || routeState.parcel || null,
      };

      saveCurrentRide(nextRide);

      clearInterval(activeRidePollRef.current);
      setTimeout(() => {
        navigate('/parcel/tracking', { state: nextRide });
      }, 1400);
    };

    const hydrateAcceptedRide = async () => {
      const activeResponse = await api.get('/rides/active/me');
      const activeRide = activeResponse?.data || activeResponse;
      if (!activeRide?.rideId) return null;
      return activeRide;
    };

    const onRideSearchUpdate = ({ matchedDrivers, radius }) => {
      const radiusKm = radius ? (Number(radius) / 1000).toFixed(1) : '';
      if (matchedDrivers > 0) setStage(STAGES.ASSIGNED);
      setSearchStatus(
        matchedDrivers > 0
          ? `${matchedDrivers} delivery agent${matchedDrivers > 1 ? 's' : ''} found within ${radiusKm} km`
          : `Searching nearby agents within ${radiusKm} km`,
      );
    };

    const onRideAccepted = ({ driver: acceptedDriver, rideId, parcel }) => {
      moveToTracking({ acceptedDriver, rideId, rideSnapshot: { fare: routeState.fare, parcel } });
    };

    const onRideState = (payload) => {
      if (!payload || String(payload.rideId || '') !== String(activeRideIdRef.current || '')) return;
      if (payload.status === 'accepted' || payload.liveStatus === 'accepted') {
        moveToTracking({ acceptedDriver: payload.driver, rideId: payload.rideId, rideSnapshot: payload });
      }
    };

    const onRideStatusUpdated = async (payload) => {
      if (!payload || String(payload.rideId || '') !== String(activeRideIdRef.current || '')) return;
      if (payload.status === 'accepted' || payload.liveStatus === 'accepted') {
        const activeRide = await hydrateAcceptedRide().catch(() => null);
        moveToTracking({
          acceptedDriver: activeRide?.driver || driverRef.current,
          rideId: payload.rideId,
          rideSnapshot: activeRide || payload,
        });
      }
    };

    const onRideCancelled = ({ reason }) => {
      setBookingError(reason || 'No drivers accepted the parcel request.');
      setSearchStatus(reason || 'No drivers accepted the parcel request.');
      setStage(STAGES.SEARCHING);
    };

    const onError = ({ message }) => {
      setBookingError(message || 'Could not create parcel booking.');
      setSearchStatus(message || 'Could not create parcel booking.');
    };

    socketService.on('rideSearchUpdate', onRideSearchUpdate);
    socketService.on('rideAccepted', onRideAccepted);
    socketService.on('ride:state', onRideState);
    socketService.on('ride:status:updated', onRideStatusUpdated);
    socketService.on('rideCancelled', onRideCancelled);
    socketService.on('errorMessage', onError);

    (async () => {
      try {
        let userToken = getLocalUserToken();

        if (!userToken) {
          const loginResponse = await userAuthService.loginDemoUser();
          const loginPayload = unwrapLoginPayload(loginResponse);
          if (loginPayload?.token) {
            userToken = loginPayload.token;
            localStorage.setItem('token', userToken);
            localStorage.setItem('userToken', userToken);
            localStorage.setItem('role', 'user');
            localStorage.setItem('userInfo', JSON.stringify(loginPayload.user || {}));
          }
        }

        setSearchStatus('Loading delivery vehicle type...');
        const vehicleCatalogResponse = await api.get('/admin/types/vehicle-types');
        const vehicleCatalog = unwrap(vehicleCatalogResponse);
        const vehicleTypes = vehicleCatalog?.vehicle_types || vehicleCatalog?.results || (Array.isArray(vehicleCatalog) ? vehicleCatalog : []);
        const selectedVehicleType = pickParcelVehicle(vehicleTypes);

        if (!selectedVehicleType?._id && !selectedVehicleType?.id) {
          throw new Error('No active vehicle type available for parcel dispatch.');
        }

        const rideRequestConfig = userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : {};
        const response = await api.post('/rides', {
          pickup: routeState.pickupCoords || [75.9048, 22.7039],
          drop: routeState.dropCoords || [75.8937, 22.7533],
          fare: routeState.fare || routeState.estimatedFare?.min || 45,
          vehicleTypeId: selectedVehicleType._id || selectedVehicleType.id,
          vehicleIconType: selectedVehicleType.icon_types || 'bike',
          paymentMethod: routeState.paymentMethod || 'Cash',
          type: 'parcel',
          parcel: routeState.parcel || {
            category: routeState.parcelType || 'Parcel',
            weight: routeState.weight || 'Under 5kg',
            description: routeState.description || '',
            senderName: routeState.senderName || '',
            senderMobile: routeState.senderMobile || '',
            receiverName: routeState.receiverName || '',
            receiverMobile: routeState.receiverMobile || '',
          },
        }, rideRequestConfig);

        const payload = response?.data || response;
        const ride = payload?.ride || payload;
        const rideId = ride?._id || ride?.id || payload?.realtime?.rideId;
        activeRideIdRef.current = String(rideId || '');

        const socket = socketService.connect({ role: 'user', token: userToken });
        if (socket && rideId) {
          socketService.emit('joinRide', { rideId });
          socketService.emit('ride:join', { rideId });
        }

        const pollActiveRide = async () => {
          try {
            const activeRide = await hydrateAcceptedRide();
            if (!activeRide?.rideId) return;
            const isThisRide = String(activeRide.rideId || '') === String(rideId || '');
            const isAcceptedRide = ['accepted', 'arriving', 'started', 'ongoing'].includes(String(activeRide.status || activeRide.liveStatus || '').toLowerCase());
            if (isThisRide && isAcceptedRide) {
              moveToTracking({ acceptedDriver: activeRide.driver || driverRef.current, rideId: activeRide.rideId, rideSnapshot: activeRide });
            }
          } catch (_error) {
            // Socket path stays primary.
          }
        };

        clearInterval(activeRidePollRef.current);
        activeRidePollRef.current = setInterval(pollActiveRide, 1500);
        pollActiveRide();
        setSearchStatus('Parcel booking created. Searching nearby drivers...');
      } catch (error) {
        const message = error?.message || 'Could not create parcel booking.';
        setBookingError(message);
        setSearchStatus(message);
      }
    })();

    return () => {
      clearInterval(activeRidePollRef.current);
      socketService.off('rideSearchUpdate', onRideSearchUpdate);
      socketService.off('rideAccepted', onRideAccepted);
      socketService.off('ride:state', onRideState);
      socketService.off('ride:status:updated', onRideStatusUpdated);
      socketService.off('rideCancelled', onRideCancelled);
      socketService.off('errorMessage', onError);
    };
  }, [navigate, otp, routeState]);

  const handleCancel = () => {
    clearInterval(activeRidePollRef.current);
    navigate('/');
  };

  const isSearching = stage === STAGES.SEARCHING;
  const isAssigned = stage === STAGES.ASSIGNED;
  const isAccepted = stage === STAGES.ACCEPTED;

  return (
    <div className="min-h-screen bg-gray-100 max-w-lg mx-auto relative font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 scale-110">
        <img src="/map image.avif" className="w-full h-full object-cover blur-[2px] opacity-70" alt="Map" />
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div key="pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative">
              {[1.5, 2].map((scaleValue, index) => (
                <motion.div key={index} animate={{ scale: [1, scaleValue, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 + index * 0.5, delay: index * 0.5 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-400/20 rounded-full" />
              ))}
              <div className="relative w-16 h-16 bg-white/95 rounded-full shadow-xl flex items-center justify-center border-4 border-orange-100">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
                  <Package size={28} className="text-orange-500" strokeWidth={2.5} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-4 right-16 z-20 bg-white/90 backdrop-blur-md rounded-[14px] px-4 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.22em] leading-none mb-0.5">Parcel Route</p>
        <p className="text-[12px] font-black text-slate-900 leading-tight truncate">{routeState.pickup || 'Pickup'} ? {routeState.drop || 'Drop'}</p>
      </div>
      {isSearching && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCancelConfirm(true)} className="absolute top-8 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] border border-white/80 flex items-center justify-center">
          <X size={16} className="text-slate-900" strokeWidth={2.5} />
        </motion.button>
      )}

      <div className="absolute bottom-8 left-4 right-4 z-20">
        <AnimatePresence mode="wait">
          {isSearching && (
            <motion.div key="searching" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="rounded-[20px] border border-white/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.14)] px-5 py-4 space-y-3">
              <div className="text-center space-y-0.5">
                <h1 className="text-[17px] font-black text-slate-900 tracking-tight">Finding a delivery agent...</h1>
                <p className="text-[11px] font-bold text-slate-400">{searchStatus}</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2, 3].map((index) => (
                  <motion.div key={index} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: index * 0.2 }} className="w-2 h-2 bg-orange-400 rounded-full" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-50">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Fast Delivery</span></div>
                <div className="w-px h-3 bg-slate-100" />
                <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-blue-500" strokeWidth={2.5} /><span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Secure Parcel</span></div>
              </div>
              {bookingError && <p className="text-center text-[11px] font-black text-red-500">{bookingError}</p>}
              <button onClick={() => setShowCancelConfirm(true)} className="w-full py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cancel My Search</button>
            </motion.div>
          )}

          {isAssigned && (
            <motion.div key="assigned" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <DriverCard driver={driver} bannerGradient="bg-gradient-to-r from-blue-500 to-blue-600" banner={<><CheckCircle2 size={16} className="text-white shrink-0" strokeWidth={2.5} /><div className="flex-1"><p className="text-white font-black text-[13px] leading-tight">Delivery Agent Found!</p><p className="text-blue-100 text-[10px] font-bold">Waiting for agent to accept request...</p></div></>}>
                <div className="flex gap-2">
                  <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
                  <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat', { state: { driver } })} />
                  <ActionBtn icon={Shield} label="Safety" onClick={() => navigate('/support')} />
                </div>
              </DriverCard>
            </motion.div>
          )}

          {isAccepted && (
            <motion.div key="accepted" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <DriverCard driver={driver} bannerGradient="bg-gradient-to-r from-orange-500 to-orange-400" banner={<><Navigation size={16} className="text-white shrink-0" strokeWidth={2.5} /><div><p className="text-white font-black text-[13px] leading-tight">Delivery Confirmed!</p><p className="text-orange-100 text-[10px] font-bold">Your agent will arrive shortly.</p></div></>}>
                <div className="flex gap-2">
                  <ActionBtn icon={Phone} label="Call" onClick={() => window.open(`tel:${driver.phone}`)} />
                  <ActionBtn icon={MessageCircle} label="Chat" onClick={() => navigate('/ride/chat', { state: { driver } })} />
                  <ActionBtn icon={Shield} label="Safety" onClick={() => navigate('/support')} />
                </div>
                <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[14px] border border-orange-100 bg-orange-50/60 px-3 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Share OTP on Pickup</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Used to verify parcel handover.</p>
                  </div>
                  <div className="flex gap-1">
                    {otp.split('').map((digit, index) => (
                      <div key={index} className="w-8 h-9 bg-white rounded-[8px] border-2 border-orange-200 flex items-center justify-center shadow-sm"><span className="text-[17px] font-black text-slate-900">{digit}</span></div>
                    ))}
                  </div>
                </motion.div>
              </DriverCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelConfirm(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] max-w-lg mx-auto" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 40 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-sm bg-white rounded-[28px] p-7 z-[101] shadow-2xl text-center">
              <div className="w-14 h-14 bg-red-50 rounded-[18px] flex items-center justify-center mx-auto mb-4"><AlertTriangle size={26} className="text-red-400" strokeWidth={2} /></div>
              <h3 className="text-[18px] font-black text-slate-900 mb-1.5">Cancel parcel booking?</h3>
              <p className="text-[13px] font-bold text-slate-400 mb-6 leading-relaxed">We're currently searching for an agent. Stop search?</p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCancel} className="w-full bg-slate-900 text-white py-3.5 rounded-[16px] text-[13px] font-black uppercase tracking-widest">Yes, Cancel</motion.button>
                <button onClick={() => setShowCancelConfirm(false)} className="w-full py-3.5 text-[13px] font-black text-slate-400 uppercase tracking-widest">Keep Searching</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParcelSearchingDriver;
