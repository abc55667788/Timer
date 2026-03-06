import React from 'react';
import { X, Plus, Clock, Link as LinkIcon, Search } from 'lucide-react';
import { Category, Task, CategoryData, CATEGORY_ICONS, EventProject } from '../../types';

interface LoggingModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  loggingData: Task;
  setLoggingData: (task: Task) => void;
  tempWorkMin: string;
  tempRestMin: string;
  setTempWorkMin: (val: string) => void;
  setTempRestMin: (val: string) => void;
  categories: CategoryData[];
  eventProjects: EventProject[];
  setEventProjects: (projects: EventProject[] | ((prev: EventProject[]) => EventProject[])) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'current' | 'manual' | 'edit') => void;
  handleStartSession?: () => void;
  setShowLoggingModal: (show: boolean) => void;
  handleApplySettings: () => void;
  setPreviewImage?: (img: string | null) => void;
  darkMode?: boolean;
}

const LoggingModal: React.FC<LoggingModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  loggingData,
  setLoggingData,
  tempWorkMin,
  tempRestMin,
  setTempWorkMin,
  setTempRestMin,
  categories,
  eventProjects,
  setEventProjects,
  handleImageUpload,
  setShowLoggingModal,
  handleApplySettings,
  setPreviewImage,
  darkMode
}) => {
  const [eventQuery, setEventQuery] = React.useState(loggingData.eventName || '');

  React.useEffect(() => {
    setEventQuery(loggingData.eventName || '');
  }, [loggingData.eventId, loggingData.eventName]);

  const handleUpdate = () => {
    handleApplySettings();
    setShowLoggingModal(false);
  };

  const normalizedQuery = eventQuery.trim().toLowerCase();
  const filteredEvents = eventProjects.filter(project => {
    if (!normalizedQuery) return true;
    const tagText = project.tags.join(' ').toLowerCase();
    return project.name.toLowerCase().includes(normalizedQuery) || tagText.includes(normalizedQuery);
  }).slice(0, 8);

  const exactMatchedEvent = eventProjects.find(project => project.name.trim().toLowerCase() === normalizedQuery);

  const selectEvent = (project: EventProject) => {
    const boundTag = (project.tags || [])[0];
    setLoggingData({
      ...loggingData,
      category: boundTag || loggingData.category,
      eventId: project.id,
      eventName: project.name,
    });
    setEventQuery(project.name);
  };

  const createEventFromQuery = () => {
    const name = eventQuery.trim();
    if (!name) return;
    const existing = eventProjects.find(project => project.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      selectEvent(existing);
      return;
    }
    const newEvent: EventProject = {
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      name,
      startAt: Date.now(),
      tags: loggingData.category ? [loggingData.category] : [],
      createdAt: Date.now(),
    };
    setEventProjects(prev => {
      const updated = [newEvent, ...prev];
      // 这里的 setEventProjects 是通过 props 传进来的，它会自动更新父组件 index.tsx 里的 state
      return updated;
    });
    // 使用新创建的 event 对象来更新 loggingData
    setLoggingData(prev => ({
      ...prev,
      category: loggingData.category,
      eventId: newEvent.id,
      eventName: newEvent.name,
    }));
    setEventQuery(newEvent.name);
  };

  const CategoryPicker = () => (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
      {categories.map((cat, idx) => {
        const isSelected = loggingData.category === cat.name;
        const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;
        return (
          <button
            key={idx}
            onClick={() => setLoggingData({
              ...loggingData,
              category: cat.name,
              eventId: undefined,
              eventName: undefined,
            })}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all ${
              isSelected 
                ? (darkMode ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' : 'border-emerald-500 bg-emerald-50 shadow-sm') 
                : (darkMode ? 'border-white/5 bg-black/40 hover:bg-white/5' : 'border-transparent bg-gray-50/50 hover:bg-gray-100')
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isSelected ? 'font-bold' : (darkMode ? 'text-zinc-600' : 'text-gray-400')}`} style={isSelected ? { color: cat.color, backgroundColor: `${cat.color}15` } : {}}>
              <Icon size={14} />
            </div>
            <span className={`text-[9px] font-black tracking-tighter truncate w-full px-0.5 text-center transition-colors ${isSelected ? '' : (darkMode ? 'text-zinc-600' : 'text-gray-400')}`} style={isSelected ? { color: cat.color } : {}} title={cat.name}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-zinc-950/80 backdrop-blur-md' : (wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
      <style>{`
        .logging-modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .logging-modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .logging-modal-scroll::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)'};
          border-radius: 3px;
        }
        .logging-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.6)'};
        }
      `}</style>
      <div className={`${darkMode ? 'bg-zinc-900 border-none shadow-[0_24px_96px_-20px_rgba(0,0,0,0.9)]' : 'bg-white ring-1 ring-emerald-100/50 shadow-2xl'} rounded-[2.2rem] p-5 max-w-lg w-full relative max-h-[90vh] overflow-hidden flex flex-col`} style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} className="flex flex-col min-h-0 flex-1">
           <button 
             onClick={() => setShowLoggingModal(false)} 
             className={`absolute top-5 right-5 p-2 rounded-full transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-orange-500' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'}`}
             style={{ WebkitAppRegion: 'no-drag' } as any}
             title="Close"
           >
             <X size={18} />
           </button>
            <h2 className={`text-xl font-black mb-4 tracking-tight flex-shrink-0 ${darkMode ? 'text-white' : 'text-emerald-950'}`}>Session Detail</h2>
            <div className="space-y-4 overflow-y-auto pr-2 logging-modal-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: darkMode ? '#10b981 transparent' : '#10b981 #f0f9f0' } as any}>
              <section>
                <h3 className={`text-sm font-black tracking-tight mb-2.5 flex items-center gap-2.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}><Clock size={16} className={darkMode ? 'text-emerald-500/60' : 'text-emerald-500'}/> Timer Intervals</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-black block tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Focus Mode</label>
                    <div className="relative">
                      <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className={`w-full border rounded-xl p-3 pr-9 text-[14px] font-black outline-none font-mono transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/10' : 'bg-white border-emerald-100 text-emerald-900 shadow-sm focus:ring-2 focus:ring-emerald-500/5'}`} />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-tight ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>Min</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-black block tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Rest Mode</label>
                    <div className="relative">
                      <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className={`w-full border rounded-xl p-3 pr-9 text-[14px] font-black outline-none font-mono transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/10' : 'bg-white border-emerald-100 text-emerald-900 shadow-sm focus:ring-2 focus:ring-emerald-500/5'}`} />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-tight ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>Min</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Category</label>
                <CategoryPicker />
              </section>

              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Event Project</label>
                <div className={`rounded-xl border p-2 space-y-1.5 ${darkMode ? 'bg-zinc-800/70 border-white/10' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="relative">
                    <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`} />
                    <input
                      type="text"
                      placeholder="Search or create event..."
                      value={eventQuery}
                      onChange={(e) => {
                        setEventQuery(e.target.value);
                        if (!e.target.value.trim()) {
                          setLoggingData({ ...loggingData, eventId: undefined, eventName: undefined });
                        }
                      }}
                      className={`w-full border rounded-xl py-2 pl-9 pr-3 text-sm outline-none font-bold ${darkMode ? 'bg-zinc-900 border-white/5 text-white placeholder:text-zinc-600' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'}`}
                    />
                  </div>
                  {filteredEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {filteredEvents.map(project => {
                        const selected = loggingData.eventId === project.id;
                        return (
                          <button
                            key={project.id}
                            onClick={() => selectEvent(project)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight transition-all border ${selected ? 'bg-emerald-600 text-white border-emerald-600' : (darkMode ? 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-emerald-500/40' : 'bg-white text-emerald-700 border-emerald-100 hover:border-emerald-400')}`}
                          >
                            {project.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {!!normalizedQuery && !exactMatchedEvent && (
                    <button
                      onClick={createEventFromQuery}
                      className={`w-full py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${darkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      Create Event “{eventQuery.trim()}”
                    </button>
                  )}
                </div>
              </section>

              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Description</label>
                <textarea 
                  rows={2} 
                  placeholder="What are you working on?" 
                  value={loggingData.description} 
                  onChange={(e) => setLoggingData({...loggingData, description: e.target.value})} 
                  className={`w-full border rounded-2xl p-3 text-sm outline-none transition-all resize-none font-bold ${darkMode ? 'bg-zinc-800 border-white/5 text-white focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-600' : 'bg-emerald-50/50 border-emerald-50 text-emerald-900 focus:ring-2 focus:ring-emerald-500/10'}`} 
                />
              </section>
              
              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Photos ({loggingData.images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {loggingData.images.map((img, idx) => (
                    <div key={idx} className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-md group active:scale-95 transition-all ${darkMode ? 'border-white/10' : 'border-white'}`}>
                      <img 
                        src={img} 
                        className="w-full h-full object-cover cursor-zoom-in" 
                        onClick={() => setPreviewImage?.(img)}
                      />
                      <button onClick={() => setLoggingData({...loggingData, images: loggingData.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-sm"><X size={12} /></button>
                    </div>
                  ))}
                  <label className={`w-14 h-14 flex items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all shadow-inner ${darkMode ? 'bg-zinc-800 border-white/10 text-emerald-500/40 hover:bg-zinc-700/50' : 'bg-emerald-50 border-emerald-100 text-emerald-400 hover:bg-emerald-100'}`}>
                    <Plus size={20} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                  </label>
                </div>
              </section>

              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Link</label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${darkMode ? 'text-zinc-600 group-focus-within:text-emerald-500' : 'text-emerald-400 group-focus-within:text-emerald-500'}`}>
                    <LinkIcon size={14} />
                  </div>
                  <input 
                    type="url"
                    placeholder="https://..." 
                    value={loggingData.link || ''} 
                    onChange={(e) => setLoggingData({...loggingData, link: e.target.value})} 
                    className={`w-full border rounded-2xl p-3 pl-10 pr-4 text-sm outline-none transition-all font-bold truncate ${darkMode ? 'bg-zinc-800 border-white/5 text-white focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-600' : 'bg-emerald-50/50 border-emerald-50 text-emerald-900 focus:ring-2 focus:ring-emerald-500/10'}`} 
                  />
                </div>
              </section>

              <button 
                onClick={handleUpdate} 
                className={`w-full py-3.5 text-white rounded-[1.2rem] text-sm font-bold tracking-tight mt-1 active:scale-[0.98] transition-all ${darkMode ? 'bg-zinc-800 hover:bg-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-emerald-600 shadow-[0_10px_30px_rgba(5,150,105,0.2)]'}`}
              >
                Update Session
              </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default LoggingModal;
