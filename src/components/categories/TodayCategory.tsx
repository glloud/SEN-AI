import React, { useState, useEffect } from 'react';
import {
  Sun,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Pause,
  Play,
  RotateCcw,
  MapPin,
} from 'lucide-react';

interface TodayCategoryProps {
  pinnedCity: string;
  onUpdateCity: (city: string) => void;
  accentColor: string;
  mainColor?: string;
}

export function TodayCategory({ pinnedCity, onUpdateCity, accentColor, mainColor = '#0a0a0c' }: TodayCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  // Weather state
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState(pinnedCity);

  // Timer state - strictly called "Timer" and can be set manually
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // To-Do list state
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    const saved = localStorage.getItem('sen_todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', text: 'Review quarterly product roadmap', done: true },
      { id: '2', text: 'Sync with lead engineer on Claude Code', done: false },
      { id: '3', text: 'Test Dynamic Lake on dual monitors', done: false },
    ];
  });
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    localStorage.setItem('sen_todos', JSON.stringify(todos));
  }, [todos]);

  // Timer countdown
  useEffect(() => {
    let int: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      int = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {}
    }
    return () => clearInterval(int);
  }, [isTimerRunning, timerSeconds]);

  // Set manual timer minutes
  const handleSetMinutes = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins));
    setCustomMinutes(valid);
    setTimerSeconds(valid * 60);
    setIsTimerRunning(false);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: `td_${Date.now()}`, text: newTodoText.trim(), done: false },
    ]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Weather temperature conversion
  const tempF = 72;
  const tempC = Math.round(((tempF - 32) * 5) / 9);
  const displayTemp = tempUnit === 'F' ? `${tempF}°F` : `${tempC}°C`;

  // Days of this week
  const weekDays = [
    { day: 'Mon', date: '27', active: false },
    { day: 'Tue', date: '28', active: false },
    { day: 'Wed', date: '29', active: false },
    { day: 'Thu', date: '30', active: true },
    { day: 'Fri', date: '31', active: false },
    { day: 'Sat', date: '01', active: false },
    { day: 'Sun', date: '02', active: false },
  ];

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-2.5 py-1 text-xs select-none font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* 1. Weather Strip - Fluid pill container without square boxes */}
      <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        <div className="flex items-center gap-3">
          <Sun className="w-4 h-4 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{displayTemp}</span>
            <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Partly Sunny</span>
            <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>·</span>
            {isEditingCity ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (cityInput.trim()) {
                    onUpdateCity(cityInput.trim());
                    setIsEditingCity(false);
                  }
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className={`px-1.5 py-0.5 rounded text-[11px] border outline-none font-mono ${
                    isLight ? 'bg-white border-black/20 text-slate-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                  autoFocus
                />
                <button type="submit" className="text-[10px] font-bold" style={{ color: isLight ? '#0f172a' : accentColor }}>
                  Save
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingCity(true)}
                className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                  isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Click to change location"
              >
                <MapPin className="w-3 h-3 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                <span>{pinnedCity}</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTempUnit((u) => (u === 'F' ? 'C' : 'F'))}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
            isLight ? 'bg-black/8 hover:bg-black/15 text-slate-900 font-bold' : 'bg-white/6 hover:bg-white/10 text-slate-300'
          }`}
        >
          °{tempUnit === 'F' ? 'C' : 'F'}
        </button>
      </div>

      {/* 2. This Week Calendar Strip - Fluid pills without square boxes */}
      <div className={`flex items-center justify-between gap-1 px-3 py-1.5 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        {weekDays.map((w, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: w.active
                ? isLight ? `${accentColor}44` : `${accentColor}33`
                : 'transparent',
              color: w.active
                ? isLight ? '#0f172a' : '#ffffff'
                : undefined,
              boxShadow: w.active
                ? `inset 0 0 0 1px ${accentColor}aa`
                : undefined,
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-center transition-all ${
              w.active
                ? 'font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider">{w.day}</span>
            <span className="text-xs font-mono tabular-nums">{w.date}</span>
          </div>
        ))}
      </div>

      {/* 3. Timer & To-Do Unified Split */}
      <div className={`flex items-stretch gap-3 px-3.5 py-2.5 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        {/* DIGITAL STOPWATCH TIMER */}
        <div className={`flex-1 flex flex-col justify-between pr-3 border-r ${
          isLight ? 'border-black/10' : 'border-white/8'
        }`}>
          <div className={`flex items-center justify-between gap-1 my-0.5 p-1 rounded-xl border ${
            isLight ? 'bg-black/5 border-black/10' : 'bg-black/40 border-white/8'
          }`}>
            <span className={`text-[10px] font-mono pl-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Target:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="300"
                value={customMinutes}
                onChange={(e) => handleSetMinutes(Number(e.target.value))}
                className={`w-12 border rounded-lg px-1.5 py-0.5 text-center text-xs font-mono font-bold outline-none ${
                  isLight ? 'bg-white border-black/20 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                }`}
                title="Type minutes directly"
              />
              <span className={`text-[10px] font-mono pr-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>min</span>
            </div>
          </div>

          {/* Large Digital Clock readout */}
          <div className={`text-center font-mono tabular-nums text-2xl font-bold tracking-widest my-1 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {formatTimer(timerSeconds)}
          </div>

          {/* Quick presets & action controls */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {[5, 15, 25, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSetMinutes(m)}
                  className={`px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-semibold transition-colors ${
                    customMinutes === m
                      ? isLight ? 'bg-black/15 text-slate-900 font-bold' : 'bg-white/20 text-white'
                      : isLight ? 'bg-black/5 text-slate-600 hover:text-slate-900' : 'bg-white/4 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{
                  backgroundColor: isLight ? `${accentColor}44` : `${accentColor}38`,
                  boxShadow: `inset 0 0 0 1px ${accentColor}aa`,
                }}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {isTimerRunning ? (
                  <Pause className="w-3 h-3 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                ) : (
                  <Play className="w-3 h-3 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                )}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(customMinutes * 60);
                }}
                className={`p-1 rounded-full transition-colors ${
                  isLight ? 'bg-black/5 hover:bg-black/10 text-slate-700' : 'bg-white/6 hover:bg-white/15 text-slate-400 hover:text-white'
                }`}
                title="Reset"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* TO-DO LIST */}
        <div className="flex-1 flex flex-col justify-between pl-1">
          <div className={`flex items-center justify-end text-[10px] font-mono mb-0.5 ${
            isLight ? 'text-slate-600 font-medium' : 'text-slate-400'
          }`}>
            <span>{todos.filter((t) => t.done).length}/{todos.length} done</span>
          </div>

          <div className="space-y-1.5 my-1">
            {todos.slice(0, 3).map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between gap-1.5 text-[11px] group"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                >
                  {todo.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  )}
                  <span
                    className={`truncate font-medium ${
                      todo.done
                        ? isLight ? 'line-through text-slate-400' : 'line-through text-slate-500'
                        : isLight ? 'text-slate-900 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {todo.text}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-600 hover:text-slate-300'
                  }`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTodo} className={`flex items-center gap-1 pt-1 border-t ${
            isLight ? 'border-black/10' : 'border-white/5'
          }`}>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add task..."
              className={`flex-1 bg-transparent text-[11px] outline-none font-medium ${
                isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={!newTodoText.trim()}
              className={`p-1 rounded-full disabled:opacity-30 ${
                isLight ? 'hover:bg-black/10 text-slate-900' : 'hover:bg-white/10 text-slate-300'
              }`}
              style={{ color: isLight ? '#0f172a' : accentColor }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
