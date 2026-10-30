import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  RotateCcw,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ExternalLink,
  Calendar,
  Settings,
  Volume2,
} from 'lucide-react';
import { Message, CalendarEvent } from '../types.ts';
import { ControlsCategory } from './categories/ControlsCategory.tsx';
import { TodayCategory } from './categories/TodayCategory.tsx';
import { StatsCategory } from './categories/StatsCategory.tsx';
import { ClipboardCategory } from './categories/ClipboardCategory.tsx';
import { AppsCategory, AppItem } from './categories/AppsCategory.tsx';
import { PowerCategory } from './categories/PowerCategory.tsx';

interface DynamicLakeNotchProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  calendarEvents: CalendarEvent[];
  isListening: boolean;
  wakeDetected: boolean;
  onClearChat: () => void;
  mainColor: string;
  accentColor: string;
  pinnedCity: string;
  onUpdateCity: (city: string) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  musicSource: 'Spotify' | 'YouTube Music';
  onOpenSimulatedApp: (appId: string) => void;
  onTriggerPowerAction: (act: 'lock' | 'sleep' | 'restart' | 'shutdown') => void;
  customApps: AppItem[];
  onAddCustomApp: (app: AppItem) => void;
  onOpenSettings?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
}

type CategoryTab = 'controls' | 'today' | 'stats' | 'clipboard' | 'apps' | 'power';

const CATEGORIES: { id: CategoryTab; label: string }[] = [
  { id: 'controls', label: 'Controls' },
  { id: 'today', label: 'Today' },
  { id: 'stats', label: 'Stats' },
  { id: 'clipboard', label: 'Clipboard' },
  { id: 'apps', label: 'Apps' },
  { id: 'power', label: 'Power' },
];

