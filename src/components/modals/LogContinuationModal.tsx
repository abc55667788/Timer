import React from 'react';
import { X, FileText } from 'lucide-react';

interface LogContinuationModalProps {
  darkMode: boolean;
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  handleCancelLogChoice: () => void;
  continuationDescription: string;
  handleContinueCurrentLog: () => void;
  continueButtonLabel: string;
  handleStartNewLog: () => void;
  startNewButtonLabel: string;
  continuationNote: string;
}

const LogContinuationModal: React.FC<LogContinuationModalProps> = ({
  darkMode,
  wasMiniModeBeforeModal,
  isMiniMode,
  handleCancelLogChoice,
  continuationDescription,
  handleContinueCurrentLog,
  continueButtonLabel,
  handleStartNewLog,
  startNewButtonLabel,
  continuationNote,
}) => {
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-zinc-950/80 backdrop-blur-md' : (wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 border-none shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white ring-1 ring-emerald-100/50 shadow-2xl'} rounded-[2rem] p-7 max-w-sm w-full relative space-y-5`}>
        <button 
          onClick={handleCancelLogChoice} 
          className={`absolute top-4 right-4 p-2 rounded-full transition-all active:scale-90 z-50 ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-orange-500' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'}`}
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${darkMode ? 'bg-zinc-800 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
            <FileText size={20} />
          </div>
          <div className="text-center">
            <p className={`text-[12px] font-bold tracking-tight mb-1 ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>Log Decision</p>
            <h3 className={`text-2xl font-black leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-emerald-950'}`}>Carry over this log?</h3>
          </div>
          <p className={`text-sm text-center leading-relaxed px-2 font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-600/80'}`}>
            {continuationDescription}
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <button 
            onClick={handleContinueCurrentLog} 
            className={`w-full py-4 text-xs font-black tracking-tight rounded-2xl transition-all active:scale-[0.97] ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 border border-white/5' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'}`}
          >
            {continueButtonLabel}
          </button>
          <button 
            onClick={handleStartNewLog} 
            className={`w-full py-4 text-xs font-black tracking-tight rounded-2xl transition-all active:scale-[0.97] ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-white hover:text-zinc-950 border border-white/5' : 'bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50'}`}
          >
            {startNewButtonLabel}
          </button>
        </div>
        <div className={`mt-2 text-[11px] font-bold text-center px-4 leading-normal italic ${darkMode ? 'text-zinc-600' : 'text-emerald-400/80'}`}>
          {continuationNote}
        </div>
      </div>
    </div>
  );
};

export default LogContinuationModal;
