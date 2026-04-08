import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BatteryCharging, CircleAlert, MessageCircle, Phone, ShieldCheck, Truck, Wrench } from 'lucide-react';

const helpItems = [
  {
    title: 'Flat Tyre',
    description: 'Puncture help and tyre replacement coordination.',
    icon: CircleAlert,
    tone: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    title: 'Battery Jumpstart',
    description: 'Quick support when the vehicle will not start.',
    icon: BatteryCharging,
    tone: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'Minor Repair',
    description: 'Chains, brakes, cables, and roadside fixes.',
    icon: Wrench,
    tone: 'bg-green-50 text-green-600 border-green-100',
  },
  {
    title: 'Towing',
    description: 'Safe towing to the nearest workshop partner.',
    icon: Truck,
    tone: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

const WorkshopRSA = () => {
  const navigate = useNavigate();

  const handleCall = () => {
    window.open('tel:+919876543210', '_self');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi Rydon24, I need Workshop / RSA support.');
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] max-w-lg mx-auto font-sans pb-10">
      <header className="bg-white px-5 pt-8 pb-5 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
            <ArrowLeft size={24} className="text-gray-900" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Workshop & RSA</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
              Roadside help on demand
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pt-5 space-y-5">
        <section className="rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-[0_18px_45px_rgba(15,31,24,0.06)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                24/7 Support
              </span>
              <h2 className="mt-4 text-[23px] leading-tight font-black tracking-tight text-gray-900">
                Workshop visits, towing, and emergency roadside assistance.
              </h2>
              <p className="mt-2 text-[13px] font-bold leading-relaxed text-gray-500">
                Reach Rydon24 support and get connected to the nearest available workshop partner.
              </p>
            </div>
            <div className="w-[110px] rounded-[28px] bg-white/90 p-3 shadow-inner">
              <img
                src="/white_sedan_banner_car.png"
                alt="Workshop support"
                className="h-[108px] w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="ml-1 text-[16px] font-black tracking-tight text-gray-900">Popular Help</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {helpItems.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className={`inline-flex rounded-2xl border p-3 ${item.tone}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="mt-4 text-[15px] font-black tracking-tight text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-[12px] font-bold leading-relaxed text-gray-500">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-black tracking-tight text-gray-900">Why use Rydon24 RSA?</h2>
              <p className="mt-1 text-[12px] font-bold leading-relaxed text-gray-500">
                Verified local partners, faster coordination, and direct support over call or WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCall}
            className="rounded-[26px] bg-[#1C2833] px-4 py-4 text-white shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-center justify-center gap-2">
              <Phone size={18} strokeWidth={2.5} />
              <span className="text-[13px] font-black uppercase tracking-[0.14em]">Call</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsApp}
            className="rounded-[26px] bg-emerald-500 px-4 py-4 text-white shadow-xl shadow-emerald-500/20"
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle size={18} strokeWidth={2.5} />
              <span className="text-[13px] font-black uppercase tracking-[0.14em]">WhatsApp</span>
            </div>
          </motion.button>
        </section>
      </div>
    </div>
  );
};

export default WorkshopRSA;
