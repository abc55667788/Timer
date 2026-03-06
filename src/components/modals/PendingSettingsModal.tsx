import React from 'react';
import { Clock } from 'lucide-react';

interface PendingSettingsModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  pendingSettingsChange: {
    workDuration: number;
    restDuration: number;
    mode: 'restart-only' | 'save-or-continue';
    elapsed: number;
    phase: 'work' | 'rest';
  };
  handleSettingsSaveDecision: (decide: 'restart' | 'continue' | 'cancel') => void;
  darkMode?: boolean;
}

const PendingSettingsModal: React.FC<PendingSettingsModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  pendingSettingsChange,
  handleSettingsSaveDecision,
  darkMode,
}) => {
  const elapsedMinutes = Math.floor(pendingSettingsChange.elapsed / 60);
  const elapsedSeconds = pendingSettingsChange.elapsed % 60;

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[210] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 text-white ring-white/10' : 'bg-white text-emerald-950 ring-emerald-100/50'} rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 text-center`} style={{ WebkitAppRegion: 'drag' } as any}>
        <div style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${darkMode ? 'bg-zinc-800' : 'bg-emerald-50'}`}>
            <Clock size={24} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
          </div>
          <h2 className={`text-xl font-bold mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-emerald-950'}`}>Update Timer?</h2>
          <p className={`text-[10px] font-bold tracking-tight mb-3 ${darkMode ? 'text-emerald-400/80' : 'text-emerald-500'}`}>Session in progress</p>
          <p className={`text-[11px] font-bold tracking-[0.2em] mb-3 underline decoration-2 underline-offset-4 ${darkMode ? 'text-emerald-400 decoration-white/10' : 'text-emerald-400 decoration-emerald-100'}`}>
            {pendingSettingsChange.workDuration / 60}m  {pendingSettingsChange.restDuration / 60}m
          </p>
          <p className={`text-[11px] font-bold mb-6 ${darkMode ? 'text-zinc-300' : 'text-emerald-700'}`}>
            Elapsed: {elapsedMinutes}:{elapsedSeconds.toString().padStart(2, '0')}
          </p>
          <p className={`text-[11px] font-bold mb-6 ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
            {pendingSettingsChange.mode === 'restart-only'
              ? 'New duration is shorter than elapsed time. Save and restart is required.'
              : 'Save and restart, or save and continue from current elapsed progress.'}
          </p>
          <div className="space-y-3">
            <button onClick={() => handleSettingsSaveDecision('restart')} className="w-full py-3.5 bg-emerald-600 text-white font-bold tracking-tight rounded-2xl shadow-lg active:scale-[0.97] transition-all text-xs">Save & Restart</button>
            {pendingSettingsChange.mode === 'save-or-continue' ? (
              <button onClick={() => handleSettingsSaveDecision('continue')} className={`w-full py-3.5 font-bold tracking-tight rounded-2xl shadow-sm active:scale-[0.97] transition-all text-xs ${darkMode ? 'bg-zinc-800 border border-white/10 text-emerald-300' : 'bg-white border border-emerald-100 text-emerald-700'}`}>Save & Continue</button>
            ) : (
              <button onClick={() => handleSettingsSaveDecision('cancel')} className={`w-full py-3.5 font-bold tracking-tight rounded-2xl shadow-sm active:scale-[0.97] transition-all text-xs ${darkMode ? 'bg-zinc-800 border border-white/10 text-zinc-200' : 'bg-white border border-emerald-100 text-emerald-700'}`}>Keep current</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingSettingsModal;
