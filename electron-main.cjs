// SEN Desktop AI - Native Windows Transparent Desktop & Tray Overlay Launcher
const { app, BrowserWindow, screen, globalShortcut, Tray, Menu, nativeImage, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Global Error Catcher - Prevents silent crashes that trigger Windows "Unspecified error"
process.on('uncaughtException', (err) => {
  console.error('[SEN Main] Uncaught Exception:', err);
  try {
    const logPath = path.join(app.getPath('userData') || '.', 'sen-crash.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${err.stack || err}\n`);
  } catch (_) {}
});

process.on('unhandledRejection', (reason) => {
  console.error('[SEN Main] Unhandled Rejection:', reason);
});

// Single Instance Lock: Ensure only one instance of SEN runs at a time on Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let tray = null;
let activePort = 3000;

// Start bundled backend server safely in-process
async function initBackendServer() {
  try {
    const serverScript = path.join(__dirname, 'server.js');
    if (fs.existsSync(serverScript)) {
      const serverModule = require(serverScript);
      if (typeof serverModule.startServer === 'function') {
        activePort = await serverModule.startServer(3000);
      }
      console.log(`[SEN Main] Backend server running on port ${activePort}`);
    } else {
      console.warn('[SEN Main] server.js not found in directory, using direct file load fallback');
    }
  } catch (err) {
    console.error('[SEN Main] Backend server initialization warning:', err.message);
  }
}

// Generate guaranteed 16x16 RGBA icon buffer for Windows System Tray
function createFallbackTrayIcon() {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - 7.5;
      const dy = y - 7.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 7) {
        // Cyan glow circle (#06b6d4)
        buffer[idx] = 6;       // R
        buffer[idx + 1] = 182; // G
        buffer[idx + 2] = 212; // B
        buffer[idx + 3] = 255; // A
      } else {
        buffer[idx + 3] = 0;   // Transparent
      }
    }
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

// Safe tray icon loader that NEVER throws
function getTrayIcon() {
  const possiblePaths = [
    path.join(__dirname, 'dist', 'favicon.ico'),
    path.join(__dirname, 'public', 'favicon.ico'),
    path.join(__dirname, 'public', 'assets', 'aistudio', 'image_6bad7b3d.png'),
    path.join(process.resourcesPath || '', 'public', 'favicon.ico'),
  ];

  for (const iconPath of possiblePaths) {
    try {
      if (fs.existsSync(iconPath)) {
        const img = nativeImage.createFromPath(iconPath);
        if (!img.isEmpty()) {
          return img.resize({ width: 16, height: 16 });
        }
      }
    } catch (_) {}
  }

  return createFallbackTrayIcon();
}

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,            // Borderless floating notch overlay
    transparent: true,      // Transparent desktop canvas
    backgroundColor: '#00000000',
    alwaysOnTop: true,      // Floats above full-screen apps and desktop
    skipTaskbar: false,     // Accessible from taskbar & hidden tray icons
    hasShadow: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
    },
  });

  // Enable click-through by default so user can immediately click their Windows desktop!
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Windows 11 Always-On-Top
  try {
    mainWindow.setAlwaysOnTop(true);
    if (process.platform === 'darwin') {
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
  } catch (err) {
    console.warn('[SEN Main] setAlwaysOnTop warning:', err);
  }

  // Primary URL load with auto-fallback to local static file
  const localUrl = `http://127.0.0.1:${activePort}`;
  const localDistHtml = path.join(__dirname, 'dist', 'index.html');

  const loadUi = () => {
    mainWindow.loadURL(localUrl).catch((err) => {
      console.warn(`[SEN Main] Could not load ${localUrl}, falling back to static file:`, err.message);
      if (fs.existsSync(localDistHtml)) {
        mainWindow.loadFile(localDistHtml);
      } else {
        setTimeout(loadUi, 1000);
      }
    });
  };

  // Give in-process server 300ms to mount, then load
  setTimeout(loadUi, 300);

  // Global hotkey to open/focus SEN Notch
  try {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      if (mainWindow) {
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.warn('[SEN Main] Could not register global shortcut:', err);
  }

  // Windows Startup Registration (Safe with try/catch)
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
    });
  } catch (err) {
    console.warn('[SEN Main] Auto-start registration skipped:', err);
  }

  createSystemTray();
}

function createSystemTray() {
  if (tray) return;

  try {
    const icon = getTrayIcon();
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open SEN AI Notch (Ctrl+Shift+Space)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'SEN Preferences & Customization',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('open-sen-settings');
          }
        },
      },
      {
        label: 'Toggle Always-On-Top',
        type: 'checkbox',
        checked: true,
        click: (item) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(item.checked);
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Launch on Windows Startup',
        type: 'checkbox',
        checked: true,
        click: (item) => {
          try {
            app.setLoginItemSettings({
              openAtLogin: item.checked,
              path: process.execPath,
            });
          } catch (_) {}
        },
      },
      { type: 'separator' },
      {
        label: 'Quit SEN Desktop',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('SEN AI Desktop - Windows 11 Dynamic Notch Assistant');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {
    console.error('[SEN Main] System tray creation error:', err);
  }
}

// IPC Handlers for frontend communication
ipcMain.on('toggle-overlay', () => {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
});

ipcMain.on('set-always-on-top', (_event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(Boolean(flag));
  }
});

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    if (ignore) {
      win.setIgnoreMouseEvents(true, options || { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  }
});

// Second instance triggered: focus the existing window
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  await initBackendServer();
  createOverlayWindow();
});

app.on('window-all-closed', () => {
  // On Windows, keep running in system tray unless user explicitly chooses Quit
  if (app.isQuitting || process.platform !== 'darwin') {
    // If user clicked close or quit
    if (app.isQuitting) {
      app.quit();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow();
  }
});
