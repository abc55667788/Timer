import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  className?: string;
  darkMode?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse 24h string into 12h parts
  const parseTime = (time: string) => {
    if (!time) return { hour: 12, minute: 0, ampm: 'AM' };
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return { hour, minute: m || 0, ampm };
  };

  const { hour, minute, ampm } = parseTime(value);

  // Convert 12h parts back to 24h string
  const formatTime = (h: number, m: number, ap: string) => {
    let hour24 = h % 12;
    if (ap === 'PM') hour24 += 12;
    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-xl py-2.5 px-4 text-[11px] font-bold tracking-tight flex items-center justify-between transition-all focus:ring-4 focus:ring-emerald-500/5 shadow-sm ${darkMode ? 'bg-zinc-800 border-white/5 text-white hover:bg-zinc-700' : 'bg-white border-emerald-100/50 text-emerald-900 hover:bg-emerald-50'}`}
      >
        <div className="flex items-center gap-2">
          <Clock size={12} className={darkMode ? 'text-emerald-500' : 'text-emerald-400'} />
          <span>{hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {ampm}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform ${darkMode ? 'text-zinc-600' : 'text-emerald-300'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 backdrop-blur-3xl rounded-[1.5rem] border p-4 z-[200] animate-in fade-in zoom-in-95 origin-top min-w-[200px] ${darkMode ? 'bg-zinc-900 border-white/10 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white border-emerald-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'}`}>
          <div className="flex gap-3 h-40">
            {/* Hours */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
               <div className={`text-[8px] font-black uppercase tracking-widest text-center mb-1.5 pt-1 ${darkMode ? 'text-zinc-600' : 'text-emerald-300'}`}>H</div>
               {hours.map(h => (
                 <button
                   key={h}
                   onClick={() => onChange(formatTime(h, minute, ampm))}
                   className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${hour === h ? 'bg-emerald-600 text-white shadow-md' : (darkMode ? 'text-white hover:bg-zinc-800' : 'text-emerald-800 hover:bg-emerald-50')}`}
                 >
                   {h.toString().padStart(2, '0')}
                 </button>
               ))}
            </div>

            {/* Minutes */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
              <div className={`text-[8px] font-black uppercase tracking-widest text-center mb-1.5 pt-1 ${darkMode ? 'text-zinc-600' : 'text-emerald-300'}`}>M</div>
              {minutes.map(m => (
                <button
                  key={m}
                  onClick={() => onChange(formatTime(hour, m, ampm))}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${minute === m ? 'bg-emerald-600 text-white shadow-md' : (darkMode ? 'text-white hover:bg-zinc-800' : 'text-emerald-800 hover:bg-emerald-50')}`}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className={`text-[8px] font-black uppercase tracking-widest text-center mb-1.5 pt-1 ${darkMode ? 'text-zinc-600' : 'text-emerald-300'}`}>P</div>
              {['AM', 'PM'].map(ap => (
                <button
                  key={ap}
                  onClick={() => onChange(formatTime(hour, minute, ap))}
                  className={`flex-1 rounded-lg text-[10px] font-black transition-all ${ampm === ap ? 'bg-emerald-600 text-white shadow-md' : (darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100')}`}
                >
                  {ap}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className={`w-full mt-3 py-2 rounded-lg text-[9px] font-black tracking-tight transition-all uppercase ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500' : 'bg-emerald-950 text-white hover:bg-emerald-800'}`}
          >
            Set Time
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
