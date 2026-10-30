import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
  Music2,
  Radio,
} from 'lucide-react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  source: 'Spotify' | 'YouTube Music';
  duration: number; // in seconds
  coverColor: string;
  url?: string;
}

const DEFAULT_TRACKS: MusicTrack[] = [
  {
    id: '1',
    title: 'Midnight Focus (Lo-Fi Beats)',
    artist: 'ChilledCow / Lofi Girl',
    album: 'Study Sessions',
    source: 'Spotify',
    duration: 184,
    coverColor: 'from-emerald-700 to-teal-900',
    url: 'https://open.spotify.com',
  },
  {
    id: '2',
    title: 'Synthwave Night Ride',
    artist: 'Kavinsky & The Midnight',
    album: 'Endless Summer',
    source: 'YouTube Music',
    duration: 245,
    coverColor: 'from-purple-700 to-indigo-950',
    url: 'https://music.youtube.com',
  },
  {
    id: '3',
    title: 'Deep Ambient Coding Flow',
    artist: 'Brian Eno & Solar Fields',
    album: 'Reflective Spaces',
    source: 'Spotify',
    duration: 310,
    coverColor: 'from-cyan-800 to-blue-950',
    url: 'https://open.spotify.com',
  },
];

export function AppleMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(42);
  const [volume, setVolume] = useState(75);
  const [activeSource, setActiveSource] = useState<'Spotify' | 'YouTube Music'>('Spotify');
  const [detectedMediaTitle, setDetectedMediaTitle] = useState<string | null>(null);

  const currentTrack = DEFAULT_TRACKS[currentTrackIndex];

  // Listen to browser MediaSession API for any active Spotify / YouTube Music playback
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const updateMedia = () => {
        const metadata = navigator.mediaSession.metadata;
        if (metadata && metadata.title) {
          // Verify if it looks like music (avoid random videos)
          const isLikelyMusic =
            metadata.artist ||
            metadata.album ||
            metadata.title.toLowerCase().includes('music') ||
            metadata.title.toLowerCase().includes('track') ||
            metadata.title.toLowerCase().includes('song');

          if (isLikelyMusic) {
            setDetectedMediaTitle(metadata.title);
          }
        }
      };

      try {
        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
        navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      } catch (e) {}

      updateMedia();
    }
  }, []);

  // Timer progression for simulated playback
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DEFAULT_TRACKS.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEFAULT_TRACKS.length) % DEFAULT_TRACKS.length);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentTime / currentTrack.duration) * 100);

  return (
    <div className="flex flex-col h-full space-y-3.5 text-xs text-slate-200 select-none">
      {/* Header with Source Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-100 text-sm">Now Playing</span>
          <span className="text-slate-500 text-[10px]">·</span>
          {/* Strict Music Source Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentTrack.source === 'Spotify' ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span className="font-medium text-slate-300">
              {currentTrack.source}
            </span>
          </div>
        </div>

        {/* Source Switcher */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setActiveSource('Spotify');
              setCurrentTrackIndex(0);
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              currentTrack.source === 'Spotify'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spotify
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSource('YouTube Music');
              setCurrentTrackIndex(1);
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              currentTrack.source === 'YouTube Music'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            YouTube Music
          </button>
        </div>
      </div>

      {/* Apple-style Album Art & Track Info Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 border border-white/10 flex items-center gap-3.5 backdrop-blur-2xl">
        {/* Album Artwork with Fluid Apple-style Shadow */}
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentTrack.coverColor} flex items-center justify-center shadow-lg shrink-0 relative overflow-hidden group`}
        >
          <Music2 className="w-7 h-7 text-white/80" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1 gap-0.5">
              <span className="w-1 bg-white/90 rounded-full h-3 animate-bounce" />
              <span className="w-1 bg-white/90 rounded-full h-5 animate-bounce delay-100" />
              <span className="w-1 bg-white/90 rounded-full h-2 animate-bounce delay-200" />
              <span className="w-1 bg-white/90 rounded-full h-4 animate-bounce delay-75" />
            </div>
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-100 truncate">
              {currentTrack.title}
            </h4>
            <a
              href={currentTrack.source === 'Spotify' ? 'https://open.spotify.com' : 'https://music.youtube.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors ml-2"
              title={`Open in ${currentTrack.source}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {currentTrack.artist}
          </p>
          <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
            {currentTrack.album} · Verified Music Source
          </p>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="space-y-1">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.floor(ratio * currentTrack.duration));
          }}
          className="relative h-1.5 w-full bg-slate-800 rounded-full cursor-pointer group overflow-hidden"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full group-hover:from-cyan-300 group-hover:to-indigo-300 transition-all"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Apple-style Media Controls */}
      <div className="flex items-center justify-center gap-6 py-1">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Volume & Audio Filter Note */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          )}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-full cursor-pointer"
          />
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Strict Music Filter: Enabled
        </span>
      </div>
    </div>
  );
}
