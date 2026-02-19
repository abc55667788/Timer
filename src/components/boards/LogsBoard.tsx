import React from 'react';
import { Clock, Filter as FilterIcon, Plus, Search } from 'lucide-react';
import { LogEntry, Category, CategoryData } from '../../types';
import { formatTime, formatDisplayDate } from '../../utils/time';
import { Image as ImageIcon } from 'lucide-react';

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
    <div className="space-y-8 w-full pb-10">
      <div className="flex justify-between items-center py-6 border-b border-emerald-50 px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900 flex items-center gap-3">
            <Clock size={20} className="text-emerald-500" /> History Logs
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${showFilters ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            <FilterIcon size={14}/> Filters
          </button>
        </div>
        <button 
          onClick={() => setShowManualModal(true)} 
          className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {showFilters && (
        <div className="bg-emerald-50/50 p-7 rounded-[3rem] border border-emerald-100/50 animate-in fade-in slide-in-from-top-6 duration-500 mb-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">Category Filter</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterCategory('All')} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterCategory === 'All' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-emerald-400 border border-emerald-100 hover:bg-emerald-50'
                  }`}
                >
                  All
                </button>
                {categories.map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setFilterCategory(cat.name as any)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
                <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">From Date</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-200 rounded-full transition-all group-focus-within:bg-emerald-500" />
                  <input 
                    type="date" 
                    value={filterStartDate} 
                    onChange={(e) => setFilterStartDate(e.target.value)} 
                    className="w-full bg-white border border-emerald-100 rounded-2xl py-3 pl-8 pr-4 text-xs font-black text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">To Date</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-200 rounded-full transition-all group-focus-within:bg-emerald-500" />
                  <input 
                    type="date" 
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)} 
                    className="w-full bg-white border border-emerald-100 rounded-2xl py-3 pl-8 pr-4 text-xs font-black text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-emerald-100/50">
            <button 
              onClick={() => { setFilterCategory('All'); setFilterStartDate(''); setFilterEndDate(''); }} 
              className="px-4 py-1 text-[10px] font-black uppercase text-emerald-300 hover:text-emerald-600 tracking-widest transition-all hover:translate-x-1"
            >
              Reset Filters →
            </button>
          </div>
        </div>
      )}

      {filteredLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => handleViewLog(log)} 
              className="bg-white p-5 rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex justify-between items-center cursor-pointer relative overflow-hidden group" 
              style={{ borderLeft: `8px solid ${getCategoryColor(log.category)}` }}
            >
              <div className="flex gap-4 items-center flex-1 min-w-0">
                <div className="w-12 h-12 bg-emerald-50 rounded-[1.25rem] flex-shrink-0 flex items-center justify-center text-emerald-600">
                  {React.createElement(getCategoryIcon(log.category), {size: 20})}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-black text-emerald-900 truncate tracking-tight text-sm mb-0.5">{log.description || 'Session'}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">{formatDisplayDate(log.startTime)}</span>
                    <span className="w-1 h-1 bg-emerald-100 rounded-full"/>
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{formatTime(log.duration)}</span>
                  </div>
                </div>
              </div>

              {log.images.length > 0 && (
                <div className="flex-shrink-0 flex items-center gap-1.5 ml-2 overflow-x-auto max-w-[200px] scrollbar-none pb-1">
                   {log.images.map((img, imgIdx) => (
                     <div 
                       key={imgIdx} 
                       className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-emerald-50 shadow-sm hover:scale-110 hover:z-10 transition-transform duration-300"
                       onClick={(e) => {
                         e.stopPropagation();
                         setPreviewImage(img);
                       }}
                     >
                       <img src={img} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-emerald-50/20 rounded-[3.5rem] border-2 border-dashed border-emerald-100 gap-4">
           <Search size={48} className="text-emerald-200" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300">No matching logs found</p>
        </div>
      )}
    </div>
  );
};

export default LogsBoard;
