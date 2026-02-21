import React from 'react';
import { X, Plus, Calendar, Clock, Edit3, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import { Category, CategoryData, CATEGORY_ICONS } from '../../types';
import TimePicker from '../TimePicker';
import DatePicker from '../DatePicker';

interface ManualLogModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  manualLog: { category: Category; description: string; date: string; startTime: string; endTime: string; images: string[]; link?: string };
  setManualLog: (log: any) => void;
  manualLogError: string | null;
  categories: CategoryData[];
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
  categories,
  handleImageUpload,
  saveManualLog,
  setShowManualModal,
  isManualLogValid,
  setPreviewImage
}) => {
  const CategoryPicker = () => (
    <div className="grid grid-cols-5 gap-2">
      {categories.map((cat, idx) => {
        const isSelected = manualLog.category === cat.name;
        const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;
        return (
          <button
            key={idx}
            onClick={() => setManualLog({...manualLog, category: cat.name})}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all ${
              isSelected 
                ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                : 'border-transparent bg-gray-50/50 hover:bg-gray-100'
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isSelected ? 'font-bold' : 'text-gray-400'}`} style={isSelected ? { color: cat.color, backgroundColor: `${cat.color}15` } : {}}>
              <Icon size={12} />
            </div>
            <span className={`text-[7.5px] font-bold tracking-tight transition-colors ${isSelected ? '' : 'text-gray-400'}`} style={isSelected ? { color: cat.color } : {}}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[160] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[3rem] p-7 max-w-sm w-full shadow-3xl relative overflow-y-auto max-h-[90vh] scrollbar-none ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button 
              onClick={() => setShowManualModal(false)} 
              className="absolute top-5 right-5 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer"
              style={{ WebkitAppRegion: 'no-drag' } as any}
              title="Close"
            >
              <X size={18} />
            </button>
           
           <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-[1rem] flex items-center justify-center text-emerald-600">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950 tracking-tight leading-none">Add Session</h2>
                <p className="text-[10px] font-bold text-emerald-600 tracking-tight mt-1">Manual Journal Entry</p>
              </div>
           </div>

           <div className="space-y-4">
              <section>
                <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Category</label>
                <CategoryPicker />
              </section>

              <div className="grid grid-cols-1 gap-4">
                <section>
                  <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Date</label>
                  <DatePicker 
                    value={manualLog.date} 
                    onChange={(val) => setManualLog({...manualLog, date: val})} 
                  />
                </section>
                <section className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Start</label>
                    <TimePicker 
                      value={manualLog.startTime} 
                      onChange={(val) => setManualLog({...manualLog, startTime: val})} 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">End</label>
                    <TimePicker 
                      value={manualLog.endTime} 
                      onChange={(val) => setManualLog({...manualLog, endTime: val})} 
                    />
                  </div>
                </section>
              </div>

              <section>
                <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Notes</label>
                <div className="relative">
                  <Edit3 size={14} className="absolute left-4 top-3 text-emerald-300 pointer-events-none" />
                  <textarea rows={2} placeholder="What did you work on?" value={manualLog.description} onChange={(e) => setManualLog({...manualLog, description: e.target.value})} className="w-full bg-emerald-50/50 border border-emerald-50 rounded-[1.5rem] p-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none text-emerald-900 font-bold tracking-tight" />
                </div>
              </section>

              <section>
                <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Photos ({manualLog.images.length})</label>
                <div className="flex flex-wrap gap-3">
                  {manualLog.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md group cursor-move hover:scale-105 transition-transform"
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover" 
                        onClick={() => setPreviewImage(img)}
                      />
                      <button onClick={() => setManualLog({...manualLog, images: manualLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-[7px] text-white font-bold tracking-tight text-center py-0.5 tracking-tight">Main</div>}
                    </div>
                  ))}
                  <label className="w-14 h-14 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                    <Plus size={20} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'manual')} />
                  </label>
                </div>
              </section>

              <section>
                <label className="text-[11px] font-bold tracking-tight text-emerald-600 block mb-2 pl-1">Link</label>
                <div className="relative group">
                  <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="url"
                    placeholder="https://..." 
                    value={manualLog.link || ''} 
                    onChange={(e) => setManualLog({...manualLog, link: e.target.value})} 
                    className="w-full bg-emerald-50/50 border border-emerald-50 rounded-2xl p-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-emerald-900 font-bold tracking-tight truncate" 
                  />
                </div>
              </section>

              {manualLogError && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-[10px] font-bold text-red-500 text-center animate-shake tracking-tight">
                  {manualLogError}
                </div>
              )}
              
              <button disabled={!isManualLogValid} onClick={saveManualLog} className={`w-full py-4 rounded-[1.8rem] text-sm font-bold tracking-tight shadow-2xl transition-all active:scale-[0.98] ${isManualLogValid ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Save Entry</button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ManualLogModal;
