import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  RotateCcw,
  Music,
  Pause,
  SkipBack,
  SkipForward,
  ExternalLink,
  Calendar,
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
}: DynamicLakeNotchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('controls');
  const [inputText, setInputText] = useState('');
  const [trackProgress, setTrackProgress] = useState(45);

  const notchRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<any>(null);

  const setExpandedWithMotion = useCallback((target: boolean | ((prev: boolean) => boolean)) => {
    setIsTransitioning(true);
    setIsExpanded((prev) => {
      const next = typeof target === 'function' ? target(prev) : target;
      return next;
    });
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  }, []);

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

  // Track progress when music is on
  useEffect(() => {
    let interval: any = null;
    if (isPlayingMusic) {
      interval = setInterval(() => {
        setTrackProgress((p) => (p >= 180 ? 0 : p + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMusic]);

  // Scroll to bottom of chat when new message arrives
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

  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  // Apple-grade Liquid Spring Physics parameters (smooth, low-mass, non-clunky)
  const liquidSpring = {
    type: 'spring' as const,
    stiffness: 240,
    damping: 26,
    mass: 0.7,
  };

  return (
    <div
      ref={notchRef}
      data-interactive="true"
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none font-sans pointer-events-auto"
    >
      <motion.div
        layout
        transition={liquidSpring}
        style={{
          backgroundColor: '#000000',
          borderColor: '#000000',
          boxShadow: isExpanded
            ? '0 32px 80px -8px rgba(0, 0, 0, 0.98)'
            : '0 2px 6px rgba(0, 0, 0, 0.95)',
          filter: isTransitioning ? 'blur(1.5px)' : 'none',
          willChange: 'transform, filter, border-radius',
        }}
        className={`relative flex backdrop-blur-3xl overflow-hidden border-none transition-[filter,border-radius] duration-250 ease-out text-slate-100 bg-black ${
          isExpanded
            ? 'w-[660px] max-w-[96vw] rounded-b-[18px] p-5 flex-col gap-3.5'
            : 'w-[180px] h-[32px] rounded-b-[9px] px-3 py-1 flex items-center justify-between cursor-pointer'
        }`}
        onClick={() => {
          if (!isExpanded) setExpandedWithMotion(true);
        }}
      >

        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            /* ============================================================== */
            /* 1. COMPACT IDLE NOTCH (Pitch-Black hardware bezel, ZERO text) */
            /* ============================================================== */
            <motion.div
              key="compact-notch"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-between w-full h-full px-1 shrink-0"
              title='Click or say "Hey Sen"'
            >
              {/* Center camera aperture lens & microphone indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#070707] border border-[#1a1a1a] flex items-center justify-center">
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
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              </div>

              {/* Audio Equalizer or Right Sensor Dot */}
              {isPlayingMusic ? (
                <div className="flex items-center gap-0.5 pr-1" title={`Playing ${musicSource}`}>
                  <span className="w-0.5 h-2.5 rounded-full animate-bounce bg-neutral-300" />
                  <span className="w-0.5 h-3.5 rounded-full animate-bounce delay-100 bg-neutral-400" />
                  <span className="w-0.5 h-2 rounded-full animate-bounce delay-200 bg-neutral-300" />
                </div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
              )}
            </motion.div>
          ) : (
            /* ============================================================== */
            /* 2. EXPANDED LIQUID GLASS CARD (Fixed layout width prevents squishing) */
            /* ============================================================== */
            <motion.div
              key="expanded-notch"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-[620px] max-w-full flex flex-col gap-3.5 shrink-0 overflow-hidden"
            >
              {/* CATEGORIES BAR: Fluid pill tabs */}
              <div
                className="flex items-center justify-between w-full p-1 rounded-xl shrink-0 bg-[#080808] border border-[#161616]"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? isLight ? 'text-slate-900 font-bold' : 'text-white font-semibold'
                          : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryShadow"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`,
                            boxShadow: `inset 0 0 0 1px ${accentColor}aa, 0 4px 12px ${accentColor}25`,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CATEGORY ACTIVE VIEW */}
              <div className="w-full shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                    transition={{ duration: 0.16 }}
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

              {/* MUSIC PLAYER HUD */}
              {isPlayingMusic && (
                <motion.div
                  initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                  exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                  className={`p-2.5 rounded-2xl border flex flex-col gap-2 overflow-hidden shrink-0 ${
                    isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}28` }}
                      >
                        <Music className="w-4 h-4" style={{ color: isLight ? '#0f172a' : accentColor }} />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Midnight Focus (Lo-Fi)
                        </div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Lofi Girl &bull; Study Sessions
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] shrink-0 font-semibold ${
                      isLight ? 'bg-black/5 border-black/10 text-slate-800' : 'bg-black/40 border-white/8 text-slate-300'
                    }`}>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isLight ? '#0f172a' : accentColor }}
                      />
                      <span>{musicSource}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className={`relative h-1 w-full rounded-full overflow-hidden ${
                      isLight ? 'bg-black/15' : 'bg-black/50'
                    }`}>
                      <div
                        style={{
                          width: `${Math.min(100, (trackProgress / 180) * 100)}%`,
                          backgroundColor: isLight ? '#0f172a' : accentColor,
                        }}
                        className="absolute top-0 bottom-0 left-0 rounded-full"
                      />
                    </div>
                    <div className={`flex items-center justify-between text-[9px] font-mono ${
                      isLight ? 'text-slate-600 font-medium' : 'text-slate-400'
                    }`}>
                      <span>{formatSecs(trackProgress)}</span>
                      <span>3:00</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className={`p-1 transition-colors ${
                        isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <SkipBack className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={onToggleMusic}
                      style={{
                        backgroundColor: isLight ? '#0f172a' : accentColor,
                        color: isLight ? '#ffffff' : '#000000',
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-sm"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      className={`p-1 transition-colors ${
                        isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <SkipForward className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* CONVERSATION HISTORY */}
              {messages.length > 0 && (
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 text-xs shrink-0">
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
                            ? isLight ? 'text-slate-900 font-semibold' : 'text-white font-medium'
                            : isLight
                            ? 'bg-black/5 border border-black/10 text-slate-900 font-medium'
                            : 'bg-white/6 border border-white/10 text-slate-200'
                        }`}
                        style={
                          msg.role === 'user'
                            ? { backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`, boxShadow: `inset 0 0 0 1px ${accentColor}aa` }
                            : {}
                        }
                      >
                        {msg.content && <div>{msg.content}</div>}

                        {msg.actions && msg.actions.length > 0 && (
                          <div className={`mt-1.5 pt-1.5 border-t space-y-1 ${
                            isLight ? 'border-black/10' : 'border-white/10'
                          }`}>
                            {msg.actions.map((act, i) => (
                              <div key={i} className="text-[11px]">
                                {act.type === 'calendar' && (
                                  <div className="space-y-1">
                                    <div className="font-semibold flex items-center gap-1.5" style={{ color: isLight ? '#0f172a' : accentColor }}>
                                      <Calendar className="w-3 h-3" />
                                      <span>Scheduled: {act.data.title}</span>
                                    </div>
                                    {act.data.googleCalendarUrl && (
                                      <a
                                        href={act.data.googleCalendarUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ backgroundColor: `${accentColor}33`, color: isLight ? '#0f172a' : accentColor }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors"
                                      >
                                        <span>Add to Google Calendar</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                )}
                                {act.type === 'timer' && (
                                  <div style={{ color: isLight ? '#0f172a' : accentColor }} className="font-semibold">
                                    ⏱ Timer set for {act.data.durationMinutes} min
                                  </div>
                                )}
                                {act.type === 'app' && (
                                  <div style={{ color: isLight ? '#0f172a' : accentColor }} className="font-semibold">
                                    🚀 Launched {act.data.appName}
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
                    <div className={`flex items-center gap-2 p-2 rounded-xl text-xs ${
                      isLight ? 'bg-black/5 text-slate-700 font-semibold' : 'bg-white/4 text-slate-400'
                    }`}>
                      <div
                        className="w-2 h-2 rounded-full animate-ping"
                        style={{ backgroundColor: isLight ? '#0f172a' : accentColor }}
                      />
                      <span>Sen is thinking...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* CORE INPUT FIELD */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-0.5 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Sen..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#1a1a1a] bg-[#080808] text-white placeholder-neutral-500 focus:outline-none transition-all font-medium"
                    style={{
                      boxShadow: inputText ? `inset 0 0 0 1px ${accentColor}aa` : undefined,
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 hover:opacity-90 disabled:opacity-30 rounded-2xl transition-transform active:scale-95 shrink-0 shadow-xs"
                  style={{ backgroundColor: isLight ? accentColor : accentColor, color: isLight ? '#ffffff' : '#000000' }}
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearChat}
                    className={`p-2 transition-colors ${
                      isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Clear conversation"
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
