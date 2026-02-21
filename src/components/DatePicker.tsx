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
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 50 : 'auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/80 backdrop-blur-md border border-emerald-100 rounded-xl py-2 px-3 lg:py-2.5 lg:px-4 text-[10px] lg:text-[11px] font-black text-emerald-950 tracking-tight flex items-center justify-between hover:bg-white hover:border-emerald-300 transition-all focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
      >
        <div className="flex items-center gap-1.5 lg:gap-2">
          <Calendar size={12} className="text-emerald-500" />
          <span className="truncate">{value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder || "Select Date"}</span>
        </div>
        <ChevronDown size={12} className={`text-emerald-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/60 p-5 z-[500] animate-in fade-in zoom-in-95 origin-top min-w-[280px]">
          <div className="flex justify-between items-center mb-4 bg-emerald-50/80 p-2 rounded-[1.5rem] border border-emerald-100/50">
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
              className="p-2 hover:bg-white rounded-xl text-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-emerald-950 uppercase tracking-widest">{months[currentMonth]}</span>
              <span className="text-[11px] font-black text-emerald-300 tracking-tighter">{currentYear}</span>
            </div>
            <button 
              onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
              className="p-2 hover:bg-white rounded-xl text-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] font-black text-emerald-200/80 py-1 uppercase tracking-tighter">{d}</div>
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
                    ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-500/10' : 
                      isToday ? 'text-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100/50' : 'text-emerald-900 hover:bg-emerald-50 hover:scale-110'}
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
            className="w-full mt-2 py-3 bg-emerald-900 text-white rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase hover:bg-emerald-800 hover:shadow-lg active:scale-95 transition-all shadow-md"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
