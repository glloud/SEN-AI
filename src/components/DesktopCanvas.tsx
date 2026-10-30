import React, { useRef, useEffect } from 'react';
import { VideoOff } from 'lucide-react';

interface DesktopCanvasProps {
  stream: MediaStream | null;
  onToggleMirror: () => void;
  accentColor?: string;
  mainColor?: string;
}

export function DesktopCanvas({
  stream,
  onToggleMirror,
  accentColor = '#06b6d4',
  mainColor = '#0a0a0c',
}: DesktopCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const isElectron = typeof window !== 'undefined' && Boolean((window as any).electronAPI);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // When running as a native Windows Electron overlay, the user's real desktop is behind the window.
  // We do NOT render a solid wallpaper background over their desktop.
  if (isElectron && !stream) {
    return null;
  }

  return (
    <div className={`fixed inset-0 overflow-hidden select-none pointer-events-none transition-colors duration-500 ${
      isElectron ? 'bg-transparent' : (isLight ? 'bg-[#f4f4f7]' : 'bg-[#08090d]')
    }`}>
      {/* If live Windows screen mirror is active, show the user's real screen */}
      {stream ? (
        <div className="relative w-full h-full pointer-events-auto" data-interactive="true">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Subtle live indicator badge at bottom left */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 z-10">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span>Live Screen Overlay</span>
            <button
              onClick={onToggleMirror}
              className="text-slate-400 hover:text-red-400 ml-1 transition-colors"
              title="Stop Mirroring"
            >
              <VideoOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Clean, minimal ambient backdrop for notch & tray focus — NO fake OS icons */
        <div className="relative w-full h-full flex flex-col justify-between p-6">
          {/* Ambient subtle glow */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-colors duration-700"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
    </div>
  );
}
