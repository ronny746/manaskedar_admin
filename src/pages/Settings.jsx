import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    User, Lock, Bell, Globe, 
    Shield, Check, Save, AlertCircle 
} from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const [accountData, setAccountData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [policyData, setPolicyData] = useState({
        privacyPolicy: '',
        termsConditions: '',
    });

    useEffect(() => {
        if (activeTab === 'app') {
            fetchSettings();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            if (res.data?.success && res.data.data) {
                setPolicyData({
                    privacyPolicy: res.data.data.privacyPolicy || '',
                    termsConditions: res.data.data.termsConditions || '',
                });
            }
        } catch (err) {
            console.error("Fetch settings error", err);
        }
        setLoading(false);
    };

    const handlePolicyUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/admin/settings', policyData);
            setSuccess('Configurations updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert('Update failed');
        }
        setLoading(false);
    };

    const handleAccountUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulated endpoint or actual if exists
            await api.put(`/admin/users/${user._id}`, accountData);
            setSuccess('Account updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert('Update failed');
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.put('/admin/update-password', passwordData);
            setSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert('Password update failed');
        }
        setLoading(false);
    };

    const tabs = [
        { id: 'account', label: 'Account Profile', icon: User },
        { id: 'security', label: 'Security & Auth', icon: Lock },
        { id: 'app', label: 'App Configuration', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block";

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Manage your administrative profile and application preferences.</p>
                </div>
                {success && (
                    <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold border border-emerald-100 shadow-sm animate-in slide-in-from-right-4">
                        <Check size={16} /> {success}
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full lg:w-72 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm min-h-[500px]">
                        
                        {activeTab === 'account' && (
                            <form onSubmit={handleAccountUpdate} className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Public Profile</h3>
                                        <p className="text-xs text-slate-400">Basic information about your admin account.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Full Name</label>
                                        <input 
                                            value={accountData.name} 
                                            onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                                            className={inputClasses} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Email Address</label>
                                        <input 
                                            type="email"
                                            value={accountData.email} 
                                            onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                                            className={inputClasses} 
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end">
                                    <button 
                                        disabled={loading}
                                        className="bg-indigo-600 text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Save size={14} /> {loading ? 'Saving...' : 'Update Account'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordUpdate} className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                        <Shield size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Security Credentials</h3>
                                        <p className="text-xs text-slate-400">Update your password to keep your account secure.</p>
                                    </div>
                                </div>

                                <div className="space-y-6 max-w-md">
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Current Password</label>
                                        <input 
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            className={inputClasses} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>New Password</label>
                                        <input 
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className={inputClasses} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Confirm New Password</label>
                                        <input 
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className={inputClasses} 
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end">
                                    <button 
                                        disabled={loading}
                                        className="bg-slate-800 text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-slate-800/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Lock size={14} /> {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'app' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Globe size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">OTT Configuration</h3>
                                        <p className="text-xs text-slate-400">Global settings and compliance policies for your platform.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Platform Name</p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold">MANASKEDAR UNIVERSE</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Maintenance Mode</p>
                                            <p className="text-[10px] text-rose-500 mt-1 font-bold">CURRENTLY OFF</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handlePolicyUpdate} className="space-y-6 pt-6 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Privacy Policy</label>
                                        <textarea 
                                            rows={6}
                                            value={policyData.privacyPolicy}
                                            onChange={(e) => setPolicyData({...policyData, privacyPolicy: e.target.value})}
                                            className={`${inputClasses} min-h-[150px] font-sans`}
                                            placeholder="Enter Privacy Policy text or HTML markup here..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className={labelClasses}>Terms & Conditions</label>
                                        <textarea 
                                            rows={6}
                                            value={policyData.termsConditions}
                                            onChange={(e) => setPolicyData({...policyData, termsConditions: e.target.value})}
                                            className={`${inputClasses} min-h-[150px] font-sans`}
                                            placeholder="Enter Terms & Conditions text or HTML markup here..."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="bg-indigo-600 text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <Save size={14} /> {loading ? 'Saving Configurations...' : 'Save Configurations'}
                                        </button>
                                    </div>
                                </form>

                                <div className="p-8 bg-indigo-50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Need to change API keys?</p>
                                        <p className="text-xs text-indigo-600/70 mt-1">API and Cloud configuration are managed via .env variables for security.</p>
                                    </div>
                                    <button type="button" className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20">Contact Dev</button>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'notifications') && (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <Bell size={48} className="text-slate-100 mb-4" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">No Active Notifications</h3>
                                <p className="text-xs text-slate-200 mt-2">Notification logs and preferences will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
