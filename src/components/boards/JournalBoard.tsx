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
  darkMode: boolean;
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
  onClose,
  darkMode
}) => {
  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-[#0a0a0a] border-white/10 shadow-[-12px_0_44px_rgba(0,0,0,0.8)]' : 'bg-white/60 border-l border-white/20'} backdrop-blur-3xl shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b ${darkMode ? 'border-white/10 bg-zinc-900/60' : 'border-white/20 bg-white/40'} backdrop-blur-md sticky top-0 z-20 flex items-center justify-between transition-all duration-500`}>
        <div>
          <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-emerald-950'} tracking-tight uppercase`}>Journal</h2>
          <p className={`text-[10px] font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-[0.2em] leading-none mt-1`}>Daily Plan & Muse</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className={`p-2.5 ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-white border border-white/10 shadow-lg' : 'hover:bg-emerald-50 text-emerald-300 hover:text-emerald-600'} rounded-xl transition-all active:scale-90`}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-8 pb-20">
        {/* Goals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-2`}>
              <Target size={14} className={darkMode ? 'animate-pulse' : ''} /> Goals
            </h3>
            <span className={`text-[9px] font-black ${darkMode ? 'text-emerald-300' : 'text-emerald-500'} uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full`}>
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
              className={`flex-1 ${darkMode ? 'bg-black/40 border-white/10 text-emerald-100 placeholder:text-emerald-500/40 focus:bg-emerald-500/10 focus:border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-100/50 focus:bg-white'} rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all border shadow-sm`} 
            />
            <button 
              onClick={() => {
                if (newGoalText.trim()) {
                  setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                  setNewGoalText('');
                }
              }}
              className={`${darkMode ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 active:scale-90' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'} text-white p-3 rounded-xl transition-all shadow-md group-hover:scale-105`}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {goals.length > 0 ? goals.map((goal) => (
              <div key={goal.id} className={`flex items-center gap-3 group ${darkMode ? 'bg-zinc-900 border-white/10 hover:bg-zinc-800' : 'bg-white border-emerald-50/50 hover:shadow-sm hover:border-emerald-100'} p-3.5 rounded-[1.3rem] transition-all border ring-1 ring-white/5 shadow-lg`}>
                <button 
                  onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (darkMode ? 'bg-transparent border-white/20 text-transparent hover:border-emerald-400' : 'bg-white border-emerald-100 text-transparent hover:border-emerald-300')}`}
                >
                  <Check size={14} strokeWidth={4} />
                </button>
                <span className={`flex-1 text-[13px] font-black transition-all ${goal.completed ? (darkMode ? 'text-emerald-500/30 line-through underline-offset-4' : 'text-emerald-200 line-through') : (darkMode ? 'text-emerald-100 group-hover:text-white' : 'text-emerald-900')}`}>
                  {goal.text}
                </span>
                <button 
                  onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 ${darkMode ? 'text-emerald-500/60 hover:text-red-400 hover:bg-red-500/10' : 'text-emerald-200 hover:text-red-400'} rounded-lg transition-all hover:scale-110`}
                >
                  <Minus size={16} />
                </button>
              </div>
            )) : (
              <div className={`text-center py-12 ${darkMode ? 'opacity-40' : 'opacity-20'} flex flex-col items-center gap-3 font-black`}>
                 <Target size={48} className={darkMode ? 'text-emerald-400/40' : 'text-emerald-600'} />
                 <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-emerald-400/40' : 'text-emerald-600'}`}>No goals set</p>
              </div>
            )}
          </div>
        </section>

        {/* Musings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-2`}>
              <Quote size={14} /> Musing
            </h3>
            <button 
              onClick={() => { setNewInspiration({ title: '', content: '', url: '' }); setSelectedInspiration(null); setShowInspirationModal(true); }}
              className={`text-[9px] font-black ${darkMode ? 'text-emerald-400 hover:text-emerald-200' : 'text-emerald-600'} uppercase tracking-[0.15em] border-b-2 border-emerald-500/30 transition-all hover:border-emerald-400`}
            >
              Add New
            </button>
          </div>

          <div className="grid gap-4">
            {inspirations.length > 0 ? inspirations.map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setSelectedInspiration(item); setShowInspirationModal(true); }}
                className={`${darkMode ? 'bg-zinc-900 border-white/10 hover:bg-zinc-800' : 'bg-white/40 border-white/60 hover:bg-white/80'} backdrop-blur-3xl p-6 rounded-[1.8rem] border hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-xl ring-1 ring-white/5 hover:border-emerald-500/30`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${darkMode ? 'bg-emerald-500' : 'bg-emerald-500'} opacity-40 group-hover:opacity-100 transition-opacity`} />
                <Quote size={14} className={`absolute top-5 right-5 ${darkMode ? 'text-emerald-500/30 group-hover:text-emerald-400 group-hover:scale-110' : 'text-emerald-100'} transition-all`} />
                <h4 className={`text-[15px] font-black ${darkMode ? 'text-white' : 'text-emerald-950'} mb-2.5 truncate pr-8 tracking-tight transition-colors`}>{item.title || 'Untitled Thought'}</h4>
                <p className={`text-[12px] ${darkMode ? 'text-emerald-100/80 group-hover:text-white' : 'text-emerald-800/60'} leading-relaxed font-black line-clamp-3 mb-5 tracking-tight transition-colors`}>{item.content}</p>
                
                {item.images && item.images.length > 0 && (
                  <div className="flex -space-x-2 py-1 mb-4">
                    {item.images.slice(0, 3).map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${darkMode ? 'border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4)]' : 'border-white shadow-sm'} hover:z-10 hover:scale-125 transition-all flex-shrink-0 duration-300`}
                        onClick={(e) => {
                           e.stopPropagation();
                           setPreviewImage?.(img);
                        }}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {item.images.length > 3 && (
                      <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-black/60 text-emerald-400 border-white/10' : 'bg-white/80 text-emerald-400 border-white'} border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-sm backdrop-blur-md`}>
                        +{item.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                   <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <span className={`text-[8px] font-black ${darkMode ? 'text-emerald-400/60 group-hover:text-emerald-300' : 'text-emerald-300'} uppercase tracking-widest`}>{new Date(item.date).toLocaleDateString()}</span>
                   </div>
                   {item.url && (
                      <a 
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-2 ${darkMode ? 'bg-white/5 text-emerald-400 hover:text-emerald-100 hover:bg-emerald-500/30 border-white/10 shadow-lg' : 'bg-emerald-50 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 border-emerald-50'} rounded-xl transition-all border shadow-sm group-hover:scale-110 duration-300`}
                        onClick={(e) => e.stopPropagation()}
                        title={item.url}
                      >
                        <LinkIcon size={14} strokeWidth={3} />
                      </a>
                   )}
                </div>
              </div>
            )) : (
              <div className={`text-center py-12 ${darkMode ? 'opacity-40' : 'opacity-20'} flex flex-col items-center gap-3`}>
                 <Quote size={48} className={darkMode ? 'text-emerald-400/40' : 'text-emerald-600'} />
                 <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-emerald-400/40' : 'text-emerald-600'}`}>Silence of thoughts</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JournalBoard;
