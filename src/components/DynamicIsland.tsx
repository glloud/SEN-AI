import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Sparkles,
  Clock,
  ArrowRight,
  Maximize2,
  ChevronRight,
  Radio,
  Calendar,
  Layers,
  Terminal,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface DynamicIslandProps {
  isDocked: boolean;
  onToggleDock: () => void;
  onSubmitPrompt: (prompt: string) => void;
  isListening: boolean;
  wakeDetected: boolean;
  onToggleVoice: () => void;
  activeTimerCountdown?: string | null;
  activeModel: string;
}

export function DynamicIsland({
  isDocked,
  onToggleDock,
  onSubmitPrompt,
  isListening,
  wakeDetected,
  onToggleVoice,
  activeTimerCountdown,
  activeModel,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // When "Hey Sen" is detected by voice wake, expand automatically
  useEffect(() => {
    if (wakeDetected) {
      setIsExpanded(true);
    }
  }, [wakeDetected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSubmitPrompt(quickInput.trim());
    setQuickInput('');
    setIsExpanded(false);
  };

  const handleChipClick = (preset: string) => {
    onSubmitPrompt(preset);
    setIsExpanded(false);
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={`relative flex items-center justify-between bg-black/92 dark:bg-black/95 text-slate-100 backdrop-blur-2xl border border-white/12 shadow-[0_10px_35px_rgba(0,0,0,0.6)] ${
          isExpanded
            ? 'w-[560px] rounded-2xl p-3 flex-col gap-3'
            : 'h-[36px] min-w-[280px] max-w-[420px] rounded-full px-3.5 py-1.5'
        }`}
      >
        {/* Glow halo when voice wake is active */}
        {(wakeDetected || isListening) && (
          <div
            className={`absolute -inset-0.5 rounded-full pointer-events-none transition-opacity duration-300 ${
              wakeDetected
                ? 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500 opacity-80 blur-sm animate-pulse'
                : 'bg-cyan-500/20 opacity-40 blur-xs'
            }`}
          />
        )}

        {/* Compact Mode Content */}
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-between w-full h-full cursor-pointer gap-3 text-xs"
          >
            {/* Left: Camera Notch & SEN indicator */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <div className={`w-1 h-1 rounded-full ${wakeDetected ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                </div>
              </div>
              <span className="font-semibold tracking-wide text-slate-200">SEN</span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {activeTimerCountdown ? `⏱ ${activeTimerCountdown}` : activeModel.replace('gemini-', '')}
              </span>
            </div>

            {/* Center: Live Digital Time */}
            <div className="flex items-center gap-1.5 text-slate-400 font-mono tabular-nums text-[11px]">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{timeStr}</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVoice();
                }}
                className={`p-1 rounded-full hover:bg-white/10 transition-colors ${
                  isListening ? 'text-emerald-400' : 'text-slate-500'
                }`}
                title={isListening ? 'Voice Wake: Active (Say "Hey Sen")' : 'Voice Wake: Paused'}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDock();
                }}
                className={`p-1 rounded-full hover:bg-white/10 transition-colors ${
                  isDocked ? 'text-cyan-400' : 'text-slate-400'
                }`}
                title={isDocked ? 'Collapse Side Workspace' : 'Expand Side Workspace'}
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded HUD Mode */
          <div className="w-full flex flex-col gap-2.5">
            {/* Header row in expanded HUD */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wide text-cyan-400">SEN Dynamic Copilot</span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">{timeStr}</span>
                {wakeDetected && (
                  <span className="text-[10px] text-emerald-400 animate-pulse font-medium">
                    Heard "Hey Sen"!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleVoice}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                    isListening ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  <span>{isListening ? '"Hey Sen" On' : 'Voice Off'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Quick Prompt Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder='Ask SEN, "Schedule lunch at 1pm", or "Set 25m timer"...'
                  className="w-full bg-slate-900/90 text-xs text-slate-100 pl-8 pr-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none placeholder-slate-500 font-sans"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Run</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            {/* Quick Productivity Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
              <button
                type="button"
                onClick={() => handleChipClick('Schedule a team sync tomorrow at 3:00 PM')}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>Schedule Sync</span>
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('Set a 25-minute Pomodoro focus timer')}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>25m Focus</span>
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('Open Calculator and Terminal')}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Launch Tools</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleDock();
                  setIsExpanded(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 ml-auto"
              >
                <Layers className="w-3 h-3" />
                <span>Side Workspace</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
