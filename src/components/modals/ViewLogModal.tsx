import React from 'react';
import { 
  X, Edit2, ChevronRight, FileText, Image as ImageIcon, Plus, 
  Trash2, Calendar, Clock, Link as LinkIcon, ExternalLink, Copy
} from 'lucide-react';
import { LogEntry, Category, CategoryData, CATEGORY_ICONS } from '../../types';
import TimePicker from '../TimePicker';
import DatePicker from '../DatePicker';

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
  categories: CategoryData[];
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
  viewingLogMetadata,
  categories
}) => {
  const CategoryPicker = () => (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((cat, idx) => {
        const isSelected = viewingLog.category === cat.name;
        const color = cat.color;
        const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;
        return (
          <button
            key={idx}
            onClick={() => setViewingLog({...viewingLog, category: cat.name})}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
              isSelected 
                ? 'border-emerald-500 bg-white/60 backdrop-blur-md shadow-sm' 
                : 'border-transparent bg-white/20 backdrop-blur-sm hover:bg-white/40'
            }`}
          >
            <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isSelected ? '' : 'text-gray-400'}`} style={{ backgroundColor: isSelected ? `${color}15` : undefined, color: isSelected ? color : undefined }}>
              <Icon size={14} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-colors ${isSelected ? '' : 'text-gray-400'}`} style={{ color: isSelected ? color : undefined }}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  const ViewingIcon = CATEGORY_ICONS[categories.find(c => c.name === viewingLog.category)?.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-950/40 backdrop-blur-xl'} flex items-center justify-center p-6 z-[150] animate-in fade-in duration-300`}>
      <div className={`bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border border-white/40 ring-1 ring-emerald-100/20 transition-all duration-300 ${isEditMode ? 'max-w-lg' : 'max-w-sm'}`} style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} onPaste={handleClipboardImagePaste}>
           {!isEditMode ? (
             <div className="animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-sm border border-white/20">
                    <ViewingIcon size={32} style={{ color: getCategoryColor(viewingLog.category) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-emerald-950 leading-tight pr-2 tracking-tight truncate">{viewingLog.description || 'Focus Session'}</h2>
                    <div className="text-[11px] font-bold text-emerald-400 mb-3 ml-0.5 tracking-tight opacity-80">{formatDisplayDate(viewingLog.startTime)}{viewingLog.endTime && formatDisplayDate(viewingLog.startTime) !== formatDisplayDate(viewingLog.endTime) ? ` - ${formatDisplayDate(viewingLog.endTime)}` : ''}</div>
                    <span className="text-[10px] font-bold text-white px-4 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] tracking-tight inline-block" style={{ backgroundColor: getCategoryColor(viewingLog.category) }}>{viewingLog.category}</span>
                  </div>
               </div>

               {viewingLogMetadata && (
                 <div className="space-y-4 mb-8">
                   <div className="grid grid-cols-3 gap-3">
                     <div className="rounded-[1.5rem] border border-white/20 bg-white/40 backdrop-blur-md p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                       <span className="text-[10px] font-bold tracking-tight text-emerald-400 opacity-80 uppercase">Start</span>
                       <span className="text-base font-bold text-emerald-950 font-mono tracking-tight">{formatClock(viewingLog.startTime)}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-white/20 bg-white/40 backdrop-blur-md shadow-sm p-4 flex flex-col items-center justify-center gap-1.5">
                       <span className="text-[10px] font-bold tracking-tight text-emerald-400 opacity-80 uppercase">End</span>
                       <span className="text-base font-bold text-emerald-950 font-mono tracking-tight">{viewingLog.endTime ? formatClock(viewingLog.endTime) : 'Now'}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-white/20 bg-white/40 backdrop-blur-md p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                       <span className="text-[10px] font-bold tracking-tight text-emerald-400 opacity-80 uppercase">Time</span>
                       <span className="text-base font-bold text-emerald-950 font-mono tracking-tight">{viewingLogMetadata.durationLabel}</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="rounded-[1.5rem] border border-white/20 bg-white/40 backdrop-blur-md p-4 flex items-center justify-between px-6 shadow-sm">
                       <span className="text-[11px] font-bold tracking-tight text-emerald-400 opacity-80">Focus</span>
                       <span className="text-sm font-bold text-emerald-900 font-mono tracking-tight">{formatTime(viewingLogMetadata.phaseDetails.work)}</span>
                     </div>
                     <div className="rounded-[1.5rem] border border-white/20 bg-white/40 backdrop-blur-md p-4 flex items-center justify-between px-6 shadow-sm">
                       <span className="text-[11px] font-bold tracking-tight text-emerald-400 opacity-80">Rest</span>
                       <span className="text-sm font-bold text-emerald-900 font-mono tracking-tight">{formatTime(viewingLogMetadata.phaseDetails.rest)}</span>
                     </div>
                   </div>
                 </div>
               )}

               {viewingLog.images.length > 0 && (
                 <div className="mb-6">
                   <label className="text-[10px] font-bold tracking-tight text-emerald-400 block mb-4 pl-1 uppercase">Photos ({viewingLog.images.length})</label>
                   <div className="grid grid-cols-3 gap-3">
                     {viewingLog.images.map((img, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white shadow-md group">
                         <img src={img} className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-700" onClick={() => setPreviewImage(img)} />
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {viewingLog.link && (
                 <div className="mb-8 px-1">
                    <label className="text-[10px] font-bold tracking-tight text-emerald-400 block mb-3 pl-1 uppercase">Link</label>
                    <a 
                      href={viewingLog.link.startsWith('http') ? viewingLog.link : `https://${viewingLog.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-[11px] font-bold text-emerald-600 hover:bg-white/60 transition-all group shadow-sm"
                    >
                      <LinkIcon size={14} className="flex-shrink-0" />
                      <span className="truncate flex-1">{viewingLog.link}</span>
                      <ExternalLink size={14} className="flex-shrink-0 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </a>
                 </div>
               )}

               <div className="flex gap-3 mt-4">
                 <button onClick={() => setIsEditMode(true)} className="flex-1 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black tracking-tight shadow-lg shadow-emerald-200 hover:brightness-110 active:scale-[0.98] transition-all text-[11px]">Edit</button>
                 <button onClick={() => { setViewingLog(null); setIsEditMode(false); setPhaseEditTouched(false); }} className="flex-1 py-4 bg-white/60 backdrop-blur-md text-emerald-600 rounded-[1.5rem] font-black tracking-tight border border-white/20 shadow-sm hover:bg-white/80 active:scale-[0.98] transition-all text-[11px]">Close</button>
                 <button onClick={() => handleDeleteLog(viewingLog.id)} className="flex-1 py-4 bg-red-50 text-red-500 rounded-[1.5rem] font-black tracking-tight border border-red-100 hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all text-[11px]">Delete</button>
               </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-emerald-950 tracking-tight">Edit Session</h2>
                    <button 
                      onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} 
                      className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all cursor-pointer"
                      style={{ WebkitAppRegion: "no-drag" } as any}
                    >
                      <X size={18} />
                    </button>
                </div>

                <div className="space-y-5">
                  <section>
                    <label className="text-[10px] font-bold text-emerald-400 block mb-3 tracking-tight pl-1 uppercase">Category</label>
                    <CategoryPicker />
                  </section>
                  
                  <section>
                    <label className="text-[10px] font-bold text-emerald-400 block mb-3 tracking-tight pl-1 uppercase">Photos ({viewingLog.images.length})</label>
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
                          {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-[7px] text-white font-bold text-center py-0.5 tracking-tight">Main</div>}
                        </div>
                      ))}
                      <label className="w-16 h-16 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors">
                        <Plus size={24} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} />
                      </label>
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-bold text-emerald-400 block mb-3 tracking-tight pl-1 uppercase">Link</label>
                    <div className="relative group/link">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 group-focus-within/link:text-emerald-500 transition-colors pointer-events-none">
                        <LinkIcon size={14} />
                      </div>
                      <input 
                        type="url"
                        placeholder="Paste related link here..." 
                        value={viewingLog.link || ''} 
                        onChange={(e) => setViewingLog({...viewingLog, link: e.target.value})} 
                        className="w-full bg-white border border-emerald-100 rounded-2xl p-4 pl-10 pr-4 text-xs font-bold text-emerald-900 outline-none shadow-sm focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/5 transition-all truncate" 
                      />
                    </div>
                  </section>

                  <section className="bg-emerald-50/20 p-6 rounded-[2.5rem] border border-emerald-50/80 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-emerald-400 tracking-tight pl-2">Session Date</label>
                      <DatePicker 
                        value={editStartDate} 
                        onChange={(val) => {
                          setEditStartDate(val);
                          setEditEndDate(val);
                        }} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-emerald-400 tracking-tight pl-2">Start</label>
                        <TimePicker 
                          value={editStartTime} 
                          onChange={setEditStartTime} 
                          className="text-[11px]"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-emerald-400 tracking-tight pl-2">End</label>
                        <TimePicker 
                          value={editEndTime} 
                          onChange={setEditEndTime} 
                          className="text-[11px]"
                        />
                      </div>
                    </div>
                    {editTimeError && <div className="text-[10px] text-red-500 font-bold text-center bg-red-50/50 py-2.5 rounded-xl border border-red-50">{editTimeError}</div>}
                  </section>

                  <section className="grid grid-cols-2 gap-5 bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm ring-1 ring-emerald-50/50">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-emerald-400 tracking-tight pl-2">Focus (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editWorkMinutes}
                        onChange={(e) => handleWorkMinutesChange(e.target.value)}
                        className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3.5 text-sm font-bold text-emerald-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-emerald-400 tracking-tight pl-2">Rest (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editRestMinutes}
                        onChange={(e) => handleRestMinutesChange(e.target.value)}
                        className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-3.5 text-sm font-bold text-emerald-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all"
                      />
                    </div>
                  </section>

                  <div className="flex gap-4 pt-4">
                    <button 
                      disabled={!isEditValid} 
                      onClick={handleSaveEdit} 
                      className={`flex-1 py-4.5 rounded-[1.5rem] text-xs font-bold tracking-tight shadow-lg transition-all active:scale-95 ${
                        isEditValid ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'
                      }`}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} 
                      className="flex-1 py-4.5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] text-xs font-bold tracking-tight border border-emerald-100 active:scale-95 transition-all"
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
