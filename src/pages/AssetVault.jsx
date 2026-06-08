import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Upload, Trash2, CheckCircle2, Film, Image as ImageIcon, 
    Music, Search, Plus, X, 
    ExternalLink, Database,
    Copy, Check, LayoutGrid, List as ListIcon,
    FileVideo, FileAudio, File, Folder, FolderOpen, ArrowLeft
} from 'lucide-react';

const AssetVault = () => {
    const [assets, setAssets] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFolder, setActiveFolder] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    
    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadType, setUploadType] = useState(null); 

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await api.get('/admin/assets'); 
            setAssets(res.data);
        } catch (err) {
            setAssets([]);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadType) {
            alert('Please select both category and file.');
            return;
        }

        setUploading(true);
        setShowUploadModal(false);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const uploadRes = await api.post('/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            
            const resData = uploadRes.data;

            // Save to Asset collection (not Media)
            await api.post('/admin/assets', {
                name: selectedFile.name,
                url: resData.url,
                type: uploadType,
                fileSize: selectedFile.size,
            });

            setUploading(false);
            setUploadProgress(0);
            setSelectedFile(null);
            setUploadType(null);
            fetchAssets();
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this asset?')) return;
        try {
            await api.delete(`/admin/assets/${id}`);
            fetchAssets();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const openUploadModal = () => {
        setSelectedFile(null);
        setUploadType(null);
        setShowUploadModal(true);
    };

    const handleCopy = (url, id) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatFileSize = (bytes) => {
        if (!bytes || isNaN(bytes)) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // Group assets by type for folder view
    const groupedAssets = assets.reduce((acc, asset) => {
        const type = asset.type || 'others';
        if (!acc[type]) acc[type] = [];
        acc[type].push(asset);
        return acc;
    }, {});

    const folderConfig = {
        video: { label: 'Videos', icon: FileVideo, lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
        image: { label: 'Images', icon: ImageIcon, lightColor: 'bg-orange-50', textColor: 'text-orange-600' },
        audio: { label: 'Audio', icon: FileAudio, lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    };

    const displayAssets = activeFolder 
        ? (groupedAssets[activeFolder] || []).filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4">
            {/* HERO SECTION */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Database size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Asset Manager</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Asset Vault</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Upload and manage your raw media files (videos, images, audio).</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-800">{assets.length}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Files</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <button 
                        onClick={openUploadModal}
                        className={`bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                {uploadProgress}%
                            </span>
                        ) : (
                            <><Plus size={14} /> Upload New</>
                        )}
                    </button>
                </div>
            </div>

            {/* FOLDER / FILE VIEW */}
            {!activeFolder ? (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">All Folders</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedAssets).map(([type, items]) => {
                            const config = folderConfig[type] || { label: type, icon: File, lightColor: 'bg-slate-50', textColor: 'text-slate-600' };
                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveFolder(type)}
                                    className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center gap-4 hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all group cursor-pointer text-center"
                                >
                                    <div className={`w-16 h-16 ${config.lightColor} rounded-2xl flex items-center justify-center ${config.textColor} group-hover:scale-110 transition-transform`}>
                                        <Folder size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 capitalize">{config.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{items.length} {items.length === 1 ? 'File' : 'Files'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {Object.keys(groupedAssets).length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <Folder className="mx-auto text-slate-200 mb-4" size={48} />
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Assets Yet</h3>
                            <p className="text-xs text-slate-300 mt-2">Click "Upload New" to add your first file.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setActiveFolder(null); setSearchTerm(''); }}
                                className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${(folderConfig[activeFolder] || { lightColor: 'bg-slate-50', textColor: 'text-slate-600' }).lightColor} rounded-xl flex items-center justify-center ${(folderConfig[activeFolder] || { textColor: 'text-slate-600' }).textColor}`}>
                                    <FolderOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 capitalize">{(folderConfig[activeFolder] || { label: activeFolder }).label}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{displayAssets.length} Files</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search in folder..."
                                className="bg-white border border-slate-100 rounded-xl pl-12 pr-6 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 w-full shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayAssets.map((asset) => (
                            <div key={asset._id} className="bg-white rounded-2xl border border-slate-100 group hover:border-indigo-100 hover:shadow-md transition-all overflow-hidden">
                                <div className="h-40 w-full bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                    {activeFolder === 'image' ? (
                                        <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                                    ) : activeFolder === 'video' ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500"><FileVideo size={28} /></div>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Video</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500"><FileAudio size={28} /></div>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Audio</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(asset._id)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{asset.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{asset.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span className="text-[9px] font-bold text-slate-400">{formatFileSize(asset.fileSize)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <button 
                                            onClick={() => handleCopy(asset.url, asset._id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-500 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            {copiedId === asset._id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy URL</>}
                                        </button>
                                        <a href={asset.url} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition-all">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {displayAssets.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <Folder className="mx-auto text-slate-200 mb-4" size={48} />
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Folder is Empty</h3>
                        </div>
                    )}
                </div>
            )}

            {/* UPLOAD MODAL */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Plus size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Upload New Asset</h3>
                                    <p className="text-xs text-slate-400">Select category first, then choose file.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">1. Select File Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'video', label: 'Video', icon: FileVideo },
                                        { id: 'image', label: 'Image', icon: ImageIcon },
                                        { id: 'audio', label: 'Audio', icon: FileAudio },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setUploadType(type.id)}
                                            className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                                                uploadType === type.id 
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' 
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            <type.icon size={24} className="mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`space-y-3 transition-all ${uploadType ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">2. Choose File</label>
                                <div className="relative group">
                                    <input type="file" id="modal-file-upload" className="hidden" onChange={handleFileSelect} />
                                    <label 
                                        htmlFor="modal-file-upload"
                                        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                                            selectedFile ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                                        }`}
                                    >
                                        {selectedFile ? (
                                            <>
                                                <CheckCircle2 size={32} />
                                                <p className="text-sm font-bold truncate max-w-[250px]">{selectedFile.name}</p>
                                                <p className="text-[10px] opacity-60">{formatFileSize(selectedFile.size)} • Ready</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><File size={24} /></div>
                                                <p className="text-xs font-bold text-slate-500">Click to browse</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowUploadModal(false)} className="flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                            <button 
                                onClick={handleUpload}
                                disabled={!selectedFile || !uploadType}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-20"
                            >
                                Start Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetVault;
