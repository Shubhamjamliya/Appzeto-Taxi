import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ChevronRight } from 'lucide-react';

const VEHICLES = [
  { id: 'mini', name: 'Mini Cab', icon: '🚕', seats: 4, desc: 'Swift, Alto, WagonR', pricePerKm: 12, baseFare: 499 },
  { id: 'sedan', name: 'Sedan', icon: '🚗', seats: 4, desc: 'Dzire, Amaze, Aspire', pricePerKm: 15, baseFare: 699 },
  { id: 'suv', name: 'SUV', icon: '🚙', seats: 6, desc: 'Ertiga, Innova, Crysta', pricePerKm: 20, baseFare: 999 },
];

const IntercityVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fromCity, toCity, tripType, date, distance } = location.state || {};

  const [passengers, setPassengers] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState('mini');

  if (!fromCity || !toCity) {
    navigate('/intercity');
    return null;
  }

  const vehicle = VEHICLES.find(v => v.id === selectedVehicle);
  const estimatedFare = vehicle ? Math.round(vehicle.baseFare + (vehicle.pricePerKm * distance)) : 0;
  const roundTripFare = Math.round(estimatedFare * 1.8);
  const finalFare = tripType === 'Round Trip' ? roundTripFare : estimatedFare;

  return (
    <div className="min-h-screen bg-[#F8F9FB] max-w-lg mx-auto font-sans pb-32">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-6 sticky top-0 z-20 shadow-sm border-b border-gray-50 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
          <ArrowLeft size={24} className="text-gray-900" strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-[22px] font-black text-gray-900 leading-none tracking-tight">Vehicle & Passengers</h1>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{fromCity} to {toCity}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Passengers */}
        <div className="bg-white rounded-[24px] p-5 border border-gray-50 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                <Users size={18} className="text-gray-500" strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[14px] font-black text-gray-900 leading-tight">Total Passengers</p>
                <p className="text-[11px] font-bold text-gray-400">Max {vehicle.seats} for {vehicle.name}</p>
             </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
            <button
              onClick={() => setPassengers(p => Math.max(1, p - 1))}
              className="w-8 h-8 bg-white rounded-full text-gray-600 font-black flex items-center justify-center active:scale-90 transition-all shadow-sm"
            >−</button>
            <span className="text-[16px] font-black text-gray-900 w-5 text-center">{passengers}</span>
            <button
              onClick={() => setPassengers(p => Math.min(vehicle.seats, p + 1))}
              className="w-8 h-8 bg-white rounded-full text-gray-600 font-black flex items-center justify-center active:scale-90 transition-all shadow-sm"
            >+</button>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-3">
          <h3 className="text-[16px] font-black text-gray-900 ml-1">Available Vehicles</h3>
          {VEHICLES.map(v => (
            <motion.button
              key={v.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedVehicle(v.id); if(passengers > v.seats) setPassengers(v.seats); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selectedVehicle === v.id
                  ? 'border-yellow-400 bg-yellow-50/30 shadow-md shadow-yellow-100/30'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <span className="text-3xl">{v.icon}</span>
              <div className="flex-1">
                <h4 className="text-[15px] font-black text-gray-900 leading-none">{v.name}</h4>
                <p className="text-[12px] font-bold text-gray-400 mt-0.5">{v.desc} · {v.seats} seats</p>
              </div>
              <div className="text-right">
                <p className={`text-[16px] font-black ${selectedVehicle === v.id ? 'text-yellow-600' : 'text-gray-900'}`}>
                   ₹{(tripType === 'Round Trip' ? Math.round((v.baseFare + v.pricePerKm * distance) * 1.8) : Math.round(v.baseFare + v.pricePerKm * distance)).toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{tripType}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fare Summary + Book CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-5 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB]/95 to-transparent z-30">
        <div className="bg-[#1C2833] rounded-[32px] p-6 text-white space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
             <div>
                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Estimated Fare</p>
                <p className="text-[28px] font-black tracking-tight mt-1 text-yellow-400">₹{finalFare.toLocaleString()}</p>
             </div>
             <div className="text-right">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Base Distance</p>
                <p className="text-[15px] font-black">{distance} km</p>
             </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/intercity/details', { 
              state: { fromCity, toCity, tripType, date, distance, vehicle, passengers, fare: finalFare } 
            })}
            className="w-full bg-yellow-400 text-[#1C2833] py-4 rounded-2xl text-[16px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            Enter Exact Details <ChevronRight size={18} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default IntercityVehicle;
