import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, Menu, X } from 'lucide-react';

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 h-screen overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
            
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 relative">
                <header className="flex justify-between items-center py-6 glass-header sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 bg-slate-100 rounded-xl transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight uppercase">Admin Portal</h1>
                            <p className="hidden md:block text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Management Overview</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:block relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-slate-100 border border-slate-200 rounded-2xl pl-12 pr-6 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all w-72 placeholder:text-slate-300 text-slate-900"
                            />
                        </div>
                        
                        <button className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group shadow-sm">
                            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white animate-pulse"></span>
                        </button>
 
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                            <div className="hidden sm:block text-right">
                                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Rohit Admin</p>
                                <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-[0.3em] mt-0.5">Administrator</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-600/20 ring-1 ring-white/20">
                                RA
                            </div>
                        </div>
                    </div>
                </header>
                
                <div className="max-w-7xl mx-auto pt-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
