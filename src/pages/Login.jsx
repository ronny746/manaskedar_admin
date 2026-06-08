import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Phone, Lock, CheckCircle2 } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f0e17] relative overflow-hidden font-inter">
            {/* Glowing Blobs */}
            <div className="blob-bg top-[-10%] left-[-10%] opacity-40"></div>
            <div className="blob-bg bottom-[-10%] right-[-10%] opacity-30 scale-150"></div>
            
            <div className="w-full max-w-md p-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[rgba(79,70,229,0.1)] border border-[rgba(79,70,229,0.2)] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-[#4f46e5]/10">
                        <ShieldCheck className="text-[#4f46e5]" size={40} />
                    </div>
                    <div className="flex justify-center gap-4 mb-4">
                        <span className="text-white font-black text-sm uppercase tracking-widest border-b-2 border-[#4f46e5] pb-1">Sign In</span>
                        <Link to="/register" className="text-[rgba(255,255,255,0.2)] font-black text-sm uppercase tracking-widest hover:text-white transition-all">Sign Up</Link>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Platform Portal</h2>
                    <p className="text-[rgba(255,255,255,0.4)] font-bold text-sm tracking-wide">Secure administrative access controlled</p>
                </div>

                <div className="frosted-card p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-2 ml-1">Phone Terminal</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="+91 00000 00000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-2 ml-1">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-rose-500/10 text-rose-500 p-4 rounded-xl border border-rose-500/20 text-xs font-bold animate-pulse">
                                AUTH ERROR: {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-3"
                        >
                            {loading ? 'Decrypting...' : (
                                <>
                                    <span>Access Dashboard</span>
                                    <CheckCircle2 size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="mt-12 text-center text-[10px] text-[rgba(255,255,255,0.2)] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Lock size={12} />
                    <span>256-BIT AES ENCRYPTION SECURED</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
