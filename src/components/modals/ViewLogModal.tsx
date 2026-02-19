import React from 'react';
import { 
  X, Edit2, ChevronRight, FileText, Image as ImageIcon, Plus, 
  Trash2, Calendar, Clock 
} from 'lucide-react';
import { LogEntry, Category, CATEGORIES, DEFAULT_CATEGORY_DATA } from '../../types';

interface ViewLogModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  viewingLog: LogEntry;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  handleClipboardImagePaste: (e: React.ClipboardEvent) => void;
  getCategoryColor: (cat: Category) => string;
  formatDisplayDate: (time: number) => string;
  setViewingLog: (log: LogEntry | null) => void;
  formatTime: (time: number) => string;
  formatClock?: (time: number) => string;
  setPreviewImage: (img: string | null) => void;
  handleDeleteLog: (id: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'manual' | 'current' | 'edit') => void;
  editStartDate: string;
  setEditStartDate: (val: string) => void;
  editStartTime: string;
  setEditStartTime: (val: string) => void;
  editEndDate: string;
  setEditEndDate: (val: string) => void;
  editEndTime: string;
  setEditEndTime: (val: string) => void;
  editTimeError: string | null;
  editWorkMinutes: number;
  handleWorkMinutesChange: (val: string) => void;
  editRestMinutes: number;
  handleRestMinutesChange: (val: string) => void;
  isEditValid: boolean;
  handleSaveEdit: () => void;
  setPhaseEditTouched: (val: boolean) => void;
  viewingLogMetadata?: any;
}

