# SEN AI Desktop - Complete Windows 11 Installation & Troubleshooting Guide

Welcome to **SEN AI Desktop**, a minimalist Dynamic Island-inspired desktop companion powered by Google Gemini 3.8 Flash AI and designed for Windows 10/11.

---

## 1. System Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **Node.js Environment**: Node.js v18.0.0 or higher
- **Browser/Runtime**: Chrome / Edge / Electron Desktop Client

---

## 2. Installation & Quick Start

### Step 1: Install Dependencies
Open a Command Prompt or PowerShell in the project directory and run:
```bash
npm install
```

### Step 2: Running in Web Preview Mode
To start the local web development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Step 3: Running as Native Windows 11 Floating Desktop Notch
To launch SEN as a frameless, transparent, click-through floating overlay at the top of your Windows desktop:
```bash
npm run electron
```

---

## 3. Resolving the "Unspecified Error" (.LNK Shortcut Fix)

If double-clicking the generated Windows shortcut (`SEN AI Desktop.lnk`) displays an error popup stating **"Unspecified error"**:

1. Open Windows File Explorer and navigate to your Start Menu Programs folder:
   `C:\Users\<YourUsername>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs`
2. Delete the broken shortcut file named **`SEN AI Desktop.lnk`**.
3. Create a fresh desktop shortcut pointing directly to your installation:
   - Target: `node_modules\electron\dist\electron.exe`
   - Arguments: `electron-main.cjs`
   - Start in: `<Your Project Folder>`
4. Alternatively, use the 1-Click Startup installer in the Settings menu (System -> Startup).

---

## 4. Key Features & Controls

- **Interactive Dynamic Notch**: Chamfered bottom corners (`rounded-b-[12px]`) with pitch-black unfolded styling.
- **First-Time Welcome Wizard**: 480x480 square glass card presented once upon setup (Location -> Theme -> Typography with `Alata` default).
- **Active Music Session Sync**: Automatically detects live media title, artist, album cover art, and playback controls with a smooth SVG sine-wave audio visualizer.
- **Global Keyboard Shortcut**: Press `Ctrl + Shift + Space` anywhere in Windows to expand/collapse the notch.
- **Voice Wake**: Say *"Hey Sen"* to activate the notch hands-free.
- **Click-Through Transparency**: Cursor clicks pass directly through empty transparent desktop areas to underlying Windows applications.

---

## 5. Troubleshooting & Support

- **API Key Configuration**: Enter your custom Gemini API key in Settings -> System -> API Key.
- **Startup Script**: Download `install-startup-windows.bat` directly from the Settings flyout.
