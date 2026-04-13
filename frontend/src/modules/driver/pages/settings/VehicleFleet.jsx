import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bike, Car, CheckCircle2, Edit3, LoaderCircle, Save, Truck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getCurrentDriver,
    getDriverVehicleTypes,
    updateDriverVehicle,
} from '../../services/registrationService';

const unwrap = (response) => response?.data?.data || response?.data || response;

const getVehicleTypes = (response) => {
    const data = unwrap(response);
    return data?.vehicle_types || data?.results || (Array.isArray(data) ? data : []);
};

const getTypeLabel = (type) => type?.name || type?.vehicle_type || type?.label || 'Vehicle';

const getDriverVehicleTypeId = (driver) => {
    if (!driver?.vehicleTypeId) {
        return '';
    }

    return String(driver.vehicleTypeId?._id || driver.vehicleTypeId);
};

const iconFor = (iconType = '') => {
    const value = String(iconType).toLowerCase();

    if (value.includes('bike')) {
        return Bike;
    }

    if (value.includes('truck') || value.includes('hcv') || value.includes('lcv') || value.includes('mcv')) {
        return Truck;
    }

    return Car;
};

const buildForm = (driver) => ({
    vehicleTypeId: getDriverVehicleTypeId(driver),
    vehicleMake: driver?.vehicleMake || '',
    vehicleModel: driver?.vehicleModel || '',
    vehicleNumber: driver?.vehicleNumber || '',
    vehicleColor: driver?.vehicleColor || '',
});

