import React, { useEffect, useMemo, useState } from 'react';
import Rydon24Logo from '../../../assets/rydon24_logo.png';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { socketService } from '../../../shared/api/socket';
import {
  BarChart3,
  Bell,
  Briefcase,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Home,
  IndianRupee,
  Layers,
  LogOut,
  MapPin,
  MessageCircle,
  Monitor,
  Package,
  PlusCircle,
  Search,
  Settings,
  Settings2,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

const ADMIN_MODE = 'admin';
const OWNER_MODE = 'owner';
const MODE_STORAGE_KEY = 'adminPanelMode';

const pathMatches = (pathname, targetPath) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const hasActiveChild = (pathname, items = []) =>
  items.some((item) => {
    if (item.path && pathMatches(pathname, item.path)) return true;
    if (item.subItems) return hasActiveChild(pathname, item.subItems);
    return false;
  });

const flattenItems = (sections = []) =>
  sections.flatMap((section) => section.items ?? []);

const resolvePageTitle = (pathname, sections) => {
  const findLabel = (items = []) => {
    for (const item of items) {
      if (item.path && pathMatches(pathname, item.path)) return item.label;
      if (item.subItems) {
        const nested = findLabel(item.subItems);
        if (nested) return nested;
      }
    }
    return null;
  };

  const label = findLabel(flattenItems(sections));
  if (label) return label;
  if (pathname.includes('/owners')) return 'Owner Management';
  if (pathname.includes('/fleet')) return 'Fleet Management';
  if (pathname.includes('/settings')) return 'Settings';
  if (pathname.includes('/reports')) return 'Reports';
  if (pathname.includes('/drivers')) return 'Driver Management';
  return 'RYDON24 Admin';
};

const SidebarItem = ({ icon: Icon, label, path, isCollapsed }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    <Icon size={20} className="shrink-0" />
    {!isCollapsed && <span className="font-semibold text-[14px] tracking-tight">{label}</span>}
  </NavLink>
);

const SidebarGroup = ({ icon: Icon, label, subItems, isCollapsed, pathname, forceOpen = false }) => {
  const isActive = hasActiveChild(pathname, subItems);
  const [isOpen, setIsOpen] = useState(forceOpen || isActive);

  useEffect(() => {
    if (forceOpen || isActive) {
      setIsOpen(true);
    }
  }, [forceOpen, isActive]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
          isActive || isOpen ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <div className="pl-6 pr-2 space-y-1">
          {subItems.map((item) =>
            item.subItems ? (
              <NestedGroup
                key={item.label}
                label={item.label}
                subItems={item.subItems}
                pathname={pathname}
                forceOpen={forceOpen}
              />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: childActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    childActive ? 'text-white bg-[#2563EB]/10' : 'text-gray-400 hover:text-gray-200'
                  }`
                }
              >
                {({ isActive: childActive }) => (
                  <>
                    <span className={`h-2.5 w-2.5 rounded-full ${childActive ? 'bg-[#5B7CFF]' : 'bg-gray-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  );
};

const NestedGroup = ({ label, subItems, pathname, forceOpen = false }) => {
  const isActive = hasActiveChild(pathname, subItems);
  const [isOpen, setIsOpen] = useState(forceOpen || isActive);

  useEffect(() => {
    if (forceOpen || isActive) {
      setIsOpen(true);
    }
  }, [forceOpen, isActive]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
          isActive || isOpen ? 'text-white bg-white/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
      >
        <span className="flex items-center gap-3 text-[12px] font-medium">
          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#5B7CFF]' : 'bg-gray-500'}`} />
          <span>{label}</span>
        </span>
        <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="pl-5 space-y-1">
          {subItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: childActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                  childActive ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {({ isActive: childActive }) => (
                <>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${childActive ? 'bg-[#7C93FF]' : 'bg-gray-600'}`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const ModeSwitcher = ({ mode, setMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: ADMIN_MODE, label: 'Admin', subtitle: 'Core control panel' },
    { id: OWNER_MODE, label: 'Owner', subtitle: 'Owner management modules' },
  ];

  const active = options.find((option) => option.id === mode) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:border-[#2D3A6E]/30 hover:bg-slate-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2D3A6E]">
          <Briefcase size={16} />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Mode</p>
          <p className="text-[12px] font-black text-gray-900">{active.label}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {options.map((option) => {
            const selected = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setMode(option.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                  selected ? 'bg-[#2D3A6E] text-white' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    selected ? 'bg-white' : option.id === OWNER_MODE ? 'bg-[#2D3A6E]' : 'bg-[#2563EB]'
                  }`}
                />
                <span className="flex-1">
                  <span className={`block text-[12px] font-black ${selected ? 'text-white' : 'text-gray-900'}`}>
                    {option.label}
                  </span>
                  <span className={`block text-[11px] ${selected ? 'text-white/70' : 'text-gray-500'}`}>
                    {option.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen] = useState(true);
  const [isCollapsed, setCollapsed] = useState(false);
  const [mode, setModeState] = useState(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === ADMIN_MODE || savedMode === OWNER_MODE) {
      return savedMode;
    }
    return OWNER_MODE;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const adminSections = useMemo(
    () => [
      {
        title: 'Home',
        items: [
          { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: MessageCircle, label: 'Chat', path: '/admin/chat' },
          {
            icon: TrendingUp,
            label: 'Promotions Management',
            subItems: [
              { label: 'Promo Code', path: '/admin/promotions/promo-codes' },
              { label: 'Send Notification', path: '/admin/promotions/send-notification' },
              { label: 'Banner Image', path: '/admin/promotions/banner-image' },
            ],
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
            ],
          },
          {
            icon: MapPin,
            label: 'Geofencing',
            subItems: [
              { label: 'Heat Map', path: '/admin/geo/heatmap' },
              { label: "God's Eye", path: '/admin/geo/gods-eye' },
              { label: 'Peak Zone', path: '/admin/geo/peak-zone' },
            ],
          },
          { icon: Car, label: 'Trip Requests', path: '/admin/trips' },
          { icon: Package, label: 'Delivery Requests', path: '/admin/deliveries' },
          { icon: Clock, label: 'Ongoing Requests', path: '/admin/ongoing' },
        ],
      },
      {
        title: 'Users',
        items: [
          {
            icon: Users,
            label: 'Customer Management',
            subItems: [
              { label: 'User List', path: '/admin/users' },
              { label: 'Delete Request Users', path: '/admin/users/delete-requests' },
              { label: 'User Bulk Upload', path: '/admin/users/bulk-upload' },
            ],
          },
          { icon: Wallet, label: 'Payment History', path: '/admin/wallet/payment' },
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
                ],
              },
              { label: 'Delete Request Drivers', path: '/admin/drivers/delete-requests' },
              { label: 'Driver Needed Documents', path: '/admin/drivers/documents' },
              { label: 'Driver Bulk Upload', path: '/admin/drivers/bulk-upload' },
              { label: 'Payment Methods', path: '/admin/drivers/payment-methods' },
              { label: 'Service Config', path: '/admin/drivers/service-config' },
            ],
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
            ],
          },
          {
            icon: UserCog,
            label: 'Admin Management',
            subItems: [
              { label: 'Manage Admins', path: '/admin/management/admins' },
              { label: 'Admin Roles', path: '/admin/masters/roles' },
            ],
          },
          { icon: Briefcase, label: 'Owner Management', path: '/admin/owners/dashboard' },
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
            ],
          },
        ],
      },
      {
        title: 'Masters',
        items: [
          { icon: Globe, label: 'Language', path: '/admin/masters/languages' },
          { icon: Star, label: 'Preferences', path: '/admin/masters/preferences' },
          { icon: ShieldCheck, label: 'Roles', path: '/admin/masters/roles' },
        ],
      },
      {
        title: 'Settings',
        items: [
          {
            icon: Settings,
            label: 'Business Settings',
            subItems: [
              { label: 'General Settings', path: '/admin/settings/business/general' },
              { label: 'Customization Settings', path: '/admin/settings/business/customization' },
              { label: 'Transport Ride Settings', path: '/admin/settings/business/transport-ride' },
              { label: 'Bid Ride Settings', path: '/admin/settings/business/bid-ride' },
            ],
          },
          {
            icon: Smartphone,
            label: 'App Settings',
            subItems: [
              { label: 'Wallet Settings', path: '/admin/settings/app/wallet' },
              { label: 'Tip Settings', path: '/admin/settings/app/tip' },
              { label: 'Country', path: '/admin/settings/app/country' },
              { label: 'App Modules', path: '/admin/settings/app/modules' },
              { label: 'Mobile App Landing/Onboard Screens Settings', path: '/admin/settings/app/onboard' },
            ],
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
            ],
          },
          {
            icon: PlusCircle,
            label: 'Addons',
            subItems: [{ label: 'Dispatcher Addons', path: '/admin/settings/addons/dispatcher' }],
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
            ],
          },
        ],
      },
    ],
    []
  );

  const ownerSections = useMemo(
    () => [
      {
        title: 'Owner Mode',
        items: [
          {
            icon: Briefcase,
            label: 'Owner Management',
            subItems: [
              { label: 'Owner Dashboard', path: '/admin/owners/dashboard' },
              { label: 'Manage Owners', path: '/admin/owners' },
              {
                label: 'Owner Wallet',
                subItems: [{ label: 'Withdrawal Requests', path: '/admin/owners/wallet/withdrawals' }],
              },
              {
                label: 'Fleet Management',
                subItems: [
                  { label: 'Fleet Drivers', path: '/admin/fleet/drivers' },
                  { label: 'Pending Fleet Drivers', path: '/admin/fleet/blocked' },
                  { label: 'Fleet Needed Document', path: '/admin/fleet/documents' },
                  { label: 'Manage Fleet', path: '/admin/fleet/manage' },
                ],
              },
              { label: 'Owner Needed Document', path: '/admin/owners/documents' },
              { label: 'Deleted Owners', path: '/admin/owners/deleted' },
              { label: 'Bookings', path: '/admin/owners/bookings' },
            ],
          },
        ],
      },
    ],
    []
  );

  const sidebarSections = mode === OWNER_MODE ? ownerSections : adminSections;
  const pageTitle = resolvePageTitle(location.pathname, sidebarSections);
  const isOwnerRoute = location.pathname.startsWith('/admin/owners') || location.pathname.startsWith('/admin/fleet');

  const setMode = (nextMode) => {
    setModeState(nextMode);
    localStorage.setItem(MODE_STORAGE_KEY, nextMode);

    if (nextMode === OWNER_MODE && !isOwnerRoute) {
      navigate('/admin/owners/dashboard');
    }

    if (nextMode === ADMIN_MODE && isOwnerRoute) {
      navigate('/admin/dashboard');
    }
  };

  useEffect(() => {
    if (isOwnerRoute && mode !== OWNER_MODE) {
      setModeState(OWNER_MODE);
      localStorage.setItem(MODE_STORAGE_KEY, OWNER_MODE);
    }
  }, [isOwnerRoute, mode]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && !window.location.pathname.includes('/admin/login')) {
      navigate('/admin/login');
      return undefined;
    }

    if (!token) return undefined;

    socketService.connect();

    socketService.on('new_sos', (data) => {
      console.log('SOS ALERT RECEIVED:', data);
      alert(`SOS ALERT: Driver ${data.driver_name} is in trouble!`);
    });

    socketService.on('new_driver_registration', (data) => {
      console.log('New driver registration:', data);
    });

    return () => {
      socketService.off('new_sos');
      socketService.off('new_driver_registration');
    };
  }, [navigate]);

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">
      <aside
        className={`relative z-50 flex h-screen flex-col overflow-hidden bg-[#0F172A] transition-all duration-500 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          <div className="group/sidebar-head relative mb-4 flex h-24 items-center border-b border-white/5 px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 p-1 transition-all group-hover/sidebar-head:scale-105">
                <img src={Rydon24Logo} alt="RYDON24" className="h-10 w-10 object-contain" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-black leading-tight text-white">
                    {mode === OWNER_MODE ? 'Owner Panel' : 'Super Admin'}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400">
                      <Zap size={10} className="text-[#0F172A]" fill="currentColor" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {mode === OWNER_MODE ? 'Owner Modules' : 'Super Admin'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="absolute -right-4 top-10 z-50 hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#2563EB] text-white shadow-lg shadow-blue-900/30 ring-4 ring-[#0F172A] transition-all hover:scale-110 active:scale-95 lg:flex"
            >
              {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
            </button>
          </div>

          <nav className="no-scrollbar mt-2 flex-1 space-y-1.5 overflow-y-auto px-4 pb-12 scroll-smooth">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <div
                  className={`mb-3 mt-8 rounded-xl bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[2px] text-white/70 ${
                    isCollapsed ? 'opacity-0' : ''
                  }`}
                >
                  {section.title}
                </div>
                {section.items.map((item) =>
                  item.subItems ? (
                    <SidebarGroup
                      key={item.label}
                      {...item}
                      forceOpen={mode === OWNER_MODE}
                      isCollapsed={isCollapsed}
                      pathname={location.pathname}
                    />
                  ) : (
                    <SidebarItem key={item.path} {...item} isCollapsed={isCollapsed} />
                  )
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f0f4f8]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="mr-1 h-6 w-1.5 rounded-full bg-[#2563EB]" />
            <h2 className="text-[15px] font-black uppercase tracking-widest text-slate-800">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <ModeSwitcher mode={mode} setMode={setMode} />

            <div className="mr-1 flex items-center gap-1 border-r border-gray-100 pr-4 leading-none">
              <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-600">
                <Search size={18} />
              </button>
              <button className="rounded-lg p-2 text-emerald-500 transition-all hover:bg-emerald-50">
                <Zap size={18} />
              </button>
              <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-600">
                <Bell size={18} />
              </button>
            </div>

            <div className="group relative flex cursor-pointer items-center gap-3 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 transition-all hover:bg-gray-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-all group-hover:bg-primary group-hover:text-white">
                <Users size={14} />
              </div>
              <span className="text-[11px] font-black text-gray-950">Admin</span>
              <ChevronDown size={14} className="text-gray-300" />

              <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-48 scale-95 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-all hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span className="text-[12px] font-bold">Logout Session</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="no-scrollbar flex-1 overflow-y-auto p-4 scroll-smooth lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
