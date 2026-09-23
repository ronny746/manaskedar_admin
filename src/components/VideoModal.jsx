import { X, Sparkles, Film } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const VideoModal = ({ isOpen, onClose, videoUrl, title, thumbnail }) => {
    if (!isOpen || !videoUrl) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Dialog */}
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col">
                {/* Header */}
                <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                            <Film size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">{title || 'Video Player'}</h3>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <Sparkles size={11} />
                                High Definition Stream
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Video Container */}
                <div className="w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                    <VideoPlayer
                        src={videoUrl}
                        poster={thumbnail}
                        autoPlay={true}
                        controls={true}
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
