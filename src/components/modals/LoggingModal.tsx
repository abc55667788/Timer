import React from 'react';
import { X, Plus, Clock, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import { Category, Task, CategoryData, CATEGORY_ICONS } from '../../types';

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
  handleImageUpload,
  setShowLoggingModal,
  handleApplySettings,
  setPreviewImage,
  darkMode
}) => {
  const handleUpdate = () => {
    handleApplySettings();
    setShowLoggingModal(false);
  };

  const CategoryPicker = () => (
    <div className="grid grid-cols-5 gap-2">
      {categories.map((cat, idx) => {
        const isSelected = loggingData.category === cat.name;
        const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;
        return (
          <button
            key={idx}
            onClick={() => setLoggingData({...loggingData, category: cat.name})}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all ${
              isSelected 
                ? (darkMode ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' : 'border-emerald-500 bg-emerald-50 shadow-sm') 
                : (darkMode ? 'border-white/5 bg-black/40 hover:bg-white/5' : 'border-transparent bg-gray-50/50 hover:bg-gray-100')
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isSelected ? 'font-bold' : (darkMode ? 'text-zinc-600' : 'text-gray-400')}`} style={isSelected ? { color: cat.color, backgroundColor: `${cat.color}15` } : {}}>
              <Icon size={14} />
            </div>
            <span className={`text-[10px] font-black tracking-tight transition-colors ${isSelected ? '' : (darkMode ? 'text-zinc-600' : 'text-gray-400')}`} style={isSelected ? { color: cat.color } : {}}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-zinc-950/80 backdrop-blur-md' : (wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 border-none shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white ring-1 ring-emerald-100/50 shadow-2xl'} rounded-[3rem] p-7 max-w-sm w-full relative`} style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any}>
           <button 
             onClick={() => setShowLoggingModal(false)} 
             className={`absolute top-5 right-5 p-2 rounded-full transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-orange-500' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'}`}
             style={{ WebkitAppRegion: 'no-drag' } as any}
             title="Close"
           >
             <X size={18} />
           </button>
           <h2 className={`text-2xl font-black mb-6 tracking-tight ${darkMode ? 'text-white' : 'text-emerald-950'}`}>Session Detail</h2>
           <div className="space-y-5">
              <section className={`${darkMode ? 'bg-black/40 border-white/5 shadow-inner' : 'bg-emerald-50/20 border-emerald-50/50'} p-5 rounded-[2rem] border`}>
                 <h3 className={`text-sm font-black tracking-tight mb-4 flex items-center gap-2.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}><Clock size={16} className={darkMode ? 'text-emerald-500/60' : 'text-emerald-500'}/> Timer Intervals</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`text-xs font-black block tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Focus Mode</label>
                      <div className="relative">
                        <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className={`w-full border rounded-2xl p-3.5 pr-10 text-[15px] font-black outline-none font-mono transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white focus:ring-4 focus:ring-emerald-500/10' : 'bg-white border-emerald-100 text-emerald-900 shadow-sm focus:ring-4 focus:ring-emerald-500/5'}`} />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-tight ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>Min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={`text-xs font-black block tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Rest Mode</label>
                      <div className="relative">
                        <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className={`w-full border rounded-2xl p-3.5 pr-10 text-[15px] font-black outline-none font-mono transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white focus:ring-4 focus:ring-emerald-500/10' : 'bg-white border-emerald-100 text-emerald-900 shadow-sm focus:ring-4 focus:ring-emerald-500/5'}`} />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-tight ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>Min</span>
                      </div>
                    </div>
                 </div>
              </section>

              <section>
                <label className={`text-[11px] font-bold block mb-2 tracking-tight pl-1 ${darkMode ? 'text-emerald-500/60' : 'text-emerald-600'}`}>Category</label>
                <CategoryPicker />
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
                className={`w-full py-4 text-white rounded-[1.5rem] text-sm font-bold tracking-tight mt-2 active:scale-[0.98] transition-all ${darkMode ? 'bg-zinc-800 hover:bg-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-emerald-600 shadow-[0_10px_30px_rgba(5,150,105,0.2)]'}`}
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
