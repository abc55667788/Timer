import { useMemo } from 'react';
import { LogEntry, StatsView, CATEGORIES } from '../types';
import { formatDate, formatDisplayDateString } from '../utils/time';

const useStats = (logs: LogEntry[], selectedStatsDate: string, statsView: StatsView) => {
  const relevantLogs = useMemo(() => {
    return statsView === 'day' 
      ? logs.filter(l => formatDate(l.startTime) === selectedStatsDate)
      : statsView === 'week'
      ? logs.filter(l => {
          const d = new Date(selectedStatsDate);
          const ld = new Date(l.startTime);
          const startOfWeek = new Date(d);
          startOfWeek.setDate(d.getDate() - d.getDay());
          startOfWeek.setHours(0,0,0,0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23,59,59,999);
          return ld >= startOfWeek && ld <= endOfWeek;
        })
      : statsView === 'month'
      ? logs.filter(l => {
          const d = new Date(selectedStatsDate);
          const ld = new Date(l.startTime);
          return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
        })
      : logs.filter(l => new Date(l.startTime).getFullYear() === new Date(selectedStatsDate).getFullYear());
  }, [logs, selectedStatsDate, statsView]);

  const statsData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    CATEGORIES.forEach(cat => categoryTotals[cat] = 0);
    
    relevantLogs.forEach(log => {
      const duration = log.endTime && log.startTime ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000)) : log.duration;
      const restDuration = log.phaseDurations ? (log.phaseDurations.rest || 0) : (log.category === 'Rest' ? duration : 0);
      const focusDuration = log.category === 'Rest' ? 0 : Math.max(0, duration - restDuration);
      
      if (log.category !== 'Rest') {
        categoryTotals[log.category] = (categoryTotals[log.category] || 0) + focusDuration;
      }
      categoryTotals['Rest'] = (categoryTotals['Rest'] || 0) + restDuration;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value: Math.round(value / 60) }))
      .sort((a,b) => b.value - a.value);
  }, [relevantLogs]);

  const restTimeTotal = useMemo(() => {
    return relevantLogs.reduce((acc, log) => {
      if (log.phaseDurations) return acc + (log.phaseDurations.rest || 0);
      return acc + (log.category === 'Rest' ? log.duration : 0);
    }, 0);
  }, [relevantLogs]);

  const weekHistory = useMemo(() => {
    const history: Record<string, number> = {};
    const baseDate = new Date(selectedStatsDate);
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    const weekDays = [...Array(7)].map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    weekDays.forEach(day => history[day] = 0);
    logs.forEach(log => {
      const day = formatDate(log.startTime);
      if (history[day] !== undefined) {
        const duration = log.endTime && log.startTime ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000)) : log.duration;
        history[day] += duration;
      }
    });
    return Object.entries(history).map(([name, value]) => ({ name: name.split('-').slice(1).join('/'), minutes: Math.round(value / 60) }));
  }, [logs, selectedStatsDate]);

  const monthHistory = useMemo(() => {
    const history: Record<string, number> = {};
    const date = new Date(selectedStatsDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      history[d.toISOString().split('T')[0]] = 0;
    }
    logs.forEach(log => {
      const d = formatDate(log.startTime);
      if (history[d] !== undefined) {
        const duration = log.endTime && log.startTime ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000)) : log.duration;
        history[d] += duration;
      }
    });
    return Object.entries(history).map(([name, value]) => ({ name: name.split('-')[2], minutes: Math.round(value / 60) }));
  }, [logs, selectedStatsDate]);

  const yearHistory = useMemo(() => {
    const history: Record<number, number> = {};
    const date = new Date(selectedStatsDate);
    const year = date.getFullYear();
    for (let i = 0; i < 12; i++) {
      history[i] = 0;
    }
    logs.forEach(log => {
      const logDate = new Date(log.startTime);
      if (logDate.getFullYear() === year) {
        const duration = log.endTime && log.startTime ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000)) : log.duration;
        history[logDate.getMonth()] += duration;
      }
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.entries(history).map(([month, value]) => ({ 
      name: monthNames[parseInt(month)], 
      minutes: Math.round(value / 60) 
    }));
  }, [logs, selectedStatsDate]);

  const yearMonthStats = useMemo(() => {
    const date = new Date(selectedStatsDate);
    const year = date.getFullYear();
    const months = [...Array(12)].map((_, m) => {
      const monthStart = new Date(year, m, 1);
      const monthEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);
      const logsInMonth = logs.filter(l => new Date(l.startTime) >= monthStart && new Date(l.startTime) <= monthEnd);
      const totals: Record<string, number> = {};
      let sampleImage: string | null = null;
      logsInMonth.forEach(l => {
        const duration = l.endTime && l.startTime ? Math.max(l.duration, Math.round((l.endTime - l.startTime) / 1000)) : l.duration;
        const restDuration = l.phaseDurations ? (l.phaseDurations.rest || 0) : (l.category === 'Rest' ? duration : 0);
        const focusDuration = l.category === 'Rest' ? 0 : Math.max(0, duration - restDuration);

        if (l.category !== 'Rest') {
          totals[l.category] = (totals[l.category] || 0) + focusDuration;
        }
        totals['Rest'] = (totals['Rest'] || 0) + restDuration;
        
        if (!sampleImage && l.images && l.images.length > 0) sampleImage = l.images[0];
      });
      const categories = Object.entries(totals)
        .map(([name, value]) => ({ name, minutes: Math.round(value / 60) }))
        .filter(cat => cat.minutes > 0)
        .sort((a,b)=>b.minutes-a.minutes);
      return {
        month: m,
        categories,
        totalMinutes: Math.round(Object.values(totals).reduce((a,b)=>a+b,0)/60) || 0,
        sampleImage
      };
    });
    return months;
  }, [logs, selectedStatsDate]);

  const calendarGridData = useMemo(() => {
    const date = new Date(selectedStatsDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const data = [];
    if (statsView === 'month') {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      for(let i=0; i<firstDay; i++) data.push({ empty: true });
      for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${i.toString().padStart(2,'0')}`;
        const dayLogs = logs.filter(l => formatDate(l.startTime) === dateStr);
        const totalDuration = dayLogs.reduce((acc, l) => {
          const duration = l.endTime && l.startTime ? Math.max(l.duration, Math.round((l.endTime - l.startTime) / 1000)) : l.duration;
          return acc + duration;
        }, 0);
        const dayImages: string[] = [];
        dayLogs.forEach(l => { if(dayImages.length < 3) dayImages.push(...l.images.slice(0, 3 - dayImages.length)); });
        data.push({ empty: false, day: i, dateStr, duration: Math.round(totalDuration / 60), images: dayImages });
      }
    } else if (statsView === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = formatDate(d.getTime());
        const dayLogs = logs.filter(l => formatDate(l.startTime) === dateStr);
        const totalDuration = dayLogs.reduce((acc, l) => {
          const duration = l.endTime && l.startTime ? Math.max(l.duration, Math.round((l.endTime - l.startTime) / 1000)) : l.duration;
          return acc + duration;
        }, 0);
        const dayImages: string[] = [];
        dayLogs.forEach(l => { if(dayImages.length < 3) dayImages.push(...l.images.slice(0, 3 - dayImages.length)); });
        data.push({ empty: false, day: d.getDate(), dateStr, duration: Math.round(totalDuration / 60), images: dayImages });
      }
    }
    return data;
  }, [logs, selectedStatsDate, statsView]);

  const timelineRange = useMemo(() => {
    const baseStart = new Date(`${selectedStatsDate}T06:00:00`).getTime();
    const baseEnd = baseStart + (24 * 60 * 60 * 1000);
    const dayLogs = logs.filter(l => {
      const start = l.startTime;
      const end = l.endTime || Date.now();
      return (start < baseEnd && end > baseStart);
    });
    let minStart = baseStart;
    let maxEnd = baseEnd;
    dayLogs.forEach(l => {
      if (l.startTime < minStart) minStart = l.startTime;
      const end = l.endTime || Date.now();
      if (end > maxEnd) maxEnd = end;
    });
    const tracks: LogEntry[][] = [];
    dayLogs.sort((a,b) => a.startTime - b.startTime).forEach(log => {
      const start = log.startTime;
      const end = log.endTime || Date.now();
      let trackAssigned = false;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (!track.some(l => (start < (l.endTime || Date.now()) && end > l.startTime))) {
          track.push(log); trackAssigned = true; break;
        }
      }
      if (!trackAssigned) tracks.push([log]);
    });
    return { start: minStart, end: maxEnd, tracks };
  }, [logs, selectedStatsDate]);

  const selectedDayLogs = useMemo(() => {
    return logs.filter(l => formatDate(l.startTime) === selectedStatsDate).sort((a,b) => a.startTime - b.startTime);
  }, [logs, selectedStatsDate]);

  return {
    relevantLogs,
    statsData,
    weekHistory,
    monthHistory,
    yearHistory,
    yearMonthStats,
    calendarGridData,
    timelineRange,
    selectedDayLogs,
    restTimeTotal
  };
};

export default useStats;
