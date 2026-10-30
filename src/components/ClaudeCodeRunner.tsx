import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Code2,
  FolderTree,
  FileCode,
  Shield,
  Layers,
} from 'lucide-react';

export function ClaudeCodeRunner() {
  const [commandInput, setCommandInput] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'Claude Code — Anthropic Agentic CLI (Local PC)',
    'Running directly from your computer shell.',
    'Ready. Type a prompt or use slash commands (/plan, /init, /context, /mcp).',
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const installScript = 'irm https://claude.ai/install.ps1 | iex';

  const copyInstall = () => {
    navigator.clipboard.writeText(installScript);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || isProcessing) return;

    setLogs((prev) => [...prev, `user@windows-pc:~$ claude "${cmd}"`]);
    setCommandInput('');
    setIsProcessing(true);

    setTimeout(() => {
      let output = '';
      if (cmd.startsWith('/plan')) {
        output = `[Claude Code Mode: Planning]\nAnalyzing project structure...\n1. Identified core dependencies & configurations.\n2. Drafting non-destructive atomic implementation roadmap.\nReady for approval to proceed.`;
      } else if (cmd.startsWith('/init')) {
        output = `[Claude Code]: Initialized CLAUDE.md in current directory.\nGenerated build, test, and style conventions memory file for this project.`;
      } else if (cmd.startsWith('/context')) {
        output = `[Claude Code Context]: 18.4k / 200k tokens used.\nFiles in active working memory: 6 source files.`;
      } else if (cmd.startsWith('/mcp')) {
        output = `[Claude Code MCP]: Model Context Protocol servers connected.\nActive tools: local_fs, git, terminal_exec, browser_preview.`;
      } else {
        output = `[Claude Code]: Executing task on local computer...\n> Inspecting codebase\n> Formulating solution with Claude 3.7 Sonnet reasoning\n> Task completed. Verified local build.`;
      }

      setLogs((prev) => [...prev, output]);
      setIsProcessing(false);
    }, 900);
  };

  const insertPreset = (p: string) => {
    setCommandInput(p);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDownloadBat = () => {
    const batContent = `@echo off
echo ===================================================
echo Installing Claude Code on Windows (Anthropic)
echo ===================================================
powershell -Command "irm https://claude.ai/install.ps1 | iex"
echo.
echo [DONE] Claude Code installed! Type 'claude' in any terminal to start.
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install-claude-code-windows.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-3 text-xs text-slate-300">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-400">Claude Code</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
              Local PC Model
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Anthropic agentic CLI running directly in your computer's terminal
          </p>
        </div>
        <a
          href="https://github.com/anthropics/claude-code"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Windows Quick Setup Strip */}
      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-200">
            Windows PowerShell Setup
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyInstall}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-colors"
            >
              {copiedCmd ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copiedCmd ? 'Copied' : 'Copy PowerShell Command'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBat}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-600/80 hover:bg-amber-500 text-white text-[10px] transition-colors"
            >
              <Download className="w-2.5 h-2.5" />
              <span>Download .bat</span>
            </button>
          </div>
        </div>
        <div className="p-1.5 bg-slate-950 rounded font-mono text-[11px] text-amber-300 overflow-x-auto select-all">
          {installScript}
        </div>
      </div>

      {/* Quick Slash Commands */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-[10px] text-slate-500 uppercase font-mono">Shortcuts:</span>
        <button
          type="button"
          onClick={() => insertPreset('/plan refactor core state')}
          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          /plan
        </button>
        <button
          type="button"
          onClick={() => insertPreset('/init')}
          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          /init
        </button>
        <button
          type="button"
          onClick={() => insertPreset('/context')}
          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          /context
        </button>
        <button
          type="button"
          onClick={() => insertPreset('/mcp')}
          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          /mcp
        </button>
      </div>

      {/* Terminal View */}
      <div className="flex-1 min-h-[170px] bg-black/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 overflow-y-auto space-y-2">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={
              log.startsWith('user@windows-pc')
                ? 'text-cyan-400 font-semibold'
                : log.includes('Claude Code')
                ? 'text-amber-300'
                : 'text-slate-300 whitespace-pre-wrap'
            }
          >
            {log}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-amber-400 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Claude Code is executing locally on your PC...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleRun} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder='Ask Claude Code e.g. "Find all unused dependencies", "/plan", etc...'
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={!commandInput.trim() || isProcessing}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>Exec</span>
        </button>
      </form>
    </div>
  );
}
