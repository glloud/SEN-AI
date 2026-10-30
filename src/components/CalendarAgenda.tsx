import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ExternalLink,
  Download,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { CalendarEvent } from '../types.ts';

interface CalendarAgendaProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export function CalendarAgenda({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}: CalendarAgendaProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('Google Meet');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build Google Calendar template URL
    const startClean = startTime.replace(':', '');
    const endClean = endTime.replace(':', '');
    const dateClean = date.replace(/-/g, '');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${dateClean}T${startClean}00/${dateClean}T${endClean}00&details=${encodeURIComponent(
      description || 'Created via SEN Dynamic Island Assistant'
    )}&location=${encodeURIComponent(location)}`;

    onAddEvent({
      title: title.trim(),
      date,
      startTime,
      endTime,
      location,
      description,
      googleCalendarUrl: gcalUrl,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  // Helper to download standard .ics iCalendar file
  const handleDownloadIcs = (event: CalendarEvent) => {
    const dateClean = event.date.replace(/-/g, '');
    const sTime = event.startTime.replace(':', '');
    const eTime = (event.endTime || '11:00').replace(':', '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SEN AI Assistant//Desktop Suite//EN
BEGIN:VEVENT
UID:${event.id}@sen.desktop
DTSTAMP:${dateClean}T000000Z
DTSTART:${dateClean}T${sTime}00
DTEND:${dateClean}T${eTime}00
SUMMARY:${event.title}
DESCRIPTION:${event.description || 'Scheduled via SEN Desktop Assistant'}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span>Interactive Agenda</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synced with SEN AI tool calls & Google Calendar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showForm ? 'Cancel' : 'New Event'}</span>
        </button>
      </div>

      {/* Inline Event Creation Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in"
        >
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Review with Lead Designer"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Location / Link</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Google Meet or Office Room"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Save to Agenda
          </button>
        </form>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {events.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No scheduled events yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ask SEN: <span className="text-cyan-400">"Schedule product demo tomorrow at 2 PM"</span>
            </p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border transition-all ${
                evt.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(evt.id)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {evt.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        evt.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {evt.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
                      <span>{evt.date}</span>
                      <span>·</span>
                      <span>
                        {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                      </span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Google Calendar Web Deep Link */}
                  {evt.googleCalendarUrl && (
                    <a
                      href={evt.googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 text-[11px] transition-colors"
                      title="Open in Google Calendar"
                    >
                      <span>Google Cal</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {/* Download .ics file */}
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(evt)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Export iCalendar (.ics)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
