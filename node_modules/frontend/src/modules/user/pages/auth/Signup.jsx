import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/AuthLayout';
import { User, Mail, Camera } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'prefer-not-to-say'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/'); // Go back to Home / App main
    }, 1200);
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
  }

  return (
    <AuthLayout 
      title="Complete your profile" 
      subtitle="Just a few details to get started"
    >
      <form onSubmit={handleSignup} className="space-y-8">
        {/* Avatar Placeholder */}
        <div className="flex flex-col items-center">
            <div className="relative group active:scale-95 transition-all">
                <div className="w-24 h-24 rounded-full bg-orange-50 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-primary/40" />
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-orange-600 transition-colors">
                    <Camera size={14} />
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">Upload Profile Photo</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
            <div className="bg-[#F6F7F9] rounded-2xl p-4 border border-transparent focus-within:ring-2 focus-within:ring-orange-200 focus-within:bg-white transition-all flex items-center gap-3">
              <User size={18} className="text-gray-300" />
              <input 
                type="text" 
                placeholder="Enter your name"
                className="w-full bg-transparent border-none text-[16px] font-black text-gray-900 placeholder:text-gray-300 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
            <div className="bg-[#F6F7F9] rounded-2xl p-4 border border-transparent focus-within:ring-2 focus-within:ring-orange-200 focus-within:bg-white transition-all flex items-center gap-3">
              <Mail size={18} className="text-gray-300" />
              <input 
                type="email" 
                placeholder="Enter email address"
                className="w-full bg-transparent border-none text-[16px] font-black text-gray-900 placeholder:text-gray-300 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
             <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                    <button
                        key={g}
                        type="button"
                        onClick={() => handleGenderChange(g.toLowerCase())}
                        className={`flex-1 py-3 rounded-xl text-[13px] font-black border-2 transition-all ${
                            formData.gender === g.toLowerCase() 
                            ? 'border-primary bg-orange-50 text-primary shadow-sm' 
                            : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                        {g}
                    </button>
                ))}
             </div>
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!formData.name || loading}
          className={`w-full py-4 rounded-full text-lg font-black shadow-lg transition-all flex items-center justify-center gap-3 mt-4 ${
            formData.name && !loading
            ? 'bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span>Let's Go!</span>
          )}
        </motion.button>

        <div className="text-center">
            <button 
                type="button"
                onClick={() => navigate('/')} 
                className="text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm underline underline-offset-4 decoration-dashed"
            >
                Skip for now
            </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
