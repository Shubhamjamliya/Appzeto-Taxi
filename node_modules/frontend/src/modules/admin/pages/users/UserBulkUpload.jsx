import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Info,
  ArrowRight,
  Database,
  Users as UsersIcon,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Plus
} from 'lucide-react';

const UserBulkUpload = () => {
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
    <div className="space-y-8 p-1 animate-in fade-in duration-700 relative text-gray-950 font-sans">
      {/* MATE STYLE HEADER */}
      <div className="flex items-start justify-between">
         <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Bulk Migration</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950">Management</span>
               <ChevronRight size={14} />
               <span>User Onboarding</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-950 px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Download size={16} className="text-gray-400" /> Template
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
         {/* MAIN AREA */}
         <div className="xl:col-span-3 space-y-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`bg-white rounded-[40px] border border-gray-100 shadow-sm transition-all min-h-[500px] flex flex-col items-center justify-center text-center p-12 overflow-hidden ${
                dragActive ? 'bg-gray-50/80 ring-2 ring-gray-900 border-transparent' : 'hover:bg-gray-50/30'
              }`}
            >
               {uploadStatus === 'idle' && (
                  <div className="max-w-md space-y-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
                     <div className="w-24 h-24 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center text-gray-950 shadow-sm">
                        <UploadCloud size={40} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-bold text-gray-950 mb-3 tracking-tight leading-none">Drop your CSV files here</h4>
                        <p className="text-gray-400 font-bold text-[14px] px-8 leading-relaxed">Ensure your headers match the template. Max. 50,000 records per upload.</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="px-8 py-4 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
                        >
                           Select File
                        </button>
                        <button className="px-8 py-4 bg-gray-50 text-gray-500 text-[12px] font-black uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all">
                           Cloud Import
                        </button>
                     </div>
                     <input 
                       ref={fileInputRef}
                       type="file" 
                       className="hidden" 
                       accept=".csv,.xlsx" 
                       onChange={handleFileSelect}
                     />
                  </div>
               )}

               {(uploadStatus === 'uploading' || (file && uploadStatus === 'idle')) && (
                  <div className="w-full max-w-lg space-y-10 animate-in fade-in duration-300">
                     <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-950 shadow-sm"><FileText size={28} /></div>
                              <div className="text-left">
                                 <p className="text-[15px] font-bold text-gray-950 truncate leading-none mb-1.5">{file?.name}</p>
                                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{(file?.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                              </div>
                           </div>
                           <button onClick={resetUpload} className="p-2.5 bg-white border border-gray-100 hover:text-rose-500 rounded-xl transition-all shadow-sm">
                              <X size={18} />
                           </button>
                        </div>
                     </div>

                     {uploadStatus === 'uploading' ? (
                       <div className="flex flex-col items-center">
                          <Loader2 size={40} className="animate-spin text-gray-950 mb-6" />
                          <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Validating data pool...</p>
                          <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                             <div className="h-full bg-gray-950 animate-progress origin-left"></div>
                          </div>
                       </div>
                     ) : (
                       <button 
                         onClick={handleUpload}
                         className="w-full py-5 bg-black text-white text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                       >
                          Initiate Migration <ArrowRight size={18} />
                       </button>
                     )}
                  </div>
               )}

               {uploadStatus === 'success' && (
                 <div className="space-y-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center shadow-lg border border-emerald-100">
                       <CheckCircle2 size={48} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-bold text-gray-950 mb-3 tracking-tight leading-none">Migration Ready!</h4>
                       <p className="text-gray-400 font-bold text-[14px] max-w-sm mx-auto leading-relaxed">Data has been successfully staged. Final confirmation is required in the pending queue.</p>
                    </div>
                    <div className="flex gap-4">
                       <button 
                          onClick={resetUpload}
                          className="px-8 py-4 bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl"
                       >
                          View Results
                       </button>
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* SIDEBAR ANALYTICS - MATE STYLE */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
               <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6">Migration Health</h4>
               
               <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="90" className="text-gray-950" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="text-xl font-black text-gray-950 leading-none">Optimal</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={16} /></div>
                        <span className="text-[12px] font-bold text-gray-500">Correct records</span>
                     </div>
                     <span className="text-[13px] font-black text-gray-950">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-rose-500"><AlertTriangle size={16} /></div>
                        <span className="text-[12px] font-bold text-gray-500">Duplicate IDs</span>
                     </div>
                     <span className="text-[13px] font-black text-rose-500">2%</span>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[32px] border border-indigo-100 relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-6 opacity-10 text-indigo-500 group-hover:scale-110 transition-transform duration-700">
                  <Database size={100} strokeWidth={1} />
               </div>
               <div className="relative z-10">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-sm border border-indigo-100"><Info size={24} /></div>
                  <h4 className="text-[14px] font-black text-gray-950 uppercase tracking-widest mb-3 leading-none">Mapping Specs</h4>
                  <p className="text-[12px] font-bold text-gray-500 leading-relaxed mb-6 italic">Ensure your spreadsheet column names match these exact keys: name, email, phone, wallet, join_date.</p>
                  <div className="flex items-center justify-between text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                     <span>Required</span>
                     <ArrowRight size={14} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UserBulkUpload;
