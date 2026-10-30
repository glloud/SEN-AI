import React, { useState } from 'react';
import {
  Lock,
  Moon,
  RotateCcw,
  Power,
} from 'lucide-react';

interface PowerCategoryProps {
  onTriggerPowerAction: (action: 'lock' | 'sleep' | 'restart' | 'shutdown') => void;
  accentColor: string;
  mainColor?: string;
}

export function PowerCategory({ onTriggerPowerAction, accentColor, mainColor = '#0a0a0c' }: PowerCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const [confirmAction, setConfirmAction] = useState<'restart' | 'shutdown' | null>(null);

  const handleAction = (act: 'lock' | 'sleep' | 'restart' | 'shutdown') => {
    if (act === 'restart' || act === 'shutdown') {
      if (confirmAction === act) {
        onTriggerPowerAction(act);
        setConfirmAction(null);
      } else {
        setConfirmAction(act);
      }
    } else {
      onTriggerPowerAction(act);
    }
  };

  const iconColor = isLight ? '#0f172a' : accentColor;

  return (
    <div className={`flex flex-col gap-2.5 py-1 text-xs select-none font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* 4 Power Action Horizontal Capsules */}
      <div className="grid grid-cols-4 gap-2">
        {/* 1. Lock PC */}
        <button
          type="button"
          onClick={() => handleAction('lock')}
          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all group ${
            isLight ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/4 hover:bg-white/8 border-white/8'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: iconColor }} />
          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Lock</span>
        </button>

        {/* 2. Sleep */}
        <button
          type="button"
          onClick={() => handleAction('sleep')}
          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all group ${
            isLight ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/4 hover:bg-white/8 border-white/8'
          }`}
        >
          <Moon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: iconColor }} />
          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sleep</span>
        </button>

        {/* 3. Restart */}
        <button
          type="button"
          onClick={() => handleAction('restart')}
          style={
            confirmAction === 'restart'
              ? {
                  backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`,
                  boxShadow: `inset 0 0 0 1px ${accentColor}`,
                }
              : {}
          }
          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all group ${
            isLight ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/4 hover:bg-white/8 border-white/8'
          }`}
        >
          <RotateCcw className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: iconColor }} />
          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {confirmAction === 'restart' ? 'Confirm' : 'Restart'}
          </span>
        </button>

        {/* 4. Shut Down */}
        <button
          type="button"
          onClick={() => handleAction('shutdown')}
          style={
            confirmAction === 'shutdown'
              ? {
                  backgroundColor: isLight ? `${accentColor}44` : `${accentColor}33`,
                  boxShadow: `inset 0 0 0 1px ${accentColor}`,
                }
              : {}
          }
          className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all group ${
            isLight ? 'bg-black/5 hover:bg-black/10 border-black/10' : 'bg-white/4 hover:bg-white/8 border-white/8'
          }`}
        >
          <Power className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: iconColor }} />
          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {confirmAction === 'shutdown' ? 'Confirm' : 'Shut Down'}
          </span>
        </button>
      </div>
    </div>
  );
}
