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
    <div 
      className="w-full h-full max-w-full max-h-full bg-white/90 backdrop-blur-3xl flex flex-col z-40 overflow-hidden select-none rounded-[1.25rem] border border-white/60 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.2)] ring-1 ring-white/20" 
      style={{ WebkitAppRegion: 'drag', transform: 'translateZ(0)' } as any}
    >
      <div className="flex-1 flex items-center px-4 md:px-6">
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex flex-col flex-1 min-w-0 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-black tracking-tight uppercase truncate ${phase === 'work' ? 'text-emerald-800' : 'text-emerald-700'} opacity-80 uppercase`}>
                {currentTask.category}
              </span>
              <button 
                style={{ WebkitAppRegion: 'no-drag' } as any}
                onClick={() => setIsMiniMode(false)} 
                className="p-1.5 hover:bg-white/60 rounded-full text-emerald-800/40 hover:text-emerald-800 transition-all duration-300 ease-in-out active:scale-90" 
                title="Maximize"
              >
                <Maximize2 size={13} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-baseline gap-1 flex-wrap-0 whitespace-nowrap">
              <span className={`${displayTime >= 3600 ? 'text-2xl' : 'text-3xl'} font-mono font-black text-emerald-950 tabular-nums tracking-tighter leading-none mb-1 whitespace-nowrap`}>
                {formatTime(displayTime)}
              </span>
              {isOvertime && (
                <span className="text-[10px] text-orange-600 font-bold ml-1 whitespace-nowrap">
                  +{formatTime(overtimeSeconds)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 ml-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
             <button title="Journal Sidebar" onClick={() => { setIsMiniMode(false); setActiveTab('timer'); setIsJournalOpen(true); }} className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/20 text-emerald-600 hover:bg-white/60 transition-all duration-300 shadow-sm"><BookOpen size={15}/></button>
             <button onClick={() => setShowLoggingModal(true)} title="Quick Log" className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/20 text-emerald-600 hover:bg-white/60 transition-all duration-300 shadow-sm"><Edit3 size={15}/></button>
             
             {isCurrentlyRecording && (
               <button onClick={handleStopClick} title="Stop & Save" className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md text-red-500 border border-white/30 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500"><Square size={15}/></button>
             )}
             
             {!isOvertime && isCurrentlyRecording && (
               <button onClick={handleSkipToNextPhase} className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-6 duration-500" title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
                 {phase === 'work' ? <Coffee size={15} /> : <Briefcase size={15} />}
               </button>
             )}

             {isOvertime && (
               <button onClick={handleSkipToNextPhase} className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-right-6 duration-500" title="Next Phase">
                 <RotateCcw size={15} />
               </button>
             )}

             <button 
               onClick={handleStart} 
               className={`p-2.5 rounded-xl shadow-md transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1) active:scale-90 
                 ${isActive 
                   ? 'bg-orange-600/90 text-white shadow-orange-100 rounded-[0.8rem]' 
                   : 'bg-emerald-600/90 text-white shadow-emerald-100 rounded-xl'
                 } border border-white/20 backdrop-blur-md`}
             >
                {isActive ? (
                  <Pause key="pause" size={18} fill="currentColor" className="animate-in fade-in zoom-in duration-300" />
                ) : (
                  <Play key="play" size={18} fill="currentColor" className="animate-in fade-in zoom-in duration-300" />
                )}
             </button>
          </div>
        </div>
      </div>
      <div className="w-full h-1 bg-white/20 flex-shrink-0">
        <div className="h-full transition-all duration-1000 bg-emerald-500" style={{ width: `${(timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 100}%` }} />
      </div>
    </div>
  );
};

export default MiniMode;
