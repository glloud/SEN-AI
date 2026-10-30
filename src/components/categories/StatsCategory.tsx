import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  HardDrive,
  Wifi,
  ArrowDown,
  ArrowUp,
  Clock,
  Zap,
  Layers,
  XCircle,
} from 'lucide-react';

interface StatsCategoryProps {
  accentColor: string;
  mainColor?: string;
}

interface ProcessItem {
  id: string;
  name: string;
  ramGb: number;
  cpuPercent: number;
  icon: string;
}

export function StatsCategory({ accentColor, mainColor = '#0a0a0c' }: StatsCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  // Live dynamic telemetry
  const [cpuLoad, setCpuLoad] = useState(28);
  const [cpuTemp, setCpuTemp] = useState(44);

  const [ramUsedGb, setRamUsedGb] = useState(14.4);
  const ramTotalGb = 32.0;

  const [gpuLoad, setGpuLoad] = useState(36);
  const [gpuTemp, setGpuTemp] = useState(48);

  const [downSpeed, setDownSpeed] = useState(18.5);
  const [upSpeed, setUpSpeed] = useState(4.2);
  const [ping, setPing] = useState(12);

  const [uptimeSeconds, setUptimeSeconds] = useState(18420);

  // Drives data
  const driveCUsed = 428;
  const driveCTotal = 1000;
  const driveDUsed = 1240;
  const driveDTotal = 2000;

  // Active processes
  const [processes, setProcesses] = useState<ProcessItem[]>([
    { id: 'p1', name: 'Google Chrome', ramGb: 4.8, cpuPercent: 8.2, icon: '🌐' },
    { id: 'p2', name: 'VS Code', ramGb: 3.2, cpuPercent: 5.4, icon: '⚡' },
    { id: 'p3', name: 'Discord', ramGb: 1.6, cpuPercent: 2.1, icon: '💬' },
    { id: 'p4', name: 'Spotify Music', ramGb: 0.9, cpuPercent: 1.2, icon: '🎵' },
  ]);

  // Live telemetry update loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad((c) => Math.min(95, Math.max(12, c + (Math.floor(Math.random() * 9) - 4))));
      setCpuTemp((t) => Math.min(82, Math.max(38, t + (Math.floor(Math.random() * 3) - 1))));

      setGpuLoad((g) => Math.min(98, Math.max(8, g + (Math.floor(Math.random() * 9) - 4))));
      setGpuTemp((t) => Math.min(80, Math.max(40, t + (Math.floor(Math.random() * 3) - 1))));

      setDownSpeed((d) => Math.max(1.2, +(d + (Math.random() * 3 - 1.5)).toFixed(1)));
      setUpSpeed((u) => Math.max(0.4, +(u + (Math.random() * 1.2 - 0.6)).toFixed(1)));
      setPing((p) => Math.min(45, Math.max(8, p + (Math.floor(Math.random() * 3) - 1))));

      setUptimeSeconds((s) => s + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const ramPercent = Math.round((ramUsedGb / ramTotalGb) * 100);

  const formatUptime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const handleEndProcess = (id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  // Slightly Enlarged Circular Gauge (`size={56}`)
  const CircularGauge = ({
    value,
    label,
    subLabel,
    icon: Icon,
    size = 56,
  }: {
    value: number;
    label: string;
    subLabel: string;
    icon: any;
    size?: number;
  }) => {
    const stroke = 4.5;
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div
        className={`flex items-center gap-3 p-2.5 rounded-2xl border flex-1 min-w-0 ${
          isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
        }`}
      >
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={stroke}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={accentColor}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`font-mono text-xs font-bold tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {value}%
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
            <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{label}</span>
          </div>
          <div className={`text-[10px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{subLabel}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col gap-2 py-0.5 text-xs select-none font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* 1. TOP ROW: Slightly Enlarged Gauges (CPU, RAM, GPU) */}
      <div className="grid grid-cols-3 gap-2">
        <CircularGauge
          value={cpuLoad}
          label="CPU Core"
          subLabel={`i9-13900K · ${cpuTemp}°C`}
          icon={Cpu}
        />
        <CircularGauge
          value={ramPercent}
          label="RAM DDR5"
          subLabel={`${ramUsedGb.toFixed(1)} / ${ramTotalGb} GB`}
          icon={Database}
        />
        <CircularGauge
          value={gpuLoad}
          label="GPU RTX 4080"
          subLabel={`VRAM · ${gpuTemp}°C`}
          icon={Zap}
        />
      </div>

      {/* 2. MIDDLE ROW: Dual NVMe Storage + Live Network & Uptime */}
      <div className="grid grid-cols-2 gap-2">
        {/* Storage Strip */}
        <div className={`p-2 px-3 rounded-2xl border space-y-1.5 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'}`}>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>NVMe Drives</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Gen4 SSDs</span>
          </div>

          <div className="space-y-1">
            <div>
              <div className="flex justify-between text-[9px] mb-0.5 font-mono">
                <span>Disk C:</span>
                <span>{driveCUsed} / {driveCTotal} GB</span>
              </div>
              <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                <div style={{ width: `${(driveCUsed / driveCTotal) * 100}%`, backgroundColor: accentColor }} className="h-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] mb-0.5 font-mono">
                <span>Disk D:</span>
                <span>{driveDUsed} / {driveDTotal} GB</span>
              </div>
              <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                <div style={{ width: `${(driveDUsed / driveDTotal) * 100}%`, backgroundColor: accentColor }} className="h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Network & Uptime Strip */}
        <div className={`p-2 px-3 rounded-2xl border flex flex-col justify-between ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'}`}>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Network &amp; Status</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">{ping} ms</span>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-white/8">
            <div className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3" style={{ color: accentColor }} />
              <span>{downSpeed} MB/s</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" style={{ color: accentColor }} />
              <span>{upSpeed} MB/s</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatUptime(uptimeSeconds)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Active Processes (Zero-Scroll Compact View) */}
      <div className={`p-2 px-3 rounded-2xl border space-y-1 ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'}`}>
        <div className="flex items-center justify-between text-xs pb-1 border-b border-white/8">
          <div className="flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
            <span className={isLight ? 'text-slate-900' : 'text-white'}>Active Processes</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Total Used: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{ramUsedGb.toFixed(1)} GB RAM</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {processes.map((proc) => (
            <div
              key={proc.id}
              className={`flex items-center justify-between p-1.5 px-2 rounded-xl border text-[11px] ${
                isLight ? 'bg-white/40 border-black/8' : 'bg-white/4 border-white/8'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">{proc.icon}</span>
                <span className={`font-medium truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{proc.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[9px] text-slate-400">
                  {proc.ramGb}GB · {proc.cpuPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => handleEndProcess(proc.id)}
                  className="p-0.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="End Task"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


