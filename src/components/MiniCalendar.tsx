import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogEntry, StatsView } from '../types';
import { formatDate } from '../utils/time';

interface MiniCalendarProps {
  logs: LogEntry[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  viewType: StatsView;
}

function MiniCalendar({ logs, selectedDate, onSelectDate, viewType }: MiniCalendarProps) {
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
    <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm w-full max-w-[280px] animate-in slide-in-from-left duration-500 ring-1 ring-emerald-50/50">
      <div className="flex justify-between items-center mb-6 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="flex gap-4">
          <div className="relative group">
            <select
              value={currentMonth}
              onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value, 10), 1))}
              className="bg-transparent text-[11px] font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none pr-4 transition-colors z-10"
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="relative group">
            <select
              value={currentYear}
              onChange={(e) => setViewDate(new Date(parseInt(e.target.value, 10), currentMonth, 1))}
              className="bg-transparent text-[11px] font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none pr-4 transition-colors z-10"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-300 hover:text-emerald-600 border border-emerald-50 transition-all active:scale-90"><ChevronLeft size={14} /></button>
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-300 hover:text-emerald-600 border border-emerald-50 transition-all active:scale-90"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className="text-[10px] font-bold text-emerald-200">
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
              className={`relative h-8 w-8 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center
                ${isSelected ? 'bg-emerald-600 text-white shadow-lg' :
                  isInWeek ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-emerald-800'}`}
            >
              {d}
              {hasRecord && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full" />}
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
        className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
      >
        <CalendarDays size={14} /> Today
      </button>
    </div>
  );
}

export default MiniCalendar;
