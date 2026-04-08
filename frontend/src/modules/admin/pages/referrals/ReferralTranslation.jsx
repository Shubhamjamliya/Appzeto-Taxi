import React from 'react';
import { ChevronRight, Languages, AlertCircle } from 'lucide-react';

const ReferralTranslation = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-gray-900 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[12px] font-black tracking-widest text-[#2D3748] uppercase">REFERRAL TRANSLATION</h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <span>Referral Management</span>
           <ChevronRight size={12} />
           <span className="text-gray-950">Translation</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
        <div className="p-6 bg-amber-50 text-amber-500 rounded-full">
           <Languages size={48} />
        </div>
        <div className="space-y-2 max-w-md">
           <h3 className="text-[20px] font-bold text-[#2D3748]">Localization Engine</h3>
           <p className="text-[14px] text-gray-500">The referral translation module is currently under maintenance. We are updating the language strings to support multiple local dialects.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-100/50 px-4 py-2 rounded-lg text-amber-700 text-[12px] font-bold uppercase tracking-widest">
           <AlertCircle size={16} /> Beta Support Incoming
        </div>
      </div>
    </div>
  );
};

export default ReferralTranslation;
