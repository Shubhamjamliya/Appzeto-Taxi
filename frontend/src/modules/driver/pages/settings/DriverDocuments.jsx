import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileCheck, AlertCircle, CheckCircle2, MoreVertical, Eye, FileText, Smartphone, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverDocuments = () => {
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docs, setDocs] = useState([
        { id: 1, name: 'Driving License', status: 'Verified', date: 'Exp: 10/2030', icon: <FileCheck size={20} /> },
        { id: 2, name: 'Aadhar Card', status: 'Verified', date: 'Uploaded 2024', icon: <Smartphone size={20} /> },
        { id: 3, name: 'Vehicle Insurance', status: 'Under Review', date: 'Uploaded 2h ago', icon: <FileText size={20} /> },
        { id: 4, name: 'Registration (RC)', status: 'Action Required', date: 'Expired', icon: <ShieldAlert size={20} /> }
    ]);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans p-6 pt-10 pb-32 overflow-x-hidden">
            <header className="flex items-center gap-4 mb-10 text-slate-900 uppercase">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-black tracking-tight tracking-tighter uppercase underline decoration-emerald-500/20">KYC Portfolio</h1>
            </header>

            <AnimatePresence>
                {selectedDoc && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-7 rounded-[2.5rem] shadow-2xl space-y-5 max-w-xs w-full text-center">
                            <div className="flex justify-between items-center mb-2">
                                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">{selectedDoc.icon}</div>
                                <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><X size={18} /></button>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{selectedDoc.name}</h4>
                                <p className="text-[11px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">{selectedDoc.status}</p>
                            </div>
                            <div className="aspect-[3/2] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner group overflow-hidden">
                                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-[9px]">Document Preview Unavailable</p>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="w-full h-12 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest mt-2 active:scale-97 transition-all">Close Viewer</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="space-y-6">
                <div className="bg-white p-5 rounded-[2rem] border border-white shadow-xl flex items-center justify-between group active:scale-[0.99] transition-all">
                     <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/10 transition-transform group-hover:scale-110 shadow-sm shadow-emerald-500/5">
                             <CheckCircle2 size={24} strokeWidth={3} />
                         </div>
                         <div className="space-y-0.5">
                             <h3 className="text-[14px] font-black tracking-tight leading-none text-slate-900 uppercase">89% Compliance</h3>
                             <p className="text-[10px] font-bold text-slate-400 opacity-60 leading-tight tracking-widest">1 Action Required</p>
                         </div>
                     </div>
                     <button 
                        onClick={handleSync}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm ${isSyncing ? 'bg-slate-100 text-slate-300' : 'bg-blue-50 text-blue-500 active:bg-blue-100'}`}
                        disabled={isSyncing}
                     >
                        {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : 'Bulk Sync'}
                    </button>
                </div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 ml-2">Verified Documents</h3>
                          <button className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-0.5">Audit Feed</button>
                     </div>

                     <div className="space-y-3">
                         {docs.map((doc) => (
                             <div 
                                key={doc.id} 
                                onClick={() => setSelectedDoc(doc)}
                                className="bg-white p-4 py-5 rounded-2xl border border-white shadow-[0_5px_30px_rgba(0,0,0,0.015)] flex items-center justify-between group active:scale-98 transition-all overflow-hidden relative cursor-pointer"
                             >
                                 <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                                     doc.status === 'Verified' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                     doc.status === 'Under Review' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                 }`} />
                                 
                                 <div className="flex items-center gap-4">
                                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-slate-50 transition-colors bg-slate-50 text-slate-400 shadow-sm ml-1 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                         {doc.icon}
                                     </div>
                                     <div className="space-y-0.5">
                                         <h4 className="text-[14px] font-black text-slate-900 leading-tight uppercase tracking-tight">{doc.name}</h4>
                                         <p className="text-[11px] font-bold text-slate-400 opacity-60 leading-tight uppercase tracking-widest">{doc.date}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                                          doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-500 border-emerald-500/10' :
                                          doc.status === 'Under Review' ? 'bg-amber-50 text-amber-500 border-amber-500/10' :
                                          'bg-rose-50 text-rose-500 border-rose-500/10 animate-pulse'
                                      }`}>{doc.status}</span>
                                      <Eye size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </main>
        </div>
    );
};

export default DriverDocuments;
