/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DynamicLakeNotch } from './components/DynamicLakeNotch.tsx';
import { DesktopCanvas } from './components/DesktopCanvas.tsx';
import { WindowsSystemTray } from './components/WindowsSystemTray.tsx';
import { WelcomeSetupModal } from './components/WelcomeSetupModal.tsx';
import { AppItem } from './components/categories/AppsCategory.tsx';
import { useVoiceWake } from './hooks/useVoiceWake.ts';
import { Message, CalendarEvent } from './types.ts';
import { Lock, Power, RotateCcw } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState<string>('gemini');
  const [desktopStream, setDesktopStream] = useState<MediaStream | null>(null);

  // Theme customization (100% Dark & OLED Liquid Glass themes)
  const [mainColor, setMainColor] = useState<string>(() => {
    const saved = localStorage.getItem('sen_main_color');
    if (saved && saved.startsWith('#')) {
      const cleanHex = saved.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
      const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
      const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
      const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 150;
      if (isLight) {
        localStorage.setItem('sen_main_color', '#0a0a0c');
        return '#0a0a0c';
      }
      return saved;
    }
    return '#0a0a0c';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('sen_accent_color') || '#06b6d4';
  });

  // Location customization (City pinning)
  const [pinnedCity, setPinnedCity] = useState<string>(() => {
    return localStorage.getItem('sen_pinned_city') || 'San Francisco';
  });

  // Music state (Strictly Spotify or YouTube Music)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicSource, setMusicSource] = useState<'Spotify' | 'YouTube Music'>('Spotify');

  // Font customization (Default Alata)
  const [activeFont, setActiveFont] = useState<string>(() => {
    return localStorage.getItem('sen_font_family') || localStorage.getItem('sen_active_font') || 'Alata';
  });

  // First-time Welcome Setup Modal State (only shown once)
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem('sen_welcome_completed');
  });

  useEffect(() => {
    localStorage.setItem('sen_active_font', activeFont);
    document.documentElement.style.setProperty('--app-font', `'${activeFont}', sans-serif`);
  }, [activeFont]);

  // Custom linked apps & games
  const [customApps, setCustomApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem('sen_custom_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Power state simulation
  const [powerMode, setPowerMode] = useState<'normal' | 'locked' | 'sleeping' | 'restarting' | 'shutdown'>('normal');

  // Track notch expansion and settings flyout state for seamless Electron overlay focus
  const [isNotchExpanded, setIsNotchExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persist and apply root theme colors dynamically
  useEffect(() => {
    localStorage.setItem('sen_main_color', mainColor);
    document.documentElement.style.setProperty('--sen-main', mainColor);

    if (mainColor && mainColor.startsWith('#')) {
      const cleanHex = mainColor.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
      const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
      const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
      const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 150;

      if (isLight) {
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('theme-dark');
      } else {
        document.documentElement.classList.add('theme-dark');
        document.documentElement.classList.remove('theme-light');
      }
    }
  }, [mainColor]);

  useEffect(() => {
    localStorage.setItem('sen_accent_color', accentColor);
    document.documentElement.style.setProperty('--sen-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('sen_pinned_city', pinnedCity);
  }, [pinnedCity]);

  useEffect(() => {
    localStorage.setItem('sen_custom_apps', JSON.stringify(customApps));
  }, [customApps]);

  // Calendar events persisted to local storage
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('sen_calendar_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        title: 'Strategy & Architecture Sync',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        location: 'Google Meet',
        description: 'Claude Code desktop agent integration and roadmap',
        googleCalendarUrl:
          'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Strategy+Sync&dates=20261030T100000/20261030T110000&details=Claude+Code+Integration&location=Google+Meet',
        completed: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sen_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Handle Power Category actions
  const handleTriggerPowerAction = (action: 'lock' | 'sleep' | 'restart' | 'shutdown') => {
    if (action === 'lock') {
      setPowerMode('locked');
    } else if (action === 'sleep') {
      setPowerMode('sleeping');
    } else if (action === 'restart') {
      setPowerMode('restarting');
      setTimeout(() => {
        setPowerMode('normal');
      }, 3000);
    } else if (action === 'shutdown') {
      setPowerMode('shutdown');
    }
  };

  // Add / Delete custom linked apps
  const handleAddCustomApp = (app: AppItem) => {
    setCustomApps((prev) => [app, ...prev]);
  };

  const handleDeleteCustomApp = (id: string) => {
    setCustomApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenSimulatedApp = (appId: string) => {
    console.log('Opening app:', appId);
  };

  // Send message to SEN backend (Gemini-powered)
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const customKey = localStorage.getItem('sen_custom_api_key');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (customKey) {
          headers['x-gemini-api-key'] = customKey;
        }

        const res = await fetch('/api/gemini/assist', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: text,
            model: 'gemini-3.8-flash',
            history: messages.slice(-6),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to communicate with assistant');
        }

        const assistantMsg: Message = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: data.text || 'Command processed.',
          modelUsed: data.modelUsed || 'Google Gemini 3.8 Flash',
          routingCategory: data.routingCategory,
          routingReason: data.routingReason,
          actions: data.actions || [],
          timestamp: data.timestamp || Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Process any returned tool calls
        if (data.actions && Array.isArray(data.actions)) {
          for (const act of data.actions) {
            if (act.type === 'calendar') {
              const newEvent: CalendarEvent = {
                id: `evt_${Date.now()}`,
                title: act.data.title,
                date: act.data.date,
                startTime: act.data.startTime,
                endTime: act.data.endTime,
                location: act.data.location,
                description: act.data.description,
                googleCalendarUrl: act.data.googleCalendarUrl,
                completed: false,
              };
              setCalendarEvents((prev) => [newEvent, ...prev]);
            }
          }
        }
      } catch (err: any) {
        const errorMsg: Message = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err.message || 'Unable to communicate with assistant.'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, selectedModel, messages]
  );

  // Voice Wake ("Hey Sen")
  const handleWake = useCallback(
    (detectedQuery?: string) => {
      if (detectedQuery && detectedQuery.trim().length > 1) {
        handleSendMessage(detectedQuery);
      }
    },
    [handleSendMessage]
  );

  const { isListening, wakeDetected } = useVoiceWake({
    onWake: handleWake,
    enabled: true,
  });

  // Toggle Live Windows Desktop screen mirror
  const handleToggleDesktopMirror = useCallback(async () => {
    if (desktopStream) {
      desktopStream.getTracks().forEach((track) => track.stop());
      setDesktopStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' } as any,
          audio: false,
        });
        setDesktopStream(stream);

        // Auto-cleanup when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setDesktopStream(null);
        };
      } catch (err) {
        console.warn('Screen mirror cancelled or unsupported:', err);
      }
    }
  }, [desktopStream]);

  // Sync Electron click-through overlay so user can click anywhere on their desktop
  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api || typeof api.setIgnoreMouseEvents !== 'function') return;

    // If welcome modal, notch, settings, or power state is active, keep window fully interactive
    if (isNotchExpanded || isSettingsOpen || showWelcome || powerMode !== 'normal') {
      api.setIgnoreMouseEvents(false);
      return;
    }

    // Start with clicks forwarded to the real Windows desktop
    api.setIgnoreMouseEvents(true, { forward: true });

    let isHoveringInteractive = false;

    const handlePointerActivity = (e: Event) => {
      let x = 0;
      let y = 0;
      const me = e as MouseEvent | PointerEvent | TouchEvent;

      if ('clientX' in me && typeof (me as MouseEvent).clientX === 'number') {
        x = (me as MouseEvent).clientX;
        y = (me as MouseEvent).clientY;
      } else if ('touches' in me && (me as TouchEvent).touches && (me as TouchEvent).touches[0]) {
        x = (me as TouchEvent).touches[0].clientX;
        y = (me as TouchEvent).touches[0].clientY;
      } else {
        return;
      }

      const el = document.elementFromPoint(x, y);
      const isInteractive = Boolean(
        el && (
          el.closest('[data-interactive="true"]') ||
          el.closest('button') ||
          el.closest('input') ||
          el.closest('textarea') ||
          el.closest('a') ||
          el.closest('select') ||
          el.closest('[role="button"]') ||
          el.closest('.pointer-events-auto') ||
          el.closest('.liquid-glass')
        )
      );

      if (isInteractive !== isHoveringInteractive) {
        isHoveringInteractive = isInteractive;
        api.setIgnoreMouseEvents(!isInteractive, { forward: true });
      }
    };

    window.addEventListener('mousemove', handlePointerActivity, { capture: true, passive: true });
    window.addEventListener('pointermove', handlePointerActivity, { capture: true, passive: true });
    window.addEventListener('pointerdown', handlePointerActivity, { capture: true, passive: true });
    window.addEventListener('touchstart', handlePointerActivity, { capture: true, passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerActivity, { capture: true } as any);
      window.removeEventListener('pointermove', handlePointerActivity, { capture: true } as any);
      window.removeEventListener('pointerdown', handlePointerActivity, { capture: true } as any);
      window.removeEventListener('touchstart', handlePointerActivity, { capture: true } as any);
    };
  }, [isNotchExpanded, isSettingsOpen, showWelcome, powerMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden text-slate-100 font-sans select-none pointer-events-none bg-transparent">
      {/* Night Light Screen Filter Overlay */}
      <div
        id="night-light-filter"
        className="fixed inset-0 bg-amber-500 pointer-events-none opacity-0 transition-opacity duration-500 z-30"
      />

      {/* Clean Ambient Backdrop / Screen Mirror */}
      <DesktopCanvas
        stream={desktopStream}
        onToggleMirror={handleToggleDesktopMirror}
        accentColor={accentColor}
        mainColor={mainColor}
      />

      {/* Dynamic Lake Notch at top center */}
      <DynamicLakeNotch
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        calendarEvents={calendarEvents}
        isListening={isListening}
        wakeDetected={wakeDetected}
        onClearChat={() => setMessages([])}
        mainColor={mainColor}
        accentColor={accentColor}
        pinnedCity={pinnedCity}
        onUpdateCity={setPinnedCity}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
        musicSource={musicSource}
        onOpenSimulatedApp={handleOpenSimulatedApp}
        onTriggerPowerAction={handleTriggerPowerAction}
        customApps={customApps}
        onAddCustomApp={handleAddCustomApp}
        onOpenSettings={() => setIsSettingsOpen((prev) => !prev)}
        onExpandedChange={setIsNotchExpanded}
      />

      {/* Windows 11 Taskbar System Tray & Hidden Icons Settings Flyout */}
      <WindowsSystemTray
        mainColor={mainColor}
        onChangeMainColor={setMainColor}
        accentColor={accentColor}
        onChangeAccentColor={setAccentColor}
        pinnedCity={pinnedCity}
        onUpdateCity={setPinnedCity}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
        musicSource={musicSource}
        onChangeMusicSource={setMusicSource}
        customApps={customApps}
        onAddCustomApp={handleAddCustomApp}
        onDeleteCustomApp={handleDeleteCustomApp}
        isScreenMirroring={!!desktopStream}
        onToggleScreenMirror={handleToggleDesktopMirror}
        activeFont={activeFont}
        onChangeFont={setActiveFont}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* POWER STATE OVERLAYS */}
      {powerMode === 'locked' && (
        <div data-interactive="true" className="fixed inset-0 z-50 bg-[#090b10]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-auto">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-wide mb-1">Windows Locked</h2>
          <p className="text-xs text-slate-400 mb-6">SEN session secured with Windows Hello</p>
          <button
            type="button"
            onClick={() => setPowerMode('normal')}
            style={{ backgroundColor: accentColor, color: '#000000' }}
            className="px-6 py-2.5 rounded-2xl font-semibold text-xs transition-transform active:scale-95 shadow-lg hover:opacity-90 cursor-pointer"
          >
            Unlock Session
          </button>
        </div>
      )}

      {powerMode === 'sleeping' && (
        <div
          data-interactive="true"
          onClick={() => setPowerMode('normal')}
          className="fixed inset-0 z-50 bg-black cursor-pointer flex items-center justify-center text-slate-700 hover:text-slate-500 transition-colors pointer-events-auto"
        >
          <div className="text-xs font-mono tracking-widest uppercase">
            [ Sleep Mode &bull; Click anywhere to wake ]
          </div>
        </div>
      )}

      {powerMode === 'restarting' && (
        <div data-interactive="true" className="fixed inset-0 z-50 bg-[#06080d] flex flex-col items-center justify-center gap-4 text-center pointer-events-auto">
          <RotateCcw className="w-10 h-10 animate-spin" style={{ color: accentColor }} />
          <div className="text-sm font-semibold text-white">Restarting Windows &amp; SEN...</div>
        </div>
      )}

      {powerMode === 'shutdown' && (
        <div data-interactive="true" className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-center pointer-events-auto">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600 mb-2">
            <Power className="w-7 h-7" />
          </div>
          <button
            type="button"
            onClick={() => setPowerMode('normal')}
            className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Power On SEN
          </button>
        </div>
      )}

      {/* FIRST-TIME WELCOME SETUP WIZARD (Square 480x480 Glass Card) */}
      {showWelcome && (
        <div data-interactive="true" className="pointer-events-auto">
          <WelcomeSetupModal
            onComplete={(cfg) => {
              setPinnedCity(cfg.location);
              setAccentColor(cfg.themeColor);
              setActiveFont(cfg.fontFamily);
              setShowWelcome(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
