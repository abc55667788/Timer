import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  darkMode?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className, placeholder, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize view date based on current value or today
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [currentYear, currentMonth]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 50 : 'auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-xl py-2 px-3 lg:py-2.5 lg:px-4 text-[10px] lg:text-[11px] font-black tracking-tight flex items-center justify-between transition-all focus:ring-4 focus:ring-emerald-500/10 shadow-sm ${darkMode ? 'bg-zinc-800 border-white/5 text-white hover:bg-zinc-700' : 'bg-white/80 backdrop-blur-md border-emerald-100 text-emerald-950 hover:bg-white hover:border-emerald-300'}`}
      >
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Calendar size={12} className={darkMode ? 'text-emerald-500' : 'text-emerald-500'} />
          <span className="truncate">{value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder || "Select Date"}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform flex-shrink-0 ${darkMode ? 'text-zinc-600' : 'text-emerald-300'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 backdrop-blur-3xl rounded-[2.5rem] border p-5 z-[500] animate-in fade-in zoom-in-95 origin-top min-w-[280px] ${darkMode ? 'bg-zinc-900 border-white/10 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white/95 border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]'}`}>
          <div className={`flex justify-between items-center mb-4 p-2 rounded-[1.5rem] border ${darkMode ? 'bg-zinc-800 border-white/5' : 'bg-emerald-50/80 border-emerald-100/50'}`}>
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
              className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:text-emerald-500' : 'bg-white text-emerald-500 hover:text-emerald-700'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-emerald-950'}`}>{months[currentMonth]}</span>
              <span className={`text-[11px] font-black tracking-tighter ${darkMode ? 'text-zinc-600' : 'text-emerald-300'}`}>{currentYear}</span>
            </div>
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
              className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:text-emerald-500' : 'bg-white text-emerald-500 hover:text-emerald-700'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className={`text-[10px] font-black py-1 uppercase tracking-tighter ${darkMode ? 'text-zinc-700' : 'text-emerald-200/80'}`}>{d}</div>
            ))}
            {calendarDays.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="h-9 w-9" />;
              const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = formatDateString(new Date()) === dateStr;

              return (
                <button
                  key={i}
                  onClick={() => {
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-9 w-9 rounded-[1rem] text-[11px] font-black flex items-center justify-center transition-all m-auto
                    ${isSelected ? 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-500/10' : 
                      isToday ? (darkMode ? 'text-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20' : 'text-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100/50') : 
                        (darkMode ? 'text-white hover:bg-zinc-800 hover:scale-110' : 'text-emerald-900 hover:bg-emerald-50 hover:scale-110')}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => {
              const today = formatDateString(new Date());
              onChange(today);
              setIsOpen(false);
            }}
            className={`w-full mt-2 py-3 rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase hover:shadow-lg active:scale-95 transition-all shadow-md ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 active:bg-emerald-600' : 'bg-emerald-900 text-white hover:bg-emerald-800'}`}
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
