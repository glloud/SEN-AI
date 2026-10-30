import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ListOrdered,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface WritingStudioProps {
  onSendToChat?: (text: string) => void;
}

export function WritingStudio({ onSendToChat }: WritingStudioProps) {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'bullets' | 'tldr' | 'action_items' | 'rewrite'>('bullets');
  const [tone, setTone] = useState<'professional' | 'concise' | 'technical' | 'casual'>('professional');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to summarize');
      }
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Error executing summarization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = (type: string) => {
    if (type === 'meeting') {
      setContent(
        `Team Sync - October 29\nAttendees: Alex, Sarah, David\nDiscussion: We reviewed the Q4 product roadmap. Sarah reported that the Dynamic Island UI layout passed usability tests with 94% positive response. David highlighted an issue with API latency during peak hours, and recommended switching to gemini-3.1-flash-lite for instant micro-actions while keeping gemini-3.8-flash for deep reasoning. Alex will finalize the standalone desktop installer scripts for Windows and macOS by Thursday.`
      );
    } else if (type === 'article') {
      setContent(
        `Artificial intelligence copilots are transitioning from isolated chat windows into persistent, ambient desktop fixtures. By embedding responsive Dynamic Island elements along screen boundaries, users can invoke spatial assistance with sub-second latency without context-switching. Multimodal models combined with local device orchestration enable unified task planning, calendar synchronization, and automated document synthesis.`
      );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Writing & Summarize Studio</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by gemini-3.8-flash linguistic synthesis
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => loadSample('meeting')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            Sample Meeting
          </button>
          <button
            type="button"
            onClick={() => loadSample('article')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            Sample Article
          </button>
        </div>
      </div>

      {/* Target Format Selector */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">
          Transformation Format
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFormat('bullets')}
            className={`py-1 rounded font-medium transition-colors ${
              format === 'bullets' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Key Bullets
          </button>
          <button
            type="button"
            onClick={() => setFormat('tldr')}
            className={`py-1 rounded font-medium transition-colors ${
              format === 'tldr' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TL;DR Brief
          </button>
          <button
            type="button"
            onClick={() => setFormat('action_items')}
            className={`py-1 rounded font-medium transition-colors ${
              format === 'action_items' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Action Items
          </button>
          <button
            type="button"
            onClick={() => setFormat('rewrite')}
            className={`py-1 rounded font-medium transition-colors ${
              format === 'rewrite' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Polish Tone
          </button>
        </div>
      </div>

      {/* Tone selection */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] text-slate-400">Tone:</span>
        {(['professional', 'concise', 'technical', 'casual'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTone(t)}
            className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
              tone === t
                ? 'bg-slate-700 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input textarea */}
      <div className="relative flex-1 min-h-[140px] flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or write notes, transcripts, or drafts here..."
          className="w-full flex-1 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
          <span>{wordCount} words · {content.length} characters</span>
          {content && (
            <button
              type="button"
              onClick={() => setContent('')}
              className="hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action button */}
      <button
        type="button"
        disabled={isLoading || !content.trim()}
        onClick={handleSummarize}
        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isLoading ? 'Synthesizing with SEN...' : 'Transform & Summarize'}</span>
      </button>

      {error && (
        <div className="p-2 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-3 bg-slate-900/95 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
            <span className="font-semibold text-cyan-400">SEN Output</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
