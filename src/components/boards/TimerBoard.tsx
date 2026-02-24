import React from 'react';
import { Play, Pause, Square, Coffee, Briefcase, RotateCcw, Settings, Edit3, Library } from 'lucide-react';
import { Category, TimerPhase, Task } from '../../types';
import { formatTime } from '../../utils/time';

interface TimerBoardProps {
  phase: TimerPhase;
  isActive: boolean;
  timeLeft: number;
  settings: { workDuration: number; restDuration: number };
  displayTime: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  currentTask: Task;
  isCurrentlyRecording: boolean;
  handleStart: () => void;
  handleStopClick: () => void;
  handleSkipToNextPhase: () => void;
  handleSetupClick: () => void;
  setShowLoggingModal: (show: boolean) => void;
  isJournalOpen: boolean;
  setIsJournalOpen: (val: boolean) => void;
  getCategoryColor: (cat: Category) => string;
  getCategoryIcon: (cat: Category) => any;
  isAndroid?: boolean;
  darkMode: boolean;
}

const TimerBoard: React.FC<TimerBoardProps> = ({
  phase,
  isActive,
  timeLeft,
  settings,
  displayTime,
  isOvertime,
  overtimeSeconds,
  currentTask,
  isCurrentlyRecording,
  handleStart,
  handleStopClick,
  handleSkipToNextPhase,
  handleSetupClick,
  setShowLoggingModal,
  isJournalOpen,
  setIsJournalOpen,
  getCategoryColor,
  getCategoryIcon,
  isAndroid,
  darkMode,
}) => {
  const catColor = getCategoryColor(currentTask.category);
  const CatIcon = getCategoryIcon(currentTask.category);

  return (
    <div className={`flex flex-col items-center justify-center w-full flex-1 min-h-full animate-in fade-in duration-500 relative scrollbar-none px-4 ${isAndroid ? 'py-4 pb-12' : 'py-8'}`}>
      {!isJournalOpen && (
        <div className={`absolute ${isAndroid ? 'top-2 right-2' : 'top-4 right-4 md:top-10 md:right-10'} z-[60]`}>
          <button 
            onClick={() => setIsJournalOpen(true)} 
            className={`${isAndroid ? 'p-3 rounded-2xl' : 'p-3.5 md:p-5 rounded-2xl md:rounded-[1.5rem]'} ${darkMode ? 'bg-zinc-900/80 text-zinc-400 border-white/5 hover:text-emerald-500 hover:bg-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white/95 text-emerald-600 border-emerald-50 shadow-[0_12px_44px_-8px_rgba(0,0,0,0.15)] hover:bg-emerald-600 hover:text-white hover:border-emerald-600'} backdrop-blur-md transition-all duration-300 active:scale-95 group border`}
            title="Open Journal"
          >
            <Library size={isAndroid ? 18 : 22} className="group-hover:rotate-6 group-hover:scale-110 transition-transform"/>
          </button>
        </div>
      )}

      <div className={`flex flex-col items-center gap-6 md:gap-12 w-full max-w-lg ${isAndroid ? 'py-1' : 'py-4'}`}>
        <div className={`flex flex-col items-center gap-4 md:gap-8 ${isAndroid ? 'mt-0' : 'mt-2 md:mt-0'}`}>
          <div className={`flex items-center gap-2 px-5 py-2 ${darkMode ? 'bg-zinc-900 border-white/5 shadow-inner' : 'bg-emerald-50 border-emerald-100/50 shadow-sm'} rounded-full border`}>
            <div className={`w-2 h-2 rounded-full ${phase === 'work' ? (darkMode ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]') : (darkMode ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]')} ${isActive ? 'animate-pulse' : ''}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-zinc-500' : 'text-emerald-700'}`}>{isActive ? (phase === 'work' ? 'Focusing' : 'Resting') : 'Idle'}</span>
          </div>

          <div onClick={() => setShowLoggingModal(true)} className="relative group cursor-pointer active:scale-[0.98] transition-all">
            <div className={`absolute inset-0 ${darkMode ? 'bg-emerald-400/5' : 'bg-emerald-100/30'} rounded-full blur-[24px] opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <svg className={`${isAndroid ? 'w-64 h-64' : 'w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80'} -rotate-90`} viewBox="0 0 300 300">
              <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="6" fill="transparent" className={darkMode ? 'text-white/5' : 'text-emerald-50'} />
              <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="10" fill="transparent" 
                strokeDasharray={2 * Math.PI * 135} strokeDashoffset={(2 * Math.PI * 135) - ((timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 2 * Math.PI * 135)}
                className={`text-emerald-500 transition-all duration-1000 ease-linear`}
                strokeLinecap="round"
              />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${darkMode ? 'bg-zinc-950/40 text-emerald-50 shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-white/60 text-slate-800'} backdrop-blur-3xl rounded-full m-3.5 md:m-5 shadow-2xl border ${darkMode ? 'border-white/10' : 'border-white/40'} overflow-hidden`}>
              <div className={`absolute inset-0 rounded-full ${darkMode ? 'bg-zinc-900/90' : 'bg-emerald-50/90'} flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-[6px] z-20`}>
                <Edit3 size={32} className={`${darkMode ? 'text-emerald-500' : 'text-emerald-600'} mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-in zoom-in-50 duration-300`} />
                <span className={`text-[10px] md:text-[11px] font-black ${darkMode ? 'text-emerald-500 font-bold' : 'text-emerald-600'} uppercase tracking-[0.2em]`}>Edit Session</span>
              </div>
              
              <span className={`font-mono font-bold tabular-nums z-10 tracking-tighter ${isAndroid ? 'text-4xl' : 'text-3xl md:text-6xl'} ${darkMode ? 'text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.4)]' : ''}`}>{formatTime(displayTime)}</span>
              {isOvertime && <span className={`text-orange-400 font-bold ${isAndroid ? 'text-[11px]' : 'text-xs'} animate-pulse mt-0.5 font-mono z-10 drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]`}>+{formatTime(overtimeSeconds)}</span>}
              <div 
                className={`mt-3 px-3 py-1 flex items-center gap-1.5 ${darkMode ? \'bg-zinc-900 border border-white/5 shadow-inner text-emerald-400\' : \'bg-white border border-emerald-50 shadow-sm text-emerald-600\'} rounded-[0.85rem] z-10 ${isAndroid ? \'max-w-[140px]\' : \'max-w-[110px] md:max-w-[160px]\'}`}
              >
                <CatIcon size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate">
                  {currentTask.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-4 md:gap-6 ${isAndroid ? 'mb-4' : 'mb-8 md:mb-0'}`}>
          {isCurrentlyRecording && (
            <button 
              onClick={handleStopClick} 
              className={`${isAndroid ? 'w-12 h-12' : 'w-11 h-11 md:w-13 md:h-13'} rounded-full ${darkMode ? 'bg-zinc-800 text-white border-white/5 hover:bg-red-500 shadow-black/40' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-500 shadow-sm'} transition-all duration-300 ease-in-out border flex items-center justify-center group active:scale-90 animate-in fade-in slide-in-from-right-8 duration-500`}
            >
              <Square size={isAndroid ? 18 : 16} fill="currentColor" className="group-hover:scale-110 transition-transform"/>
            </button>
          )}

          <button 
            onClick={handleStart} 
            className={`flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl
              ${isAndroid ? 'w-20 h-20' : 'w-16 h-16 md:w-20 md:h-20'} 
              ${isActive 
                ? (darkMode ? 'text-white bg-orange-500 border-white/10 hover:bg-orange-400 rounded-[1.4rem] shadow-orange-500/30' : 'text-white bg-orange-600 shadow-orange-200/50 hover:bg-orange-700 hover:scale-105 rounded-[1.4rem]') 
                : (darkMode ? 'bg-emerald-500 text-white rounded-[50%] border-white/10 hover:bg-emerald-400 hover:scale-105 shadow-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-emerald-200/50 rounded-[50%]')
              }`}
          >
            {isActive ? (
              <Pause key="pause" size={isAndroid ? 32 : 28} fill="currentColor" className="animate-in fade-in zoom-in spin-in-12 duration-500" />
            ) : (
              <Play key="play" size={isAndroid ? 32 : 28} fill="currentColor" className="ml-1 animate-in fade-in zoom-in spin-in-12 duration-500" />
            )}
          </button>

          {!isOvertime && isCurrentlyRecording && (
            <button 
              onClick={handleSkipToNextPhase} 
              className={`${isAndroid ? 'w-12 h-12' : 'w-11 h-11 md:w-13 md:h-13'} rounded-full ${darkMode ? 'bg-zinc-800 text-white border-white/5 hover:bg-emerald-500 shadow-black/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm'} transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center animate-in fade-in slide-in-from-left-8 duration-500`} 
              title={phase === 'work' ? 'go rest' : 'go focus'}
            >
              {phase === 'work' ? <Coffee size={isAndroid ? 20 : 18} /> : <Briefcase size={isAndroid ? 20 : 18} />}
            </button>
          )}

          {isOvertime && (
            <button 
              onClick={handleSkipToNextPhase} 
              className={`${isAndroid ? 'w-12 h-12' : 'w-11 h-11 md:w-13 md:h-13'} rounded-full ${darkMode ? 'bg-zinc-800 text-white border-white/5 hover:bg-emerald-500 shadow-black/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm'} transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center animate-in fade-in slide-in-from-left-8 duration-500`} 
              title={phase === 'work' ? 'go rest' : 'go focus'}
            >
              <RotateCcw size={isAndroid ? 20 : 18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerBoard;
