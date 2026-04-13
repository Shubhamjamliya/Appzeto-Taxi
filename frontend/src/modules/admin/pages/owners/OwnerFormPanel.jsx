import React from 'react';
import { Check, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const inputClass =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors';
const labelClass = 'block text-xs font-semibold text-gray-900 mb-2';

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <h1 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {isEdit ? 'EDIT' : 'CREATE'}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button type="button" onClick={onCancel} className="text-slate-900 transition-colors hover:text-indigo-600">
            {backLabel}
          </button>
          <ChevronRight size={14} />
          <span>{isEdit ? 'Edit' : 'Create'}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-8 border-t border-dashed border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-800">basic Information</h2>
            <p className="mt-1 text-sm text-slate-400">Fill all Information as below</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(event) => setFormData({ ...formData, company_name: event.target.value })}
                  placeholder="Enter Company Name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Enter Name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                <div className="flex h-[42px] overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <div className="flex items-center gap-3 border-r border-gray-200 bg-gray-50 px-4 text-sm text-gray-900">
                    <img src="https://flagcdn.com/w20/in.png" alt="IN" className="h-4 w-6 rounded-sm object-cover" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(event) => setFormData({ ...formData, mobile: event.target.value.replace(/\D/g, '') })}
                    placeholder="Enter Number"
                    className="min-w-0 flex-1 px-4 text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="Enter Email"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  placeholder="Enter Password"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password_confirmation}
                  onChange={(event) => setFormData({ ...formData, password_confirmation: event.target.value })}
                  placeholder="Enter confirm Password"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Select Area</label>
                <div className="relative">
                  <select
                    value={formData.service_location_id}
                    onChange={(event) => setFormData({ ...formData, service_location_id: event.target.value })}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value=""></option>
                    {areas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.service_location_name || area.name || 'Unknown Area'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Select Transport Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    required
                    value={formData.transport_type}
                    onChange={(event) => setFormData({ ...formData, transport_type: event.target.value })}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select Transport Type</option>
                    {transportTypes.map((transportType, index) => (
                      <option key={index} value={transportType.transport_type}>
                        {transportType.transport_type === 'all'
                          ? 'All'
                          : transportType.transport_type.charAt(0).toUpperCase() + transportType.transport_type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-4 rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    Submit
                    <Check size={18} />
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
