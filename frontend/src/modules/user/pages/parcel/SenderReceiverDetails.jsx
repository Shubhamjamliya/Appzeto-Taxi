import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Phone, MapPin, Search, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const PHONE_REGEX = /^[6-9]\d{9}$/;

const PhoneInput = ({ label, value, onChange, error, name, onClearError }) => (
  <div className="space-y-1">
    <label className="text-[12px] font-black text-gray-400 ml-1">{label}</label>
    <div className={`flex items-center gap-3 rounded-2xl p-4 ring-2 transition-all ${
      error ? 'bg-red-50 ring-red-100' : value && PHONE_REGEX.test(value) ? 'bg-green-50 ring-green-100' : 'bg-gray-50/50 ring-transparent'
    }`}>
      <Phone size={18} className={error ? 'text-red-400' : value && PHONE_REGEX.test(value) ? 'text-green-500' : 'text-gray-400'} />
      <input 
        type="tel"
        maxLength={10}
        className="flex-1 bg-transparent border-none text-[15px] font-bold text-gray-900 focus:outline-none placeholder:text-gray-300"
        value={value}
        placeholder="10-digit mobile number"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          onChange(val);
          if (onClearError) onClearError(name);
        }}
      />
      {value && PHONE_REGEX.test(value) && (
        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1"
        >
          <AlertCircle size={11} strokeWidth={3} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const SenderReceiverDetails = () => {
  const [senderName, setSenderName] = useState('Hritik Raghuwanshi');
  const [senderMobile, setSenderMobile] = useState('9876543210');
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Data flowing in from ParcelDetails
  const parcelState = location.state || {};

  const validate = () => {
    const newErrors = {};
    if (!senderName.trim()) newErrors.senderName = 'Sender name is required';
    if (!PHONE_REGEX.test(senderMobile)) newErrors.senderMobile = 'Enter a valid 10-digit mobile number';
    if (!receiverName.trim()) newErrors.receiverName = 'Receiver name is required';
    if (!PHONE_REGEX.test(receiverMobile)) newErrors.receiverMobile = 'Enter a valid 10-digit mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    navigate('/parcel/searching', {
      state: {
        ...parcelState,
        senderName,
        senderMobile,
        receiverName,
        receiverMobile,
        isParcel: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans relative">
      <header className="bg-white px-5 py-6 flex items-center gap-6 border-b border-gray-50 shadow-sm sticky top-0 z-20">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-all">
            <ArrowLeft size={24} className="text-gray-900" strokeWidth={3} />
         </button>
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              {parcelState.parcelType || 'Parcel'} · {parcelState.weight || 'Under 5kg'}
            </p>
            <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">Contacts</h1>
         </div>
      </header>

      <div className="flex-1 p-5 space-y-8 overflow-y-auto no-scrollbar pb-4">

         {/* SENDER SECTION */}
         <div className="space-y-4">
             <div className="flex items-center gap-3 ml-1">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <User size={18} strokeWidth={3} />
                </div>
                <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-none">Sender Details</h3>
             </div>
             <div className="bg-white rounded-[32px] p-5 shadow-lg shadow-gray-100 border border-gray-50 space-y-4">
                <div className="space-y-1">
                   <label className="text-[12px] font-black text-gray-400 ml-1">Sender Name</label>
                   <input 
                      type="text"
                      className={`w-full rounded-2xl p-4 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 ring-primary/10 transition-all ${
                        errors.senderName ? 'bg-red-50 ring-2 ring-red-100' : 'bg-gray-50/50'
                      }`}
                      value={senderName}
                      placeholder="Your name"
                      onChange={(e) => {
                        setSenderName(e.target.value);
                        if (errors.senderName) setErrors(prev => ({ ...prev, senderName: '' }));
                      }}
                   />
                   {errors.senderName && (
                     <p className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1 mt-1">
                       <AlertCircle size={11} strokeWidth={3} /> {errors.senderName}
                     </p>
                   )}
                </div>
                <PhoneInput 
                  label="Sender Mobile" 
                  value={senderMobile} 
                  onChange={setSenderMobile} 
                  error={errors.senderMobile} 
                  name="senderMobile" 
                  onClearError={(name) => {
                    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
                  }}
                />
             </div>
         </div>

         {/* RECEIVER SECTION */}
         <div className="space-y-4 pb-24">
             <div className="flex items-center gap-3 ml-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin size={18} strokeWidth={3} />
                </div>
                <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-none">Receiver Details</h3>
             </div>
             <div className="bg-white rounded-[32px] p-5 shadow-lg shadow-gray-100 border border-gray-50 space-y-4">
                <div className="space-y-1">
                   <label className="text-[12px] font-black text-gray-400 ml-1">Receiver Name</label>
                   <input 
                      type="text"
                      placeholder="Enter receiver's name"
                      className={`w-full rounded-2xl p-4 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 ring-blue-100 transition-all placeholder:text-gray-300 ${
                        errors.receiverName ? 'bg-red-50 ring-2 ring-red-100' : 'bg-gray-50/50'
                      }`}
                      value={receiverName}
                      onChange={(e) => {
                        setReceiverName(e.target.value);
                        if (errors.receiverName) setErrors(prev => ({ ...prev, receiverName: '' }));
                      }}
                   />
                   {errors.receiverName && (
                     <p className="text-[11px] font-black text-red-500 ml-2 flex items-center gap-1 mt-1">
                       <AlertCircle size={11} strokeWidth={3} /> {errors.receiverName}
                     </p>
                   )}
                </div>
                <PhoneInput 
                  label="Receiver Mobile" 
                  value={receiverMobile} 
                  onChange={setReceiverMobile} 
                  error={errors.receiverMobile} 
                  name="receiverMobile" 
                  onClearError={(name) => {
                    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
                  }}
                />
             </div>

             {/* Estimated fare summary */}
             {parcelState.estimatedFare && (
               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
                 <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Est. Delivery Fare</span>
                 <span className="text-[16px] font-black text-gray-900">
                   ₹{parcelState.estimatedFare.min}–₹{parcelState.estimatedFare.max}
                 </span>
               </div>
             )}
         </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-50 pb-10 sticky bottom-0 z-30">
         <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            className="w-full bg-[#1C2833] py-5 rounded-[28px] text-[18px] font-black text-white shadow-xl shadow-gray-200 active:bg-black transition-all flex items-center justify-center gap-2"
         >
            <span>Find Delivery Agent</span>
            <ChevronRight size={20} className="opacity-40" />
         </motion.button>
      </div>
    </div>
  );
};

export default SenderReceiverDetails;
