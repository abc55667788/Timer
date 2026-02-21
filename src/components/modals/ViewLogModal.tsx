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
  darkMode?: boolean;
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
  categories,
  darkMode
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
            className={`flex flex-col items-center justify-center p-2 rounded-[1.2rem] border transition-all group/cat ${
              isSelected 
                ? (darkMode ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105' : 'border-emerald-500 bg-emerald-50 shadow-sm') 
                : (darkMode ? 'border-white/5 bg-zinc-800/40 hover:bg-emerald-500/5 hover:border-emerald-500/20' : 'border-transparent bg-gray-50/50 hover:bg-gray-100')
            }`}
          >
            <div className={`p-2 rounded-full mb-1 transition-all ${isSelected ? 'scale-110' : (darkMode ? 'text-zinc-600 group-hover/cat:text-emerald-400' : 'text-gray-400')}`} style={isSelected ? { color: cat.color, backgroundColor: `${cat.color}20` } : {}}>
              <Icon size={16} />
            </div>
            <span className={`text-[10px] font-black tracking-tight transition-colors ${isSelected ? '' : (darkMode ? 'text-zinc-600 group-hover/cat:text-emerald-400' : 'text-gray-400')}`} style={isSelected ? { color: cat.color } : {}}>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  const ViewingIcon = CATEGORY_ICONS[categories.find(c => c.name === viewingLog.category)?.icon as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Briefcase;

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : (darkMode ? 'bg-black/80 backdrop-blur-2xl' : 'bg-black/60 backdrop-blur-xl')} flex items-center justify-center p-6 z-[150] animate-in fade-in duration-300`}>
      <div className={`${darkMode ? 'bg-zinc-900 border-white/5 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white border-white/40 shadow-2xl'} backdrop-blur-3xl rounded-[2.5rem] p-8 w-full relative max-h-[90vh] overflow-y-auto scrollbar-none border transition-all duration-300 ${isEditMode ? 'max-w-lg' : 'max-w-sm'}`} style={{ WebkitAppRegion: 'drag' } as any}>
         <div style={{ WebkitAppRegion: 'no-drag' } as any} onPaste={handleClipboardImagePaste}>
           {!isEditMode ? (
             <div className="animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 ${darkMode ? 'bg-zinc-800 border-white/5 shadow-inner' : 'bg-white/40 border-white/20 shadow-sm'} backdrop-blur-md rounded-[1.8rem] flex items-center justify-center border`}>
                    <ViewingIcon size={32} style={{ color: getCategoryColor(viewingLog.category) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-emerald-950'} leading-tight pr-2 truncate`}>{viewingLog.description || 'Focus Session'}</h2>
                    <div className={`text-[10px] font-black ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} mb-3 ml-0.5 tracking-widest opacity-80 uppercase`}>{formatDisplayDate(viewingLog.startTime)}{viewingLog.endTime && formatDisplayDate(viewingLog.startTime) !== formatDisplayDate(viewingLog.endTime) ? ` - ${formatDisplayDate(viewingLog.endTime)}` : ''}</div>
                    <span className="text-[10px] font-black text-white px-5 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.3)] tracking-widest uppercase inline-block" style={{ backgroundColor: getCategoryColor(viewingLog.category) }}>{viewingLog.category}</span>
                  </div>
               </div>

               {viewingLogMetadata && (
                 <div className="space-y-4 mb-8">
                   <div className="grid grid-cols-3 gap-3">
                     <div className={`rounded-[2rem] border ${darkMode ? 'border-white/5 bg-zinc-800/40 shadow-lg shadow-black/20' : 'border-white/20 bg-white/40 shadow-sm'} backdrop-blur-md p-4.5 flex flex-col items-center justify-center gap-1.5`}>
                       <span className={`text-[9px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} opacity-80 uppercase`}>Start</span>
                       <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-emerald-950'} font-mono tracking-tight`}>{formatClock(viewingLog.startTime)}</span>
                     </div>
                     <div className={`rounded-[2rem] border ${darkMode ? 'border-white/5 bg-zinc-800/40 shadow-lg shadow-black/20' : 'border-white/20 bg-white/40 shadow-sm'} backdrop-blur-md p-4.5 flex flex-col items-center justify-center gap-1.5`}>
                       <span className={`text-[9px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} opacity-80 uppercase`}>End</span>
                       <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-emerald-950'} font-mono tracking-tight`}>{viewingLog.endTime ? formatClock(viewingLog.endTime) : 'Now'}</span>
                     </div>
                     <div className={`rounded-[2rem] border ${darkMode ? 'border-white/5 bg-zinc-800/40 shadow-lg shadow-black/20' : 'border-white/20 bg-white/40 shadow-sm'} backdrop-blur-md p-4.5 flex flex-col items-center justify-center gap-1.5`}>
                       <span className={`text-[9px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} opacity-80 uppercase`}>Time</span>
                       <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-emerald-950'} font-mono tracking-tight`}>{viewingLogMetadata.durationLabel}</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className={`rounded-[2rem] border ${darkMode ? 'border-white/5 bg-zinc-800/40 shadow-lg shadow-black/20' : 'border-white/20 bg-white/40 shadow-sm'} backdrop-blur-md p-4.5 flex items-center justify-between px-6`}>
                       <span className={`text-[10px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} opacity-80 uppercase`}>Focus</span>
                       <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-emerald-950'} font-mono tracking-tight`}>{formatTime(viewingLogMetadata.phaseDetails.work)}</span>
                     </div>
                     <div className={`rounded-[2rem] border ${darkMode ? 'border-white/5 bg-zinc-800/40 shadow-lg shadow-black/20' : 'border-white/20 bg-white/40 shadow-sm'} backdrop-blur-md p-4.5 flex items-center justify-between px-6`}>
                       <span className={`text-[10px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} opacity-80 uppercase`}>Rest</span>
                       <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-emerald-950'} font-mono tracking-tight`}>{formatTime(viewingLogMetadata.phaseDetails.rest)}</span>
                     </div>
                   </div>
                 </div>
               )}

               {viewingLog.images.length > 0 && (
                 <div className="mb-6">
                   <label className={`text-[9px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} block mb-4 pl-1 uppercase opacity-80`}>Photos ({viewingLog.images.length})</label>
                   <div className="grid grid-cols-3 gap-3">
                     {viewingLog.images.map((img, idx) => (
                       <div key={idx} className={`relative aspect-square rounded-2xl overflow-hidden border ${darkMode ? 'border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'border-white shadow-md'} group`}>
                         <img src={img} className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-700" onClick={() => setPreviewImage(img)} />
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {viewingLog.link && (
                 <div className="mb-8 px-1">
                    <label className={`text-[9px] font-black tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} block mb-3 pl-1 uppercase opacity-80`}>Link</label>
                    <a 
                      href={viewingLog.link.startsWith('http') ? viewingLog.link : `https://${viewingLog.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 ${darkMode ? 'bg-zinc-800/50 border-white/5 text-emerald-400 hover:bg-emerald-500/10' : 'bg-white/40 border-white/20 text-emerald-600 hover:bg-white/60 shadow-sm'} backdrop-blur-md rounded-2xl p-4 text-[11px] font-black transition-all group border`}
                    >
                      <LinkIcon size={14} className="flex-shrink-0" />
                      <span className="truncate flex-1">{viewingLog.link}</span>
                      <ExternalLink size={14} className="flex-shrink-0 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </a>
                 </div>
               )}

               <div className="flex gap-3 mt-4">
                 <button 
                   onClick={() => setIsEditMode(true)} 
                   className={`flex-1 py-4.5 ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 shadow-black/40 border border-white/5' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg'} rounded-[1.5rem] font-black tracking-tight active:scale-[0.98] transition-all text-[11px] uppercase`}
                 >
                   Edit
                 </button>
                 <button 
                   onClick={() => { setViewingLog(null); setIsEditMode(false); setPhaseEditTouched(false); }} 
                   className={`flex-1 py-4.5 ${darkMode ? 'bg-zinc-800 text-white hover:bg-orange-500 shadow-black/40 border border-white/5' : 'bg-white/60 text-emerald-600 hover:bg-white/80 border-emerald-100/20 shadow-sm'} backdrop-blur-md rounded-[1.5rem] font-black tracking-tight border active:scale-[0.98] transition-all text-[11px] uppercase`}
                 >
                   Close
                 </button>
                 <button 
                   onClick={() => handleDeleteLog(viewingLog.id)} 
                   className={`flex-1 py-4.5 ${darkMode ? 'bg-zinc-800 text-white hover:bg-red-500 shadow-black/40 border border-white/5' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'} rounded-[1.5rem] font-black tracking-tight border active:scale-[0.98] transition-all text-[11px] uppercase`}
                 >
                   Delete
                 </button>
               </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-emerald-950'} tracking-tight`}>Edit Session</h2>
                    <button 
                      onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} 
                      className={`w-9 h-9 flex items-center justify-center ${darkMode ? 'bg-zinc-800 text-zinc-500 hover:text-orange-500 border border-white/5 shadow-sm' : 'bg-emerald-50 text-emerald-300 hover:text-emerald-600'} rounded-full transition-all cursor-pointer`}
                      style={{ WebkitAppRegion: "no-drag" } as any}
                    >
                      <X size={18} />
                    </button>
                </div>

                <div className="space-y-5">
                  <section>
                    <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} block mb-3 tracking-tight pl-1 uppercase`}>Category</label>
                    <CategoryPicker />
                  </section>
                  
                  <section>
                    <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} block mb-3 tracking-tight pl-1 uppercase`}>Photos ({viewingLog.images.length})</label>
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
                          className={`relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border ${darkMode ? 'border-white/10' : 'border-white'} group cursor-move hover:scale-105 transition-transform`}
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
                      <label className={`w-16 h-16 flex flex-col items-center justify-center ${darkMode ? 'bg-zinc-800 border-white/5 hover:bg-zinc-700 text-zinc-500' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-400'} border-2 border-dashed rounded-2xl cursor-pointer transition-colors shadow-inner`}>
                        <Plus size={24} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} />
                      </label>
                    </div>
                  </section>

                  <section>
                    <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} block mb-3 tracking-tight pl-1 uppercase`}>Link</label>
                    <div className="relative group/link">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-500' : 'text-emerald-300'} group-focus-within/link:text-emerald-500 transition-colors pointer-events-none`}>
                        <LinkIcon size={14} />
                      </div>
                      <input 
                        type="url"
                        placeholder="Paste related link here..." 
                        value={viewingLog.link || ''} 
                        onChange={(e) => setViewingLog({...viewingLog, link: e.target.value})} 
                        className={`w-full ${darkMode ? 'bg-zinc-800 border-white/5 text-emerald-400 placeholder:text-zinc-600 focus:border-emerald-500/30' : 'bg-white border-emerald-100 text-emerald-900 placeholder-emerald-100 focus:border-emerald-300 shadow-sm'} border rounded-2xl p-4 pl-11 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all truncate`} 
                      />
                    </div>
                  </section>

                  <section className={`${darkMode ? 'bg-zinc-800/40 border-white/5 shadow-inner' : 'bg-emerald-50/20 border-emerald-50/80'} p-6 rounded-[2.5rem] border space-y-6`}>
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} tracking-tight pl-2 uppercase`}>Session Date</label>
                      <DatePicker 
                        value={editStartDate} 
                        onChange={(val) => {
                          setEditStartDate(val);
                          setEditEndDate(val);
                        }} 
                        darkMode={darkMode}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} tracking-tight pl-2 uppercase`}>Start</label>
                        <TimePicker 
                          value={editStartTime} 
                          onChange={setEditStartTime} 
                          className="text-[11px]"
                          darkMode={darkMode}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} tracking-tight pl-2 uppercase`}>End</label>
                        <TimePicker 
                          value={editEndTime} 
                          onChange={setEditEndTime} 
                          className="text-[11px]"
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                    {editTimeError && <div className={`text-[10px] text-red-500 font-bold text-center ${darkMode ? 'bg-red-500/10 border-red-500/20 shadow-sm' : 'bg-red-50/50 border-red-50 shadow-sm'} py-2.5 rounded-xl border animate-shake`}>{editTimeError}</div>}
                  </section>

                  <section className={`grid grid-cols-2 gap-5 ${darkMode ? 'bg-zinc-800/40 border-white/5 shadow-inner' : 'bg-white border-emerald-50 shadow-sm ring-1 ring-emerald-50/50'} p-6 rounded-[2.5rem] border`}>
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} tracking-tight pl-2 uppercase`}>Focus (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editWorkMinutes}
                        onChange={(e) => handleWorkMinutesChange(e.target.value)}
                        className={`w-full ${darkMode ? 'bg-zinc-800 border-white/5 text-emerald-400 focus:border-emerald-500/30' : 'bg-emerald-50/30 border-emerald-100/50 text-emerald-950 shadow-sm'} border rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-400'} tracking-tight pl-2 uppercase`}>Rest (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editRestMinutes}
                        onChange={(e) => handleRestMinutesChange(e.target.value)}
                        className={`w-full ${darkMode ? 'bg-zinc-800 border-white/5 text-emerald-400 focus:border-emerald-500/30' : 'bg-emerald-50/30 border-emerald-100/50 text-emerald-950 shadow-sm'} border rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono transition-all`}
                      />
                    </div>
                  </section>

                  <div className="flex gap-4 pt-4">
                    <button 
                      disabled={!isEditValid} 
                      onClick={handleSaveEdit} 
                      className={`flex-1 py-4.5 rounded-[1.5rem] text-xs font-bold tracking-tight transition-all active:scale-95 ${
                        isEditValid 
                          ? (darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 shadow-xl shadow-black/40 border border-white/5' : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-500 shadow-lg') 
                          : (darkMode ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed')
                      }`}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} 
                      className={`flex-1 py-4.5 ${darkMode ? 'bg-zinc-800 text-white hover:bg-orange-500 shadow-xl shadow-black/40 border border-white/5' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 shadow-sm'} rounded-[1.5rem] text-xs font-bold tracking-tight border active:scale-95 transition-all`}
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
