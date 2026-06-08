import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Activity, Users, Film, Music, Shield, ArrowUpRight, 
    Zap, Database, CreditCard, Eye, Layout, Layers,
    Video, Star, Tags, MessageSquare, Info, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

const MiniChart = ({ color }) => (
    <svg className="w-full h-12 mt-4" viewBox="0 0 100 40">
        <path 
            d="M0 35 Q 20 10, 40 25 T 80 15 T 100 30" 
            fill="none" 
            stroke={color} 
            strokeWidth="3" 
            strokeLinecap="round"
        />
        <path 
            d="M0 35 Q 20 10, 40 25 T 80 15 T 100 30 L 100 40 L 0 40 Z" 
            fill={color} 
            fillOpacity="0.1" 
        />
    </svg>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalMedia: 0,
        totalUsers: 0,
        movies: 0,
        shows: 0,
        shorts: 0,
        audio: 0,
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [mediaRes, usersRes] = await Promise.all([
                    api.get('/admin/media'),
                    api.get('/admin/users')
                ]);
                const media = mediaRes.data;
                const users = usersRes.data;
                
                setStats({
                    totalMedia: media.length,
                    totalUsers: users.length,
                    videos: media.filter(m => m.type === 'video').length,
                    shorts: media.filter(m => m.type === 'short').length,
                    audio: media.filter(m => m.type === 'audio').length,
                    recentUsers: users.slice(0, 5)
                });
                setLoading(false);
            } catch (err) {
                setStats({totalMedia: 0, totalUsers: 0, videos: 0, shorts: 0, audio: 0, recentUsers: []});
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const topCards = [
        { title: 'Total Revenue', value: '$ 2,450.00', color: '#10b981', icon: CreditCard, percentage: '23%' },
        { title: 'Total Views', value: '45,280', color: '#6366f1', icon: Eye, percentage: '12%' },
        { title: 'Total Users', value: stats.totalUsers, color: '#f59e0b', icon: Users, percentage: '85%' },
        { title: 'Total Subscription', value: '345', color: '#ef4444', icon: Star, percentage: '5%' },
    ];

    const infoCards = [
        { label: 'Total Content', value: stats.totalMedia, icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Videos', value: stats.videos, icon: Film, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Shorts', value: stats.shorts, icon: Tags, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Audio', value: stats.audio, icon: Music, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Packages', value: '02', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Verified Users', value: '18', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Total FAQs', value: '00', icon: Info, color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Wallet Balance', value: '410', icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* TOP ANALYTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-400 text-sm font-medium">{card.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1`}>
                                {card.percentage} <ArrowUpRight size={10} />
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{card.value.toLocaleString()}</h3>
                        <MiniChart color={card.color} />
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Live Monitoring</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* INFO GRID SECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {infoCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-6 group hover:border-indigo-100 hover:shadow-sm transition-all">
                        <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <card.icon className={card.color} size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-slate-800">{card.value}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* RECENT ACTIVITY & SYSTEM STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Content Performance</h3>
                        <select className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-xs font-bold text-slate-500">
                            <option>Monthly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="bg-indigo-600/10 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-500 relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => (
                            <span key={m} className="text-[10px] font-bold text-slate-400 uppercase">{m}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Recent Users</h3>
                    <div className="space-y-6">
                        {stats.recentUsers.length > 0 ? stats.recentUsers.map((user, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                    {user.name?.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">{user.email}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <Users className="mx-auto text-slate-100 mb-4" size={40} />
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No active sessions</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full py-3 mt-10 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        View All Entities
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
