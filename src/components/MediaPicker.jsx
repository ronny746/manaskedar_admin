import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, X, Film, Image as ImageIcon, Music, Check, FileVideo, FileAudio, Folder } from 'lucide-react';

const MediaPicker = ({ isOpen, onClose, onSelect, filterType = 'all', title = 'Select Asset' }) => {
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const endpoint = filterType === 'media' ? '/admin/media' : '/admin/assets';
            const query = (filterType !== 'all' && filterType !== 'media') ? `?type=${filterType}` : '';
            
            api.get(`${endpoint}${query}`)
                .then(res => {
                    // For /admin/media, we want to normalize the data structure
                    const normalizedData = res.data.map(item => ({
                        ...item,
                        // If it's a media item, we use title as name and thumbnail as url for preview
                        name: item.name || item.title || 'Untitled',
                        url: item.url || item.thumbnail || '',
                        type: item.type || 'media'
                    }));
                    setAssets(normalizedData);
                    setLoading(false);
                })
                .catch(() => {
                    setAssets([]);
                    setLoading(false);
                });
        }
    }, [isOpen, filterType]);

    if (!isOpen) return null;

    const filtered = assets.filter(a => 
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl h-[80vh] bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            {filterType === 'image' ? <ImageIcon size={20} /> : filterType === 'video' ? <FileVideo size={20} /> : <Folder size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} assets available</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search assets..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-6 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Asset Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                            <Folder size={40} className="mb-3" />
                            <p className="text-sm font-bold">No matching assets found</p>
                            <p className="text-xs text-slate-300 mt-1">Upload files in Asset Vault first</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filtered.map(asset => (
                                <div 
                                    key={asset._id}
                                    onClick={() => {
                                        onSelect({ url: asset.url, name: asset.name, _id: asset._id, type: asset.type });
                                        onClose();
                                    }}
                                    className="group relative bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="h-28 w-full flex items-center justify-center overflow-hidden bg-slate-100">
                                        {(asset.type === 'image' || (asset.thumbnail && asset.thumbnail.length > 0)) ? (
                                            <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                                        ) : asset.type === 'audio' ? (
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <FileAudio size={24} />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <FileVideo size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[10px] font-bold text-slate-700 truncate">{asset.name}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{asset.type}</p>
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-lg">
                                            <Check size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaPicker;
