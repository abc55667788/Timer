import React from 'react';
import { 
  X, Settings, Clock, Palette, Timer as TimerIcon, 
  AlertCircle, CheckCircle2, Globe, Key, Database, RefreshCw, 
  Download, Upload, Cloud
} from 'lucide-react';
import { Category, CATEGORIES, DEFAULT_CATEGORY_DATA, NotificationStatus } from '../../types';

interface SetupModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  tempWorkMin: string;
  tempRestMin: string;
  setTempWorkMin: (val: string) => void;
  setTempRestMin: (val: string) => void;
  categoryColors: Record<Category, string>;
  setCategoryColors: (colors: Record<Category, string> | ((prev: Record<Category, string>) => Record<Category, string>)) => void;
  notificationPermission: NotificationStatus;
  requestNotificationPermission: (showPreview?: boolean) => void;
  gitlabConfig: { url: string; token: string; projectId: string; branch: string; filename: string };
  setGitlabConfig: (config: any) => void;
  isSyncing: boolean;
  syncFromGitLab: () => void;
  syncToGitLab: () => void;
  lastSyncedAt: string | null;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleApplySettings: () => void;
  closeSettingsWithoutSaving: () => void;
}

const SetupModal: React.FC<SetupModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  tempWorkMin,
  tempRestMin,
  setTempWorkMin,
  setTempRestMin,
  categoryColors,
  setCategoryColors,
  notificationPermission,
  requestNotificationPermission,
  gitlabConfig,
  setGitlabConfig,
  isSyncing,
  syncFromGitLab,
  syncToGitLab,
  lastSyncedAt,
  exportData,
  importData,
  handleApplySettings,
  closeSettingsWithoutSaving,
}) => {
  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} className="scrollbar-none overflow-y-auto max-h-[80vh]">
           <button onClick={closeSettingsWithoutSaving} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>
           <h2 className="text-xl font-black text-emerald-950 mb-7 tracking-tight flex items-center gap-3"><Settings size={22} className="text-emerald-500" /> Preferences</h2>
           <div className="space-y-6">
              <section>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Palette size={14}/> Tag Colors</h3>
                 <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                    <div className="grid grid-cols-2 gap-3">
                       {CATEGORIES.map(cat => (
                         <div key={cat} className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-emerald-50 group">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg text-emerald-600 transition-colors" style={{ backgroundColor: `${categoryColors[cat]}15` }}>
                                {React.createElement(DEFAULT_CATEGORY_DATA[cat].icon, {size: 14})}
                              </div>
                              <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">{cat}</span>
                            </div>
                            <input 
                              type="color" 
                              value={categoryColors[cat]} 
                              onChange={(e) => setCategoryColors(prev => ({ ...prev, [cat]: e.target.value }))}
                              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none appearance-none overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg"
                            />
                         </div>
                       ))}
                    </div>
                 </div>
              </section>
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><TimerIcon size={14}/> Notifications</h3>
                <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                   <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${notificationPermission === 'granted' ? 'bg-emerald-50 text-emerald-600' : notificationPermission === 'denied' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                            {notificationPermission === 'granted' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                               {notificationPermission}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-tighter ${notificationPermission === 'denied' ? 'text-red-400' : 'text-emerald-400'}`}>
                               {notificationPermission === 'granted' ? 'Active' : notificationPermission === 'denied' ? 'Blocked' : 'Request'}
                            </span>
                         </div>
                      </div>
                      <button 
                        onClick={() => requestNotificationPermission(true)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all ${notificationPermission === 'denied' ? 'bg-white border border-red-100 text-red-500' : 'bg-emerald-600 text-white'}`}
                      >
                         {notificationPermission === 'denied' ? 'Refresh' : notificationPermission === 'granted' ? 'Test' : 'Enable'}
                      </button>
                   </div>
                </div>
              </section>
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Cloud size={14}/> GitLab Cloud Sync</h3>
                <div className="bg-emerald-50/30 p-5 rounded-[2rem] border border-emerald-50 space-y-4">
                   <div className="space-y-3">
                      <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Globe size={12} /></div>
                         <input 
                            type="text" 
                            placeholder="GitLab URL (e.g. https://gitlab.com)"
                            value={gitlabConfig.url}
                            onChange={(e) => setGitlabConfig({...gitlabConfig, url: e.target.value})}
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                         />
                      </div>
                      <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Key size={12} /></div>
                         <input 
                            type="password" 
                            placeholder="Personal Access Token"
                            value={gitlabConfig.token}
                            onChange={(e) => setGitlabConfig({...gitlabConfig, token: e.target.value})}
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                         />
                      </div>
                      <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Database size={12} /></div>
                         <input 
                            type="text" 
                            placeholder="Project Path or ID (e.g. username/repo)"
                            value={gitlabConfig.projectId}
                            onChange={(e) => setGitlabConfig({...gitlabConfig, projectId: e.target.value})}
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <input 
                            type="text" 
                            placeholder="Branch (main)"
                            value={gitlabConfig.branch}
                            onChange={(e) => setGitlabConfig({...gitlabConfig, branch: e.target.value})}
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-[10px] font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                         />
                         <input 
                            type="text" 
                            placeholder="File (data.json)"
                            value={gitlabConfig.filename}
                            onChange={(e) => setGitlabConfig({...gitlabConfig, filename: e.target.value})}
                            className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-[10px] font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                         />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        disabled={isSyncing}
                        onClick={syncFromGitLab}
                        className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group disabled:opacity-50"
                      >
                         <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14}/>}
                         </div>
                         <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Pull Restored</span>
                      </button>
                      <button 
                        disabled={isSyncing}
                        onClick={syncToGitLab}
                        className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group disabled:opacity-50"
                      >
                         <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14}/>}
                         </div>
                         <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Push Sync</span>
                      </button>
                   </div>
                   
                   {lastSyncedAt && (
                     <p className="text-[7px] font-black uppercase text-emerald-400 tracking-widest text-center mt-2">
                       Last Cloud Sync: {lastSyncedAt}
                     </p>
                   )}
                </div>
              </section>
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Download size={14}/> Data Persistence</h3>
                <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={exportData}
                        className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group"
                      >
                         <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100"><Download size={14}/></div>
                         <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Backup</span>
                      </button>
                      <label 
                        className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 cursor-pointer hover:bg-emerald-50 transition-all active:scale-95 group"
                      >
                         <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100"><Upload size={14}/></div>
                         <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Restore</span>
                         <input type="file" accept=".json" onChange={importData} className="hidden" />
                      </label>
                   </div>
                </div>
              </section>
              <button onClick={handleApplySettings} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.97] transition-all text-[11px]">Save Preferences</button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default SetupModal;
