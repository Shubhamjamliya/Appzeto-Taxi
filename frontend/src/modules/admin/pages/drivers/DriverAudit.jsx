import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Maximize2, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  Calendar, 
  AlertCircle,
  Eye,
  MessageSquare,
  ChevronRight,
  MoreHorizontal,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const DriverAudit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDriverData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDriver(data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch driver audit data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status === 'approve' ? 'APPROVE' : 'REJECT'} this driver?`)) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://taxi-a276.onrender.com/api/v1/admin/drivers/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active: status === 'approve',
          approve: status === 'approve'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(status === 'approve' ? 'Driver Approved Successfully' : 'Driver Rejected');
        navigate('/admin/drivers');
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error - please check your connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Accessing Verification Portal...</p>
      </div>
    );
  }

  if (!driver) return null;

  // Map backend documents to the checklist format
  const mappedDocs = [
    { 
      id: 'aadhar', 
      name: 'Aadhar card', 
      number: driver.aadhar_number || 'N/A', 
      expiry: 'N/A', 
      status: driver.aadhar_verified ? 'Verified' : 'Pending', 
      comment: driver.aadhar_comment || 'N/A', 
      image: driver.user_id?.aadhar_image || null 
    },
    { 
      id: 'dl', 
      name: 'Driving License', 
      number: driver.license_number || 'N/A', 
      expiry: driver.license_expiry || 'N/A', 
      status: driver.license_verified ? 'Verified' : 'Pending', 
      comment: driver.license_comment || 'N/A', 
      image: driver.user_id?.license_image || 'https://images.unsplash.com/photo-1590483734724-383b85ad92e0?q=80&w=400' 
    },
    { 
      id: 'rc', 
      name: 'Vehicle RC Card', 
      number: driver.car_number || 'N/A', 
      expiry: 'N/A', 
      status: driver.rc_verified ? 'Verified' : 'Pending', 
      comment: driver.rc_comment || 'N/A', 
      image: driver.car_image || 'https://images.unsplash.com/photo-1627389955609-bf0114085512?q=80&w=400' 
    },
    { 
      id: 'insurance', 
      name: 'Commercial Insurance', 
      number: 'INS-' + (driver._id?.slice(-5) || 'N/A'), 
      expiry: 'N/A', 
      status: driver.insurance_verified ? 'Verified' : 'Pending', 
      comment: 'N/A', 
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400' 
    },
    { 
      id: 'selfie', 
      name: 'Profile Selfie', 
      number: 'N/A', 
      expiry: 'N/A', 
      status: 'Verified', 
      comment: 'Identity Match', 
      image: driver.user_id?.profile_picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20 font-sans text-gray-950">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/admin/drivers/pending')} className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500 transition-all shadow-sm">
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">AUDIT DRIVER APPLICATION</h1>
             <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
                <span>Fleet Control</span>
                <ChevronRight size={12} />
                <span>Verification</span>
                <ChevronRight size={12} />
                <span className="text-indigo-600">Audit {driver.name || driver.user_id?.name}</span>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             disabled={isSubmitting}
             onClick={() => handleUpdateStatus('reject')}
             className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-2.5 rounded-xl text-[13px] font-black hover:bg-rose-100 transition-all flex items-center gap-2 disabled:opacity-50"
           >
             <XCircle size={18} /> REJECT
           </button>
           <button 
             disabled={isSubmitting}
             onClick={() => handleUpdateStatus('approve')}
             className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-[13px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
           >
             <ShieldCheck size={18} /> APPROVE DRIVER
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
         {/* Left Column: Driver Info */}
         <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 grayscale -rotate-12 translate-x-4"><Car size={100} /></div>
               <div className="relative w-28 h-28 mx-auto mb-6 ring-4 ring-gray-50 rounded-full shadow-2xl overflow-hidden group-hover:scale-105 transition-transform">
                 <img src={driver.user_id?.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="Driver" />
                 <div className="absolute bottom-1 right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                    <ShieldCheck size={12} />
                 </div>
               </div>
               <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">{driver.name || driver.user_id?.name}</h3>
               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">{driver._id}</p>
               
               <div className="mt-8 space-y-4 text-left border-t border-gray-50 pt-8">
                  {[
                    { icon: Phone, label: 'Phone', val: driver.mobile || driver.user_id?.mobile || 'N/A' },
                    { icon: Mail, label: 'Email', val: driver.user_id?.email || 'N/A' },
                    { icon: MapPin, label: 'City', val: driver.city || driver.service_location?.name || 'Global' },
                    { icon: Car, label: 'Vehicle', val: `${driver.transport_type} (${driver.car_number})` },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-gray-400">
                          <item.icon size={13} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                       </div>
                       <p className="text-[13px] font-bold text-gray-700 ml-5">{item.val}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Audit Status Placeholder */}
            <div className="bg-gray-950 rounded-[32px] p-8 text-white space-y-6 shadow-2xl">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Compliance Check</h4>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Documents', status: 'In Review', color: 'text-amber-400' },
                    { label: 'Background', status: 'Verified', color: 'text-emerald-400' },
                    { label: 'Face Auth', status: 'Passed', color: 'text-emerald-400' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[12px] font-bold text-gray-400">{step.label}</span>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${step.color}`}>{step.status}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column: Simple Form / Document Table */}
         <div className="col-span-12 lg:col-span-9 space-y-4">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">Document Audit Checklist</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-400">
                     Total Items: {mappedDocs.length}
                  </div>
               </div>
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                           <th className="px-6 py-5">Document Name</th>
                           <th className="px-5 py-5">Identify Number</th>
                           <th className="px-5 py-5">Expiry Date</th>
                           <th className="px-5 py-5 text-center">Status</th>
                           <th className="px-5 py-5">Comment</th>
                           <th className="px-5 py-5 text-center">Document</th>
                           <th className="px-6 py-5 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {mappedDocs.map((doc) => (
                           <tr key={doc.id} className="group hover:bg-gray-50/30 transition-all">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${doc.status === 'Not Uploaded' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                       <FileText size={14} />
                                    </div>
                                    <span className="text-[13px] font-black text-gray-950 tracking-tight">{doc.name}</span>
                                 </div>
                              </td>
                              <td className="px-5 py-5 text-[12px] font-bold text-gray-500">
                                 {doc.number}
                              </td>
                              <td className="px-5 py-5 text-[12px] font-bold text-gray-500">
                                 {doc.expiry}
                              </td>
                              <td className="px-5 py-5 text-center">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                    doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    doc.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                    doc.status === 'Not Uploaded' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-rose-50 text-rose-600 border-rose-100'
                                 }`}>
                                    {doc.status}
                                 </span>
                              </td>
                              <td className="px-5 py-5">
                                 <p className="text-[12px] font-bold text-gray-400 italic truncate max-w-[150px]">{doc.comment}</p>
                              </td>
                              <td className="px-5 py-5 text-center">
                                 {doc.image ? (
                                    <div className="relative inline-block group/img">
                                       <img src={doc.image} className="w-10 h-7 object-cover rounded shadow-sm border border-gray-200" alt="doc preview" />
                                       <button className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded">
                                          <Maximize2 size={10} className="text-white" />
                                       </button>
                                    </div>
                                 ) : (
                                    <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">Missing</span>
                                 )}
                              </td>
                              <td className="px-6 py-5 text-right">
                                 <div className="flex items-center justify-end gap-1">
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title="View Details">
                                       <Eye size={16} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-white rounded-lg transition-all" title="Quick Verify">
                                       <CheckCircle2 size={16} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all" title="Add Note/Reject">
                                       <MessageSquare size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Quick Actions Footer Card */}
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-500">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[14px] font-black text-gray-950 uppercase tracking-widest">Batch Actions</p>
                     <p className="text-[12px] font-bold text-gray-400">Verifying multiple documents at once speeds up the process.</p>
                  </div>
               </div>
               <button className="px-6 py-3 bg-white border border-gray-100 text-gray-950 text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                  RE-AUDIT ALL DOCUMENTS
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DriverAudit;
