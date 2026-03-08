import React from 'react';
import { LogEntry, Category } from '../types';
import { formatDate, formatClock, formatTime } from '../utils/time';

interface WeeklyTimelineViewProps {
  logs: LogEntry[];
  selectedDate: string;
  getCategoryColor: (cat: Category) => string;
  darkMode: boolean;
  onViewLog: (log: LogEntry) => void;
  onSelectDate: (date: string) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const buildWeekDates = (selectedDate: string) => {
  const center = new Date(`${selectedDate}T00:00:00`).getTime();
  const dayOfWeek = new Date(center).getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = center - mondayOffset * DAY_MS;

  return Array.from({ length: 7 }, (_, idx) => {
    const timestamp = monday + idx * DAY_MS;
    return {
      date: formatDate(timestamp),
      timestamp,
      label: new Date(timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    };
  });
};

export const WeeklyTimelineView: React.FC<WeeklyTimelineViewProps> = ({
  logs,
  selectedDate,
  getCategoryColor,
  darkMode,
  onViewLog,
  onSelectDate,
}) => {
  const week = buildWeekDates(selectedDate);

  return (
    <div className={`rounded-[1.8rem] border p-4 md:p-5 ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-emerald-50 shadow-sm'}`}>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {week.map(day => {
          const dayStart = day.timestamp;
          const dayEnd = dayStart + DAY_MS;
          const dayLogs = logs
            .filter(log => log.startTime >= dayStart && log.startTime < dayEnd)
            .sort((a, b) => a.startTime - b.startTime);
          const total = dayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
          const isSelected = day.date === selectedDate;

          return (
            <div
              key={day.date}
              className={`rounded-2xl border p-3 transition-all ${darkMode ? 'border-white/10 bg-zinc-950/60' : 'border-emerald-100/70 bg-emerald-50/40'} ${isSelected ? (darkMode ? 'ring-1 ring-emerald-400/50' : 'ring-1 ring-emerald-500/30') : ''}`}
            >
              <button
                onClick={() => onSelectDate(day.date)}
                className={`w-full text-left mb-2 ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`}
              >
                <div className="text-[11px] font-black uppercase tracking-widest">{day.label}</div>
                <div className={`text-[10px] font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-500'}`}>{day.date}</div>
                <div className={`text-[11px] font-black mt-1 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{formatTime(total)}</div>
              </button>

              <div className="space-y-1.5 max-h-48 overflow-auto scrollbar-none">
                {dayLogs.length === 0 ? (
                  <div className={`text-[10px] font-semibold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>No sessions</div>
                ) : (
                  dayLogs.slice(0, 8).map(log => (
                    <button
                      key={log.id}
                      onClick={() => onViewLog(log)}
                      className={`w-full rounded-xl border px-2 py-1.5 text-left ${darkMode ? 'border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800' : 'border-emerald-100 bg-white text-emerald-800 hover:bg-emerald-50'} transition-all`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black truncate" style={{ color: getCategoryColor(log.category) }}>
                          {log.category}
                        </span>
                        <span className={`text-[9px] font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-500'}`}>
                          {formatClock(log.startTime)}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold truncate">{log.description || 'Focus Session'}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
