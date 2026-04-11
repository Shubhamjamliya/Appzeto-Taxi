import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation,
    MessageSquare,
    Phone,
    ShieldAlert,
    Check,
    Banknote,
    Wallet,
    QrCode,
    Scan,
    ChevronRight,
    Star,
    CheckCircle2,
    Package,
    User,
    ArrowUpRight,
    ArrowLeft,
    Clock3,
    MapPinned,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import { HAS_VALID_GOOGLE_MAPS_KEY, useAppGoogleMapsLoader } from '../../admin/utils/googleMaps';

const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
};

const DEFAULT_CENTER = { lat: 22.7196, lng: 75.8577 };
const DEFAULT_DRIVER_COORDS = [75.8577, 22.7196];

const mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eef2f7' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] },
];

const toLatLng = (coordinates, fallback = DEFAULT_CENTER) => {
    const [lng, lat] = coordinates || [];

    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
        return { lat: Number(lat), lng: Number(lng) };
    }

    return fallback;
};

const createOffsetPosition = (position, latOffset = -0.0045, lngOffset = -0.0035) => ({
    lat: Number(position?.lat ?? DEFAULT_CENTER.lat) + latOffset,
    lng: Number(position?.lng ?? DEFAULT_CENTER.lng) + lngOffset,
});

const arePositionsNearlyEqual = (first, second, threshold = 0.0002) => (
    Math.abs(Number(first?.lat ?? 0) - Number(second?.lat ?? 0)) < threshold &&
    Math.abs(Number(first?.lng ?? 0) - Number(second?.lng ?? 0)) < threshold
);

const formatAddressFromPoint = (point, fallback) => {
    const [lng, lat] = point?.coordinates || [];

    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
        return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    }

    return fallback;
};

