import React from 'react';

interface SenAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customAvatarUrl?: string | null;
}

export function SenAvatar({
  isListening = false,
  isSpeaking = false,
  size = 'md',
  customAvatarUrl = null,
}: SenAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  // If user provides a custom image/avatar later, render it cleanly
  if (customAvatarUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-cyan-400/40 shadow-lg`}>
        <img
          src={customAvatarUrl}
          alt="SEN Avatar"
          className="w-full h-full object-cover"
        />
        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none" />
        )}
      </div>
    );
  }

  // Hitodama-inspired ethereal glowing companion avatar slot
  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center select-none group cursor-pointer`}
      title="SEN Companion Avatar (Slot ready for your custom avatar)"
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isListening
            ? 'bg-gradient-to-tr from-cyan-500 via-emerald-400 to-indigo-500 opacity-90 blur-md animate-pulse scale-110'
            : isSpeaking
            ? 'bg-gradient-to-tr from-amber-400 via-cyan-400 to-purple-500 opacity-80 blur-md animate-spin'
            : 'bg-cyan-500/30 opacity-60 blur-xs group-hover:opacity-90'
        }`}
      />

      {/* Core spirit orb body */}
      <div className="relative w-full h-full rounded-full bg-radial from-slate-900 via-[#0B1528] to-black border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Internal energetic flame core */}
        <div
          className={`w-3/5 h-3/5 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-300 opacity-90 blur-[1px] transition-transform duration-300 ${
            isListening
              ? 'scale-125 animate-bounce'
              : isSpeaking
              ? 'scale-110 animate-pulse'
              : 'scale-90 group-hover:scale-100'
          }`}
        />

        {/* Eyes / Visor dots */}
        <div className="absolute flex items-center gap-1">
          <div
            className={`w-1 h-1 rounded-full bg-white transition-all ${
              isListening ? 'scale-150 bg-cyan-200' : 'scale-100'
            }`}
          />
          <div
            className={`w-1 h-1 rounded-full bg-white transition-all ${
              isListening ? 'scale-150 bg-cyan-200' : 'scale-100'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
