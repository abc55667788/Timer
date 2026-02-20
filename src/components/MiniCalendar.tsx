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
  const [openDropdown, setOpenDropdown] = useState<'month' | 'year' | null>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const recordedDays = useMemo(() => new Set(logs.map((l) => formatDate(l.startTime))), [logs]);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const arr = [];
    for (let i = current - 5; i <= current + 5; i++) arr.push(i);
    return arr;
  }, []);

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
    <div className={`bg-white relative ${compact ? 'p-4 rounded-[1.5rem]' : 'p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem]'} border border-emerald-50 shadow-sm w-full ${compact ? 'max-w-full sm:max-w-[240px]' : 'max-w-full sm:max-w-[280px]'} animate-in slide-in-from-left duration-500 ring-1 ring-emerald-50/50`}>
      {/* Click-out overlay */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/0" 
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <div className={`flex justify-between items-center ${compact ? 'mb-3 px-2 py-1.5' : 'mb-5 px-3 py-2.5'} bg-emerald-50/50 rounded-2xl border border-emerald-100/50`}>
        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-3'}`}>
          <div className="relative">
            <button
               onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
               className={`flex items-center gap-1 bg-white/40 hover:bg-white px-2 py-1 rounded-lg transition-all ${compact ? 'text-[10px]' : 'text-xs'} font-black text-emerald-950 border border-emerald-100/50 shadow-sm overflow-visible z-50 relative`}
            >
              {months[currentMonth]}
              <ChevronDown size={compact ? 10 : 12} className={`text-emerald-400 transition-transform ${openDropdown === 'month' ? 'rotate-180' : ''}`} />
            </button>
            
            {openDropdown === 'month' && (
              <div className="absolute top-full left-0 mt-2 w-28 bg-white rounded-2xl shadow-2xl border border-emerald-50 p-2 z-[60] animate-in fade-in zoom-in-95 grid grid-cols-2 gap-1 overflow-visible h-fit origin-top">
                {months.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => {
                      setViewDate(new Date(currentYear, i, 1));
                      setOpenDropdown(null);
                    }}
                    className={`p-2 rounded-xl text-[10px] font-bold transition-all ${currentMonth === i ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-emerald-800 hover:bg-emerald-50'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-3 w-[1px] bg-emerald-100/80 mx-1" />
          
          <div className="relative">
             <button
               onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
               className={`flex items-center gap-1 bg-white/40 hover:bg-white px-2 py-1 rounded-lg transition-all ${compact ? 'text-[10px]' : 'text-xs'} font-black text-emerald-950 border border-emerald-100/50 shadow-sm overflow-visible z-50 relative`}
            >
              {currentYear}
              <ChevronDown size={compact ? 10 : 12} className={`text-emerald-400 transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'year' && (
              <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-emerald-50 p-2 z-[60] animate-in fade-in zoom-in-95 grid grid-cols-2 gap-1 overflow-visible max-h-48 overflow-y-auto scrollbar-none h-fit origin-top">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setViewDate(new Date(y, currentMonth, 1));
                      setOpenDropdown(null);
                    }}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all ${currentYear === y ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-emerald-800 hover:bg-emerald-50'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className={`${compact ? 'p-1' : 'p-1.5'} bg-white/90 rounded-xl shadow-sm text-emerald-500 hover:text-emerald-700 border border-emerald-100/50 transition-all active:scale-90`}><ChevronLeft size={compact ? 12 : 16} /></button>
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className={`${compact ? 'p-1' : 'p-1.5'} bg-white/90 rounded-xl shadow-sm text-emerald-500 hover:text-emerald-700 border border-emerald-100/50 transition-all active:scale-90`}><ChevronRight size={compact ? 12 : 16} /></button>
        </div>
      </div>
      <div className={`grid grid-cols-7 gap-x-1 gap-y-0.5 text-center ${compact ? 'mb-3' : 'mb-5'}`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-bold text-emerald-300 uppercase tracking-widest`}>
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
              className={`relative ${compact ? 'h-7 w-7' : 'h-8 w-8'} m-auto rounded-[0.75rem] ${compact ? 'text-[10px]' : 'text-xs'} font-bold transition-all flex items-center justify-center
                ${isSelected ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 ring-2 ring-emerald-100 ring-offset-1' :
                  isInWeek ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-emerald-50 text-emerald-900'}`}
            >
              {d}
              {hasRecord && !isSelected && <div className={`absolute ${compact ? 'bottom-0.5 w-1 h-1' : 'bottom-1 w-1 h-1'} bg-emerald-400 rounded-full ring-1 ring-white`} />}
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
        className={`w-full ${compact ? 'py-2.5' : 'py-3'} bg-emerald-600/5 text-emerald-600 rounded-2xl ${compact ? 'text-[10px]' : 'text-xs'} font-black tracking-tight hover:bg-emerald-600/10 transition-all flex items-center justify-center gap-2 border border-emerald-100/50`}
      >
        <CalendarDays size={compact ? 12 : 14} className="opacity-60" /> Today
      </button>
    </div>
  );
}

export default MiniCalendar;

