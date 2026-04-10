import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, X, Plus, Minus } from 'lucide-react';

const SelectLocation = () => {
  const [pickup, setPickup] = useState('Pipaliyahana, Indore');
  const [drop, setDrop] = useState('');
  const [stops, setStops] = useState([]);          // array of stop strings
  const [activeInput, setActiveInput] = useState('drop'); // 'pickup' | 'drop' | stopIdx
  const [mapToast, setMapToast] = useState(false);
  const navigate = useNavigate();

  // All known locations â€” filtered live as user types
  const allResults = [
    { title: 'Vijay Nagar', address: 'Vijay Nagar, Indore, Madhya Pradesh' },
    { title: 'Vijay Nagar Square', address: 'Vijay Nagar Square, Bhagyashree Colony, Indore' },
    { title: 'Vijayawada', address: 'Vijayawada, Andhra Pradesh, India' },
    { title: 'Vijay Nagar Police Station', address: 'Vijay Nagar Police Station, Sector D, Indore' },
    { title: 'Rajwada', address: 'Rajwada, Old Palasia, Indore, MP' },
    { title: 'Bhawarkua', address: 'Bhawarkua, Indore, Madhya Pradesh' },
    { title: 'MG Road', address: 'MG Road, Indore, Madhya Pradesh' },
    { title: 'Palasia Square', address: 'Palasia Square, AB Road, Indore' },
    { title: 'LIG Colony', address: 'LIG Colony, Indore, Madhya Pradesh' },
    { title: 'Scheme No 54', address: 'Scheme No 54, Vijay Nagar, Indore' },
    { title: 'Bhangadh', address: 'Bhangadh, Indore, Madhya Pradesh' },
    { title: 'AB Road', address: 'AB Road, Indore, Madhya Pradesh' },
    { title: 'Geeta Bhawan', address: 'Geeta Bhawan, Indore, Madhya Pradesh' },
    { title: 'Sapna Sangeeta', address: 'Sapna Sangeeta Road, Indore, MP' },
    { title: 'Mahalaxmi Nagar', address: 'Mahalaxmi Nagar, Indore, Madhya Pradesh' },
  ];

  const getQuery = () => {
    if (activeInput === 'pickup') return pickup;
    if (activeInput === 'drop') return drop;
    if (typeof activeInput === 'number') return stops[activeInput] || '';
    return '';
  };

  const query = getQuery();

  const searchResults = query.trim().length >= 1
    ? allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.address.toLowerCase().includes(query.toLowerCase())
      )
    : allResults.slice(0, 6);

  const showMapToast = () => {
    setMapToast(true);
    setTimeout(() => setMapToast(false), 2500);
  };

  // Add a new empty stop
  const addStop = () => {
    setStops(prev => [...prev, '']);
    setActiveInput(stops.length); // focus the new stop
  };

  // Remove a stop by index
  const removeStop = (idx) => {
    setStops(prev => prev.filter((_, i) => i !== idx));
    setActiveInput('drop');
  };

  // Update a stop value
  const updateStop = (idx, val) => {
    setStops(prev => prev.map((s, i) => i === idx ? val : s));
  };

  // When a suggestion is tapped
  const handleSelectResult = (title) => {
    if (activeInput === 'pickup') {
      setPickup(title);
      setActiveInput('drop');
    } else if (activeInput === 'drop') {
      navigate('/ride/select-vehicle', {
        state: {
          pickup: pickup || 'Pipaliyahana, Indore',
          drop: title,
          stops: stops.filter(s => s.trim().length > 0),
        },
      });
    } else if (typeof activeInput === 'number') {
      updateStop(activeInput, title);
      // Move to next stop or drop
      if (activeInput < stops.length - 1) {
        setActiveInput(activeInput + 1);
      } else {
        setActiveInput('drop');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F3F4F6_38%,#EEF2F7_100%)] max-w-lg mx-auto font-sans relative overflow-hidden pb-6">
      <div className="absolute -top-20 right-[-40px] h-48 w-48 rounded-full bg-orange-100/55 blur-3xl pointer-events-none" />
      <div className="absolute top-56 left-[-60px] h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-[-40px] h-44 w-44 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <AnimatePresence>
        {mapToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[12px] font-black shadow-2xl whitespace-nowrap border border-white/10"
          >
            🗺️ Map picker coming soon.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-md border-b border-white/70 shadow-[0_10px_20px_rgba(15,23,42,0.05)]">
          <div className="px-5 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-95 transition-all rounded-full">
              <ArrowLeft size={22} className="text-slate-900" strokeWidth={3} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Ride</p>
              <h1 className="mt-1 text-[18px] font-black text-slate-900 tracking-tight leading-none truncate">Where to?</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Input Card */}
      <div className="relative z-10 px-5 pt-4">
        <div className="bg-white/80 backdrop-blur-md rounded-[22px] p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] border border-white/80">
          <div className="space-y-3">

            {/* Pickup Row */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-700 bg-white/70 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                </div>
              </div>
              <div
                className={`flex-1 flex items-center bg-white/70 border border-white/80 rounded-xl px-3 py-2.5 transition-all ${activeInput === 'pickup' ? 'ring-2 ring-emerald-200' : ''}`}
                onClick={() => setActiveInput('pickup')}
              >
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  onFocus={() => setActiveInput('pickup')}
                  placeholder="Your pickup location"
                  className="w-full bg-transparent border-none text-[14px] font-bold text-slate-900 focus:outline-none placeholder:text-slate-300"
                />
                {pickup.length > 0 && (
                  <button onClick={() => setPickup('')} className="ml-2 shrink-0">
                    <X size={16} className="text-slate-300 hover:text-slate-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Dotted connector */}
            <div className="ml-[9px] h-2 w-[1.5px] border-l-[1.5px] border-dotted border-slate-300/70" />

            {/* Dynamic Stops */}
            <AnimatePresence>
              {stops.map((stop, idx) => (
                <motion.div
                  key={`stop-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-white/70 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                    </div>
                    <div
                      className={`flex-1 flex items-center bg-indigo-50/70 border border-indigo-100/70 rounded-xl px-3 py-2.5 transition-all ${activeInput === idx ? 'ring-2 ring-indigo-200' : ''}`}
                      onClick={() => setActiveInput(idx)}
                    >
                      <input
                        type="text"
                        value={stop}
                        autoFocus={activeInput === idx}
                        placeholder={`Stop ${idx + 1} location...`}
                        onFocus={() => setActiveInput(idx)}
                        onChange={(e) => updateStop(idx, e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] font-bold text-slate-900 focus:outline-none placeholder:text-indigo-300"
                      />
                      {stop.length > 0 && (
                        <button onClick={() => updateStop(idx, '')} className="ml-2 shrink-0">
                          <X size={16} className="text-indigo-300 hover:text-indigo-600 transition-colors" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeStop(idx)}
                      className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 active:scale-95 transition-all"
                    >
                      <Minus size={14} className="text-rose-500" strokeWidth={3} />
                    </button>
                  </div>
                  {/* Connector after each stop */}
                  <div className="ml-[9px] mt-3 h-2 w-[1.5px] border-l-[1.5px] border-dotted border-slate-300/70" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Drop Row */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-orange-600 bg-white/70 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                </div>
              </div>
              <div
                className={`flex-1 flex items-center bg-white/70 border border-white/80 rounded-xl px-3 py-2.5 transition-all ${activeInput === 'drop' ? 'ring-2 ring-orange-200' : ''}`}
                onClick={() => setActiveInput('drop')}
              >
                <input
                  type="text"
                  value={drop}
                  autoFocus={activeInput === 'drop'}
                  placeholder="Enter drop location..."
                  onFocus={() => setActiveInput('drop')}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] font-bold text-slate-900 focus:outline-none placeholder:text-slate-300"
                />
                {drop.length > 0 && (
                  <button onClick={() => setDrop('')} className="ml-2 shrink-0">
                    <X size={16} className="text-slate-300 hover:text-slate-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Action Pills */}
      <div className="relative z-10 flex gap-3 px-5 my-4">
        <button
          onClick={showMapToast}
          className="flex-1 flex items-center justify-center gap-2 bg-white/75 backdrop-blur-md border border-white/80 rounded-full py-2.5 shadow-[0_12px_26px_rgba(15,23,42,0.06)] active:scale-95 transition-all text-[12px] font-black text-slate-800"
        >
          <MapPin size={16} className="text-slate-900" />
          <span>Select on map</span>
        </button>
        <button
          onClick={addStop}
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 shadow-[0_12px_26px_rgba(15,23,42,0.06)] active:scale-95 transition-all text-[12px] font-black bg-white/75 backdrop-blur-md border border-white/80 text-slate-800"
        >
          <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center">
            <Plus size={12} className="text-white" strokeWidth={3} />
          </div>
          <span>Add stop {stops.length > 0 ? `(${stops.length})` : ''}</span>
        </button>
      </div>

      {/* Stop count chips */}
      {stops.length > 0 && (
        <div className="relative z-10 px-5 mb-2">
          <div className="flex gap-2 flex-wrap">
            {stops.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-white/75 backdrop-blur-md border border-white/80 rounded-full px-3 py-1 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-[11px] font-black text-slate-700 truncate max-w-[110px]">
                  {s.trim() || `Stop ${idx + 1}`}
                </span>
                <button onClick={() => removeStop(idx)}>
                  <X size={11} className="text-slate-400 hover:text-slate-700" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="relative z-10 px-5 mb-4">
        <h2 className="text-[16px] font-black text-slate-900 mb-2 ml-1 tracking-tight">
          {query.trim().length > 0 ? 'Search Results' : 'Popular Locations'}
        </h2>

        {searchResults.length > 0 ? (
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 overflow-hidden shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            {searchResults.map((result, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectResult(result.title)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/70 last:border-none hover:bg-white/60 transition-colors"
              >
                <div className="mt-0.5 w-10 h-10 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-center shrink-0 text-slate-500">
                  <MapPin size={18} strokeWidth={2.6} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-black text-slate-900 leading-tight">{result.title}</h4>
                  <p className="text-[12px] text-slate-500 font-bold mt-1 line-clamp-1">{result.address}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-3xl bg-white/80 border border-white/80 shadow-sm flex items-center justify-center mx-auto text-slate-400 text-[22px] font-black">
              —
            </div>
            <p className="mt-3 text-[14px] font-black text-slate-600">
              No results for <span className="text-slate-900">"{query}"</span>
            </p>
            <p className="text-[12px] font-bold text-slate-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectLocation;

