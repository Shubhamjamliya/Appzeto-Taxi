import React, { useState } from 'react';
import Rydon24Logo from '../../../../assets/rydon24_logo.png';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Car, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

const AdminLogin = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // PRO-LEVEL: Call standardized service instead of fetch
      const data = await adminService.login({ email, password });
      console.log("Login Full Response:", data);

      if (data.success || data.access_token || data.token) {
        const token = data.access_token || data.token || data.data?.token;
        const admin = data.user || data.admin || data.data?.admin || data.data?.user;

        if (token) {
          // Store the token and admin info
          localStorage.setItem('adminToken', token);
          if (admin) localStorage.setItem('adminInfo', JSON.stringify(admin));
          
          // Navigation with a slight delay for better UX feel
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
        } else {
          setError('Authentication succeeded but no security token was received from server.');
        }
      } else {
        setError(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 md:p-6 font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-14 relative z-10 overflow-hidden"
      >
        {/* Progress Bar for Loading */}
        {isLoading && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="absolute top-0 left-0 h-1.5 bg-primary z-20"
          />
        )}

        <div className="flex flex-col items-center mb-10 text-center">
           <img 
              src={Rydon24Logo} 
              alt="RYDON24 Logo" 
              className="w-56 h-auto mb-8 object-contain drop-shadow-2xl cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
           />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <ShieldCheck size={16} className="text-primary" />
            <span className="text-gray-500 font-bold text-[11px] uppercase tracking-[2px]">Secure Access Terminal</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-bold leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all">
                  <Mail size={22} strokeWidth={2} />
               </div>
               <input 
                  type="email" 
                  placeholder="Official Email Address" 
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[16px] transition-all font-semibold placeholder:text-gray-300 outline-none"
               />
            </div>
            <div className="relative group">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all">
                  <Lock size={22} strokeWidth={2} />
               </div>
               <input 
                  type="password" 
                  placeholder="Security Access Token" 
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-3xl text-[16px] transition-all font-semibold placeholder:text-gray-300 outline-none"
               />
            </div>
          </div>

          <div className="flex items-center justify-between px-2 mb-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 transition-all"
              />
              <span className="text-[13px] font-bold text-gray-400 group-hover:text-gray-700 transition-colors">Trust this device</span>
            </label>
            <button type="button" className="text-[13px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">Need Help?</button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-primary/80' : 'bg-primary'} py-5 rounded-[24px] text-white font-black text-[18px] shadow-2xl shadow-primary/30 hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-[1px] transition-all flex items-center justify-center gap-3 mt-6`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Initialize Login <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>

        <div className="mt-14 pt-10 border-t border-gray-100 grid grid-cols-3 gap-4">
           <div className="text-center group cursor-default">
              <p className="text-[22px] font-black text-gray-900 leading-none group-hover:text-primary transition-colors">12.8k</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[1.5px]">Global Users</p>
           </div>
           <div className="text-center border-x border-gray-100 px-4 group cursor-default">
              <p className="text-[22px] font-black text-gray-900 leading-none group-hover:text-primary transition-colors">94%</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[1.5px]">Efficiency</p>
           </div>
           <div className="text-center group cursor-default">
              <p className="text-[22px] font-black text-gray-900 leading-none group-hover:text-primary transition-colors">24/7</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[1.5px]">Uptime</p>
           </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none px-6">
         <p className="text-[11px] font-bold text-gray-400 tracking-[3px] uppercase mb-2">RYDON24 Systems Enterprise © 2026</p>
         <p className="text-[10px] font-bold text-gray-300 max-w-xl mx-auto leading-relaxed">
           This terminal is strictly for authorized administrative use. Unauthorized access attempts are monitored and recorded.
         </p>
      </div>
    </div>
  );
};

export default AdminLogin;
