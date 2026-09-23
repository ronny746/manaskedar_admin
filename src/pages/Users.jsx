import { useState, useEffect } from 'react';
import api from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
    Users as UserIcon, Search, Mail, Phone, Calendar, 
    ShieldCheck, Trash2, ShieldAlert, X, Edit3, Crown, Eye, Clock, PlayCircle,
    ChevronLeft, ChevronRight, MapPin, Globe, Filter, UserCheck, Shield
} from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '', email: '', city: '' });
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Confirm Dialog State
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', type: 'primary', onConfirm: () => {} });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (id) => {
        try {
            const res = await api.get(`/admin/users/${id}`);
            setSelectedUser(res.data);
            setEditData({
                name: res.data.name,
                phone: res.data.phone,
                email: res.data.email || '',
                city: res.data.city || ''
            });
        } catch (err) {
             alert('Error fetching user audit log');
        }
    };

    const deleteUser = (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete User Account',
            message: 'Are you sure you want to delete this subscriber? All watch history and tokens will be permanently removed.',
            type: 'danger',
            confirmText: 'Delete Permanently',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    fetchUsers();
                    setSelectedUser(null);
                    setConfirmState(p => ({ ...p, isOpen: false }));
                } catch (err) {
                    alert(err.response?.data?.error || 'Delete request failed');
                    setConfirmState(p => ({ ...p, isOpen: false }));
                }
            }
        });
    };

    const togglePermission = async (id, type) => {
        const title = type === 'role' ? 'Toggle Admin Access' : 'Toggle Premium Status';
        const msg = type === 'role' 
            ? 'Do you want to toggle administrative permissions for this user?' 
            : 'Do you want to toggle premium membership status for this user?';

        setConfirmState({
            isOpen: true,
            title: title,
            message: msg,
            type: 'warning',
            confirmText: 'Confirm Change',
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/users/${id}/${type}`);
                    if (selectedUser) fetchUserDetails(id);
                    fetchUsers();
                    setConfirmState(p => ({ ...p, isOpen: false }));
                } catch (err) {
                    alert(`Failed to update ${type}`);
                    setConfirmState(p => ({ ...p, isOpen: false }));
                }
            }
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${selectedUser._id}`, editData);
            setIsEditModalOpen(false);
            fetchUserDetails(selectedUser._id);
            fetchUsers();
        } catch (err) {
            alert('Update failed');
        }
    };

    const formatLastSeen = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const seen = new Date(date);
        const diff = Math.floor((now - seen) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return seen.toLocaleDateString();
    };

    const filteredUsers = users.filter(u => 
        (u.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone?.includes(searchTerm)) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentUsers = filteredUsers.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* TOP BAR / STATS & SEARCH */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={17} />
                    <input 
                        type="text" 
                        placeholder="Search users by name, phone or email..." 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 flex items-center shadow-sm">
                        <UserCheck size={16} className="mr-2 text-indigo-600" /> Total Users: <span className="ml-1.5 text-indigo-600 font-extrabold">{users.length}</span>
                    </div>
                </div>
            </div>

            {/* USER TABLE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/90 border-b border-slate-200/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Role & Tier</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-extrabold uppercase shrink-0">
                                                {user.name?.substring(0, 2) || 'US'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                    {user.name || 'Anonymous User'}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                user.isAdmin 
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {user.isAdmin ? 'Admin' : 'Member'}
                                            </span>
                                            {user.isPremium && (
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                                    <Crown size={11} /> Premium
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.lastActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                            <span className="text-xs font-semibold text-slate-700">{formatLastSeen(user.lastActive)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                                            <MapPin size={13} className="text-slate-400 shrink-0" />
                                            <span className="truncate max-w-[130px]">{user.city || 'Not Specified'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => fetchUserDetails(user._id)}
                                                title="View User Details"
                                                className="w-8 h-8 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-lg flex items-center justify-center transition-all shadow-sm"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button 
                                                onClick={() => deleteUser(user._id)}
                                                title="Delete User"
                                                className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-all shadow-sm"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Panel */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="text-xs font-semibold text-slate-500">
                            Showing {firstIndex + 1} to {Math.min(lastIndex, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === i + 1 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {filteredUsers.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-2xl p-8">
                    <UserIcon size={44} className="text-slate-300 mb-3" />
                    <h4 className="text-base font-bold text-slate-800">No Users Found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                </div>
            )}

            {/* Audit Log / Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 border border-slate-200 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">User Audit Profile</h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedUser._id}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                                    <Clock size={24} className="mx-auto text-indigo-600 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Active</span>
                                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{formatLastSeen(selectedUser.lastActive)}</h4>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                                    <Crown size={24} className={`mx-auto mb-2 ${selectedUser.isPremium ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Status</span>
                                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{selectedUser.isPremium ? 'Premium Active' : 'Free Tier'}</h4>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                                    <PlayCircle size={24} className="mx-auto text-emerald-600 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Watched Items</span>
                                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{selectedUser.watchHistory?.length || 0} Videos</h4>
                                </div>
                            </div>

                            {/* User Details & Permissions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Profile Information</h5>
                                        <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                            <Edit3 size={13} /> Edit Info
                                        </button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Name', value: selectedUser.name, icon: UserIcon },
                                            { label: 'Phone', value: selectedUser.phone, icon: Phone },
                                            { label: 'Email', value: selectedUser.email || 'Not Provided', icon: Mail },
                                            { label: 'Joined Date', value: new Date(selectedUser.createdAt).toLocaleDateString(), icon: Calendar },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                                                <item.icon size={16} className="text-indigo-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                                                    <p className="text-xs font-bold text-slate-800 truncate">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Access Actions</h5>
                                    <div className="space-y-2.5">
                                        <button 
                                            onClick={() => togglePermission(selectedUser._id, 'role')}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-xs transition-all ${
                                                selectedUser.isAdmin 
                                                    ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' 
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <ShieldAlert size={18} className="text-amber-600" />
                                                <span>Admin Privileges</span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-bold">{selectedUser.isAdmin ? 'Enabled' : 'Disabled'}</span>
                                        </button>

                                        <button 
                                            onClick={() => togglePermission(selectedUser._id, 'premium')}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-xs transition-all ${
                                                selectedUser.isPremium 
                                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100' 
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Crown size={18} className="text-indigo-600" />
                                                <span>Premium Membership</span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-bold">{selectedUser.isPremium ? 'Active' : 'Inactive'}</span>
                                        </button>

                                        <button 
                                            onClick={() => deleteUser(selectedUser._id)}
                                            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Trash2 size={18} className="text-rose-600" />
                                                <span>Delete User Account</span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-bold text-rose-700">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Info Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-slate-200">
                        <h3 className="text-base font-bold text-slate-900 mb-5">Edit User Profile</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">User Name</label>
                                <input 
                                    className="input-field" 
                                    value={editData.name} 
                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                                <input 
                                    className="input-field" 
                                    value={editData.phone} 
                                    onChange={e => setEditData({...editData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                                <input 
                                    type="email"
                                    className="input-field" 
                                    value={editData.email} 
                                    onChange={e => setEditData({...editData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                                <input 
                                    className="input-field" 
                                    value={editData.city} 
                                    onChange={e => setEditData({...editData, city: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5 text-xs">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Confirm Dialog */}
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.confirmText}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(p => ({ ...p, isOpen: false }))}
            />
        </div>
    );
};

export default Users;
