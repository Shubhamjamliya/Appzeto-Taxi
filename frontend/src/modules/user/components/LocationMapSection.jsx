import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STORAGE_KEY = 'rydon24:lastLocation';
const DEFAULT_CENTER = { lat: 17.385, lon: 78.4867 };
const DEFAULT_ZOOM = 16;

const PIN_ICON_URL = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
      <path d="M12 22s8-4.5 8-12a8 8 0 10-16 0c0 7.5 8 12 8 12z" fill="#10b981" stroke="#065f46" stroke-width="1"/>
      <circle cx="12" cy="10" r="3.25" fill="#ffffff" opacity="0.95"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

const PIN_ICON = L.icon({
  iconUrl: PIN_ICON_URL,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const LocationMapSection = () => {
  const [coords, setCoords] = useState(null);
  const [centerCoords, setCenterCoords] = useState(DEFAULT_CENTER);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | denied | error
  const [isDragging, setIsDragging] = useState(false);

  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const pinnedLayerRef = useRef(null);
  const rafRef = useRef(0);

  const persistCoords = (next) => {
    setCoords(next);
    setCenterCoords(next);
    setStatus('ready');
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
        const next = { lat: parsed.lat, lon: parsed.lon };
        persistCoords(next);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      tap: false,
    }).setView([centerCoords.lat, centerCoords.lon], DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.whenReady(() => {
      map.invalidateSize();
    });

    const updateCenter = () => {
      const center = map.getCenter();
      setCenterCoords({ lat: center.lat, lon: center.lng });
    };

    const onMove = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        updateCenter();
      });
    };

    map.on('move', onMove);
    map.on('moveend', updateCenter);
    map.on('dragstart', () => setIsDragging(true));
    map.on('dragend', () => {
      setIsDragging(false);
      const center = map.getCenter();
      persistCoords({ lat: center.lat, lon: center.lng });
    });

    updateCenter();
    mapRef.current = map;

    return () => {
      map.off('move', onMove);
      if (pinnedLayerRef.current) {
        pinnedLayerRef.current.remove();
        pinnedLayerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapElRef]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (coords) {
      mapRef.current.setView([coords.lat, coords.lon], mapRef.current.getZoom(), { animate: true });
      if (!pinnedLayerRef.current) {
        pinnedLayerRef.current = L.marker([coords.lat, coords.lon], {
          icon: PIN_ICON,
          interactive: false,
          keyboard: false,
        }).addTo(mapRef.current);
        pinnedLayerRef.current.setZIndexOffset?.(500);
      } else {
        pinnedLayerRef.current.setLatLng([coords.lat, coords.lon]);
      }
    } else if (pinnedLayerRef.current) {
      pinnedLayerRef.current.remove();
      pinnedLayerRef.current = null;
    }
  }, [coords]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        persistCoords(next);
        if (mapRef.current) {
          mapRef.current.setView([next.lat, next.lon], DEFAULT_ZOOM, { animate: true });
        }
      },
      (error) => {
        if (error?.code === 1) {
          setStatus('denied');
          return;
        }
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  const helperText = (() => {
    if (status === 'loading') return 'Pinning your current location...';
    if (status === 'denied') return 'Location permission denied. Tap to try again.';
    if (status === 'error') return 'Unable to fetch location. Tap to retry.';
    if (isDragging) return 'Move the map to set the pin.';
    if (status === 'ready') return 'Drag the map to fine-tune. Tap Update to refresh GPS.';
    return 'Pin your current location, then adjust by dragging.';
  })();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="px-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Map</p>
          <h3 className="mt-1 flex items-baseline gap-1 text-[16px] font-black tracking-tight text-slate-900">
            <span>Pin your location</span>
            <span className="inline-flex" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="inline-block"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{
                    duration: 1.05,
                    delay: dot * 0.18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  .
                </motion.span>
              ))}
            </span>
          </h3>
          <p className="mt-0.5 text-[11px] font-bold text-slate-500">{helperText}</p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={requestLocation}
          className={`inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-black text-slate-700 shadow-[0_10px_18px_rgba(15,23,42,0.05)] ${
            coords ? 'mt-[30px]' : ''
          }`}
        >
          <Navigation size={14} strokeWidth={2.5} className={status === 'loading' ? 'animate-pulse' : ''} />
          {coords && (
            <motion.span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-500"
              animate={{
                opacity: [0.25, 1, 0.25],
                scale: [0.9, 1.08, 0.9],
                boxShadow: [
                  '0 0 0 0 rgba(16,185,129,0)',
                  '0 0 0 4px rgba(16,185,129,0.12)',
                  '0 0 0 0 rgba(16,185,129,0)',
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span>{coords ? 'Update' : 'Pin'}</span>
        </motion.button>
      </div>

      <div className="relative mt-3 rounded-[20px] bg-[linear-gradient(135deg,rgba(16,185,129,0.40)_0%,rgba(56,189,248,0.22)_50%,rgba(251,146,60,0.16)_100%)] p-[1px] shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_10px_22px_rgba(15,23,42,0.06)]">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[20px] blur-xl"
          animate={{ opacity: [0.14, 0.26, 0.14] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(56,189,248,0.14) 52%, rgba(251,146,60,0.10) 100%)',
          }}
        />

        <div className="relative z-10 overflow-hidden rounded-[19px] border border-white/70 bg-white/85">
          <div className="relative h-[170px] w-full">
            <div ref={mapElRef} className="h-full w-full pointer-events-auto" />

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              animate={{
                y: isDragging ? -6 : -10,
                scale: isDragging ? 1.04 : 1,
              }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="relative">
                <motion.div
                  className="absolute left-1/2 top-[38px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-900/20 blur-[2px]"
                  animate={{ scale: isDragging ? 1.15 : 0.95, opacity: isDragging ? 0.5 : 0.35 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 shadow-[0_10px_22px_rgba(15,23,42,0.18)]">
                  <MapPin size={18} strokeWidth={2.6} className="text-emerald-600" />
                </div>
              </div>
            </motion.div>

            {!coords && status !== 'loading' && (
              <button
                type="button"
                onClick={requestLocation}
                className="absolute bottom-2 left-2 z-20 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm active:scale-[0.99]"
              >
                Use my location
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] font-bold text-slate-400">
        {centerCoords.lat.toFixed(5)}, {centerCoords.lon.toFixed(5)} · © OpenStreetMap contributors
      </p>
    </motion.section>
  );
};

export default LocationMapSection;
