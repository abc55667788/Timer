import React from 'react';
import { 
  Maximize2, Edit3, Square, Coffee, Briefcase, RotateCcw, Pause, Play, BookOpen 
} from 'lucide-react';
import { TimerPhase, Task } from '../types';

interface MiniModeProps {
  phase: TimerPhase;
  currentTask: Task;
  setIsMiniMode: (val: boolean) => void;
  setIsJournalOpen: (val: boolean) => void;
  setActiveTab: (val: any) => void;
  formatTime: (time: number) => string;
  displayTime: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  setShowLoggingModal: (val: boolean) => void;
  isCurrentlyRecording: boolean;
  handleStopClick: () => void;
  handleSkipToNextPhase: () => void;
  handleStart: () => void;
  isActive: boolean;
  timeLeft: number;
  settings: { workDuration: number; restDuration: number };
}

const MiniMode: React.FC<MiniModeProps> = ({
  phase,
  currentTask,
  setIsMiniMode,
  setIsJournalOpen,
  setActiveTab,
  formatTime,
  displayTime,
  isOvertime,
  overtimeSeconds,
  setShowLoggingModal,
  isCurrentlyRecording,
  handleStopClick,
  handleSkipToNextPhase,
  handleStart,
  isActive,
  timeLeft,
  settings,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col z-40 overflow-hidden select-none rounded-[2rem] border border-emerald-100 shadow-2xl" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex-1 flex items-center px-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest ${phase === 'work' ? 'text-emerald-600' : 'text-emerald-500'}`}>
                {currentTask.category}
              </span>
              <button 
                style={{ WebkitAppRegion: 'no-drag' } as any}
                onClick={() => setIsMiniMode(false)} 
                className="p-1.5 hover:bg-emerald-100 rounded-full text-emerald-800 transition-all duration-300 ease-in-out active:scale-90" 
                title="Maximize"
              >
                <Maximize2 size={16} />
              </button>
            </div>
              <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold tabular-nums tracking-tighter leading-none">{formatTime(displayTime)}</span>
              {isOvertime && <span className="text-[10px] text-orange-500 font-bold">+{formatTime(overtimeSeconds)}</span>}
            </div>
          </div>
          <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
             <button title="Journal Sidebar" onClick={() => { setIsMiniMode(false); setActiveTab('timer'); setIsJournalOpen(true); }} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center"><BookOpen size={14}/></button>
             <button onClick={() => setShowLoggingModal(true)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90"><Edit3 size={14}/></button>
             {isCurrentlyRecording && (
               <button onClick={handleStopClick} className="p-2 rounded-xl bg-white text-red-500 border border-red-50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-in-out active:scale-90"><Square size={14}/></button>
             )}
             {!isOvertime && isCurrentlyRecording && (
               <button onClick={handleSkipToNextPhase} className="p-2 rounded-xl bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90" title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
                 {phase === 'work' ? <Coffee size={14} /> : <Briefcase size={14} />}
               </button>
             )}
             {isOvertime && (
               <button onClick={handleSkipToNextPhase} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90" title="Next Phase">
                 <RotateCcw size={14} />
               </button>
             )}
             <button onClick={handleStart} className={`p-2 rounded-xl shadow-md transition-all duration-300 ease-in-out active:scale-90 ${isActive ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}>
                {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             </button>
          </div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-emerald-50 flex-shrink-0">
        <div className="h-full transition-all duration-1000 bg-emerald-500" style={{ width: `${(timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 100}%` }} />
      </div>
    </div>
  );
};

export default MiniMode;
