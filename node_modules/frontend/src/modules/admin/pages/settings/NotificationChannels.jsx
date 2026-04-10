import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  Loader2,
  Minus,
  Edit2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const NotificationChannels = () => {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'driver'
  const [submitting, setSubmitting] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getNotificationChannels();
      setChannels(res.data?.results || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load notification channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id, type, currentValue) => {
    try {
      const newValue = currentValue ? 1 : 0; // The logic in the service is (active ? 1 : 0)
      if (type === 'push') {
        await adminService.toggleChannelPush(id, !currentValue);
      } else {
        await adminService.toggleChannelMail(id, !currentValue);
      }
      
      setChannels(prev => prev.map(c => 
        c._id === id ? { ...c, [type === 'push' ? 'push_notification' : 'mail']: !currentValue } : c
      ));
      
      toast.success('Channel preference updated');
    } catch (err) {
      toast.error('Failed to update toggle');
    }
  };

  const filteredChannels = channels.filter(channel => 
    activeTab === 'user' ? channel.for_user : !channel.for_user
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      
      {/* Header Area */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm shrink-0">
        <h1 className="text-[14px] font-black text-gray-700 uppercase tracking-tight">Notification Channel</h1>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
           <span>Notification Channel</span>
           <ChevronRight size={12} className="text-gray-300" />
           <span className="text-gray-400">Notification Channel</span>
        </div>
      </div>

      <div className="p-8">
        
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">
           
           {/* Section Tabs */}
           <div className="p-6 border-b border-gray-100 flex items-center gap-1 bg-white">
              <button 
                onClick={() => setActiveTab('user')}
                className={`px-8 py-3 rounded text-[13px] font-bold transition-all ${activeTab === 'user' ? 'bg-[#EEEEEE] text-[#4B5EAA] shadow-inner' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Customers
              </button>
              <button 
                onClick={() => setActiveTab('driver')}
                className={`px-8 py-3 rounded text-[13px] font-bold transition-all ${activeTab === 'driver' ? 'bg-[#EEEEEE] text-[#4B5EAA] shadow-inner' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Driver
              </button>
           </div>

           {/* Table Header */}
           <div className="grid grid-cols-[1fr,160px,160px,160px,160px] bg-[#F9FAFB] border-b border-gray-100 px-8 py-4 text-[12px] font-bold text-gray-500 tracking-tight">
              <div>Topics</div>
              <div className="text-center">Push Notifications</div>
              <div className="text-center">Mail</div>
              <div className="text-center">Email Template</div>
              <div className="text-center">Push Template</div>
           </div>

           {/* Table Body */}
           <div className="divide-y divide-gray-100 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic font-medium">No notification channels configured for this segment</div>
              ) : (
                filteredChannels.map((channel) => (
                   <div key={channel._id} className="grid grid-cols-[1fr,160px,160px,160px,160px] px-8 py-7 items-center hover:bg-gray-50/30 transition-all border-b border-gray-50 last:border-0">
                      <div className="space-y-1">
                         <h4 className="text-[15px] font-black text-gray-800 tracking-tight">{channel.topic_name || channel.name}</h4>
                         <p className="text-[12px] font-medium text-gray-400 line-clamp-1">
                            {channel.description || `Choose how ${activeTab === 'user' ? 'Customer' : 'Driver'} will get notified about Sent notification on ${channel.name}`}
                         </p>
                      </div>

                      <div className="flex justify-center">
                         <label className="relative inline-flex items-center cursor-pointer scale-110">
                            <input 
                               type="checkbox" 
                               checked={channel.push_notification} 
                               onChange={() => handleToggle(channel._id, 'push', channel.push_notification)}
                               className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AC9F]"></div>
                         </label>
                      </div>

                      <div className="flex justify-center">
                         <label className="relative inline-flex items-center cursor-pointer scale-110">
                            <input 
                               type="checkbox" 
                               checked={channel.mail} 
                               onChange={() => handleToggle(channel._id, 'mail', channel.mail)}
                               className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AC9F]"></div>
                         </label>
                      </div>

                      <div className="flex justify-center">
                         <button onClick={() => toast.error('Template editor locked')} className="w-9 h-9 flex items-center justify-center bg-orange-50 text-[#FFB347] rounded hover:bg-orange-100 transition-all">
                            <Edit2 size={16} />
                         </button>
                      </div>

                      <div className="flex justify-center">
                         <button onClick={() => toast.error('Template editor locked')} className="w-9 h-9 flex items-center justify-center bg-orange-50 text-[#FFB347] rounded hover:bg-orange-100 transition-all">
                            <Edit2 size={16} />
                         </button>
                      </div>
                   </div>
                ))
              )}
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

export default NotificationChannels;
