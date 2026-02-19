import React, { useState } from 'react';
import { 
  X, Settings, Clock, Palette, Timer as TimerIcon, 
  AlertCircle, CheckCircle2, Globe, Key, Database, RefreshCw, 
  Download, Upload, Cloud, Plus, Trash, Check, Maximize2, Minus
} from 'lucide-react';
import { CategoryData, CATEGORY_ICONS, NotificationStatus, IconKey } from '../../types';

interface SetupModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  tempWorkMin: string;
  tempRestMin: string;
  setTempWorkMin: (val: string) => void;
  setTempRestMin: (val: string) => void;
  categories: CategoryData[];
  setCategories: (cats: CategoryData[] | ((prev: CategoryData[]) => CategoryData[])) => void;
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
  uiScale: number;
  setUiScale: (val: number | ((prev: number) => number)) => void;
  isPage?: boolean;
}

const SetupModal: React.FC<SetupModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  tempWorkMin,
  tempRestMin,
  setTempWorkMin,
  setTempRestMin,
  categories,
  setCategories,
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
  uiScale,
  setUiScale,
  isPage = false,
}) => {
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);
  const [scaleInputValue, setScaleInputValue] = useState((uiScale * 100).toFixed(0));

  React.useEffect(() => {
    setScaleInputValue((uiScale * 100).toFixed(0));
  }, [uiScale]);

  const containerClasses = isPage 
    ? "w-full h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500"
    : `fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`;

  const contentClasses = isPage
    ? "flex-1 flex flex-col w-full max-w-screen-xl mx-auto p-4 md:p-12 overflow-y-auto scrollbar-none"
    : "bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50";

  const handleAddCategory = () => {
    const newCat: CategoryData = {
      name: `New Tag ${categories.length + 1}`,
      icon: 'Tag' in CATEGORY_ICONS ? 'Tag' as any : 'Briefcase',
      color: '#10b981'
    };
    setCategories([...categories, newCat]);
  };

  const handleDeleteCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleUpdateCategory = (index: number, updates: Partial<CategoryData>) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], ...updates };
    setCategories(newCats);
  };

  return (
    <div className={containerClasses}>
      <div className={contentClasses} style={!isPage ? { WebkitAppRegion: 'drag' } as any : {}}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} className={isPage ? "max-w-4xl mx-auto w-full" : "scrollbar-none overflow-y-auto max-h-[80vh]"}>
           {!isPage && <button onClick={closeSettingsWithoutSaving} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>}
           
           <div className={isPage ? "flex items-center justify-between mb-12" : "mb-7"}>
             <h2 className={`${isPage ? 'text-3xl' : 'text-xl'} font-black text-emerald-950 tracking-tight flex items-center gap-3`}>
               <Settings size={isPage ? 32 : 22} className="text-emerald-500" /> Settings
             </h2>
             {isPage && (
               <button onClick={handleApplySettings} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.97] transition-all text-[11px]">Save Changes</button>
             )}
           </div>

           <div className={`grid ${isPage ? 'grid-cols-1 md:grid-cols-2 gap-x-12' : ''} space-y-8`}>
              <div className="space-y-8">
                <section>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2"><Palette size={14}/> Categories</h3>
                     <button 
                        onClick={handleAddCategory}
                        className="p-1 px-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1"
                     >
                       <Plus size={10} /> Add
                     </button>
                   </div>
                   <div className="bg-emerald-50/20 p-6 rounded-[2.5rem] border border-emerald-50/50">
                      <div className="space-y-3 max-w-md mx-auto">
                         {categories.map((cat, idx) => (
                           <div key={idx} className="flex items-center gap-4 bg-white p-2.5 pl-3 rounded-[1.5rem] shadow-sm border border-emerald-50 group hover:border-emerald-200 hover:shadow-md transition-all relative">
                              <div className="relative group/icon flex-shrink-0">
                                 <button 
                                    onClick={() => setEditingIconIndex(idx)}
                                    className="w-10 h-10 rounded-[1.1rem] text-emerald-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm" 
                                    style={{ backgroundColor: `${cat.color}10`, color: cat.color }}
                                 >
                                    {React.createElement(CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase, {size: 18})}
                                 </button>
                              </div>
                              
                              <input 
                                type="text"
                                value={cat.name}
                                onChange={(e) => handleUpdateCategory(idx, { name: e.target.value })}
                                className="flex-1 min-w-0 bg-transparent text-[10px] font-black text-emerald-900 uppercase tracking-widest outline-none border-b-2 border-transparent focus:border-emerald-100 py-1 transition-colors"
                              />

                              <div className="flex items-center gap-2 pr-1">
                                <div className="relative w-7 h-7 flex items-center justify-center">
                                  <input 
                                    type="color" 
                                    value={cat.color} 
                                    onChange={(e) => handleUpdateCategory(idx, { color: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className="w-6 h-6 rounded-full shadow-inner border-2 border-white ring-1 ring-emerald-100" style={{ backgroundColor: cat.color }} />
                                </div>
                                
                                {categories.length > 1 && (
                                  <button 
                                    onClick={() => handleDeleteCategory(idx)}
                                    className="p-2 text-emerald-100 hover:text-red-400 hover:bg-red-50 transition-all rounded-xl md:opacity-0 md:group-hover:opacity-100 md:-mr-2"
                                    title="Delete Category"
                                  >
                                    <Trash size={14} />
                                  </button>
                                )}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </section>

                {editingIconIndex !== null && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-20">
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md" onClick={() => setEditingIconIndex(null)} />
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-black text-emerald-950 uppercase tracking-widest">Select Icon</h4>
                        <button onClick={() => setEditingIconIndex(null)} className="p-2 hover:bg-emerald-50 rounded-full transition-all"><X size={20}/></button>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-none">
                        {(Object.keys(CATEGORY_ICONS) as IconKey[]).map((iconKey) => (
                          <button 
                            key={iconKey}
                            onClick={() => {
                              handleUpdateCategory(editingIconIndex, { icon: iconKey });
                              setEditingIconIndex(null);
                            }}
                            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${categories[editingIconIndex].icon === iconKey ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100'}`}
                          >
                            {React.createElement(CATEGORY_ICONS[iconKey], { size: 20 })}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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
              </div>

              <div className="space-y-8">
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
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Maximize2 size={14}/> Display Zoom</h3>
                  <div className="bg-emerald-50/30 p-5 rounded-[2rem] border border-emerald-50">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-50 flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4">
                         <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-none">Global UI Scale</span>
                         
                         <div className="flex items-center gap-2 p-1 bg-emerald-50/50 rounded-xl">
                            <button 
                              onClick={() => setUiScale(prev => Math.max(0.5, Math.round((prev - 0.05) * 100) / 100))}
                              className="p-1 px-2.5 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                            >
                              <Minus size={10} strokeWidth={4} />
                            </button>
                            
                            <div className="relative">
                               <input 
                                  type="number"
                                  value={scaleInputValue}
                                  onChange={(e) => setScaleInputValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt(scaleInputValue);
                                      if (!isNaN(val)) {
                                        const scale = Math.min(2.0, Math.max(0.5, val / 100));
                                        setUiScale(scale);
                                        setScaleInputValue((scale * 100).toFixed(0));
                                      }
                                    }
                                  }}
                                  onBlur={() => {
                                    const val = parseInt(scaleInputValue);
                                    if (!isNaN(val)) {
                                      const scale = Math.min(2.0, Math.max(0.5, val / 100));
                                      setUiScale(scale);
                                      setScaleInputValue((scale * 100).toFixed(0));
                                    } else {
                                      setScaleInputValue((uiScale * 100).toFixed(0));
                                    }
                                  }}
                                  className="w-14 bg-white border border-emerald-100 rounded-lg py-1 px-2 text-center text-[10px] font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                               />
                               <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-300 pointer-events-none">%</span>
                            </div>

                            <button 
                              onClick={() => setUiScale(prev => Math.min(2.0, Math.round((prev + 0.05) * 100) / 100))}
                              className="p-1 px-2.5 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                            >
                              <Plus size={10} strokeWidth={4} />
                            </button>
                         </div>
                      </div>
                      
                      <div className="flex justify-between px-1">
                        <span className="text-[8px] font-black text-emerald-200 uppercase tracking-tighter">Min: 50%</span>
                        <span className="text-[8px] font-black text-emerald-200 uppercase tracking-tighter">Default: 100%</span>
                        <span className="text-[8px] font-black text-emerald-200 uppercase tracking-tighter">Max: 200%</span>
                      </div>
                      <p className="text-[8px] font-black uppercase text-emerald-400/60 leading-relaxed">
                        Tip: You can also use <span className="text-emerald-500">Ctrl + Scroll Wheel</span> to zoom anywhere.
                      </p>
                    </div>
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
              </div>
           </div>

           {!isPage && <button onClick={handleApplySettings} className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.97] transition-all text-[11px]">Save Preferences</button>}
         </div>
      </div>
    </div>
  );
};


export default SetupModal;
