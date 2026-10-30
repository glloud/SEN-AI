import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';

dotenv.config();

let currentDirname: string;
try {
  if (typeof __dirname !== 'undefined' && __dirname) {
    currentDirname = __dirname;
  } else if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
    currentDirname = path.dirname(fileURLToPath(import.meta.url));
  } else {
    currentDirname = process.cwd();
  }
} catch {
  currentDirname = process.cwd();
}

const app = express();
const defaultPort = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client (supports per-request or global API key)
function getAiClient(customKey?: string): GoogleGenAI {
  const key = customKey?.trim() || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Global instance for fallback
const ai = getAiClient();

// Helper to determine model based on user prompt & requested mode
function determineModelAndRoute(prompt: string, requestedModel: string = 'gemini'): {
  model: string;
  displayModel: string;
  category: 'system' | 'writing' | 'coding' | 'general' | 'planning';
  reason: string;
} {
  const p = prompt.toLowerCase();

  // Coding tasks
  if (
    p.includes('code') ||
    p.includes('function') ||
    p.includes('bug') ||
    p.includes('regex') ||
    p.includes('python') ||
    p.includes('javascript') ||
    p.includes('typescript') ||
    p.includes('html') ||
    p.includes('sql') ||
    p.includes('css')
  ) {
    return {
      model: 'gemini-3.8-flash',
      displayModel: 'Google Gemini 3.8 Flash',
      category: 'coding',
      reason: 'Deep reasoning model for desktop code analysis',
    };
  }

  // Calendar / Planning
  if (
    p.includes('schedule') ||
    p.includes('calendar') ||
    p.includes('meeting') ||
    p.includes('agenda') ||
    p.includes('plan') ||
    p.includes('appointment') ||
    p.includes('event')
  ) {
    return {
      model: 'gemini-3.8-flash',
      displayModel: 'Google Gemini 3.8 Flash',
      category: 'planning',
      reason: 'Structured calendar and agenda synthesis',
    };
  }

  // Writing & Summarization
  if (
    p.includes('summar') ||
    p.includes('rewrite') ||
    p.includes('essay') ||
    p.includes('article') ||
    p.includes('draft') ||
    p.includes('tone') ||
    p.includes('bullet') ||
    p.includes('email') ||
    p.includes('proofread')
  ) {
    return {
      model: 'gemini-3.8-flash',
      displayModel: 'Google Gemini 3.8 Flash',
      category: 'writing',
      reason: 'Nuanced linguistic flow, coherence, and depth',
    };
  }

  return {
    model: 'gemini-3.8-flash',
    displayModel: 'Google Gemini 3.8 Flash',
    category: 'general',
    reason: 'Primary ultra-fast Google Gemini 3.8 Flash model',
  };
}

// Function Declarations for Gemini Tool Calling
const createCalendarEventDecl: FunctionDeclaration = {
  name: 'createCalendarEvent',
  description: 'Creates a scheduled calendar event on Google Calendar and local interactive agenda.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Title of the event or meeting',
      },
      date: {
        type: Type.STRING,
        description: 'ISO date YYYY-MM-DD or descriptive date',
      },
      startTime: {
        type: Type.STRING,
        description: 'Start time e.g. 14:00 or 2:00 PM',
      },
      endTime: {
        type: Type.STRING,
        description: 'End time e.g. 15:00 or 3:00 PM',
      },
      description: {
        type: Type.STRING,
        description: 'Meeting notes, agenda, or description',
      },
      location: {
        type: Type.STRING,
        description: 'Location or virtual link (e.g. Google Meet, Zoom, Office)',
      },
    },
    required: ['title', 'date', 'startTime'],
  },
};

const launchDesktopAppDecl: FunctionDeclaration = {
  name: 'launchDesktopApp',
  description: 'Launches or opens a desktop application or utility window (Terminal, Calculator, Notes, Calendar, Notion, GitHub, Spotify, Gmail, System Settings).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: {
        type: Type.STRING,
        description: 'The app to launch: terminal, calculator, notes, calendar, notion, github, spotify, gmail, settings',
      },
      actionQuery: {
        type: Type.STRING,
        description: 'Optional initial parameter or query for the app (e.g., calculation, search, notes text)',
      },
    },
    required: ['appName'],
  },
};

