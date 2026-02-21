import React from 'react';
import { Play, Pause, Square, Coffee, Briefcase, RotateCcw, Settings, Edit3, BookOpen } from 'lucide-react';
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
  isAndroid?: boolean;
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
  isAndroid,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full flex-1 min-h-full animate-in fade-in duration-500 relative scrollbar-none px-4 ${isAndroid ? 'py-4 pb-12' : 'py-8'}`}>
      {!isJournalOpen && (
        <div className={`absolute ${isAndroid ? 'top-2 right-2' : 'top-4 right-4 md:top-10 md:right-10'} z-[60]`}>
          <button 
            onClick={() => setIsJournalOpen(true)} 
            className={`${isAndroid ? 'p-2.5 rounded-2xl' : 'p-3 md:p-4 rounded-xl md:rounded-[1.5rem]'} bg-white/90 backdrop-blur-sm text-emerald-600 shadow-xl border border-emerald-50 hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 group`}
            title="Open Journal"
          >
            <BookOpen size={isAndroid ? 18 : 20} className="md:w-6 md:h-6 group-hover:scale-110 transition-transform"/>
          </button>
        </div>
      )}

      <div className={`flex flex-col items-center gap-6 md:gap-12 w-full max-w-lg ${isAndroid ? 'py-1' : 'py-4'}`}>
        <div className={`flex flex-col items-center gap-4 md:gap-8 ${isAndroid ? 'mt-0' : 'mt-2 md:mt-0'}`}>
          <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100/50">
            <div className={`w-2 h-2 rounded-full ${phase === 'work' ? 'bg-emerald-500' : 'bg-emerald-400'} ${isActive ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">{isActive ? (phase === 'work' ? 'Focusing' : 'Resting') : 'Idle'}</span>
          </div>

          <div onClick={() => setShowLoggingModal(true)} className="relative group cursor-pointer active:scale-[0.98] transition-all">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
            <svg className={`${isAndroid ? 'w-64 h-64' : 'w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80'} -rotate-90`} viewBox="0 0 300 300">
              <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-50" />
              <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 135} strokeDashoffset={(2 * Math.PI * 135) - ((timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 2 * Math.PI * 135)}
                className="text-emerald-500 transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl rounded-full m-3.5 md:m-5 shadow-2xl border border-white/40 overflow-hidden ring-1 ring-emerald-50/10">
              <div className="absolute inset-0 rounded-full bg-emerald-50/0 group-hover:bg-emerald-50/90 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-[2px] z-20">
                <Edit3 size={32} className="text-emerald-600 mb-3" />
                <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest">Edit Session</span>
              </div>
              
              <span className={`font-mono font-bold tabular-nums z-10 tracking-tighter ${isAndroid ? 'text-4xl' : 'text-3xl md:text-6xl'}`}>{formatTime(displayTime)}</span>
              {isOvertime && <span className={`text-orange-500 font-bold ${isAndroid ? 'text-[11px]' : 'text-xs'} animate-pulse mt-0.5 font-mono z-10`}>+{formatTime(overtimeSeconds)}</span>}
              <div className={`mt-3 px-3 py-1 bg-emerald-50/50 rounded-lg text-black/40 text-[9px] font-black uppercase tracking-[0.15em] truncate z-10 ${isAndroid ? 'max-w-[140px]' : 'max-w-[110px] md:max-w-[160px]'}`}>
                {currentTask.category}
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-4 md:gap-6 ${isAndroid ? 'mb-4' : 'mb-8 md:mb-0'}`}>
          {isCurrentlyRecording && (
            <button 
              onClick={handleStopClick} 
              className={`${isAndroid ? 'w-12 h-12' : 'w-10 h-10 md:w-13 md:h-13'} rounded-full bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ease-in-out shadow-sm border border-emerald-100 flex items-center justify-center group active:scale-90 animate-in fade-in slide-in-from-right-8 duration-500`}
            >
              <Square size={isAndroid ? 18 : 16} fill="currentColor" className="group-hover:scale-90 transition-transform"/>
            </button>
          )}

          <button 
            onClick={handleStart} 
            className={`flex items-center justify-center transition-[background-color,border-radius,box-shadow,transform] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xl active:scale-90 
              ${isAndroid ? 'w-20 h-20 shadow-emerald-500/10' : 'w-16 h-16 md:w-20 md:h-20'} 
              ${isActive 
                ? 'text-white bg-orange-600 shadow-orange-200/50 rounded-[1.4rem]' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50 rounded-[50%]'
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
              className={`${isAndroid ? 'w-12 h-12' : 'w-11 h-11 md:w-13 md:h-13'} rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center animate-in fade-in slide-in-from-left-8 duration-500`} 
              title={phase === 'work' ? 'Start Rest' : 'Start Work'}
            >
              {phase === 'work' ? <Coffee size={isAndroid ? 20 : 18} /> : <Briefcase size={isAndroid ? 20 : 18} />}
            </button>
          )}

          {isOvertime && (
            <button 
              onClick={handleSkipToNextPhase} 
              className={`${isAndroid ? 'w-12 h-12' : 'w-11 h-11 md:w-13 md:h-13'} rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center animate-in fade-in slide-in-from-left-8 duration-500`} 
              title="Next Phase"
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
