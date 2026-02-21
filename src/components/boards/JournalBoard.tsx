import React from 'react';
import { Target, Plus, Check, Minus, Quote, Link as LinkIcon, X } from 'lucide-react';
import { Goal, Inspiration } from '../../types';

interface JournalBoardProps {
  goals: Goal[];
  newGoalText: string;
  setNewGoalText: (text: string) => void;
  setGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void;
  inspirations: Inspiration[];
  setNewInspiration: (insp: { title: string; content: string; url: string }) => void;
  setSelectedInspiration: (insp: Inspiration | null) => void;
  setShowInspirationModal: (show: boolean) => void;
  setPreviewImage?: (img: any) => void;
  onClose?: () => void;
}

const JournalBoard: React.FC<JournalBoardProps> = ({
  goals,
  newGoalText,
  setNewGoalText,
  setGoals,
  inspirations,
  setNewInspiration,
  setSelectedInspiration,
  setShowInspirationModal,
  setPreviewImage,
  onClose
}) => {
  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-3xl border-l border-white/20 shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/40 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-black text-emerald-950 tracking-tight">Journal</h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Daily Plan & Muse</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-300 hover:text-emerald-600 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-8 pb-20">
        {/* Goals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
              <Target size={14} /> Goals
            </h3>
            <span className="text-[9px] font-black text-emerald-500 uppercase">
              {goals.filter(g => g.completed).length}/{goals.length} Done
            </span>
          </div>

          <div className="flex gap-2 group">
            <input 
              type="text" 
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && newGoalText.trim()) { 
                  setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                  setNewGoalText('');
                }
              }}
              placeholder="What's next?" 
              className="flex-1 bg-emerald-50/50 border border-emerald-100/50 rounded-xl px-4 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
            />
            <button 
              onClick={() => {
                if (newGoalText.trim()) {
                  setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                  setNewGoalText('');
                }
              }}
              className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-100"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {goals.length > 0 ? goals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 group bg-white border border-emerald-50/50 p-3 rounded-2xl hover:shadow-sm hover:border-emerald-100 transition-all">
                <button 
                  onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-100 text-transparent hover:border-emerald-300'}`}
                >
                  <Check size={14} strokeWidth={4} />
                </button>
                <span className={`flex-1 text-xs font-bold transition-all ${goal.completed ? 'text-emerald-200 line-through' : 'text-emerald-900'}`}>
                  {goal.text}
                </span>
                <button 
                  onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-emerald-200 hover:text-red-400 transition-all hover:scale-110"
                >
                  <Minus size={14} />
                </button>
              </div>
            )) : (
              <div className="text-center py-8 opacity-20 flex flex-col items-center gap-2">
                 <Target size={32} />
                 <p className="text-[8px] font-black uppercase tracking-widest">No goals set</p>
              </div>
            )}
          </div>
        </section>

        {/* Musings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
              <Quote size={14} /> Musing
            </h3>
            <button 
              onClick={() => { setNewInspiration({ title: '', content: '', url: '' }); setSelectedInspiration(null); setShowInspirationModal(true); }}
              className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 underline underline-offset-4"
            >
              Add New
            </button>
          </div>

          <div className="grid gap-4">
            {inspirations.length > 0 ? inspirations.map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setSelectedInspiration(item); setShowInspirationModal(true); }}
                className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-50/50 hover:bg-emerald-50/40 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                <Quote size={12} className="absolute top-3 right-3 text-emerald-100/50 group-hover:text-emerald-200 transition-colors" />
                <h4 className="text-xs font-black text-emerald-900 mb-1.5 truncate pr-4">{item.title || 'Untitled Thought'}</h4>
                <p className="text-[10px] text-emerald-600/80 leading-relaxed font-bold line-clamp-2 mb-3">{item.content}</p>
                
                {item.images && item.images.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {item.images.slice(0, 3).map((img, idx) => (
                      <div 
                        key={idx} 
                        className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-100 shadow-sm hover:scale-110 transition-transform"
                        onClick={(e) => {
                           e.stopPropagation();
                           setPreviewImage?.(img);
                        }}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {item.images.length > 3 && (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[8px] font-black text-emerald-400">
                        +{item.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                   <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                   {item.url && (
                      <a 
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                        title={item.url}
                      >
                        <LinkIcon size={12} />
                      </a>
                   )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 opacity-20 flex flex-col items-center gap-2">
                 <Quote size={32} />
                 <p className="text-[8px] font-black uppercase tracking-widest">Silence of thoughts</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JournalBoard;
