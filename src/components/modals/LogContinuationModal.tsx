import React from 'react';
import { X, FileText } from 'lucide-react';

interface LogContinuationModalProps {
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
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative space-y-5 ring-1 ring-emerald-100/50">
        <button onClick={handleCancelLogChoice} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
            <FileText size={20} />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold tracking-tight text-emerald-400 mb-1">Log Decision</p>
            <h3 className="text-2xl font-black text-emerald-950 leading-tight tracking-tight">Carry over this log?</h3>
          </div>
          <p className="text-sm text-emerald-600/80 text-center leading-relaxed px-2 font-bold">
            {continuationDescription}
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <button 
            onClick={handleContinueCurrentLog} 
            className="w-full py-4 bg-emerald-600 text-white text-xs font-black tracking-tight rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.97]"
          >
            {continueButtonLabel}
          </button>
          <button 
            onClick={handleStartNewLog} 
            className="w-full py-4 bg-white border border-emerald-100 text-emerald-700 text-xs font-black tracking-tight rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
          >
            {startNewButtonLabel}
          </button>
        </div>
        <div className="mt-2 text-[11px] font-bold text-emerald-400/80 text-center px-4 leading-normal italic">
          {continuationNote}
        </div>
      </div>
    </div>
  );
};

export default LogContinuationModal;
