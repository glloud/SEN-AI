# Implementation Plan - Packaging SEN Desktop into Windows .exe & .msi Installers

Configure SEN Desktop into a native Windows application packaged as both a `.msi` setup installer and a single executable `.exe` installer using **Electron** and **`electron-builder`**, with native system tray support and automatic Windows startup capability.

---

## Proposed Changes

### 1. Electron Integration Setup
- Create `electron/main.cjs` for Electron's main process:
  - Spawns the SEN Desktop server / loads compiled `dist` files.
  - Creates a frameless/styled window for the desktop bar and dynamic notch.
  - Configures native Windows System Tray icon with right-click menu (Open, Minimize to Tray, Startup Toggle, Quit).
  - Handles auto-launch on Windows login using `electron-auto-launch` / registry hooks.
- Create `electron/preload.cjs` to securely bridge IPC communications between the React frontend and Electron.

### 2. Packaging & Build Configuration
- Update `package.json`:
  - Add `electron` and `electron-builder` configuration targets: `nsis` (for `.exe` installer) and `msi` (for Windows `.msi` setup package).
  - Configure icon resources, desktop shortcuts, start menu integration, and silent install options.
  - Add npm scripts: `npm run build:electron` and `npm run dist:win`.

### 3. Step-by-Step Step Detailed Guide (`WINDOWS_PACKAGING_GUIDE.md`)
- Create a complete guide covering:
  1. Local environment setup (Node.js, WiX Toolset requirements for `.msi`).
  2. One-command build instructions (`npm run dist:win`).
  3. Output location (`dist-electron/SEN-Desktop-Setup.exe` and `dist-electron/SEN-Desktop-Setup.msi`).
  4. Code signing overview, auto-updater setup, and common troubleshooting tips.

---

## Verification Plan

### Automated Tests & Linting
- Run `npm run lint` and `compile_applet` to ensure syntax cleanliness across all configuration files.
- Verify Electron script syntax and package JSON schema validity.

### Manual Verification
- Review generated `WINDOWS_PACKAGING_GUIDE.md` to confirm all steps are actionable and tested for Windows 10/11 environments.
