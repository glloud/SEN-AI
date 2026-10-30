// SEN Desktop AI - Native Windows Transparent Desktop & Tray Overlay Launcher
const { app, BrowserWindow, screen, globalShortcut, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;

// Automatically start the Express backend server in the background
function startLocalServer() {
  try {
    const serverScript = path.join(__dirname, 'server.js');
    // Run compiled server using node
    serverProcess = spawn(process.execPath.includes('electron') ? process.execPath : 'node', [serverScript], {
      cwd: __dirname,
      env: { ...process.env, PORT: '3000', NODE_ENV: 'production' }
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });
  } catch (err) {
    console.error('Failed to start background server:', err);
  }
}

function createOverlayWindow() {
  // Start backend server before loading UI
  startLocalServer();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false, // Frameless transparent overlay
    transparent: true,
    alwaysOnTop: true, // Float on top of Windows desktop and open applications
    skipTaskbar: false, // Accessible from taskbar and system tray
    hasShadow: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
    },
  });

  // Ensure window floats above standard windows (Screen Saver level overlay)
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Wait 1.5 seconds for server to spin up, then load URL
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1500);

  // Global hotkey to show/focus SEN AI
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Auto-launch with Windows PC boot
  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
  });

  createSystemTray();
}

// Create native Windows System Tray Icon in Taskbar (Hidden Icons area next to clock)
function createSystemTray() {
  if (tray) return;

  const iconPath = path.join(__dirname, 'public', 'assets', 'aistudio', 'image_6bad7b3d.png');
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    tray = new Tray(path.join(__dirname, 'public', 'favicon.ico'));
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open SEN AI Notch & Tray',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Toggle Always-On-Top Overlay',
      type: 'checkbox',
      checked: true,
      click: (item) => {
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(item.checked, 'screen-saver');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Launch on Windows Startup',
      type: 'checkbox',
      checked: true,
      click: (item) => {
        app.setLoginItemSettings({
          openAtLogin: item.checked,
          path: process.execPath,
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit SEN Desktop',
      click: () => {
        if (serverProcess) serverProcess.kill();
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('SEN AI Desktop Assistant (Taskbar Overlay)');
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
}

app.whenReady().then(createOverlayWindow);

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) serverProcess.kill();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow();
  }
});
