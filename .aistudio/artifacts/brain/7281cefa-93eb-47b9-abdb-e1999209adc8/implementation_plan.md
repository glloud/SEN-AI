# SEN Desktop AI — Windows 11 Native Companion & Dynamic Lake Notch

A native Windows 11 desktop AI companion and Dynamic Lake overlay engineered to run directly on the user's PC. Blends invisibly into monitor hardware bezels when idle, expands with liquid physics and dynamic motion blur, and operates with full system tray control and instant Gemini 3.8 Flash intelligence.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during the interactive clarification phase:

- **Notch Bottom Corners**: Subtle engineered radius (8px to 10px precision chamfer) replacing large pill curvature for a precision hardware match against monitor bezels.
- **Closed State Visual Invisibility**: When closed, the notch is strictly True Pitch Black (`#000000`) with zero outer glow or accent coloring, completely matching the physical monitor bezels.
- **Dynamic Theme Reveal**: When expanded, the notch smoothly reveals the user's selected theme accent color, category tabs, and inner specular refraction. On collapse, the theme color smoothly fades back into pitch black.
- **Animation & Motion Blur Profile**: Combination of Apple-grade liquid spring physics (`cubic-bezier(0.16, 1, 0.3, 1)` / low-mass spring), dynamic state-transition motion blur filter (`filter: blur(1.5px)` during expansion/collapse settling to `blur(0px)`), and GPU-accelerated composited fading.
- **AI Responsiveness & Reliability**: Gemini 3.8 Flash model execution (`gemini-3.8-flash`) with function-calling fallbacks and local conversational intelligence so questions and wake words never go unanswered even on offline or unconfigured PCs.
- **Windows 11 Packaging**: Standalone One-Click NSIS Setup Executable (`.exe`) with auto-start on Windows boot, transparent screen-saver overlay level, and settings embedded in the Windows System Tray (taskbar overflow arrow).

---

### 1. Overview & Core Concept

- **What It Does**: SEN runs as a persistent, ultra-lightweight desktop overlay and companion at the top-center of any Windows 11 screen. It provides instant AI intelligence, calendar scheduling, app launching, audio control, clipboard history, and hardware telemetry.
- **Target Audience**: Windows 11 power users, developers, and creatives looking for a minimalist, Apple Dynamic Island / Hitodama companion that feels like an integrated operating system feature rather than an intrusive web browser window.
- **Key Value**: Zero distraction when idle (pure black, zero glow, sharp 8–10px hardware chamfer), instant liquid access via click or hotkey (`Ctrl+Shift+Space`) or voice ("Hey Sen"), and full desktop integration without requiring server infrastructure or Node.js pre-installation.

---

### 2. User Experience & Visual Design

#### A. Idle Notch (Monitor Bezel Hardware Match)
- **Geometry**: Compact $180\text{px} \times 32\text{px}$ bar anchored flush to the top-center of the screen. Bottom corners radiused at exactly $9\text{px}$ (subtle engineered chamfer).
- **Surface**: Pure Pitch Black (`#000000`).
- **Borders & Shadows**: Strict zero outer glow. Hairline dark boundary (`rgba(255, 255, 255, 0.07)` or `#141414`) with a compact directional drop shadow (`0 2px 6px rgba(0,0,0,0.85)`).
- **Indicators**: Hardware aperture camera dot + acoustic wake sensor dot that pulses only upon voice detection or active audio playback.

#### B. Dynamic Liquid Expansion & Collapse
- **Transition Dynamics**: Mass-damped spring curve (`stiffness: 240, damping: 26, mass: 0.7`) with subtle motion blur (`filter: blur(1.5px)` during the 180ms transit phase, settling cleanly to `blur(0px)`).
- **Theme Color Reveal**: As the notch expands to its $640\text{px}$ workspace card, the user's customized theme palette smoothly cross-fades into view:
  - Surface transforms from `#000000` to the user's custom `mainColor` with backdrop glass blur.
  - Active category tab indicators and specular top light lines light up with `accentColor`.
  - On collapse, the theme color fades back into true black `#000000` within 140ms.

#### C. System Tray & Hidden Settings
- **Taskbar Flyout**: Resident in the Windows 11 system tray (notification area arrow next to the clock).
- **Right-Click Menu**: Quick access to "Open SEN AI", "Toggle Always-On-Top", "Run on Windows Startup", "Custom Theme & Fonts", and "Quit SEN".
- **Plug-and-Play Setup**: Double-clicking the generated `.exe` installer installs SEN to `%LOCALAPPDATA%\Programs\sen-ai-desktop`, creates a desktop shortcut, registers auto-start, and immediately launches the overlay.

---

