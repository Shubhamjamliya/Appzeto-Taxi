import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    Navigation, 
    Wallet, 
    Clock, 
    Bike, 
    Power, 
    Target, 
    Layers, 
    Zap,
    IndianRupee, 
    TrendingUp, 
    Star, 
    ChevronRight,
    MapPin,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

import RedigoLogo from '@/assets/redigologo.png';
import { IndianRupee, TrendingUp, Star, ChevronRight } from 'lucide-react';
import MapGrid from '@/assets/premium_grid_map.png';
import Rydon24Logo from '@/assets/rydon24_logo.png';
import DriverBottomNav from '../../shared/components/DriverBottomNav';
import IncomingRideRequest from './IncomingRideRequest';

// Vehicle Icons for Map
import BikeIcon from '@/assets/icons/bike.png';
import CarIcon from '@/assets/icons/car.png';

import { socketService } from '../../../shared/api/socket';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 22.7196,
    lng: 75.8577 
};

const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

const DriverHome = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [showRequest, setShowRequest] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);
    const [completedRides, setCompletedRides] = useState(0);
    const [dutySeconds, setDutySeconds] = useState(0);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "" 
    });

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const mapOptions = useMemo(() => ({
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: false,
        clickableIcons: false
    }), []);

    // Dummy Request Logic on Online
    useEffect(() => {
        let dummyTimer;
        if (isOnline && !showRequest) {
            dummyTimer = setTimeout(() => {
                setCurrentRequest({
                    type: 'ride',
                    title: 'Bike Taxi',
                    fare: '₹145',
                    payment: 'Cash',
                    pickup: 'Crystal IT Park, Indore',
                    drop: 'Vijay Nagar Square',
                    distance: '1.2 km away',
                    requestId: 'dummy_123'
                });
                setShowRequest(true);
            }, 3000);
        }
        return () => clearTimeout(dummyTimer);
    }, [isOnline, showRequest]);

    // Socket Integration
    useEffect(() => {
        if (isOnline) {
            socketService.connect();
            
            socketService.on('new_request', (data) => {
                setCurrentRequest({
                    type: data.type || 'ride',
                    title: data.type === 'parcel' ? 'Parcel Delivery' : 'Bike Taxi',
                    fare: `₹${data.amount || 0}`,
                    payment: data.payment_type || 'Online',
                    pickup: data.pickup_address || 'Pickup Location',
                    drop: data.drop_address || 'Drop Location',
                    distance: `${data.distance || 0} km away`,
                    requestId: data._id
                });
                setShowRequest(true);
            });

            socketService.on('request_accepted_elsewhere', () => setShowRequest(false));

            const locationInterval = setInterval(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        socketService.emit('update_location', {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    });
                }
            }, 10000);

            return () => {
                socketService.off('new_request');
                socketService.off('request_accepted_elsewhere');
                clearInterval(locationInterval);
            };
        } else {
            socketService.disconnect();
        }
    }, [isOnline]);
    
    useEffect(() => {
        let interval;
        if (isOnline) {
            interval = setInterval(() => setDutySeconds(s => s + 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isOnline]);

    const dutyHours = Math.floor(dutySeconds / 3600);
    const dutyMins = Math.floor((dutySeconds % 3600) / 60);

    const handleAccept = () => {
        setShowRequest(false);
        setCompletedRides(prev => prev + 1);
        navigate('/taxi/driver/active-trip', { state: { type: currentRequest?.type || 'ride' } });
    };

    const path = [
        { lat: 22.7210, lng: 75.8570 },
        { lat: 22.7300, lng: 75.8650 },
        { lat: 22.7400, lng: 75.8800 }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans select-none overflow-hidden relative pb-20 text-slate-900">
            <IncomingRideRequest 
                visible={showRequest} 
                requestData={currentRequest}
                onAccept={handleAccept} 
                onDecline={() => setShowRequest(false)} 
            />

            <header className="fixed top-0 left-0 right-0 px-5 pt-5 pb-4 flex items-center justify-between z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-soft">
                <div className="flex items-center gap-3">
                    <img src={RedigoLogo} alt="Redigo" className="h-4 object-contain" />
                    <div className="h-3 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isOnline ? 'Active' : 'Offline'}
            {/* Header: Compact Version */}
            <header className="fixed top-0 left-0 right-0 px-6 pt-6 pb-2.5 flex items-center justify-between z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-md">
                <div className="flex items-center gap-3 pt-2">
                    <img src={Rydon24Logo} alt="Rydon24" className="h-7 drop-shadow-sm" />
                    <div className="h-5 w-px bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/taxi/driver/notifications')} className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center text-slate-600 relative active:scale-95 transition-all">
                        <Bell size={16} strokeWidth={2.5} /><span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </button>
                    <div onClick={() => navigate('/taxi/driver/profile')} className="w-9 h-9 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner cursor-pointer active:scale-95 transition-all overflow-hidden">
                         <User size={20} className="text-slate-300" />
                    </div>
                </div>
            </header>

            <div className="absolute inset-0 z-0 h-full bg-[#E5E7EB] overflow-hidden">
                {isLoaded ? (
                    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} onLoad={onLoad} onUnmount={onUnmount} options={mapOptions}>
                        <Marker position={center} icon={{ url: isOnline ? BikeIcon : CarIcon, scaledSize: new window.google.maps.Size(40, 40), anchor: new window.google.maps.Point(20, 20)}} />
                        {isOnline && <Polyline path={path} options={{ strokeColor: '#000000', strokeOpacity: 0.8, strokeWeight: 4 }} />}
                    </GoogleMap>
                ) : <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-black uppercase text-[10px] tracking-widest">Loading Map...</div>}
                <div className="absolute right-5 top-28 flex flex-col gap-2 z-20">
                    <button className="w-9 h-9 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-800 border border-slate-50 active:scale-90 transition-all"><Target size={16} /></button>
                    <button className="w-9 h-9 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-800 border border-slate-50 active:scale-90 transition-all"><Layers size={16} /></button>
                </div>
            </div>

            <div className="absolute bottom-[5.5rem] left-0 right-0 px-4 z-30">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] p-4 shadow-premium border border-slate-50">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                             <div className="flex items-center gap-1 opacity-60"><IndianRupee size={10} className="text-emerald-500" /><span className="text-[8px] font-black uppercase tracking-wider">Earnings</span></div>
                             <p className="text-xl font-black text-slate-900 tracking-tight leading-none">₹0.00</p>
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                             <div className="flex items-center gap-1 opacity-60"><Clock size={10} className="text-blue-500" /><span className="text-[8px] font-black uppercase tracking-wider">Duty</span></div>
                             <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{dutyHours}h {dutyMins}m</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2 mb-4">
                         <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500"><Bike size={14} /></div>
                             <div className="leading-tight"><h5 className="text-[11px] font-black text-slate-800 leading-none">{completedRides} Trips</h5><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Today</p></div>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><Star size={14} /></div>
                             <div className="leading-tight text-right"><h5 className="text-[11px] font-black text-slate-800 leading-none">4.95</h5><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rating</p></div>
                         </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => setIsOnline(!isOnline)} className={`w-full h-13 rounded-xl flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest transition-all shadow-lg relative ${isOnline ? 'bg-rose-600 text-white shadow-rose-600/10' : 'bg-slate-900 text-white shadow-slate-900/10'}`}>
                         <Power size={16} strokeWidth={3} className={isOnline ? 'animate-pulse' : ''} />{isOnline ? 'End Your Duty' : 'Go Online'}
                    </motion.button>
                </motion.div>
            </div>

            <DriverBottomNav />
        </div>
    );
};

export default DriverHome;
