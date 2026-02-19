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
}

const PhasePromptModal: React.FC<PhasePromptModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  phasePrompt,
  setPhasePrompt,
  handleContinuePhase,
  handleNextPhaseFromPrompt,
  handleExitAndSave,
}) => {
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[175] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative space-y-5 ring-1 ring-emerald-100/50">
        <button onClick={() => setPhasePrompt(null)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
            <Clock size={20} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Phase Complete</p>
            <h3 className="text-xl font-black text-emerald-950 leading-tight">
              {phasePrompt.kind === 'cycle-complete' ? 'Cycle Complete' : (phasePrompt.phase === 'work' ? 'Work phase finished' : 'Rest phase finished')}
            </h3>
          </div>
          <p className="text-xs text-emerald-500/80 text-center leading-relaxed px-2">
            {phasePrompt.kind === 'cycle-complete'
              ? 'Work and rest are done. Save this log, continue it into another cycle, or roll straight into a fresh one.'
              : phasePrompt.kind === 'reminder'
                ? 'Ten minutes of overtime have passed. Decide whether to keep stretching this phase, move on, or wrap up.'
                : 'The scheduled duration ended. Continue counting up, enter the next phase, or stop and save.'}
          </p>
        </div>
        <div className="space-y-2.5 pt-2">
          <button 
            onClick={handleContinuePhase} 
            className="w-full py-3.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.97]"
          >
            Continue current phase
          </button>
          <button 
            onClick={handleNextPhaseFromPrompt} 
            className="w-full py-3.5 bg-white border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
          >
            {phasePrompt.phase === 'work' ? 'Go to rest' : 'Go to work'}
          </button>
          <button 
            onClick={handleExitAndSave} 
            className="w-full py-3.5 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-[0.97]"
          >
            Save & exit
          </button>
        </div>
        <div className="mt-2 text-[10px] font-bold text-emerald-400/80 text-center px-4 leading-normal italic">
          {phasePrompt.kind === 'cycle-complete'
            ? 'Choose Go to work to set up the next block. We will ask if you want to keep this log rolling or start a new one.'
            : 'We will remind you again every 10 minutes while overtime stays active.'}
        </div>
      </div>
    </div>
  );
};

export default PhasePromptModal;
