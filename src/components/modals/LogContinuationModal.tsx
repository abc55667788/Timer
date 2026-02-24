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
      <div className={`${darkMode ? 'bg-zinc-900 border-none shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white ring-1 ring-emerald-100/50 shadow-2xl'} rounded-[2.5rem] p-8 max-w-lg w-full relative space-y-4`}>
        <button 
          onClick={handleCancelLogChoice} 
          className={`absolute top-5 right-5 p-2 rounded-xl transition-all active:scale-90 z-50 ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-emerald-400' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'}`}
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${darkMode ? 'bg-zinc-800 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
            <FileText size={24} />
          </div>
          <div className="text-center">
            <h3 className={`text-2xl font-black leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-emerald-950'}`}>Carry over this log?</h3>
          </div>
          <p className={`text-sm text-center leading-relaxed px-4 font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-600/80'}`}>
            {continuationDescription}
          </p>
        </div>
        <div className="space-y-2.5 pt-2">
          <button 
            onClick={handleContinueCurrentLog} 
            className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97] shadow-xl ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-black' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'} text-white`}
          >
            {continueButtonLabel}
          </button>
          <button 
            onClick={handleStartNewLog} 
            className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97] shadow-xl ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-black' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'} text-white`}
          >
            {startNewButtonLabel}
          </button>
        </div>
        <div className={`mt-2 text-[10px] font-bold text-center px-4 leading-normal italic ${darkMode ? 'text-zinc-600' : 'text-emerald-400/80'}`}>
          {continuationNote}
        </div>
      </div>
    </div>
  );
};

export default LogContinuationModal;