const manageTimerDecl: FunctionDeclaration = {
  name: 'manageTimer',
  description: 'Starts, pauses, or configures a countdown timer or stopwatch on the desktop.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      durationMinutes: {
        type: Type.NUMBER,
        description: 'Duration in minutes (e.g. 25 for Pomodoro, 5 for break)',
      },
      label: {
        type: Type.STRING,
        description: 'Label or task for the timer',
      },
    },
    required: ['durationMinutes'],
  },
};

const getCurrentSystemTimeDecl: FunctionDeclaration = {
  name: 'getCurrentSystemTime',
  description: 'Fetches current system time or world clock for any city/timezone.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      cityOrTimezone: {
        type: Type.STRING,
        description: 'City or timezone (e.g. Tokyo, London, New York, Local)',
      },
    },
  },
};

const tools = [
  {
    functionDeclarations: [
      createCalendarEventDecl,
      launchDesktopAppDecl,
      manageTimerDecl,
      getCurrentSystemTimeDecl,
    ],
  },
];

// Helper to create Google Calendar Web URL
function buildGoogleCalendarUrl(event: {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  location?: string;
}): string {
  try {
    const today = new Date();
    let eventDate = new Date();

    if (event.date && event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      eventDate = new Date(event.date + 'T00:00:00');
    } else if (event.date && event.date.toLowerCase().includes('tomorrow')) {
      eventDate.setDate(today.getDate() + 1);
    }

    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');

    // Parse start time (default 09:00 if invalid)
    let sHour = 9;
    let sMin = 0;
    const sMatch = event.startTime.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
    if (sMatch) {
      let h = parseInt(sMatch[1], 10);
      const m = sMatch[2] ? parseInt(sMatch[2], 10) : 0;
      const ampm = sMatch[3] ? sMatch[3].toLowerCase() : '';
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      sHour = h;
      sMin = m;
    }

    let eHour = sHour + 1;
    let eMin = sMin;
    if (event.endTime) {
      const eMatch = event.endTime.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
      if (eMatch) {
        let h = parseInt(eMatch[1], 10);
        const m = eMatch[2] ? parseInt(eMatch[2], 10) : 0;
        const ampm = eMatch[3] ? eMatch[3].toLowerCase() : '';
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        eHour = h;
        eMin = m;
      }
    }

    const startIso = `${year}${month}${day}T${String(sHour).padStart(2, '0')}${String(sMin).padStart(2, '0')}00`;
    const endIso = `${year}${month}${day}T${String(eHour).padStart(2, '0')}${String(eMin).padStart(2, '0')}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || 'Productivity Session',
      dates: `${startIso}/${endIso}`,
      details: event.description || 'Scheduled via Dynamic Island AI Assistant',
      location: event.location || 'Desktop Workspace',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    return 'https://calendar.google.com/calendar';
  }
}

// API Route: System Hardware Metrics & Diagnostics
app.get('/api/system/hardware', (_req: Request, res: Response) => {
  try {
    const cpus = os.cpus();
    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();
    const totalMemGb = (totalMemBytes / (1024 ** 3)).toFixed(1);
    const freeMemGb = (freeMemBytes / (1024 ** 3)).toFixed(1);
    const usedMemPercent = Math.round(((totalMemBytes - freeMemBytes) / totalMemBytes) * 100);

    return res.json({
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      cpuModel: cpus[0]?.model || 'Windows Core Processor',
      cores: cpus.length,
      totalMemory: `${totalMemGb} GB`,
      freeMemory: `${freeMemGb} GB`,
      memoryUsagePercent: usedMemPercent,
      arch: os.arch(),
      uptimeHours: (os.uptime() / 3600).toFixed(1),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to query system hardware metrics' });
  }
});

// Helper for Local Desktop Companion Fallback when API key is missing or offline
function handleLocalDesktopFallback(prompt: string, currentTimeStr: string, currentDateStr: string) {
  const p = prompt.toLowerCase().trim();
  const executedActions: any[] = [];
  let responseText = '';

  // 1. App Launch
  if (p.includes('open') || p.includes('launch') || p.includes('start')) {
    let appName = '';
    if (p.includes('terminal') || p.includes('cmd') || p.includes('powershell')) appName = 'terminal';
    else if (p.includes('calc') || p.includes('calculator')) appName = 'calculator';
    else if (p.includes('note') || p.includes('notepad')) appName = 'notes';
    else if (p.includes('calendar')) appName = 'calendar';
    else if (p.includes('notion')) appName = 'notion';
    else if (p.includes('github')) appName = 'github';
    else if (p.includes('spotify')) appName = 'spotify';
    else if (p.includes('gmail') || p.includes('mail')) appName = 'gmail';
    else if (p.includes('setting')) appName = 'settings';

    if (appName) {
      executedActions.push({
        type: 'app',
        name: 'launchDesktopApp',
        data: { appName }
      });
      responseText = `Opening ${appName.charAt(0).toUpperCase() + appName.slice(1)} on your desktop.`;
    }
  }

  // 2. Timer
  if (!responseText && (p.includes('timer') || p.includes('countdown') || p.includes('pomodoro') || p.includes('remind'))) {
    const match = p.match(/(\d+)\s*(?:min|minute|m)/i) || p.match(/(\d+)/);
    const duration = match ? parseInt(match[1], 10) : 25;
    executedActions.push({
      type: 'timer',
      name: 'manageTimer',
      data: { durationMinutes: duration, label: 'Desktop Focus Timer' }
    });
    responseText = `Countdown timer set for ${duration} minutes.`;
  }

  // 3. Time & Date
  if (!responseText && (p.includes('time') || p.includes('clock') || p.includes('date') || p.includes('day'))) {
    executedActions.push({
      type: 'time',
      name: 'getCurrentSystemTime',
      data: { currentTime: currentTimeStr, currentDate: currentDateStr }
    });
    responseText = `It's currently ${currentTimeStr} on ${currentDateStr}.`;
  }

  // 4. Calendar Scheduling
  if (!responseText && (p.includes('schedule') || p.includes('meet') || p.includes('agenda') || p.includes('appointment'))) {
    const cleanTitle = prompt.replace(/(schedule|meeting|appointment|add to calendar|for|at)/gi, '').trim() || 'Productivity Session';
    const gcalUrl = buildGoogleCalendarUrl({
      title: cleanTitle,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      description: 'Scheduled with SEN AI Desktop Assistant',
    });
    executedActions.push({
      type: 'calendar',
      name: 'createCalendarEvent',
      data: {
        title: cleanTitle,
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        googleCalendarUrl: gcalUrl
      }
    });
    responseText = `I've prepared a calendar event for "${cleanTitle}". Click below to add it to Google Calendar.`;
  }

  // 5. Math calculation
  if (!responseText && /^[\d\s+\-*/().^%]+$/.test(p)) {
    try {
      const sanitized = p.replace(/[^0-9+\-*/().]/g, '');
      const calcResult = Function(`'use strict'; return (${sanitized})`)();
      responseText = `${p} = ${calcResult}`;
    } catch (e) {}
  }

  // 6. Conversational / Help
  if (!responseText) {
    if (p.includes('who are you') || p.includes('what are you') || p.includes('sen') || p === 'hi' || p === 'hello') {
      responseText = `I'm SEN, your native Windows 11 desktop AI companion and Dynamic Lake assistant. I can open applications, run focus timers, schedule events to Google Calendar, and answer questions.`;
    } else if (p.includes('help')) {
      responseText = `You can ask me to open apps (Terminal, Calculator, Notes, Spotify), start focus timers, schedule calendar meetings, check the time, or assist with your workflows.`;
    } else {
      responseText = `I've processed your request: "${prompt}". You can command SEN to open desktop apps, set focus timers, or organize calendar events.`;
    }
  }

  return {
    text: responseText,
    actions: executedActions,
    modelUsed: 'SEN Desktop Core (Windows 11)',
    routingCategory: 'general',
    routingReason: 'Local desktop companion engine',
    timestamp: Date.now()
  };
}

