import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Minus,
  FileJson
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const FirebaseSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFirebaseSettings();
      setSettings(res.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load Firebase settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Use FormData if a file was selected, otherwise standard JSON
      let data = settings;
      if (selectedFile) {
        const formData = new FormData();
        Object.entries(settings).forEach(([key, val]) => formData.append(key, val));
        formData.append('firebase_json', selectedFile);
        data = formData;
      }

      await adminService.updateFirebaseSettings(data);
      toast.success('Firebase configuration updated successfully');
      fetchData();
      setSelectedFile(null);
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
  const inputClass = "w-full border border-gray-200 rounded-md px-4 py-2 text-[13px] font-medium text-gray-600 outline-none focus:border-[#3F51B5] transition-all";

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Firebases</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Firebases</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Firebases</span>
        </div>
      </div>

      <div className="p-8">
        
        {/* Main Card */}
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-100 p-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
              
              <div>
                 <label className={labelClass}>Firebase Database URL <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_database_url || ''}
                  onChange={(e) => updateField('firebase_database_url', e.target.value)}
                  placeholder="https://your-project.firebaseio.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase Api Key <span className="text-orange-500">*</span></label>
                 <input 
                  type="password"
                  className={inputClass}
                  value={settings.firebase_api_key || ''}
                  onChange={(e) => updateField('firebase_api_key', e.target.value)}
                  placeholder="***********************************"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase Auth Domain <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_auth_domain || ''}
                  onChange={(e) => updateField('firebase_auth_domain', e.target.value)}
                  placeholder="your-project.firebaseapp.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase Project ID <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_project_id || ''}
                  onChange={(e) => updateField('firebase_project_id', e.target.value)}
                  placeholder="your-project-id"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase Storage Bucket <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_storage_bucket || ''}
                  onChange={(e) => updateField('firebase_storage_bucket', e.target.value)}
                  placeholder="your-project.appspot.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase Messaging Sender ID <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_messaging_sender_id || ''}
                  onChange={(e) => updateField('firebase_messaging_sender_id', e.target.value)}
                  placeholder="xxxxxxxxxxxx"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase App ID <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.firebase_app_id || ''}
                  onChange={(e) => updateField('firebase_app_id', e.target.value)}
                  placeholder="1:xxxxxxxxx:web:xxxxxxxxxxxx"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Firebase JSON <span className="text-orange-500">*</span></label>
                 <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-between border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-all">
                       <span className="text-[13px] text-gray-400 font-medium truncate">
                          {selectedFile ? selectedFile.name : 'Choose File'}
                       </span>
                       <input 
                        type="file" 
                        className="hidden" 
                        accept=".json"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                       />
                       <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded">Browse</span>
                    </label>
                 </div>
                 {settings.firebase_json_name && (
                   <div className="mt-3 space-y-1">
                      <p className="text-[11px] font-black text-gray-500 tracking-tight">Existing File: <span className="text-gray-400">{settings.firebase_json_name}</span></p>
                      <p className="text-[11px] font-black text-[#00A99D] tracking-tight">{settings.firebase_json_name} Uploaded</p>
                   </div>
                 )}
              </div>

           </div>

           <div className="flex justify-end mt-12">
              <button 
                type="submit"
                disabled={submitting}
                className="px-10 py-3 bg-[#3F51B5] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#303F9F] shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
              </button>
           </div>
        </form>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-12 h-12 bg-[#00A99D] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <Minus size={24} strokeWidth={3} className="rotate-90" />
      </button>

    </div>
  );
};

export default FirebaseSettings;
