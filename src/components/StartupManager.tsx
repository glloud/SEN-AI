import React, { useState } from 'react';
import {
  Monitor,
  Download,
  Power,
  Sparkles,
  Check,
  Terminal,
  ExternalLink,
  Laptop,
  Key,
  Mic,
} from 'lucide-react';

export function StartupManager() {
  const [downloadedOs, setDownloadedOs] = useState<string | null>(null);

  const handleDownload = (os: 'windows' | 'macos' | 'linux') => {
    window.location.href = `/api/desktop/scripts/${os}`;
    setDownloadedOs(os);
    setTimeout(() => setDownloadedOs(null), 4000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 text-xs text-slate-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Power className="w-4 h-4 text-cyan-400" />
          <span>PC Startup & Desktop Integration</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure SEN to automatically launch on PC boot as an edge assistant
        </p>
      </div>

      {/* Feature Card 1: 1-Click Startup Scripts */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span>Automatic Startup on PC Boot</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Download the automated installer for your operating system. Running this script places a startup launcher in your system's boot folder so SEN is ready every time your computer turns on.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDownload('windows')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-colors group"
          >
            <Download className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-200">Windows</span>
            <span className="text-[10px] text-slate-400">.bat script</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('macos')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-colors group"
          >
            <Download className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-200">macOS</span>
            <span className="text-[10px] text-slate-400">LaunchAgent</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('linux')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-colors group"
          >
            <Download className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-200">Linux</span>
            <span className="text-[10px] text-slate-400">.desktop</span>
          </button>
        </div>

        {downloadedOs && (
          <div className="flex items-center gap-1.5 p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-[11px] animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Installer for {downloadedOs} downloaded! Run the file to activate startup.</span>
          </div>
        )}
      </div>

      {/* Feature Card 2: Standalone App PWA */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
          <Laptop className="w-4 h-4 text-amber-400" />
          <span>Standalone Desktop Window (No Browser Chrome)</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          SEN is configured as a standalone desktop application (PWA). In Chrome or Edge, click the <span className="text-slate-200 font-mono">Install</span> icon in the address bar to run SEN in its own dedicated, frameless window on your desktop.
        </p>
      </div>

      {/* Feature Card 3: Global Hotkeys & "Hey Sen" */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
          <Key className="w-4 h-4 text-emerald-400" />
          <span>Shortcuts & Wake Word</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-300">Voice Wake Word</span>
            <span className="text-cyan-400 font-mono font-semibold">"Hey Sen"</span>
          </div>
          <div className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-300">Quick Summon Hotkey</span>
            <span className="text-slate-400 font-mono">Cmd / Ctrl + K</span>
          </div>
          <div className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-300">Toggle Side Workspace</span>
            <span className="text-slate-400 font-mono">Cmd / Ctrl + Shift + S</span>
          </div>
        </div>
      </div>
    </div>
  );
}
