import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Download, 
  FileText, 
  CheckCircle2, 
  X, 
  Info,
  ArrowRight,
  Database,
  Car,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Files
} from 'lucide-react';

const DriverBulkUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadStatus('uploading');
    
    // Simulate upload delay
    setTimeout(() => {
      setUploadStatus('success');
    }, 3000);
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
  };

  return (
    <div className="space-y-10 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-none">Driver Bulk Migration</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950">Fleet Control</span>
               <ChevronRight size={14} />
               <span>Import Utility</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-100 text-gray-950 px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Download size={16} className="text-gray-400" /> Get CSV Template
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
         {/* UPLOAD AREA */}
         <div className="xl:col-span-3 space-y-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`bg-white rounded-[48px] border border-gray-50 shadow-sm transition-all min-h-[500px] flex flex-col items-center justify-center text-center p-12 overflow-hidden ${
                dragActive ? 'bg-gray-50/50 ring-2 ring-gray-950 border-transparent shadow-inner' : 'hover:bg-gray-50/20'
              }`}
            >
               {uploadStatus === 'idle' && (
                  <div className="max-w-md space-y-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
                     <div className="w-24 h-24 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center text-gray-950 shadow-inner group-hover:scale-105 transition-transform"><UploadCloud size={40} /></div>
                     <div>
                        <h4 className="text-2xl font-black text-gray-950 mb-3 tracking-tight leading-none">Drop driver dataset here</h4>
                        <p className="text-gray-400 font-bold text-[14px] leading-relaxed">CSV and Excel formats supported. Ensure vehicle registration numbers are present.</p>
                     </div>
                     <div className="flex items-center gap-3 w-full">
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="flex-1 px-8 py-4 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl"
                        >
                           Local Browse
                        </button>
                        <button className="flex-1 px-8 py-4 bg-gray-50 text-gray-400 text-[12px] font-black uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-100 hover:text-gray-950 transition-all">
                           Cloud Sync
                        </button>
                     </div>
                     <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileSelect} />
                  </div>
               )}

               {(uploadStatus === 'uploading' || (file && uploadStatus === 'idle')) && (
                  <div className="w-full max-w-lg space-y-12 animate-in fade-in duration-300">
                     <div className="p-10 bg-gray-50/50 rounded-[36px] border border-gray-100 relative group overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-between">
                           <div className="flex items-center gap-6 text-left">
                              <div className="w-16 h-16 bg-white border border-gray-100 rounded-[22px] flex items-center justify-center text-gray-950 shadow-sm transition-transform group-hover:scale-105"><FileText size={32} /></div>
                              <div>
                                 <p className="text-[17px] font-black text-gray-950 truncate max-w-[240px] leading-none mb-1.5">{file?.name}</p>
                                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">{(file?.size / (1024 * 1024)).toFixed(2)} MB • VERIFYING</p>
                              </div>
                           </div>
                           <button onClick={resetUpload} className="p-3 bg-white border border-gray-100 hover:text-rose-500 rounded-xl transition-all shadow-sm active:scale-90"><X size={20} /></button>
                        </div>
                     </div>

                     {uploadStatus === 'uploading' ? (
                       <div className="flex flex-col items-center">
                          <Loader2 size={40} className="animate-spin text-gray-950 mb-8" />
                          <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest focus:outline-none">Staging Fleet Records...</p>
                          <div className="w-80 h-1.5 bg-gray-100 rounded-full mt-8 overflow-hidden">
                             <div className="h-full bg-gray-950 animate-progress origin-left"></div>
                          </div>
                       </div>
                     ) : (
                       <button onClick={handleUpload} className="w-full py-6 bg-black text-white text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                          COMMIT MIGRATION <ArrowRight size={20} />
                       </button>
                     )}
                  </div>
               )}

               {uploadStatus === 'success' && (
                 <div className="space-y-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center border border-emerald-100 shadow-lg"><CheckCircle2 size={48} /></div>
                    <div className="text-center">
                       <h4 className="text-3xl font-black text-gray-950 mb-3 tracking-tight leading-none uppercase">STAGED SUCCESSFULLY</h4>
                       <p className="text-gray-400 font-bold text-[14px] max-w-sm leading-relaxed mx-auto italic opacity-80 focus:outline-none">"4,240 driver records have been verified against global RTO standards. Ready for core database merge."</p>
                    </div>
                    <button onClick={resetUpload} className="px-12 py-5 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Go to Live Fleet</button>
                 </div>
               )}
            </div>
         </div>

         {/* SIDEBAR SPECS */}
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden group">
               <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-8 relative z-10">Migration Health</h4>
               <div className="flex flex-col items-center mb-10 relative z-10">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-50" />
                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="402" strokeDashoffset="40" className="text-gray-950" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Success</p>
                        <p className="text-2xl font-black text-gray-950 leading-none">92.4%</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-4 relative z-10 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Duplicate Plate IDs</span>
                     <span className="text-[12px] font-black text-rose-500">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Mismatched Licenses</span>
                     <span className="text-[12px] font-black text-amber-500">12</span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 flex flex-col items-start relative group overflow-hidden">
               <div className="absolute bottom-0 right-0 p-8 opacity-10 text-indigo-500 scale-[2] group-hover:scale-[2.4] transition-transform duration-700 shadow-inner focus:outline-none"><Car size={100} strokeWidth={1} /></div>
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 mb-6 shadow-sm"><Info size={28} /></div>
               <h4 className="text-[15px] font-black text-gray-950 uppercase tracking-widest mb-3 leading-none">Data Dictionary</h4>
               <p className="text-[12px] font-bold text-gray-400 leading-relaxed mb-8 opacity-80">Column headers MUST match: name, phone, license_no, car_type, registration_plate. Unauthorized migration is monitored for PII leaks.</p>
               <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-200 pb-1 leading-none">Mapping Standards <ArrowRight size={14} /></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DriverBulkUpload;
