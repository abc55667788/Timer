import React, { useMemo, useRef, useEffect } from 'react';
import { LogEntry, Category } from '../../types';
import { formatClock, formatDate } from '../../utils/time';

interface WeeklyTimelineViewProps {
  logs: LogEntry[];
  selectedDate: string; // The date currently highlighted
  getCategoryColor: (cat: Category) => string;
  darkMode: boolean;
  onViewLog?: (log: LogEntry, openEdit?: boolean) => void;
  onSelectDate: (date: string) => void;
}

const START_HOUR = 6;
const HOURS = Array.from({ length: 24 }, (_, i) => (i + START_HOUR) % 24);
const HOUR_HEIGHT = 44; // Slightly more compact so the view is shorter

export const WeeklyTimelineView: React.FC<WeeklyTimelineViewProps> = ({
  logs,
  selectedDate,
  getCategoryColor,
  darkMode,
  onViewLog,
  onSelectDate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with selectedDate to scroll to a reasonable time or keep top
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [selectedDate]);

  const { weekDays } = useMemo(() => {
    // We want the start of the week for the target week of selectedDate
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);
      return {
        dateStr: formatDate(currentDay.getTime()),
        label: currentDay.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNum: currentDay.getDate(),
      };
    });

    return { weekDays: days };
  }, [selectedDate]);

  const logsByDay = useMemo(() => {
    const result: Record<string, LogEntry[]> = {};
    weekDays.forEach((day) => {
      result[day.dateStr] = logs.filter((l) => {
        const lDate = new Date(l.startTime);
        const lH = lDate.getHours();
        const dStr = formatDate(l.startTime);
        
        // Very basic 6am cross-day logic:
        // If hour < 6, it belongs to the PREVIOUS day's "natural day" in this view
        if (lH < START_HOUR) {
          const prevDay = new Date(l.startTime);
          prevDay.setDate(prevDay.getDate() - 1);
          return formatDate(prevDay.getTime()) === day.dateStr;
        }
        return dStr === day.dateStr;
      });
    });
    return result;
  }, [logs, weekDays]);

  return (
    <div className={`flex flex-col h-[520px] rounded-[2.5rem] border overflow-hidden transition-all duration-500 shadow-2xl ${
      darkMode ? 'bg-zinc-950/40 border-white/5 shadow-black/40' : 'bg-white border-emerald-50 shadow-emerald-500/5'
    }`}>
      {/* Header with Days */}
      <div className={`flex border-b sticky top-0 z-20 backdrop-blur-3xl ${
        darkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 border-emerald-100/30'
      }`}>
        <div className="w-12 flex-shrink-0" /> {/* Spacer for time column */}
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          return (
            <button 
              key={day.dateStr} 
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex-1 py-4 text-center border-l first:border-l-0 border-white/5 transition-all outline-none relative group ${
                isSelected ? (darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : 'hover:bg-emerald-500/5'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                  isSelected ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-zinc-600' : 'text-emerald-900/20')
              }`}>{day.label}</p>
              <p className={`text-lg font-black tracking-tighter transition-colors ${
                  isSelected ? (darkMode ? 'text-white' : 'text-emerald-950') : (darkMode ? 'text-zinc-500' : 'text-emerald-900/40')
              }`}>{day.dayNum}</p>
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-none relative pt-4"
      >
        <div className="flex min-h-full relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
          {/* Time Labels Column */}
          <div className="w-12 flex-shrink-0 border-r border-white/5 relative z-10 bg-inherit">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="relative" 
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <span className={`absolute -top-2 left-0 right-0 text-center text-[10px] font-black font-mono tracking-tighter ${
                    darkMode ? 'text-emerald-500/60' : 'text-emerald-500'
                }`}>
                  {hour.toString().padStart(2, '0')}:00
                </span>
                <div className={`absolute top-0 right-0 left-8 h-[1px] ${darkMode ? 'bg-white/5' : 'bg-emerald-50/50'}`} />
              </div>
            ))}
          </div>

          {/* Grid Columns */}
          <div className="flex-1 flex relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className={`border-b ${darkMode ? 'border-white/5' : 'border-emerald-50/30'}`} 
                  style={{ height: `${HOUR_HEIGHT}px` }} 
                />
              ))}
            </div>

            {/* Days Columns */}
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <div 
                  key={day.dateStr} 
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`flex-1 relative border-r last:border-r-0 border-white/5 h-full cursor-pointer transition-colors ${
                    isSelected ? (darkMode ? 'bg-emerald-500/[0.04]' : 'bg-emerald-500/[0.03]') : 'hover:bg-emerald-500/[0.01]'
                  }`}
                >
                  {logsByDay[day.dateStr]?.map((log) => {
                    const startDate = new Date(log.startTime);
                    const h = startDate.getHours();
                    const m = startDate.getMinutes();
                    
                    let viewOffsetHours = h - START_HOUR;
                    if (viewOffsetHours < 0) viewOffsetHours += 24;

                    const top = (viewOffsetHours + m / 60) * HOUR_HEIGHT;
                    const height = Math.max((log.duration / 3600) * HOUR_HEIGHT, 8);
                    
                    return (
                      <div
                        key={log.id}
                        onClick={(e) => { e.stopPropagation(); onViewLog?.(log); }}
                        className="absolute left-[3px] right-[3px] rounded-xl border border-white/20 shadow-lg cursor-pointer hover:scale-[1.02] hover:z-50 hover:brightness-110 transition-all group/log z-10 overflow-hidden ring-1 ring-black/5"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: getCategoryColor(log.category),
                        }}
                      >
                        <div className="p-1.5 h-full flex flex-col pointer-events-none">
                           {height > 20 && (
                             <span className="text-[8px] font-black text-white leading-none truncate uppercase tracking-tighter drop-shadow-sm">
                               {log.description || log.category}
                             </span>
                           )}
                           {height > 35 && (
                             <span className="text-[8px] font-bold text-white/70 leading-tight mt-1 tabular-nums drop-shadow-sm">
                               {formatClock(log.startTime)}
                             </span>
                           )}
                        </div>
                        
                        <div className={`absolute hidden group-hover/log:flex flex-col items-center pointer-events-none ${
                          darkMode ? 'bg-black/95 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-900 text-white'
                        } p-3 rounded-2xl text-[10px] top-0 left-full ml-3 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200 ring-1 ring-white/10`}>
                          <div className="font-black uppercase tracking-widest mb-1">{log.category}</div>
                          {log.description && <div className="text-white font-bold opacity-100 mb-1">{log.description}</div>}
                          <div className="opacity-80 font-mono font-bold bg-white/10 px-2 py-0.5 rounded-lg">
                            {formatClock(log.startTime)} — {log.endTime ? formatClock(log.endTime) : 'NOW'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className={`px-4 py-3 border-t flex justify-between items-center ${
        darkMode ? 'bg-zinc-900/60 border-white/10' : 'bg-emerald-50/60 border-emerald-100/30'
      }`}>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-emerald-500/60' : 'text-emerald-500'
        }`}>Weekly Activity Map</p>
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'} uppercase tracking-widest`}>
          {logs.length} sessions
        </div>
      </div>
    </div>
  );
};
