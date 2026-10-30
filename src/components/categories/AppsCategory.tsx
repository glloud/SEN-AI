import React, { useState } from 'react';
import {
  Terminal,
  Calculator,
  FileText,
  Folder,
  Code,
  Music,
  Gamepad2,
  Plus,
  Layers,
} from 'lucide-react';

export interface AppItem {
  id: string;
  name: string;
  category: 'PC Tools' | 'Productivity' | 'Games & Media';
  iconName: string;
  url?: string;
  isSimulated?: boolean;
}

const DEFAULT_APPS: AppItem[] = [
  { id: 'term', name: 'Terminal', category: 'PC Tools', iconName: 'term', isSimulated: true },
  { id: 'calc', name: 'Calculator', category: 'PC Tools', iconName: 'calc', isSimulated: true },
  { id: 'notes', name: 'Quick Notes', category: 'PC Tools', iconName: 'notes', isSimulated: true },
  { id: 'explorer', name: 'File Explorer', category: 'PC Tools', iconName: 'folder', url: 'file:///' },
  { id: 'claude', name: 'Claude Code', category: 'Productivity', iconName: 'code', url: 'https://github.com/anthropics/claude-code' },
  { id: 'vscode', name: 'VS Code', category: 'Productivity', iconName: 'code', url: 'https://vscode.dev' },
  { id: 'spotify', name: 'Spotify Music', category: 'Games & Media', iconName: 'music', url: 'https://open.spotify.com' },
  { id: 'steam', name: 'Steam', category: 'Games & Media', iconName: 'game', url: 'https://store.steampowered.com' },
];

interface AppsCategoryProps {
  onOpenSimulatedApp: (appId: string) => void;
  accentColor: string;
  mainColor?: string;
  customApps?: AppItem[];
  onAddCustomApp?: (app: AppItem) => void;
}

export function AppsCategory({
  onOpenSimulatedApp,
  accentColor,
  mainColor = '#0a0a0c',
  customApps = [],
  onAddCustomApp,
}: AppsCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const [activeCategory, setActiveCategory] = useState<'All' | 'PC Tools' | 'Productivity' | 'Games & Media'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appCat, setAppCat] = useState<'Productivity' | 'Games & Media'>('Games & Media');

  const allApps = [...DEFAULT_APPS, ...customApps];
  const filteredApps =
    activeCategory === 'All'
      ? allApps
      : allApps.filter((a) => a.category === activeCategory);

  const handleLaunch = (app: AppItem) => {
    if (app.isSimulated) {
      onOpenSimulatedApp(app.id);
    } else if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !onAddCustomApp) return;
    onAddCustomApp({
      id: `app_${Date.now()}`,
      name: appName.trim(),
      category: appCat,
      iconName: appCat === 'Games & Media' ? 'game' : 'code',
      url: appUrl.trim() || 'https://google.com',
    });
    setAppName('');
    setAppUrl('');
    setShowAddModal(false);
  };

  const renderIcon = (iconName: string) => {
    const iconColor = isLight ? '#0f172a' : accentColor;
    switch (iconName) {
      case 'term':
        return <Terminal className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'calc':
        return <Calculator className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'notes':
        return <FileText className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'folder':
        return <Folder className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'code':
        return <Code className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'music':
        return <Music className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      case 'game':
        return <Gamepad2 className="w-3.5 h-3.5" style={{ color: iconColor }} />;
      default:
        return <Layers className="w-3.5 h-3.5" style={{ color: iconColor }} />;
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 py-1 text-xs select-none font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* Horizontal Filter Capsule - Continuous pills without square boxes */}
      <div className={`flex items-center justify-between px-2 py-1 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        <div className="flex items-center gap-1">
          {(['All', 'PC Tools', 'Productivity', 'Games & Media'] as const).map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? isLight ? 'text-slate-900 font-bold' : 'text-white font-medium'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`,
                        boxShadow: `inset 0 0 0 1px ${accentColor}aa`,
                      }
                    : {}
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
            isLight ? 'text-slate-900 hover:text-slate-800' : 'text-slate-300 hover:text-white'
          }`}
          style={{ color: isLight ? '#0f172a' : accentColor }}
        >
          <Plus className="w-3 h-3" />
          <span>Add Link</span>
        </button>
      </div>

      {/* Inline Add Modal */}
      {showAddModal && (
        <form
          onSubmit={handleCreateCustom}
          className={`p-3 rounded-2xl border space-y-2 animate-in fade-in ${
            isLight ? 'bg-white border-black/15 shadow-lg' : 'bg-black/60 border-white/12'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="App / Game Name"
              className={`border rounded-xl px-2.5 py-1 text-xs outline-none font-medium ${
                isLight ? 'bg-black/5 border-black/15 text-slate-900 placeholder-slate-500' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
              }`}
            />
            <select
              value={appCat}
              onChange={(e) => setAppCat(e.target.value as any)}
              className={`border rounded-xl px-2 py-1 text-xs outline-none font-medium ${
                isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-black border-white/10 text-white'
              }`}
            >
              <option value="Games & Media">Games &amp; Media</option>
              <option value="Productivity">Productivity</option>
            </select>
          </div>
          <input
            type="text"
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
            placeholder="Web Link / Launch URL"
            className={`w-full border rounded-xl px-2.5 py-1 text-xs outline-none font-medium ${
              isLight ? 'bg-black/5 border-black/15 text-slate-900 placeholder-slate-500' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
            }`}
          />
          <button
            type="submit"
            style={{ backgroundColor: isLight ? accentColor : `${accentColor}44`, color: isLight ? '#ffffff' : '#ffffff' }}
            className="w-full py-1 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Add App
          </button>
        </form>
      )}

      {/* Fluid Apps Row/Pill Grid (No sectioned-off square boxes, sleek capsule buttons) */}
      <div className="grid grid-cols-4 gap-2">
        {filteredApps.slice(0, 8).map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => handleLaunch(app)}
            className={`flex items-center gap-2 py-2 px-2.5 rounded-2xl border transition-all text-left ${
              isLight ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/4 hover:bg-white/8 border-white/8 hover:border-white/15'
            }`}
          >
            <div className="shrink-0">{renderIcon(app.iconName)}</div>
            <div className="min-w-0 flex-1">
              <div className={`text-[11px] font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{app.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
