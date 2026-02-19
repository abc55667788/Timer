import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  setShowConfirmModal: (show: any) => void;
  confirmAction: (save: boolean) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  setShowConfirmModal,
  confirmAction,
}) => {
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl ring-1 ring-emerald-100/50 relative" style={{ WebkitAppRegion: 'drag' } as any}>
        <div style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => setShowConfirmModal(null)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 text-red-500 shadow-inner`}><AlertCircle size={32} /></div>
          <h2 className="text-xl font-black mb-1 text-emerald-950 tracking-tight">End Session?</h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-7">Save or discard your progress</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => confirmAction(true)} className="w-full py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-lg bg-emerald-600 text-white active:scale-[0.97] text-xs">Save Activity</button>
            <button onClick={() => confirmAction(false)} className="w-full py-3.5 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-[0.97] text-xs hover:bg-red-50 transition-colors">Discard</button>
          </div>
          <p className="text-[9px] text-emerald-400/60 font-medium px-4 mt-6">Work time under 1 minute will be automatically discarded.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
