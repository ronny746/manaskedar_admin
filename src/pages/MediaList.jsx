import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Search, Plus, Edit2, Trash2, 
    ChevronLeft, ChevronRight, FileVideo, FileAudio, Film,
    Download, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MediaList = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const { data } = await api.get('/admin/media');
                setMedia(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch media');
                setMedia([]);
                setLoading(false);
            }
        };
        fetchMedia();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this content?')) {
            try {
                await api.delete(`/admin/media/${id}`);
                setMedia(media.filter(m => m._id !== id));
            } catch (err) {
                console.error('Delete failed');
            }
        }
    };

    const filteredMedia = media.filter(m => 
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === 'all' || m.type === filterType)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getTypeIcon = (type) => {
        if (type === 'video') return <FileVideo size={14} className="text-blue-500" />;
        if (type === 'audio') return <FileAudio size={14} className="text-emerald-500" />;
        if (type === 'short') return <Film size={14} className="text-purple-500" />;
        return <FileVideo size={14} className="text-slate-400" />;
    };

    const getTypeBadge = (type) => {
        const styles = {
            video: 'bg-blue-50 text-blue-600 border-blue-100',
            audio: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            short: 'bg-purple-50 text-purple-600 border-purple-100',
        };
        return styles[type] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Content Library</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{media.length} total items</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/add-media')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all">
                        <Plus size={14} /> Create New
                    </button>
                </div>
            </div>

            {/* TABLE CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* FILTERS */}
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {['all', 'video', 'audio', 'short'].map(type => (
                            <button
                                key={type}
                                onClick={() => { setFilterType(type); setCurrentPage(1); }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    filterType === type ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'
                                }`}
                            >
                                {type === 'all' ? 'All' : type}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text"
                            placeholder="Search content..."
                            className="bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-6 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 w-full md:w-72"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Thumbnail</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Title</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Language</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Duration</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Premium</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Created</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedMedia.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="text-slate-300">
                                                    {getTypeIcon(item.type)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                        {item.category?.length > 0 && (
                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.category.join(', ')}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${getTypeBadge(item.type)}`}>
                                            {getTypeIcon(item.type)} {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.language || '—'}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{formatDuration(item.duration)}</td>
                                    <td className="px-6 py-4">
                                        {item.isPremium ? (
                                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Premium</span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Free</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.createdAt?.split('T')[0]}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => navigate(`/edit-media/${item._id}`)} 
                                                className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item._id)} 
                                                className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMedia.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm font-bold text-slate-300">No content found</p>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMedia.length)} of {filteredMedia.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
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
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaList;
