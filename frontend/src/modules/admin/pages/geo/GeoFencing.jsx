import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  MapPin, 
  TrendingUp, 
  ShieldAlert, 
  Plus, 
  Settings2, 
  Clock, 
  Trash2, 
  Save,
  MousePointer2,
  Square
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const ZoneCard = ({ name, surge, status, type }) => (
  <div className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-3">
       <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-[13px] font-black text-gray-900 tracking-tight">{name}</span>
       </div>
       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${type === 'Main' ? 'bg-blue-50 text-blue-600' : 'bg-primary/10 text-primary'}`}>
         {type}
       </span>
    </div>
    <div className="flex items-center justify-between">
       <div className="text-left leading-tight">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Surge Multiplier</p>
          <div className="flex items-center gap-1.5">
             <TrendingUp size={14} className="text-primary" />
             <span className="text-[14px] font-black text-gray-900">{surge}x</span>
          </div>
       </div>
       <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
          <Settings2 size={16} />
       </button>
    </div>
  </div>
);

const GeoFencing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeZones, setActiveZones] = useState([]);

  React.useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await adminService.getZones();
        const zones = response?.data?.results || [];
        const mapped = zones.map(z => ({
          id: z._id,
          name: z.name || 'Unnamed Zone',
          surge: z.surge_multiplier || '1.0',
          status: z.status === 1 || z.status === 'active' || z.active ? 'Active' : 'Active', // Fallback to Active since usually returned means active
          type: z.type || 'Main'
        }));
        setActiveZones(mapped);
      } catch (err) {
         console.error('Failed to fetch zones', err);
      }
    };
    fetchZones();
  }, []);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar: Zone List & Controls */}
      <div className="w-80 shrink-0 flex flex-col space-y-6 overflow-y-auto no-scrollbar pb-10">
         <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Geo Fencing</h1>
            <p className="text-gray-400 font-bold text-[11px] mt-1 uppercase tracking-widest leading-none">Manage Operational Zones & Pricing</p>
         </div>

         <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4 shadow-sm">
            <button 
              onClick={() => setIsDrawing(!isDrawing)}
              className={`w-full py-3 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 transition-all shadow-lg ${
                isDrawing ? 'bg-red-500 text-white shadow-red-200' : 'bg-primary text-white shadow-primary/20'
              }`}
            >
              <Plus size={18} strokeWidth={3} /> {isDrawing ? 'CANCEL DRAWING' : 'CREATE NEW ZONE'}
            </button>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-500">
               <button className="flex items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"><Square size={14} /> Polygon</button>
               <button className="flex items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"><Square size={14} className="rounded-full" /> Radius</button>
            </div>
         </div>

         {/* Zone Search */}
         <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center">
            <input type="text" placeholder="Search zone..." className="w-full bg-transparent border-none text-[12px] font-bold px-3 py-1 focus:ring-0 placeholder:text-gray-300" />
            <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400">
               <MapPin size={14} />
            </div>
         </div>

         {/* Zone List */}
         <div className="flex-1 space-y-3">
             <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Zones ({activeZones.length})</span>
                <button className="text-[10px] font-bold text-primary uppercase">Refresh</button>
             </div>
             {activeZones.map((zone, idx) => (
                <ZoneCard key={idx} {...zone} />
             ))}
         </div>
      </div>

      {/* Main Area: Interactive Map Placeholder */}
      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative group">
         {/* Mock Map with "Zone Overlays" */}
         <div className="absolute inset-0 bg-[#0F172A] opacity-20"></div>
         <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=22.7196,75.8577&zoom=13&size=1200x800&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:geometry|color:0x212121&style=feature:water|color:0x000000')] bg-cover mix-blend-overlay"></div>
         
         {/* Mock Drawn Zones on Map */}
         {/* Indore Core */}
         <div className="absolute top-[30%] left-[40%] w-64 h-64 bg-blue-500/20 border-2 border-blue-500/50 rounded-full flex items-center justify-center animate-in zoom-in duration-1000">
            <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-xl">Indore Core</div>
         </div>

         {/* Vijay Nagar Surge Zone */}
         <div className="absolute top-[45%] left-[65%] w-48 h-32 bg-primary/20 border-2 border-primary/50 rotate-12 flex items-center justify-center animate-in zoom-in duration-700">
            <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-xl flex items-center gap-1">
               <TrendingUp size={10} /> 1.5x Surge
            </div>
         </div>

         {/* Rajwada Restricted Zone */}
         <div className="absolute bottom-[20%] left-[35%] w-32 h-32 bg-red-500/20 border-2 border-red-500/50 rounded-[40px] flex items-center justify-center animate-in scale-in duration-500">
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-xl flex items-center gap-1">
               <ShieldAlert size={10} /> Restricted
            </div>
         </div>

         {/* Top Map Controls */}
         <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-2xl flex flex-col items-center">
               <button className="p-2 border-b border-gray-100 text-gray-500 hover:text-black"><MousePointer2 size={18} /></button>
               <button className="p-2 text-primary bg-primary/10 rounded-lg"><MapIcon size={18} /></button>
               <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50"><Layers size={18} /></button>
            </div>
         </div>

         {/* Drawing UI Overlay if isDrawing is true */}
         {isDrawing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
               <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border-b-4 border-primary">
                  <div className="p-3 bg-primary/10 rounded-full text-primary rotate-12">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight">Zone Drawing Mode Active</h4>
                    <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Click on the map to start defining boundary points</p>
                  </div>
               </div>
               <div className="mt-8 flex gap-4 pointer-events-auto">
                  <button onClick={() => setIsDrawing(false)} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-black text-[14px] shadow-2xl border border-gray-100 hover:bg-gray-50">CANCEL</button>
                  <button className="bg-primary text-white px-10 py-3 rounded-xl font-black text-[14px] shadow-2xl shadow-primary/40 flex items-center gap-2">
                    <Save size={18} /> SAVE BOUNDARY
                  </button>
               </div>
            </div>
         )}

         {/* Live Fleet Statistics on Map */}
         <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-[28px] shadow-2xl flex items-center gap-6 border border-white">
            <div className="text-left leading-none border-r border-gray-200 pr-6">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Online</p>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <p className="text-[20px] font-black text-gray-900">124</p>
               </div>
            </div>
            <div className="text-left leading-none">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Surge Avg</p>
               <p className="text-[20px] font-black text-primary">1.2x</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GeoFencing;
