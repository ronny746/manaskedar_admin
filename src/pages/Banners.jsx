import { useState, useEffect } from 'react';
import api from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';
import MediaPicker from '../components/MediaPicker';
import { 
    Plus, Trash2, Layout, ImageIcon, Image as Img,
    ChevronLeft, ChevronRight, Layers, Calendar, 
    Eye, Sparkles, ArrowUpRight
} from 'lucide-react';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pickerState, setPickerState] = useState({ isOpen: false, target: '', type: 'all', title: '' });
    const [newBanner, setNewBanner] = useState({ imageUrl: '', mediaId: null, mediaTitle: '' });
    const [isAdding, setIsAdding] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => {} });

    const fetchData = async () => {
        try {
            const { data: b } = await api.get('/user/banners');
            setBanners(b);
        } catch (err) {
            console.error('Failed to load banners');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openPicker = (target, type, title) => {
        setPickerState({ isOpen: true, target, type, title });
    };

    const handlePickerSelect = (asset) => {
        if (pickerState.target === 'imageUrl') {
            setNewBanner(prev => ({ ...prev, imageUrl: asset.url }));
        } else if (pickerState.target === 'mediaId') {
            setNewBanner(prev => ({ ...prev, mediaId: asset._id, mediaTitle: asset.name }));
        }
    };

    const handleSaveBanner = async () => {
        if (!newBanner.imageUrl || !newBanner.mediaId) {
            alert('Please select both a banner image and linked content.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/admin/banners', { 
                imageUrl: newBanner.imageUrl,
                mediaId: newBanner.mediaId
            });
            setNewBanner({ imageUrl: '', mediaId: null, mediaTitle: '' });
            setIsAdding(false);
            fetchData();
        } catch (err) {
            alert('Failed to add banner: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    const handleDelete = (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Remove Banner',
            message: 'Are you sure you want to remove this image from the slider? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Remove',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/banners/${id}`);
                    setBanners(banners.filter(b => b._id !== id));
                    setConfirmState(p => ({ ...p, isOpen: false }));
                } catch (err) {
                    alert('Delete failed');
                    setConfirmState(p => ({ ...p, isOpen: false }));
                }
            }
        });
    };

    // Pagination
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentBanners = banners.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(banners.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 p-4">
            {/* HEADER */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Layout size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Slider Manager</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Banner Slider</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Manage homepage slider banners. Pick images and link them to content.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-800">{banners.length}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Slides</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    {!isAdding ? (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
                        >
                            <Plus size={14} /> Add New Banner
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="bg-slate-100 text-slate-500 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* ADD BANNER FORM */}
            {isAdding && (
                <div className="bg-white rounded-2xl border-2 border-indigo-100 p-8 shadow-xl shadow-indigo-600/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600" />
                        Configure New Slide
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PICK IMAGE */}
                        <div 
                            onClick={() => openPicker('imageUrl', 'image', 'Select Banner Image')}
                            className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                                newBanner.imageUrl ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                            }`}
                        >
                            {newBanner.imageUrl ? (
                                <img src={newBanner.imageUrl} className="w-full h-32 object-cover rounded-xl shadow-sm" alt="Banner" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${newBanner.imageUrl ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {newBanner.imageUrl ? 'Change Image' : 'Pick Banner Image'}
                            </span>
                        </div>

                        {/* PICK CONTENT */}
                        <div 
                            onClick={() => openPicker('mediaId', 'media', 'Select Content to Link')}
                            className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                                newBanner.mediaId ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                            }`}
                        >
                            {newBanner.mediaId ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                        <Layers size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">{newBanner.mediaTitle}</p>
                                    <p className="text-[9px] text-emerald-500 uppercase font-bold mt-1 tracking-widest">Linked Successfully</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                                        <Layers size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Link to Content</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handleSaveBanner}
                            disabled={loading || !newBanner.imageUrl || !newBanner.mediaId}
                            className="bg-indigo-600 text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Save Banner Slide'}
                        </button>
                    </div>
                </div>
            )}

            {/* SLIDER PREVIEW */}
            {banners.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Slider Preview</h3>
                    <div className="relative rounded-xl overflow-hidden aspect-[21/9] bg-slate-100">
                        <img 
                            src={banners[0]?.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Current Banner" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div>
                                <p className="text-white text-lg font-bold">{banners[0]?.mediaId?.title || 'Banner Slide'}</p>
                                <p className="text-white/60 text-xs">Slide 1 of {banners.length}</p>
                            </div>
                            <div className="flex gap-1.5">
                                {banners.slice(0, 6).map((_, i) => (
                                    <div key={i} className={`w-8 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BANNER TABLE */}
            {banners.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Banner Preview</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Created</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentBanners.map((banner, idx) => (
                                    <tr key={banner._id} className="hover:bg-slate-50 group transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-32 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                                                    <img src={banner.imageUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                        {banner.mediaId?.title || `Slide ${firstIndex + idx + 1}`}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest truncate max-w-[200px]">
                                                        {banner._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <a 
                                                    href={banner.imageUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-9 h-9 bg-white border border-slate-200 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                                <button 
                                                    onClick={() => handleDelete(banner._id)}
                                                    className="w-9 h-9 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                Showing {firstIndex + 1}-{Math.min(lastIndex, banners.length)} of {banners.length}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-9 h-9 rounded-lg text-[10px] font-bold transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                            : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-200">
                        <Img size={40} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Banners Yet</h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-sm">Click "Add Banner" to pick an image from your Asset Vault and add it to the homepage slider.</p>
                </div>
            )}

            {/* MEDIA PICKER - for selecting banner image or media content */}
            <MediaPicker 
                isOpen={pickerState.isOpen}
                onClose={() => setPickerState(p => ({ ...p, isOpen: false }))}
                onSelect={handlePickerSelect}
                filterType={pickerState.type}
                title={pickerState.title}
            />

            {/* Confirm Dialog */}
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

export default Banners;