export function DynamicLakeNotch({
  messages,
  onSendMessage,
  isLoading,
  calendarEvents,
  isListening,
  wakeDetected,
  onClearChat,
  mainColor,
  accentColor,
  pinnedCity,
  onUpdateCity,
  isPlayingMusic,
  onToggleMusic,
  musicSource,
  onOpenSimulatedApp,
  onTriggerPowerAction,
  customApps,
  onAddCustomApp,
  onOpenSettings,
  onExpandedChange,
}: DynamicLakeNotchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('controls');
  const [inputText, setInputText] = useState('');
  const [trackProgress, setTrackProgress] = useState(42);

  // Live Web Media Session State
  const [mediaTitle, setMediaTitle] = useState('Midnight Ambient Flow');
  const [mediaArtist, setMediaArtist] = useState('Lo-Fi Chill & Focus');
  const [mediaAlbumArt, setMediaAlbumArt] = useState<string | null>(null);
  const [isSystemMediaPlaying, setIsSystemMediaPlaying] = useState(isPlayingMusic);

  const notchRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<any>(null);

  // Synchronize system Web Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const updateMediaState = () => {
        if (navigator.mediaSession.metadata) {
          const meta = navigator.mediaSession.metadata;
          if (meta.title) setMediaTitle(meta.title);
          if (meta.artist) setMediaArtist(meta.artist);
          if (meta.artwork && meta.artwork.length > 0) {
            setMediaAlbumArt(meta.artwork[meta.artwork.length - 1].src);
          }
        }
        if (navigator.mediaSession.playbackState) {
          setIsSystemMediaPlaying(navigator.mediaSession.playbackState === 'playing');
        }
      };

      updateMediaState();
      const interval = setInterval(updateMediaState, 1200);
      return () => clearInterval(interval);
    }
  }, []);

  const activePlaying = isPlayingMusic || isSystemMediaPlaying;

  const setExpandedWithMotion = useCallback((target: boolean | ((prev: boolean) => boolean)) => {
    setIsTransitioning(true);
    setIsExpanded((prev) => {
      const next = typeof target === 'function' ? target(prev) : target;
      if (onExpandedChange) onExpandedChange(next);
      return next;
    });
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  }, [onExpandedChange]);

  // Auto expand on wake word
  useEffect(() => {
    if (wakeDetected && !isExpanded) {
      setExpandedWithMotion(true);
    }
  }, [wakeDetected, isExpanded, setExpandedWithMotion]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notchRef.current && !notchRef.current.contains(event.target as Node)) {
        setExpandedWithMotion(false);
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, setExpandedWithMotion]);

  // Global hotkey Ctrl+Shift+Space to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setExpandedWithMotion((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setExpandedWithMotion]);

  // Track progress ticker
  useEffect(() => {
    let interval: any = null;
    if (activePlaying) {
      interval = setInterval(() => {
        setTrackProgress((p) => (p >= 210 ? 0 : p + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activePlaying]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isExpanded) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const liquidSpring = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 28,
    mass: 0.7,
  };

  return (
    <div
      ref={notchRef}
      data-interactive="true"
      onMouseEnter={() => {
        if ((window as any).electronAPI?.setIgnoreMouseEvents) {
          (window as any).electronAPI.setIgnoreMouseEvents(false);
        }
      }}
      onPointerOver={() => {
        if ((window as any).electronAPI?.setIgnoreMouseEvents) {
          (window as any).electronAPI.setIgnoreMouseEvents(false);
        }
      }}
      onPointerDown={() => {
        if ((window as any).electronAPI?.setIgnoreMouseEvents) {
          (window as any).electronAPI.setIgnoreMouseEvents(false);
        }
      }}
      onTouchStart={() => {
        if ((window as any).electronAPI?.setIgnoreMouseEvents) {
          (window as any).electronAPI.setIgnoreMouseEvents(false);
        }
      }}
      onMouseLeave={() => {
        if (!isExpanded && (window as any).electronAPI?.setIgnoreMouseEvents) {
          (window as any).electronAPI.setIgnoreMouseEvents(true, { forward: true });
        }
      }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center select-none font-sans pointer-events-auto"
    >
      <motion.div
        layout
        transition={liquidSpring}
        style={{
          backgroundColor: '#000000',
          boxShadow: isExpanded
            ? '0 25px 60px -10px rgba(0, 0, 0, 0.95)'
            : '0 2px 8px rgba(0, 0, 0, 0.90)',
        }}
        /* Chamfered corners rounded-b-[12px], pitch black with NO gray borders */
        className={`relative flex backdrop-blur-3xl overflow-hidden border-0 text-slate-100 bg-black ${
          isExpanded
            ? 'w-[640px] max-w-[96vw] rounded-b-[12px] p-5 flex-col gap-3.5'
            : 'w-[180px] h-[32px] rounded-b-[12px] px-3 py-1 flex items-center justify-between cursor-pointer'
        }`}
        onClick={(e) => {
          if (!isExpanded) {
            e.stopPropagation();
            setExpandedWithMotion(true);
          }
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            /* ============================================================== */
            /* 1. COMPACT IDLE NOTCH (Pitch Black, Chamfered, Minimal)        */
            /* ============================================================== */
            <motion.div
              key="compact-notch"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-between w-full h-full px-1 shrink-0 bg-black"
              title="Click or press Ctrl+Shift+Space"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#050505] border border-[#151515] flex items-center justify-center">
                  <div
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      wakeDetected
                        ? 'scale-150 animate-ping bg-white'
                        : isListening
                        ? 'opacity-80 bg-neutral-400'
                        : 'opacity-30 bg-neutral-600'
                    }`}
                  />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0c0c0c]" />
              </div>

              {/* Clean, Flowy Audio Visualizer in Compact Notch */}
              {activePlaying ? (
                <div className="flex items-center gap-0.5 pr-1" title="Playing Media">
                  <span className="w-0.5 h-2.5 rounded-full animate-pulse bg-white/80" />
                  <span className="w-0.5 h-3.5 rounded-full animate-pulse delay-75 bg-white" />
                  <span className="w-0.5 h-2 rounded-full animate-pulse delay-150 bg-white/70" />
                </div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#0e0e0e]" />
              )}
            </motion.div>
          ) : (
            /* ============================================================== */
            /* 2. EXPANDED NOTCH CARD (Chamfered rounded-b-[12px], Pitch Black) */
            /* ============================================================== */
            <motion.div
              key="expanded-notch"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-[600px] max-w-full flex flex-col gap-3.5 shrink-0 overflow-hidden bg-black text-white"
            >
              {/* Category Nav Tabs */}
              <div className="flex items-center justify-between gap-1 w-full p-1 rounded-xl shrink-0 bg-[#0a0a0c] border border-[#1a1a1f]">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-medium text-center transition-colors duration-200 cursor-pointer ${
                        isActive ? 'text-white font-semibold' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryTab"
                          className="absolute inset-0 rounded-xl bg-white/10 shadow-sm border border-white/10"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat.label}</span>
                    </button>
                  );
                })}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSettings();
                    }}
                    className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Body */}
              <div className="w-full shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeCategory === 'controls' && (
                      <ControlsCategory accentColor={accentColor} mainColor={mainColor} />
                    )}
                    {activeCategory === 'today' && (
                      <TodayCategory
                        pinnedCity={pinnedCity}
                        onUpdateCity={onUpdateCity}
                        accentColor={accentColor}
                        mainColor={mainColor}
                      />
                    )}
                    {activeCategory === 'stats' && (
                      <StatsCategory accentColor={accentColor} mainColor={mainColor} />
                    )}
                    {activeCategory === 'clipboard' && (
                      <ClipboardCategory accentColor={accentColor} mainColor={mainColor} />
                    )}
                    {activeCategory === 'apps' && (
                      <AppsCategory
                        onOpenSimulatedApp={onOpenSimulatedApp}
                        accentColor={accentColor}
                        mainColor={mainColor}
                        customApps={customApps}
                        onAddCustomApp={onAddCustomApp}
                      />
                    )}
                    {activeCategory === 'power' && (
                      <PowerCategory
                        onTriggerPowerAction={onTriggerPowerAction}
                        accentColor={accentColor}
                        mainColor={mainColor}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ACTIVE MUSIC MEDIA HUD */}
              <div className="p-3 rounded-2xl bg-[#0d0d12] border border-white/10 flex flex-col gap-2.5 overflow-hidden shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Album Cover Art */}
                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative shadow-md">
                      {mediaAlbumArt ? (
                        <img src={mediaAlbumArt} alt="Album Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${accentColor}25` }}
                        >
                          <Music className="w-7 h-7" style={{ color: accentColor }} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white truncate">
                        {mediaTitle}
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {mediaArtist}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5 font-medium">
                        {musicSource}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Track Time Scrubber */}
                <div className="space-y-1">
                  <div className="relative h-1 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer">
                    <div
                      style={{
                        width: `${Math.min(100, (trackProgress / 210) * 100)}%`,
                        backgroundColor: accentColor,
                      }}
                      className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span>{formatSecs(trackProgress)}</span>
                    <span>3:30</span>
                  </div>
                </div>

                {/* Active Playback Controls */}
                <div className="flex items-center justify-center gap-5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setTrackProgress(0)}
                    className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Previous"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleMusic}
                    style={{ backgroundColor: accentColor }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    title={activePlaying ? "Pause" : "Play"}
                  >
                    {activePlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackProgress((p) => Math.min(210, p + 30))}
                    className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Next"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              {messages.length > 0 && (
                <div className="max-h-[130px] overflow-y-auto space-y-2 pr-1 text-xs shrink-0">
                  {messages.slice(-3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-white font-medium bg-white/10 border border-white/15'
                            : 'bg-white/5 border border-white/10 text-slate-200'
                        }`}
                      >
                        {msg.content && <div>{msg.content}</div>}

                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
                            {msg.actions.map((act, i) => (
                              <div key={i} className="text-[11px]">
                                {act.type === 'calendar' && (
                                  <div className="space-y-1">
                                    <div className="font-semibold flex items-center gap-1.5 text-white">
                                      <Calendar className="w-3 h-3" />
                                      <span>Scheduled: {act.data.title}</span>
                                    </div>
                                    {act.data.googleCalendarUrl && (
                                      <a
                                        href={act.data.googleCalendarUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
                                      >
                                        <span>Add to Google Calendar</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                )}
                                {act.type === 'timer' && (
                                  <div className="font-medium text-white/80">
                                    Timer set for {act.data.durationMinutes} min
                                  </div>
                                )}
                                {act.type === 'app' && (
                                  <div className="font-medium text-white/80">
                                    Launched {act.data.appName}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-2 rounded-xl text-xs bg-white/5 text-white/70">
                      <div
                        className="w-2 h-2 rounded-full animate-ping"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span>SEN is thinking...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-0.5 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask SEN AI..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0e] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 hover:opacity-90 disabled:opacity-30 rounded-xl text-black transition-all active:scale-95 shrink-0 shadow-md cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearChat}
                    className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Clear history"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
