import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to determine model based on user prompt & requested mode
function determineModelAndRoute(prompt: string, requestedModel: string = 'gemini'): {
  model: string;
  displayModel: string;
  category: 'system' | 'writing' | 'coding' | 'general' | 'planning';
  reason: string;
} {
  const p = prompt.toLowerCase();

  // Fast system / time / quick utilities
  if (
    p.includes('time') ||
    p.includes('timer') ||
    p.includes('stopwatch') ||
    p.includes('alarm') ||
    p.includes('open app') ||
    p.includes('launch') ||
    p.includes('calculator') ||
    p.includes('quick') ||
    p.length < 35
  ) {
    return {
      model: 'gemini-2.5-flash',
      displayModel: 'Google Gemini 2.5 Flash',
      category: 'system',
      reason: 'Ultra-fast execution for desktop actions',
    };
  }

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
      model: 'gemini-2.5-pro',
      displayModel: 'Google Gemini 2.5 Pro',
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
      model: 'gemini-2.5-flash',
      displayModel: 'Google Gemini 2.5 Flash',
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
      model: 'gemini-2.5-flash',
      displayModel: 'Google Gemini 2.5 Flash',
      category: 'writing',
      reason: 'Nuanced linguistic flow, coherence, and depth',
    };
  }

  return {
    model: 'gemini-2.5-flash',
    displayModel: 'Google Gemini 2.5 Flash',
    category: 'general',
    reason: 'Primary Google Gemini AI model',
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

// API Route: AI Assistant Chat & Orchestration
app.post('/api/gemini/assist', async (req: Request, res: Response) => {
  try {
    const { prompt, model: requestedModel, history = [] } = req.body;

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

    const systemInstruction = `You are SEN, powered by Google Gemini AI running as a minimalist Dynamic Lake notch AI assistant on the user's Windows computer. The user addresses you as SEN ("Hey Sen").
Today is ${currentDateStr}, and current local time is ${currentTimeStr}.

Your capabilities:
1. You are SEN, using Google Gemini as your primary and sole AI model: highly intelligent, analytical, fast, concise, and helpful.
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

    const response = await ai.models.generateContent({
      model: route.model,
      contents,
      config: {
        systemInstruction,
        tools,
      },
    });

    const text = response.text || '';
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
      } else if (fc.name === 'launchDesktopApp') {
        executedActions.push({
          type: 'app',
          name: 'launchDesktopApp',
          data: fc.args,
        });
      } else if (fc.name === 'manageTimer') {
        executedActions.push({
          type: 'timer',
          name: 'manageTimer',
          data: fc.args,
        });
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
      }
    }

    return res.json({
      text,
      modelUsed: route.displayModel || 'Claude Code (Anthropic)',
      routingCategory: route.category,
      routingReason: route.reason,
      actions: executedActions,
      timestamp: Date.now(),
    });
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

    const response = await ai.models.generateContent({
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
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;

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
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
