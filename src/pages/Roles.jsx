import { useState } from 'react';
import { 
    Shield, Plus, Search, Edit2, Trash2, 
    Lock, CheckCircle2, ChevronRight, UserPlus
} from 'lucide-react';

const Roles = () => {
    const [roles, setRoles] = useState([
        { id: 1, name: 'Super Admin', description: 'Full system access override', permissions: 'All', users: 2 },
        { id: 2, name: 'Content Manager', description: 'Media upload and edit authority', permissions: 'Media, Banners', users: 5 },
        { id: 3, name: 'Support', description: 'User management and logs', permissions: 'Users, Logs', users: 12 },
    ]);

    const labelClasses = "text-[11px] font-bold text-slate-500 uppercase tracking-wider";

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Roles & Permissions</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage administrative access levels</p>
                    </div>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Plus size={16} /> Create New Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={80} className="text-indigo-600" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                                <Lock size={20} />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Edit2 size={14} /></button>
                                <button className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">{role.name}</h3>
                        <p className="text-xs text-slate-400 font-medium mb-6">{role.description}</p>
                        
                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex justify-between items-center">
                                <span className={labelClasses}>Permissions</span>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{role.permissions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={labelClasses}>Active Users</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100"></div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{role.users}</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            Manage Permissions <ChevronRight size={14} />
                        </button>
                    </div>
                ))}

                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-500 shadow-sm mb-4">
                        <Plus size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Add Custom Protocol</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={40} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Role Access Validated</h3>
                    <p className="text-sm text-slate-400 font-medium">All system roles are currently synchronized with the central authentication matrix. No security leaks detected.</p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-black/10">
                   Audit All Nodes
                </button>
            </div>
        </div>
    );
};

export default Roles;
