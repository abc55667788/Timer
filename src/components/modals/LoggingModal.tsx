import React from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { Category, CATEGORIES, Task, DEFAULT_CATEGORY_DATA } from '../../types';

interface LoggingModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  loggingData: Task;
  setLoggingData: (task: Task) => void;
  tempWorkMin: string;
  tempRestMin: string;
  setTempWorkMin: (val: string) => void;
  setTempRestMin: (val: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'current' | 'manual' | 'edit') => void;
  handleStartSession?: () => void;
  setShowLoggingModal: (show: boolean) => void;
  handleApplySettings: () => void;
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
  handleImageUpload,
  setShowLoggingModal,
  handleApplySettings,
}) => {
  const handleUpdate = () => {
    handleApplySettings();
    setShowLoggingModal(false);
  };

  const CategoryPicker = () => (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORIES.map(cat => {
        const isSelected = loggingData.category === cat;
        const Icon = DEFAULT_CATEGORY_DATA[cat].icon;
        return (
          <button
            key={cat}
            onClick={() => setLoggingData({...loggingData, category: cat})}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
              isSelected 
                ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                : 'border-transparent bg-gray-50/50 hover:bg-gray-100'
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 ${isSelected ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
              <Icon size={14} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`}>{cat}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any}>
           <button onClick={() => setShowLoggingModal(false)} className="absolute top-5 right-5 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={18} /></button>
           <h2 className="text-2xl font-black text-emerald-950 mb-8 tracking-tight">Session Detail</h2>
           <div className="space-y-6">
              <section className="bg-emerald-50/20 p-6 rounded-[2.5rem] border border-emerald-50/50">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-5 flex items-center gap-2.5"><Clock size={14} className="text-emerald-500"/> Timer Intervals</h3>
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-emerald-400 block tracking-widest pl-1">Focus Mode</label>
                      <div className="relative">
                        <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-2xl p-4 pr-10 text-sm font-black text-emerald-900 outline-none font-mono shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-200 uppercase">Min</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-emerald-400 block tracking-widest pl-1">Rest Mode</label>
                      <div className="relative">
                        <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-2xl p-4 pr-10 text-sm font-black text-emerald-900 outline-none font-mono shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-200 uppercase">Min</span>
                      </div>
                    </div>
                 </div>
              </section>

              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Category</label>
                <CategoryPicker />
              </section>

              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Description</label>
                <textarea 
                  rows={2} 
                  placeholder="What are you working on?" 
                  value={loggingData.description} 
                  onChange={(e) => setLoggingData({...loggingData, description: e.target.value})} 
                  className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl p-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none" 
                />
              </section>
              
              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Photos ({loggingData.images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {loggingData.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setLoggingData({...loggingData, images: loggingData.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                    <Plus size={24} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                  </label>
                </div>
              </section>

              <button onClick={handleUpdate} className="w-full py-4.5 bg-emerald-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(5,150,105,0.2)] mt-2 active:scale-[0.98] transition-all">Update Session</button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default LoggingModal;
