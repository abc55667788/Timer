import React, { useState } from 'react';
import { 
  X, Settings, Clock, Palette, Timer as TimerIcon, 
  AlertCircle, CheckCircle2, Globe, Key, Database, RefreshCw, 
  Download, Upload, Cloud, Plus, Trash, Check, Maximize2, Minus,
  Bell, BellOff, User, Moon, Sun, Monitor
} from 'lucide-react';
import { CategoryData, CATEGORY_ICONS, NotificationStatus, IconKey, ThemePreference } from '../../types';

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
  webdavConfig: { url: string; username: string; password?: string; filename: string };
  setWebdavConfig: (config: any) => void;
  syncMethod: 'gitlab' | 'webdav';
  setSyncMethod: (method: 'gitlab' | 'webdav') => void;
  isSyncing: boolean;
  verifySyncConfig: () => Promise<boolean>;
  syncFromGitLab: () => void;
  syncToGitLab: () => void;
  syncFromWebDAV: () => void;
  syncToWebDAV: () => void;
  lastSyncedAt: string | null;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleApplySettings: () => void;
  closeSettingsWithoutSaving: () => void;
  uiScale: number;
  setUiScale: (val: number | ((prev: number) => number)) => void;
  darkMode: boolean;
  themePreference: ThemePreference;
  setThemePreference: (val: ThemePreference) => void;
  autoContinueLog: boolean;
  setAutoContinueLog: (val: boolean | ((prev: boolean) => boolean)) => void;
  isPage?: boolean;
  isAndroid?: boolean;
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
  webdavConfig,
  setWebdavConfig,
  syncMethod,
  setSyncMethod,
  isSyncing,
  verifySyncConfig,
  syncFromGitLab,
  syncToGitLab,
  syncFromWebDAV,
  syncToWebDAV,
  lastSyncedAt,
  exportData,
  importData,
  handleApplySettings,
  closeSettingsWithoutSaving,
  uiScale,
  setUiScale,
  darkMode,
  themePreference,
  setThemePreference,
  autoContinueLog,
  setAutoContinueLog,
  isPage = false,
  isAndroid = false,
}) => {
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);
  const [scaleInputValue, setScaleInputValue] = useState((uiScale * 100).toFixed(0));

  React.useEffect(() => {
    setScaleInputValue((uiScale * 100).toFixed(0));
  }, [uiScale]);

  const containerClasses = isPage 
    ? `w-full h-full flex flex-col ${darkMode ? 'bg-zinc-950/95' : 'bg-white'} overflow-hidden animate-in fade-in duration-500`
    : `fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : (darkMode ? 'bg-black/60 backdrop-blur-xl' : 'bg-emerald-900/60 backdrop-blur-xl')} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`;

  const contentClasses = isPage
    ? "flex-1 flex flex-col w-full mx-auto p-4 md:p-6 scrollbar-none"
    : `${darkMode ? 'bg-zinc-950/90 border-white/5 shadow-[-12px_12px_44px_rgba(0,0,0,0.8)]' : 'bg-white border-emerald-100/50'} backdrop-blur-3xl rounded-[2.5rem] p-7 max-w-sm w-full relative border ring-1 ring-white/5 shadow-2xl transition-all duration-300`;

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

  const themeOptions: { id: ThemePreference; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: 'system',
      label: 'System',
      description: 'Follow device setting',
      icon: <Monitor size={18} />
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'True black glass',
      icon: <Moon size={18} />
    },
    {
      id: 'light',
      label: 'Light',
      description: 'Bright & airy',
      icon: <Sun size={18} />
    }
  ];

  return (
    <div className={containerClasses}>
      <div className={contentClasses} style={!isPage ? { WebkitAppRegion: 'drag' } as any : {}}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} className={isPage ? "w-full" : "scrollbar-none overflow-y-auto max-h-[80vh]"}>
           {!isPage && (
              <button 
                onClick={closeSettingsWithoutSaving} 
                className={`absolute top-4 right-4 p-2 ${darkMode ? 'bg-white/5 text-emerald-400 border-white/5 ring-1 ring-white/5 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-300 hover:bg-red-500 hover:text-white shadow-sm'} rounded-full transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer`}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                title="Close"
              >
                <X size={18} />
              </button>
           )}
           
           <div className={`grid ${isPage ? 'grid-cols-1 md:grid-cols-2 gap-x-12' : ''} space-y-6`}>
              <div className="space-y-6">
                <section>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} flex items-center gap-2`}><Palette size={14}/> Categories</h3>
                     <button 
                        onClick={handleAddCategory}
                        className={`p-1 px-2.5 ${darkMode ? 'bg-white/5 text-emerald-500 hover:bg-white/10' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'} rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center gap-1`}
                     >
                       <Plus size={12} /> Add
                     </button>
                   </div>
                   <div className={`${darkMode ? 'bg-black/20 border-white/5 shadow-inner' : 'bg-emerald-50/20 border-emerald-50/50'} p-6 rounded-[2.5rem] border ring-1 ring-white/5`}>
                      <div className={`space-y-3 ${isPage ? 'w-full' : 'max-w-md mx-auto'}`}>
                         {categories.map((cat, idx) => (
                           <div key={idx} className={`flex items-center gap-4 ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' : 'bg-white border-emerald-50'} p-3 pl-4 rounded-[1.5rem] shadow-sm border group transition-all relative overflow-hidden`}>
                              <div className="relative group/icon flex-shrink-0">
                                 <button 
                                    onClick={() => setEditingIconIndex(idx)}
                                    className={`w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-emerald-50'}`} 
                                    style={{ color: cat.color }}
                                 >
                                    {React.createElement(CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase, {size: 20})}
                                 </button>
                              </div>
                              
                              <input 
                                type="text"
                                value={cat.name}
                                onChange={(e) => handleUpdateCategory(idx, { name: e.target.value })}
                                className={`flex-1 min-w-0 bg-transparent text-sm font-bold ${darkMode ? 'text-emerald-50 placeholder-emerald-800' : 'text-emerald-900'} tracking-tight outline-none border-b-2 border-transparent focus:border-emerald-500/30 py-1 transition-colors`}
                              />

                              <div className="flex items-center gap-3 pr-1">
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                  <input 
                                    type="color" 
                                    value={cat.color} 
                                    onChange={(e) => handleUpdateCategory(idx, { color: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className={`w-7 h-7 rounded-full shadow-lg border-2 ${darkMode ? 'border-emerald-900 ring-white/10' : 'border-white ring-emerald-200'} ring-1 transition-transform group-hover:scale-110`} style={{ backgroundColor: cat.color }} />
                                </div>
                                
                                {categories.length > 1 && (
                                  <button 
                                    onClick={() => handleDeleteCategory(idx)}
                                    className={`p-2 ${darkMode ? 'text-emerald-800 hover:text-red-400 hover:bg-red-500/10' : 'text-emerald-200 hover:text-red-500 hover:bg-red-50'} transition-all rounded-xl md:opacity-0 md:group-hover:opacity-100`}
                                    title="Delete Category"
                                  >
                                    <Trash size={16} />
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setEditingIconIndex(null)} />
                    <div className={`${darkMode ? 'bg-zinc-950 border-white/5 shadow-none' : 'bg-white border-emerald-100 shadow-2xl'} rounded-[2.5rem] p-8 w-full max-w-lg relative animate-in zoom-in-95 duration-200 border`}>
                      <div className="flex items-center justify-between mb-8">
                        <h4 className={`text-sm font-bold ${darkMode ? 'text-zinc-50' : 'text-emerald-950'} tracking-tight`}>Select Icon</h4>
                        <button onClick={() => setEditingIconIndex(null)} className={`p-2 ${darkMode ? 'hover:bg-white/5 text-emerald-800' : 'hover:bg-emerald-50 text-emerald-300'} rounded-full transition-all`}><X size={20}/></button>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-none">
                        {(Object.keys(CATEGORY_ICONS) as IconKey[]).map((iconKey) => (
                          <button 
                            key={iconKey}
                            onClick={() => {
                              handleUpdateCategory(editingIconIndex, { icon: iconKey });
                              setEditingIconIndex(null);
                            }}
                            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${categories[editingIconIndex].icon === iconKey ? (darkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200') : (darkMode ? 'bg-zinc-800 text-emerald-700 hover:bg-zinc-700 hover:text-white' : 'bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100')}`}
                          >
                            {React.createElement(CATEGORY_ICONS[iconKey], { size: 20 })}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <section>
                  <h3 className={`text-[15px] font-black tracking-tight ${darkMode ? 'text-zinc-400' : 'text-emerald-800'} mb-4 flex items-center gap-2.5`}><Maximize2 size={16}/> Theme & Interface</h3>
                  <div className={`${darkMode ? 'bg-zinc-900/40' : 'bg-emerald-50/30'} p-5 rounded-[1.8rem] border ${darkMode ? 'border-white/5' : 'border-emerald-50'} space-y-4`}>
                    <div className={`${darkMode ? 'bg-zinc-950 border-white/5 shadow-none' : 'bg-white border-emerald-100 shadow-sm'} p-4 rounded-2xl border`}>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className={`text-sm font-black ${darkMode ? 'text-zinc-50' : 'text-emerald-950'} tracking-tight`}>Theme Preference</p>
                          <p className={`text-[11px] font-semibold ${darkMode ? 'text-zinc-500' : 'text-emerald-500/80'} uppercase tracking-widest`}>System / Light / Dark</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${darkMode ? 'bg-white/5 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>Instantly applies</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        {themeOptions.map(opt => {
                          const selected = themePreference === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setThemePreference(opt.id)}
                              className={`p-3 rounded-2xl border transition-all text-left flex flex-col gap-1 ${selected
                                ? (darkMode ? 'border-emerald-400 bg-emerald-500/5 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.45)]' : 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_8px_24px_rgba(16,185,129,0.25)]')
                                : (darkMode ? 'border-white/5 text-zinc-400 hover:border-emerald-500/40' : 'border-emerald-100 text-emerald-600 hover:border-emerald-400/70')}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-xl ${selected ? (darkMode ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-white/5 text-zinc-500' : 'bg-emerald-50 text-emerald-500')}`}>
                                  {opt.icon}
                                </div>
                                <span className="text-sm font-black tracking-tight">{opt.label}</span>
                              </div>
                              <span className={`text-[11px] font-semibold uppercase tracking-widest ${selected ? (darkMode ? 'text-emerald-300' : 'text-emerald-500') : (darkMode ? 'text-zinc-600' : 'text-emerald-400')}`}>
                                {opt.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {!isAndroid && (
                      <div className={`${darkMode ? 'bg-zinc-950 border-white/5 shadow-none' : 'bg-white border-emerald-100 shadow-sm'} p-6 rounded-2xl border flex flex-col gap-6`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                           <div className="space-y-1.5 border-l-4 border-emerald-500 pl-4 py-1">
                             <span className={`text-lg font-black ${darkMode ? 'text-zinc-50' : 'text-emerald-950'} tracking-tighter leading-none block`}>UI Scale</span>
                             <p className={`text-[10px] font-bold ${darkMode ? 'text-zinc-600' : 'text-emerald-500/60'} uppercase tracking-[0.15em] leading-none`}>Overall size & density</p>
                           </div>
                           
                           <div className={`flex items-center gap-3 p-2.5 ${darkMode ? 'bg-black/20 border-white/5' : 'bg-emerald-50/50 border-emerald-100/50'} rounded-2xl border shadow-inner`}>
                              <button 
                                onClick={() => setUiScale(prev => Math.max(0.5, Math.round((prev - 0.05) * 100) / 100))}
                                className={`p-2.5 ${darkMode ? 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700 hover:text-white' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'} rounded-xl shadow-sm border transition-all active:scale-90`}
                              >
                                <Minus size={14} strokeWidth={4} />
                              </button>
                              
                              <div className="relative group flex flex-col items-center justify-center min-w-[70px]">
                                 <input 
                                    type="number"
                                    value={scaleInputValue}
                                    onChange={(e) => setScaleInputValue(e.target.value)}
                                    className={`w-full bg-transparent border-none text-center text-lg font-black ${darkMode ? 'text-zinc-50' : 'text-emerald-950'} outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                 />
                                 <span className={`text-[9px] font-black ${darkMode ? 'text-zinc-700' : 'text-emerald-300'} uppercase tracking-widest -mt-1`}>PERCENT</span>
                              </div>

                              <button 
                                onClick={() => setUiScale(prev => Math.min(3.0, Math.round((prev + 0.05) * 100) / 100))}
                                className={`p-2.5 ${darkMode ? 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700 hover:text-white' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'} rounded-xl shadow-sm border transition-all active:scale-90`}
                              >
                                <Plus size={14} strokeWidth={4} />
                              </button>
                           </div>
                        </div>
                        
                        <div className="space-y-3">
                          <input 
                            type="range" 
                            min="0.5" 
                            max="3" 
                            step="0.05" 
                            value={uiScale} 
                            onChange={(e) => setUiScale(parseFloat(e.target.value))}
                            className={`w-full h-2 ${darkMode ? 'bg-zinc-800' : 'bg-emerald-100'} rounded-full appearance-none cursor-pointer accent-emerald-600`}
                          />
                          <div className={`flex justify-between px-1 text-[10px] font-black ${darkMode ? 'text-zinc-700' : 'text-emerald-400'} uppercase tracking-widest`}>
                            <span>S (50%)</span>
                            <span className={darkMode ? "text-zinc-400" : "text-emerald-600"}>Default (130%)</span>
                            <span>XL (300%)</span>
                          </div>
                        </div>

                        <p className={`text-[12px] font-bold ${darkMode ? 'text-zinc-400 bg-zinc-900 border-white/5' : 'text-emerald-600/80 bg-emerald-50/50 border-emerald-200'} leading-relaxed p-4 rounded-xl border border-dashed`}>
                          💡 <span className={darkMode ? 'text-zinc-100' : 'text-emerald-800'}>Pro Tip:</span> You can also use <span className={darkMode ? 'text-zinc-100 font-black' : 'text-emerald-700 font-black'}>Ctrl + Scroll Wheel</span> anywhere in the app to quickly adjust the font size and layout.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} mb-4 flex items-center gap-2`}><RefreshCw size={14}/> Timer Behavior</h3>
                  <div className={`${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/30'} p-5 rounded-[1.8rem] border ${darkMode ? 'border-white/5' : 'border-emerald-50'}`}>
                    {/* Auto-continue Session Log Toggle */}
                    <div className={`${darkMode ? 'bg-zinc-950 border-white/5 shadow-none' : 'bg-white border-emerald-100 shadow-sm'} p-4 rounded-2xl border flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <RefreshCw size={18} />
                        </div>
                        <div>
                          <span className={`text-sm font-black ${darkMode ? 'text-zinc-50' : 'text-emerald-950'} block leading-tight`}>自动继续日志</span>
                          <span className={`text-[10px] font-bold ${darkMode ? 'text-zinc-600' : 'text-emerald-500/60'} uppercase tracking-widest`}>不提示保存，直接延续当前记录</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAutoContinueLog(!autoContinueLog)}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${autoContinueLog ? 'bg-emerald-600' : 'bg-emerald-200'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${autoContinueLog ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} mb-4 flex items-center gap-2`}><Cloud size={14}/> Cloud Sync</h3>
                  
                  <div className={`${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/30'} p-5 rounded-[1.8rem] border ${darkMode ? 'border-white/5' : 'border-emerald-50'} space-y-4`}>
                     {/* Method Selector */}
                     <div className={`flex ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/50 border-emerald-100/50'} p-1 rounded-2xl border`}>
                        <button 
                          onClick={() => setSyncMethod('gitlab')}
                          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${syncMethod === 'gitlab' ? (darkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-emerald-600 text-white shadow-sm') : (darkMode ? 'text-emerald-700 hover:text-emerald-500' : 'text-emerald-400 hover:text-emerald-600')}`}
                        >
                          GitLab
                        </button>
                        <button 
                          onClick={() => setSyncMethod('webdav')}
                          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${syncMethod === 'webdav' ? (darkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-emerald-600 text-white shadow-sm') : (darkMode ? 'text-emerald-400 hover:text-emerald-600' : 'text-emerald-400 hover:text-emerald-600')}`}
                        >
                          WebDAV
                        </button>
                     </div>

                     {syncMethod === 'gitlab' ? (
                        <div className="space-y-2.5">
                           <div className="flex items-center justify-between mb-1 px-1">
                              <span className={`text-[10px] font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} tracking-tight flex items-center gap-1.5`}><Globe size={11}/> Connection Configuration</span>
                              <button 
                                 disabled={isSyncing}
                                 onClick={verifySyncConfig}
                                 className={`text-[10px] font-bold ${darkMode ? 'text-emerald-400 hover:text-emerald-300 bg-white/5' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50'} flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50`}
                              >
                                 <Check size={11} strokeWidth={3}/> Verify Server
                              </button>
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Globe size={13} /></div>
                              <input 
                                 type="text" 
                                 placeholder="GitLab URL (e.g. https://gitlab.com)"
                                 value={gitlabConfig.url}
                                 onChange={(e) => setGitlabConfig({...gitlabConfig, url: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Key size={13} /></div>
                              <input 
                                 type="password" 
                                 placeholder="Personal Access Token"
                                 value={gitlabConfig.token}
                                 onChange={(e) => setGitlabConfig({...gitlabConfig, token: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Database size={13} /></div>
                              <input 
                                 type="text" 
                                 placeholder="Project Path or ID (e.g. username/repo)"
                                 value={gitlabConfig.projectId}
                                 onChange={(e) => setGitlabConfig({...gitlabConfig, projectId: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <input 
                                 type="text" 
                                 placeholder="Branch (main)"
                                 value={gitlabConfig.branch}
                                 onChange={(e) => setGitlabConfig({...gitlabConfig, branch: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-800 placeholder:text-emerald-300'} rounded-xl py-2.5 px-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                              <div className="relative">
                                 <input 
                                    type="text" 
                                    placeholder="File (data.json)"
                                    value={gitlabConfig.filename}
                                    onChange={(e) => setGitlabConfig({...gitlabConfig, filename: e.target.value})}
                                    className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-800 placeholder:text-emerald-300'} rounded-xl py-2.5 pl-4 pr-14 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                                 />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-300 pointer-events-none">etimer/</span>
                              </div>
                           </div>
                           <p className={`px-1 text-[9px] font-bold ${darkMode ? 'text-emerald-600' : 'text-emerald-400'} italic`}>Note: Files are stored in the <span className="text-emerald-500">etimer/</span> folder automatically.</p>
                        </div>
                     ) : (
                        <div className="space-y-2.5">
                           <div className="flex items-center justify-between mb-1 px-1">
                              <span className={`text-[10px] font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} tracking-tight flex items-center gap-1.5`}><Globe size={11}/> Connection Configuration</span>
                              <button 
                                 disabled={isSyncing}
                                 onClick={verifySyncConfig}
                                 className={`text-[10px] font-bold ${darkMode ? 'text-emerald-400 hover:text-emerald-300 bg-white/5' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50'} flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50`}
                              >
                                 <Check size={11} strokeWidth={3}/> Verify Server
                              </button>
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Globe size={13} /></div>
                              <input 
                                 type="text" 
                                 placeholder="WebDAV Host URL"
                                 value={webdavConfig.url}
                                 onChange={(e) => setWebdavConfig({...webdavConfig, url: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><User size={13} /></div>
                              <input 
                                 type="text" 
                                 placeholder="Username"
                                 value={webdavConfig.username}
                                 onChange={(e) => setWebdavConfig({...webdavConfig, username: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Key size={13} /></div>
                              <input 
                                 type="password" 
                                 placeholder="Password"
                                 value={webdavConfig.password}
                                 onChange={(e) => setWebdavConfig({...webdavConfig, password: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                           </div>
                           <div className="relative">
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400"><Database size={13} /></div>
                              <input 
                                 type="text" 
                                 placeholder="Filename (e.g. data.json)"
                                 value={webdavConfig.filename}
                                 onChange={(e) => setWebdavConfig({...webdavConfig, filename: e.target.value})}
                                 className={`w-full ${darkMode ? 'bg-white/5 border-white/5 text-emerald-100 placeholder:text-emerald-900' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'} rounded-xl py-3 pl-10 pr-14 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-300 pointer-events-none">etimer/</span>
                           </div>
                           <p className={`px-1 text-[9px] font-bold ${darkMode ? 'text-emerald-600' : 'text-emerald-400'} italic`}>Note: Files are stored in the <span className="text-emerald-500">etimer/</span> folder automatically.</p>
                        </div>
                     )}
                     
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                          disabled={isSyncing}
                          onClick={syncMethod === 'gitlab' ? syncFromGitLab : syncFromWebDAV}
                          className={`${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-emerald-50 hover:bg-emerald-50 shadow-sm'} p-4 rounded-[1.2rem] border flex flex-col items-center gap-2 transition-all active:scale-95 group disabled:opacity-50`}
                        >
                           <div className={`p-2.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'} rounded-lg`}>
                              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16}/>}
                           </div>
                           <span className={`text-[11px] font-bold ${darkMode ? 'text-emerald-100' : 'text-emerald-950'} tracking-tight`}>Pull Restored</span>
                        </button>
                        <button 
                          disabled={isSyncing}
                          onClick={syncMethod === 'gitlab' ? syncToGitLab : syncToWebDAV}
                          className={`${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-emerald-50 hover:bg-emerald-50 shadow-sm'} p-4 rounded-[1.2rem] border flex flex-col items-center gap-2 transition-all active:scale-95 group disabled:opacity-50`}
                        >
                           <div className={`p-2.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'} rounded-lg`}>
                              {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16}/>}
                           </div>
                           <span className={`text-[11px] font-bold ${darkMode ? 'text-emerald-100' : 'text-emerald-950'} tracking-tight`}>Push Local</span>
                        </button>
                     </div>
                     
                     {lastSyncedAt && (
                       <p className="text-[10px] font-bold text-emerald-600 tracking-tight text-center mt-1">
                         Last {syncMethod === 'gitlab' ? 'GitLab' : 'WebDAV'} Sync: {lastSyncedAt}
                       </p>
                     )}
                  </div>
                </section>

                <section>
                  <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} mb-4 flex items-center gap-2`}><Download size={14}/> Data Persistence</h3>
                  <div className={`${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/30'} p-5 rounded-[1.8rem] border ${darkMode ? 'border-white/5' : 'border-emerald-50'}`}>
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={exportData}
                          className={`${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-emerald-50 hover:bg-emerald-50 shadow-sm'} p-4 rounded-[1.2rem] border flex flex-col items-center gap-2 transition-all active:scale-95 group`}
                        >
                           <div className={`p-2.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'} rounded-lg`}><Download size={16}/></div>
                           <span className={`text-[11px] font-bold ${darkMode ? 'text-emerald-100' : 'text-emerald-950'} tracking-tight`}>Backup</span>
                        </button>
                        <label 
                          className={`${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-emerald-50 hover:bg-emerald-50 shadow-sm'} p-4 rounded-[1.2rem] border flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-95 group`}
                        >
                           <div className={`p-2.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'} rounded-lg`}><Upload size={16}/></div>
                           <span className={`text-[11px] font-bold ${darkMode ? 'text-emerald-100' : 'text-emerald-950'} tracking-tight`}>Restore</span>
                           <input type="file" accept=".json" onChange={importData} className="hidden" />
                        </label>
                     </div>
                  </div>
                </section>

                <section>
                  <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-emerald-400' : 'text-emerald-800'} mb-4 flex items-center gap-2`}><Bell size={14}/> Notifications</h3>
                  <div className={`${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/30'} p-5 rounded-[1.8rem] border ${darkMode ? 'border-white/5' : 'border-emerald-50'}`}>
                     <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-emerald-50 shadow-sm'} rounded-xl border`}>
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${notificationPermission === 'granted' ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')}`}>
                              <Bell size={16} />
                           </div>
                           <div>
                              <p className={`text-[12px] font-bold ${darkMode ? 'text-emerald-50' : 'text-emerald-950'} tracking-tight leading-none mb-1`}>Status: {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}</p>
                              <p className={`text-[10px] font-bold ${darkMode ? 'text-emerald-400/40' : 'text-emerald-400'} tracking-tight`}>Desktop alerts & sounds</p>
                           </div>
                        </div>
                        {notificationPermission !== 'granted' && (
                          <button 
                            onClick={() => requestNotificationPermission(true)}
                            className={`${darkMode ? 'bg-zinc-800 text-white border border-white/10 hover:bg-emerald-500 hover:border-emerald-400' : 'bg-emerald-600 text-white shadow-md shadow-emerald-100/50 hover:bg-emerald-700'} px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all active:scale-95`}
                          >
                             Enable
                          </button>
                        )}
                        {notificationPermission === 'granted' && (
                          <div className={`p-2 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} rounded-lg`}>
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                     </div>
                  </div>
                </section>
              </div>
           </div>

           {(isPage || !isPage) && (
              <div className={`${isPage ? 'w-full pt-2 pb-8' : 'mt-8'} w-full transition-all`}>
                 <button 
                   onClick={handleApplySettings} 
                   className={`w-full py-4 rounded-[1.8rem] font-black tracking-widest uppercase transition-all text-xs flex items-center justify-center gap-2 active:scale-[0.97] shadow-xl ${
                     darkMode 
                       ? 'bg-zinc-800 text-white border border-white/10 hover:bg-emerald-500 hover:border-emerald-400' 
                       : 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700'
                   }`}
                 >
                   <CheckCircle2 size={18}/> Save Preferences
                 </button>
              </div>
           )}
         </div>
      </div>
    </div>
  );
};


export default SetupModal;
