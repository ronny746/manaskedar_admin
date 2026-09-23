import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Phone, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await login(phone, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans p-4">
            {/* Subtle light background ambient accents */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-slate-950 rounded-2xl mx-auto flex items-center justify-center p-3 mb-4 shadow-xl shadow-slate-900/10 border border-slate-800">
                        <img src="/logo.png" alt="MANASKEDAR" className="w-full h-full object-contain" />
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">MANASKEDAR</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Administrator Sign In</p>

                    <div className="inline-flex bg-slate-100 p-1 rounded-xl mt-6 border border-slate-200/80">
                        <span className="px-5 py-1.5 rounded-lg bg-white text-indigo-700 font-bold text-xs shadow-sm">
                            Sign In
                        </span>
                        <Link to="/register" className="px-5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 font-semibold text-xs transition-colors">
                            Register
                        </Link>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-200/60">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="text"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-primary py-3.5 mt-2"
                        >
                            {loading ? 'Verifying Credentials...' : (
                                <>
                                    <span>Access Dashboard</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="mt-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                    <Lock size={13} className="text-slate-400" />
                    <span>Protected Admin Area • 256-Bit SSL Encrypted</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
