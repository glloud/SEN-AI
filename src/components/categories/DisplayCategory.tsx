import React, { useState } from 'react';
import {
  Monitor,
  Sun,
  Volume2,
  Headphones,
  Speaker,
  Eye,
  Check,
} from 'lucide-react';

interface DisplayCategoryProps {
  accentColor: string;
}

export function DisplayCategory({ accentColor }: DisplayCategoryProps) {
  const [selectedMonitor, setSelectedMonitor] = useState<string>('Display 1 (Primary 4K)');
  const [displayScale, setDisplayScale] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(85);
  const [nightLight, setNightLight] = useState<boolean>(false);
  const [audioOutput, setAudioOutput] = useState<'Speakers' | 'Headphones' | 'AirPods'>('Headphones');

  const monitors = [
    { id: 'Display 1 (Primary 4K)', name: 'Display 1', resolution: '3840x2160 @ 144Hz', primary: true },
    { id: 'Display 2 (Secondary 1440p)', name: 'Display 2', resolution: '2560x1440 @ 165Hz', primary: false },
    { id: 'Display 3 (Ultrawide)', name: 'Display 3', resolution: '3440x1440 @ 120Hz', primary: false },
  ];

  const toggleNightLight = () => {
    const next = !nightLight;
    setNightLight(next);
    const filterEl = document.getElementById('night-light-filter');
    if (filterEl) {
      filterEl.style.opacity = next ? '0.22' : '0';
    }
  };

  return (
    <div className="flex flex-col gap-2.5 py-1 text-xs select-none font-sans text-slate-200">
      {/* 1. Monitor Selection for SEN AI & Dual Display Setup */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-white/4 border border-white/8 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-white pb-1 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
            <span>Dual Monitor &amp; Display Routing</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">SEN Active on: {selectedMonitor.split(' ')[0]}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {monitors.map((m) => {
            const isSelected = selectedMonitor === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMonitor(m.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'text-white font-semibold'
                    : 'bg-white/4 border-white/8 text-slate-400 hover:text-slate-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${accentColor}33`,
                        boxShadow: `inset 0 0 0 1px ${accentColor}`,
                      }
                    : {}
                }
              >
                <Monitor className="w-4 h-4 mb-1" style={{ color: isSelected ? accentColor : '#94a3b8' }} />
                <span className="text-[11px] truncate">{m.name}</span>
                <span className="text-[9px] font-mono text-slate-400">{m.resolution.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Display Settings & Scale */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-white/4 border border-white/8">
        <div className="flex items-center gap-2 text-slate-300">
          <Sun className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
          <span>Display Scale</span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/8">
          {[100, 125, 150].map((scale) => {
            const isSelected = displayScale === scale;
            return (
              <button
                key={scale}
                type="button"
                onClick={() => setDisplayScale(scale)}
                className={`py-0.5 px-2.5 rounded-full text-[10px] font-mono transition-all ${
                  isSelected ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${accentColor}38`,
                        boxShadow: `inset 0 0 0 1px ${accentColor}77`,
                      }
                    : {}
                }
              >
                {scale}%
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Media & Audio Output Routing */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/4 border border-white/8">
        <div className="flex items-center gap-2 text-slate-300">
          <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
          <span>Media Audio Output</span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/8">
          {(['Headphones', 'Speakers', 'AirPods'] as const).map((src) => {
            const isSelected = audioOutput === src;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setAudioOutput(src)}
                className={`py-1 px-2.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${accentColor}38`,
                        boxShadow: `inset 0 0 0 1px ${accentColor}77`,
                      }
                    : {}
                }
              >
                {src === 'Speakers' ? <Speaker className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                <span>{src}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
