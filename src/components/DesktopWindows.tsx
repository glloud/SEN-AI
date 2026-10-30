import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Terminal as TerminalIcon,
  Calculator as CalcIcon,
  FileText,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Send,
} from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPos?: { x: number; y: number };
  width?: number;
  height?: number;
}

export function WindowFrame({
  title,
  icon,
  isOpen,
  onClose,
  children,
  initialPos = { x: 120, y: 100 },
  width = 460,
  height = 360,
}: WindowProps) {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: initialPos.x,
    posY: initialPos.y,
  });

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - width - 10, dragRef.current.posX + dx)),
      y: Math.max(36, Math.min(window.innerHeight - height - 10, dragRef.current.posY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 40,
      }}
      className="flex flex-col bg-slate-900/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border border-slate-700/60 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-slate-800/80 dark:bg-slate-900/80 border-b border-slate-700/50 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          {/* macOS window control buttons */}
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center group"
            >
              <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 flex items-center justify-center group"
            >
              <Minus className="w-2 h-2 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 flex items-center justify-center" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            {icon}
            <span>{title}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">SEN OS</span>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto p-4 text-sm">{children}</div>
    </div>
  );
}

// 1. Calculator Window
export function CalculatorApp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);

  const handleNum = (n: string) => {
    setDisplay((d) => (d === '0' ? n : d + n));
  };

  const handleOp = (operator: string) => {
    setPrev(parseFloat(display));
    setOp(operator);
    setDisplay('0');
  };

  const handleEqual = () => {
    if (prev === null || op === null) return;
    const current = parseFloat(display);
    let result = 0;
    if (op === '+') result = prev + current;
    if (op === '-') result = prev - current;
    if (op === '×') result = prev * current;
    if (op === '÷') result = current !== 0 ? prev / current : 0;
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
  };

  return (
    <WindowFrame
      id="calc"
      title="Calculator"
      icon={<CalcIcon className="w-3.5 h-3.5 text-cyan-400" />}
      isOpen={isOpen}
      onClose={onClose}
      initialPos={{ x: 160, y: 140 }}
      width={280}
      height={380}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-right text-2xl font-mono text-cyan-300 overflow-x-auto tracking-wider">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 font-mono">
          <button onClick={handleClear} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-red-400 text-xs">C</button>
          <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs">±</button>
          <button onClick={() => handleOp('÷')} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">÷</button>
          <button onClick={() => handleOp('×')} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">×</button>

          <button onClick={() => handleNum('7')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">7</button>
          <button onClick={() => handleNum('8')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">8</button>
          <button onClick={() => handleNum('9')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">9</button>
          <button onClick={() => handleOp('-')} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">-</button>

          <button onClick={() => handleNum('4')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">4</button>
          <button onClick={() => handleNum('5')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">5</button>
          <button onClick={() => handleNum('6')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">6</button>
          <button onClick={() => handleOp('+')} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">+</button>

          <button onClick={() => handleNum('1')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">1</button>
          <button onClick={() => handleNum('2')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">2</button>
          <button onClick={() => handleNum('3')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">3</button>
          <button onClick={handleEqual} className="row-span-2 p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold flex items-center justify-center">=</button>

          <button onClick={() => handleNum('0')} className="col-span-2 p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded text-center">0</button>
          <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded">.</button>
        </div>
      </div>
    </WindowFrame>
  );
}

// 2. Terminal Window
export function TerminalApp({
  isOpen,
  onClose,
  onExecutePrompt,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt: (cmd: string) => void;
}) {
  const [history, setHistory] = useState<string[]>([
    'SEN Desktop Terminal v1.0.4',
    'Type "help" to see available commands or ask SEN directly with "sen <query>".',
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newHistory = [...history, `sen@desktop:~$ ${cmd}`];

    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (cmd === 'help') {
      newHistory.push(
        'Available commands:',
        '  help           - Show this help manual',
        '  time / date    - Print system date and time',
        '  sen <query>    - Forward query to SEN AI',
        '  clear          - Clear terminal screen',
        '  apps           - List available desktop apps'
      );
    } else if (cmd === 'time' || cmd === 'date') {
      newHistory.push(new Date().toString());
    } else if (cmd.startsWith('sen ')) {
      const q = cmd.slice(4);
      newHistory.push(`[SEN Routing]: Processing query "${q}"...`);
      onExecutePrompt(q);
    } else if (cmd === 'apps') {
      newHistory.push('Apps installed: Terminal, Calculator, Notes, Calendar, Notion, GitHub, Spotify, Gmail');
    } else {
      newHistory.push(`Command not found: "${cmd}". Type "help" or "sen ${cmd}".`);
    }

    setHistory(newHistory);
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <WindowFrame
      id="term"
      title="Terminal — zsh"
      icon={<TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />}
      isOpen={isOpen}
      onClose={onClose}
      initialPos={{ x: 200, y: 120 }}
      width={520}
      height={360}
    >
      <div className="font-mono text-xs text-slate-300 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {history.map((line, idx) => (
            <div
              key={idx}
              className={line.startsWith('sen@desktop') ? 'text-cyan-400 font-semibold' : 'text-slate-300'}
            >
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
          <span className="text-emerald-400 font-bold select-none">sen@desktop:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
            placeholder="type command or sen <prompt>..."
            autoFocus
          />
        </form>
      </div>
    </WindowFrame>
  );
}

// 3. Quick Notes App
export function NotesApp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('sen_quick_notes') || '# Quick Ideas & Meeting Notes\n- Review product roadmap with team\n- Prepare summary for leadership sync\n';
  });
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem('sen_quick_notes', e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WindowFrame
      id="notes"
      title="Quick Notes"
      icon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
      isOpen={isOpen}
      onClose={onClose}
      initialPos={{ x: 340, y: 160 }}
      width={460}
      height={380}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
          <span>{note.split(/\s+/).filter(Boolean).length} words · {note.length} chars</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea
          value={note}
          onChange={handleChange}
          className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs leading-relaxed text-slate-200 placeholder-slate-600"
          placeholder="Jot down notes or ask SEN to summarize..."
        />
      </div>
    </WindowFrame>
  );
}

// 4. Timer / Pomodoro App
export function TimerApp({
  isOpen,
  onClose,
  initialMinutes = 25,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes?: number;
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Play web audio chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const setPreset = (m: number) => {
    setIsActive(false);
    setSecondsLeft(m * 60);
  };

  return (
    <WindowFrame
      id="timer"
      title="Focus Timer & Pomodoro"
      icon={<Clock className="w-3.5 h-3.5 text-cyan-400" />}
      isOpen={isOpen}
      onClose={onClose}
      initialPos={{ x: 260, y: 180 }}
      width={340}
      height={300}
    >
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl font-mono tabular-nums tracking-widest text-cyan-400 font-light py-2">
          {timeFormatted}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs transition-colors"
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(initialMinutes * 60);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setPreset(25)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            25m Pomodoro
          </button>
          <button
            onClick={() => setPreset(5)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            5m Break
          </button>
          <button
            onClick={() => setPreset(15)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            15m Long
          </button>
        </div>
      </div>
    </WindowFrame>
  );
}
