import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Smartphone, Camera, CheckCircle2 } from 'lucide-react';
import { userAuthService } from '../../services/authService';

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const avatarSrc = useMemo(() => {
    return (
      profileImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=E85D04&color=fff`
    );
  }, [name, profileImage]);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  const handlePickPhoto = () => {
    setPhotoError('');
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const uploadPayload = await userAuthService.uploadProfileImage(dataUrl);
      const secureUrl = uploadPayload?.data?.secureUrl || '';

      if (!secureUrl) {
        throw new Error('Upload failed');
      }

      setProfileImage(secureUrl);
      setSaveError('');

      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      } catch {
        stored = {};
      }
      localStorage.setItem('userInfo', JSON.stringify({ ...stored, profileImage: secureUrl }));

      const updated = await userAuthService.updateCurrentUser({ profileImage: secureUrl }).catch(() => null);
      const user = updated?.data?.user || null;
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
    } catch (err) {
      setPhotoError(err?.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      stored = {};
    }
    if (stored?.name) setName(stored.name);
    if (stored?.email) setEmail(stored.email);
    if (stored?.phone) setPhone(stored.phone);
    if (stored?.profileImage) setProfileImage(stored.profileImage);

    const loadProfile = async () => {
      try {
        const response = await userAuthService.getCurrentUser();
        const user = response?.data?.user || {};
        setName(user.name || stored?.name || '');
        setEmail(user.email || stored?.email || '');
        setPhone(user.phone || stored?.phone || '');
        setProfileImage(user.profileImage || stored?.profileImage || '');
        localStorage.setItem('userInfo', JSON.stringify(user));
      } catch {
        setName((prev) => prev || '');
        setEmail((prev) => prev || '');
        setPhone((prev) => prev || '');
        setProfileImage((prev) => prev || stored?.profileImage || '');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const response = await userAuthService.updateCurrentUser({
        name,
        email,
        profileImage,
      });
      const user = response?.data?.user || {};
      localStorage.setItem('userInfo', JSON.stringify(user));
      const basePath = window.location.pathname.startsWith('/taxi/user') ? '/taxi/user' : '';
      navigate(`${basePath}/profile`);
    } catch (err) {
      setSaveError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] max-w-lg mx-auto flex flex-col font-sans relative">
      <header className="bg-white px-5 py-8 flex items-center gap-6 border-b border-gray-50 shadow-sm sticky top-0 z-20">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-95 transition-all">
            <ArrowLeft size={24} className="text-gray-900" strokeWidth={3} />
         </button>
         <div>
            <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none uppercase tracking-widest text-xs opacity-50 mb-2">Settings</h1>
            <h2 className="text-[17px] font-black text-gray-900 leading-none">Your Profile</h2>
         </div>
      </header>

      <div className="flex-1 p-5 space-y-10 overflow-y-auto no-scrollbar">
         {/* AVATAR EDIT AREA */}
         <div className="flex flex-col items-center gap-4 py-4">
         <button
           type="button"
           onClick={handlePickPhoto}
           disabled={loading || photoUploading}
           className="relative group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
         >
            <div className="w-[100px] h-[100px] rounded-[40px] bg-white p-1 border-2 border-primary/20 shadow-xl overflow-hidden active:scale-95 transition-all">
               <img src={avatarSrc} className="w-full h-full rounded-[34px] object-cover" alt="User" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-2xl shadow-xl border border-gray-50 text-primary">
                  <Camera size={18} strokeWidth={3} />
               </div>
         </button>
         <input
           ref={fileInputRef}
           type="file"
           accept="image/*"
           capture="user"
           className="hidden"
           onChange={handlePhotoChange}
         />
         {photoUploading && <p className="text-[11px] font-bold text-gray-400">Uploading...</p>}
         {photoError && <p className="text-[11px] font-bold text-red-500">{photoError}</p>}
         </div>

         {/* FORM FIELDS - COMPACT */}
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
               <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-[28px] p-4 px-5 focus-within:border-primary transition-all shadow-sm">
                  <User size={18} className="text-gray-300" />
                  <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     disabled={loading}
                     className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-950 focus:outline-none"
                  />
                  <CheckCircle2 size={16} className="text-green-500" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
               <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-[28px] p-4 px-5 focus-within:border-primary transition-all shadow-sm">
                  <Mail size={18} className="text-gray-300" />
                  <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     disabled={loading}
                     className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-950 focus:outline-none"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[12px] font-black text-gray-400 ml-1 uppercase tracking-widest">Phone Number</label>
               <div className="flex items-center gap-4 bg-gray-50/50 border border-gray-50 rounded-[28px] p-4 px-5 shadow-sm opacity-80 cursor-not-allowed">
                  <Smartphone size={18} className="text-gray-300" />
                  <span className="flex-1 bg-transparent border-none text-[16px] font-black text-gray-400">
                    {phone ? `+91 ${phone}` : '+91'}
                  </span>
                  <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Verified</div>
               </div>
            </div>
         </div>
         {saveError && <p className="text-sm font-bold text-red-500 text-center">{saveError}</p>}
      </div>

      <div className="p-6 bg-white border-t border-gray-50 pb-10">
         <button 
            onClick={handleSave}
            disabled={loading || photoUploading || saving}
            className="w-full bg-[#1C2833] py-5 rounded-[28px] text-[18px] font-black text-white shadow-xl shadow-gray-200 active:bg-black transition-all"
         >
            {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
         </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
