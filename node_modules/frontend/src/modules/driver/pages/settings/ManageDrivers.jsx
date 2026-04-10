import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, ShieldCheck, Mail, Phone, MapPin, Trash2, Edit3, Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageDrivers = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([
        { id: 1, name: 'Sagar Jain', phone: '+91 98765 43210', email: 'sagar.j@redigo.com', address: 'Vijay Nagar, Indore', status: 'Active' },
        { id: 2, name: 'Rahul Sharma', phone: '+91 99887 76655', email: 'rahul.s@redigo.com', address: 'Bhopal Central', status: 'Pending' }
    ]);

    const deleteDriver = (id) => {
        setDrivers(d => d.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 pb-32 overflow-x-hidden">
            <header className="flex items-center gap-4 mb-8 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight tracking-tighter uppercase">Manage Drivers</h1>
            </header>

            <main className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-30%] right-[-10%] w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-black uppercase tracking-widest text-sky-500/60">Total Active</h3>
                                <p className="text-[28px] font-black tracking-tight leading-none italic">{drivers.filter(d => d.status === 'Active').length} Drivers</p>
                                <p className="text-[11px] font-bold tracking-widest opacity-40 uppercase">Managing your fleet team</p>
                            </div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-sky-500 border border-white/10 shadow-lg">
                                <Briefcase size={28} />
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/taxi/driver/add-driver')}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                        >
                            + Add New Driver
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Team List</h3>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Status Overview</p>
                     </div>

                     <div className="space-y-3">
                         {drivers.map((d) => (
                             <div key={d.id} className="bg-white p-5 rounded-2xl border border-white shadow-sm flex flex-col gap-4 group active:scale-98 transition-all">
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                         <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-slate-50 transition-colors ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-500 shadow-sm' : 'bg-amber-50 text-amber-500 shadow-sm'}`}>
                                             <UserPlus size={18} />
                                         </div>
                                         <div className="space-y-0.5">
                                             <h4 className="text-[14px] font-black text-slate-900 leading-tight uppercase tracking-tighter">{d.name}</h4>
                                             <div className="flex items-center gap-2">
                                                 <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.status}</span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                          <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><Edit3 size={14} /></button>
                                          <button onClick={() => deleteDriver(d.id)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3 pt-1">
                                     <div className="flex items-center gap-2 text-slate-400">
                                         <Phone size={12} strokeWidth={2.5} />
                                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{d.phone}</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-slate-400">
                                         <Mail size={12} strokeWidth={2.5} />
                                         <span className="text-[10px] font-bold text-slate-600 truncate">{d.email}</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-slate-400 col-span-2">
                                         <MapPin size={12} strokeWidth={2.5} />
                                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{d.address}</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </main>

            <div className="fixed bottom-6 right-6">
                 <button 
                    onClick={() => navigate('/taxi/driver/add-driver')}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default ManageDrivers;