const VehicleFleet = () => {
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [formData, setFormData] = useState(buildForm(null));
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const selectedType = useMemo(() => {
        const selectedId = formData.vehicleTypeId || getDriverVehicleTypeId(driver);
        return vehicleTypes.find((type) => String(type._id || type.id) === String(selectedId));
    }, [driver, formData.vehicleTypeId, vehicleTypes]);
    const driverRegisterFor = String(driver?.registerFor || 'taxi').toLowerCase();

    const ActiveIcon = iconFor(selectedType?.icon_types || driver?.vehicleIconType || driver?.vehicleType);
    const activeVehicleName = getTypeLabel(selectedType) || driver?.vehicleType || 'Vehicle';
    const vehicleModel = [driver?.vehicleMake, driver?.vehicleModel].filter(Boolean).join(' ') || activeVehicleName;

    useEffect(() => {
        let active = true;

        const load = async () => {
            setIsLoading(true);
            setMessage('');

            try {
                const [driverResponse, typeResponse] = await Promise.all([
                    getCurrentDriver(),
                    getDriverVehicleTypes(),
                ]);

                if (!active) {
                    return;
                }

                const nextDriver = unwrap(driverResponse);
                const nextTypes = getVehicleTypes(typeResponse).filter((type) => {
                    const isActive = type.active !== false && Number(type.status ?? 1) !== 0;
                    const transportType = String(type.transport_type || 'taxi').toLowerCase();

                    if (!isActive) {
                        return false;
                    }

                    if (String(nextDriver?.registerFor || 'taxi').toLowerCase() === 'both') {
                        return true;
                    }

                    return transportType === String(nextDriver?.registerFor || 'taxi').toLowerCase();
                });

                setDriver(nextDriver);
                setVehicleTypes(nextTypes);
                setFormData(buildForm(nextDriver));
            } catch (error) {
                if (active) {
                    setMessage(error.message || 'Could not load vehicle details.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.vehicleTypeId) {
            setMessage('Select a vehicle type first.');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            const response = await updateDriverVehicle(formData);
            const nextDriver = unwrap(response);
            setDriver(nextDriver);
            setFormData(buildForm(nextDriver));
            setIsEditing(false);
            setMessage('Vehicle updated. Map icon will use this vehicle type.');
        } catch (error) {
            setMessage(error.message || 'Could not update vehicle.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 pb-32 overflow-x-hidden">
            <header className="flex items-center gap-4 mb-8 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight tracking-tighter uppercase">My Vehicle</h1>
            </header>

            {isLoading ? (
                <div className="min-h-[420px] flex items-center justify-center text-slate-400">
                    <LoaderCircle size={28} className="animate-spin" />
                </div>
            ) : (
                <main className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1a1c24] to-[#3a3d4d] p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-taxi-primary/60">Primary Vehicle</h3>
                                    <p className="text-[20px] font-black tracking-tight leading-none truncate">{vehicleModel}</p>
                                    <p className="text-[14px] font-black tracking-[0.2em] opacity-40 truncate">{driver?.vehicleNumber || 'Number not set'}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{activeVehicleName} · {driver?.vehicleColor || 'Color not set'}</p>
                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-taxi-primary border border-white/10 shadow-lg shrink-0">
                                    <ActiveIcon size={28} />
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={16} strokeWidth={3} />
                                <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">Map icon linked to selected type</span>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">{message}</p>
                    )}

                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Vehicle Details</h3>
                            <button
                                onClick={() => {
                                    setFormData(buildForm(driver));
                                    setIsEditing(true);
                                }}
                                className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"
                            >
                                <Edit3 size={13} /> Edit
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Dispatch Matching</p>
                            <p className="text-[11px] font-bold text-slate-600 mt-1 leading-relaxed">
                                Update the primary vehicle here if requests are not reaching this driver. Dispatch uses the selected vehicle type exactly, including delivery jobs.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Dispatch Mode</p>
                            <p className="text-[11px] font-bold text-slate-600 mt-1 leading-relaxed">
                                This driver is registered for <span className="text-slate-900 uppercase">{driverRegisterFor}</span>. Only matching {driverRegisterFor === 'both' ? 'taxi and delivery' : driverRegisterFor} vehicle types are shown below.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-white shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-500 shadow-sm border-emerald-500/5 shrink-0">
                                    <ActiveIcon size={18} />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h4 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase tracking-tighter truncate">{activeVehicleName}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 opacity-70 leading-tight tracking-tighter uppercase truncate">
                                        {driver?.vehicleNumber || 'No number'} · {driver?.vehicleColor || 'No color'} · {driver?.vehicleIconType || driver?.vehicleType || 'car'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                        </div>
                    </section>
                </main>
            )}

            <AnimatePresence>
                {isEditing && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[2rem] p-5 pb-8 shadow-2xl max-w-lg mx-auto space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edit Vehicle</p>
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Primary Vehicle</h2>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicle Type</label>
                                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                                    {vehicleTypes.map((type) => {
                                        const id = String(type._id || type.id);
                                        const TypeIcon = iconFor(type.icon_types || type.name);
                                        const selected = String(formData.vehicleTypeId) === id;

                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => handleChange('vehicleTypeId', id)}
                                                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all min-h-20 ${
                                                    selected
                                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                                        : 'bg-slate-50 text-slate-400'
                                                }`}
                                            >
                                                <TypeIcon size={16} />
                                                <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">{getTypeLabel(type)}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Make</label>
                                        <input value={formData.vehicleMake} onChange={(e) => handleChange('vehicleMake', e.target.value)} placeholder="Suzuki" className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none placeholder:text-slate-200" />
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Model</label>
                                        <input value={formData.vehicleModel} onChange={(e) => handleChange('vehicleModel', e.target.value)} placeholder="WagonR" className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none placeholder:text-slate-200" />
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vehicle Number</label>
                                    <input value={formData.vehicleNumber} onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())} placeholder="MP 09 AB 1234" className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none placeholder:text-slate-200 uppercase" />
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl shadow-sm">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Color</label>
                                    <input value={formData.vehicleColor} onChange={(e) => handleChange('vehicleColor', e.target.value)} placeholder="White, Black, Silver" className="w-full bg-transparent border-none p-0 text-[13px] font-black text-slate-900 focus:outline-none placeholder:text-slate-200" />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50"
                            >
                                {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Vehicle
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VehicleFleet;
