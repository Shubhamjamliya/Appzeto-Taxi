import React, { useRef, useState } from 'react';
import { ArrowLeft, Camera, FileText, CheckCircle2, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    clearDriverRegistrationSession,
    completeDriverOnboarding,
    getStoredDriverRegistrationSession,
    saveDriverDocuments,
    saveDriverRegistrationSession,
} from '../../services/registrationService';

const DOCUMENTS = [
    { key: 'aadharFront', label: 'Front Side', icon: Smartphone, group: 'Aadhar Card Verification' },
    { key: 'aadharBack', label: 'Back Side', icon: FileText, group: 'Aadhar Card Verification' },
    { key: 'drivingLicense', label: 'Driving License', sub: 'License (Front)' },
    { key: 'vehicleRC', label: 'Vehicle registration', sub: 'RC / Blue Book' },
];

const normalizeDocument = (doc) => {
    if (!doc) {
        return null;
    }

    if (typeof doc === 'string') {
        return {
            previewUrl: doc,
            secureUrl: doc,
            uploaded: true,
        };
    }

    return {
        ...doc,
        previewUrl: doc.previewUrl || doc.secureUrl || '',
        uploaded: doc.uploaded ?? Boolean(doc.secureUrl || doc.previewUrl),
    };
};

const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });

