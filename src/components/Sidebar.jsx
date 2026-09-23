import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, ShieldCheck, Star, Video, 
    Image as ImageIcon, Settings, ChevronLeft, ChevronRight, 
    LogOut, Sparkles, Folder, FolderOpen, PlusCircle,
    Sliders, CreditCard, ChevronDown, FolderArchive, Film,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuGroups = [
    {
        id: 'overview',
        name: 'Overview',
        icon: LayoutDashboard,
        items: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
        ]
    },
    {
        id: 'content',
        name: 'Content & Media',
        icon: Folder,
        items: [
            { name: 'Videos & Media', path: '/media', icon: Film, badge: null },
            { name: 'Add Content', path: '/add-media', icon: PlusCircle, badge: 'New' },
            { name: 'Asset Vault', path: '/assets', icon: FolderArchive, badge: null },
            { name: 'Slider & Banners', path: '/banners', icon: Sliders, badge: null },
        ]
    },
    {
        id: 'users',
        name: 'User Directory',
        icon: Users,
        items: [
            { name: 'Manage Users', path: '/users', icon: Users, badge: null },
            { name: 'Roles & Access', path: '/roles', icon: ShieldCheck, badge: null },
        ]
    },
    {
        id: 'monetization',
        name: 'Monetization',
        icon: CreditCard,
        items: [
            { name: 'Subscriptions', path: '/subs', icon: Star, badge: 'Active' },
        ]
    },
    {
        id: 'system',
        name: 'Settings & Config',
        icon: Settings,
        items: [
            { name: 'Site Settings', path: '/settings', icon: Settings, badge: null },
        ]
    }
];

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    // Track open/closed state of folder sections
    const [openFolders, setOpenFolders] = useState({
        overview: true,
        content: true,
        users: true,
        monetization: true,
        system: true,
    });

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (!desktop) setIsCollapsed(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleFolder = (folderId) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    return (
        <>
            {/* COLLAPSE TOGGLE BUTTON (Floating Desktop) */}
            {isDesktop && (
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle Sidebar"
                    className={`fixed top-6 z-50 p-2 bg-white border border-slate-200 text-slate-500 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 ${
                        isCollapsed ? 'left-[68px]' : 'left-[264px]'
                    }`}
                >
                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
            )}

            <motion.aside 
                initial={false}
                animate={{ 
                    width: isDesktop ? (isCollapsed ? 80 : 280) : 280,
                    x: isDesktop ? 0 : (isOpen ? 0 : -280)
                }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="fixed lg:static inset-y-0 left-0 h-screen bg-white flex flex-col z-40 shadow-xl lg:shadow-none border-r border-slate-200/80 select-none"
            >
                {/* BRAND HEADER */}
                <div className={`p-5 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center p-1.5 shrink-0 shadow-md shadow-slate-900/15 border border-slate-800 overflow-hidden">
                            <img src="/logo.png" alt="MANASKEDAR" className="w-full h-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                                    MANASKEDAR
                                </h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Admin Console</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* FOLDERS & NAVIGATION */}
                <div className="flex-1 py-5 px-3 space-y-4 overflow-y-auto custom-scrollbar">
                    {menuGroups.map((group) => {
                        const isFolderOpen = openFolders[group.id];
                        const isAnyChildActive = group.items.some(item => 
                            item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
                        );

                        return (
                            <div key={group.id} className="space-y-1">
                                {/* FOLDER HEADER */}
                                {!isCollapsed ? (
                                    <button
                                        onClick={() => toggleFolder(group.id)}
                                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors group ${
                                            isAnyChildActive 
                                                ? 'text-indigo-600 font-extrabold' 
                                                : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isFolderOpen ? (
                                                <FolderOpen size={14} className={isAnyChildActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                            ) : (
                                                <Folder size={14} className={isAnyChildActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                            )}
                                            <span className="text-[11px] font-bold tracking-wider">{group.name}</span>
                                        </div>
                                        <ChevronDown 
                                            size={13} 
                                            className={`transition-transform duration-200 ${isFolderOpen ? 'rotate-0' : '-rotate-90'} opacity-70`} 
                                        />
                                    </button>
                                ) : (
                                    <div className="w-full flex justify-center py-1 border-b border-slate-100 mb-1">
                                        <div className="w-6 h-0.5 bg-slate-200 rounded-full"></div>
                                    </div>
                                )}

                                {/* FOLDER ITEMS */}
                                <AnimatePresence initial={false}>
                                    {(isCollapsed || isFolderOpen) && (
                                        <motion.div
                                            initial={!isCollapsed ? { height: 0, opacity: 0 } : false}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={!isCollapsed ? { height: 0, opacity: 0 } : false}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-1 overflow-hidden"
                                        >
                                            {group.items.map((item) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <NavLink
                                                        key={item.name}
                                                        to={item.path}
                                                        end={item.exact}
                                                        onClick={() => !isDesktop && closeSidebar()}
                                                        className={({ isActive }) => `
                                                            flex items-center justify-between transition-all duration-150 rounded-xl px-3 py-2.5 group
                                                            ${isCollapsed ? 'justify-center px-0' : ''}
                                                            ${isActive 
                                                                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-500/10' 
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}
                                                        `}
                                                        title={isCollapsed ? item.name : ''}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-1.5 rounded-lg transition-colors ${
                                                                location.pathname === item.path 
                                                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
                                                                    : 'text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50/60'
                                                            }`}>
                                                                <ItemIcon size={17} className="shrink-0" />
                                                            </div>
                                                            {!isCollapsed && (
                                                                <span className="text-[13px] whitespace-nowrap">
                                                                    {item.name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {!isCollapsed && item.badge && (
                                                            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-indigo-100 text-indigo-700 rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </NavLink>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* STORAGE / QUICK WIDGET */}
                {!isCollapsed && (
                    <div className="px-4 py-2 mx-3 mb-2 bg-slate-50 border border-slate-200/70 rounded-xl">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-emerald-500" />
                                System Online
                            </span>
                            <span className="text-[10px] text-indigo-600 font-extrabold">v2.4</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1.5 rounded-full w-2/3"></div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium mt-1">Live API Connected</p>
                    </div>
                )}

                {/* USER PROFILE & LOGOUT SECTION */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/60">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                                    <p className="text-[10px] font-semibold text-slate-400 truncate">{user?.phone || 'Super Admin'}</p>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={logout}
                            title="Logout"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
