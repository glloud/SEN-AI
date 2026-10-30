import React from 'react';
import {
  Terminal,
  Calculator,
  FileText,
  Clock,
  ExternalLink,
  Layers,
  Code,
  Music,
  Mail,
  Calendar,
  Figma,
} from 'lucide-react';

interface AppLauncherProps {
  onOpenSimulatedApp: (appId: string) => void;
}

export function AppLauncher({ onOpenSimulatedApp }: AppLauncherProps) {
  const simulatedApps = [
    {
      id: 'term',
      name: 'Terminal',
      desc: 'Interactive zsh command line with SEN CLI',
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
      tag: 'Native Tool',
    },
    {
      id: 'calc',
      name: 'Calculator',
      desc: 'High-precision desktop arithmetic calculator',
      icon: <Calculator className="w-5 h-5 text-cyan-400" />,
      tag: 'Native Tool',
    },
    {
      id: 'notes',
      name: 'Quick Notes',
      desc: 'Lightweight markdown scratchpad & thoughts',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      tag: 'Native Tool',
    },
    {
      id: 'timer',
      name: 'Focus Timer',
      desc: 'Pomodoro countdown with acoustic chime',
      icon: <Clock className="w-5 h-5 text-rose-400" />,
      tag: 'Native Tool',
    },
  ];

  const webApps = [
    {
      name: 'Google Calendar',
      url: 'https://calendar.google.com',
      desc: 'Schedule, agendas, and meetings',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      desc: 'Repositories, pull requests, and issues',
      icon: <Code className="w-5 h-5 text-purple-400" />,
    },
    {
      name: 'Notion',
      url: 'https://www.notion.so',
      desc: 'Workspaces, docs, and knowledge base',
      icon: <Layers className="w-5 h-5 text-slate-300" />,
    },
    {
      name: 'Spotify',
      url: 'https://open.spotify.com',
      desc: 'Focus playlists and lo-fi audio tracks',
      icon: <Music className="w-5 h-5 text-emerald-400" />,
    },
    {
      name: 'Gmail',
      url: 'https://mail.google.com',
      desc: 'Inbox, drafts, and communications',
      icon: <Mail className="w-5 h-5 text-red-400" />,
    },
    {
      name: 'Figma',
      url: 'https://www.figma.com',
      desc: 'Product design, UI mockups, and wireframes',
      icon: <Figma className="w-5 h-5 text-orange-400" />,
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 text-xs text-slate-300">
      <div className="pb-2 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Desktop App Launcher</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Launch tools directly on screen or open in your browser
        </p>
      </div>

      {/* Simulated Desktop Tools */}
      <div>
        <h4 className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider">
          Interactive Desktop Windows
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {simulatedApps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onOpenSimulatedApp(app.id)}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:scale-105 transition-transform">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 text-xs truncate">
                  {app.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {app.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cloud & Productivity Web Apps */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider">
          Productivity Web Suites
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {webApps.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 group-hover:scale-105 transition-transform">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-semibold text-slate-200 text-xs">
                  <span className="truncate">{app.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {app.desc}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
