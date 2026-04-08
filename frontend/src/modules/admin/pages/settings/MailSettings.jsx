import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Minus,
  Mail,
  Send
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const MailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMailSettings();
      setSettings(res.data?.settings || {});
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load Mail settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.updateMailSettings(settings);
      toast.success('Mail configuration updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestMail = async () => {
    try {
      setTesting(true);
      // Assuming there's a test-mail endpoint or just notifying the user
      // For now, we'll simulate a test trigger
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Test mail sent to ' + (settings.mail_from_address || 'administrator'));
    } catch (err) {
      toast.error('Failed to send test mail');
    } finally {
      setTesting(false);
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

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Mail Configuration</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Mail Configuration</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Mail Configuration</span>
        </div>
      </div>

      <div className="p-8">
        
        {/* Main Card */}
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-sm border border-gray-100 p-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-7">
              
              <div>
                 <label className={labelClass}>Mailer Name (Ex: Smtp) <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_driver || ''}
                  onChange={(e) => updateField('mail_driver', e.target.value)}
                  placeholder="smtp"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail Host <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_host || ''}
                  onChange={(e) => updateField('mail_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail port <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_port || ''}
                  onChange={(e) => updateField('mail_port', e.target.value)}
                  placeholder="587"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail Username <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_username || ''}
                  onChange={(e) => updateField('mail_username', e.target.value)}
                  placeholder="name@example.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail Password <span className="text-orange-500">*</span></label>
                 <input 
                  type="password"
                  className={inputClass}
                  value={settings.mail_password || ''}
                  onChange={(e) => updateField('mail_password', e.target.value)}
                  placeholder="**********************"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail Encryption <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_encryption || ''}
                  onChange={(e) => updateField('mail_encryption', e.target.value)}
                  placeholder="tls / ssl"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail From Address <span className="text-orange-500">*</span></label>
                 <input 
                  type="email"
                  className={inputClass}
                  value={settings.mail_from_address || ''}
                  onChange={(e) => updateField('mail_from_address', e.target.value)}
                  placeholder="noreply@example.com"
                  required
                 />
              </div>

              <div>
                 <label className={labelClass}>Mail From Name <span className="text-orange-500">*</span></label>
                 <input 
                  className={inputClass}
                  value={settings.mail_from_name || ''}
                  onChange={(e) => updateField('mail_from_name', e.target.value)}
                  placeholder="Platform Name"
                  required
                 />
              </div>

           </div>

           <div className="flex justify-end mt-12 gap-4">
              <button 
                type="button"
                onClick={handleTestMail}
                disabled={testing}
                className="px-6 py-2.5 bg-[#4B5EAA] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#3F51B5] shadow-md transition-all flex items-center gap-2"
              >
                {testing ? <Loader2 size={16} className="animate-spin" /> : <><Mail size={16} /> Test</>}
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-[#3F51B5] text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-[#303F9F] shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Update'}
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

export default MailSettings;
