import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, Shield, Star, Video, 
    ImageIcon, Settings, ChevronLeft, ChevronRight, 
    LogOut, Globe, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (!desktop) setIsCollapsed(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Roles & Permissions', path: '/roles', icon: Shield },
        { name: 'Subscriptions', path: '/subs', icon: Star },
        { name: 'Videos', path: '/media', icon: Video },
        { name: 'Asset Vault', path: '/assets', icon: ImageIcon },
        { name: 'Slider Settings', path: '/banners', icon: LayoutDashboard },
        { name: 'Site Settings', path: '/settings', icon: Settings },
    ];

    return (
        <>
            {/* COLLAPSE TOGGLE BUTTON (Floating) */}
            {isDesktop && (
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`fixed top-8 z-50 p-2 bg-white border border-slate-200 rounded-full shadow-lg transition-all duration-300 hover:bg-indigo-600 hover:text-white ${isCollapsed ? 'left-20' : 'left-[240px]'}`}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}

            <motion.aside 
                initial={false}
                animate={{ 
                    width: isDesktop ? (isCollapsed ? 80 : 260) : 260,
                    x: isDesktop ? 0 : (isOpen ? 0 : -260)
                }}
                className={`fixed lg:static inset-y-0 left-0 h-screen bg-[#1e1e2d] flex flex-col z-40 shadow-2xl lg:shadow-none border-r border-white/5 overflow-hidden`}
            >
                {/* LOGO SECTION */}
                <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                        <Globe size={20} />
                    </div>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-lg font-bold text-white tracking-tight uppercase">MANASKEDAR</h1>
                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Admin Universe</p>
                        </motion.div>
                    )}
                </div>

                {/* NAV ITEMS */}
                <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => !isDesktop && closeSidebar()}
                            className={({ isActive }) => `
                                flex items-center transition-all duration-200 rounded-xl px-4 py-3.5 group
                                ${isCollapsed ? 'justify-center' : 'gap-4'}
                                ${isActive 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                            title={isCollapsed ? item.name : ''}
                        >
                            <item.icon size={20} className={`shrink-0 ${isCollapsed ? '' : ''}`} />
                            {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-semibold whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* LOGOUT SECTION */}
                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={logout}
                        className={`flex items-center transition-all duration-200 rounded-xl px-4 py-3.5 w-full text-slate-400 hover:bg-rose-600/10 hover:text-rose-400
                            ${isCollapsed ? 'justify-center' : 'gap-4'}
                        `}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-semibold whitespace-nowrap"
                            >
                                Logout System
                            </motion.span>
                        )}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
