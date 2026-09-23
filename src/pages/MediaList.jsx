import { useState, useEffect } from 'react';
import api from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';
import VideoModal from '../components/VideoModal';
import { 
    Search, Plus, Edit2, Trash2, 
    ChevronLeft, ChevronRight, FileVideo, FileAudio, Film,
    LayoutGrid, List as ListIcon, Play, Star, Clock, Filter,
    Eye, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MediaList = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [playingVideo, setPlayingVideo] = useState(null);
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Confirm Dialog State
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, title: '' });

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/media');
            setMedia(data || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch media');
            setMedia([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleDeleteClick = (id, title) => {
        setConfirmState({
            isOpen: true,
            id,
            title: title || 'this content',
        });
    };

    const confirmDelete = async () => {
        if (!confirmState.id) return;
        try {
            await api.delete(`/admin/media/${confirmState.id}`);
            setMedia(prev => prev.filter(m => m._id !== confirmState.id));
            setConfirmState({ isOpen: false, id: null, title: '' });
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
            setConfirmState({ isOpen: false, id: null, title: '' });
        }
    };

    const filteredMedia = media.filter(m => 
        (m.title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterType === 'all' || m.type === filterType)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            {/* TOP HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Content Library</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {media.length} total video, audio, and reel assets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            title="Grid Cards View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            title="Table View"
                        >
                            <ListIcon size={16} />
                        </button>
                    </div>

                    <button 
                        onClick={() => navigate('/add-media')} 
                        className="btn-primary text-xs py-2.5 px-4 shadow-sm"
                    >
                        <Plus size={15} />
                        <span>Upload Content</span>
                    </button>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {[
                        { id: 'all', label: 'All Content' },
                        { id: 'video', label: 'Full Videos' },
                        { id: 'short', label: 'Shorts & Reels' },
                        { id: 'audio', label: 'Audio Tracks' },
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => { setFilterType(type.id); setCurrentPage(1); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterType === type.id 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                        type="text"
                        placeholder="Search by title or category..."
                        className="w-full md:w-72 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* CONTENT GRID / TABLE */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                    <Film size={44} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No content matches your filter</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Try clearing search or uploading new video and audio files.</p>
                    <button onClick={() => navigate('/add-media')} className="btn-primary text-xs py-2 px-5 inline-flex mt-2">
                        <Plus size={14} /> Upload Content
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {paginatedMedia.map((item) => (
                        <div 
                            key={item._id}
                            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div>
                                {/* Aspect Video Container */}
                                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                                    {item.thumbnail ? (
                                        <img 
                                            src={item.thumbnail} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1 bg-gradient-to-tr from-slate-950 to-slate-900">
                                            {item.type === 'audio' ? <FileAudio size={28} /> : <FileVideo size={28} />}
                                            <span className="text-[10px] font-bold uppercase">{item.type}</span>
                                        </div>
                                    )}

                                    {/* Play Overlay */}
                                    <div 
                                        onClick={() => setPlayingVideo(item)}
                                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg scale-75 group-hover:scale-100 transition-transform">
                                            <Play size={16} className="fill-indigo-600 ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-black/75 text-white font-extrabold text-[9px] uppercase tracking-wider backdrop-blur-sm">
                                            {item.type}
                                        </span>
                                        {item.isPremium && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                                <Star size={9} className="fill-white" /> Premium
                                            </span>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    {item.duration > 0 && (
                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold backdrop-blur-sm">
                                            {formatDuration(item.duration)}
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={item.title}>
                                        {item.title || 'Untitled Stream'}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                        {Array.isArray(item.category) && item.category.slice(0, 2).map((c, i) => (
                                            <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {c}
                                            </span>
                                        ))}
                                        {item.language && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                • {item.language}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-3.5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => navigate(`/edit-media/${item._id}`)}
                                        title="Edit Content"
                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(item._id, item.title)}
                                        title="Delete Content"
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200/80">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Title & Categories</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Format</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Language</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Plan Tier</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedMedia.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <Film size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {Array.isArray(item.category) ? item.category.join(', ') : item.category || 'General'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                                            {item.language || 'Hindi'}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                                            {formatDuration(item.duration) || '—'}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            {item.isPremium ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                    Free
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={() => setPlayingVideo(item)}
                                                    title="Play Stream Preview"
                                                    className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                >
                                                    <Play size={13} className="ml-0.5" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/edit-media/${item._id}`)}
                                                    title="Edit Content"
                                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-colors shadow-sm"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(item._id, item.title)}
                                                    title="Delete Content"
                                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors shadow-sm"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">
                        Page {currentPage} of {totalPages} ({filteredMedia.length} total)
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                    currentPage === i + 1 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM DIALOG */}
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title="Delete Content Asset"
                message={`Are you sure you want to delete "${confirmState.title}"? This cannot be undone.`}
                type="danger"
                confirmText="Delete Now"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ isOpen: false, id: null, title: '' })}
            />

            {/* Video Player Modal */}
            <VideoModal
                isOpen={!!playingVideo}
                onClose={() => setPlayingVideo(null)}
                videoUrl={playingVideo?.url}
                title={playingVideo?.title}
                thumbnail={playingVideo?.thumbnail}
            />
        </div>
    );
};

export default MediaList;
