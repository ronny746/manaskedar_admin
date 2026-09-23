import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import VideoPlayer from '../components/VideoPlayer';
import { 
    ArrowLeft, UploadCloud, Film, Video, Music, Image as ImageIcon, 
    Sparkles, CheckCircle2, AlertCircle, X, Play, Clock, Star, 
    Globe, Tag, Eye, RefreshCw, FolderArchive, Link as LinkIcon, 
    Check, Plus, Trash2, Save, Bell
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MediaPicker from '../components/MediaPicker';

const PRESET_CATEGORIES = [
    'Movies', 'Short Film', 'Web Series', 'Music Video', 
    'Devotional', 'Comedy', 'Action', 'Drama', 'Romance', 
    'Documentary', 'Podcast', 'Trailer'
];

const PRESET_LANGUAGES = ['Hindi', 'English', 'Bhojpuri', 'Punjabi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];

const EditMedia = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoInputRef = useRef(null);
    const thumbInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        description: '',
        thumbnail: '',
        url: '',
        duration: '',
        category: [],
        language: 'Hindi',
        tags: [],
        isPremium: false,
        notifyUsers: false,
        rating: '4.8',
        publishingYear: new Date().getFullYear().toString(),
    });

    const [tagInput, setTagInput] = useState('');
    const [customCatInput, setCustomCatInput] = useState('');

    // Source mode tabs: 'upload' | 'url' | 'vault'
    const [mediaSourceMode, setMediaSourceMode] = useState('upload');

    // Upload status states
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoBytesLoaded, setVideoBytesLoaded] = useState(0);
    const [videoBytesTotal, setVideoBytesTotal] = useState(0);
    const [videoFileName, setVideoFileName] = useState('');
    const [videoFileSize, setVideoFileSize] = useState('');

    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const [thumbUploadProgress, setThumbUploadProgress] = useState(0);

    // Modal Picker
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState(null);
    const [pickerFilterType, setPickerFilterType] = useState('all');
    const [pickerTitle, setPickerTitle] = useState('Select Asset');

    const formatBytes = (bytes) => {
        if (!bytes || isNaN(bytes)) return '';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    useEffect(() => {
        const fetchMediaDetails = async () => {
            try {
                const { data } = await api.get(`/admin/media/${id}`);
                setFormData({
                    title: data.title || '',
                    type: data.type || 'video',
                    description: data.description || '',
                    thumbnail: data.thumbnail || '',
                    url: data.url || '',
                    hlsUrl: data.hlsUrl || (data.url?.endsWith('.m3u8') ? data.url : ''),
                    originalUrl: data.originalUrl || '',
                    bunnyVideoId: data.bunnyVideoId || '',
                    duration: data.duration?.toString() || '',
                    category: Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []),
                    language: data.language || 'Hindi',
                    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
                    isPremium: data.isPremium || false,
                    rating: data.rating?.toString() || '4.8',
                    publishingYear: data.publishingYear?.toString() || '2024',
                });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch media details');
                setErrorMessage('Failed to load content details');
                setLoading(false);
            }
        };
        fetchMediaDetails();
    }, [id]);

    // Handle Direct Video Upload
    const handleVideoFileChange = async (file) => {
        if (!file) return;
        setVideoFileName(file.name);
        setVideoFileSize(formatBytes(file.size));
        setVideoBytesTotal(file.size);
        setVideoBytesLoaded(0);

        setIsUploadingVideo(true);
        setVideoUploadProgress(0);
        setErrorMessage('');

        try {
            // Request direct authorization from backend
            const authRes = await api.post('/admin/bunny-upload-auth', { title: file.name });
            const { uploadUrl, apiKey, hlsUrl, thumbnailUrl, videoId } = authRes.data;

            // Stream directly from browser to Bunny CDN
            await axios.put(uploadUrl, file, {
                headers: {
                    AccessKey: apiKey,
                    'Content-Type': 'application/octet-stream',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        setVideoBytesLoaded(progressEvent.loaded);
                        setVideoBytesTotal(progressEvent.total);
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setVideoUploadProgress(Math.min(99, percent));
                    }
                },
            });

            setFormData(prev => ({ 
                ...prev, 
                url: hlsUrl,
                hlsUrl: hlsUrl,
                thumbnail: prev.thumbnail || thumbnailUrl || '',
                bunnyVideoId: videoId || ''
            }));
            setVideoUploadProgress(100);

        } catch (bunnyErr) {
            console.warn('Direct upload fallback to server pipeline:', bunnyErr);
            const uploadData = new FormData();
            uploadData.append('file', file);

            try {
                const res = await api.post('/admin/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            setVideoBytesLoaded(progressEvent.loaded);
                            setVideoBytesTotal(progressEvent.total);
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setVideoUploadProgress(Math.min(99, percent));
                        }
                    }
                });

                if (res.data?.url) {
                    setFormData(prev => ({ 
                        ...prev, 
                        url: res.data.url,
                        hlsUrl: res.data.hlsUrl || res.data.url,
                        originalUrl: res.data.originalUrl || '',
                        thumbnail: prev.thumbnail || res.data.thumbnail || '',
                        bunnyVideoId: res.data.bunnyVideoId || ''
                    }));
                    setVideoUploadProgress(100);
                }
            } catch (err) {
                console.error('Video upload failed:', err);
                setErrorMessage('Video upload failed: ' + (err.response?.data?.error || err.message));
            }
        } finally {
            setIsUploadingVideo(false);
        }
    };

    // Handle Direct Thumbnail Upload
    const handleThumbFileChange = async (file) => {
        if (!file) return;
        setIsUploadingThumb(true);
        setThumbUploadProgress(0);
        setErrorMessage('');

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/admin/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setThumbUploadProgress(percent);
                }
            });

            if (res.data?.url) {
                setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
            }
        } catch (err) {
            console.error('Thumbnail upload failed:', err);
            setErrorMessage('Thumbnail upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsUploadingThumb(false);
        }
    };

    // Category Toggle Handler
    const toggleCategory = (cat) => {
        setFormData(prev => {
            const exists = prev.category.includes(cat);
            return {
                ...prev,
                category: exists ? prev.category.filter(c => c !== cat) : [...prev.category, cat]
            };
        });
    };

    // Add Custom Category
    const handleAddCustomCategory = () => {
        if (!customCatInput.trim()) return;
        if (!formData.category.includes(customCatInput.trim())) {
            setFormData(prev => ({ ...prev, category: [...prev.category, customCatInput.trim()] }));
        }
        setCustomCatInput('');
    };

    // Add Tag on Enter
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput.trim().replace(/^#/, '');
            if (val && !formData.tags.includes(val)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    // Modal Picker Handlers
    const openPicker = (target, filter, title) => {
        setPickerTarget(target);
        setPickerFilterType(filter);
        setPickerTitle(title);
        setPickerOpen(true);
    };

    const handlePickerSelect = (asset) => {
        if (pickerTarget) {
            setFormData(prev => ({ ...prev, [pickerTarget]: asset.url }));
        }
    };

    // Update Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.title.trim()) {
            setErrorMessage('Please enter a content title.');
            return;
        }

        if (!formData.url.trim()) {
            setErrorMessage('Please provide a video/audio content URL.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: formData.title.trim(),
                type: formData.type,
                description: formData.description.trim(),
                thumbnail: formData.thumbnail.trim(),
                url: formData.url.trim(),
                hlsUrl: formData.hlsUrl?.trim() || formData.url.trim(),
                originalUrl: formData.originalUrl?.trim() || '',
                bunnyVideoId: formData.bunnyVideoId || '',
                duration: formData.duration ? Number(formData.duration) : 0,
                category: formData.category,
                language: formData.language,
                tags: formData.tags,
                isPremium: formData.isPremium,
                notifyUsers: formData.notifyUsers,
                rating: formData.rating,
                publishingYear: formData.publishingYear,
            };

            await api.put(`/admin/media/${id}`, payload);
            navigate('/media');
        } catch (err) {
            console.error('Failed to update media:', err);
            setErrorMessage(err.response?.data?.error || 'Failed to update media content.');
            setSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to permanently delete this content?')) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/media/${id}`);
            navigate('/media');
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
            setDeleting(false);
        }
    };

    const formatDurationDisplay = (sec) => {
        if (!sec || isNaN(sec)) return '0 min';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m > 0 ? `${m}m ${s > 0 ? s + 's' : ''}` : `${s}s`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 max-w-7xl mx-auto">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5">
                    <button 
                        onClick={() => navigate('/media')}
                        className="w-10 h-10 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Edit Content</h2>
                        <p className="text-xs text-slate-500 font-medium">Update media stream, metadata, and thumbnail</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <Trash2 size={14} />
                        {deleting ? 'Deleting...' : 'Delete Content'}
                    </button>

                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || isUploadingVideo || isUploadingThumb}
                        className="btn-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw size={14} className="animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Save size={15} />
                                Save Changes
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ERROR NOTIFICATION */}
            {errorMessage && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT MAIN FORM (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 1. CONTENT TYPE SELECTOR */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                            1. Content Format
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'video', label: 'Full Video / Movie', icon: Video },
                                { id: 'short', label: 'Short / Reel', icon: Film },
                                { id: 'audio', label: 'Audio / Podcast', icon: Music },
                            ].map(t => {
                                const Icon = t.icon;
                                const isSelected = formData.type === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: t.id }))}
                                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
                                            isSelected 
                                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm' 
                                                : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon size={18} className="mb-1.5" />
                                        <span className="text-xs font-bold text-slate-900">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. MEDIA FILE SOURCE (UPLOAD / URL / VAULT) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                    2. Content Stream Source <span className="text-rose-500">*</span>
                                </label>
                                <p className="text-xs text-slate-400">Update file or modify the cloud stream URL</p>
                            </div>

                            {/* Source Mode Switcher */}
                            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setMediaSourceMode('url')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        mediaSourceMode === 'url' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <LinkIcon size={13} />
                                    Stream URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaSourceMode('upload')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        mediaSourceMode === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <UploadCloud size={13} />
                                    Replace File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openPicker('url', formData.type === 'audio' ? 'audio' : 'video', 'Select Media from Vault')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-1.5"
                                >
                                    <FolderArchive size={13} />
                                    Vault Picker
                                </button>
                            </div>
                        </div>

                        {/* MODE: DIRECT URL INPUT */}
                        {mediaSourceMode === 'url' && (
                            <div className="space-y-3">
                                <div className="relative">
                                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                    <input 
                                        type="url"
                                        placeholder="https://cdn.manaskedar.com/videos/your-video.mp4 or HLS .m3u8 link"
                                        value={formData.url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                        className="input-field pl-10 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        )}

                        {/* MODE: DIRECT FILE UPLOAD */}
                        {mediaSourceMode === 'upload' && (
                            <div>
                                <input 
                                    ref={videoInputRef}
                                    type="file" 
                                    accept={formData.type === 'audio' ? 'audio/*' : 'video/*'}
                                    className="hidden"
                                    onChange={(e) => handleVideoFileChange(e.target.files[0])}
                                />

                                {isUploadingVideo ? (
                                    <div className="border-2 border-indigo-300 bg-indigo-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                        <div className="w-full max-w-md space-y-4 py-3">
                                            <div className="w-14 h-14 bg-white border border-indigo-200 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                                                <RefreshCw size={26} className="animate-spin text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
                                                    <span className="truncate max-w-[240px]">
                                                        {videoUploadProgress < 100 
                                                            ? `Uploading ${videoFileName || 'video'}...` 
                                                            : '⚡ Finalizing 1080p Master Stream...'}
                                                    </span>
                                                    <span className="text-indigo-600 font-extrabold text-sm ml-2">{videoUploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden shadow-inner">
                                                    <div 
                                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                                                        style={{ width: `${videoUploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mt-2">
                                                    <span>
                                                        {videoBytesTotal > 0 
                                                            ? `${formatBytes(videoBytesLoaded)} of ${formatBytes(videoBytesTotal)} uploaded`
                                                            : `${videoFileSize || 'Payload transfer'}`}
                                                    </span>
                                                    <span className="text-indigo-600 font-bold">
                                                        {videoUploadProgress < 100 ? 'Direct Cloud Ingestion' : 'Processing...'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                Zero-loss quality stream with adaptive bitrate for instant mobile playback.
                                            </p>
                                        </div>
                                    </div>
                                ) : formData.url ? (
                                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="font-bold text-white truncate max-w-xs">{videoFileName || formData.title || 'Master Video Ready'}</span>
                                                {videoFileSize && (
                                                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                                                        {videoFileSize}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Sparkles size={10} /> 1080p Stream
                                                </span>
                                            </div>
                                        </div>

                                        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                                            <VideoPlayer
                                                src={formData.url}
                                                poster={formData.thumbnail}
                                                controls={true}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => videoInputRef.current?.click()}
                                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <UploadCloud size={14} />
                                                    Replace Video
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, url: '', hlsUrl: '', bunnyVideoId: '' }))}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/70 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <X size={14} />
                                                    Clear
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                ⚡ Ready to update • Zero buffering on mobile
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => videoInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files?.[0]) handleVideoFileChange(e.dataTransfer.files[0]);
                                        }}
                                        className="border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/50 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                                            <UploadCloud size={28} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800">
                                            Drag & Drop your {formData.type === 'audio' ? 'Audio' : 'Video'} file here, or <span className="text-indigo-600 underline">Browse</span>
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1">Supports MP4, MOV, MKV, WebM, MP3, AAC up to 2GB</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. BASIC METADATA */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            3. Title & Content Details
                        </label>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Content Title <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text"
                                placeholder="Content title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="input-field text-sm font-semibold"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                            <textarea 
                                rows="3"
                                placeholder="Storyline or synopsis..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="input-field resize-none text-xs"
                            ></textarea>
                        </div>

                        {/* CATEGORIES PRESETS */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {PRESET_CATEGORIES.map(cat => {
                                    const active = formData.category.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                active 
                                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {active && <Check size={12} />}
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Category Add */}
                            <div className="flex gap-2 max-w-xs">
                                <input 
                                    type="text"
                                    placeholder="Add custom category..."
                                    value={customCatInput}
                                    onChange={(e) => setCustomCatInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); } }}
                                    className="input-field py-2 text-xs"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddCustomCategory}
                                    className="btn-secondary px-3 py-2 text-xs shrink-0"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* TAGS PILLS */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Tags</label>
                            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-rose-500">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                <input 
                                    type="text"
                                    placeholder="Type tag & press enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="bg-transparent border-none text-xs focus:outline-none flex-1 min-w-[140px] px-1 text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: THUMBNAIL, PREVIEW & SETTINGS (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* THUMBNAIL UPLOAD / PICKER */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                Thumbnail Poster
                            </label>
                            <button
                                type="button"
                                onClick={() => openPicker('thumbnail', 'image', 'Select Thumbnail from Vault')}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <FolderArchive size={12} />
                                From Vault
                            </button>
                        </div>

                        <input 
                            ref={thumbInputRef}
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleThumbFileChange(e.target.files[0])}
                        />

                        {formData.thumbnail ? (
                            <div className="space-y-2">
                                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video shadow-sm">
                                    <img 
                                        src={formData.thumbnail} 
                                        alt="Thumbnail Poster" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => thumbInputRef.current?.click()}
                                            className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold shadow-md hover:bg-slate-50"
                                        >
                                            Change Poster
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                            className="p-1.5 bg-rose-600 text-white rounded-lg text-xs hover:bg-rose-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => thumbInputRef.current?.click()}
                                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <ImageIcon size={13} />
                                        Upload Custom Poster
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => thumbInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-video"
                            >
                                {isUploadingThumb ? (
                                    <div className="space-y-2 text-center">
                                        <RefreshCw size={20} className="animate-spin text-indigo-600 mx-auto" />
                                        <span className="text-xs font-bold text-slate-600">{thumbUploadProgress}% Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon size={28} className="text-slate-400 mb-2" />
                                        <p className="text-xs font-bold text-slate-700">Click or Drop Poster</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (16:9 Recommended)</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* LIVE MEDIA PREVIEW */}
                    {formData.url && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Eye size={14} className="text-indigo-600" />
                                    Live Stream Player
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                            </div>

                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                                {formData.type === 'audio' ? (
                                    <div className="p-4 w-full">
                                        <audio controls src={formData.url} className="w-full" />
                                    </div>
                                ) : (
                                    <VideoPlayer 
                                        controls 
                                        src={formData.url} 
                                        poster={formData.thumbnail}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* ADDITIONAL SETTINGS */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Publishing Settings
                        </label>

                        {/* Premium Toggle */}
                        <div 
                            onClick={() => setFormData(prev => ({ ...prev, isPremium: !prev.isPremium }))}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                formData.isPremium 
                                    ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm' 
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.isPremium ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    <Star size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Premium Exclusive</p>
                                    <p className="text-[10px] text-slate-400">Requires active subscription</p>
                                </div>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={formData.isPremium} 
                                onChange={() => {}} 
                                className="w-4 h-4 accent-amber-500 pointer-events-none"
                            />
                        </div>

                        {/* Push Notification Broadcast Toggle */}
                        <div 
                            onClick={() => setFormData(prev => ({ ...prev, notifyUsers: !prev.notifyUsers }))}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                                formData.notifyUsers 
                                    ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-sm' 
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.notifyUsers ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                                        <Bell size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold flex items-center gap-1.5">
                                            Notify Users of Update
                                            {formData.notifyUsers && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">ON</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-500">Send push notification about this update</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={formData.notifyUsers} 
                                    onChange={() => {}} 
                                    className="w-4 h-4 accent-indigo-600 pointer-events-none"
                                />
                            </div>
                            {formData.notifyUsers && (
                                <div className="mt-1 p-2.5 rounded-lg bg-indigo-100/70 border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2">
                                    <Sparkles size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-indigo-950">Notification Preview: </span>
                                        <span className="italic">&quot;🔥 Updated: {formData.title || 'Sacred Content'}&quot;</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Language</label>
                            <select 
                                value={formData.language}
                                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                                className="input-field text-xs py-2.5"
                            >
                                {PRESET_LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Duration & Year */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Duration ({formatDurationDisplay(formData.duration)})
                                </label>
                                <input 
                                    type="number"
                                    placeholder="Secs e.g. 180"
                                    value={formData.duration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                    className="input-field text-xs py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Year</label>
                                <input 
                                    type="text"
                                    value={formData.publishingYear}
                                    onChange={(e) => setFormData(prev => ({ ...prev, publishingYear: e.target.value }))}
                                    className="input-field text-xs py-2"
                                />
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Rating (Out of 5.0)</label>
                            <input 
                                type="text"
                                placeholder="4.8"
                                value={formData.rating}
                                onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                                className="input-field text-xs py-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Vault Picker Modal */}
            <MediaPicker 
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handlePickerSelect}
                filterType={pickerFilterType}
                title={pickerTitle}
            />
        </div>
    );
};

export default EditMedia;
