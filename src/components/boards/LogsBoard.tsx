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
  filterCategory: Category | 'All';
  setFilterCategory: (cat: Category | 'All') => void;
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
  filterCategory,
  setFilterCategory,
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
  return (
    <div className="space-y-6 w-full pb-6">
      <div className="flex justify-between items-center py-4 border-b border-emerald-50 px-2 lg:px-4">
        <div className="flex items-center gap-2 lg:gap-4">
          <h3 className="text-sm font-bold tracking-tight text-emerald-900 flex items-center gap-2 lg:gap-3">
            <Clock size={16} className="text-emerald-500" /> History Logs
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${showFilters ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            <FilterIcon size={12}/> Filter
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
        <div className="bg-emerald-50/50 p-7 rounded-[3rem] border border-emerald-100/50 animate-in fade-in slide-in-from-top-6 duration-500 mb-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-emerald-400 tracking-tight ml-1">Category Filter</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterCategory('All')} 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-tight transition-all ${
                    filterCategory === 'All' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-emerald-400 border border-emerald-100 hover:bg-emerald-50'
                  }`}
                >
                  All
                </button>
                {categories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setFilterCategory(cat.name as any)} 
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-tight transition-all ${
                      filterCategory === cat.name ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-emerald-400 border border-emerald-100 hover:bg-emerald-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-emerald-400 tracking-tight ml-1">From Date</label>
                <DatePicker 
                  value={filterStartDate} 
                  onChange={setFilterStartDate} 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-emerald-400 tracking-tight ml-1">To Date</label>
                <DatePicker 
                  value={filterEndDate} 
                  onChange={setFilterEndDate} 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-emerald-100/50">
            <button 
              onClick={() => { setFilterCategory('All'); setFilterStartDate(''); setFilterEndDate(''); }} 
              className="px-4 py-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-700 tracking-tight transition-all hover:translate-x-1"
            >
              Reset Filters →
            </button>
          </div>
        </div>
      )}

      {filteredLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => handleViewLog(log)} 
              className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer relative overflow-hidden group" 
              style={{ borderLeft: `10px solid ${getCategoryColor(log.category)}` }}
            >
              {/* Header: Category Tag (Colored) & Duration */}
              <div className="flex justify-between items-center mb-4">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/5 shadow-sm"
                  style={{ backgroundColor: `${getCategoryColor(log.category)}15`, color: getCategoryColor(log.category) }}
                >
                  <div className="flex-shrink-0">
                    {React.createElement(getCategoryIcon(log.category), {size: 14})}
                  </div>
                  <span className="text-[10px] font-black tracking-tight uppercase">
                    {log.category}
                  </span>
                </div>
                <div className="bg-emerald-50/50 px-3 py-1 rounded-lg text-xs font-black text-emerald-700 tracking-tighter tabular-nums">
                  {formatTime(log.duration)}
                </div>
              </div>

              {/* Time and Description */}
              <div className="flex-1 space-y-2 mb-6">
                <div className="text-[11px] font-bold text-emerald-300 tracking-tight pl-0.5">
                   {formatDisplayDate(log.startTime)}
                </div>
                <h4 className="font-black text-emerald-900 leading-[1.3] tracking-tight text-[15px] line-clamp-3 pl-0.5">
                  {log.description || 'Focus Session'}
                </h4>
              </div>

              {/* Bottom Row: Horizontal Images and Link Icon */}
              <div className="flex items-end justify-between gap-4 mt-auto">
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 min-h-[48px] flex-1">
                  {log.images.slice(0, 4).map((img, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-100/50 shadow-sm hover:scale-105 transition-transform flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {log.images.length > 4 && (
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[11px] font-black text-emerald-400 flex-shrink-0">
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
                    className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-90 border border-black/5"
                    style={{ backgroundColor: `${getCategoryColor(log.category)}15`, color: getCategoryColor(log.category) }}
                    title={log.link}
                  >
                     <LinkIcon size={20} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-emerald-50/20 rounded-[3.5rem] border-2 border-dashed border-emerald-100 gap-4">
           <Search size={48} className="text-emerald-200" />
           <p className="text-[10px] font-bold tracking-tight text-emerald-300">No matching logs found</p>
        </div>
      )}
    </div>
  );
};

export default LogsBoard;
