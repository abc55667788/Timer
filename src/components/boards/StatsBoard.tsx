import React, { useState, useEffect, useRef } from 'react';
import { 
  History, Settings, PanelLeftOpen, PanelLeftClose, LayoutGrid, BarChart, 
  ZoomOut, ZoomIn, ExternalLink, Image as ImageIcon, Link as LinkIcon,
  Search as SearchIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip
} from 'recharts';
import { LogEntry, StatsView, ViewMode, Category } from '../../types';
import { formatTime, formatClock, formatDate, formatDisplayDateString, resolvePhaseTotals } from '../../utils/time';
import MiniCalendar from '../MiniCalendar';

interface StatsBoardProps {
  logs: LogEntry[];
  selectedStatsDate: string;
  statsView: StatsView;
  isCalendarCollapsed: boolean;
  dayViewMode: 'timeline' | 'stats';
  timelineZoom: number;
  viewMode: ViewMode;
  setSelectedStatsDate: (date: string) => void;
  setStatsView: (view: StatsView) => void;
  setIsCalendarCollapsed: (collapsed: boolean) => void;
  setDayViewMode: (mode: 'timeline' | 'stats') => void;
  setTimelineZoom: (zoom: number | ((z: number) => number)) => void;
  setViewMode: (mode: ViewMode) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  handleTimelineWheel: (e: React.WheelEvent) => void;
  handleTimelineMouseDown: (e: React.MouseEvent) => void;
  handleTimelineMouseMove: (e: React.MouseEvent) => void;
  handleTimelineMouseUpLeave: () => void;
  handleTimelineTouchStart: (e: React.TouchEvent) => void;
  handleTimelineTouchMove: (e: React.TouchEvent) => void;
  handleTimelineTouchEnd: () => void;
  handleViewLog: (log: LogEntry) => void;
  getCategoryColor: (cat: Category) => string;
  getCategoryIcon: (cat: Category) => any;
  setPreviewImage: (img: string | null) => void;
  setActiveTab: (tab: any) => void;
  handleSwapMainImage: (logId: string, imageUri: string) => void;
  statsData: any[];
  weekHistory: any[];
  monthHistory: any[];
  yearHistory: any[];
  yearMonthStats: any[];
  calendarGridData: any[];
  timelineRange: { start: number; end: number; tracks: LogEntry[][] };
  selectedDayLogs: LogEntry[];
  relevantLogs: LogEntry[];
  timelineRef: React.RefObject<HTMLDivElement>;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  restTimeTotal: number;
  isAndroid?: boolean;
}

