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
  setPreviewImage
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
                ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                : 'border-transparent bg-gray-50/50 hover:bg-gray-100'
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isSelected ? 'font-bold' : 'text-gray-400'}`} style={isSelected ? { color: cat.color, backgroundColor: `${cat.color}15` } : {}}>
              <Icon size={12} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-colors ${isSelected ? '' : 'text-gray-400'}`} style={isSelected ? { color: cat.color } : {}}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[3rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any}>
           <button 
             onClick={() => setShowLoggingModal(false)} 
             className="absolute top-5 right-5 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer"
             style={{ WebkitAppRegion: 'no-drag' } as any}
             title="Close"
           >
             <X size={18} />
           </button>
           <h2 className="text-xl font-bold text-emerald-950 mb-5 tracking-tight">Session Detail</h2>
           <div className="space-y-4">
              <section className="bg-emerald-50/20 p-5 rounded-[2.5rem] border border-emerald-50/50">
                 <h3 className="text-[12px] font-bold tracking-tight text-emerald-600 mb-3 flex items-center gap-2.5"><Clock size={16} className="text-emerald-500"/> Timer Intervals</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-emerald-600 block tracking-tight pl-1">Focus Mode</label>
                      <div className="relative">
                        <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-2xl p-3 pr-10 text-sm font-black text-emerald-900 outline-none font-mono shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-300 tracking-tight">Min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-emerald-600 block tracking-tight pl-1">Rest Mode</label>
                      <div className="relative">
                        <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-2xl p-3 pr-10 text-sm font-black text-emerald-900 outline-none font-mono shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-300 tracking-tight">Min</span>
                      </div>
                    </div>
                 </div>
              </section>

              <section>
                <label className="text-[11px] font-bold text-emerald-600 block mb-2 tracking-tight pl-1">Category</label>
                <CategoryPicker />
              </section>

              <section>
                <label className="text-[11px] font-bold text-emerald-600 block mb-2 tracking-tight pl-1">Description</label>
                <textarea 
                  rows={2} 
                  placeholder="What are you working on?" 
                  value={loggingData.description} 
                  onChange={(e) => setLoggingData({...loggingData, description: e.target.value})} 
                  className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none font-bold text-emerald-900" 
                />
              </section>
              
              <section>
                <label className="text-[11px] font-bold text-emerald-600 block mb-2 tracking-tight pl-1">Photos ({loggingData.images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {loggingData.images.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md group active:scale-95 transition-all">
                      <img 
                        src={img} 
                        className="w-full h-full object-cover cursor-zoom-in" 
                        onClick={() => setPreviewImage?.(img)}
                      />
                      <button onClick={() => setLoggingData({...loggingData, images: loggingData.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-sm"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="w-14 h-14 flex items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                    <Plus size={20} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                  </label>
                </div>
              </section>

              <section>
                <label className="text-[11px] font-bold text-emerald-600 block mb-2 tracking-tight pl-1">Link</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                    <LinkIcon size={14} />
                  </div>
                  <input 
                    type="url"
                    placeholder="https://..." 
                    value={loggingData.link || ''} 
                    onChange={(e) => setLoggingData({...loggingData, link: e.target.value})} 
                    className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl p-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-emerald-900 truncate" 
                  />
                </div>
              </section>

              <button onClick={handleUpdate} className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] text-sm font-bold tracking-tight shadow-[0_10px_30px_rgba(5,150,105,0.2)] mt-2 active:scale-[0.98] transition-all">Update Session</button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default LoggingModal;
