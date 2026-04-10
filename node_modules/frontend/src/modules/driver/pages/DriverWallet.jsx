import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Calendar, 
    Clock, 
    CreditCard, 
    Banknote, 
    History, 
    TrendingUp, 
    ChevronRight,
    Search,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    X,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DriverBottomNav from '../../shared/components/DriverBottomNav';

const DriverWallet = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('Weekly');
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount] = useState('4890');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    const handleWithdraw = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setShowWithdraw(false);
            }, 2000);
        }, 1500);
    };

    const transactions = [
        { id: 'TID-9080', type: 'Ride Earning', amount: '₹120', time: '10:30 AM', date: 'Today', status: 'Success', mode: 'Online' },
        { id: 'TID-9079', type: 'Bonus Incentive', amount: '₹450', time: '08:00 AM', date: 'Today', status: 'Success', mode: 'Wallet' },
        { id: 'TID-9078', type: 'Ride Earning', amount: '₹85', time: 'Yesterday', date: '21 Mar', status: 'Success', mode: 'Cash' },
        { id: 'TID-9077', type: 'Settlement', amount: '-₹2,500', time: 'Yesterday', date: '21 Mar', status: 'Success', mode: 'Bank' },
        { id: 'TID-9076', type: 'Ride Earning', amount: '₹210', time: '20 Mar', date: '20 Mar', status: 'Pending', mode: 'Online' }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans select-none overflow-x-hidden p-5 pb-28 pt-6 flex flex-col">
            
            {/* Withdraw Modal */}
            <AnimatePresence>
                {showWithdraw && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-md">
                         <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white w-full rounded-t-[2.5rem] p-7 pb-10 space-y-6 shadow-premium border-t border-slate-50"
                         >
                             <div className="flex justify-between items-center">
                                 <h3 className="text-xl font-display font-bold text-slate-900">Withdraw Funds</h3>
                                 <button onClick={() => setShowWithdraw(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><X size={18} /></button>
                             </div>

                             {isSuccess ? (
                                 <div className="flex flex-col items-center py-8 gap-4">
                                     <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                                         <CheckCircle2 size={40} strokeWidth={3} />
                                     </div>
                                     <div className="text-center">
                                         <p className="text-lg font-bold text-slate-900">Transfer Initiated!</p>
                                         <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-widest">Will reflect in 24 hours</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="space-y-6">
                                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payout Amount</p>
                                         <h4 className="text-4xl font-display font-bold text-slate-900 tracking-tight">₹{withdrawAmount}</h4>
                                     </div>
                                     <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100">
                                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-soft"><Wallet size={20} /></div>
                                         <div className="leading-tight">
                                             <p className="text-[13px] font-bold text-slate-900">Zeto Bank Savings</p>
                                             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Primary Method</p>
                                         </div>
                                     </div>
                                     <motion.button 
                                         whileTap={{ scale: 0.98 }}
                                         onClick={handleWithdraw}
                                         disabled={isProcessing}
                                         className={`w-full h-14 rounded-2xl text-[15px] font-display font-bold shadow-premium flex items-center justify-center gap-2 ${
                                            isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'
                                         }`}
                                     >
                                         {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : 'Confirm Withdrawal'}
                                         {!isProcessing && <ArrowUpRight size={18} strokeWidth={3} />}
                                     </motion.button>
                                 </div>
                             )}
                         </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white rounded-xl shadow-soft border border-slate-100 flex items-center justify-center text-slate-900 active:scale-95 transition-transform"
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
                <h1 className="text-lg font-display font-bold text-slate-900 tracking-tight uppercase">Wallet</h1>
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-10 h-10 bg-white rounded-xl shadow-soft border border-slate-100 flex items-center justify-center text-slate-900 active:scale-95 transition-transform"
                >
                    <RefreshCw size={18} strokeWidth={2.5} className={isRefreshing ? 'animate-spin text-primary' : ''} />
                </button>
            </header>

            <main className="flex-1 space-y-8 flex flex-col pt-2">
                {/* Balance Card */}
                <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative shadow-premium border border-white/5 overflow-hidden group w-full"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
                    
                    <div className="flex justify-between items-start relative z-10 mb-8 px-1">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Balance Available</p>
                            <div className="flex items-baseline gap-1">
                                <h2 className="text-4xl font-display font-bold tracking-tight">₹4,890<span className="text-2xl text-white/30">.50</span></h2>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-soft">
                             <Wallet size={24} className="text-primary" />
                        </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                         <button 
                            onClick={() => setShowWithdraw(true)}
                            className="flex-1 h-12 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-[13px] font-display font-bold shadow-soft active:scale-98 transition-all uppercase tracking-wider"
                         >
                            Withdraw <ArrowUpRight size={16} strokeWidth={3} />
                        </button>
                         <button 
                            onClick={() => navigate('/taxi/driver/payout-methods')}
                            className="flex-1 h-12 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center gap-2 text-[13px] font-display font-bold active:scale-98 transition-all uppercase tracking-wider"
                         >
                            Bank Info
                        </button>
                    </div>
                </motion.div>

                {/* Stats & History */}
                <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pb-5">
                    <div className="flex items-center justify-between px-1">
                         <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">History</h3>
                         <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                             {['Weekly', 'Monthly'].map(p => (
                                 <button 
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        period === p 
                                        ? 'bg-white text-slate-900 shadow-soft' 
                                        : 'text-slate-400'
                                    }`}
                                 >
                                     {p}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="space-y-3">
                        {transactions.map((tx, idx) => (
                            <motion.div 
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-4 rounded-2xl border border-white shadow-premium flex items-center justify-between group active:scale-[0.99] transition-all w-full"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-slate-50 ${tx.amount.startsWith('-') ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {tx.mode === 'Online' ? <CreditCard size={18} strokeWidth={2} /> : <ArrowUpRight size={18} strokeWidth={2} />}
                                    </div>
                                    <div className="leading-tight">
                                        <h4 className="text-[14px] font-bold text-slate-900 tracking-tight">{tx.type}</h4>
                                        <p className="text-[10px] font-medium text-slate-400">{tx.date} • {tx.mode}</p>
                                    </div>
                                </div>
                                <div className="text-right leading-tight">
                                    <h5 className={`text-[16px] font-display font-bold ${tx.amount.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'}`}>{tx.amount}</h5>
                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${tx.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <DriverBottomNav />
        </div>
    );
};

export default DriverWallet;
