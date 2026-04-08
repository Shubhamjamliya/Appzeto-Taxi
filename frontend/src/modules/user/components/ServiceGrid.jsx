import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ServiceTile = ({ icon, label, description, path, accentClass }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => path && navigate(path)}
      className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border border-white/80 bg-white/90 px-1.5 py-2.5 shadow-[0_8px_14px_rgba(15,23,42,0.05)] transition-transform"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${accentClass}`}>
        <img src={icon} alt={label} className="h-10 w-10 object-contain drop-shadow-sm" />
      </div>

      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="min-h-[24px] text-[10.5px] font-black leading-tight tracking-tight text-slate-900">{label}</span>
        <span className="sr-only">{description}</span>
      </div>
    </motion.button>
  );
};

const ServiceGrid = () => {
  const services = [
    {
      icon: '/1_Bike.png',
      label: 'Bike Taxi',
      description: 'Quick rides for daily travel.',
      path: '/ride/select-location',
      accentClass: 'bg-[linear-gradient(135deg,#FFF7ED_0%,#FFE5C2_100%)]',
    },
    {
      icon: '/5_Parcel.png',
      label: 'Parcel Delivery',
      description: 'Send packages across the city.',
      path: '/parcel/type',
      accentClass: 'bg-[linear-gradient(135deg,#FEFCE8_0%,#FDE68A_100%)]',
    },
    {
      icon: '/rental_service_icon.png',
      label: 'Bike Rental',
      description: 'Flexible hourly ride options.',
      path: '/rental',
      accentClass: 'bg-[linear-gradient(135deg,#EFF6FF_0%,#DBEAFE_100%)]',
    },
    {
      icon: '/4_Taxi.png',
      label: 'Auto & Cab',
      description: 'Comfort rides for every trip.',
      path: '/cab',
      accentClass: 'bg-[linear-gradient(135deg,#F5F3FF_0%,#E9D5FF_100%)]',
    },
  ];

  const optionLabel = services.length === 1 ? 'option' : 'options';

  return (
    <div className="px-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="py-1"
      >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Services</p>
          <h2 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">Choose your ride</h2>
          <p className="mt-0.5 text-[11px] font-bold text-slate-500">Tap to start quickly.</p>
        </div>

          <div className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm">
            {services.length} {optionLabel}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {services.map((service) => (
          <ServiceTile key={service.label} {...service} />
        ))}
      </div>
    </motion.section>
    </div>
  );
};

export default ServiceGrid;
