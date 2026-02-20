import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className, placeholder }) => {
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
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 px-4 text-[11px] font-bold text-emerald-950 tracking-tight flex items-center justify-between hover:bg-emerald-50 transition-all focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-emerald-400" />
          <span>{value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder || "Select Date"}</span>
        </div>
        <ChevronDown size={12} className={`text-emerald-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-50 p-5 z-[210] animate-in fade-in zoom-in-95 origin-top min-w-[260px]">
          <div className="flex justify-between items-center mb-4 bg-emerald-50/50 p-2 rounded-2xl border border-emerald-100/50">
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
              className="p-1.5 hover:bg-white rounded-xl text-emerald-400 hover:text-emerald-600 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">{months[currentMonth]}</span>
              <span className="text-xs font-black text-emerald-300">{currentYear}</span>
            </div>
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
              className="p-1.5 hover:bg-white rounded-xl text-emerald-400 hover:text-emerald-600 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[9px] font-black text-emerald-200 py-1 uppercase tracking-tighter">{d}</div>
            ))}
            {calendarDays.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="h-8 w-8" />;
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
                  className={`h-8 w-8 rounded-xl text-[11px] font-bold flex items-center justify-center transition-all m-auto
                    ${isSelected ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-100 ring-offset-1' : 
                      isToday ? 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100' : 'text-emerald-900 hover:bg-emerald-50'}
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
            className="w-full mt-3 py-2 bg-emerald-950 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-emerald-800 transition-transform active:scale-95"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
