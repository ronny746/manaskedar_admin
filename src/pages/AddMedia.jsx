import { useState } from 'react';
import api from '../utils/api';
import { ArrowLeft, Plus, Image as ImageIcon, X, FileVideo, FileAudio, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MediaPicker from '../components/MediaPicker';

const AddMedia = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        description: '',
        thumbnail: '',
        url: '',
        duration: '',
        category: '',
        language: '',
        tags: '',
        isPremium: false,
        rating: '4.5',
        publishingYear: '2024',
    });

    // Picker state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState(null);
    const [pickerFilterType, setPickerFilterType] = useState('all');
    const [pickerTitle, setPickerTitle] = useState('Select Asset');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.url) {
            alert('Title and Content URL are required.');
            return;
        }
        try {
            const payload = {
                ...formData,
                category: formData.category ? formData.category.split(',').map(c => c.trim()).filter(Boolean) : [],
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                duration: formData.duration ? Number(formData.duration) : undefined,
            };
            await api.post('/admin/media', payload);
            navigate('/media');
        } catch (err) {
            console.error('Failed to create media:', err);
            alert('Failed to create: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleReset = () => {
        setFormData({
            title: '', type: 'video', description: '', thumbnail: '', url: '',
            duration: '', category: '', language: '', tags: '', isPremium: false,
            rating: '4.5', publishingYear: '2024',
        });
    };

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

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300";
    const labelClasses = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block";

    return (
        <div className="max-w-7xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/media')} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Create New Content</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fill in the details below</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleReset} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Reset</button>
                    <button onClick={handleSubmit} className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">Create</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 space-y-12">
                {/* CONTENT TYPE */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">Content Type</h3>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                        {[
                            { id: 'video', label: 'Video', icon: FileVideo },
                            { id: 'audio', label: 'Audio', icon: FileAudio },
                            { id: 'short', label: 'Short', icon: Film },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setFormData(prev => ({ ...prev, type: t.id }))}
                                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                    formData.type === t.id 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                }`}
                            >
                                <t.icon size={20} className="mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DETAILS */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className={labelClasses}>Title *</label>
                            <input name="title" value={formData.title} onChange={handleChange} placeholder="Enter title" className={inputClasses} required />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Category</label>
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Action, Drama, Comedy" className={inputClasses} />
                        </div>
                        
                        <div className="space-y-1 flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 w-full">
                                <input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleChange} className="w-4 h-4 accent-indigo-600" />
                                <span className="text-sm font-bold text-slate-600">Premium Content</span>
                            </label>
                        </div>

                        {formData.type === 'video' && (
                            <>
                                <div className="space-y-1">
                                    <label className={labelClasses}>Language</label>
                                    <input name="language" value={formData.language} onChange={handleChange} placeholder="e.g. Hindi, English" className={inputClasses} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClasses}>Duration (seconds)</label>
                                    <input name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="e.g. 3600" className={inputClasses} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClasses}>Rating</label>
                                    <input name="rating" value={formData.rating} onChange={handleChange} placeholder="e.g. 4.8" className={inputClasses} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClasses}>Publishing Year</label>
                                    <input name="publishingYear" value={formData.publishingYear} onChange={handleChange} placeholder="e.g. 2024" className={inputClasses} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClasses}>Tags</label>
                                    <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Comma separated tags" className={inputClasses} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* DESCRIPTION - Video Only */}
                {formData.type === 'video' && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">Description</h3>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter content description" rows="4" className={inputClasses}></textarea>
                    </div>
                )}

                {/* CONTENT URL - Pick from Assets */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">Content Source (Video / Audio)</h3>
                    <div 
                        onClick={() => openPicker('url', formData.type === 'audio' ? 'audio' : 'video', 'Select Content File')}
                        className={`border-2 border-dashed rounded-2xl p-8 flex items-center gap-6 cursor-pointer transition-all ${
                            formData.url ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${formData.url ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                            <FileVideo size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            {formData.url ? (
                                <>
                                    <p className="text-sm font-bold text-emerald-700">File Selected ✓</p>
                                    <p className="text-[10px] text-emerald-500 truncate mt-1">{formData.url}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-slate-600">Click to select from Asset Vault</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Pick a video or audio file from your uploads</p>
                                </>
                            )}
                        </div>
                        {formData.url && (
                            <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, url: '' })); }} className="p-2 bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-100 transition-all shrink-0">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* THUMBNAIL - Pick from Assets */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">Thumbnail Image</h3>
                    <div 
                        onClick={() => openPicker('thumbnail', 'image', 'Select Thumbnail')}
                        className={`border-2 border-dashed rounded-2xl p-8 flex items-center gap-6 cursor-pointer transition-all ${
                            formData.thumbnail ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                    >
                        {formData.thumbnail ? (
                            <div className="w-24 h-16 rounded-xl overflow-hidden border border-emerald-200 shrink-0">
                                <img src={formData.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                                <ImageIcon size={28} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {formData.thumbnail ? (
                                <>
                                    <p className="text-sm font-bold text-emerald-700">Thumbnail Selected ✓</p>
                                    <p className="text-[10px] text-emerald-500 truncate mt-1">{formData.thumbnail}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-slate-600">Click to select from Asset Vault</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Choose an image for the content thumbnail</p>
                                </>
                            )}
                        </div>
                        {formData.thumbnail && (
                            <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, thumbnail: '' })); }} className="p-2 bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-100 transition-all shrink-0">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

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

export default AddMedia;
