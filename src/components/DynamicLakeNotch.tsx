import React, { useState, useEffect, useRef } from 'react';
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
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('controls');
  const [inputText, setInputText] = useState('');
  const [trackProgress, setTrackProgress] = useState(45);

  const notchRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-expand notch when "Hey Sen" is detected via microphone
  useEffect(() => {
    if (wakeDetected) {
      setIsExpanded(true);
    }
  }, [wakeDetected]);

  // Click outside or scroll anywhere else makes AI turn back into notch
  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (notchRef.current && !notchRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (notchRef.current && !notchRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

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

  // Liquid Spring Physics parameters mimicking macOS Dynamic Island
  const liquidSpring = {
    type: 'spring' as const,
    stiffness: 220,
    damping: 26,
    mass: 0.75,
  };

  return (
    <div
      ref={notchRef}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none font-sans"
    >
      <motion.div
        layout
        transition={liquidSpring}
        style={{
          backgroundColor: isExpanded
            ? isLight ? `${mainColor}f8` : `${mainColor}f4`
            : `${mainColor}f0`,
          borderColor: isExpanded
            ? isLight ? 'rgba(0,0,0,0.15)' : `${accentColor}55`
            : `${accentColor}38`,
          boxShadow: isExpanded
            ? isLight
              ? '0 24px 60px -10px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)'
              : `0 30px 80px -12px rgba(0,0,0,0.9), 0 0 40px -5px ${accentColor}35, inset 0 1px 1px rgba(255,255,255,0.2)`
            : `0 8px 24px -4px rgba(0,0,0,0.6), 0 0 16px -2px ${accentColor}25`,
        }}
        className={`relative flex backdrop-blur-3xl border-b border-x overflow-hidden transition-colors duration-300 ${
          isLight ? 'text-slate-900 shadow-slate-300/40' : 'text-slate-100'
        } ${
          isExpanded
            ? 'w-[660px] max-w-[96vw] rounded-b-[32px] p-5 flex-col gap-3.5'
            : 'w-[180px] h-[32px] rounded-b-2xl px-3 py-1 flex items-center justify-between cursor-pointer hover:border-neutral-500'
        }`}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        {/* Specular Liquid Glass Top Refraction Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none opacity-60 z-20"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)'
              : `linear-gradient(90deg, transparent, ${accentColor}aa, transparent)`,
          }}
        />

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
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] border border-[#222] flex items-center justify-center">
                  <div
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      wakeDetected
                        ? 'scale-150 animate-ping'
                        : isListening
                        ? 'opacity-100'
                        : 'opacity-40'
                    }`}
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d0d]" />
              </div>

              {/* Audio Equalizer or Right Sensor Dot */}
              {isPlayingMusic ? (
                <div className="flex items-center gap-0.5 pr-1" title={`Playing ${musicSource}`}>
                  <span
                    className="w-0.5 h-2.5 rounded-full animate-bounce"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="w-0.5 h-3.5 rounded-full animate-bounce delay-100"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="w-0.5 h-2 rounded-full animate-bounce delay-200"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#121212]" />
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
                className="flex items-center justify-between w-full p-1 rounded-2xl border shrink-0"
                style={{
                  backgroundColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.45)',
                  borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
                }}
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
                    className={`w-full text-xs px-3.5 py-2.5 rounded-2xl border focus:outline-none backdrop-blur-2xl transition-all font-medium ${
                      isLight
                        ? 'bg-black/5 text-slate-900 placeholder-slate-500 border-black/15'
                        : 'bg-white/6 text-slate-100 placeholder-slate-400 border-white/10'
                    }`}
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
