import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  Moon,
  Sun,
  Eye,
  Headphones,
  Speaker,
  Check,
  X,
} from 'lucide-react';

interface ControlsCategoryProps {
  accentColor: string;
  mainColor?: string;
}

export function ControlsCategory({ accentColor, mainColor = '#0a0a0c' }: ControlsCategoryProps) {
  const isLight = (() => {
    if (!mainColor || !mainColor.startsWith('#')) return false;
    const cleanHex = mainColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  })();

  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [nightLight, setNightLight] = useState(false);
  const [darkMode, setDarkMode] = useState(!isLight);
  const [audioSource, setAudioSource] = useState<'Speakers' | 'Headphones' | 'AirPods'>('Headphones');
  const [brightness, setBrightness] = useState(85);

  // Connection picker modal state for hold action
  const [pickerModal, setPickerModal] = useState<'wifi' | 'bluetooth' | null>(null);
  const [connectedWifi, setConnectedWifi] = useState('SEN-Ultra-Mesh-5G');
  const [connectedBt, setConnectedBt] = useState('AirPods Pro (Connected)');

  const wifiNetworks = [
    { name: 'SEN-Ultra-Mesh-5G', signal: 'Strong (1200 Mbps)', secure: true },
    { name: 'Home_Fiber_Gigabit', signal: 'Good (600 Mbps)', secure: true },
    { name: 'Office_Secure_Wi-Fi', signal: 'Fair (300 Mbps)', secure: true },
    { name: 'CoffeeShop_Guest_Free', signal: 'Weak (50 Mbps)', secure: false },
  ];

  const btDevices = [
    { name: 'AirPods Pro', type: 'Audio / Spatial', battery: '88%' },
    { name: 'Sony WH-1000XM5', type: 'Active Noise Canceling', battery: '74%' },
    { name: 'Logitech MX Master 3', type: 'Precision Mouse', battery: '92%' },
    { name: 'Samsung Galaxy Watch 6', type: 'Wearable Sync', battery: '45%' },
  ];

  const holdTimerRef = useRef<any>(null);

  const handleStartHold = (type: 'wifi' | 'bluetooth') => {
    holdTimerRef.current = setTimeout(() => {
      setPickerModal(type);
    }, 400); // Hold for 400ms opens list of connections
  };

  const handleEndHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const toggleNightLight = () => {
    const next = !nightLight;
    setNightLight(next);
    const filterEl = document.getElementById('night-light-filter');
    if (filterEl) {
      filterEl.style.opacity = next ? '0.22' : '0';
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`flex flex-col gap-3 py-1 text-xs select-none font-sans relative ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      {/* Fluid Pill Toggles Row - Apple / Samsung continuous pills */}
      <div className="flex items-center gap-2 w-full">
        {/* Wi-Fi Pill with hold-to-connect */}
        <button
          type="button"
          onClick={() => {
            if (!wifiEnabled) setWifiEnabled(true);
            else setPickerModal('wifi');
          }}
          onMouseDown={() => handleStartHold('wifi')}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={() => handleStartHold('wifi')}
          onTouchEnd={handleEndHold}
          className="flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 group relative"
          style={{
            backgroundColor: wifiEnabled
              ? isLight ? `${accentColor}33` : `${accentColor}28`
              : isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: wifiEnabled
              ? `inset 0 0 0 1px ${accentColor}aa`
              : isLight ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
          title="Click to toggle or hold to view Wi-Fi connections"
        >
          {wifiEnabled ? (
            <Wifi className="w-3.5 h-3.5 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
          ) : (
            <WifiOff className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-500'}`} />
          )}
          <span className={`text-xs font-semibold truncate ${
            wifiEnabled
              ? isLight ? 'text-slate-900 font-bold' : 'text-white'
              : isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Wi-Fi
          </span>
        </button>

        {/* Bluetooth Pill with hold-to-connect */}
        <button
          type="button"
          onClick={() => {
            if (!bluetoothEnabled) setBluetoothEnabled(true);
            else setPickerModal('bluetooth');
          }}
          onMouseDown={() => handleStartHold('bluetooth')}
          onMouseUp={handleEndHold}
          onMouseLeave={handleEndHold}
          onTouchStart={() => handleStartHold('bluetooth')}
          onTouchEnd={handleEndHold}
          className="flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 group relative"
          style={{
            backgroundColor: bluetoothEnabled
              ? isLight ? `${accentColor}33` : `${accentColor}28`
              : isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: bluetoothEnabled
              ? `inset 0 0 0 1px ${accentColor}aa`
              : isLight ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
          title="Click to toggle or hold to view Bluetooth devices"
        >
          <Bluetooth
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: bluetoothEnabled ? (isLight ? '#0f172a' : accentColor) : (isLight ? '#64748b' : '#64748b') }}
          />
          <span className={`text-xs font-semibold truncate ${
            bluetoothEnabled
              ? isLight ? 'text-slate-900 font-bold' : 'text-white'
              : isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Bluetooth
          </span>
        </button>

        {/* Night Light Pill */}
        <button
          type="button"
          onClick={toggleNightLight}
          className="flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            backgroundColor: nightLight
              ? isLight ? `${accentColor}33` : `${accentColor}28`
              : isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: nightLight
              ? `inset 0 0 0 1px ${accentColor}aa`
              : isLight ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          <Eye
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: nightLight ? (isLight ? '#0f172a' : accentColor) : (isLight ? '#64748b' : '#64748b') }}
          />
          <span className={`text-xs font-semibold truncate ${
            nightLight
              ? isLight ? 'text-slate-900 font-bold' : 'text-white'
              : isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Night
          </span>
        </button>

        {/* Dark Mode Pill */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            backgroundColor: darkMode
              ? isLight ? `${accentColor}33` : `${accentColor}28`
              : isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: darkMode
              ? `inset 0 0 0 1px ${accentColor}aa`
              : isLight ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          {darkMode ? (
            <Moon className="w-3.5 h-3.5 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
          ) : (
            <Sun className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-slate-400'}`} />
          )}
          <span className={`text-xs font-semibold truncate ${
            darkMode
              ? isLight ? 'text-slate-900 font-bold' : 'text-white'
              : isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {darkMode ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Audio Source Selector - Continuous Capsule Row */}
      <div className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        <div className={`flex items-center gap-2 ${isLight ? 'text-slate-900 font-bold' : 'text-slate-300 font-medium'}`}>
          <Volume2 className="w-3.5 h-3.5" style={{ color: isLight ? '#0f172a' : accentColor }} />
          <span className="text-xs">Output</span>
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-full border ${
          isLight ? 'bg-black/5 border-black/10' : 'bg-black/40 border-white/8'
        }`}>
          {(['Headphones', 'Speakers', 'AirPods'] as const).map((src) => {
            const isSelected = audioSource === src;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setAudioSource(src)}
                className={`py-1 px-3 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? isLight ? 'text-slate-900 font-bold' : 'text-white font-semibold'
                    : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: isLight ? `${accentColor}44` : `${accentColor}38`,
                        boxShadow: `inset 0 0 0 1px ${accentColor}aa`,
                      }
                    : {}
                }
              >
                {src === 'Speakers' ? (
                  <Speaker className="w-3 h-3 shrink-0" style={{ color: isSelected ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                ) : (
                  <Headphones className="w-3 h-3 shrink-0" style={{ color: isSelected ? (isLight ? '#0f172a' : accentColor) : undefined }} />
                )}
                <span>{src}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brightness Continuous Slider Row */}
      <div className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border ${
        isLight ? 'bg-black/5 border-black/10' : 'bg-white/4 border-white/8'
      }`}>
        <Sun className="w-4 h-4 shrink-0" style={{ color: isLight ? '#0f172a' : accentColor }} />
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBrightness(val);
              const overlay = document.getElementById('brightness-overlay');
              if (overlay) {
                overlay.style.opacity = `${(100 - val) * 0.007}`;
              }
            }}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer outline-none ${
              isLight ? 'bg-black/15' : 'bg-black/50'
            }`}
            style={{
              accentColor: accentColor,
            }}
          />
        </div>
        <span className={`text-xs font-mono tabular-nums w-9 text-right font-bold ${
          isLight ? 'text-slate-900' : 'text-slate-300'
        }`}>
          {brightness}%
        </span>
      </div>

      {/* WIFI / BLUETOOTH CONNECTION LIST MODAL (Opened on hold / click) */}
      <AnimatePresence>
        {pickerModal && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              backgroundColor: isLight ? '#ffffff' : `${mainColor}f8`,
              borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
            }}
            className={`absolute inset-0 z-20 backdrop-blur-2xl rounded-2xl p-3.5 border flex flex-col justify-between shadow-2xl ${
              isLight ? 'text-slate-900 shadow-slate-300/50' : 'text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-black/10' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-2">
                {pickerModal === 'wifi' ? (
                  <Wifi className="w-4 h-4" style={{ color: isLight ? '#0f172a' : accentColor }} />
                ) : (
                  <Bluetooth className="w-4 h-4" style={{ color: isLight ? '#0f172a' : accentColor }} />
                )}
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {pickerModal === 'wifi' ? 'Wi-Fi Networks' : 'Bluetooth Devices'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPickerModal(null)}
                className={`p-1 rounded-lg transition-colors ${
                  isLight ? 'bg-black/5 hover:bg-black/10 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-2 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {pickerModal === 'wifi' ? (
                wifiNetworks.map((net) => {
                  const isConnected = connectedWifi === net.name;
                  return (
                    <button
                      key={net.name}
                      type="button"
                      onClick={() => {
                        setConnectedWifi(net.name);
                        setWifiEnabled(true);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                        isConnected
                          ? isLight ? 'bg-black/8 border-black/20 text-slate-900 font-semibold' : 'bg-white/15 border-white/30 text-white shadow-xs'
                          : isLight ? 'bg-black/3 border-black/8 text-slate-800 hover:bg-black/6' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span>{net.name}</span>
                          {isConnected && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                              style={{ backgroundColor: `${accentColor}44`, color: isLight ? '#0f172a' : accentColor }}
                            >
                              Connected
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Signal: {net.signal}</div>
                      </div>
                      {isConnected ? (
                        <Check className="w-4 h-4" style={{ color: isLight ? '#0f172a' : accentColor }} />
                      ) : (
                        <span className="text-[10px] font-semibold hover:underline" style={{ color: accentColor }}>Connect</span>
                      )}
                    </button>
                  );
                })
              ) : (
                btDevices.map((dev) => {
                  const isConnected = connectedBt.includes(dev.name);
                  return (
                    <button
                      key={dev.name}
                      type="button"
                      onClick={() => setConnectedBt(`${dev.name} (Connected)`)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                        isConnected
                          ? isLight ? 'bg-black/8 border-black/20 text-slate-900 font-semibold' : 'bg-white/15 border-white/30 text-white shadow-xs'
                          : isLight ? 'bg-black/3 border-black/8 text-slate-800 hover:bg-black/6' : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span>{dev.name}</span>
                          {isConnected && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                              style={{ backgroundColor: `${accentColor}44`, color: isLight ? '#0f172a' : accentColor }}
                            >
                              Connected
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {dev.type} &bull; Battery: {dev.battery}
                        </div>
                      </div>
                      {isConnected ? (
                        <Check className="w-4 h-4" style={{ color: isLight ? '#0f172a' : accentColor }} />
                      ) : (
                        <span className="text-[10px] font-semibold hover:underline" style={{ color: accentColor }}>Pair</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className={`text-[10px] text-center pt-1 border-t font-mono ${
              isLight ? 'text-slate-600 border-black/10' : 'text-slate-400 border-white/8'
            }`}>
              {pickerModal === 'wifi' ? `Active Wi-Fi: ${connectedWifi}` : `Active Bluetooth: ${connectedBt}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
