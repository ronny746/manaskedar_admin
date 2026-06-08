import { useState } from 'react';
import { 
    Star, Plus, Search, Edit2, Trash2, 
    CheckCircle2, CreditCard, Calendar, TrendingUp,
    Zap, Gem, Award, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const Subscriptions = () => {
    const [plans, setPlans] = useState([
        { id: 1, name: 'Basic Plan', price: '₹199', duration: 'Monthly', status: 'Active', color: 'text-blue-500', bg: 'bg-blue-50', icon: Zap },
        { id: 2, name: 'Premium Pro', price: '₹999', duration: 'Yearly', status: 'Active', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Gem },
        { id: 3, name: 'Ultra Max', price: '₹1499', duration: 'Lifetime', status: 'Inactive', color: 'text-amber-500', bg: 'bg-amber-50', icon: Award },
    ]);

    const labelClasses = "text-[11px] font-bold text-slate-500 uppercase tracking-wider";

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Star size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Subscription Plans</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage monetization and user tiers</p>
                    </div>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Plus size={16} /> Add New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        key={plan.id} 
                        className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`${plan.bg} ${plan.color} p-4 rounded-2xl`}>
                                <plan.icon size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${plan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {plan.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                            <span className="text-xs text-slate-400 font-bold uppercase">/ {plan.duration}</span>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50 mb-8">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                <span className="text-xs text-slate-600 font-medium">4K Ultra HD Streaming</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                <span className="text-xs text-slate-600 font-medium">No Advertisement Interruptions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                <span className="text-xs text-slate-600 font-medium">Offline Downloads Available</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 flex items-center justify-center gap-2">
                                <Edit2 size={14} /> Modify
                            </button>
                            <button className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Subscription Analytics</h3>
                        <TrendingUp className="text-indigo-600" size={20} />
                    </div>
                    <div className="space-y-6">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion Rate</p>
                                    <p className="text-lg font-bold text-slate-800">12.8%</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">+2.4%</span>
                            </div>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Revenue</p>
                                    <p className="text-lg font-bold text-slate-800">₹2.45 Lakhs</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">+18%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                        <Plus size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Create Custom Plan</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8 max-w-xs">Need a specialized tier for business or bulk entities?</p>
                    <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">
                        Initialize Plan Designer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
