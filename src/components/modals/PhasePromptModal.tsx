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
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : (darkMode ? 'bg-black/80 backdrop-blur-sm' : 'bg-zinc-950/40 backdrop-blur-sm')} flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 border border-white/5 shadow-2xl shadow-black' : 'bg-white border-zinc-200/50 shadow-2xl'} rounded-[2.5rem] p-8 max-w-sm w-full relative space-y-6 transition-all`}>
        <button onClick={() => setPhasePrompt(null)} className={`absolute top-5 right-5 p-2.5 ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-white/5' : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600'} rounded-xl transition-all active:scale-90 z-50`}><X size={18} /></button>
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-zinc-800 text-emerald-400 border border-white/5 shadow-inner' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center`}>
            <Clock size={32} />
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
                : 'The scheduled duration ended. Continue counting up, enter the next phase, or stop and save.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            onClick={handleContinuePhase} 
            className={`w-full py-4.5 ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-emerald-500 hover:text-white border border-white/5' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'} text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97]`}
          >
            Continue current phase
          </button>
          <button 
            onClick={handleNextPhaseFromPrompt} 
            className={`w-full py-4.5 ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-emerald-500 hover:text-white border border-white/5' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'} text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97]`}
          >
            {phasePrompt.phase === 'work' ? 'Go to rest' : 'Go to work'}
          </button>
          <div className={`h-px w-full ${darkMode ? 'bg-white/5' : 'bg-zinc-100'} my-2`} />
          <button 
            onClick={handleExitAndSave} 
            className={`w-full py-4.5 ${darkMode ? 'bg-zinc-900 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 border border-white/5' : 'bg-white text-red-500 border-red-100 hover:bg-red-50'} text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97]`}
          >
            Stop & Save log
          </button>
        </div>

        <div className={`mt-2 text-[10px] font-bold ${darkMode ? 'text-zinc-600' : 'text-zinc-400'} text-center px-4 leading-normal italic`}>
          {phasePrompt.kind === 'cycle-complete'
            ? 'Choose Go to work to set up the next block. We will ask if you want to keep this log rolling or start a new one.'
            : 'We will remind you again every 10 minutes while overtime stays active.'}
        </div>
      </div>
    </div>
  );
};

export default PhasePromptModal;