const ActiveTrip = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tripType = location.state?.type || 'ride';
    const isParcel = tripType === 'parcel';
    const liveRequest = location.state?.request || {};
    const liveRaw = liveRequest.raw || {};

    const pickupCoords = liveRaw.pickupLocation?.coordinates || location.state?.pickupCoords || DEFAULT_DRIVER_COORDS;
    const dropCoords = liveRaw.dropLocation?.coordinates || location.state?.dropCoords || [75.8937, 22.7533];
    const assignedDriverCoords =
        liveRaw.driverLocation?.coordinates ||
        liveRequest.driverLocation?.coordinates ||
        location.state?.driverCoords ||
        location.state?.currentDriverCoords ||
        null;

    const pickupPosition = useMemo(() => toLatLng(pickupCoords), [pickupCoords]);
    const dropPosition = useMemo(() => toLatLng(dropCoords), [dropCoords]);
    const initialDriverPosition = useMemo(
        () => assignedDriverCoords ? toLatLng(assignedDriverCoords, pickupPosition) : createOffsetPosition(pickupPosition),
        [assignedDriverCoords, pickupPosition],
    );

    const [phase, setPhase] = useState('to_pickup');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [selectedRating, setSelectedRating] = useState(0);
    const [driverPaymentStatus, setDriverPaymentStatus] = useState('pending');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
    const [map, setMap] = useState(null);
    const [driverPosition, setDriverPosition] = useState(initialDriverPosition);
    const { isLoaded } = useAppGoogleMapsLoader();

    const activeDestination = phase === 'to_pickup' || phase === 'otp_verification' ? pickupPosition : dropPosition;
    const routePath = phase === 'to_pickup' || phase === 'otp_verification'
        ? [driverPosition, pickupPosition]
        : [driverPosition, dropPosition];

    const tripData = isParcel ? {
        sender: { name: 'Hritik Raghuwanshi', rating: '5.0', phone: '+91 96913 2XXXX' },
        receiver: { name: 'Vinay Kumar', phone: '+91 88712 1XXXX' },
        pickup: liveRequest?.pickup || formatAddressFromPoint(liveRaw.pickupLocation, 'Flat 402, Swamclose Apts, JP Nagar'),
        drop: liveRequest?.drop || formatAddressFromPoint(liveRaw.dropLocation, 'Tea Villa Cafe, 12th Main, HSR Layout'),
        fare: '₹120',
        payment: location.state?.paymentMethod || 'Online'
    } : {
        user: { name: 'Vinay Kumar', rating: '4.8', phone: '+91 98765 43210' },
        pickup: liveRequest?.pickup || formatAddressFromPoint(liveRaw.pickupLocation, 'Swamclose Apartments, JP Nagar'),
        drop: liveRequest?.drop || formatAddressFromPoint(liveRaw.dropLocation, 'Tea Villa Cafe, HSR Layout'),
        fare: '₹120',
        payment: liveRequest?.payment || location.state?.paymentMethod || 'Online'
    };

    const displayFare = liveRequest?.fare || tripData.fare;

    useEffect(() => {
        setDriverPosition(initialDriverPosition);
    }, [initialDriverPosition]);

    useEffect(() => {
        if (!map || !window.google?.maps) {
            return;
        }

        if (arePositionsNearlyEqual(driverPosition, activeDestination)) {
            map.setCenter(driverPosition);
            map.setZoom(15);
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(driverPosition);
        bounds.extend(activeDestination);
        map.fitBounds(bounds, 80);
    }, [activeDestination, driverPosition, map]);

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        if (nextOtp.join('').length === 4 && nextOtp.join('') === '1234') {
            setTimeout(() => {
                setPhase('in_trip');
                setDriverPosition(dropPosition);
            }, 500);
        }
    };

    const mapOptions = useMemo(() => ({
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: false,
        clickableIcons: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
    }), []);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans select-none overflow-hidden relative">
            <div className="absolute inset-0 z-0 h-[60vh] overflow-hidden">
                {HAS_VALID_GOOGLE_MAPS_KEY && isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        center={pickupPosition}
                        zoom={14}
                        onLoad={setMap}
                        onUnmount={() => setMap(null)}
                        options={mapOptions}
                    >
                        <PolylineF
                            path={routePath}
                            options={{
                                strokeColor: '#0f172a',
                                strokeOpacity: 0.9,
                                strokeWeight: 4,
                            }}
                        />
                        <MarkerF
                            position={driverPosition}
                            title="Driver"
                            icon={{
                                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                fillColor: '#f59e0b',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 6,
                            }}
                        />
                        <MarkerF
                            position={activeDestination}
                            title={phase === 'to_pickup' || phase === 'otp_verification' ? 'Pickup' : 'Drop'}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: phase === 'to_pickup' || phase === 'otp_verification' ? '#10b981' : '#ef4444',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 7,
                            }}
                        />
                    </GoogleMap>
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Map unavailable until Google Maps key is configured
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-transparent to-black/10 pointer-events-none" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-4 z-50 w-10 h-10 rounded-2xl bg-white/95 border border-white/80 shadow-lg flex items-center justify-center"
                >
                    <ArrowLeft size={18} className="text-slate-900" />
                </button>

                <div className="absolute top-8 left-16 right-4 z-50 flex items-center gap-3 bg-slate-900/92 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-xl ${isParcel ? 'bg-orange-500' : 'bg-white'}`}>
                        {isParcel ? <Package size={20} strokeWidth={2.5} /> : <Navigation size={20} fill="currentColor" strokeWidth={2.5} className="-rotate-45" />}
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                        <h4 className={`text-[9px] font-black uppercase tracking-widest leading-none flex items-center gap-2 ${phase === 'to_pickup' || phase === 'otp_verification' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {phase === 'to_pickup' || phase === 'otp_verification' ? 'Pickup' : 'Drop-off'}
                            <ArrowUpRight size={12} strokeWidth={3} />
                        </h4>
                        <p className="text-[13px] font-black text-white leading-tight truncate uppercase">
                            {phase === 'to_pickup' || phase === 'otp_verification' ? tripData.pickup : tripData.drop}
                        </p>
                    </div>
                </div>

                <div className="absolute top-28 left-4 z-40 flex gap-2">
                    <div className="rounded-2xl bg-white/92 border border-white/80 shadow-lg px-3 py-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">Trip Stage</p>
                        <p className="text-[11px] font-black text-slate-900 mt-1">
                            {phase === 'to_pickup' ? 'Heading To Pickup' : phase === 'otp_verification' ? 'Verify OTP' : phase === 'in_trip' ? 'On Trip' : phase === 'payment_confirm' ? 'Collect Payment' : 'Complete'}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/92 border border-white/80 shadow-lg px-3 py-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">ETA</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Clock3 size={12} className="text-orange-500" />
                            <p className="text-[11px] font-black text-slate-900">{phase === 'to_pickup' ? '2 mins' : '12 mins'}</p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-28 right-4 z-40 rounded-2xl bg-white/92 border border-white/80 shadow-lg px-3 py-2 min-w-[116px]">
                    <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">Route</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <MapPinned size={12} className="text-slate-500" />
                        <p className="text-[11px] font-black text-slate-900">{phase === 'to_pickup' ? 'Pickup First' : 'To Destination'}</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-40">
                <AnimatePresence mode="wait">
                    {phase === 'to_pickup' && (
                        <motion.div
                            key="to_pickup"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-5 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                                        {isParcel ? <Package size={22} className="text-slate-900" /> : <User size={22} className="text-slate-400" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[15px] font-black text-slate-900 tracking-tight uppercase">
                                            {isParcel ? tripData.sender.name : tripData.user.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <Star size={10} fill="#f0c419" className="text-yellow-500" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {isParcel ? tripData.sender.rating : tripData.user.rating} • 1.2 KM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-transform"><MessageSquare size={18} strokeWidth={2.5} /></button>
                                    <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500 active:scale-95 transition-transform"><Phone size={18} strokeWidth={2.5} /></button>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPhase('otp_verification')}
                                className="w-full h-15 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20"
                            >
                                {isParcel ? 'Arrived at Sender' : 'I Have Arrived'} <CheckCircle2 size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === 'otp_verification' && (
                        <motion.div
                            key="otp_verification"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Security Pin</h3>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-2">
                                    Ask <span className="text-slate-900">{isParcel ? 'Sender' : 'Passenger'}</span> for Start PIN
                                </p>
                            </div>
                            <div className="flex justify-center gap-3 mb-8">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        className="w-12 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl font-black text-slate-900 focus:outline-none focus:border-slate-900 transition-all shadow-inner"
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPhase('to_pickup')} className="flex-1 h-13 border-2 border-slate-100 text-slate-400 rounded-xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Go Back</button>
                                <button className="flex-1 h-13 bg-slate-100 text-slate-900 rounded-xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">Support</button>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'in_trip' && (
                        <motion.div
                            key="in_trip"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-5 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-0.5 flex-1 pr-4">
                                    <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none mb-1">Destination</h4>
                                    <p className="text-[16px] font-black text-slate-900 tracking-tight uppercase truncate">{tripData.drop}</p>
                                </div>
                                <button className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ShieldAlert size={22} strokeWidth={2.5} /></button>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 mb-6 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                        {isParcel ? <Package size={18} className="text-white" /> : <User size={18} className="text-white opacity-40" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-black text-slate-900 leading-none uppercase">{isParcel ? tripData.receiver.name : tripData.user.name}</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isParcel ? 'Receiver' : 'Passenger'}</p>
                                    </div>
                                </div>
                                <button className="w-9 h-9 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-emerald-500"><Phone size={16} strokeWidth={2.5} /></button>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setPhase('payment_confirm')}
                                className="w-full h-15 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl"
                            >
                                {isParcel ? 'Deliver Parcel' : 'Arrived at Destination'} <ChevronRight size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === 'payment_confirm' && (
                        <motion.div
                            key="payment_confirm"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg transition-all duration-500 ${driverPaymentStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                                    {driverPaymentStatus === 'success' ? <Check size={32} strokeWidth={4} /> : <QrCode size={32} strokeWidth={2} />}
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase">
                                    {driverPaymentStatus === 'success' ? 'Payment Success!' : 'Collect Amount'}
                                </h2>
                                <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Fare: <span className="text-slate-900 font-black text-lg ml-1">{displayFare}</span>
                                </p>
                            </div>
                            {driverPaymentStatus === 'pending' && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { id: 'cash', label: 'Cash', icon: Banknote },
                                        { id: 'online', label: 'Online', icon: Scan },
                                        { id: 'wallet', label: 'Wallet', icon: Wallet }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => {
                                                setSelectedPaymentMode(mode.id);
                                                setDriverPaymentStatus(mode.id === 'online' ? 'qr_generated' : 'success');
                                            }}
                                            className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${selectedPaymentMode === mode.id ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-slate-50/50'}`}
                                        >
                                            <mode.icon size={22} className={selectedPaymentMode === mode.id ? 'text-slate-900' : 'text-slate-400'} strokeWidth={2.5} />
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mt-2">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {driverPaymentStatus === 'qr_generated' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 rounded-3xl p-6 mb-6 text-center shadow-2xl">
                                    <div className="bg-white p-4 rounded-2xl inline-block mb-3 relative overflow-hidden">
                                        <QrCode size={90} className="text-slate-900 opacity-90" />
                                        <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute left-0 w-full h-0.5 bg-slate-200" />
                                    </div>
                                    <p className="text-white font-black text-sm uppercase tracking-widest mb-4">Scan Code - {displayFare}</p>
                                    <button onClick={() => setDriverPaymentStatus('success')} className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">Confirm Received</button>
                                </motion.div>
                            )}
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                disabled={driverPaymentStatus !== 'success'}
                                onClick={() => setPhase('review')}
                                className={`w-full h-15 rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl transition-all ${driverPaymentStatus === 'success' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                            >
                                {driverPaymentStatus === 'success' ? 'Finalize Earnings' : 'Waiting...'} <ChevronRight size={18} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}

                    {phase === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-slate-50 text-center"
                        >
                            <div className="mb-8 space-y-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-lg"><User size={24} className="text-white" /></div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rate Experience</h3>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <Star
                                            key={score}
                                            size={28}
                                            onClick={() => setSelectedRating(score)}
                                            className={`transition-all ${score <= selectedRating ? 'text-yellow-500' : 'text-slate-100'}`}
                                            fill={score <= selectedRating ? 'currentColor' : 'transparent'}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => navigate('/taxi/driver/home')} className="w-full h-15 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Done <Check size={20} strokeWidth={4} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ActiveTrip;
