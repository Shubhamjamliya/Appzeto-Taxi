import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  User, 
  Truck, 
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  History,
  Send
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const WalletPayment = () => {
  const [role, setRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  
  // Adjustment Form
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('credit');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3 && role) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, role]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      let res;
      if (role === 'user') res = await adminService.searchUsers(searchQuery);
      else if (role === 'driver') res = await adminService.searchDrivers(searchQuery);
      else if (role === 'owner') res = await adminService.searchOwners(searchQuery);
      
      setSearchResults(res.data.results || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const fetchHistory = async (entity) => {
    setLoadingHistory(true);
    try {
      let res;
      if (role === 'user') res = await adminService.getUserWalletHistory(entity._id);
      else if (role === 'driver') res = await adminService.getDriverWalletHistory(entity._id);
      else if (role === 'owner') res = await adminService.getOwnerWalletHistory(entity._id);
      
      setHistory(res.data.results || []);
      setBalance(res.data.balance || 0);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity);
    setSearchResults([]);
    setSearchQuery(`${entity.name || entity.owner_name} (${entity.phone || entity.mobile})`);
    fetchHistory(entity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error('Enter valid amount');
    if (!selectedEntity) return toast.error('Select a user/driver/owner');

    setSubmitting(true);
    try {
      const data = { amount: Number(amount), operation, description };
      let res;
      if (role === 'user') res = await adminService.adjustUserWallet(selectedEntity._id, data);
      else if (role === 'driver') res = await adminService.adjustDriverWallet(selectedEntity._id, data);
      else if (role === 'owner') res = await adminService.adjustOwnerWallet(selectedEntity._id, data);

      toast.success(`Successfully ${operation}ed ₹${amount}`);
      setAmount('');
      setDescription('');
      fetchHistory(selectedEntity);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    if (role === 'user') return <User className="text-blue-500" />;
    if (role === 'driver') return <Truck className="text-emerald-500" />;
    if (role === 'owner') return <Building2 className="text-amber-500" />;
    return <ChevronDown className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-3 bg-white shadow-sm rounded-2xl">
                <Wallet className="text-indigo-600" size={28} />
              </div>
              WALLET PAYMENT
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage and adjust balances for Users, Drivers, and Fleet Owners</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400">
            ADMIN PANEL <ChevronDown size={14} /> WALLET PAYMENT
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Search size={20} className="text-indigo-500" /> Select Account
            </h2>

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Select Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'user', label: 'User', icon: User },
                    { id: 'driver', label: 'Driver', icon: Truck },
                    { id: 'owner', label: 'Owner', icon: Building2 }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setRole(r.id); setSelectedEntity(null); setSearchQuery(''); setSearchResults([]); }}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        role === r.id 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <r.icon size={24} className="mb-2" />
                      <span className="text-xs font-bold uppercase tracking-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Search {role || 'Account'}</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    {searching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  </div>
                  <input
                    type="text"
                    disabled={!role}
                    placeholder="Search name, email or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
                  />
                  {selectedEntity && (
                    <button 
                      onClick={() => { setSelectedEntity(null); setSearchQuery(''); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-80 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleSelectEntity(item)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {(item.name || item.owner_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{item.name || item.owner_name}</h4>
                          <p className="text-xs text-slate-500 truncate">{item.phone || item.mobile || item.email}</p>
                        </div>
                        <ChevronDown size={16} className="-rotate-90 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Form */}
              {selectedEntity && (
                <form onSubmit={handleSubmit} className="pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-black text-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Operation</label>
                      <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                        className="w-full px-5 py-[18px] bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                      >
                        <option value="credit">Credit (+)</option>
                        <option value="debit">Debit (-)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Description</label>
                    <textarea
                      placeholder="Reason for adjustment..."
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                    Submit Adjustment
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: History & Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats Card */}
          {selectedEntity && (
            <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200 flex items-center justify-between relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <div className="relative z-10">
                <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-1">Current Balance</p>
                <h3 className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    {(selectedEntity.name || selectedEntity.owner_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-bold opacity-90">{selectedEntity.name || selectedEntity.owner_name}</span>
                </div>
              </div>
              <Wallet className="absolute -right-10 -bottom-10 text-white/10" size={240} />
              <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                 <History size={32} />
              </div>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> Transaction History
              </h2>
              {loadingHistory && <Loader2 className="animate-spin text-indigo-500" size={20} />}
            </div>

            {!selectedEntity ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Search size={40} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">No Account Selected</h3>
                  <p className="text-sm text-slate-400 max-w-[240px] mt-1">Select a role and search for an account to view wallet history</p>
                </div>
              </div>
            ) : history.length === 0 && !loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <History size={40} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">No Transactions Found</h3>
                  <p className="text-sm text-slate-400 mt-1">This account hasn't made any transactions yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{tx.description}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black tracking-tight ${
                        tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-0.5">{tx.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPayment;