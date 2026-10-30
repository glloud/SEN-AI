export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  location?: string;
  googleCalendarUrl?: string;
  completed?: boolean;
}

export interface ExecutedAction {
  type: 'calendar' | 'app' | 'timer' | 'time';
  name: string;
  data: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  routingCategory?: 'system' | 'writing' | 'coding' | 'general' | 'planning';
  routingReason?: string;
  actions?: ExecutedAction[];
  timestamp: number;
}

export interface DesktopApp {
  id: string;
  name: string;
  iconName: string;
  category: 'productivity' | 'developer' | 'utility' | 'media';
  description: string;
  url?: string;
  isNativeSimulated: boolean;
  isOpen?: boolean;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}
