import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  const [appName, setAppName] = useState('App');

  useEffect(() => {
    const title = document.title;
    if (title && title !== 'App') {
      setAppName(title);
    } else {
      setAppName('Appzeto');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col lg:flex-row font-sans selection:bg-gray-200 selection:text-black overflow-hidden">
      {/* Left side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F6F6F6] relative items-center justify-center p-12">
        <div className="absolute top-10 left-10">
          <span className="text-2xl font-black tracking-tighter text-black">{appName}</span>
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-black text-black leading-tight mb-4">
              Move the way <br/>you want.
            </h2>
            <p className="text-gray-600 text-xl font-medium mb-8">
              Fast, reliable and safe rides with {appName}.
            </p>
          </motion.div>
          
          <div className="w-full max-w-sm mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[32px] overflow-hidden p-2">
             <div className="bg-[#f0f0f0] rounded-[28px] aspect-square flex items-center justify-center">
                <span className="text-4xl font-black opacity-10">{appName}</span>
             </div>
          </div>
        </div>
        
        {/* Abstract subtle shapes */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gray-200/50 rounded-tl-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      </div>

      {/* Right side (Mobile-first login card) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden absolute top-8 left-0 right-0 flex flex-col items-center">
            <span className="text-2xl font-black tracking-tighter text-black">{appName}</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Smarter Urban Mobility — {appName}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mt-10 lg:mt-0"
        >
          {title && (
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-500 text-sm md:text-base font-medium mt-2">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </motion.div>
        
        {/* Helper footer link */}
        <div className="absolute bottom-8 text-center w-full max-w-md">
            <a href="#" className="text-gray-400 text-sm font-bold hover:text-black transition-colors">Need help?</a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