// API Route: AI Assistant Chat & Orchestration
app.post('/api/gemini/assist', async (req: Request, res: Response) => {
  try {
    const { prompt, model: requestedModel, history = [], apiKey: bodyKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const activeKey = (headerKey || bodyKey || process.env.GEMINI_API_KEY || '').trim();

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const route = determineModelAndRoute(prompt, requestedModel);
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentTimeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // If no active Gemini API key is configured, seamlessly use the local desktop agent
    if (!activeKey) {
      const fallbackResult = handleLocalDesktopFallback(prompt, currentTimeStr, currentDateStr);
      return res.json(fallbackResult);
    }

    const activeAi = getAiClient(activeKey);

    const systemInstruction = `You are SEN, powered by Google Gemini 3.8 Flash AI running as a minimalist Dynamic Lake notch AI assistant on the user's Windows computer. The user addresses you as SEN ("Hey Sen" or "Hello Sen").
Today is ${currentDateStr}, and current local time is ${currentTimeStr}.

Your capabilities:
1. You are SEN, using Google Gemini 3.8 Flash as your primary AI model: highly intelligent, analytical, fast, concise, and helpful.
2. Orchestrate desktop actions: Open apps (terminal, calculator, notes, calendar, notion, github, spotify, gmail, settings), set timers, check time worldwide.
3. Add to schedules & Google Calendar: When the user asks to schedule anything, call the 'createCalendarEvent' tool with clear title, date, and time.
4. Writing & Summarization: Provide crisp, punchy, well-structured output. If summarizing, organize with clear sections and actionable bullet points.
5. Voice & Tone: Minimalist, intelligent, polished, helpful, and concise. Avoid superfluous filler words.
6. You have function calling tools: Always invoke tools when the user's request involves calendar scheduling, app launching, timer creation, or time checking.`;

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    try {
      const response = await activeAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools,
        },
      });

      let text = response.text || '';
      const functionCalls = response.functionCalls || [];

      // Parse executed tool actions
      const executedActions: any[] = [];
      for (const fc of functionCalls) {
        if (fc.name === 'createCalendarEvent') {
          const args = fc.args as any;
          const gcalUrl = buildGoogleCalendarUrl(args);
          executedActions.push({
            type: 'calendar',
            name: 'createCalendarEvent',
            data: {
              ...args,
              googleCalendarUrl: gcalUrl,
            },
          });
          if (!text) {
            text = `I've scheduled "${args.title || 'Event'}" for ${args.date || 'today'} at ${args.startTime || 'scheduled time'}.`;
          }
        } else if (fc.name === 'launchDesktopApp') {
          executedActions.push({
            type: 'app',
            name: 'launchDesktopApp',
            data: fc.args,
          });
          if (!text) {
            text = `Launching ${(fc.args as any)?.appName || 'application'} on your desktop.`;
          }
        } else if (fc.name === 'manageTimer') {
          executedActions.push({
            type: 'timer',
            name: 'manageTimer',
            data: fc.args,
          });
          if (!text) {
            text = `Timer set for ${(fc.args as any)?.durationMinutes || 25} minutes.`;
          }
        } else if (fc.name === 'getCurrentSystemTime') {
          executedActions.push({
            type: 'time',
            name: 'getCurrentSystemTime',
            data: {
              ...((fc.args as any) || {}),
              currentTime: currentTimeStr,
              currentDate: currentDateStr,
            },
          });
          if (!text) {
            text = `The current time is ${currentTimeStr} (${currentDateStr}).`;
          }
        }
      }

      if (!text && executedActions.length === 0) {
        text = 'Request processed successfully.';
      }

      return res.json({
        text,
        modelUsed: route.displayModel || 'Google Gemini 3.8 Flash',
        routingCategory: route.category,
        routingReason: route.reason,
        actions: executedActions,
        timestamp: Date.now(),
      });
    } catch (genErr: any) {
      console.warn('Gemini 3.8 Flash API call fallback:', genErr?.message);
      // Gracefully fall back to local desktop agent rather than failing
      const fallbackResult = handleLocalDesktopFallback(prompt, currentTimeStr, currentDateStr);
      return res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/assist:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process request with AI assistant.',
    });
  }
});

