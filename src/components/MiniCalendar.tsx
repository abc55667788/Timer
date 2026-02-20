import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogEntry, StatsView } from '../types';
import { formatDate } from '../utils/time';

interface MiniCalendarProps {
  logs: LogEntry[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  viewType: StatsView;
  compact?: boolean;
}

function MiniCalendar({ logs, selectedDate, onSelectDate, viewType, compact = false }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const recordedDays = useMemo(() => new Set(logs.map((l) => formatDate(l.startTime))), [logs]);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [currentYear, currentMonth, daysInMonth, firstDay]);

  const isDateInSelectedWeek = (dateStr: string) => {
    if (viewType !== 'week') return false;
    const target = new Date(dateStr);
    const selected = new Date(selectedDate);
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - selected.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return target >= startOfWeek && target <= endOfWeek;
  };

  return (
    <div className={`bg-white ${compact ? 'p-4 rounded-[1.5rem]' : 'p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem]'} border border-emerald-50 shadow-sm w-full ${compact ? 'max-w-full sm:max-w-[240px]' : 'max-w-full sm:max-w-[280px]'} animate-in slide-in-from-left duration-500 ring-1 ring-emerald-50/50`}>
      <div className={`flex justify-between items-center ${compact ? 'mb-4 px-3 py-2' : 'mb-6 px-4 py-3'} bg-emerald-50 rounded-[1rem] border border-emerald-100`}>
        <div className={`flex ${compact ? 'gap-2' : 'gap-4'}`}>
          <div className="relative group">
            <select
              value={currentMonth}
              onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value, 10), 1))}
              className={`bg-transparent ${compact ? 'text-[10px]' : 'text-xs'} font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none pr-3 transition-colors z-10`}
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <ChevronDown size={compact ? 10 : 12} className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="relative group">
            <select
              value={currentYear}
              onChange={(e) => setViewDate(new Date(parseInt(e.target.value, 10), currentMonth, 1))}
              className={`bg-transparent ${compact ? 'text-[10px]' : 'text-xs'} font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none pr-3 transition-colors z-10`}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={compact ? 10 : 12} className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className={`${compact ? 'p-1' : 'p-1.5'} bg-white rounded shadow-sm text-emerald-300 hover:text-emerald-600 border border-emerald-50 transition-all active:scale-90`}><ChevronLeft size={compact ? 12 : 16} /></button>
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className={`${compact ? 'p-1' : 'p-1.5'} bg-white rounded shadow-sm text-emerald-300 hover:text-emerald-600 border border-emerald-50 transition-all active:scale-90`}><ChevronRight size={compact ? 12 : 16} /></button>
        </div>
      </div>
      <div className={`grid grid-cols-7 gap-1 text-center ${compact ? 'mb-4' : 'mb-6'}`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-emerald-500`}>
            {d}
          </div>
        ))}
        {calendarDays.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isInWeek = isDateInSelectedWeek(dateStr);
          const hasRecord = recordedDays.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative ${compact ? 'h-7 w-7' : 'h-9 w-9'} rounded-lg ${compact ? 'text-[10px]' : 'text-xs'} font-bold transition-all flex items-center justify-center
                ${isSelected ? 'bg-emerald-600 text-white shadow-lg' :
                  isInWeek ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-emerald-800'}`}
            >
              {d}
              {hasRecord && !isSelected && <div className={`absolute ${compact ? 'bottom-0.5 w-1 h-1' : 'bottom-1 w-1.5 h-1.5'} bg-emerald-400 rounded-full`} />}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => {
          const today = formatDate(Date.now());
          setViewDate(new Date());
          onSelectDate(today);
        }}
        className={`w-full ${compact ? 'py-2' : 'py-3'} bg-emerald-50 text-emerald-600 rounded-[0.75rem] ${compact ? 'text-[10px]' : 'text-xs'} font-bold tracking-tight hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 overflow-hidden`}
      >
        <CalendarDays size={compact ? 14 : 16} /> Today
      </button>
    </div>
  );
}

export default MiniCalendar;

