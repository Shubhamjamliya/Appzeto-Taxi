import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, Briefcase, CheckCircle2, AlertCircle, Edit3, Trash2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VehicleFleet = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([
        { id: 1, model: 'Maruti Suzuki WagonR', plate: 'MP 09 AB 1234', color: 'Silky Silver', status: 'Active', category: 'Mini' },
        { id: 2, model: 'Hyundai Santro', plate: 'MP 09 XY 5678', color: 'Star Dust', status: 'Inactive', category: 'Mini' }
    ]);
    const [showAdd, setShowAdd] = useState(false);

    const deleteVehicle = (id) => {
        setVehicles(v => v.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 pb-32 overflow-x-hidden">
            <header className="flex items-center gap-4 mb-8 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight tracking-tighter uppercase">My Fleet</h1>
            </header>

            <main className="space-y-6">
                <div className="bg-gradient-to-br from-[#1a1c24] to-[#3a3d4d] p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-30%] right-[-10%] w-48 h-48 bg-taxi-primary/10 rounded-full blur-3xl shadow-taxi-primary/10" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-black uppercase tracking-widest text-taxi-primary/60">Primary Vehicle</h3>
                                <p className="text-[20px] font-black tracking-tight leading-none">{vehicles[0]?.model || '--'}</p>
                                <p className="text-[14px] font-black tracking-[0.2em] opacity-40">{vehicles[0]?.plate || '--'}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-taxi-primary border border-white/10 shadow-lg">
                                <Car size={28} />
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-xl flex items-center gap-2">
                             <CheckCircle2 size={16} strokeWidth={3} />
                             <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">Active & Ready</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Registered Fleet</h3>
                          <button onClick={() => navigate('/taxi/driver/add-vehicle')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-black">+ Add New Fleet</button>
                     </div>

                     <div className="space-y-3">
                         {vehicles.map((v) => (
                             <div key={v.id} className="bg-white p-5 rounded-2xl border border-white shadow-sm flex items-center justify-between group active:scale-98 transition-all">
                                 <div className="flex items-center gap-4">
                                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-slate-50 transition-colors ${v.status === 'Active' ? 'bg-emerald-50 text-emerald-500 shadow-sm border-emerald-500/5' : 'bg-slate-50 text-slate-300'}`}>
                                         {v.status === 'Active' ? <Briefcase size={18} /> : <AlertCircle size={18} />}
                                     </div>
                                     <div className="space-y-0.5">
                                         <h4 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase tracking-tighter">{v.model}</h4>
                                         <p className="text-[11px] font-bold text-slate-400 opacity-60 leading-tight tracking-tighter uppercase">{v.plate} • <span className="text-slate-200"> ● </span> {v.category}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                      <Edit3 size={16} className="text-slate-200 hover:text-blue-500 transition-colors" />
                                      <button onClick={() => deleteVehicle(v.id)}><Trash2 size={16} className="text-slate-200 hover:text-rose-500 transition-colors" /></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </main>
        </div>
    );
};

export default VehicleFleet;