// API Route: Writing Studio Specialized Endpoint
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { content, format = 'bullets', tone = 'professional' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required for summarization.' });
    }

    const prompt = `Analyze and transform the following text with format: "${format}" and tone: "${tone}".

Format Instructions:
- If format is "bullets": Extract 4-6 high-impact key takeaways.
- If format is "tldr": Provide a 2-3 sentence punchy executive synthesis.
- If format is "action_items": Extract clear actionable tasks with owners and priorities.
- If format is "rewrite": Polish grammar, elevate diction, and align with "${tone}" tone.

Content:
${content}`;

    const activeAi = getAiClient(req.headers['x-gemini-api-key'] as string);
    const response = await activeAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an executive editor and summarization specialist. Output clean, scannable Markdown without robotic chatter.',
      },
    });

    return res.json({
      result: response.text || '',
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process summarization request.',
    });
  }
});

// API Route: Desktop Startup Script Downloads
app.get('/api/desktop/scripts/:os', (req: Request, res: Response) => {
  const osType = req.params.os.toLowerCase();
  const appUrl = process.env.APP_URL || `http://localhost:${defaultPort}`;

  if (osType === 'windows') {
    // Windows Batch script to create startup shortcut in shell:startup
    const batContent = `@echo off
echo ===================================================
echo Dynamic Island AI - Windows Startup Installer
echo ===================================================
echo Setting up Dynamic Island AI to launch on PC boot...

set "STARTUP_FOLDER=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\\DynamicIslandAI.url"

echo [InternetShortcut] > "%SHORTCUT_PATH%"
echo URL=${appUrl} >> "%SHORTCUT_PATH%"
echo IconIndex=0 >> "%SHORTCUT_PATH%"

echo.
echo [SUCCESS] Dynamic Island AI shortcut placed in:
echo %STARTUP_FOLDER%
echo.
echo Dynamic Island AI will now launch automatically on Windows boot.
pause
`;
    res.setHeader('Content-Type', 'application/x-bat');
    res.setHeader('Content-Disposition', 'attachment; filename="install-startup-windows.bat"');
    return res.send(batContent);
  }

  if (osType === 'macos') {
    // macOS shell command script
    const shContent = `#!/bin/bash
# Dynamic Island AI - macOS Login Item Installer
echo "Installing Dynamic Island AI to macOS Login Items..."

APP_URL="${appUrl}"
PLIST_PATH="$HOME/Library/LaunchAgents/com.dynamicisland.assistant.plist"

cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dynamicisland.assistant</string>
    <key>ProgramArguments</key>
    <array>
        <string>open</string>
        <string>$APP_URL</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

launchctl load "$PLIST_PATH" 2>/dev/null
echo "[SUCCESS] Dynamic Island AI LaunchAgent registered at $PLIST_PATH"
echo "Dynamic Island AI will automatically start on macOS login."
`;
    res.setHeader('Content-Type', 'text/x-shellscript');
    res.setHeader('Content-Disposition', 'attachment; filename="setup-startup-mac.command"');
    return res.send(shContent);
  }

  if (osType === 'linux') {
    const desktopEntry = `[Desktop Entry]
Type=Application
Exec=xdg-open ${appUrl}
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Dynamic Island AI
Comment=Apple-inspired Dynamic Island AI Desktop Assistant
`;
    res.setHeader('Content-Type', 'application/x-desktop');
    res.setHeader('Content-Disposition', 'attachment; filename="dynamic-island-autostart.desktop"');
    return res.send(desktopEntry);
  }

  return res.status(400).send('Invalid OS type specified. Supported: windows, macos, linux');
});