const StepDocuments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const session = {
        ...getStoredDriverRegistrationSession(),
        ...(location.state || {}),
    };

    const inputRefs = useRef({});

    const [docs, setDocs] = useState(() => ({
        aadharFront: normalizeDocument(session.documents?.aadharFront),
        aadharBack: normalizeDocument(session.documents?.aadharBack),
        drivingLicense: normalizeDocument(session.documents?.drivingLicense),
        vehicleRC: normalizeDocument(session.documents?.vehicleRC),
    }));
    const [uploading, setUploading] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const openPicker = (key) => {
        inputRefs.current[key]?.click();
    };

    const handleFileChange = async (key, event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const tempPreviewUrl = URL.createObjectURL(file);
        setUploading(key);
        setError('');

        setDocs((prev) => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                previewUrl: tempPreviewUrl,
                fileName: file.name,
                mimeType: file.type,
                uploaded: false,
                uploading: true,
            },
        }));

        try {
            const dataUrl = await fileToDataUrl(file);
            const response = await saveDriverDocuments({
                registrationId: session.registrationId,
                phone: session.phone,
                documents: {
                    [key]: {
                        dataUrl,
                        fileName: file.name,
                        mimeType: file.type,
                    },
                },
            });

            const uploadedDoc = response?.data?.documents?.[key] || response?.data?.session?.documents?.[key];
            const nextDoc = normalizeDocument(uploadedDoc) || {
                previewUrl: tempPreviewUrl,
                secureUrl: tempPreviewUrl,
                fileName: file.name,
                mimeType: file.type,
                uploaded: true,
            };

            setDocs((prev) => ({
                ...prev,
                [key]: nextDoc,
            }));

            saveDriverRegistrationSession({
                ...session,
                documents: {
                    ...(session.documents || {}),
                    [key]: nextDoc,
                },
            });
        } catch (uploadError) {
            setError(uploadError?.message || 'Unable to upload document');
            setDocs((prev) => ({
                ...prev,
                [key]: normalizeDocument(session.documents?.[key]),
            }));
        } finally {
            setUploading(null);
            URL.revokeObjectURL(tempPreviewUrl);
        }
    };

    const isComplete = DOCUMENTS.every((item) => Boolean(docs[item.key]?.uploaded)) && !uploading;

    const handleSubmit = async () => {
        if (!isComplete) {
            setError(uploading ? 'Please wait for the current upload to finish' : 'Please upload all required documents');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submittedDocuments = Object.fromEntries(
                Object.entries(docs).filter(([, value]) => Boolean(value?.uploaded || value?.secureUrl))
            );

            const completeResponse = await completeDriverOnboarding({
                registrationId: session.registrationId,
                phone: session.phone,
                documents: submittedDocuments,
            });

            const token = completeResponse?.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'driver');
            }

            saveDriverRegistrationSession({
                ...session,
                documents: docs,
                completedRegistration: completeResponse?.data || null,
            });
            clearDriverRegistrationSession();

            navigate('/taxi/driver/registration-status', {
                state: {
                    ...session,
                    documents: docs,
                    completedRegistration: completeResponse?.data || null,
                },
            });
        } catch (submitError) {
            setError(submitError?.message || 'Unable to complete registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans p-5 pt-8 select-none overflow-x-hidden pb-32">
            <header className="mb-6">
                <button onClick={() => navigate(-1)} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 active:scale-95 transition-transform">
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
            </header>

            <main className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">KYC Vault</h1>
                    <p className="text-[11px] font-bold text-slate-400 opacity-80 uppercase tracking-widest leading-relaxed">Identity and vehicle verification</p>
                </div>

                {error && (
                    <p className="text-[11px] font-bold text-rose-500">{error}</p>
                )}

                <div className="space-y-5">
                    <div className="space-y-2.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Aadhar Card Verification</label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {DOCUMENTS.filter((item) => item.group === 'Aadhar Card Verification').map((item) => {
                                const Icon = item.icon;
                                const doc = docs[item.key];

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => openPicker(item.key)}
                                        className={`relative h-24 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 overflow-hidden shadow-sm border ${
                                            doc ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-transparent'
                                        }`}
                                    >
                                        <input
                                            ref={(el) => {
                                                inputRefs.current[item.key] = el;
                                            }}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(item.key, e)}
                                        />

                                        {uploading === item.key ? (
                                            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                        ) : doc?.previewUrl ? (
                                            <img
                                                src={doc.previewUrl}
                                                alt={item.label}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 relative z-10">
                                                <Icon size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                            </div>
                                        )}

                                        {!doc?.previewUrl && (
                                            <div className="absolute top-1.5 right-1.5 p-1 bg-white rounded-lg shadow-sm">
                                                <Camera size={10} className="text-slate-900" />
                                            </div>
                                        )}

                                        {doc?.previewUrl && (
                                            <div className="absolute inset-0 bg-black/10" />
                                        )}

                                        {doc?.uploaded && !uploading && (
                                            <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                                                <CheckCircle2 size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {DOCUMENTS.filter((item) => !item.group).map((item) => {
                        const doc = docs[item.key];

                        return (
                            <div key={item.key} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between group active:bg-white shadow-sm transition-all border-none">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all overflow-hidden ${
                                        doc?.previewUrl ? 'bg-white shadow-sm' : doc?.uploaded ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-white shadow-sm text-slate-300'
                                    }`}>
                                        {doc?.previewUrl ? (
                                            <img src={doc.previewUrl} alt={item.label} className="h-full w-full object-cover" />
                                        ) : doc?.uploaded ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <FileText size={18} />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[13px] font-black text-slate-900 leading-none">{item.label}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openPicker(item.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                        doc?.uploaded ? 'text-emerald-500 hover:bg-emerald-50' : 'bg-slate-950 text-white'
                                    }`}
                                >
                                    {uploading === item.key ? '...' : doc?.uploaded ? 'Replace' : 'Upload'}
                                </button>

                                <input
                                    ref={(el) => {
                                        inputRefs.current[item.key] = el;
                                    }}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(item.key, e)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl flex gap-3 mt-4">
                     <AlertCircle size={16} className="text-amber-500 shrink-0" />
                     <p className="text-[10px] font-bold text-slate-600 leading-snug">
                        Ensure all photos are <span className="text-amber-600 font-black tracking-tight">clear & legible</span>.
                     </p>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !isComplete}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${
                            isComplete
                            ? 'bg-slate-900 text-white shadow-slate-900/10'
                            : 'bg-slate-100 text-slate-300 pointer-events-none'
                        }`}
                    >
                        {loading ? 'Submitting...' : 'Review & Submit'} <ShieldCheck size={16} strokeWidth={3} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StepDocuments;