### 3. Key Technical Decisions & Trade-Offs

- **Model Selection & Routing (`gemini-3.8-flash`)**:
  - *Chosen Approach*: Exclusively use `@google/genai` with model `gemini-3.8-flash` across all text, coding, calendar, and general assistant requests.
  - *Why*: Eliminates deprecated `gemini-2.5-flash` 404 errors and provides fast latency under 600ms.
  - *Fallback Strategy*: If a user runs the `.exe` without an active Gemini API key, SEN automatically falls back to an embedded desktop command processor (handling system apps, timers, world clocks, calendar creation, and conversational guidelines) rather than throwing a silent or broken network error.
- **In-Process Backend Server Execution for Electron**:
  - *Chosen Approach*: Electron main process runs Express directly in-process via Node runtime (`require('./server.js')`) with child process spawn fallback.
  - *Why*: Allows the `.exe` to run out-of-the-box on ANY Windows 11 computer without requiring Node.js, `npm`, or `npx` to be installed on the client's PC.
- **Hardware-Accelerated Composited Motion**:
  - *Chosen Approach*: Animate `transform`, `opacity`, and CSS `filter: blur(...)` using Framer Motion with `layout` transitions and `will-change: transform`.
  - *Why*: Prevents layout stuttering or CPU spikes during desktop usage.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Windows 11 Desktop                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     SEN Dynamic Lake Notch (Top Bezel Screen Saver)   │  │
│  │   - Closed: 180x32px, #000000, 9px sharp corners      │  │
│  │   - Open: 640px Liquid Glass, Theme Colors revealed   │  │
│  │   - Motion Blur: State-transition filter blur         │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ User Input / Voice Wake       │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Frontend React Orchestrator                │  │
│  │   - App.tsx (State, Messages, Speech Recognition)     │  │
│  │   - DynamicLakeNotch.tsx (Liquid layout, categories)  │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ HTTP POST /api/gemini/assist   │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Local Express Backend (server.ts)            │  │
│  │   - Gemini 3.8 Flash SDK (@google/genai)              │  │
│  │   - Function Tools (Calendar, Apps, Timers)           │  │
│  │   - Offline Desktop Intelligent Fallback Engine       │  │
│  │   - Hardware Telemetry & Diagnostics (/api/system)    │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ Embedded in Electron          │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Electron Host (electron-main.cjs)           │  │
│  │   - Transparent Screen-Saver Level BrowserWindow      │  │
│  │   - Windows System Tray Menu (Taskbar Overflow)       │  │
│  │   - Global Hotkey: Ctrl+Shift+Space                   │  │
│  │   - NSIS One-Click Plug-and-Play Installer Config     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### State & Interaction Mapping

| Component | Trigger | Action & State Transition |
| :--- | :--- | :--- |
| **Idle Notch** | Mouse Click or "Hey Sen" | Triggers liquid expand, applies dynamic 1.5px motion blur, shifts surface from `#000000` to theme color, reveals categories. |
| **Notch Form** | Text Submit or Voice Speech | Dispatches prompt to `/api/gemini/assist`; shows pulsing thinking indicator; appends AI answer and executes any function call (calendar, timer, app). |
| **Notch Outside** | Click Outside or `Escape` | Initiates collapse spring; fades theme color back to `#000000`; sets corners to 9px chamfer. |
| **System Tray** | Click or Right Click | Shows tray menu in Windows notification area: open notch, toggle overlay, autostart on boot, or quit. |
| **AI Backend** | Missing API Key or Network Loss | Returns conversational desktop response with executable local actions instead of failing silently. |

---

### 5. Implementation Steps (Execution Phase)

1. **Refine DynamicLakeNotch Geometry & Theme Mechanics**:
   - Update notch bottom radius: exact $9\text{px}$ chamfer when closed, $18\text{px}$ when open.
   - Closed state styling: strictly `#000000` background, no accent glow, dark bezel border.
   - Open state styling: smoothly animates in `mainColor`, `accentColor` specular light, and border.
   - Smooth liquid transition with dynamic motion blur during transit.
2. **Harden AI Assistant Engine (`server.ts` & `App.tsx`)**:
   - Ensure all model calls use `gemini-3.8-flash`.
   - Prevent empty assistant messages when tool calls or function calls are returned.
   - Add robust local fallback responses so queries never fail or show empty bubbles.
3. **Windows 11 Packaging & Standalone Desktop Config**:
   - Verify `electron-main.cjs` and `package.json` NSIS build configuration for seamless one-click installer creation.
   - Ensure system tray icon and autostart registry work out of the box.
4. **Compile & Lint Verification**:
   - Run `lint_applet` and `compile_applet` to confirm clean zero-error compilation.
