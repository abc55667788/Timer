import React, { useMemo } from 'react';
import { LogEntry, Category, ColorTheme } from '../../types';
import { formatTime, formatClock, formatDate } from '../../utils/time';

interface TimelineViewProps {
  logs: LogEntry[];
  timelineRange: any;
  getCategoryColor: (cat: Category) => string;
  onSelectLog?: (log: LogEntry) => void;
  activeTheme: ColorTheme;
}

/**
 * TimelineView Component
 * 显示活动时间轴，支持多轨布局
 * ~160 行 - 符合代码规范
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  logs,
  getCategoryColor,
  onSelectLog,
  activeTheme,
}) => {
  const accentBgClass = activeTheme.classes.accent;
  const primaryColorClass = activeTheme.classes.accent.replace('bg-', 'text-');
  const borderColorClass = activeTheme.classes.border;
  const surfaceClass = activeTheme.classes.surface;

  // 按时间排序日志
  const sortedLogs = useMemo(
    () => logs.slice().sort((a, b) => b.startTime - a.startTime),
    [logs]
  );

  // 按日期分组
  const groupedByDate = useMemo(() => {
    return sortedLogs.reduce(
      (acc, log) => {
        const date = formatDate(log.startTime);
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(log);
        return acc;
      },
      {} as Record<string, LogEntry[]>
    );
  }, [sortedLogs]);

  // 计算日期统计
  const dateStats = useMemo(() => {
    return Object.entries(groupedByDate).map(([date, dateLogs]) => {
      const logsArray = dateLogs as LogEntry[];
      const totalDuration = logsArray.reduce((sum, log) => sum + log.duration, 0);
      const categoryBreakdown = logsArray.reduce(
        (acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + log.duration;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        date,
        totalDuration,
        logCount: logsArray.length,
        categoryBreakdown,
        logs: logsArray,
      };
    });
  }, [groupedByDate]);

  return (
    <div className="w-full space-y-16">
      <div className={`relative space-y-16 after:absolute after:top-4 after:bottom-4 after:left-[7px] after:w-[1px] ${activeTheme.classes.bg} after:opacity-20 after:-z-10`}>
        {dateStats.slice(0, 5).map((dayStat) => (
          <div key={dayStat.date} className="relative pl-12 space-y-8">
            <div className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full ${surfaceClass} border-[3px] ${borderColorClass} z-10 shadow-sm`} />
            
            <div className="flex items-center justify-between pr-4">
              <div>
                <h3 className={`text-sm font-black ${activeTheme.classes.text} leading-none tracking-tight`}>
                  {new Date(dayStat.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className={`text-[10px] font-bold ${activeTheme.classes.secondaryText} opacity-60 tracking-tight mt-2 uppercase`}>
                  {dayStat.logCount} sessions
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${activeTheme.classes.text} leading-none tracking-tight font-mono`}>{Math.round(dayStat.totalDuration / 60000)}<span className={`text-[10px] ${activeTheme.classes.secondaryText} font-bold ml-1 opacity-60 uppercase`}>min</span></p>
                <div className="flex gap-1 mt-3 justify-end">
                  {Object.entries(dayStat.categoryBreakdown).map(([cat, dur]) => (
                    <div 
                      key={cat} 
                      className="h-1 rounded-full opacity-60 hover:opacity-100 transition-opacity shadow-sm" 
                      style={{ 
                        width: `${Math.max(6, ((dur as number) / dayStat.totalDuration) * 60)}px`,
                        backgroundColor: getCategoryColor(cat as Category),
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4 pr-4">
              {dayStat.logs
                .sort((a, b) => a.startTime - b.startTime)
                .map((log) => (
                  <button
                    key={log.id}
                    onClick={() => onSelectLog?.(log)}
                    className={`flex-shrink-0 w-48 p-4 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 hover:bg-white/90 hover:shadow-xl transition-all text-left group shadow-sm relative overflow-hidden ml-1`}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity" 
                      style={{ 
                        backgroundColor: getCategoryColor(log.category),
                      }}
                    />
                    <p className={`text-[9px] font-black ${activeTheme.classes.secondaryText} opacity-40 tracking-widest uppercase ml-1`}>
                      {formatClock(log.startTime)}
                    </p>
                    <h4 className={`text-xs font-black ${activeTheme.classes.text} mt-2 line-clamp-2 group-hover:${primaryColorClass} transition-colors tracking-tight ml-1 leading-tight h-8`}>
                      {log.description || 'Focus Session'}
                    </h4>
                    <div className="mt-4 flex items-center justify-between ml-1">
                       <span className={`text-[8px] font-black ${activeTheme.classes.secondaryText} opacity-40 uppercase tracking-widest`}>
                        {log.category}
                      </span>
                      <span className={`text-[9px] font-black ${activeTheme.classes.text} bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 tracking-tighter tabular-nums`}>
                        {Math.round(log.duration / 60000)}m
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {sortedLogs.length === 0 && (
        <div className={`p-20 text-center ${surfaceClass}/50 rounded-[40px] border border-dashed ${borderColorClass}`}>
          <p className={`text-[10px] font-bold tracking-tight ${activeTheme.classes.secondaryText} opacity-40 uppercase`}>Activity map is clear</p>
        </div>
      )}
    </div>
  );
};
