import React from 'react';
import { 
  Maximize2, Edit3, Square, Coffee, Briefcase, RotateCcw, Pause, Play, Library 
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
  darkMode?: boolean;
  isAndroid?: boolean;
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
  darkMode,
  isAndroid,
}) => {
  const bgClass = darkMode ? 'bg-zinc-950/95 border-white/10 shadow-black backdrop-blur-3xl' : 'bg-white/95 border-white/60 shadow-lg backdrop-blur-3xl';
  const textClass = darkMode ? 'text-white' : 'text-emerald-950';
  const accentTextClass = phase === 'work' ? (darkMode ? 'text-emerald-500' : 'text-emerald-800') : (darkMode ? 'text-orange-500' : 'text-emerald-700');
  const btnBgClass = darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-white border-white/5 shadow-black' : 'bg-white/40 border-white/20 text-emerald-600 hover:bg-white/60';

  return (
    <div 
      className={`w-full h-full max-w-full max-h-full ${bgClass} flex flex-col z-40 overflow-hidden select-none rounded-[1.5rem] border`} 
      style={{ WebkitAppRegion: 'drag', transform: 'translateZ(0)' } as any}
    >
      <div className="flex-1 flex items-center px-4 md:px-6">
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex flex-col flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-black tracking-widest uppercase truncate ${accentTextClass} opacity-80`}>
                {currentTask.category}
              </span>
              <button 
                style={{ WebkitAppRegion: 'no-drag' } as any}
                onClick={() => setIsMiniMode(false)} 
                className={`p-1.5 transition-all duration-300 ease-in-out active:scale-90 rounded-xl ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-white' : 'hover:bg-white/60 text-emerald-800/40 hover:text-emerald-800'}`} 
                title="Maximize"
              >
                <Maximize2 size={13} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-baseline gap-1 flex-wrap-0 whitespace-nowrap">
              <span className={`${displayTime >= 3600 ? 'text-2xl' : 'text-3xl'} font-mono font-black ${textClass} tabular-nums tracking-tighter leading-none mb-1 whitespace-nowrap`}>
                {formatTime(displayTime)}
              </span>
              {isOvertime && (
                <span className={`text-[10px] ${darkMode ? 'text-orange-400' : 'text-orange-600'} font-black ml-1 whitespace-nowrap animate-pulse`}>
                  +{formatTime(overtimeSeconds)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0 ml-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
             <button title="Journal Sidebar" onClick={() => { setIsMiniMode(false); setActiveTab('timer'); setIsJournalOpen(true); }} className={`p-2.5 rounded-2xl ${btnBgClass} backdrop-blur-md border shadow-sm transition-all duration-300`}><Library size={15} strokeWidth={2.5}/></button>
             <button onClick={() => setShowLoggingModal(true)} title="Quick Log" className={`p-2.5 rounded-2xl ${btnBgClass} backdrop-blur-md border shadow-sm transition-all duration-300`}><Edit3 size={15} strokeWidth={2.5}/></button>
             
             {isCurrentlyRecording && (
               <button onClick={handleStopClick} title="Stop & Save" className={`p-2.5 rounded-2xl transition-all duration-300 shadow-sm border ${darkMode ? 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-red-500 hover:text-white' : 'bg-white/80 text-red-500 border-white/30 hover:bg-red-500 hover:text-white shadow-sm'} animate-in fade-in slide-in-from-right-2 duration-200`}><Square size={15} fill="currentColor" /></button>
             )}
             
             {!isOvertime && isCurrentlyRecording && (
               <button onClick={handleSkipToNextPhase} className={`p-2.5 rounded-2xl ${btnBgClass} backdrop-blur-md border shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-right-3 duration-200`} title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
                 {phase === 'work' ? <Coffee size={15} strokeWidth={2.5} /> : <Briefcase size={15} strokeWidth={2.5} />}
               </button>
             )}

             {isOvertime && (
               <button onClick={handleSkipToNextPhase} className={`p-2.5 rounded-2xl ${btnBgClass} backdrop-blur-md border shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-right-3 duration-200`} title="Next Phase">
                 <RotateCcw size={15} strokeWidth={2.5} />
               </button>
             )}

             <button 
               onClick={handleStart} 
               className={`p-2.5 rounded-2xl shadow-md transition-all duration-300 cubic-bezier(0.34,1.56,0.64,1) active:scale-95 
                 ${isActive 
                   ? (darkMode ? 'bg-orange-500 text-white shadow-black' : 'bg-orange-600 text-white shadow-orange-100/30') 
                   : (darkMode ? 'bg-emerald-500 text-white shadow-black' : 'bg-emerald-600 text-white shadow-emerald-100/30')
                 } border border-white/10`}
             >
                {isActive ? (
                  <Pause key="pause" size={16} fill="currentColor" strokeWidth={3} className="animate-in fade-in zoom-in duration-200" />
                ) : (
                  <Play key="play" size={16} fill="currentColor" strokeWidth={3} className="animate-in fade-in zoom-in duration-200" />
                )}
             </button>
          </div>
        </div>
      </div>
      <div className={`w-full h-1 ${darkMode ? 'bg-white/5' : 'bg-white/20'} flex-shrink-0`}>
        <div className={`h-full transition-all duration-1000 ${phase === 'work' ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${(timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 100}%` }} />
      </div>
    </div>
  );
};

export default MiniMode;
