import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VideoModal from '../components/VideoModal';
import { 
    Users, Film, Music, Shield, ArrowUpRight, 
    CreditCard, Eye, Video, Star, Plus, 
    ArrowRight, FolderArchive, Sliders, CheckCircle2,
    Calendar, Play, HardDrive, Sparkles, Layers,
    Clock, Tag, RefreshCw, Check, TrendingUp,
    FolderOpen, UserCheck, PlayCircle, Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        adminUsers: 0,
        freeUsers: 0,
        totalMedia: 0,
        videos: 0,
        shorts: 0,
        audio: 0,
        premiumMedia: 0,
        totalAssets: 0,
        totalStorageBytes: 0,
        totalBanners: 0,
        recentUsers: [],
        recentMedia: [],
        categoryCounts: {},
    });

    const fetchAllDashboardData = async () => {
        try {
            setLoading(true);
            const [mediaRes, usersRes, assetsRes, bannersRes] = await Promise.allSettled([
                api.get('/admin/media'),
                api.get('/admin/users'),
                api.get('/admin/assets'),
                api.get('/user/banners')
            ]);

            const mediaList = mediaRes.status === 'fulfilled' ? (mediaRes.value.data || []) : [];
            const usersList = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
            const assetsList = assetsRes.status === 'fulfilled' ? (assetsRes.value.data || []) : [];
            const bannersList = bannersRes.status === 'fulfilled' ? (bannersRes.value.data || []) : [];

            // Compute Media stats
            const videos = mediaList.filter(m => m.type === 'video').length;
            const shorts = mediaList.filter(m => m.type === 'short' || m.type === 'shorts').length;
            const audio = mediaList.filter(m => m.type === 'audio').length;
            const premiumMedia = mediaList.filter(m => m.isPremium).length;

            // Compute Category distribution
            const categoryCounts = {};
            mediaList.forEach(m => {
                if (Array.isArray(m.category)) {
                    m.category.forEach(c => {
                        categoryCounts[c] = (categoryCounts[c] || 0) + 1;
                    });
                } else if (m.category) {
                    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
                }
            });

            // Compute User stats
            const premiumUsers = usersList.filter(u => u.isPremium).length;
            const adminUsers = usersList.filter(u => u.isAdmin).length;
            const freeUsers = Math.max(0, usersList.length - premiumUsers);

            // Compute Storage size from Assets
            let totalStorage = 0;
            assetsList.forEach(a => {
                if (a.fileSize && !isNaN(a.fileSize)) totalStorage += Number(a.fileSize);
            });

            setStats({
                totalUsers: usersList.length,
                premiumUsers,
                adminUsers,
                freeUsers,
                totalMedia: mediaList.length,
                videos,
                shorts,
                audio,
                premiumMedia,
                totalAssets: assetsList.length,
                totalStorageBytes: totalStorage,
                totalBanners: bannersList.length,
                recentUsers: usersList.slice(0, 5),
                recentMedia: mediaList.slice(0, 6),
                categoryCounts,
            });
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDashboardData();
    }, []);

    const formatStorage = (bytes) => {
        if (!bytes || bytes === 0) return '0 MB';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const premiumConversionRate = stats.totalUsers > 0 
        ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) 
        : 0;

    return (
        <div className="space-y-7 pb-20 animate-in fade-in duration-300">
            {/* 1. TOP STATS CARDS (4 PREMIUM CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* 1. SUBSCRIBERS */}
                <div 
                    onClick={() => navigate('/users')}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(59,130,246,0.12)] hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalUsers}</h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Active Platform Accounts</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        {/* Progress visual */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                            <div 
                                className="bg-amber-500 h-2" 
                                style={{ width: `${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0}%` }}
                                title="Premium Users"
                            ></div>
                            <div 
                                className="bg-blue-500 h-2 flex-1" 
                                title="Free Members"
                            ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {stats.premiumUsers} Premium</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {stats.freeUsers} Free</span>
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT LIBRARY */}
                <div 
                    onClick={() => navigate('/media')}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.12)] hover:border-indigo-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Library</span>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Film size={18} />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalMedia}</h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Published Videos & Audio</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                            <div className="bg-indigo-600 h-2" style={{ width: `${stats.totalMedia > 0 ? (stats.videos / stats.totalMedia) * 100 : 0}%` }}></div>
                            <div className="bg-purple-500 h-2" style={{ width: `${stats.totalMedia > 0 ? (stats.shorts / stats.totalMedia) * 100 : 0}%` }}></div>
                            <div className="bg-emerald-500 h-2 flex-1"></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>{stats.videos} Videos</span>
                            <span>{stats.shorts} Shorts</span>
                            <span>{stats.audio} Audio</span>
                        </div>
                    </div>
                </div>

                {/* 3. PREMIUM TIERS */}
                <div 
                    onClick={() => navigate('/subs')}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.12)] hover:border-amber-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium Members</span>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                                <Star size={18} />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.premiumUsers}</h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{premiumConversionRate}% Subscriber Conversion</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(10, premiumConversionRate))}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>Tier Status: Active</span>
                            <span className="text-amber-600 font-bold">Manage Plans →</span>
                        </div>
                    </div>
                </div>

                {/* 4. ASSETS & CLOUD S3 */}
                <div 
                    onClick={() => navigate('/assets')}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.12)] hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Vault (S3)</span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                <HardDrive size={18} />
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalAssets}</h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{formatStorage(stats.totalStorageBytes)} Total Files Size</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(15, stats.totalAssets * 10))}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span className="text-emerald-700 font-bold">🟢 Cloud CDN Online</span>
                            <span className="text-emerald-600 font-bold">Open Vault →</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. RECENT CONTENT CARDS GRID (FEATURED MEDIA TILES) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-extrabold text-slate-900">Latest Published Content</h3>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100">
                                {stats.totalMedia} Items
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Explore recent streaming media, movies, and audio tracks</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button 
                            onClick={() => navigate('/add-media')}
                            className="btn-primary text-xs py-2 px-4 shadow-sm"
                        >
                            <Plus size={14} />
                            <span>Upload Video</span>
                        </button>
                        <button 
                            onClick={() => navigate('/media')}
                            className="btn-secondary text-xs py-2 px-3.5"
                        >
                            <span>View All</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                </div>

                {stats.recentMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {stats.recentMedia.map((media) => (
                            <div 
                                key={media._id}
                                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Thumbnail 16:9 */}
                                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                                        {media.thumbnail ? (
                                            <img 
                                                src={media.thumbnail} 
                                                alt={media.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1 bg-gradient-to-tr from-slate-950 to-slate-800">
                                                <Film size={32} />
                                                <span className="text-[10px] uppercase font-bold text-slate-400">{media.type}</span>
                                            </div>
                                        )}

                                        {/* Play Hover Overlay */}
                                        <div 
                                            onClick={() => setPlayingVideo(media)}
                                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-transform">
                                                <Play size={18} className="fill-indigo-600 ml-0.5" />
                                            </div>
                                        </div>

                                        {/* Top Badges */}
                                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded-md bg-black/75 text-white font-extrabold text-[9px] uppercase tracking-wider backdrop-blur-sm">
                                                {media.type}
                                            </span>
                                            {media.isPremium && (
                                                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                                    <Star size={9} className="fill-white" /> Premium
                                                </span>
                                            )}
                                        </div>

                                        {/* Bottom Duration Badge */}
                                        {media.duration > 0 && (
                                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold backdrop-blur-sm">
                                                {formatDuration(media.duration)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 space-y-2">
                                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {media.title || 'Untitled Stream'}
                                        </h4>

                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {media.description || 'High definition streaming content on MANASKEDAR platform.'}
                                        </p>

                                        {/* Category Tags */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                            {Array.isArray(media.category) && media.category.slice(0, 2).map((cat, idx) => (
                                                <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    {cat}
                                                </span>
                                            ))}
                                            {media.language && (
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    • {media.language}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(media.createdAt).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={() => navigate(`/edit-media/${media._id}`)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={13} />
                                        <span>Edit Media</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
                        <Film size={40} className="mx-auto text-slate-300 mb-3" />
                        <h4 className="text-base font-bold text-slate-800">No content published yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Upload your first movie, music video, or short reel to populate the library.</p>
                        <button onClick={() => navigate('/add-media')} className="mt-4 btn-primary text-xs py-2 px-5 inline-flex">
                            <Plus size={14} /> Upload Content
                        </button>
                    </div>
                )}
            </div>

            {/* 3. CATEGORY DISTRIBUTION & USER DIRECTORY SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* GENRE / CATEGORY ANALYTICS (6 Cols) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Genre & Category Breakdown</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Live catalog balance across genres</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                            {Object.keys(stats.categoryCounts).length} Categories
                        </span>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        {Object.entries(stats.categoryCounts).length > 0 ? (
                            Object.entries(stats.categoryCounts).map(([cat, count], i) => {
                                const percent = stats.totalMedia > 0 ? Math.round((count / stats.totalMedia) * 100) : 0;
                                const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-500'];
                                const color = colors[i % colors.length];

                                return (
                                    <div key={cat} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-800 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                                                {cat}
                                            </span>
                                            <span className="text-slate-500 font-semibold">{count} Videos ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">Add categories when publishing content to see analytics.</p>
                        )}
                    </div>
                </div>

                {/* RECENT USERS TELEMETRY (6 Cols) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Recent Subscriber Registrations</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Real-time user onboarding feed</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Live Sync
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 mt-1">
                            {stats.recentUsers.length > 0 ? (
                                stats.recentUsers.map((u) => (
                                    <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                {u.name ? u.name.slice(0, 2).toUpperCase() : 'US'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{u.name || 'Anonymous User'}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{u.phone || 'No phone'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                u.isAdmin 
                                                    ? 'bg-amber-100 text-amber-800' 
                                                    : u.isPremium 
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                                        : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {u.isAdmin ? 'Admin' : u.isPremium ? 'Premium' : 'Member'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                                    No registered subscribers found.
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/users')}
                        className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                        <span>Open User Management ({stats.totalUsers})</span>
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>

            {/* Video Player Popup Modal */}
            <VideoModal
                isOpen={!!playingVideo}
                onClose={() => setPlayingVideo(null)}
                videoUrl={playingVideo?.url}
                title={playingVideo?.title}
                thumbnail={playingVideo?.thumbnail}
            />
        </div>
    );
};

export default Dashboard;