const StatsBoard: React.FC<StatsBoardProps> = ({
  logs,
  selectedStatsDate,
  statsView,
  isCalendarCollapsed,
  dayViewMode,
  timelineZoom,
  viewMode,
  setSelectedStatsDate,
  setStatsView,
  setIsCalendarCollapsed,
  setDayViewMode,
  setTimelineZoom,
  setViewMode,
  zoomIn,
  zoomOut,
  handleTimelineWheel,
  handleTimelineMouseDown,
  handleTimelineMouseMove,
  handleTimelineMouseUpLeave,
  handleTimelineTouchStart,
  handleTimelineTouchMove,
  handleTimelineTouchEnd,
  handleViewLog,
  getCategoryColor,
  getCategoryIcon,
  setPreviewImage,
  setActiveTab,
  handleSwapMainImage,
  statsData,
  weekHistory,
  monthHistory,
  yearHistory,
  yearMonthStats,
  calendarGridData,
  timelineRange,
  selectedDayLogs,
  relevantLogs,
  timelineRef,
  MIN_ZOOM,
  MAX_ZOOM,
  restTimeTotal,
  isAndroid
}) => {
  const getTimelineWidth = (zoom: number) => {
    return Math.max(800, ((timelineRange.end - timelineRange.start) / 60000) * 1.5 * zoom + 120);
  };

  const [isZoomToolExpanded, setIsZoomToolExpanded] = useState(false);
  const zoomToolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoomToolRef.current && !zoomToolRef.current.contains(event.target as Node)) {
        setIsZoomToolExpanded(false);
      }
    };

    if (isZoomToolExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isZoomToolExpanded]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-visible relative pt-4 md:pt-6">
      {/* Calendar Side Drawer for Android */}
      {isAndroid ? (
        <>
          {/* Overlay */}
          {!isCalendarCollapsed && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 animate-in fade-in duration-300" 
              onClick={() => setIsCalendarCollapsed(true)}
            />
          )}
          {/* Sidebar Drawer */}
          <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 transform transition-all duration-300 ease-in-out border-r border-emerald-50 ${isCalendarCollapsed ? '-translate-x-full shadow-none' : 'translate-x-0 shadow-2xl'}`}>
            <div className="h-full overflow-y-auto p-4 scrollbar-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-emerald-950 tracking-tighter pl-2">Timeline Calendar</h3>
                <button onClick={() => setIsCalendarCollapsed(true)} className="p-2 text-emerald-400 hover:text-emerald-600">
                  <PanelLeftClose size={20} />
                </button>
              </div>
              <div className="scale-[0.9] origin-top-left">
                <MiniCalendar 
                  logs={logs} 
                  selectedDate={selectedStatsDate} 
                  onSelectDate={setSelectedStatsDate} 
                  viewType={statsView} 
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        !isCalendarCollapsed && (
          <div className="w-full lg:w-auto flex-shrink-0 sticky top-0 z-20">
            <MiniCalendar 
              logs={logs} 
              selectedDate={selectedStatsDate} 
              onSelectDate={setSelectedStatsDate} 
              viewType={statsView} 
            />
          </div>
        )
      )}

      <div className="flex-1 space-y-4 w-full h-full flex flex-col overflow-visible">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/40 backdrop-blur-xl p-1.5 sm:p-1 rounded-2xl flex-shrink-0 border border-white/20 gap-2 sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
             <button onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)} className="p-2 text-emerald-600 hover:bg-white/60 rounded-xl transition-all shadow-sm flex-shrink-0">
               {isCalendarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
             </button>
             {([
               { id: 'day', label: 'Day' },
               { id: 'week', label: 'Week' },
               { id: 'month', label: 'Month' },
               { id: 'year', label: 'Year' }
             ] as { id: StatsView, label: string }[]).map(v => (
               <button key={v.id} onClick={() => setStatsView(v.id)} className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-tight transition-all flex-shrink-0 ${statsView === v.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-500 hover:bg-white/50'}`}>{v.label}</button>
             ))}
           </div>
           <div className="flex items-center justify-between sm:justify-end gap-3 px-2 sm:px-0">
              {statsView === 'day' && (
                <div className="bg-white/30 backdrop-blur-md p-1 rounded-2xl flex border border-white/20 shadow-sm">
                   <button onClick={() => setDayViewMode('timeline')} className={`p-2 rounded-xl transition-all ${dayViewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Timeline View"><LayoutGrid size={16}/></button>
                   <button onClick={() => setDayViewMode('stats')} className={`p-2 rounded-xl transition-all ${dayViewMode === 'stats' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Stats View"><BarChart size={16}/></button>
                </div>
              )}
              <div className="text-[11px] sm:text-xs font-bold text-emerald-800 sm:pr-5 tracking-tight opacity-60 truncate">{formatDisplayDateString(selectedStatsDate)}</div>
           </div>
        </div>
        
        <div className="flex-1 pr-2 space-y-4 scrollbar-none pb-20">
          {statsView === 'day' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {dayViewMode === 'timeline' ? (
                 <div className="animate-in fade-in zoom-in-95 duration-500">
                   <div className="relative bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/20 h-[240px] shadow-sm overflow-visible group flex-shrink-0">
                      <div 
                        ref={zoomToolRef}
                        className={`absolute top-3 right-3 z-30 flex items-center bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl transition-all duration-500 overflow-hidden ${isZoomToolExpanded ? 'p-1 gap-2' : 'p-0 w-10 h-10 shadow-md transform hover:scale-105'}`}
                      >
                        {!isZoomToolExpanded ? (
                          <button 
                            onClick={() => setIsZoomToolExpanded(true)}
                            className="w-full h-full flex items-center justify-center text-emerald-600 hover:bg-white/40 transition-colors"
                            title="Open zoom controls"
                          >
                             <SearchIcon size={18} />
                          </button>
                        ) : (
                          <>
                            <button onClick={zoomOut} title="Zoom out" className={`p-2 rounded-xl text-emerald-600 hover:bg-white/40 transition-all active:scale-90 ${timelineZoom <= MIN_ZOOM ? 'opacity-20 cursor-not-allowed' : ''}`} disabled={timelineZoom <= MIN_ZOOM}><ZoomOut size={16} /></button>
                            <div className="text-[12px] font-mono font-black text-emerald-950 px-1 select-none pointer-events-none">{Math.round(timelineZoom * 100)}%</div>
                            <button onClick={zoomIn} title="Zoom in" className={`p-2 rounded-xl text-emerald-600 hover:bg-white/40 transition-all active:scale-90 ${timelineZoom >= MAX_ZOOM ? 'opacity-20 cursor-not-allowed' : ''}`} disabled={timelineZoom >= MAX_ZOOM}><ZoomIn size={16} /></button>
                          </>
                        )}
                      </div>

                      <div 
                        ref={timelineRef} 
                        onWheel={handleTimelineWheel} 
                        onMouseDown={handleTimelineMouseDown}
                        onMouseMove={handleTimelineMouseMove}
                        onMouseUp={handleTimelineMouseUpLeave}
                        onMouseLeave={handleTimelineMouseUpLeave}
                        onTouchStart={handleTimelineTouchStart}
                        onTouchMove={handleTimelineTouchMove}
                        onTouchEnd={handleTimelineTouchEnd}
                        onKeyDown={(e) => { if ((e as any).key === '+' || (e as any).key === '=' ) { e.preventDefault(); zoomIn(); } else if ((e as any).key === '-') { e.preventDefault(); zoomOut(); } }} 
                        tabIndex={0} 
                        title="Drag to scroll | Shift + Wheel to zoom, +/- to zoom" 
                        style={{ touchAction: 'pan-y auto' } as any} 
                        className="absolute inset-0 overflow-x-auto overscroll-contain scrollbar-none focus:outline-none cursor-grab"
                      >
                        <div className="h-full relative py-14 px-10" style={{ width: `${getTimelineWidth(timelineZoom)}px` }}>
                          {Array.from({ length: Math.ceil((timelineRange.end - timelineRange.start) / 3600000) + 1 }).map((_, i) => {
                            const hourDate = new Date(timelineRange.start + i * 3600000);
                            const hourStr = hourDate.getHours().toString().padStart(2, '0');
                            return (
                              <div key={i} className="absolute top-0 bottom-0 border-l border-emerald-100/30" style={{ left: `${i * 60 * 1.5 * timelineZoom + 40}px` }}>
                                <span className="absolute bottom-4 -left-4 text-[10px] font-black text-emerald-300 tracking-tighter select-none">
                                  {hourStr}
                                </span>
                              </div>
                            );
                          })}
                          <div className="relative z-10 space-y-2 mt-2">
                                {timelineRange.tracks.map((track, trackIdx) => (
                              <div key={trackIdx} className="h-6 relative">
                                {track.map(log => (
                                  <div key={log.id} onClick={() => handleViewLog(log)} className="absolute top-0 bottom-0 rounded-xl cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:z-50 border border-white/30 shadow-sm group/log z-10 overflow-visible" style={{ left: `${((log.startTime - timelineRange.start) / 60000) * 1.5 * timelineZoom + 40}px`, width: `${Math.max(((log.endTime && log.startTime ? Math.max(log.duration, (log.endTime - log.startTime) / 1000) : log.duration) / 60) * 1.5 * timelineZoom, 6)}px`, backgroundColor: getCategoryColor(log.category) }}>
                                    <div className="absolute hidden group-hover/log:flex flex-col items-center bg-emerald-900 text-white p-2 rounded-[1rem] text-[10px] top-full mt-2 left-1/2 -translate-x-1/2 z-[100] shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95">
                                      <div className="font-bold tracking-tight mb-1">{log.category}</div>
                                      <div className="opacity-60 font-mono">{formatClock(log.startTime, timelineZoom)} - {log.endTime ? formatClock(log.endTime, timelineZoom) : 'NOW'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-12 pt-4">
                     <div className="flex items-center justify-between border-b border-white/20 pb-8">
                       <div className="flex items-center gap-5">
                         <div className="p-4 bg-emerald-600 text-white rounded-[2.25rem] shadow-xl shadow-emerald-200">
                           <History size={26}/>
                         </div>
                         <div>
                           <h4 className="text-xl font-bold text-emerald-950 tracking-tight">Life Timeline</h4>
                           <p className="text-[11px] font-bold text-emerald-400 tracking-tight mt-1">{formatDisplayDateString(selectedStatsDate)}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setActiveTab('logs')} 
                         className="px-6 py-3 bg-white/40 backdrop-blur-md text-emerald-600 rounded-2xl text-[11px] font-bold tracking-tight hover:bg-white/60 transition-all flex items-center gap-2 shadow-sm border border-white/20"
                       >
                         Historical Logs <ExternalLink size={14}/>
                       </button>
                     </div>

                     <div className="space-y-4 pl-6 border-l-2 border-white/20 ml-6 mr-4 flex-1 min-w-0">
                       {selectedDayLogs.map((log, idx) => (
                         <div key={log.id} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 80}ms` }}>
                           <div className="absolute -left-[31px] top-3 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white/30 z-10" style={{ backgroundColor: getCategoryColor(log.category) }}>
                              <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                           </div>

                           <div
                             role="button"
                             tabIndex={0}
                             onClick={() => handleViewLog(log)}
                             className="bg-white/40 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 cursor-pointer group flex gap-4 pr-6" 
                             style={{ borderLeft: `10px solid ${getCategoryColor(log.category)}` }}
                           >
                              <div className="flex-1 min-w-0">
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full border border-white/20">
                                    <div className="text-emerald-600">
                                      {React.createElement(getCategoryIcon(log.category), {size: 14})}
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 tracking-tight uppercase">
                                      {log.category}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-black text-emerald-300 tracking-tighter tabular-nums text-right">
                                    {formatClock(log.startTime)} — {log.endTime ? formatClock(log.endTime) : 'NOW'}
                                  </div>
                                </div>

                                {/* Content Row */}
                                <div className="flex flex-col gap-1 pr-2">
                                  <h4 className="text-sm font-black text-emerald-950 tracking-tight leading-tight line-clamp-2">
                                    {log.description || 'Focus Session'}
                                  </h4>
                                  <div className="text-[10px] font-bold text-emerald-500">
                                    Duration: {formatTime(resolvePhaseTotals(log).total)}
                                  </div>
                                </div>
                              </div>

                              {/* Vertical Media Bar */}
                              {(log.images.length > 0 || log.link) && (
                                <div className="flex flex-col gap-2 items-center flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                                  {log.link && (
                                    <a 
                                      href={log.link.startsWith('http') ? log.link : `https://${log.link}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-9 h-9 bg-emerald-50 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-[1.2rem] flex items-center justify-center transition-all border border-emerald-100 shadow-sm"
                                      title={log.link}
                                    >
                                      <LinkIcon size={14} />
                                    </a>
                                  )}
                                  {log.images.slice(0, 2).map((img, imgIdx) => (
                                    <div 
                                      key={imgIdx} 
                                      className="relative w-9 h-9 rounded-[1.2rem] overflow-hidden border border-emerald-100 shadow-sm hover:scale-110 hover:z-10 transition-transform duration-300 cursor-zoom-in"
                                      onClick={() => setPreviewImage(img)}
                                    >
                                      <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                  {log.images.length > 2 && (
                                    <div className="w-9 h-9 rounded-[1.2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-400">
                                      +{log.images.length - 2}
                                    </div>
                                  )}
                                </div>
                              )}
                           </div>
                         </div>
                       ))}

                       {selectedDayLogs.length === 0 && (
                         <div className="py-12 flex flex-col items-center justify-center gap-4 text-emerald-200 animate-in fade-in slide-in-from-bottom-8">
                           <div className="p-6 rounded-[2rem] border-2 border-dashed border-emerald-50/50 bg-emerald-50/20">
                             <History size={32} className="opacity-40" />
                           </div>
                           <p className="text-[12px] font-bold tracking-tight opacity-40">No logs recorded</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                      <div className="lg:col-span-3 space-y-2">
                         <div className="bg-emerald-600/90 backdrop-blur-md text-white px-4 py-3 rounded-[1.5rem] shadow-lg shadow-emerald-100/50 relative overflow-hidden group min-h-[64px] flex flex-col justify-center">
                           <span className="text-[11px] font-bold tracking-tight opacity-80 relative z-10 text-emerald-50">Focus</span>
                           <div className="text-xl font-black tracking-tighter relative z-10 font-mono">
                             {formatTime(statsData.filter(item => item.name !== 'Rest').reduce((acc, item) => acc + item.value * 60, 0))}
                           </div>
                         </div>
                         <div className="bg-white/40 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-[1.5rem] shadow-sm relative overflow-hidden group min-h-[64px] flex flex-col justify-center">
                           <span className="text-[11px] font-bold tracking-tight text-emerald-600 relative z-10">Rest</span>
                           <div className="text-xl font-black tracking-tighter relative z-10 font-mono text-emerald-900">
                             {formatTime(restTimeTotal)}
                           </div>
                         </div>
                         <div className="px-5 py-0.5 text-[11px] font-bold text-emerald-500 tracking-tight">{selectedDayLogs.length} sessions Today</div>
                         <div className="px-5 py-1 text-[11px] font-bold text-emerald-800 tracking-tight flex items-center gap-2 mb-1 mt-2">
                            <div className="w-1 h-3 bg-emerald-500 rounded-full"/> Categories
                         </div>
                      </div>
                      
                      <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 pb-3">
                        {statsData.filter(item => item.name !== 'Rest').map((item, idx) => (
                          <div key={item.name} className="bg-white/40 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-center group/card" style={{ animationDelay: `${idx * 20}ms` }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shadow-sm flex-shrink-0 transition-transform group-hover/card:scale-110" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                                {React.createElement(getCategoryIcon(item.name as Category), { size: 16 })}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-emerald-900/40 tracking-tight leading-none mb-1 truncate">{item.name}</span>
                                <div className="text-sm font-black text-emerald-950 truncate leading-none">{item.value}m</div>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                               <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 h-[380px] shadow-sm flex flex-col relative overflow-hidden group">
                        <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown</h3>
                        {statsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie data={statsData.filter(d => d.value > 0)} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                              {statsData.filter(d => d.value > 0).map(entry => <Cell key={entry.name} fill={getCategoryColor(entry.name as Category)} />)}
                            </Pie>
                              <RechartsTooltip contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', padding:'10px 20px', fontWeight: 'bold'}} />
                              <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '15px'}} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-emerald-200 font-bold tracking-tight">No Activity</div>}
                      </div>
                      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 h-[380px] shadow-sm flex flex-col relative overflow-hidden group">
                        <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Time Distribution</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart data={statsData.filter(d => d.value > 0)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
                            <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <RechartsTooltip cursor={{fill: '#ffffff20', radius: 10}} contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 8, 8]} barSize={24} />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {statsView === 'month' && (
            <div className="pb-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 w-full">
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* 统计网格天数卡片 - 占据左侧 8 列 */}
                  <div className="xl:col-span-8">
                    <div className="bg-white rounded-[2rem] p-3 border border-emerald-50 shadow-sm overflow-hidden ring-1 ring-emerald-50/50">
                      <div className="grid grid-cols-7 gap-1">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                          <div key={d} className="text-center text-[10px] font-bold text-emerald-500 py-1 tracking-tight">{d}</div>
                        ))}
                        {calendarGridData.map((item, idx) => {
                          if (item.empty) return <div key={idx} className="aspect-square opacity-[0.03] bg-emerald-900 rounded-xl" />;
                          
                          const isSelected = selectedStatsDate === item.dateStr;
                          const isToday = formatDate(Date.now()) === item.dateStr;
                          const hasLogs = item.duration > 0;
                          const firstImage = item.images?.[0];

                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setSelectedStatsDate(item.dateStr || '');
                                setStatsView('day');
                              }}
                              className={`aspect-square rounded-xl p-1 flex flex-col justify-between border transition-all cursor-pointer group relative overflow-hidden active:scale-95
                                ${isSelected ? 'bg-emerald-600 border-emerald-600 shadow-xl scale-[1.01] z-10' : 
                                  hasLogs ? 'bg-white border-emerald-50 shadow-sm hover:border-emerald-200 hover:shadow-md' : 'bg-emerald-50/20 border-transparent'}
                                ${isToday && !isSelected ? 'ring-1 ring-emerald-400 ring-offset-1' : ''}
                              `}
                            >
                              {!isSelected && (
                                <div className="absolute inset-0 z-0">
                                   {firstImage ? (
                                     <img src={firstImage} className="w-full h-full object-cover opacity-[0.1] group-hover:opacity-30 transition-opacity" />
                                   ) : hasLogs ? (
                                     <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-white opacity-40 flex items-center justify-center">
                                        <History size={12} className="text-emerald-200" />
                                     </div>
                                   ) : null}
                                </div>
                              )}

                              <div className="flex justify-between items-start relative z-10">
                                <span className={`text-[11px] font-black px-1 rounded-md ${isSelected ? 'text-white bg-emerald-500/50' : isToday ? 'text-emerald-600 underline underline-offset-1 decoration-2' : 'text-emerald-900/40'}`}>
                                  {item.day}
                                </span>
                                {hasLogs && (
                                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white shadow-[0_0_4px_white]' : 'bg-emerald-400'}`} />
                                )}
                              </div>

                              <div className="flex-1 flex flex-col justify-center items-center relative z-10 pointer-events-none px-0.5">
                                 {hasLogs && (
                                   <div className="flex flex-col items-center">
                                      <span className={`text-[10px] font-black tracking-tighter leading-none ${isSelected ? 'text-white/90' : 'text-emerald-700'}`}>
                                        {item.duration > 60 ? `${Math.floor(item.duration/60)}h${item.duration%60}m` : `${item.duration}m`}
                                      </span>
                                      <div className={`w-6 h-1 mt-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-emerald-50'}`}>
                                         <div className={`h-full rounded-full transition-all duration-700 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} style={{width: `${Math.min((item.duration/480)*100, 100)}%`}} />
                                      </div>
                                   </div>
                                 )}
                              </div>

                              <div className="flex -space-x-1 mt-auto relative z-10 pointer-events-none justify-center transition-all">
                                {item.images && item.images.slice(0, 3).map((img, imgIdx) => (
                                  <div key={imgIdx} className={`w-3.5 h-3.5 rounded-md overflow-hidden border border-white shadow-sm ring-1 ring-emerald-900/5 ${isSelected ? 'opacity-100' : 'opacity-80'} transition-all`}>
                                    <img src={img} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 分类统计卡片 - 占据右侧 4 列 */}
                  <div className="xl:col-span-4 space-y-4 animate-in slide-in-from-right duration-700">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg shadow-emerald-100/50 relative overflow-hidden group min-h-[70px] flex flex-col justify-center">
                         <span className="text-[9px] font-bold tracking-tight opacity-80 relative z-10 text-emerald-50">Focus</span>
                         <div className="text-xl font-bold tracking-tighter relative z-10 font-mono">
                           {formatTime(statsData.filter(item => item.name !== 'Rest').reduce((acc, item) => acc + item.value * 60, 0))}
                         </div>
                       </div>
                       <div className="bg-white border border-emerald-50 px-4 py-3 rounded-2xl shadow-sm relative overflow-hidden group min-h-[70px] flex flex-col justify-center">
                         <span className="text-[9px] font-bold tracking-tight text-emerald-600 relative z-10">Rest</span>
                         <div className="text-xl font-bold tracking-tighter relative z-10 font-mono text-emerald-900">
                           {formatTime(restTimeTotal)}
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                       <div className="px-1 text-[11px] font-bold text-emerald-800 tracking-tight flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown
                       </div>
                       {statsData.filter(item => item.name !== 'Rest').map((item, idx) => (
                        <div key={item.name} className="bg-white px-3 py-2.5 rounded-xl border border-emerald-50 shadow-sm hover:shadow-md transition-all hover:-translate-x-1 flex items-center gap-3" style={{ animationDelay: `${idx * 20}ms` }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm flex-shrink-0" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                            {React.createElement(getCategoryIcon(item.name as Category), { size: 16 })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[11px] font-bold text-emerald-700 tracking-tight truncate">{item.name}</span>
                              <span className="text-xs font-bold text-emerald-950 font-mono tracking-tight">{item.value}m</span>
                            </div>
                            <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                               <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="px-5 py-2 text-[10px] font-bold text-emerald-500 tracking-tight text-center">{relevantLogs.length} sessions in this period</div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {statsView === 'week' && (
            <div className="pb-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 w-full">
               <div className="bg-white rounded-[2rem] p-3 border border-emerald-50 shadow-sm overflow-hidden ring-1 ring-emerald-50/50">
                 <div className="grid grid-cols-7 gap-2">
                   {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                       <div key={d} className="text-center text-[10px] font-bold text-emerald-500 py-1 tracking-tight">{d}</div>
                   ))}
                   {calendarGridData.map((item, idx) => {
                     if (item.empty) return <div key={idx} className="aspect-[1.8/1] opacity-[0.03] bg-emerald-900 rounded-xl" />;
                     
                     const isSelected = selectedStatsDate === item.dateStr;
                     const isToday = formatDate(Date.now()) === item.dateStr;
                     const hasLogs = item.duration > 0;
                     const firstImage = item.images?.[0];

                     return (
                       <div 
                         key={idx} 
                         onClick={() => {
                           setSelectedStatsDate(item.dateStr || '');
                           setStatsView('day');
                         }}
                         className={`aspect-[1.8/1] rounded-xl p-1.5 sm:p-2 flex flex-col justify-between border transition-all cursor-pointer group relative overflow-hidden active:scale-95
                           ${isSelected ? 'bg-emerald-600 border-emerald-600 shadow-xl scale-[1.01] z-10' : 
                             hasLogs ? 'bg-white border-emerald-50 shadow-sm hover:border-emerald-200 hover:shadow-md' : 'bg-emerald-50/20 border-transparent'}
                           ${isToday && !isSelected ? 'ring-1 ring-emerald-400 ring-offset-1' : ''}
                         `}
                       >
                         {!isSelected && (
                           <div className="absolute inset-0 z-0">
                              {firstImage ? (
                                <img src={firstImage} className="w-full h-full object-cover opacity-[0.1] group-hover:opacity-30 transition-opacity" />
                              ) : hasLogs ? (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-white opacity-40 flex items-center justify-center">
                                   <History size={16} className="text-emerald-200" />
                                </div>
                              ) : null}
                           </div>
                         )}

                         <div className="flex justify-between items-start relative z-10">
                           <span className={`text-[10px] sm:text-[12px] font-black px-1 sm:px-1.5 rounded-md ${isSelected ? 'text-white bg-emerald-500/50' : isToday ? 'text-emerald-600 underline underline-offset-1 decoration-2' : 'text-emerald-900/40'}`}>
                             {item.day}
                           </span>
                           {hasLogs && (
                             <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isSelected ? 'bg-white shadow-[0_0_4px_white]' : 'bg-emerald-400'}`} />
                           )}
                         </div>

                         <div className="flex-1 flex flex-col justify-center items-center relative z-10 pointer-events-none">
                            {hasLogs ? (
                              <div className="flex flex-col items-center">
                                 <span className={`text-[10px] sm:text-[13px] font-black tracking-tighter leading-none ${isSelected ? 'text-white/90' : 'text-emerald-700'}`}>
                                   {item.duration > 60 ? `${Math.floor(item.duration/60)}h ${item.duration%60}m` : `${item.duration}m`}
                                 </span>
                                 <div className={`w-8 sm:w-12 h-1 mt-1 sm:mt-1.5 rounded-full ${isSelected ? 'bg-white/30' : 'bg-emerald-50'}`}>
                                    <div className={`h-full rounded-full transition-all duration-700 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} style={{width: `${Math.min((item.duration/480)*100, 100)}%`}} />
                                 </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-200/50 tracking-tight">No logs</span>
                            )}
                         </div>

                         <div className="flex -space-x-1 relative z-10 pointer-events-none justify-center">
                           {item.images && item.images.slice(0, 4).map((img, imgIdx) => (
                             <div key={imgIdx} className={`w-3 sm:w-4 h-3 sm:h-4 rounded-md overflow-hidden border border-white shadow-sm ring-1 ring-emerald-900/5 ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                               <img src={img} className="w-full h-full object-cover" />
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-3 space-y-3">
                     <div className="bg-emerald-600 text-white px-5 py-4 rounded-[1.5rem] shadow-lg shadow-emerald-100/50 relative overflow-hidden group min-h-[80px] flex flex-col justify-center">
                       <span className="text-[10px] font-bold tracking-tight opacity-80 relative z-10 text-emerald-50">Focus</span>
                       <div className="text-2xl font-bold tracking-tighter relative z-10 font-mono">
                         {formatTime(statsData.filter(item => item.name !== 'Rest').reduce((acc, item) => acc + item.value * 60, 0))}
                       </div>
                     </div>
                     <div className="bg-white border border-emerald-50 px-5 py-4 rounded-[1.5rem] shadow-sm relative overflow-hidden group min-h-[80px] flex flex-col justify-center">
                       <span className="text-[10px] font-bold tracking-tight text-emerald-300 relative z-10">Rest</span>
                       <div className="text-2xl font-bold tracking-tighter relative z-10 font-mono text-emerald-900">
                         {formatTime(restTimeTotal)}
                       </div>
                     </div>
                  </div>
                  
                  <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 pb-1">
                    {statsData.filter(item => item.name !== 'Rest').map((item, idx) => (
                      <div key={item.name} className="bg-white px-3 py-2 rounded-xl border border-emerald-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-center" style={{ animationDelay: `${idx * 20}ms` }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm flex-shrink-0" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                            {React.createElement(getCategoryIcon(item.name as Category), { size: 14 })}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-emerald-900/40 tracking-tight leading-none mb-1 truncate">{item.name}</span>
                            <div className="text-sm font-bold text-emerald-950 truncate leading-none tracking-tight">{item.value}m</div>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-emerald-50/70 rounded-full overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {statsView === 'year' && (
            <div className="space-y-4 pb-10 animate-in fade-in slide-in-from-bottom-4 w-full">
              <div className="bg-white rounded-[2.5rem] p-5 border border-emerald-50 shadow-sm overflow-hidden ring-1 ring-emerald-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {yearMonthStats.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        const year = new Date(selectedStatsDate).getFullYear();
                        const firstDayOfMonth = `${year}-${(m.month + 1).toString().padStart(2, '0')}-01`;
                        setSelectedStatsDate(firstDayOfMonth);
                        setStatsView('month');
                        setViewMode('grid');
                      }}
                      className="bg-white p-3 rounded-[1.5rem] border border-emerald-50 shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group ring-1 ring-emerald-50/20"
                    >
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="text-[11px] font-bold text-emerald-950 tracking-tight leading-none truncate pr-2">
                           {new Date(new Date(selectedStatsDate).getFullYear(), m.month).toLocaleString(undefined, { month: 'short' })}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded-full">{m.totalMinutes}m</div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="w-full h-20 bg-gradient-to-br from-emerald-50/50 to-white rounded-xl overflow-hidden border border-emerald-100/30 flex items-center justify-center relative group-hover:border-emerald-200/50 transition-colors shadow-inner">
                          {m.sampleImage ? (
                            <img src={m.sampleImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                          ) : m.totalMinutes > 0 ? (
                            <div className="flex flex-col items-center gap-1.5 opacity-30 group-hover:scale-110 transition-transform">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <History size={16} className="text-emerald-400" />
                              </div>
                              <span className="text-[8px] font-bold tracking-tight text-emerald-600">Active</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 opacity-10">
                              <ImageIcon size={14} className="text-emerald-300" />
                              <span className="text-[8px] font-bold tracking-tight">Empty</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-1 px-0.5">
                          {m.categories.filter(cat => cat.name !== 'Rest').slice(0,2).map(cat => (
                            <div key={cat.name} className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat.name as Category) }} />
                              <div className="text-[9px] font-bold text-emerald-800/60 truncate tracking-tight leading-none">{cat.name}</div>
                              <div className="ml-auto text-[9px] font-bold text-emerald-400 leading-none">{cat.minutes}m</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 animate-in slide-in-from-bottom duration-500 delay-150">
                  <div className="lg:col-span-3 space-y-2">
                     <div className="bg-emerald-600 text-white px-4 py-3 rounded-[1.25rem] shadow-lg shadow-emerald-100/50 relative overflow-hidden group min-h-[64px] flex flex-col justify-center">
                       <span className="text-[10px] font-bold tracking-tight opacity-80 relative z-10 text-emerald-50">Focus</span>
                       <div className="text-xl font-bold mt-0.5 tracking-tighter relative z-10 font-mono">
                         {formatTime(statsData.filter(item => item.name !== 'Rest').reduce((acc, item) => acc + item.value * 60, 0))}
                       </div>
                     </div>
                     <div className="bg-white border border-emerald-50 px-4 py-3 rounded-[1.25rem] shadow-sm relative overflow-hidden group min-h-[64px] flex flex-col justify-center">
                       <span className="text-[10px] font-bold tracking-tight text-emerald-300 relative z-10">Rest</span>
                       <div className="text-xl font-bold mt-0.5 tracking-tighter relative z-10 font-mono text-emerald-900">
                         {formatTime(restTimeTotal)}
                       </div>
                     </div>
                     <div className="px-5 py-0.5 text-[10px] font-bold text-emerald-300 tracking-tight">{relevantLogs.length} sessions year</div>
                  </div>
                  
                  <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 pb-1">
                    {statsData.filter(item => item.name !== 'Rest').map((item, idx) => (
                      <div key={item.name} className="bg-white px-3 py-2 rounded-xl border border-emerald-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-center" style={{ animationDelay: `${idx * 20}ms` }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm flex-shrink-0" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                            {React.createElement(getCategoryIcon(item.name as Category), { size: 14 })}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-emerald-900/40 tracking-tight leading-none mb-1 truncate">{item.name}</span>
                            <div className="text-sm font-bold text-emerald-950 truncate leading-none tracking-tight">{item.value}m</div>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-emerald-50/70 rounded-full overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 h-[360px] shadow-sm flex flex-col relative overflow-hidden group ring-1 ring-emerald-50/50">
                   <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown</h3>
                   {statsData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                       <Pie data={statsData.filter(d => d.value > 0)} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                         {statsData.filter(d => d.value > 0).map(entry => <Cell key={entry.name} fill={getCategoryColor(entry.name as Category)} />)}
                         </Pie>
                         <RechartsTooltip contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', padding:'10px 20px', fontWeight: 'bold'}} />
                         <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', paddingTop: '15px'}} />
                       </PieChart>
                     </ResponsiveContainer>
                   ) : <div className="h-full flex items-center justify-center text-emerald-200 font-bold tracking-tight">No Activity</div>}
                 </div>
                 <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 h-[360px] shadow-sm flex flex-col relative overflow-hidden group ring-1 ring-emerald-50/50">
                   <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Time Spent (Min)</h3>
                   <ResponsiveContainer width="100%" height="100%">
                     <ReBarChart data={yearHistory}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                       <YAxis fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                       <RechartsTooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.1)'}} />
                       <Bar dataKey="minutes" fill="#10b981" radius={[8, 8, 8, 8]} barSize={24} />
                     </ReBarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </div>
          )}

          {(statsView === 'month' || statsView === 'week') && viewMode === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 animate-in zoom-in-95 duration-500">
               <div className="bg-white p-5 rounded-[2.5rem] border border-emerald-50 h-[340px] shadow-sm flex flex-col relative overflow-hidden group">
                 <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown</h3>
                 {statsData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                     <Pie data={statsData.filter(d => d.value > 0)} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                       {statsData.filter(d => d.value > 0).map(entry => <Cell key={entry.name} fill={getCategoryColor(entry.name as Category)} />)}
                     </Pie>
                       <RechartsTooltip contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', padding:'10px 20px', fontWeight: 'bold'}} />
                       <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '9px', fontWeight: 'bold', paddingTop: '15px'}} />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : <div className="h-full flex items-center justify-center text-emerald-200 font-bold tracking-tight">No Activity</div>}
               </div>
               <div className="bg-white p-5 rounded-[2.5rem] border border-emerald-50 h-[340px] shadow-sm flex flex-col relative overflow-hidden group">
                 <h3 className="text-sm font-bold mb-4 text-emerald-800 tracking-tight relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Time Spent (Min)</h3>
                 <ResponsiveContainer width="100%" height="100%">
                   <ReBarChart data={statsView === 'week' ? weekHistory : monthHistory}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                     <YAxis fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                     <RechartsTooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                     <Bar dataKey="minutes" fill="#10b981" radius={[8, 8, 8, 8]} barSize={20} />
                   </ReBarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
