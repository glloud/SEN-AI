import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Upload,
} from 'lucide-react';

export interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  preview?: string;
  timestamp: number;
}

interface ClipboardCategoryProps {
  accentColor: string;
  mainColor?: string;
}

export function ClipboardCategory({ accentColor, mainColor = '#0a0a0c' }: ClipboardCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const [items, setItems] = useState<ClipboardItem[]>(() => {
    const saved = localStorage.getItem('sen_clipboard_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        type: 'link',
        content: 'https://github.com/anthropics/claude-code',
        preview: 'Claude Code - Anthropic Agentic CLI',
        timestamp: Date.now() - 1000 * 60 * 12,
      },
      {
        id: '2',
        type: 'text',
        content: 'Win+Shift+S saves directly to SEN Dynamic Lake clipboard',
        preview: 'Win+Shift+S saves directly to SEN Dynamic Lake clipboard',
        timestamp: Date.now() - 1000 * 60 * 25,
      },
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    localStorage.setItem('sen_clipboard_history', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // 1. Listen for global copy event
    const handleCopyEvent = () => {
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            setItems((prev) => {
              if (prev.length > 0 && prev[0].content === text) return prev;
              const isUrl = text.startsWith('http://') || text.startsWith('https://');
              return [
                {
                  id: `clip_${Date.now()}_${Math.random()}`,
                  type: isUrl ? 'link' : 'text',
                  content: text,
                  preview: text.slice(0, 100),
                  timestamp: Date.now(),
                },
                ...prev,
              ];
            });
          }
        } catch (err) {}
      }, 100);
    };

    // 2. Listen for window focus to capture external copy actions
    const handleWindowFocus = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setItems((prev) => {
            if (prev.length > 0 && prev[0].content === text) return prev;
            const isUrl = text.startsWith('http://') || text.startsWith('https://');
            return [
              {
                id: `clip_${Date.now()}_${Math.random()}`,
                type: isUrl ? 'link' : 'text',
                content: text,
                preview: text.slice(0, 100),
                timestamp: Date.now(),
              },
              ...prev,
            ];
          });
        }
      } catch (err) {}
    };

    // 3. Listen for paste events
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64) {
                setItems((prev) => [
                  {
                    id: `clip_${Date.now()}_${Math.random()}`,
                    type: 'image',
                    content: base64,
                    preview: file.name || 'Screenshot (Win+Shift+S)',
                    timestamp: Date.now(),
                  },
                  ...prev,
                ]);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }

      const text = clipboardData.getData('text');
      if (text && text.trim()) {
        const isUrl = text.startsWith('http://') || text.startsWith('https://');
        setItems((prev) => {
          if (prev.length > 0 && prev[0].content === text) return prev;
          return [
            {
              id: `clip_${Date.now()}_${Math.random()}`,
              type: isUrl ? 'link' : 'text',
              content: text,
              preview: text.slice(0, 100),
              timestamp: Date.now(),
            },
            ...prev,
          ];
        });
      }
    };

    window.addEventListener('copy', handleCopyEvent);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('copy', handleCopyEvent);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleCopyItem = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setItems((prev) => [
              {
                id: `clip_${Date.now()}_${Math.random()}`,
                type: 'image',
                content: base64,
                preview: file.name || 'Dropped Screenshot',
                timestamp: Date.now(),
              },
              ...prev,
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <div className={`flex flex-col gap-2 py-1 text-xs select-none font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* Paste / Drop Pill Zone - Fluid capsule without square boxes */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          boxShadow: isDragOver ? `inset 0 0 0 1px ${accentColor}` : undefined,
          backgroundColor: isDragOver ? `${accentColor}18` : undefined,
        }}
        className={`px-3.5 py-2 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
          isLight ? 'bg-black/5 border-black/10 text-slate-800' : 'bg-white/4 border-white/8 text-slate-300'
        }`}
        title="Press Ctrl+V or drag Win+Shift+S screenshots here"
      >
        <div className="flex items-center gap-2">
          <Upload className="w-3.5 h-3.5 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
          <span className="text-[11px]">
            Press <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Ctrl+V</span> or drag <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Win+Shift+S</span> screenshots
          </span>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className={`text-[10px] font-semibold transition-colors ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clear ({items.length})
          </button>
        )}
      </div>

      {/* Fluid List of Clipboard Items - No isolated square boxes */}
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <div className={`py-6 text-center text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            No clipboard history yet. Copy anything with Ctrl+C or Win+Shift+S!
          </div>
        ) : (
          items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                isLight ? 'bg-black/5 border-black/10 hover:border-black/20' : 'bg-white/4 border-white/8 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {item.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                ) : item.type === 'link' ? (
                  <LinkIcon className="w-4 h-4 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                ) : (
                  <FileText className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} />
                )}

                <div className="min-w-0 flex-1">
                  {item.type === 'image' ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={item.content}
                        alt="Screenshot"
                        className="h-7 w-12 object-cover rounded border border-black/10"
                      />
                      <span className={`text-[11px] truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                        {item.preview || 'Screenshot'}
                      </span>
                    </div>
                  ) : (
                    <div className={`text-[11px] truncate font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      {item.content}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyItem(item)}
                  className={`p-1 rounded-full transition-colors ${
                    isLight ? 'hover:bg-black/10 text-slate-800' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  title="Copy"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5" style={{ color: isLight ? '#0f172a' : accentColor }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className={`p-1 rounded-full transition-colors ${
                    isLight ? 'hover:bg-black/10 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
