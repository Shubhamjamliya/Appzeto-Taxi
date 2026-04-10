import React, { useState } from 'react';
import { Award, TrendingUp, Users, Star, Trophy, Target, ChevronRight } from 'lucide-react';
import DriverBottomNav from '../../shared/components/DriverBottomNav';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' or 'trips'

    // Mock data for drivers
    const drivers = [
        { id: 1, name: 'Rahul Sharma', earnings: 12500, trips: 145, rating: 4.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
        { id: 2, name: 'Amit Verma', earnings: 11200, trips: 132, rating: 4.8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
        { id: 3, name: 'Sanjay Gupta', earnings: 10800, trips: 156, rating: 4.7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay' },
        { id: 4, name: 'Vikram Singh', earnings: 9500, trips: 110, rating: 4.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
        { id: 5, name: 'Deepak Kumar', earnings: 8900, trips: 98, rating: 4.6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak' },
        { id: 6, name: 'Priya Patel', earnings: 8200, trips: 105, rating: 4.8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        { id: 7, name: 'Arjun Reddy', earnings: 7800, trips: 92, rating: 4.5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
        { id: 8, name: 'Manoj Tiwari', earnings: 7100, trips: 88, rating: 4.4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj' },
    ];

    // Sort based on active tab
    const sortedDrivers = [...drivers].sort((a, b) => {
        if (activeTab === 'earnings') return b.earnings - a.earnings;
        return b.trips - a.trips;
    });

    const topThree = sortedDrivers.slice(0, 3);
    const otherDrivers = sortedDrivers.slice(3);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-24">
            {/* Header Section */}
            <div className="bg-black text-white px-6 pt-12 pb-24 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md mb-4">
                        <Trophy className="text-yellow-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Driver Leaderboard</h1>
                    <p className="text-white/60 text-sm font-medium mt-1">Top performers of the week</p>
                </div>
            </div>

            {/* Main Content (Shifted up onto the header) */}
            <div className="px-6 -mt-16 relative z-20">
                {/* Stats Toggle Tabs */}
                <div className="bg-white p-1.5 rounded-2xl shadow-xl flex gap-1 mb-8">
                    <button 
                        onClick={() => setActiveTab('earnings')}
                        className={`flex-1 flex items-center justify-center py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${
                            activeTab === 'earnings' 
                            ? 'bg-black text-white' 
                            : 'bg-transparent text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <TrendingUp size={18} className="mr-2" />
                        EARNINGS
                    </button>
                    <button 
                        onClick={() => setActiveTab('trips')}
                        className={`flex-1 flex items-center justify-center py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${
                            activeTab === 'trips' 
                            ? 'bg-black text-white' 
                            : 'bg-transparent text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <Target size={18} className="mr-2" />
                        TOTAL TRIPS
                    </button>
                </div>

                {/* Top 3 Podium (Optional but Premium) */}
                <div className="flex items-end justify-center gap-2 mb-10 mt-2 px-2">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-3">
                            <div className="w-16 h-16 rounded-full border-2 border-slate-300 p-0.5 overflow-hidden bg-white shadow-lg">
                                <img src={topThree[1].avatar} alt={topThree[1].name} className="w-full h-full" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">2</div>
                        </div>
                        <span className="text-xs font-black text-slate-800 text-center line-clamp-1 w-full">{topThree[1].name.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {activeTab === 'earnings' ? formatCurrency(topThree[1].earnings) : `${topThree[1].trips} Trips`}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 uppercase leading-none">
                            {activeTab === 'earnings' ? `${topThree[1].trips} Trips` : formatCurrency(topThree[1].earnings)}
                        </span>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center flex-1 -mt-4">
                        <div className="relative mb-3 scale-110">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                                <Award className="text-yellow-400" size={24} fill="currentColor" />
                            </div>
                            <div className="w-20 h-20 rounded-full border-4 border-yellow-400 p-1 overflow-hidden bg-white shadow-2xl shadow-yellow-200">
                                <img src={topThree[0].avatar} alt={topThree[0].name} className="w-full h-full" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black w-7 h-7 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">1</div>
                        </div>
                        <span className="text-sm font-black text-slate-900 line-clamp-1 w-full text-center">{topThree[0].name.split(' ')[0]}</span>
                        <span className="text-xs font-black text-yellow-600 mt-0.5 leading-none">
                            {activeTab === 'earnings' ? formatCurrency(topThree[0].earnings) : `${topThree[0].trips} Trips`}
                        </span>
                        <span className="text-[9px] font-black text-yellow-500/60 uppercase leading-tight">
                            {activeTab === 'earnings' ? `${topThree[0].trips} Trips` : formatCurrency(topThree[0].earnings)}
                        </span>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-3">
                            <div className="w-16 h-16 rounded-full border-2 border-orange-200 p-0.5 overflow-hidden bg-white shadow-lg">
                                <img src={topThree[2].avatar} alt={topThree[2].name} className="w-full h-full" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-orange-300 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">3</div>
                        </div>
                        <span className="text-xs font-black text-slate-800 line-clamp-1 w-full text-center">{topThree[2].name.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {activeTab === 'earnings' ? formatCurrency(topThree[2].earnings) : `${topThree[2].trips} Trips`}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 uppercase leading-none">
                            {activeTab === 'earnings' ? `${topThree[2].trips} Trips` : formatCurrency(topThree[2].earnings)}
                        </span>
                    </div>
                </div>

                {/* Others List */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <span className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400">Driver Performance</span>
                        <span className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400">Rank</span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {otherDrivers.map((driver, index) => (
                            <div key={driver.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                                <div className="text-sm font-black text-slate-300 w-4">{index + 4}</div>
                                
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 p-1 group-hover:scale-105 transition-transform">
                                        <img src={driver.avatar} alt={driver.name} className="w-full h-full opacity-80" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-slate-900 truncate">{driver.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center text-[10px] font-bold text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                                            <Star size={10} className="mr-1 fill-yellow-500" />
                                            {driver.rating}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">• {driver.trips} Trips</span>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end">
                                    <div className="text-sm font-black text-black">
                                        {activeTab === 'earnings' ? formatCurrency(driver.earnings) : `${driver.trips} Trips`}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                        {activeTab === 'earnings' ? `${driver.trips} Trips` : formatCurrency(driver.earnings)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User's Reward Card */}
                <div className="mt-8 bg-gradient-to-br from-yellow-400 to-orange-400 p-6 rounded-[32px] text-black shadow-lg shadow-yellow-100 flex items-center justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 -mr-4 -mt-4 transform rotate-12">
                        <Trophy size={100} />
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-lg font-black leading-tight uppercase">Drive More,<br />Earn More!</h3>
                        <p className="text-[11px] font-bold opacity-80 mt-1 max-w-[140px]">Top 100 drivers get special bonus every week.</p>
                        <button className="mt-3 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                            Learn More <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>

                    <div className="relative z-10 bg-white/20 p-2 rounded-2xl backdrop-blur-sm border border-white/30 hidden xs:block">
                        <Users size={40} className="text-black/60" />
                    </div>
                </div>
            </div>
            <DriverBottomNav />
        </div>
    );
};

export default Leaderboard;
