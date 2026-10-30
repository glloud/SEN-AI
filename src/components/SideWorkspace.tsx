import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Calendar,
  Layers,
  Power,
  Mic,
  MicOff,
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
  Download,
  Clock,
  Terminal,
  FileEdit,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Message, CalendarEvent } from '../types.ts';
import { CalendarAgenda } from './CalendarAgenda.tsx';
import { WritingStudio } from './WritingStudio.tsx';
import { AppLauncher } from './AppLauncher.tsx';
import { StartupManager } from './StartupManager.tsx';

interface SideWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (m: string) => void;
  calendarEvents: CalendarEvent[];
  onAddCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  onToggleCompleteCalendarEvent: (id: string) => void;
  onDeleteCalendarEvent: (id: string) => void;
  onOpenSimulatedApp: (appId: string) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearChat: () => void;
}

export function SideWorkspace({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  selectedModel,
  onSelectModel,
  calendarEvents,
  onAddCalendarEvent,
  onToggleCompleteCalendarEvent,
  onDeleteCalendarEvent,
  onOpenSimulatedApp,
  isListening,
  onToggleVoice,
  isDarkMode,
  onToggleDarkMode,
  onClearChat,
}: SideWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'summarize' | 'calendar' | 'apps' | 'startup'>('chat');
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="SEN Desktop Side Workspace"
      className="fixed right-0 top-0 bottom-0 w-[420px] md:w-[480px] z-40 flex flex-col bg-slate-950/88 dark:bg-[#0B0F17]/95 backdrop-blur-3xl border-l border-white/10 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 animate-in slide-in-from-right duration-300"
    >
      {/* Top Bar Contract (Wordmark — Navigation links / controls — Primary close action) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold tracking-tight text-sm text-slate-100 whitespace-nowrap">
            SEN Assistant
          </span>
          <span className="text-[10px] text-slate-500 font-mono">v1.2</span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="smart">Smart Router (Auto)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
            </select>
          </div>

          {/* Voice Wake Toggle */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-1.5 rounded-lg border transition-colors ${
              isListening
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isListening ? 'Voice Wake Active: Say "Hey Sen"' : 'Voice Wake Paused'}
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Close / Collapse Workspace */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Collapse Side Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Tab Navigation Bar */}
      <nav className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-slate-950/40 text-xs overflow-x-auto shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'chat'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Assistant
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('summarize')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'summarize'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Summarize & Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'calendar'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Calendar & Agenda
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('apps')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'apps'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          App Launcher
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('startup')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'startup'
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PC Startup
        </button>
      </nav>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {activeTab === 'summarize' && <WritingStudio />}

        {activeTab === 'calendar' && (
          <CalendarAgenda
            events={calendarEvents}
            onAddEvent={onAddCalendarEvent}
            onToggleComplete={onToggleCompleteCalendarEvent}
            onDeleteEvent={onDeleteCalendarEvent}
          />
        )}

        {activeTab === 'apps' && (
          <AppLauncher onOpenSimulatedApp={onOpenSimulatedApp} />
        )}

        {activeTab === 'startup' && <StartupManager />}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full justify-between space-y-3">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl my-auto">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    SEN Desktop Copilot Ready
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Say <span className="text-cyan-400 font-medium">"Hey Sen"</span> or type a prompt. SEN can schedule meetings to Google Calendar, set timers, summarize documents, or launch apps.
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 w-full mt-4 text-xs">
                    <button
                      type="button"
                      onClick={() => onSendMessage('Schedule design sync tomorrow at 3pm')}
                      className="p-2 text-left bg-slate-900 hover:bg-slate-800/80 rounded-lg text-slate-300 border border-slate-800 transition-colors"
                    >
                      📅 "Schedule design sync tomorrow at 3pm"
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendMessage('Set a 25 minute focus timer')}
                      className="p-2 text-left bg-slate-900 hover:bg-slate-800/80 rounded-lg text-slate-300 border border-slate-800 transition-colors"
                    >
                      ⏱ "Set a 25 minute focus timer"
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendMessage('Open Calculator and Terminal')}
                      className="p-2 text-left bg-slate-900 hover:bg-slate-800/80 rounded-lg text-slate-300 border border-slate-800 transition-colors"
                    >
                      🚀 "Open Calculator and Terminal"
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* User / Assistant Message Bubble */}
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-cyan-600 text-white rounded-br-xs'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.content ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : null}

                      {/* Tool Actions executed by SEN */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-2">
                          {msg.actions.map((act, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg"
                            >
                              {act.type === 'calendar' && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                                    <Calendar className="w-3 h-3" />
                                    <span>Event Scheduled: {act.data.title}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {act.data.date} · {act.data.startTime}
                                  </div>
                                  {act.data.googleCalendarUrl && (
                                    <a
                                      href={act.data.googleCalendarUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 text-[10px] transition-colors"
                                    >
                                      <span>Add to Google Calendar</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {act.type === 'app' && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-emerald-300">
                                    🚀 Launched {act.data.appName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenSimulatedApp(act.data.appName)}
                                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                                  >
                                    Focus
                                  </button>
                                </div>
                              )}

                              {act.type === 'timer' && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-amber-300">
                                    ⏱ Timer Set: {act.data.durationMinutes} min
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenSimulatedApp('timer')}
                                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                                  >
                                    View
                                  </button>
                                </div>
                              )}

                              {act.type === 'time' && (
                                <div className="text-[11px] text-slate-300">
                                  <span>Current Time: </span>
                                  <span className="font-mono text-cyan-300">
                                    {act.data.currentTime}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata below Assistant message */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 font-mono">
                        <span>{msg.modelUsed || 'SEN AI'}</span>
                        {msg.routingReason && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[200px]" title={msg.routingReason}>
                              {msg.routingReason}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>SEN is orchestrating your request...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Message SEN, or say "Hey Sen"...'
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={onClearChat}
                  className="p-2 text-slate-500 hover:text-slate-300 rounded-xl transition-colors shrink-0"
                  title="Clear Chat History"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