// Mount Vite middleware for development
// Mount Vite middleware for development or serve dist in production
export async function startServer(portToUse: number = defaultPort): Promise<number> {
  const isProd = process.env.NODE_ENV === 'production' || typeof (process as any).versions?.electron !== 'undefined';
  
  if (!isProd) {
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      serveStaticDist();
    }
  } else {
    serveStaticDist();
  }

  function serveStaticDist() {
    const distPath = path.resolve(currentDirname, 'dist');
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.json': 'application/json',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.webp': 'image/webp',
    };

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      const cleanPath = req.path.replace(/^\//, '');
      const candidatePath = path.join(distPath, cleanPath);
      
      try {
        if (cleanPath && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          const ext = path.extname(candidatePath).toLowerCase();
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          return res.send(fs.readFileSync(candidatePath));
        }
      } catch (_) {}

      // Fallback to index.html for client-side SPA routing
      const indexFile = path.join(distPath, 'index.html');
      try {
        if (fs.existsSync(indexFile)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(fs.readFileSync(indexFile));
        }
      } catch (_) {}

      res.status(404).send('Not Found');
    });
  }

  return new Promise((resolve) => {
    let currentAttemptPort = portToUse;
    const tryListen = (p: number) => {
      const serverInstance = app.listen(p, () => {
        const address = serverInstance.address();
        const activePort = typeof address === 'object' && address ? address.port : p;
        console.log(`Server running at http://localhost:${activePort}`);
        resolve(activePort);
      });

      serverInstance.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${p} in use, trying port ${p + 1}...`);
          tryListen(p === 0 ? 0 : p + 1);
        } else {
          console.error('Server error:', err);
          resolve(p);
        }
      });
    };
    tryListen(currentAttemptPort);
  });
}

// Auto-run if executed directly or in dev mode
startServer();
