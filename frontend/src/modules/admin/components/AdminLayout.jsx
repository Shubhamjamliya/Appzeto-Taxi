import React, { useState } from 'react';
import Rydon24Logo from '../../../assets/rydon24_logo.png';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { socketService } from '../../../shared/api/socket';
import { 
  BarChart3, 
  Users, 
  Car, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  Search,
  IndianRupee,
  ShieldAlert,
  Layers,
  MapPin,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Package,
  Command,
  Gift,
  Briefcase,
  TrendingUp,
  Zap,
  Share2,
  FileText,
  ChevronDown as ChevronDownIcon,
  Smartphone,
  Settings2,
  PlusCircle,
  Monitor,
  ClipboardList,
  MessageCircle,
  Home,
  Plus,
  Clock,
  Wallet,
  UserCog,
  Globe,
  Star,
  ShieldCheck
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, isCollapsed }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/40' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    <Icon size={20} className="shrink-0" />
    {!isCollapsed && <span className="font-semibold text-[14px] tracking-tight">{label}</span>}
  </NavLink>
);

const SidebarGroup = ({ icon: Icon, label, subItems, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
          isOpen ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-semibold text-[14px] tracking-tight">{label}</span>}
        </div>
        {!isCollapsed && (
          <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        )}
      </button>
      
      {!isCollapsed && isOpen && (
        <div className="pl-12 pr-2 space-y-1 mt-1">
           {subItems.map((item, idx) => {
             if (item.subItems) {
               return <NestedGroup key={idx} {...item} />;
             }
             return (
               <NavLink
                 key={idx}
                 to={item.path}
                 className={({ isActive }) =>
                   `block px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                     isActive ? 'text-white bg-[#2563EB]/10' : 'text-gray-500 hover:text-gray-300'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <span className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#2563EB] scale-125' : 'bg-gray-600'}`}></div>
                      {item.label}
                   </span>
                 )}
               </NavLink>
             );
           })}
        </div>
      )}
    </div>
  );
};

