import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  Settings,
  Palette,
  Power,
  Music,
  MapPin,
  Compass,
  Monitor,
  Trash2,
  Wifi,
  X,
  Check,
} from 'lucide-react';
import { AppItem } from './categories/AppsCategory.tsx';

interface WindowsSystemTrayProps {
  mainColor: string;
  onChangeMainColor: (color: string) => void;
  accentColor: string;
  onChangeAccentColor: (color: string) => void;
  pinnedCity: string;
  onUpdateCity: (city: string) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  musicSource: 'Spotify' | 'YouTube Music';
  onChangeMusicSource: (source: 'Spotify' | 'YouTube Music') => void;
  customApps: AppItem[];
  onAddCustomApp: (app: AppItem) => void;
  onDeleteCustomApp: (id: string) => void;
  isScreenMirroring: boolean;
  onToggleScreenMirror: () => void;
  activeFont: string;
  onChangeFont: (font: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PRESET_THEMES = [
  // 100% DARK & OLED LIQUID GLASS THEMES
  { name: 'Obsidian Cyan (Dark)', main: '#0a0a0c', accent: '#06b6d4', type: 'dark', desc: 'Apple Liquid Glass Dark' },
  { name: 'Deep Space Blue (Dark)', main: '#0b1120', accent: '#3b82f6', type: 'dark', desc: 'macOS Tahoe Slate' },
  { name: 'Midnight OLED (Dark)', main: '#000000', accent: '#38bdf8', type: 'dark', desc: 'Pure Pitch Black Refraction' },
  { name: 'Starlight Amber (Dark)', main: '#141210', accent: '#f59e0b', type: 'dark', desc: 'Warm Golden Liquid' },
  { name: 'Cyber Emerald (Dark)', main: '#061410', accent: '#10b981', type: 'dark', desc: 'One UI Emerald' },
  { name: 'Amethyst Night (Dark)', main: '#120c1d', accent: '#a855f7', type: 'dark', desc: 'Nebula Violet Glass' },
  { name: 'Sakura Rose (Dark)', main: '#1a0c16', accent: '#f43f5e', type: 'dark', desc: 'Rose Liquid Glass' },
  { name: 'Steel Titanium (Dark)', main: '#18181b', accent: '#0284c7', type: 'dark', desc: 'Apple Steel Finish' },
  { name: 'Matrix Neon (Dark)', main: '#050d08', accent: '#22c55e', type: 'dark', desc: 'Deep Terminal Emerald' },
  { name: 'Crimson Eclipse (Dark)', main: '#170709', accent: '#ef4444', type: 'dark', desc: 'OLED Ruby Shimmer' },
  { name: 'Ultraviolet Glow (Dark)', main: '#0c0618', accent: '#8b5cf6', type: 'dark', desc: 'Deep Space Purple' },
  { name: 'Solar Amber (Dark)', main: '#160d04', accent: '#f97316', type: 'dark', desc: 'Warm Solar Flare' },
];

const PRESET_FONTS = [
  { name: 'Encode Sans Expanded', label: 'Encode Sans Expanded (Default)' },
  { name: 'Dongle', label: 'Dongle (Playful)' },
  { name: 'Kanit', label: 'Kanit (Modern Clean)' },
  { name: 'Manjari', label: 'Manjari (Warm Humanist)' },
  { name: 'Varela Round', label: 'Varela Round (Soft One UI)' },
  { name: 'Gruppo', label: 'Gruppo (Minimalist)' },
  { name: 'Alata', label: 'Alata (Classic Apple)' },
];

export function WindowsSystemTray({
  mainColor,
  onChangeMainColor,
  accentColor,
  onChangeAccentColor,
  pinnedCity,
  onUpdateCity,
  isPlayingMusic,
  onToggleMusic,
  musicSource,
  onChangeMusicSource,
  customApps,
  onAddCustomApp,
  onDeleteCustomApp,
  isScreenMirroring,
  onToggleScreenMirror,
  activeFont,
  onChangeFont,
  isOpen: propIsOpen,
  onOpenChange,
}: WindowsSystemTrayProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const val = typeof next === 'function' ? next(isOpen) : next;
    setInternalIsOpen(val);
    if (onOpenChange) onOpenChange(val);
  };

  const [majorCategory, setMajorCategory] = useState<'system' | 'personalization' | 'connectivity' | 'media'>('system');
  const [subCategory, setSubCategory] = useState<'display' | 'startup' | 'themes' | 'typography' | 'location' | 'apps' | 'music'>('display');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (api && typeof api.receiveFromMain === 'function') {
      api.receiveFromMain('open-sen-settings', () => {
        setIsOpen(true);
      });
    }
  }, []);

  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
    const fullFontName = `Custom_${fontName}`;

    const styleId = `custom_font_${fullFontName}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @font-face {
        font-family: '${fullFontName}';
        src: url('${url}');
      }
    `;
    onChangeFont(fullFontName);
  };

  // Form states for adding custom app
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'PC Tools' | 'Productivity' | 'Games & Media'>('Productivity');
  const [newAppUrl, setNewAppUrl] = useState('');

  // Location edit
  const [localCity, setLocalCity] = useState(pinnedCity);
  const [geoLocating, setGeoLocating] = useState(false);

  // Display settings in tray
  const [selectedMonitor, setSelectedMonitor] = useState<string>('Display 1 (Primary 4K)');
  const [displayScale, setDisplayScale] = useState<number>(100);

  const flyoutRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync city prop
  useEffect(() => {
    setLocalCity(pinnedCity);
  }, [pinnedCity]);

  // Click outside flyout to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDownloadStartupScript = () => {
    window.location.href = '/api/desktop/scripts/windows';
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (localCity.trim()) {
      onUpdateCity(localCity.trim());
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'San Francisco';
          setLocalCity(detected);
          onUpdateCity(detected);
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          onUpdateCity('San Francisco');
        } finally {
          setGeoLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: AppItem = {
      id: `custom_${Date.now()}`,
      name: newAppName.trim(),
      category: newAppCategory,
      iconName: newAppCategory === 'Games & Media' ? 'game' : 'code',
      url: newAppUrl.trim() || undefined,
      isSimulated: !newAppUrl.trim(),
    };

    onAddCustomApp(newApp);
    setNewAppName('');
    setNewAppUrl('');
  };

  return (
    <div
      className="fixed bottom-0 right-0 z-40 select-none font-sans pointer-events-none"
      ref={flyoutRef}
      onMouseEnter={() => {
        (window as any).electronAPI?.setIgnoreMouseEvents(false);
      }}
      onMouseLeave={() => {
        if (!isOpen) {
          (window as any).electronAPI?.setIgnoreMouseEvents(true, { forward: true });
        }
      }}
    >
      {/* 1. SEPARATE SETTINGS FLYOUT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-interactive="true"
            onMouseEnter={() => {
              (window as any).electronAPI?.setIgnoreMouseEvents(false);
            }}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`absolute bottom-12 right-2 w-[440px] max-w-[95vw] rounded-2xl border shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col z-50 pointer-events-auto ${
              isLight ? 'text-slate-900 shadow-slate-300/50' : 'text-slate-100'
            }`}
            style={{
              backgroundColor: isLight ? `${mainColor}f9` : `${mainColor}f4`,
              borderColor: isLight ? 'rgba(0,0,0,0.15)' : `${accentColor}44`,
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isLight ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/3'
            }`}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${accentColor}25`, color: isLight ? '#0f172a' : accentColor }}
                >
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>SEN Desktop Settings</h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Windows Taskbar System Tray Flyout</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isLight ? 'hover:bg-black/10 text-slate-700' : 'hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Major Categories Bar */}
            <div className={`grid grid-cols-4 gap-1 p-2 border-b text-xs ${
              isLight ? 'border-black/10 bg-black/5' : 'border-white/8 bg-black/50'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setMajorCategory('system');
                  setSubCategory('display');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                  majorCategory === 'system'
                    ? isLight ? 'bg-black/12 text-slate-900 font-bold shadow-xs' : 'bg-white/15 text-white font-semibold shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" style={{ color: majorCategory === 'system' ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                <span>System</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMajorCategory('personalization');
                  setSubCategory('themes');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                  majorCategory === 'personalization'
                    ? isLight ? 'bg-black/12 text-slate-900 font-bold shadow-xs' : 'bg-white/15 text-white font-semibold shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Palette className="w-3.5 h-3.5" style={{ color: majorCategory === 'personalization' ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                <span>Personal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMajorCategory('connectivity');
                  setSubCategory('location');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                  majorCategory === 'connectivity'
                    ? isLight ? 'bg-black/12 text-slate-900 font-bold shadow-xs' : 'bg-white/15 text-white font-semibold shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" style={{ color: majorCategory === 'connectivity' ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                <span>Connect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMajorCategory('media');
                  setSubCategory('music');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                  majorCategory === 'media'
                    ? isLight ? 'bg-black/12 text-slate-900 font-bold shadow-xs' : 'bg-white/15 text-white font-semibold shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Music className="w-3.5 h-3.5" style={{ color: majorCategory === 'media' ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                <span>Media</span>
              </button>
            </div>

            {/* Sub-Categories Pills Row */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 border-b overflow-x-auto text-[11px] ${
              isLight ? 'bg-black/3 border-black/8' : 'bg-black/30 border-white/5'
            }`}>
              {majorCategory === 'system' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('display')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'display'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Display &amp; Monitors
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('startup')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'startup'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Startup &amp; Mirror
                  </button>
                </>
              )}

              {majorCategory === 'personalization' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('themes')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'themes'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Color Themes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('typography')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'typography'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Typography &amp; Fonts
                  </button>
                </>
              )}

              {majorCategory === 'connectivity' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('location')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'location'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Location &amp; GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('apps')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'apps'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    App Linker
                  </button>
                </>
              )}

              {majorCategory === 'media' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('music')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all font-semibold ${
                      subCategory === 'music'
                        ? isLight ? 'bg-black/12 text-slate-900 font-bold' : 'bg-white/20 text-white'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Spotify &amp; YT Music Engine
                  </button>
                </>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 max-h-[360px] overflow-y-auto space-y-4 text-xs">
              {/* SUB: TYPOGRAPHY */}
              {subCategory === 'typography' && (
                <div className="space-y-4">
                  <div>
                    <label className={`text-[11px] font-bold block mb-2 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Select Professional Desktop Font
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {PRESET_FONTS.map((font) => (
                        <button
                          key={font.name}
                          type="button"
                          onClick={() => onChangeFont(font.name)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            activeFont === font.name
                              ? isLight ? 'bg-black/10 border-black/25 text-slate-900 font-bold shadow-xs' : 'bg-white/15 border-white/30 text-white shadow-xs'
                              : isLight ? 'bg-black/3 border-black/8 text-slate-800 hover:bg-black/6' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate" style={{ fontFamily: font.name }}>
                              {font.label}
                            </div>
                            <div className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Preview: SEN AI Desktop Assistant</div>
                          </div>
                          {activeFont === font.name && (
                            <Check className="w-4 h-4 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Font Upload */}
                  <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'}`}>
                    <label className={`text-[11px] font-bold block ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Upload Custom Font File (.ttf / .woff2 / .otf)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".ttf,.woff,.woff2,.otf"
                        onChange={handleCustomFontUpload}
                        className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold cursor-pointer ${
                          isLight
                            ? 'text-slate-700 file:bg-black/10 file:text-slate-900 hover:file:bg-black/15'
                            : 'text-slate-400 file:bg-white/10 file:text-white hover:file:bg-white/20'
                        }`}
                      />
                    </div>
                    <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Active Font: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeFont}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* SUB: COLOR THEMES */}
              {subCategory === 'themes' && (
                <div className="space-y-4">
                  <div>
                    <label className={`text-[11px] font-bold block mb-2 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Live Color Customizer (Any Color)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Main Color Picker */}
                      <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>Main Glass Color</span>
                          <span className={`font-mono text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{mainColor}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={mainColor}
                            onChange={(e) => onChangeMainColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={mainColor}
                            onChange={(e) => onChangeMainColor(e.target.value)}
                            className={`w-full border rounded-lg px-2 py-1 text-xs font-mono font-bold ${
                              isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-black/40 border-white/10 text-slate-200'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Accent Color Picker */}
                      <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>Accent Glow Color</span>
                          <span className={`font-mono text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{accentColor}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => onChangeAccentColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => onChangeAccentColor(e.target.value)}
                            className={`w-full border rounded-lg px-2 py-1 text-xs font-mono font-bold ${
                              isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-black/40 border-white/10 text-slate-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Curated Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-[11px] font-bold block ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                        Curated Liquid Glass Presets (Dark &amp; OLED Only)
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {PRESET_THEMES.map((preset) => {
                        const isSelected =
                          mainColor.toLowerCase() === preset.main.toLowerCase() &&
                          accentColor.toLowerCase() === preset.accent.toLowerCase();
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              onChangeMainColor(preset.main);
                              onChangeAccentColor(preset.accent);
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                              isSelected
                                ? isLight ? 'bg-black/12 border-black/25 text-slate-900 font-bold shadow-md' : 'bg-white/20 border-white/40 text-white shadow-md'
                                : isLight ? 'bg-black/3 border-black/8 text-slate-800 hover:bg-black/6' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <div
                              className="w-6 h-6 rounded-lg shrink-0 border border-black/20 flex items-center justify-center shadow-inner"
                              style={{ backgroundColor: preset.main }}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: preset.accent }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[10px] truncate leading-tight">{preset.name}</div>
                              <div className={`text-[9px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{preset.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB: DISPLAY CATEGORY */}
              {subCategory === 'display' && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'}`}>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Dual Monitor Selection</div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Display 1 (4K)', 'Display 2 (1440p)', 'Display 3 (Ultrawide)'].map((mon) => (
                        <button
                          key={mon}
                          type="button"
                          onClick={() => setSelectedMonitor(mon)}
                          className={`p-2 rounded-xl border text-center text-[11px] font-semibold transition-all ${
                            selectedMonitor === mon
                              ? isLight ? 'bg-black/15 border-black/25 text-slate-900 font-bold' : 'bg-white/15 border-white/30 text-white'
                              : isLight ? 'bg-black/3 border-black/8 text-slate-700 hover:bg-black/6' : 'bg-white/5 border-white/8 text-slate-400 hover:bg-white/10'
                          }`}
                          style={selectedMonitor === mon ? { backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`, color: isLight ? '#0f172a' : '#ffffff' } : {}}
                        >
                          {mon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'}`}>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Display Scaling & Resolution</div>
                    <div className="flex gap-2">
                      {[100, 125, 150].map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setDisplayScale(scale)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                            displayScale === scale
                              ? isLight ? 'bg-black/15 border-black/25 text-slate-900 font-bold' : 'bg-white/15 border-white/30 text-white'
                              : isLight ? 'bg-black/3 border-black/8 text-slate-700' : 'bg-white/5 border-white/8 text-slate-400'
                          }`}
                          style={displayScale === scale ? { backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`, color: isLight ? '#0f172a' : '#ffffff' } : {}}
                        >
                          {scale}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB: WINDOWS STARTUP */}
              {subCategory === 'startup' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    isLight
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-500/20'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs ${
                      isLight ? 'text-slate-900' : 'text-cyan-300'
                    }`}>
                      <Power className="w-4 h-4" />
                      <span>Windows PC Startup Integration</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      Make SEN launch automatically whenever your Windows PC boots up, placing the
                      black notch seamlessly at the top center of your display.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadStartupScript}
                      style={{ backgroundColor: accentColor, color: isLight ? '#ffffff' : '#000000' }}
                      className="w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{downloadSuccess ? 'Downloaded to Downloads folder!' : '1-Click Install Windows Startup'}</span>
                    </button>
                  </div>

                  {/* Desktop Screen Mirroring Toggle */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'
                  }`}>
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Live Monitor Background</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Mirror your active Windows screen below SEN</div>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleScreenMirror}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isScreenMirroring
                          ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40 font-bold'
                          : isLight ? 'bg-black/10 hover:bg-black/15 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      {isScreenMirroring ? 'Screen Active' : 'Start Mirror'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB: MUSIC ENGINE */}
              {subCategory === 'music' && (
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'
                  }`}>
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Music Detection & Player</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Spotify and YouTube Music engine active
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleMusic}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isPlayingMusic
                          ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40'
                          : isLight ? 'bg-black/10 text-slate-800 hover:text-slate-900' : 'bg-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isPlayingMusic ? 'Music On' : 'Music Off'}
                    </button>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold block mb-2 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Authorized Music Service
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onChangeMusicSource('Spotify')}
                        style={musicSource === 'Spotify' ? { backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`, borderColor: `${accentColor}88` } : {}}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          musicSource === 'Spotify'
                            ? isLight ? 'text-slate-900 font-bold' : 'text-white'
                            : isLight ? 'bg-black/3 border-black/8 text-slate-700 hover:text-slate-900' : 'bg-white/5 border-white/8 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isLight ? '#0f172a' : accentColor }} />
                        <span className="font-bold text-xs">Spotify Music</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeMusicSource('YouTube Music')}
                        style={musicSource === 'YouTube Music' ? { backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`, borderColor: `${accentColor}88` } : {}}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          musicSource === 'YouTube Music'
                            ? isLight ? 'text-slate-900 font-bold' : 'text-white'
                            : isLight ? 'bg-black/3 border-black/8 text-slate-700 hover:text-slate-900' : 'bg-white/5 border-white/8 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isLight ? '#0f172a' : accentColor }} />
                        <span className="font-bold text-xs">YouTube Music</span>
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    isLight ? 'bg-black/5 border-black/10 text-slate-700' : 'bg-white/5 border-white/8 text-slate-400'
                  }`}>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Music Engine: </span>
                    Filter restrictions removed — all genuine music and audio playback streams seamlessly without interruptions.
                  </div>
                </div>
              )}

              {/* SUB: LOCATION & WEATHER */}
              {subCategory === 'location' && (
                <div className="space-y-3">
                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Manual City Pinning
                    </label>
                    <form onSubmit={handleSaveCity} className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          value={localCity}
                          onChange={(e) => setLocalCity(e.target.value)}
                          placeholder="City name (e.g. New York, Tokyo)"
                          className={`w-full pl-8 pr-3 py-1.5 border rounded-xl text-xs font-medium focus:outline-none ${
                            isLight
                              ? 'bg-white border-black/20 text-slate-900 placeholder-slate-500'
                              : 'bg-black/40 border-white/10 text-slate-100 placeholder-slate-500'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-slate-200'
                        }`}
                      >
                        Save
                      </button>
                    </form>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={geoLocating}
                    className={`w-full py-2 px-3 rounded-xl border transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                      isLight
                        ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-900'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Compass className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} style={{ color: isLight ? '#0f172a' : accentColor }} />
                    <span>{geoLocating ? 'Locating via GPS...' : 'Auto-Detect via GPS'}</span>
                  </button>
                </div>
              )}

              {/* SUB: APP LINKER */}
              {subCategory === 'apps' && (
                <div className="space-y-3">
                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      Add Custom Linkable App or Game
                    </label>
                    <form onSubmit={handleAddApp} className="space-y-2">
                      <input
                        type="text"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="App or Game name (e.g. Figma, Valorant, Slack)"
                        className={`w-full px-3 py-1.5 border rounded-xl text-xs font-medium focus:outline-none ${
                          isLight
                            ? 'bg-white border-black/20 text-slate-900 placeholder-slate-500'
                            : 'bg-black/40 border-white/10 text-slate-100 placeholder-slate-500'
                        }`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={newAppCategory}
                          onChange={(e: any) => setNewAppCategory(e.target.value)}
                          className={`border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none ${
                            isLight
                              ? 'bg-white border-black/20 text-slate-900'
                              : 'bg-black/40 border-white/10 text-slate-300'
                          }`}
                        >
                          <option value="Productivity">Productivity</option>
                          <option value="PC Tools">PC Tools</option>
                          <option value="Games & Media">Games &amp; Media</option>
                        </select>
                        <input
                          type="text"
                          value={newAppUrl}
                          onChange={(e) => setNewAppUrl(e.target.value)}
                          placeholder="URL or web link"
                          className={`border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none ${
                            isLight
                              ? 'bg-white border-black/20 text-slate-900 placeholder-slate-500'
                              : 'bg-black/40 border-white/10 text-slate-100 placeholder-slate-500'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newAppName.trim()}
                        style={{ backgroundColor: accentColor, color: isLight ? '#ffffff' : '#000000' }}
                        className="w-full py-1.5 rounded-xl disabled:opacity-40 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Link App into Category
                      </button>
                    </form>
                  </div>

                  {customApps.length > 0 && (
                    <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                      <div className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                        Custom Linked Items ({customApps.length})
                      </div>
                      <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
                        {customApps.map((app) => (
                          <div
                            key={app.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                              isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/8'
                            }`}
                          >
                            <div>
                              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{app.name}</span>
                              <span className={`text-[10px] ml-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>({app.category})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteCustomApp(app.id)}
                              className={`p-1 transition-colors cursor-pointer ${
                                isLight ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
                              }`}
                              title="Delete link"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. WINDOWS 11 TASKBAR NOTIFICATION TRAY STRIP */}
      <div
        data-interactive="true"
        onMouseEnter={() => {
          (window as any).electronAPI?.setIgnoreMouseEvents(false);
        }}
        style={{
          backgroundColor: isLight ? `${mainColor}f5` : `${mainColor}eb`,
          borderColor: isLight ? 'rgba(0,0,0,0.15)' : `${accentColor}44`,
        }}
        className={`h-10 px-3 backdrop-blur-2xl border-t border-l rounded-tl-xl flex items-center gap-2 shadow-2xl transition-colors duration-300 pointer-events-auto cursor-pointer ${
          isLight ? 'text-slate-900' : 'text-slate-100'
        }`}
      >
        {/* Hidden Icons Toggle Arrow (^) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer ${
            isOpen
              ? isLight ? 'bg-black/15 text-slate-900' : 'bg-white/20 text-white'
              : isLight ? 'hover:bg-black/10 text-slate-700' : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title="Hidden icons & SEN Settings"
        >
          <ChevronUp
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={isOpen ? { color: isLight ? '#0f172a' : accentColor } : {}}
          />
        </button>

        {/* Live Audio Output Pill Indicator */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
            isLight
              ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-900'
              : 'bg-white/5 hover:bg-white/10 border-white/8 text-slate-200'
          }`}
          title="Audio output state"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span>SEN</span>
        </button>

        {/* Clock & Date Widget */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col text-right pl-2 border-l ${isLight ? 'border-black/15' : 'border-white/10'}`}
        >
          <span className={`text-[11px] font-bold leading-tight font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {currentTime || '10:42 AM'}
          </span>
          <span className={`text-[9px] leading-tight font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {currentDate || '10/30/2026'}
          </span>
        </div>
      </div>
    </div>
  );
}
