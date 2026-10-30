import React, { useState } from 'react';
import { MapPin, Clock, Palette, Type, Check, ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeSetupModalProps {
  onComplete: (config: WelcomeConfig) => void;
}

export interface WelcomeConfig {
  location: string;
  timeFormat: '12h' | '24h';
  themeColor: string;
  fontFamily: string;
}

const THEME_ACCENTS = [
  { id: 'cyan', name: 'Cyan', color: '#06b6d4', ring: 'ring-cyan-500' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', ring: 'ring-emerald-500' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6', ring: 'ring-violet-500' },
  { id: 'amber', name: 'Amber', color: '#f59e0b', ring: 'ring-amber-500' },
  { id: 'rose', name: 'Rose', color: '#f43f5e', ring: 'ring-rose-500' },
  { id: 'slate', name: 'Monochrome', color: '#94a3b8', ring: 'ring-slate-400' },
];

const FONT_OPTIONS = [
  { id: 'Alata', name: 'Alata (Default Soft)', style: "'Alata', sans-serif" },
  { id: 'Gruppo', name: 'Gruppo', style: "'Gruppo', sans-serif" },
  { id: 'Varela Round', name: 'Varela Round', style: "'Varela Round', sans-serif" },
  { id: 'Kanit', name: 'Kanit', style: "'Kanit', sans-serif" },
  { id: 'Manjari', name: 'Manjari', style: "'Manjari', sans-serif" },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', style: "'JetBrains Mono', monospace" },
];

export const WelcomeSetupModal: React.FC<WelcomeSetupModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [location, setLocation] = useState('New York, USA');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [themeColor, setThemeColor] = useState('#06b6d4');
  const [fontFamily, setFontFamily] = useState('Alata');

  const handleFinish = () => {
    localStorage.setItem('sen_welcome_completed', 'true');
    localStorage.setItem('sen_user_location', location);
    localStorage.setItem('sen_time_format', timeFormat);
    localStorage.setItem('sen_theme_color', themeColor);
    localStorage.setItem('sen_font_family', fontFamily);
    document.documentElement.style.setProperty('--sen-accent', themeColor);
    document.documentElement.style.setProperty('--app-font', `'${fontFamily}', sans-serif`);
    onComplete({ location, timeFormat, themeColor, fontFamily });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* 480x480 Exact Square Modal */}
      <div 
        className="w-[480px] h-[480px] rounded-3xl bg-black/90 border border-white/10 shadow-2xl flex flex-col justify-between p-7 relative overflow-hidden liquid-glass"
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-25 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: themeColor }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-[90px] opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: themeColor }}
        />

        {/* Top Bar / Step Indicators */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/80" style={{ color: themeColor }} />
            <span className="text-xs uppercase tracking-widest font-semibold text-white/60">SEN AI Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-6' : 'w-2 bg-white/20'
                }`}
                style={{ backgroundColor: step === s ? themeColor : undefined }}
              />
            ))}
          </div>
        </div>

        {/* Modal Body / Step Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center my-4">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">Location & Time</h2>
                <p className="text-xs text-white/50 leading-relaxed">Personalize weather forecasts and local clock sync.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/70">City & Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70">Clock Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      timeFormat === '12h' 
                        ? 'bg-white/15 border-white/30 text-white shadow-inner' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    12-Hour Format
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      timeFormat === '24h' 
                        ? 'bg-white/15 border-white/30 text-white shadow-inner' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    24-Hour Format
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">Accent Color</h2>
                <p className="text-xs text-white/50 leading-relaxed">Choose a clean highlight tone for notch glows and active states.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {THEME_ACCENTS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeColor(t.color)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      themeColor === t.color 
                        ? 'bg-white/15 border-white/30 shadow-lg' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: t.color }}
                    >
                      {themeColor === t.color && <Check className="w-3 h-3 text-black font-bold" />}
                    </div>
                    <span className="text-xs text-white font-medium">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">Typography</h2>
                <p className="text-xs text-white/50 leading-relaxed">Select a soft, minimalist font preset for SEN AI Desktop.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontFamily(f.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      fontFamily === f.id 
                        ? 'bg-white/15 border-white/30 shadow-lg' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs text-white" style={{ fontFamily: f.style }}>
                      {f.name}
                    </span>
                    {fontFamily === f.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="text-xs font-medium text-white/60 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <div className="text-[11px] text-white/40">Step 1 of 3</div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-md active:scale-95"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-lg active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              Start SEN AI
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
