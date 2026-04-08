import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  ChevronRight, 
  Plus, 
  Filter, 
  Download, 
  X,
  Info,
  Car,
  Clock,
  IndianRupee,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

const ToggleSwitch = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm flex-1 min-w-[300px]">
    <span className="text-[13px] font-black text-gray-900 tracking-tight">{label}</span>
    <button 
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

import { adminService } from '../../services/adminService';

const DriverSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [config, setConfig] = useState({
    commissionOnly: false,
    subscriptionOnly: true,
    both: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [areas, setAreas] = useState([]);
  const [transportTypes, setTransportTypes] = useState([
    { transport_type: 'taxi' },
    { transport_type: 'delivery' }
  ]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    transport_type: 'taxi',
    vehicle_type_id: '',
    duration: '',
    how_it_works: '',
    service_location_id: ''
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setConfig({
      commissionOnly: key === 'commissionOnly',
      subscriptionOnly: key === 'subscriptionOnly',
      both: key === 'both'
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // PRO-LEVEL: Use Promise.all with standardized service calls
        const [plansData, transportData, areasData] = await Promise.all([
          adminService.getSubscriptionPlans(),
          adminService.getRideModules(),
          adminService.getServiceLocations()
        ]);

        if (plansData.success) setPlans(plansData.data?.results || []);
        
        if (areasData.success && Array.isArray(areasData.data)) {
          setAreas(areasData.data);
        } else if (areasData.success && areasData.data?.results) {
          setAreas(areasData.data.results);
        }

        if (transportData.success) {
          const raw = transportData.data;
          const mapped = Array.isArray(raw) ? raw : Object.keys(raw).map(k => ({ transport_type: k }));
          if (mapped.length > 0) setTransportTypes(mapped);
        }

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Vehicle Types when Area or Transport Type changes
  React.useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.service_location_id) return;
      try {
        const typeFilter = formData.transport_type.toLowerCase();
        const json = await adminService.getVehicleTypes(formData.service_location_id, typeFilter);
        if (json.success) {
           setVehicleTypes(Array.isArray(json.data) ? json.data : (json.data?.results || []));
        }
      } catch (e) { console.error(e); }
    };
    fetchVehicles();
  }, [formData.service_location_id, formData.transport_type]);

  const handleSaveSubscription = async () => {
    if (!formData.name || !formData.amount || !formData.duration) {
      alert("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const data = await adminService.createSubscriptionPlan(formData);
      if (data.success) {
        setIsAddModalOpen(false);
        // Refresh list
        const listData = await adminService.getSubscriptionPlans();
        if (listData.success) setPlans(listData.data?.results || []);
      }
    } catch (err) {
      alert(err.message || "Failed to save subscription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700 font-sans text-gray-950">
      {/* HEADER */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Subscription</h1>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
               <span className="text-gray-950 uppercase tracking-widest leading-none">Subscription</span>
               <ChevronRight size={14} />
               <span className="uppercase tracking-widest leading-none">Subscription</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 text-gray-950 px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Download size={16} className="text-gray-400" /> Export List
            </button>
         </div>
      </div>

      {/* TOP CONFIG TOGGLES */}
      <div className="flex flex-wrap gap-4">
        <ToggleSwitch 
          label="Enable Commission Only" 
          enabled={config.commissionOnly} 
          onToggle={() => handleToggle('commissionOnly')} 
        />
        <ToggleSwitch 
          label="Enable Subscription Only" 
          enabled={config.subscriptionOnly} 
          onToggle={() => handleToggle('subscriptionOnly')} 
        />
        <ToggleSwitch 
          label="Enable Subscription and Commission" 
          enabled={config.both} 
          onToggle={() => handleToggle('both')} 
        />
      </div>

      {/* LIST SECTION */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] font-black uppercase text-gray-400 tracking-widest">
              show 
              <select className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none text-gray-950 font-black cursor-pointer">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              entries
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Quick search..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-[12px] font-bold focus:bg-white focus:border-indigo-100 outline-none w-64 shadow-inner"
              />
            </div>
            <button className="bg-rose-500 text-white px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-md uppercase tracking-widest">
               <Filter size={16} /> Filters
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-950 text-white px-5 py-2.5 rounded-xl text-[12px] font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl uppercase tracking-widest"
            >
               <Plus size={16} /> Add Subscription
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Vehicle Type</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Zap size={48} strokeWidth={1.5} />
                      <p className="text-[16px] font-black uppercase tracking-widest text-gray-950">No Plans Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((item) => (
                  <tr key={item._id} className="group hover:bg-indigo-50/20 transition-all duration-300 cursor-pointer">
                    <td className="px-8 py-6">
                       <span className="text-[14px] font-black text-gray-950 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{item.name}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500">
                          <Car size={14} className="text-gray-300" /> {item.transport_type} ({item.vehicle_type_id})
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${item.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                          {item.active ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent">
                          <MoreHorizontal size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-gray-50/20 border-t border-gray-50 flex items-center justify-between">
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-950">1</span> to <span className="text-gray-950">{plans.length}</span> of <span className="text-gray-950">{plans.length}</span> entries
           </p>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-100 rounded-xl text-[11px] font-black text-gray-400 uppercase tracking-widest hover:bg-white disabled:opacity-50" disabled>Prev</button>
              <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-indigo-100">1</button>
              <button className="px-4 py-2 border border-gray-100 rounded-xl text-[11px] font-black text-gray-400 uppercase tracking-widest hover:bg-white disabled:opacity-50" disabled>Next</button>
           </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-indigo-950 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                   <Zap size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Create Subscription</h3>
                   <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1">Configure your new plan</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar grid grid-cols-2 gap-6">
              
              <div className="col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">How It Works</label>
                <textarea 
                  value={formData.how_it_works}
                  onChange={(e) => setFormData({...formData, how_it_works: e.target.value})}
                  placeholder="Describe the logic..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all min-h-[80px]"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Service Location (Area) *</label>
                <div className="relative">
                  <select 
                    value={formData.service_location_id}
                    onChange={(e) => setFormData({...formData, service_location_id: e.target.value})}
                    className="w-full h-12 pl-4 pr-10 bg-gray-50 border-none rounded-2xl text-[13px] font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                  >
                    <option value="">Select Area</option>
                    {areas.map(a => (
                      <option key={a._id} value={a._id}>{a.service_location_name || a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Transport Type</label>
                <div className="relative">
                  <select 
                    value={formData.transport_type}
                    onChange={(e) => setFormData({...formData, transport_type: e.target.value})}
                    className="w-full h-12 pl-4 pr-10 bg-gray-50 border-none rounded-2xl text-[13px] font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                  >
                    {transportTypes.map((t, idx) => (
                      <option key={idx} value={t.transport_type}>{t.transport_type.charAt(0).toUpperCase() + t.transport_type.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Vehicle Type</label>
                <div className="relative">
                  <select 
                    value={formData.vehicle_type_id}
                    onChange={(e) => setFormData({...formData, vehicle_type_id: e.target.value})}
                    className="w-full h-12 pl-4 pr-10 bg-gray-50 border-none rounded-2xl text-[13px] font-bold appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter Name"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Subscription Duration in Days *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <Clock size={16} />
                  </div>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Enter Days"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Amount *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300 uppercase">₹</div>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter Amount"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter details..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all min-h-[100px]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSubscription}
                disabled={saving}
                className="px-8 py-3 bg-indigo-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={14} />}
                Save Subscription
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverSubscriptions;
