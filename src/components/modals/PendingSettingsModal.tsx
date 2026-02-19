import React from 'react';
import { Clock } from 'lucide-react';

interface PendingSettingsModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  pendingSettingsChange: { workDuration: number; restDuration: number };
  handleSettingsSaveDecision: (decide: boolean) => void;
}

const PendingSettingsModal: React.FC<PendingSettingsModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  pendingSettingsChange,
  handleSettingsSaveDecision,
}) => {
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[210] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50 text-center" style={{ WebkitAppRegion: 'drag' } as any}>
        <div style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-4">
            <Clock size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-emerald-950 mb-2 tracking-tight">Update Timer?</h2>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500 mb-3">Session in progress</p>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6">
            {pendingSettingsChange.workDuration / 60}m  {pendingSettingsChange.restDuration / 60}m
          </p>
          <div className="space-y-3">
            <button onClick={() => handleSettingsSaveDecision(true)} className="w-full py-3.5 bg-emerald-600 text-white font-black uppercase tracking-[0.15em] rounded-2xl shadow-lg active:scale-[0.97] transition-all text-xs">Save & Restart</button>
            <button onClick={() => handleSettingsSaveDecision(false)} className="w-full py-3.5 bg-white border border-emerald-100 text-emerald-700 font-black uppercase tracking-[0.15em] rounded-2xl shadow-sm active:scale-[0.97] transition-all text-xs">Keep current</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingSettingsModal;
