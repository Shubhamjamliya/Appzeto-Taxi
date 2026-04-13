import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Banknote,
  Bike,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Package,
  X,
} from 'lucide-react';

const Motion = motion;

const normalizePayment = (value = '') => String(value || 'cash').toUpperCase();

const IncomingRideRequest = ({ visible, onAccept, onDecline, requestData, isAccepting = false }) => {
  const [timer, setTimer] = useState(15);
  const slideX = useMotionValue(0);
  const slideFillWidth = useTransform(slideX, [0, 180], ['58px', '100%']);
  const data = requestData;

  useEffect(() => {
    let interval;
    let resetTimer;
    if (visible) {
      resetTimer = setTimeout(() => setTimer(15), 0);
      interval = setInterval(() => {
        setTimer((current) => {
          if (current <= 1) {
            onDecline();
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [visible, onDecline]);

  useEffect(() => {
    slideX.set(0);
  }, [slideX, visible, data?.rideId]);

  if (!visible || !data) return null;

  const isParcel = data.type === 'parcel';
  const title = isParcel ? 'Delivery Request' : 'Ride Request';
  const category = data.raw?.parcel?.category || data.raw?.parcel?.weight || (isParcel ? 'Parcel delivery' : 'Passenger ride');
  const payment = normalizePayment(data.payment);
  const timerProgress = Math.max(0, Math.min(100, (timer / 15) * 100));

  const handleSlideEnd = (_event, info) => {
    if (isAccepting) return;

    if (info.offset.x >= 120) {
      slideX.set(180);
      onAccept(data);
      return;
    }

    slideX.set(0);
  };

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/65 px-3 pb-4 pt-16 backdrop-blur-md"
      >
        <Motion.div
          initial={{ y: '105%', scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: '105%', scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative w-full max-w-[430px] overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)]"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-100">
            <Motion.div
              className="h-full rounded-r-full bg-slate-950"
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>

          <div className="px-6 pb-6 pt-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-[18px] shadow-sm ${isParcel ? 'bg-orange-50 text-orange-600' : 'bg-slate-950 text-white'}`}>
                  {isParcel ? <Package size={25} strokeWidth={2.6} /> : <Bike size={25} strokeWidth={2.6} />}
                </div>
                <div className="min-w-0">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${isParcel ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-700'}`}>
                    {title}
                  </div>
                  <h2 className="mt-2 text-[23px] font-black leading-none tracking-tight text-slate-950">Incoming Order</h2>
                  <p className="mt-1 line-clamp-1 text-[12px] font-bold text-slate-500">{category}</p>
                </div>
              </div>

              <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.25)]">
                <Clock size={14} className="mb-0.5 text-white/70" strokeWidth={2.6} />
                <span className="text-[20px] font-black leading-none">{timer}</span>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 shadow-inner">
              <div className="px-3 py-4 text-center">
                <Navigation size={16} className="mx-auto mb-1.5 text-slate-400" strokeWidth={2.6} />
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Distance</p>
                <p className="mt-1 text-[13px] font-black leading-tight text-slate-950">{data.distance}</p>
              </div>
              <div className="border-x border-slate-100 px-3 py-4 text-center">
                <Banknote size={16} className="mx-auto mb-1.5 text-slate-400" strokeWidth={2.6} />
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Earnings</p>
                <p className="mt-1 text-[18px] font-black leading-none text-slate-950">{data.fare}</p>
              </div>
              <div className="px-3 py-4 text-center">
                <CreditCard size={16} className="mx-auto mb-1.5 text-slate-400" strokeWidth={2.6} />
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Method</p>
                <p className="mt-1 text-[13px] font-black leading-tight text-emerald-600">{payment}</p>
              </div>
            </div>

            <div className="mb-5 rounded-[26px] border border-slate-100 bg-white px-4 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
              <div className="grid grid-cols-[20px_1fr] gap-x-3">
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-3 w-3 rounded-full border-[3px] border-slate-950 bg-white" />
                  <div className="my-2 h-10 w-px border-l border-dashed border-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-orange-500 ring-[3px] ring-orange-100" />
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <MapPin size={12} strokeWidth={2.8} />
                      Pickup Point
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] font-black leading-snug text-slate-950">{data.pickup}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <MapPin size={12} strokeWidth={2.8} />
                      Drop Point
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] font-black leading-snug text-slate-950">{data.drop}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDecline}
                disabled={isAccepting}
                className="flex h-[60px] w-[64px] shrink-0 items-center justify-center rounded-[20px] border border-slate-100 bg-white text-slate-400 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-colors hover:text-rose-500 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Decline request"
              >
                <X size={25} strokeWidth={2.6} />
              </button>

              <div className="relative h-[60px] flex-1 overflow-hidden rounded-[20px] bg-slate-950 shadow-[0_16px_34px_rgba(15,23,42,0.24)]">
                <Motion.div style={{ width: slideFillWidth }} className="absolute inset-y-0 left-0 rounded-[20px] bg-emerald-500" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-14 pr-4">
                  <span className="truncate text-[12px] font-black uppercase tracking-[0.18em] text-white/80">
                    {isAccepting ? 'Accepting...' : 'Slide to accept'}
                  </span>
                  <ArrowRight size={16} className="ml-2 shrink-0 text-white/70" strokeWidth={3} />
                </div>
                <Motion.div
                  drag={isAccepting ? false : 'x'}
                  dragConstraints={{ left: 0, right: 180 }}
                  dragElastic={0.02}
                  dragMomentum={false}
                  style={{ x: slideX }}
                  onDragEnd={handleSlideEnd}
                  className="absolute left-1.5 top-1.5 z-10 flex h-12 w-12 cursor-grab items-center justify-center rounded-[16px] bg-white text-slate-950 shadow-xl active:cursor-grabbing"
                >
                  <ChevronRight size={25} strokeWidth={3} />
                </Motion.div>
              </div>

              <Motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onAccept(data)}
                disabled={isAccepting}
                className="hidden h-[60px] shrink-0 items-center justify-center gap-2 rounded-[20px] bg-slate-950 px-5 text-[14px] font-black text-white shadow-[0_16px_34px_rgba(15,23,42,0.24)] disabled:opacity-70 sm:flex"
              >
                Accept <ArrowRight size={18} strokeWidth={2.8} />
              </Motion.button>
            </div>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

export default IncomingRideRequest;