const NestedGroup = ({ label, subItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
      >
        <span className="flex items-center gap-2 text-[12px] font-medium">
           <div className="w-1 h-1 rounded-full bg-gray-500"></div>
           {label}
        </span>
        <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="pl-4 space-y-1">
          {subItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                  isActive ? 'text-white bg-white/5' : 'text-gray-600 hover:text-gray-400'
                }`
              }
            >
              • {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  // Dynamic Page Title Resolver
  const getPageTitle = () => {
    const path = location.pathname;
    const allItems = [...homeItems, ...userItems, ...configurationItems, ...masterItems];
    
    // Check main items
    const directMatch = allItems.find(i => i.path === path);
    if (directMatch) return directMatch.label;

    // Check sub items (recursive-ish)
    for (const item of allItems) {
      if (item.subItems) {
        const subMatch = item.subItems.find(si => si.path === path);
        if (subMatch) return subMatch.label;
        
        // Check nested subs
        for (const sub of item.subItems) {
           if (sub.subItems) {
              const nestedMatch = sub.subItems.find(nsi => nsi.path === path);
              if (nestedMatch) return nestedMatch.label;
           }
        }
      }
    }

    // Default fallbacks for common segments
    if (path.includes('general')) return 'General Settings';
    if (path.includes('edit')) return 'Edit Data';
    if (path.includes('add') || path.includes('create')) return 'Add New';
    
    return 'RYDON24 Admin';
  };


  // Auth & Socket Check
  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && !window.location.pathname.includes('/admin/login')) {
      navigate('/admin/login');
      return;
    }

    if (token) {
      const socket = socketService.connect();
      
      // Global Admin Listeners
      socketService.on('new_sos', (data) => {
        console.log('🚨 SOS ALERT RECEIVED:', data);
        // Play sound or show high-priority modal
        alert(`🚨 SOS ALERT: Driver ${data.driver_name} is in trouble!`);
      });

      socketService.on('new_driver_registration', (data) => {
         setNotifications(prev => [{ id: Date.now(), title: 'New Driver', message: `${data.name} just registered.` }, ...prev]);
      });

      return () => {
        socketService.off('new_sos');
        socketService.off('new_driver_registration');
      };
    }
  }, [navigate]);

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };


  const homeItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: MessageCircle, label: 'Chat', path: '/admin/chat' },
    { 
       icon: TrendingUp, 
       label: 'Promotions Management', 
       subItems: [
         { label: 'Promo Code', path: '/admin/promotions/promo-codes' },
         { label: 'Send Notification', path: '/admin/promotions/send-notification' },
         { label: 'Banner Image', path: '/admin/promotions/banner-image' },
       ]
    },
    { 
       icon: IndianRupee, 
       label: 'Price Management', 
       subItems: [
         { label: 'Service Location', path: '/admin/pricing/service-location' },
         { label: 'Zone', path: '/admin/pricing/zone' },
         { label: 'Airport', path: '/admin/pricing/airport' },
         { label: 'Vehicle Type', path: '/admin/pricing/vehicle-type' },
         { label: 'Rental Package Types', path: '/admin/pricing/rental-packages' },
         { label: 'Set Price', path: '/admin/pricing/set-price' },
         { label: 'Goods Types', path: '/admin/pricing/goods-types' },
       ]
    },
    { 
       icon: MapPin, 
       label: 'Geofencing', 
       subItems: [
         { label: 'Heat Map', path: '/admin/geo/heatmap' },
         { label: 'God\'s Eye', path: '/admin/geo/gods-eye' },
         { label: 'Peak Zone', path: '/admin/geo/peak-zone' },
       ]
    },
    { icon: Car, label: 'Trip Requests', path: '/admin/trips' },
    { icon: Package, label: 'Delivery Requests', path: '/admin/deliveries' },
    { icon: Clock, label: 'Ongoing Requests', path: '/admin/ongoing' },
  ];

  const userItems = [
    { 
       icon: Users, 
       label: 'Customer Management', 
       subItems: [
         { label: 'User List', path: '/admin/users' },
         { label: 'Delete Request Users', path: '/admin/users/delete-requests' },
         { label: 'User Bulk Upload', path: '/admin/users/bulk-upload' },
       ]
    },
    { icon: Wallet, label: 'Add Wallet Payment', path: '/admin/wallet/payment' },
    { 
       icon: Car, 
       label: 'Driver Management', 
       subItems: [
         { label: 'Pending Drivers', path: '/admin/drivers/pending' },
         { label: 'Approved Drivers', path: '/admin/drivers' },
         { label: 'Subscription', path: '/admin/drivers/subscription' },
         { label: 'Drivers Ratings', path: '/admin/drivers/ratings' },
         { 
           label: 'Driver Wallet', 
           subItems: [
             { label: 'Withdrawal Requests', path: '/admin/drivers/wallet/withdrawals' },
             { label: 'Negative Balance Drivers', path: '/admin/drivers/wallet/negative' },
           ]
         },
         { label: 'Delete Request Drivers', path: '/admin/drivers/delete-requests' },
         { label: 'Driver Needed Documents', path: '/admin/drivers/documents' },
         { label: 'Driver Bulk Upload', path: '/admin/drivers/bulk-upload' },
         { label: 'Payment Methods', path: '/admin/drivers/payment-methods' },
         { label: 'Service Config', path: '/admin/drivers/service-config' },
       ]
    },
    { 
       icon: Share2, 
       label: 'Referral Management', 
       subItems: [
         { label: 'Referral Dashboard', path: '/admin/referrals/dashboard' },
         { label: 'User Referral Settings', path: '/admin/referrals/user-settings' },
         { label: 'Driver Referral Settings', path: '/admin/referrals/driver-settings' },
         { label: 'Joining Bonus Settings', path: '/admin/referrals/joining-bonus' },
         { label: 'Referral Translation', path: '/admin/referrals/translation' },
       ]
    },
    { 
      icon: UserCog, 
      label: 'Admin Management',
      subItems: [
        { label: 'Manage Admins', path: '/admin/management/admins' },
        { label: 'Admin Roles', path: '/admin/masters/roles' }, 
      ]
    },
    { 
       icon: Briefcase, 
       label: 'Owner Management', 
       subItems: [
         { label: 'Owner Dashboard', path: '/admin/owners/dashboard' },
         { label: 'Manage Owners', path: '/admin/owners' },
         { 
           label: 'Owner Wallet', 
           subItems: [
             { label: 'Withdrawal Requests', path: '/admin/owners/wallet/withdrawals' },
           ]
         },
         { 
           label: 'Fleet Management', 
           subItems: [
             { label: 'Fleet Drivers', path: '/admin/fleet/drivers' },
             { label: 'Blocked Fleet Drivers', path: '/admin/fleet/blocked' },
             { label: 'Fleet Needed Document', path: '/admin/fleet/documents' },
             { label: 'Manage Fleet', path: '/admin/fleet/manage' },
           ]
         },
         { label: 'Owner Needed Document', path: '/admin/owners/documents' },
         { label: 'Deleted Owners', path: '/admin/owners/deleted' },
         { label: 'Bookings', path: '/admin/owners/bookings' },
       ]
    },
    { 
       icon: FileText, 
       label: 'Report', 
       subItems: [
         { label: 'User Report', path: '/admin/reports/user' },
         { label: 'Driver Report', path: '/admin/reports/driver' },
         { label: 'Driver Duty Report', path: '/admin/reports/driver-duty' },
         { label: 'Owner Report', path: '/admin/reports/owner' },
         { label: 'Finance Report', path: '/admin/reports/finance' },
         { label: 'Fleet Finance Report', path: '/admin/reports/fleet-finance' },
       ]
    },
  ];

  const configurationItems = [
    {
      icon: Settings,
      label: 'Business Settings',
      subItems: [
        { label: 'General Settings', path: '/admin/settings/business/general' },
        { label: 'Customization Settings', path: '/admin/settings/business/customization' },
        { label: 'Transport Ride Settings', path: '/admin/settings/business/transport-ride' },
        { label: 'Bid Ride Settings', path: '/admin/settings/business/bid-ride' },
      ]
    },
    {
      icon: Smartphone,
      label: 'App settings',
      subItems: [
        { label: 'Wallet Settings', path: '/admin/settings/app/wallet' },
        { label: 'Tip Settings', path: '/admin/settings/app/tip' },
        { label: 'Country', path: '/admin/settings/app/country' },
        { label: 'App Modules', path: '/admin/settings/app/modules' },
        { label: 'Mobile App Landing/Onboard Screens Settings', path: '/admin/settings/app/onboard' },
      ]
    },
    {
      icon: Settings2,
      label: 'Third-party Settings',
      subItems: [
        { label: 'Payment Gateway Settings', path: '/admin/settings/third-party/payment' },
        { label: 'SMS Gateway Settings', path: '/admin/settings/third-party/sms' },
        { label: 'Firebase Settings', path: '/admin/settings/third-party/firebase' },
        { label: 'Map and Map APIs Settings', path: '/admin/settings/third-party/map-apis' },
        { label: 'Mail Configuration', path: '/admin/settings/third-party/mail' },
        { label: 'Notification Channel', path: '/admin/settings/third-party/notification-channel' },
      ]
    },
    { 
      icon: PlusCircle, 
      label: 'Addons',
      subItems: [
        { label: 'Dispatcher Addons', path: '/admin/settings/addons/dispatcher' },
      ]
    },
    { 
      icon: Monitor, 
      label: 'CMS-Landing Website',
      subItems: [
        { label: 'Header-Footer', path: '/admin/settings/cms/header-footer' },
        { label: 'Home', path: '/admin/settings/cms/home' },
        { label: 'About Us', path: '/admin/settings/cms/about' },
        { label: 'Driver', path: '/admin/settings/cms/driver' },
        { label: 'User', path: '/admin/settings/cms/user' },
        { label: 'Contact', path: '/admin/settings/cms/contact' },
        { label: 'Privacy Policy, T&C and DMV', path: '/admin/settings/cms/legal' },
      ]
    },
  ];

  const masterItems = [
    { icon: Globe, label: 'Language', path: '/admin/masters/languages' },
    { icon: Star, label: 'Preferences', path: '/admin/masters/preferences' },
    { icon: ShieldCheck, label: 'Roles', path: '/admin/masters/roles' },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 overflow-hidden">
      <aside 
        className={`bg-[#0F172A] transition-all duration-500 flex flex-col relative z-50 h-screen overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Top Profile */}
          <div className="h-24 flex items-center px-6 border-b border-white/5 mb-4 group/sidebar-head">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 p-1 flex items-center justify-center group-hover:scale-105 transition-all border border-white/5">
                   <img src={Rydon24Logo} alt="RYDON24" className="w-10 h-10 object-contain" />
                </div>
                {!isCollapsed && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                      <h3 className="text-[15px] font-black text-white leading-tight">Super Admin</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                         <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                            <Zap size={10} className="text-[#0F172A]" fill="currentColor" />
                         </div>
                         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Super Admin</span>
                      </div>
                   </motion.div>
                )}
             </div>
             <button 
              onClick={() => setCollapsed(!isCollapsed)} 
              className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-blue-900/30 border border-white/10 hidden lg:flex absolute -right-4 top-10 z-50 ring-4 ring-[#0F172A]"
             >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
             </button>
          </div>

          <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto no-scrollbar scroll-smooth pb-12">
            <div className={`mt-8 mb-3 px-4 py-2 bg-white/5 rounded-xl text-[11px] font-black text-white/70 tracking-[2px] uppercase ${isCollapsed ? 'opacity-0' : ''}`}>
               Home
            </div>
            {homeItems.map((item, idx) => (
              item.subItems ? (
                <SidebarGroup key={idx} {...item} isCollapsed={isCollapsed} />
              ) : (
                <SidebarItem key={idx} {...item} isCollapsed={isCollapsed} />
              )
            ))}

            <div className={`mt-8 mb-3 px-4 py-2 bg-white/5 rounded-xl text-[11px] font-black text-white/70 tracking-[2px] uppercase ${isCollapsed ? 'opacity-0' : ''}`}>
               Users
            </div>
            {userItems.map((item, idx) => (
              item.subItems ? (
                <SidebarGroup key={idx} {...item} isCollapsed={isCollapsed} />
              ) : (
                <SidebarItem key={idx} {...item} isCollapsed={isCollapsed} />
              )
            ))}

            <div className={`mt-8 mb-3 px-4 py-2 bg-white/5 rounded-xl text-[11px] font-black text-white/70 tracking-[2px] uppercase ${isCollapsed ? 'opacity-0' : ''}`}>
               Masters
            </div>
            {masterItems.map((item, idx) => (
              item.subItems ? (
                <SidebarGroup key={idx} {...item} isCollapsed={isCollapsed} />
              ) : (
                <SidebarItem key={idx} {...item} isCollapsed={isCollapsed} />
              )
            ))}

            <div className={`mt-8 mb-3 px-4 py-2 bg-white/5 rounded-xl text-[11px] font-black text-white/70 tracking-[2px] uppercase ${isCollapsed ? 'opacity-0' : ''}`}>
               Settings
            </div>
            {configurationItems.map((item, idx) => (
              item.subItems ? (
                <SidebarGroup key={idx} {...item} isCollapsed={isCollapsed} />
              ) : (
                <SidebarItem key={idx} {...item} isCollapsed={isCollapsed} />
              )
            ))}

          </nav>

        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f0f4f8]">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#2563EB] rounded-full mr-1"></div>
             <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-widest">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 mr-4 pr-4 border-r border-gray-100 leading-none">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Search size={18} /></button>
                <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><Zap size={18} /></button>
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Bell size={18} /></button>
             </div>
             <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-100 cursor-pointer transition-all group relative">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all"><Users size={14} /></div>
                <span className="text-[11px] font-black text-gray-950">Admin</span>
                <ChevronDownIcon size={14} className="text-gray-300" />
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right group-hover:scale-100 scale-95 z-50 p-2">
                   <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <LogOut size={16} />
                     <span className="text-[12px] font-bold">Logout Session</span>
                   </button>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
