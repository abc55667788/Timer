import React from 'react';
import { 
  Clock, Filter as FilterIcon, Plus, Search, 
  Link as LinkIcon, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { LogEntry, Category, CategoryData } from '../../types';
import { formatTime, formatDisplayDate } from '../../utils/time';
import DatePicker from '../DatePicker';

interface LogsBoardProps {
  filteredLogs: LogEntry[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterCategories: Category[];
  setFilterCategories: (cats: Category[]) => void;
  filterStartDate: string;
  filterEndDate: string;
  setFilterStartDate: (date: string) => void;
  setFilterEndDate: (date: string) => void;
  setShowManualModal: (show: boolean) => void;
  handleViewLog: (log: LogEntry) => void;
  getCategoryColor: (cat: Category) => string;
  getCategoryIcon: (cat: Category) => any;
  setPreviewImage: (img: string | null) => void;
  categories: CategoryData[];
}

const LogsBoard: React.FC<LogsBoardProps> = ({
  filteredLogs,
  showFilters,
  setShowFilters,
  filterCategories,
  setFilterCategories,
  filterStartDate,
  filterEndDate,
  setFilterStartDate,
  setFilterEndDate,
  setShowManualModal,
  handleViewLog,
  getCategoryColor,
  getCategoryIcon,
  setPreviewImage,
  categories
}) => {
  const toggleCategory = (cat: Category) => {
    if (filterCategories.includes(cat)) {
      setFilterCategories(filterCategories.filter(c => c !== cat));
    } else {
      setFilterCategories([...filterCategories, cat]);
    }
  };

  return (
    <div className="space-y-6 w-full pb-6">
      <div className="flex justify-between items-center py-4 border-b border-white/20 px-2 lg:px-4">
        <div className="flex items-center gap-2 lg:gap-4 flex-1">
          <h3 className="text-sm font-bold tracking-tight text-emerald-900 flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <Clock size={16} className="text-emerald-500" /> History Logs
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all shadow-sm ${showFilters ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white/60 backdrop-blur-md text-emerald-700 hover:bg-white/80 border border-white/20'}`}
          >
            <FilterIcon size={14}/> Filter
          </button>
        </div>
        <button 
          onClick={() => setShowManualModal(true)} 
          className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-emerald-600 text-white rounded-[1.2rem] lg:rounded-[1.5rem] text-[10px] lg:text-xs font-bold tracking-tight shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {showFilters && (
        <div className="bg-white/80 backdrop-blur-3xl p-3 lg:p-4 rounded-[1.5rem] border border-white/40 animate-in fade-in slide-in-from-top-4 duration-500 mb-6 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)] relative z-[150]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6">
            {/* Categories - Scrollable row */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <label className="text-[9px] font-black text-emerald-400 tracking-wider ml-1 uppercase opacity-50">Filter by Categories</label>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-0.5">
                <button 
                  onClick={() => setFilterCategories([])} 
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all border-2 ${
                    filterCategories.length === 0 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                      : 'bg-white/80 text-emerald-800 border-white hover:border-emerald-100'
                  }`}
                >
                  ALL
                </button>
                {categories.map((cat, idx) => {
                  const isSelected = filterCategories.includes(cat.name as Category);
                  return (
                    <button 
                      key={idx}
                      onClick={() => toggleCategory(cat.name as Category)} 
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all border-2 ${
                        isSelected 
                          ? 'text-white shadow-lg' 
                          : 'bg-white/80 text-emerald-800 border-white hover:border-emerald-100'
                      }`}
                      style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color, boxShadow: `0 8px 20px -6px ${cat.color}60` } : {}}
                    >
                      {cat.name.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Pickers - Row */}
            <div className="flex items-end gap-3 flex-shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-emerald-100/50 lg:pl-6">
              <div className="flex flex-col gap-1 w-[120px] lg:w-[140px]">
                <label className="text-[9px] font-black text-emerald-400 tracking-wider ml-1 uppercase opacity-50">From</label>
                <DatePicker 
                  value={filterStartDate} 
                  onChange={setFilterStartDate} 
                  className="z-[160]"
                />
              </div>
              <div className="flex flex-col gap-1 w-[120px] lg:w-[140px]">
                <label className="text-[9px] font-black text-emerald-400 tracking-wider ml-1 uppercase opacity-50">To</label>
                <DatePicker 
                  value={filterEndDate} 
                  onChange={setFilterEndDate} 
                  className="z-[160]"
                />
              </div>
              <button 
                onClick={() => { setFilterCategories([]); setFilterStartDate(''); setFilterEndDate(''); }} 
                className="h-[38px] px-4 rounded-xl bg-rose-50 text-rose-500 text-[10px] font-black tracking-tight hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-100 shadow-sm"
                title="Reset Filters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => handleViewLog(log)} 
              className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer relative overflow-hidden group" 
            >
              <div 
                className="absolute top-0 left-0 w-1.5 h-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: getCategoryColor(log.category) }}
              />

              {/* Header: Category Tag & Duration */}
              <div className="flex justify-between items-start mb-4 ml-2">
                <div className="flex flex-col gap-1.5">
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-tight uppercase"
                    style={{ backgroundColor: `${getCategoryColor(log.category)}15`, color: getCategoryColor(log.category) }}
                  >
                    {React.createElement(getCategoryIcon(log.category), {size: 10})}
                    {log.category}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-900/40 tracking-tight pl-0.5">
                     {formatDisplayDate(log.startTime)}
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-emerald-700 tracking-tighter tabular-nums border border-white/20 shadow-sm">
                  {formatTime(log.duration)}
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 mb-6 ml-2">
                <h4 className="font-extrabold text-emerald-950 leading-tight tracking-tight text-[15px] group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {log.description || 'Focus Session'}
                </h4>
              </div>

              {/* Bottom Row: Images and Link */}
              <div className="flex items-center justify-between gap-3 mt-auto ml-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {log.images.slice(0, 4).map((img, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm hover:z-10 hover:scale-110 transition-all flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {log.images.length > 4 && (
                    <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-400 flex-shrink-0 shadow-sm">
                      +{log.images.length - 4}
                    </div>
                  )}
                </div>

                {log.link && (
                  <a 
                    href={log.link.startsWith('http') ? log.link : `https://${log.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm border border-emerald-100/50 group/link"
                    title={log.link}
                  >
                     <LinkIcon size={16} className="group-hover/link:rotate-12 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/20 backdrop-blur-xl rounded-[3.5rem] border-2 border-dashed border-white/20 gap-4">
           <Search size={48} className="text-emerald-200" />
           <p className="text-[10px] font-bold tracking-tight text-emerald-300">No matching logs found</p>
```
        </div>
      )}
    </div>
  );
};

export default LogsBoard;
