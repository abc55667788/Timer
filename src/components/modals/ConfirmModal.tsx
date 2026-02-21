import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  setShowConfirmModal: (show: any) => void;
  confirmAction: (save: boolean) => void;
  darkMode: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  setShowConfirmModal,
  confirmAction,
  darkMode,
}) => {
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : (darkMode ? 'bg-black/60 backdrop-blur-xl' : 'bg-emerald-900/70 backdrop-blur-xl')} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white shadow-2xl ring-1 ring-emerald-100/50'} rounded-[2.5rem] p-10 max-w-sm w-full text-center relative overflow-hidden transition-all`} style={{ WebkitAppRegion: 'drag' } as any}>
        <div style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => setShowConfirmModal(null)} className={`absolute top-5 right-5 p-2.5 ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700 shadow-lg shadow-black/40 border border-white/5' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'} rounded-xl transition-all active:scale-90 z-50`}><X size={18} /></button>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 ${darkMode ? 'bg-zinc-800 text-red-500 border border-white/5 shadow-inner' : 'bg-red-50 text-red-500 shadow-inner'}`}><AlertCircle size={32} /></div>
          <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-emerald-950'} tracking-tight`}>End Session?</h2>
          <p className={`text-[10px] ${darkMode ? 'text-emerald-400/80 font-black' : 'text-emerald-400 font-black'} uppercase tracking-[0.3em] mb-10`}>Save or discard your progress</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => confirmAction(true)} 
              className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.97] text-[11px] ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 shadow-black/40 border border-white/5' : 'bg-emerald-600 text-white'}`}
            >
              Save Activity
            </button>
            <button 
              onClick={() => confirmAction(false)} 
              className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest active:scale-[0.97] text-[11px] transition-all ${darkMode ? 'bg-zinc-800 text-white hover:bg-red-500 shadow-black/40 border border-white/5' : 'bg-white text-red-500 border-2 border-red-50 hover:bg-red-50'}`}
            >
              Discard
            </button>
          </div>
          <p className={`text-[9px] ${darkMode ? 'text-white/20' : 'text-emerald-400/60'} font-bold px-4 mt-8 italic`}>Work time under 1 minute will be automatically discarded.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
