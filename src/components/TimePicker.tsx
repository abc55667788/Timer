import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
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
        className="w-full bg-white border border-emerald-100/50 rounded-xl py-2.5 px-4 text-[11px] font-bold text-emerald-900 tracking-tight flex items-center justify-between hover:bg-emerald-50 transition-all focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-emerald-400" />
          <span>{hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {ampm}</span>
        </div>
        <ChevronDown size={12} className={`text-emerald-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-50 p-4 z-[200] animate-in fade-in zoom-in-95 origin-top min-w-[200px]">
          <div className="flex gap-3 h-40">
            {/* Hours */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
               <div className="text-[8px] font-black text-emerald-300 uppercase tracking-widest text-center mb-1.5 pt-1">H</div>
               {hours.map(h => (
                 <button
                   key={h}
                   onClick={() => onChange(formatTime(h, minute, ampm))}
                   className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${hour === h ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-800 hover:bg-emerald-50'}`}
                 >
                   {h.toString().padStart(2, '0')}
                 </button>
               ))}
            </div>

            {/* Minutes */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
              <div className="text-[8px] font-black text-emerald-300 uppercase tracking-widest text-center mb-1.5 pt-1">M</div>
              {minutes.map(m => (
                <button
                  key={m}
                  onClick={() => onChange(formatTime(hour, m, ampm))}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${minute === m ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-800 hover:bg-emerald-50'}`}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-[8px] font-black text-emerald-300 uppercase tracking-widest text-center mb-1.5 pt-1">P</div>
              {['AM', 'PM'].map(ap => (
                <button
                  key={ap}
                  onClick={() => onChange(formatTime(hour, minute, ap))}
                  className={`flex-1 rounded-lg text-[10px] font-bold transition-all ${ampm === ap ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'}`}
                >
                  {ap}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 py-2 bg-emerald-950 text-white rounded-lg text-[9px] font-bold tracking-tight hover:bg-emerald-800 transition-all uppercase"
          >
            Set Time
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
