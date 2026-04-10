import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Minus,
  Map as MapIcon
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const MapSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMapSettings();
      setSettings(res.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load Map settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      await adminService.updateMapSettings(settings);
      toast.success('Map configuration updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
      </div>
    );
  }

  const labelClass = "block text-[11px] font-black text-gray-700 mb-2 uppercase tracking-tight";
  const inputClass = "w-full border border-gray-200 rounded-md px-4 py-2.5 text-[13px] font-medium text-gray-600 outline-none focus:border-[#3F51B5] transition-all";

  const mapTypes = [
    { id: 'google_map', name: 'Google Map', image: 'https://images.livemint.com/img/2021/11/17/1600x900/Google_Maps_rebranded_logo_1637135111166_1637135111306.jpg' },
    { id: 'open_street', name: 'Open Street', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/OpenStreetMap_logo.svg' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Map Settings</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Map Settings</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Map Settings</span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Choose Map Type Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
           <h3 className="text-[14px] font-bold text-gray-700 mb-8 px-2">Choose Map Type</h3>
           <div className="flex flex-wrap gap-10 px-8">
              {mapTypes.map((map) => (
                <div 
                   key={map.id} 
                   onClick={() => updateField('map_type', map.id)}
                   className="w-[280px] bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center cursor-pointer hover:border-indigo-100 transition-all p-1"
                >
                   <div className="w-full h-40 bg-gray-50 flex items-center justify-center p-4">
                      <img src={map.image} alt={map.name} className="w-full h-full object-contain" />
                   </div>
                   <div className="p-4 w-full text-center border-t border-gray-50">
                      <p className="text-[12px] font-bold text-gray-600 mb-3">{map.name}</p>
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${settings.map_type === map.id ? 'border-[#00A99D] bg-white' : 'border-gray-200 bg-white'}`}>
                         {settings.map_type === map.id && <div className="w-2 h-2 rounded-full bg-[#00A99D]"></div>}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Google Map Apis Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
           <h3 className="text-[14px] font-bold text-gray-700 mb-8 px-2 border-b border-gray-50 pb-4">Google Map Apis</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 px-2">
              <div>
                 <label className={labelClass}>Google Map Key For Web Apps <span className="text-orange-500">*</span></label>
                 <input 
                  type="password"
                  className={inputClass}
                  value={settings.google_map_key_for_web_apps || ''}
                  onChange={(e) => updateField('google_map_key_for_web_apps', e.target.value)}
                  placeholder="***********************************"
                 />
              </div>

              <div>
                 <label className={labelClass}>Google Map Key For Translation and MyRoute</label>
                 <input 
                  type="password"
                  className={inputClass}
                  value={settings.google_map_key_for_distance_matrix || ''}
                  onChange={(e) => updateField('google_map_key_for_distance_matrix', e.target.value)}
                  placeholder="***********************************"
                 />
              </div>
           </div>

           <div className="flex justify-end mt-10 px-2">
              <button 
                onClick={handleUpdate}
                disabled={submitting}
                className="px-6 py-2 bg-[#3F51B5] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#303F9F] shadow-md transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Update'}
              </button>
           </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-12 h-12 bg-[#00A99D] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <Minus size={24} strokeWidth={3} className="rotate-90" />
      </button>

    </div>
  );
};

export default MapSettings;