const ViewLogModal: React.FC<ViewLogModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  viewingLog,
  isEditMode,
  setIsEditMode,
  handleClipboardImagePaste,
  getCategoryColor,
  formatDisplayDate,
  setViewingLog,
  formatTime,
  formatClock = formatTime,
  setPreviewImage,
  handleDeleteLog,
  handleImageUpload,
  editStartDate,
  setEditStartDate,
  editStartTime,
  setEditStartTime,
  editEndDate,
  setEditEndDate,
  editEndTime,
  setEditEndTime,
  editTimeError,
  editWorkMinutes,
  handleWorkMinutesChange,
  editRestMinutes,
  handleRestMinutesChange,
  isEditValid,
  handleSaveEdit,
  setPhaseEditTouched,
  viewingLogMetadata
}) => {
  const CategoryPicker = () => (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORIES.map(cat => {
        const isSelected = viewingLog.category === cat;
        const color = getCategoryColor(cat);
        const Icon = DEFAULT_CATEGORY_DATA[cat].icon;
        return (
          <button
            key={cat}
            onClick={() => setViewingLog({...viewingLog, category: cat})}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
              isSelected 
                ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                : 'border-transparent bg-gray-50/50 hover:bg-gray-100'
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} style={{ backgroundColor: isSelected ? `${color}15` : undefined }}>
              <Icon size={14} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`}>{cat}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[150] animate-in fade-in duration-300`}>
      <div className={`bg-white rounded-[3rem] p-8 w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none ring-1 ring-emerald-100/50 transition-all duration-300 ${isEditMode ? 'max-w-lg' : 'max-w-sm'}`} style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} onPaste={handleClipboardImagePaste}>
           {!isEditMode ? (
             <div className="animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner ring-4 ring-white">
                    {React.createElement(DEFAULT_CATEGORY_DATA[viewingLog.category].icon, { size: 32 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-black text-emerald-950 leading-tight pr-2 tracking-tighter truncate">{viewingLog.description || 'Focus Session'}</h2>
                    <div className="text-xs font-bold text-emerald-400 mb-3 ml-0.5">{formatDisplayDate(viewingLog.startTime)}{viewingLog.endTime && formatDisplayDate(viewingLog.startTime) !== formatDisplayDate(viewingLog.endTime) ? ` - ${formatDisplayDate(viewingLog.endTime)}` : ''}</div>
                    <span className="text-[10px] font-black text-white uppercase px-4 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] tracking-widest inline-block" style={{ backgroundColor: getCategoryColor(viewingLog.category) }}>{viewingLog.category}</span>
                  </div>
               </div>

               {viewingLogMetadata && (
                 <div className="space-y-4 mb-8">
                   <div className="grid grid-cols-3 gap-3">
                     <div className="rounded-[1.5rem] border border-emerald-50 bg-emerald-50/70 p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-80">Start</span>
                       <span className="text-base font-black text-emerald-950 font-mono">{formatClock(viewingLog.startTime)}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-emerald-50 bg-white shadow-sm p-4 flex flex-col items-center justify-center gap-1.5">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-80">End</span>
                       <span className="text-base font-black text-emerald-950 font-mono">{viewingLog.endTime ? formatClock(viewingLog.endTime) : 'Now'}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-emerald-50 bg-emerald-50/40 p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-80">Time</span>
                       <span className="text-base font-black text-emerald-950 font-mono">{viewingLogMetadata.durationLabel}</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="rounded-[1.5rem] border border-emerald-50 bg-white p-4 flex items-center justify-between px-6 shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Work</span>
                       <span className="text-sm font-black text-emerald-900 font-mono">{formatTime(viewingLogMetadata.phaseDetails.work)}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-emerald-50 bg-white p-4 flex items-center justify-between px-6 shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Rest</span>
                       <span className="text-sm font-black text-emerald-900 font-mono">{formatTime(viewingLogMetadata.phaseDetails.rest)}</span>
                     </div>
                   </div>
                 </div>
               )}

               {viewingLog.images.length > 0 && (
                 <div className="mb-8">
                   <label className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase block mb-4 pl-1">Photos ({viewingLog.images.length})</label>
                   <div className="grid grid-cols-3 gap-3">
                     {viewingLog.images.map((img, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-md group">
                         <img src={img} className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-700" onClick={() => setPreviewImage({ url: img, logId: viewingLog.id })} />
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               <div className="space-y-3">
                 <button onClick={() => setIsEditMode(true)} className="w-full py-4.5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(5,150,105,0.2)] hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm">
                   <Plus size={20} className="rotate-45" /> Update Entry
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => { setViewingLog(null); setIsEditMode(false); setPhaseEditTouched(false); }} className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] border border-emerald-100 hover:bg-emerald-100 active:scale-[0.98] transition-all text-[11px]">Close</button>
                   <button onClick={() => handleDeleteLog(viewingLog.id)} className="w-full py-4 bg-white text-red-400 border border-red-50 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-red-50 active:scale-[0.98] transition-all text-[11px]">Delete</button>
                 </div>
               </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Edit Session</h2>
                    <button onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} className="p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all"><X size={18} /></button>
                </div>

                <div className="space-y-5">
                  <section>
                    <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Category</label>
                    <CategoryPicker />
                  </section>

                  <section>
                    <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Description</label>
                    <textarea 
                      rows={2} 
                      placeholder="What did you achieve?"
                      value={viewingLog.description} 
                      onChange={(e) => setViewingLog({...viewingLog, description: e.target.value})} 
                      className="w-full bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 text-xs outline-none resize-none shadow-sm focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                    />
                  </section>
                  
                  <section>
                    <label className="text-[10px] font-black uppercase text-emerald-400 block mb-3 tracking-widest pl-1">Photos ({viewingLog.images.length})</label>
                    <div className="flex flex-wrap gap-3">
                      {viewingLog.images.map((img, idx) => (
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
                               const newImgs = [...viewingLog.images];
                               const [moved] = newImgs.splice(fromIdx, 1);
                               newImgs.splice(toIdx, 0, moved);
                               setViewingLog({...viewingLog, images: newImgs});
                            }
                          }}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white group cursor-move hover:scale-105 transition-transform"
                        >
                          <img 
                            src={img} 
                            className="w-full h-full object-cover" 
                            onClick={() => setPreviewImage(img)}
                            title="Drag to reorder"
                          />
                          <button onClick={() => setViewingLog({...viewingLog, images: viewingLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1.5 bg-red-500/90 text-white rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                          {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-[7px] text-white font-black uppercase text-center py-0.5 tracking-widest">Main</div>}
                        </div>
                      ))}
                      <label className="w-16 h-16 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors">
                        <Plus size={24} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} />
                      </label>
                    </div>
                  </section>

                  <section className="bg-emerald-50/20 p-6 rounded-[2.5rem] border border-emerald-50/80 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pl-2">Start Time</label>
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <Calendar size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
                            <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-emerald-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                          </div>
                          <div className="relative">
                            <Clock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
                            <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-emerald-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pl-2">End Time</label>
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <Calendar size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
                            <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-emerald-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                          </div>
                          <div className="relative">
                            <Clock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
                            <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-emerald-800 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {editTimeError && <div className="text-[10px] text-red-500 font-bold text-center bg-red-50/50 py-2.5 rounded-xl border border-red-50">{editTimeError}</div>}
                  </section>

                  <section className="grid grid-cols-2 gap-5 bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm ring-1 ring-emerald-50/50">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pl-2">Focus (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editWorkMinutes}
                        onChange={(e) => handleWorkMinutesChange(e.target.value)}
                        className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3.5 text-sm font-black text-emerald-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pl-2">Rest (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editRestMinutes}
                        onChange={(e) => handleRestMinutesChange(e.target.value)}
                        className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3.5 text-sm font-black text-emerald-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all"
                      />
                    </div>
                  </section>

                  <div className="flex gap-4 pt-4">
                    <button 
                      disabled={!isEditValid} 
                      onClick={handleSaveEdit} 
                      className={`flex-1 py-4.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                        isEditValid ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'
                      }`}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} 
                      className="flex-1 py-4.5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] border border-emerald-100 active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default ViewLogModal;
