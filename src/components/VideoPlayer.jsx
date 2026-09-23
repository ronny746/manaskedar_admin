import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';

const VideoPlayer = ({ 
    src, 
    poster, 
    className = 'w-full h-full object-contain', 
    controls = true, 
    autoPlay = false 
}) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasError(false);

        // Cleanup previous HLS instance if any
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isHls = src.includes('.m3u8');

        if (isHls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 6,
                manifestLoadingRetryDelay: 2000,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
                setHasError(false);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('HLS Network error encountered, recovering...', data);
                            // If stream is still processing on CDN, retry loading after short pause
                            setTimeout(() => {
                                if (hlsRef.current) hlsRef.current.startLoad();
                            }, 2500);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn('HLS Media error encountered, recovering...', data);
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal HLS error, destroying instance:', data);
                            hls.destroy();
                            setHasError(true);
                            setIsLoading(false);
                            break;
                    }
                }
            });
        } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari / iOS HLS
            video.src = src;
            video.onloadedmetadata = () => {
                setIsLoading(false);
                setHasError(false);
            };
            video.onerror = () => {
                setHasError(true);
                setIsLoading(false);
            };
        } else {
            // Standard MP4 / WebM / Direct URL
            video.src = src;
            video.onloadeddata = () => {
                setIsLoading(false);
                setHasError(false);
            };
            video.onerror = () => {
                // If src was m3u8 and failed, try mp4 fallback if it is a bunny URL
                if (src.includes('vz-') && src.includes('playlist.m3u8')) {
                    const fallbackMp4 = src.replace('playlist.m3u8', 'play_720p.mp4');
                    video.src = fallbackMp4;
                } else {
                    setHasError(true);
                    setIsLoading(false);
                }
            };
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, retryCount]);

    const handleManualRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                poster={poster}
                controls={controls}
                autoPlay={autoPlay}
                playsInline
                className={className}
                onPlaying={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
            />

            {/* Error Overlay with Retry */}
            {hasError && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                    <AlertCircle size={28} className="text-rose-500 mb-2" />
                    <p className="text-xs font-bold text-white">Stream is preparing...</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        Adaptive HLS segments are transcoding on CDN. Click retry to refresh player.
                    </p>
                    <button
                        type="button"
                        onClick={handleManualRetry}
                        className="mt-3 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                        <RefreshCw size={13} />
                        Retry Stream
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
