import React from 'react';
import { X, Clock } from 'lucide-react';
import { PhasePrompt } from '../../types';

interface PhasePromptModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  phasePrompt: PhasePrompt;
  setPhasePrompt: (prompt: PhasePrompt | null) => void;
  handleContinuePhase: () => void;
  handleNextPhaseFromPrompt: () => void;
  handleExitAndSave: () => void;
  darkMode: boolean;
}

const PhasePromptModal: React.FC<PhasePromptModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  phasePrompt,
  setPhasePrompt,
  handleContinuePhase,
  handleNextPhaseFromPrompt,
  handleExitAndSave,
  darkMode,
}) => {
  const [autoContinueIn, setAutoContinueIn] = React.useState(60);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setAutoContinueIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinuePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleContinuePhase]);

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : (darkMode ? 'bg-black/80 backdrop-blur-sm' : 'bg-zinc-950/40 backdrop-blur-sm')} flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 border border-white/5 shadow-2xl shadow-black' : 'bg-white border-zinc-200/50 shadow-2xl'} rounded-[2.5rem] p-8 max-w-lg w-full relative space-y-6 transition-all`}>
        <button onClick={() => setPhasePrompt(null)} className={`absolute top-5 right-5 p-2.5 ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-white/5' : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'} rounded-xl transition-all active:scale-90 z-50`}><X size={18} /></button>
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${darkMode ? 'bg-zinc-800 text-emerald-400 border border-white/5 shadow-inner' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center`}>
            <Clock size={28} />
          </div>
          <div className="text-center">
            <p className={`text-[10px] font-black tracking-[0.2em] uppercase ${darkMode ? 'text-zinc-500' : 'text-emerald-500'} mb-2`}>Phase Complete</p>
            <h3 className={`text-2xl font-black ${darkMode ? 'text-zinc-100' : 'text-zinc-900'} leading-tight tracking-tight`}>
              {phasePrompt.kind === 'cycle-complete' ? 'Cycle Complete' : (phasePrompt.phase === 'work' ? 'Work phase finished' : 'Rest phase finished')}
            </h3>
          </div>
          <p className={`text-[13px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} text-center leading-relaxed px-2 font-medium`}>
            {phasePrompt.kind === 'cycle-complete'
              ? 'Work and rest are done. Save this log, continue it into another cycle, or roll straight into a fresh one.'
              : phasePrompt.kind === 'reminder'
                ? 'Ten minutes of overtime have passed. Decide whether to keep stretching this phase, move on, or wrap up.'
                : `The scheduled duration ended. Continue counting up, ${phasePrompt.phase === 'work' ? 'go rest' : 'go focus'}, or stop and save.`}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button 
            onClick={handleNextPhaseFromPrompt} 
            className={`w-full py-4 ${darkMode ? 'bg-emerald-600 hover:bg-emerald-500 shadow-black' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'} text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97]`}
          >
            {phasePrompt.phase === 'work' ? 'go rest' : 'go focus'}
          </button>
          
          <button 
            onClick={handleContinuePhase} 
            className={`w-full py-4 ${darkMode ? 'bg-emerald-600 hover:bg-emerald-500 shadow-black' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'} text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97] relative group overflow-hidden`}
          >
            <span className="relative z-10">Continue {phasePrompt.phase === 'work' ? 'focus' : 'rest'}</span>
            <div className={`absolute bottom-0 left-0 h-0.5 bg-white/20 transition-all duration-1000 ease-linear`} style={{ width: `${(autoContinueIn / 60) * 100}%` }} />
          </button>
          
          <button 
            onClick={handleExitAndSave} 
            className={`w-full py-4 ${darkMode ? 'bg-red-600 hover:bg-red-700 shadow-black' : 'bg-red-500 hover:bg-red-600 shadow-xl shadow-red-100/50'} text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97]`}
          >
            Stop & Save log
          </button>
        </div>

        <div className={`mt-2 text-[10px] font-bold ${darkMode ? 'text-zinc-600' : 'text-zinc-400'} text-center px-4 leading-normal italic flex flex-col gap-1`}>
          <div>
            {phasePrompt.kind === 'cycle-complete'
              ? 'Choose Go to work to set up the next block. We will ask if you want to keep this log rolling or start a new one.'
              : 'We will remind you again every 10 minutes while overtime stays active.'}
          </div>
          <div className="opacity-60">
            Auto-continuing in {autoContinueIn}s...
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhasePromptModal;
