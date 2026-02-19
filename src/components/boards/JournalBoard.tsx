import React from 'react';
import { Target, Plus, Check, Minus, Quote, Link as LinkIcon } from 'lucide-react';
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
}

const JournalBoard: React.FC<JournalBoardProps> = ({
  goals,
  newGoalText,
  setNewGoalText,
  setGoals,
  inspirations,
  setNewInspiration,
  setSelectedInspiration,
  setShowInspirationModal
}) => {
  return (
    <div className="flex-1 flex gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Left Side: Goals (Todo List) */}
      <div className="flex-1 flex flex-col bg-emerald-50/20 rounded-[3rem] p-8 border border-emerald-50 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950 tracking-tight">Goals</h2>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Focus & Persistence</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-none space-y-4 text-emerald-950">
          <div className="flex gap-3 mb-6 sticky top-0 bg-transparent z-10 backdrop-blur-sm py-1">
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
              placeholder="Define your next target..." 
              className="flex-1 bg-white border border-emerald-100 rounded-2xl px-5 py-3.5 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
            <button 
              onClick={() => {
                if (newGoalText.trim()) {
                  setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                  setNewGoalText('');
                }
              }}
              className="bg-emerald-600 text-white p-3.5 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus size={24} />
            </button>
          </div>

          {goals.length > 0 ? goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-4 group p-1 slide-in-from-left duration-300">
              <button 
                onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))}
                className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-100 text-transparent hover:border-emerald-300'}`}
              >
                <Check size={16} strokeWidth={4} />
              </button>
              <span className={`flex-1 text-sm font-bold transition-all ${goal.completed ? 'text-emerald-300 line-through' : 'text-emerald-900 font-black'}`}>
                {goal.text}
              </span>
              <button 
                onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                className="opacity-0 group-hover:opacity-100 p-2 text-emerald-200 hover:text-red-400 transition-all hover:scale-110"
              >
                <Minus size={18} />
              </button>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
               <Target size={48} className="text-emerald-200" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">No goals set yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Inspirations (Musing Cards) */}
      <div className="flex-1 flex flex-col bg-white rounded-[3.5rem] p-8 border border-emerald-50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Quote size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950 tracking-tight">Musing</h2>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Insights & Echoes</p>
            </div>
          </div>
          <button 
            onClick={() => { setNewInspiration({ title: '', content: '', url: '' }); setSelectedInspiration(null); setShowInspirationModal(true); }}
            className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
          >
            New Insight
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-none space-y-5">
          {inspirations.length > 0 ? inspirations.map((item) => (
            <div 
              key={item.id} 
              onClick={() => { setSelectedInspiration(item); setShowInspirationModal(true); }}
              className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-50 hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative"
            >
              <Quote size={14} className="absolute top-4 right-4 text-emerald-100 group-hover:text-emerald-200 transition-colors" />
              <h4 className="text-sm font-black text-emerald-900 mb-2 truncate pr-6">{item.title || 'Untitled Thought'}</h4>
              <p className="text-xs text-emerald-600/70 leading-relaxed font-bold line-clamp-3 mb-4">{item.content}</p>
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                 {item.url && <div className="text-emerald-400 p-1.5 bg-white rounded-lg shadow-sm border border-emerald-100"><LinkIcon size={12} /></div>}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
               <Quote size={48} className="text-emerald-200" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Silence of thoughts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalBoard;
