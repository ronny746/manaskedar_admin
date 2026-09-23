import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getPageTitle = (pathname) => {
    if (pathname === '/') return { title: 'Dashboard Overview', category: 'Analytics & Insights' };
    if (pathname.startsWith('/media')) return { title: 'Video & Media Library', category: 'Content Management' };
    if (pathname.startsWith('/add-media')) return { title: 'Upload New Media', category: 'Content Management' };
    if (pathname.startsWith('/assets')) return { title: 'Asset Vault', category: 'Cloud Storage & CDN' };
    if (pathname.startsWith('/banners')) return { title: 'Sliders & Banners', category: 'Homepage Configuration' };
    if (pathname.startsWith('/users')) return { title: 'User Management', category: 'Access & Accounts' };
    if (pathname.startsWith('/roles')) return { title: 'Roles & Permissions', category: 'Access Control' };
    if (pathname.startsWith('/subs')) return { title: 'Subscription Plans', category: 'Monetization' };
    if (pathname.startsWith('/settings')) return { title: 'System Settings', category: 'Configuration' };
    return { title: 'Admin Console', category: 'Overview' };
};

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const { title, category } = getPageTitle(location.pathname);

    return (
        <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-sans">
            {/* Ambient subtle light glow */}
            <div className="ambient-glow top-0 left-1/4"></div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
            
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* TOP HEADER */}
                <header className="px-6 md:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between shrink-0 shadow-subtle">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open Menu"
                            className="lg:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-100 rounded-xl transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                                <span>{category}</span>
                            </div>
                            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                                {title}
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-5">
                        {/* SEARCH INPUT */}
                        <div className="hidden md:flex items-center relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={15} />
                            <input 
                                type="text" 
                                placeholder="Quick search... (Press ⌘K)" 
                                className="bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all w-60 lg:w-72 placeholder:text-slate-400 text-slate-800"
                            />
                        </div>
                        
                        {/* NOTIFICATION BUTTON */}
                        <button 
                            aria-label="Notifications"
                            className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all shadow-sm"
                        >
                            <Bell size={17} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
                        </button>
 
                        {/* USER PROFILE CARD */}
                        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-slate-200">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {user?.name || 'Administrator'}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Super Admin
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20 ring-2 ring-white">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* PAGE CONTENT CONTAINER */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
