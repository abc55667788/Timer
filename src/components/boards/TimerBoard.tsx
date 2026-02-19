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
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10 w-full h-full animate-in fade-in duration-500 relative">
      {!isJournalOpen && (
        <div className="absolute top-10 right-10">
          <button 
            onClick={() => setIsJournalOpen(true)} 
            className="p-4 rounded-[1.5rem] bg-white text-emerald-600 shadow-xl border border-emerald-50 hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 group"
            title="Open Journal"
          >
            <BookOpen size={24} className="group-hover:scale-110 transition-transform"/>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100/50">
        <div className={`w-2 h-2 rounded-full ${phase === 'work' ? 'bg-emerald-500' : 'bg-emerald-400'} ${isActive ? 'animate-pulse' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">{isActive ? (phase === 'work' ? 'Focusing' : 'Resting') : 'Idle'}</span>
      </div>

      <div onClick={() => setShowLoggingModal(true)} className="relative group cursor-pointer active:scale-[0.98] transition-all">
        <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
        <svg className="w-80 h-80 -rotate-90" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-50" />
          <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={2 * Math.PI * 135} strokeDashoffset={(2 * Math.PI * 135) - ((timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 2 * Math.PI * 135)}
            className="text-emerald-500 transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-5 shadow-2xl border border-emerald-50 overflow-hidden ring-1 ring-emerald-50/50">
          <div className="absolute inset-0 rounded-full bg-emerald-50/0 group-hover:bg-emerald-50/90 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-[2px] z-20">
            <Edit3 size={36} className="text-emerald-600 mb-3" />
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Edit Session</span>
          </div>
          
          <span className="text-6xl font-mono font-bold tabular-nums z-10 tracking-tighter">{formatTime(displayTime)}</span>
          {isOvertime && <span className="text-orange-500 font-bold text-xs animate-pulse mt-1 font-mono z-10">+{formatTime(overtimeSeconds)}</span>}
          <div className="mt-4 px-3 py-1 bg-emerald-50/50 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] truncate max-w-[160px] z-10">
            {currentTask.category}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 h-24">
        {isCurrentlyRecording && (
          <button onClick={handleStopClick} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ease-in-out shadow-sm border border-emerald-100 flex items-center justify-center group active:scale-90">
            <Square size={20} fill="currentColor" className="group-hover:scale-90 transition-transform"/>
          </button>
        )}
        {!isOvertime && isCurrentlyRecording && (
          <button onClick={handleSkipToNextPhase} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center" title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
            {phase === 'work' ? <Coffee size={20} /> : <Briefcase size={20} />}
          </button>
        )}
        {isOvertime && (
          <button onClick={handleSkipToNextPhase} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center" title="Next Phase">
            <RotateCcw size={20} />
          </button>
        )}
        <button onClick={handleStart} className={`flex items-center justify-center transition-all duration-300 ease-in-out shadow-xl active:scale-95 ${isActive ? 'w-20 h-20 rounded-3xl text-white bg-orange-500 shadow-orange-100' : 'w-16 h-16 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}>
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default TimerBoard;
