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
  darkMode: boolean;
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
  categories,
  darkMode,
}) => {
  const toggleCategory = (cat: Category) => {
    if (filterCategories.includes(cat)) {
      setFilterCategories(filterCategories.filter(c => c !== cat));
    } else {
      setFilterCategories([...filterCategories, cat]);
    }
  };

  return (
    <div className={`space-y-6 w-full pb-6 ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>
      <div className={`flex justify-between items-center py-4 border-b ${darkMode ? 'border-white/5' : 'border-white/20'} px-2 lg:px-4`}>
        <div className="flex items-center gap-2 lg:gap-4 flex-1">
          <h3 className={`text-sm font-black tracking-tight ${darkMode ? 'text-white' : 'text-emerald-900'} flex items-center gap-2 lg:gap-3 flex-shrink-0`}>
            <Clock size={16} className={darkMode ? 'text-emerald-500' : 'text-emerald-500'} /> History Logs
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${showFilters ? (darkMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-emerald-200') : (darkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-white/5' : 'bg-white/60 backdrop-blur-md text-emerald-700 hover:bg-white/80 border border-white/20 shadow-sm')}`}
          >
            <FilterIcon size={14}/> Filter
          </button>
        </div>
        <button 
          onClick={() => setShowManualModal(true)} 
          className={`flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 ${darkMode ? 'bg-zinc-800 text-white hover:bg-emerald-500 border border-white/5 shadow-xl shadow-black/40' : 'bg-emerald-600 text-white shadow-emerald-200 shadow-lg'} rounded-[1.2rem] lg:rounded-[1.5rem] text-[10px] lg:text-xs font-bold tracking-tight hover:opacity-90 active:scale-95 transition-all`}
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {showFilters && (
        <div className={`${darkMode ? 'bg-zinc-900 border-white/5 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white/80 border-white/40 shadow-xl'} backdrop-blur-3xl p-3 lg:p-4 rounded-[1.5rem] border animate-in fade-in slide-in-from-top-4 duration-500 mb-6 relative z-[150]`}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6">
            {/* Categories - Scrollable row */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <label className={`text-[9px] font-black ${darkMode ? 'text-zinc-600' : 'text-emerald-400'} tracking-wider ml-1 uppercase opacity-80`}>Filter by Categories</label>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-0.5">
                <button 
                  onClick={() => setFilterCategories([])} 
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all border-2 ${
                    filterCategories.length === 0 
                      ? (darkMode ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200') 
                      : (darkMode ? 'bg-zinc-800 text-zinc-500 border-white/5 hover:border-emerald-500/30' : 'bg-white/80 text-emerald-800 border-white hover:border-emerald-100')
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
                          : (darkMode ? 'bg-zinc-800 text-zinc-500 border-white/5 hover:border-emerald-500/30' : 'bg-white/80 text-emerald-800 border-white hover:border-emerald-100')
                      }`}
                      style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color, boxShadow: darkMode ? `0 8px 20px -6px ${cat.color}` : `0 8px 20px -6px ${cat.color}60` } : {}}
                    >
                      {cat.name.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Pickers - Row */}
            <div className={`flex items-end gap-3 flex-shrink-0 pt-2 lg:pt-0 lg:border-l ${darkMode ? 'lg:border-white/5' : 'lg:border-emerald-100/50'} lg:pl-6`}>
              <div className="flex flex-col gap-1 w-[120px] lg:w-[140px]">
                <label className={`text-[9px] font-black ${darkMode ? 'text-zinc-600' : 'text-emerald-400'} tracking-wider ml-1 uppercase opacity-80`}>From</label>
                <DatePicker 
                  value={filterStartDate} 
                  onChange={setFilterStartDate} 
                  className="z-[160]"
                  darkMode={darkMode}
                />
              </div>
              <div className="flex flex-col gap-1 w-[120px] lg:w-[140px]">
                <label className={`text-[9px] font-black ${darkMode ? 'text-zinc-600' : 'text-emerald-400'} tracking-wider ml-1 uppercase opacity-80`}>To</label>
                <DatePicker 
                  value={filterEndDate} 
                  onChange={setFilterEndDate} 
                  className="z-[160]"
                  darkMode={darkMode}
                />
              </div>
              <button 
                onClick={() => { setFilterCategories([]); setFilterStartDate(''); setFilterEndDate(''); }} 
                className={`h-[38px] px-4 rounded-xl ${darkMode ? 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-red-500 hover:text-white' : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'} text-[10px] font-black tracking-tight transition-all flex items-center justify-center border shadow-sm`}
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
              className={`${darkMode ? 'bg-zinc-900 border-white/5 hover:bg-zinc-800 hover:border-emerald-500/20 shadow-[0_32px_128px_-20px_rgba(0,0,0,0.9)]' : 'bg-white/60 border-white/60 hover:shadow-xl shadow-sm'} backdrop-blur-xl p-6 rounded-[2.2rem] border hover:-translate-y-1 transition-all flex flex-col cursor-pointer relative overflow-hidden group`} 
            >
              <div 
                className="absolute top-0 left-0 w-1.5 h-full opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: getCategoryColor(log.category) }}
              />

              {/* Header: Category Tag & Duration */}
              <div className="flex justify-between items-start mb-4 ml-2">
                <div className="flex flex-col gap-1.5">
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-tight uppercase shadow-sm"
                    style={{ backgroundColor: darkMode ? `${getCategoryColor(log.category)}30` : `${getCategoryColor(log.category)}15`, color: getCategoryColor(log.category) }}
                  >
                    {React.createElement(getCategoryIcon(log.category), {size: 10})}
                    {log.category}
                  </div>
                  <div className={`text-[10px] font-black ${darkMode ? 'text-zinc-600' : 'text-emerald-900/40'} tracking-tight pl-0.5 uppercase`}>
                     {formatDisplayDate(log.startTime)}
                  </div>
                </div>
                <div className={`${darkMode ? 'bg-black/40 text-emerald-400 border-white/5 shadow-inner' : 'bg-white/60 text-emerald-700 border-white/20 shadow-sm'} backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black tracking-tighter tabular-nums border`}>
                  {formatTime(log.duration)}
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 mb-6 ml-2">
                <h4 className={`font-black ${darkMode ? 'text-white group-hover:text-emerald-500' : 'text-emerald-950 group-hover:text-emerald-700'} leading-tight tracking-tight text-[15px] transition-colors line-clamp-2`}>
                  {log.description || 'Focus Session'}
                </h4>
              </div>

              {/* Bottom Row: Images and Link */}
              <div className="flex items-center justify-between gap-3 mt-auto ml-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {log.images.slice(0, 4).map((img, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      className={`relative w-10 h-10 rounded-xl overflow-hidden border ${darkMode ? 'border-white/10 shadow-lg shadow-black/40' : 'border-white shadow-sm'} hover:z-10 hover:scale-110 transition-all flex-shrink-0`}
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {log.images.length > 4 && (
                    <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-zinc-800 border-white/10 text-emerald-500' : 'bg-white/40 border-white text-emerald-400'} backdrop-blur-sm border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-sm`}>
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-zinc-800 text-zinc-500 border-white/5 hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-600'} hover:text-white shadow-sm border group/link`}
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
        <div className={`flex flex-col items-center justify-center py-24 ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/20 border-white/20'} backdrop-blur-xl rounded-[3.5rem] border-2 border-dashed gap-4`}>
           <Search size={48} className={darkMode ? 'text-emerald-500/20' : 'text-emerald-200'} />
           <p className={`text-[10px] font-bold tracking-tight ${darkMode ? 'text-emerald-500/40' : 'text-emerald-300'}`}>No matching logs found</p>
```
        </div>
      )}
    </div>
  );
};

export default LogsBoard;
