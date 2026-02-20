import React from 'react';
import { X, Quote, Link, Trash2, Plus } from 'lucide-react';
import { Inspiration } from '../../types';

interface InspirationModalProps {
  wasMiniModeBeforeModal: boolean;
  isMiniMode: boolean;
  selectedInspiration: Inspiration | null;
  newInspiration: { title: string; content: string; url: string; images?: string[] };
  setNewInspiration: React.Dispatch<React.SetStateAction<{ title: string; content: string; url: string; images: string[] }>>;
  setSelectedInspiration: React.Dispatch<React.SetStateAction<Inspiration | null>>;
  setShowInspirationModal: (show: boolean) => void;
  setInspirations: React.Dispatch<React.SetStateAction<Inspiration[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'inspiration') => void;
  handleClipboardImagePaste: (e: React.ClipboardEvent) => void;
  setPreviewImage?: (img: string | null) => void;
}

const InspirationModal: React.FC<InspirationModalProps> = ({
  wasMiniModeBeforeModal,
  isMiniMode,
  selectedInspiration,
  newInspiration,
  setNewInspiration,
  setSelectedInspiration,
  setShowInspirationModal,
  setInspirations,
  handleImageUpload,
  handleClipboardImagePaste,
  setPreviewImage,
}) => {
  const handleSave = () => {
    if (selectedInspiration) {
      setInspirations(prev => prev.map(i => i.id === selectedInspiration.id ? selectedInspiration : i));
    } else {
      if (!newInspiration.content.trim()) return;
      setInspirations(prev => [{ 
        id: Date.now().toString(), 
        title: newInspiration.title.trim(), 
        content: newInspiration.content.trim(),
        url: newInspiration.url.trim(),
        date: Date.now(),
        images: newInspiration.images || []
      }, ...prev]);
    }
    setShowInspirationModal(false);
  };

  const currentData = selectedInspiration || newInspiration;
  const updateField = (field: string, value: any) => {
    if (selectedInspiration) {
      setSelectedInspiration({ ...selectedInspiration, [field]: value });
    } else {
      setNewInspiration({ ...newInspiration, [field]: value });
    }
  };

  return (
    <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[190] animate-in fade-in duration-300`}>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50 transition-all" onPaste={handleClipboardImagePaste} style={{ WebkitAppRegion: 'drag' } as any}>
        <div style={{ WebkitAppRegion: 'no-drag' } as any} className="scrollbar-none overflow-y-auto max-h-[85vh]">
          <button 
            onClick={() => setShowInspirationModal(false)} 
            className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-95 z-50 flex items-center justify-center cursor-pointer"
            style={{ WebkitAppRegion: 'no-drag' } as any}
            title="Close"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-sm">
              <Quote size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950 tracking-tight">
                {selectedInspiration ? 'Edit Insight' : 'New Musing'}
              </h2>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Eternal Wisdom</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Title or Source</label>
              <input 
                type="text" 
                value={currentData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Marcus Aurelius, Meditations..." 
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200" 
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Reflection</label>
              <textarea 
                value={currentData.content}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="What echoes in your mind today?" 
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/10 h-32 resize-none leading-relaxed placeholder:text-emerald-200"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Visual Inspiration (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {currentData.images?.map((img, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-emerald-100 group">
                    <img src={img} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setPreviewImage?.(img)} />
                    <button 
                      onClick={() => updateField('images', currentData.images?.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-12 h-12 flex items-center justify-center bg-emerald-50 border border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors text-emerald-300">
                  <Plus size={18} />
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'inspiration')} />
                </label>
              </div>
            </div>

            <div>
               <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Reference Link (Optional)</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300"><Link size={14} /></div>
                  <input 
                    type="text" 
                    value={currentData.url}
                    onChange={(e) => updateField('url', e.target.value)}
                    placeholder="https://..." 
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200" 
                  />
               </div>
            </div>

            <div className="flex gap-3 pt-4">
              {selectedInspiration && (
                <button 
                  onClick={() => { setInspirations(prev => prev.filter(i => i.id !== selectedInspiration.id)); setShowInspirationModal(false); }}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all text-xs"
              >
                {selectedInspiration ? 'Update Insight' : 'Preserve Idea'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationModal;
