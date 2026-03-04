import React from 'react';
import { Trash2 } from 'lucide-react';
import { LogEntry, Category, CATEGORIES } from '../../types';
import { formatClock } from '../../utils/time';

interface LogListProps {
  logs: LogEntry[];
  selectedCategory: Category | 'All';
  onCategoryChange: (cat: Category | 'All') => void;
  onViewLog: (log: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  getCategoryColor: (cat: Category) => string;
}

export const LogList: React.FC<LogListProps> = ({
  logs,
  selectedCategory,
  onCategoryChange,
  onViewLog,
  onDeleteLog,
  getCategoryColor,
}) => {
  const filteredLogs = logs.filter(
    (log) => selectedCategory === 'All' || log.category === selectedCategory
  );

  return (
    <div className="w-full space-y-10">
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
        <button
          onClick={() => onCategoryChange('All')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-[11px] tracking-tight transition-all flex-shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
              : 'bg-white/80 text-emerald-400 border border-emerald-50 hover:border-emerald-200 hover:text-emerald-600 backdrop-blur-sm'
          }`}
        >
          All Activities
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-[11px] tracking-tight transition-all flex-shrink-0 ${
              selectedCategory === cat
                ? 'text-white shadow-xl'
                : 'bg-white/80 text-emerald-400 border border-emerald-50 hover:border-emerald-200 hover:text-emerald-600 backdrop-blur-sm'
            }`}
            style={
              selectedCategory === cat
                ? { backgroundColor: getCategoryColor(cat), boxShadow: `0 10px 20px -5px ${getCategoryColor(cat)}40` }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredLogs.slice(0, 15).map((log) => (
          <div
            key={log.id}
            onClick={() => onViewLog(log)}
            className="group flex items-center justify-between p-5 bg-white/60 backdrop-blur-xl rounded-[1.25rem] border border-white/60 hover:border-emerald-200 hover:bg-white/80 hover:shadow-xl transition-all cursor-pointer shadow-sm relative overflow-hidden px-8"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: getCategoryColor(log.category) }}
            />
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[13px] font-black text-emerald-950 group-hover:text-emerald-700 transition-colors tracking-tight">
                  {log.description || 'Focus Session'}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase opacity-40 px-2 py-0.5 rounded bg-emerald-50" style={{ color: getCategoryColor(log.category) }}>
                    {log.category}
                  </span>
                  <span className="text-emerald-100 text-xs">•</span>
                  <span className="text-[10px] font-bold text-emerald-300 tracking-tight">
                    {formatClock(log.startTime)} - {formatClock(log.endTime || Date.now())}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50 transition-colors tracking-tighter shadow-sm">
                {Math.round(log.duration / 60000)}m
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLog(log.id);
                }}
                className="p-2.5 text-emerald-200 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-emerald-100 shadow-inner">
            <p className="text-[10px] font-bold tracking-tight text-emerald-400">No logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};
