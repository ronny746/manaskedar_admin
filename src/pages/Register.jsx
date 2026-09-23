import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Phone, Lock, User as UserIcon, Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/auth/admin-register', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans p-4">
            {/* Ambient subtle light glows */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-slate-950 rounded-2xl mx-auto flex items-center justify-center p-3 mb-4 shadow-xl shadow-slate-900/10 border border-slate-800">
                        <img src="/logo.png" alt="MANASKEDAR" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Profile</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Register Admin Account</p>

                    <div className="inline-flex bg-slate-100 p-1 rounded-xl mt-6 border border-slate-200/80">
                        <Link to="/login" className="px-5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 font-semibold text-xs transition-colors">
                            Sign In
                        </Link>
                        <span className="px-5 py-1.5 rounded-lg bg-white text-indigo-700 font-bold text-xs shadow-sm">
                            Register
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-200/60">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="text"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Security Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2.5 bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-200 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-200 text-xs font-semibold justify-center">
                                <Sparkles size={16} className="text-emerald-600" />
                                <span>Account Registered! Redirecting to login...</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || success}
                            className="w-full btn-primary py-3.5 mt-2"
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    <span>Complete Registration</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
