# Implementation Plan — SEN Desktop AI Assistant: Dynamic Notch, Music Engine & First-Time Welcome Setup

Fixing click unresponsiveness and active media detection in the Dynamic Lake Notch, enhancing Gemini AI responsiveness, implementing a 480x480 square first-time Welcome Setup wizard, chamfering notch corners, setting default font to Alata with zero emojis for a truly minimalistic aesthetic, and writing comprehensive Windows 11 setup documentation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and feedback:

- **Minimalistic Aesthetic & Typography**: Default font set to `Alata` (soft font). Completely clean interface with ZERO emojis anywhere in text, buttons, HUDs, or assistant outputs.
- **First-Time Welcome Modal**: Floating 480x480 square glass card with a 3-step wizard (Location & Time -> Theme Colors -> Font Typography). Displayed once on initial setup and persisted to `localStorage`.
- **Active Music Media Engine**: Native Web `navigator.mediaSession` synchronization combined with Spotify / YouTube Music player detection, active album artwork display, title/artist info, track scrubber, fluid audio visualizer, and media controls.
- **Windows 11 Setup Guide**: Comprehensive `README_SETUP.md` in project root plus a 1-click text file download button inside SEN Desktop Settings.

---

## 1. Overview & Core Concept

**SEN AI Desktop** is a Windows 11 floating overlay application anchored at the top-center of the screen as a sleek Dynamic Lake Notch, accompanied by a taskbar system tray settings flyout.

This update resolves mouse unresponsiveness, adds real-time media session detection with album artwork and clean flowy audio visualizers, ensures Gemini AI backend responses are fully functional, chamfers notch corners with precision geometry (`rounded-b-[12px]`), enforces Alata soft typography with no emojis, and introduces a square multi-step First-Time Welcome Setup wizard.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Time Welcome Setup Wizard**:
   - On initial launch (or when `sen_welcome_completed` is missing), a floating 480x480 square liquid glass card appears in the center of the screen.
   - **Step 1 (Location & Time)**: Configure city location (manual entry or 1-click GPS auto-detect) and local time formatting.
   - **Step 2 (Theme Customization)**: Select main glass background color and accent glow color, or choose a dark/OLED preset.
   - **Step 3 (Typography & Font)**: Select Alata or soft desktop fonts.
   - **Completion**: Saves preferences, sets `sen_welcome_completed = 'true'`, and smoothly fades into active desktop mode. Never appears again unless reset in settings or reinstalled.

2. **Dynamic Lake Notch Interaction & Media Player**:
   - Idle notch sits anchored at top center with chamfered corners (`rounded-b-[12px]`) and true pitch-black hardware finish (`#000000`).
   - Responds to mouse click or global hotkey `Ctrl+Shift+Space`.
   - **Media HUD**: When audio plays (via browser media session or music engine toggle), displays high-res album cover art, song title, artist name, time scrubber, fluid multi-bar visualizer, and playback controls (Play/Pause, Skip Back/Forward).

3. **Working SEN AI Assistant**:
   - User types or speaks query ("Ask Sen...").
   - Transmits query to `/api/gemini/assist` running `@google/genai` with `gemini-3.8-flash`.
   - Displays real-time assistant response, calendar scheduler actions, app launcher triggers, or system commands (strictly text/clean icons, no emojis).

---

## 3. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SEN AI DESKTOP APP                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │             First-Time Welcome Wizard (480x480 Square)              │   │
│   │   [Step 1: GPS/City] ──► [Step 2: Theme Color] ──► [Step 3: Font]  │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ (Saved to localStorage)              │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     Dynamic Lake Notch Header                       │   │
│   │  - Chamfered Bezel Corners (rounded-b-[12px])                       │   │
│   │  - Mouse Enter / Click Capture (setIgnoreMouseEvents)               │   │
│   │  - Web MediaSession API + Music HUD (Album Art, Visualizer, Controls)│   │
│   │  - AI Chat Input ──► POST /api/gemini/assist (@google/genai)        │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                  Windows System Tray & Settings                     │   │
│   │  - Dual Monitor, Startup Script Download, App Linker, Reset Setup   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component & File Mapping

1. **`src/components/WelcomeSetupModal.tsx`** *(New)*:
   - Floating 480x480 square glass card (`w-[480px] h-[480px]`).
   - Multi-step wizard state machine (Location -> Theme -> Typography with Alata default).
   - "Finish Setup" button sets `localStorage.setItem('sen_welcome_completed', 'true')`.

2. **`src/components/DynamicLakeNotch.tsx`**:
   - Precision chamfered bottom corners (`rounded-b-[12px]`).
   - Native `navigator.mediaSession` listener to dynamically extract current track metadata (`title`, `artist`, `artwork` image URL) and playback state (`playing`, `paused`).
   - Fluid SVG audio visualizer with multi-bar organic sine wave motion.
   - Zero emojis in labels, status messages, or controls.

3. **`src/App.tsx`**:
   - Manages welcome modal visibility (`showWelcomeModal`).
   - Sets initial font default to `Alata`.
   - Electron overlay click-through routing for welcome modal, notch, and settings flyout.

4. **`server.ts`**:
   - Ensures `/api/gemini/assist` route initializes `GoogleGenAI` with `process.env.GEMINI_API_KEY` or fallback mock assistant if offline, with instructions to avoid emojis in AI responses.

5. **`README_SETUP.md`** *(New)*:
   - Detailed Windows 11 installation and configuration instructions file.

---

## 4. Key Product Decisions & Trade-Offs

- **Alata Soft Typography & Zero Emojis**: Employs Google Font `Alata` as default for a soft, ultra-minimalistic aesthetic with zero emoji distractions.
- **Web Media Session API + Player Engine**: Combines native `navigator.mediaSession` hooks with preset streams (Spotify & YouTube Music) so album cover artwork, track titles, and active playback controls work seamlessly.
- **Square 480x480 Welcome Wizard**: Keeps first-time onboarding compact, centered, and visually focused without obscuring the desktop environment.
- **Chamfered Bezel Geometry**: Precision 12px chamfered radiuses (`rounded-b-[12px]`) matching hardware display notches.
