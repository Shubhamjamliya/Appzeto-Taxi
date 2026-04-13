import React from 'react';
import { ChevronDown, ChevronRight, Check, Edit, Globe, Loader2, MapPin, Plus } from 'lucide-react';

const OwnerFormPanel = ({
  mode = 'create',
  formData,
  setFormData,
  areas,
  transportTypes,
  submitting,
  onSubmit,
  onCancel,
  backLabel = 'Manage Owners',
}) => {
  const isEdit = mode === 'edit';

  return (
    <div>
      <div className="flex items-center justify-between mb-8 overflow-hidden px-1">
        <div>
          <h1 className="text-[15px] font-black tracking-tight text-gray-800 uppercase">
            {isEdit ? 'Edit Partner' : 'Create Owner'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
          <span className="hover:text-indigo-600 transition-colors cursor-pointer" onClick={onCancel}>
            {backLabel}
          </span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-gray-800 uppercase tracking-widest">
            {isEdit ? 'Refine Credentials' : 'New Registration'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
              {isEdit ? <Edit size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h2 className="text-[18px] font-black text-gray-800 tracking-tight leading-none">Account Configuration</h2>
              <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                {isEdit ? 'Update partner profile details' : 'Establish new fleet partner credentials'}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter Company Name"
                className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter Owner Name"
                className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number *</label>
              <div className="flex gap-0 group h-12">
                <div className="px-4 bg-indigo-950 text-white border-none rounded-l-xl flex items-center gap-2">
                  <img src="https://flagcdn.com/w20/in.png" alt="IN" className="w-5 h-3.5 object-cover rounded-sm" />
                  <span className="text-[14px] font-black">+91</span>
                </div>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter Number"
                  className="flex-1 px-5 bg-gray-50 border-none rounded-r-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter Business Email"
                className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">
                {isEdit ? 'Update Password (optional)' : 'Create Password *'}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="........"
                className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">
                {isEdit ? 'Verify New Password' : 'Confirm Password *'}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="........"
                className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <MapPin size={14} className="text-indigo-400" /> Select Operating Area *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.service_location_id}
                  onChange={(e) => setFormData({ ...formData, service_location_id: e.target.value })}
                  className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                >
                  <option value="">Select Area</option>
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.service_location_name || area.name || 'Unknown Area'}
                      </option>
                    ))
                  ) : (
                    <option disabled>No areas available from API</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <Globe size={14} className="text-indigo-400" /> Transport Module *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.transport_type}
                  onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                  className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                >
                  <option value="">Select Transport Type</option>
                  {transportTypes.map((transportType, idx) => (
                    <option key={idx} value={transportType.transport_type}>
                      {transportType.transport_type === 'all'
                        ? 'All'
                        : transportType.transport_type.charAt(0).toUpperCase() + transportType.transport_type.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 text-[14px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
              >
                Back to Fleet
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-950 hover:bg-black text-white px-10 py-3 rounded-xl text-[14px] font-black flex items-center gap-3 transition-all shadow-2xl disabled:opacity-50 active:scale-95"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {isEdit ? 'Update Credentials' : 'Create Partner'} <Check size={18} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerFormPanel;
