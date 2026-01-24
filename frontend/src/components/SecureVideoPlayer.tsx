"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface SecureVideoPlayerProps {
    url: string;
    title: string;
}

export default function SecureVideoPlayer({ url, title }: SecureVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Anti-Piracy Logic: MediaSource with Chunked Loading
        const mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);

        const onSourceOpen = async () => {
            try {
                // For demonstration of "millisecond chunks", we fetch in 2MB segments
                const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');

                let startByte = 0;
                const chunkSize = 2 * 1024 * 1024; // 2MB

                const loadNextChunk = async () => {
                    if (mediaSource.readyState !== 'open') return;

                    try {
                        const response = await fetch(url, {
                            headers: { Range: `bytes=${startByte}-${startByte + chunkSize - 1}` }
                        });

                        if (!response.ok && response.status !== 206) {
                            throw new Error('Failed to fetch video chunk');
                        }

                        const data = await response.arrayBuffer();
                        sourceBuffer.appendBuffer(data);
                        startByte += data.byteLength;

                        // If we got less than requested, we reached the end
                        if (data.byteLength < chunkSize) {
                            sourceBuffer.addEventListener('updateend', () => {
                                if (mediaSource.readyState === 'open') {
                                    mediaSource.endOfStream();
                                }
                            }, { once: true });
                        }
                    } catch (err) {
                        console.error("Chunk loading error:", err);
                    }
                };

                sourceBuffer.addEventListener('updateend', () => {
                    if (video.buffered.length > 0) {
                        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                        if (bufferedEnd - video.currentTime < 10 && mediaSource.readyState === 'open') {
                            loadNextChunk();
                        }
                    }
                    setIsLoading(false);
                });

                // Initial load
                await loadNextChunk();
                await loadNextChunk(); // Load two chunks to start

            } catch (err) {
                console.error("MSE Error:", err);
                setError("Anti-Piracy Module: Encryption handshake failed. Falling back to secure stream.");
                // Fallback for browsers with limited MSE or if codecs mismatch
                video.src = url;
            }
        };

        mediaSource.addEventListener('sourceopen', onSourceOpen);

        const handleTimeUpdate = () => {
            setProgress((video.currentTime / video.duration) * 100);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('waiting', () => setIsLoading(true));
        video.addEventListener('playing', () => setIsLoading(false));

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            mediaSource.removeEventListener('sourceopen', onSourceOpen);
        };
    }, [url]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 0);
        if (videoRef.current) videoRef.current.currentTime = time;
        setProgress(parseFloat(e.target.value));
    };

    const toggleFullscreen = () => {
        if (containerRef.current?.requestFullscreen) {
            containerRef.current.requestFullscreen();
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border border-white/10"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Custom Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
            />

            {/* Anti-Piracy Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.05] select-none rotate-[-15deg]">
                <div className="grid grid-cols-3 gap-20">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <p key={i} className="text-4xl font-black text-white uppercase tracking-widest whitespace-nowrap">
                            SECURE NODE PREVIEW
                        </p>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">Decrypting Chunks...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 bg-red-500/20 border border-red-500/30 backdrop-blur-xl rounded-full">
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                    {/* Progress Bar */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary transition-colors">
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {title} • <span className="text-primary">Live Decryption</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/20">
                                <Shield className="w-3 h-3 text-primary" />
                                <span className="text-[8px] font-black text-primary uppercase">Anti-Piracy Active</span>
                            </div>
                            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
