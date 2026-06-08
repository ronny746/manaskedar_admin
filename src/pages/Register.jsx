import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Phone, Lock, User as UserIcon, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await api.post('/auth/admin-register', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0e17] relative overflow-hidden font-inter">
            {/* Glowing Blobs */}
            <div className="blob-bg top-[-10%] right-[-10%] opacity-40 scale-150 rotate-45"></div>
            <div className="blob-bg bottom-[-10%] left-[-10%] opacity-30"></div>

            <div className="w-full max-w-lg p-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[rgba(79,70,229,0.1)] border border-[rgba(79,70,229,0.2)] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-[#4f46e5]/10">
                        <UserPlus className="text-[#4f46e5]" size={40} />
                    </div>
                    <div className="flex justify-center gap-4 mb-4">
                        <Link to="/login" className="text-[rgba(255,255,255,0.2)] font-black text-sm uppercase tracking-widest hover:text-white transition-all">Sign In</Link>
                        <span className="text-white font-black text-sm uppercase tracking-widest border-b-2 border-[#4f46e5] pb-1">Sign Up</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Create Identity</h2>
                    <p className="text-[rgba(255,255,255,0.4)] font-bold text-sm tracking-wide">Register your administrative profile</p>
                </div>

                <div className="frosted-card p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-2 ml-1">Full Identity</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-2 ml-1">Phone Terminal</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="+91 00000 00000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-2 ml-1">Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-rose-500/10 text-rose-500 p-4 rounded-xl border border-rose-500/20 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 bg-[#4f46e5]/10 text-[#4f46e5] p-4 rounded-xl border border-[#4f46e5]/20 font-bold uppercase tracking-widest text-xs text-center justify-center">
                                Identity Synchronized! Redirecting...
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full btn-primary py-4 flex items-center justify-center gap-3"
                        >
                            <span>Initialize Registration</span>
                            <Sparkles size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
