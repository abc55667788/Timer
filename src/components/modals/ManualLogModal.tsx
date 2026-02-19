import React from 'react';
import { X, Plus, Calendar, Clock, Edit3 } from 'lucide-react';
import { Category, CATEGORIES, DEFAULT_CATEGORY_DATA } from '../../types';

interface ManualLogModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  manualLog: { category: Category; description: string; date: string; startTime: string; endTime: string; images: string[] };
  setManualLog: (log: any) => void;
  manualLogError: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'current' | 'manual' | 'edit') => void;
  saveManualLog: () => void;
  setShowManualModal: (show: boolean) => void;
  isManualLogValid: boolean;
  setPreviewImage: (img: string | null) => void;
}

const ManualLogModal: React.FC<ManualLogModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  manualLog,
  setManualLog,
  manualLogError,
  handleImageUpload,
  saveManualLog,
  setShowManualModal,
  isManualLogValid,
  setPreviewImage
}) => {
  const CategoryPicker = () => (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORIES.map(cat => {
        const isSelected = manualLog.category === cat;
        const Icon = DEFAULT_CATEGORY_DATA[cat].icon;
        return (
          <button
            key={cat}
            onClick={() => setManualLog({...manualLog, category: cat})}
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
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[160] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[4rem] p-10 max-w-xl w-full shadow-3xl relative overflow-y-auto max-h-[90vh] scrollbar-none ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any}>
           <button onClick={() => setShowManualModal(false)} className="absolute top-6 right-6 p-2.5 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"><X size={20} /></button>
           
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-[1.2rem] flex items-center justify-center text-emerald-600">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-950 tracking-tight leading-none">Add Session</h2>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Manual Journal Entry</p>
              </div>
           </div>

           <div className="space-y-6">
              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Category</label>
                <CategoryPicker />
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section>
                  <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    <input type="date" value={manualLog.date} onChange={(e) => setManualLog({...manualLog, date: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                  </div>
                </section>
                <section className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Start</label>
                    <input type="time" value={manualLog.startTime} onChange={(e) => setManualLog({...manualLog, startTime: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl py-3.5 px-3 text-xs font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">End</label>
                    <input type="time" value={manualLog.endTime} onChange={(e) => setManualLog({...manualLog, endTime: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl py-3.5 px-3 text-xs font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                  </div>
                </section>
              </div>

              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Notes</label>
                <div className="relative">
                  <Edit3 size={14} className="absolute left-4 top-4 text-emerald-300 pointer-events-none" />
                  <textarea rows={2} placeholder="What did you work on?" value={manualLog.description} onChange={(e) => setManualLog({...manualLog, description: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-50 rounded-[1.5rem] py-4 pl-11 pr-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none" />
                </div>
              </section>
              
              <section>
                <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Photos ({manualLog.images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {manualLog.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      draggable 
                      onDragStart={(e) => { e.dataTransfer.setData('imageIdx', idx.toString()); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = parseInt(e.dataTransfer.getData('imageIdx'));
                        const toIdx = idx;
                        if (!isNaN(fromIdx) && fromIdx !== toIdx) {
                           const newImgs = [...manualLog.images];
                           const [moved] = newImgs.splice(fromIdx, 1);
                           newImgs.splice(toIdx, 0, moved);
                           setManualLog({...manualLog, images: newImgs});
                        }
                      }}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md group cursor-move hover:scale-105 transition-transform"
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover" 
                        onClick={() => setPreviewImage(img)}
                        title="Drag to reorder"
                      />
                      <button onClick={() => setManualLog({...manualLog, images: manualLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-[7px] text-white font-black uppercase text-center py-0.5 tracking-widest">Main</div>}
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                    <Plus size={24} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'manual')} />
                  </label>
                </div>
              </section>

              {manualLogError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[10px] font-black text-red-500 text-center animate-shake">
                  {manualLogError}
                </div>
              )}
              
              <button disabled={!isManualLogValid} onClick={saveManualLog} className={`w-full py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] ${isManualLogValid ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Save Journal Entry</button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ManualLogModal;
