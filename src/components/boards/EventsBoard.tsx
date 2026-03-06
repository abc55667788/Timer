import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Target, Sparkles, TrendingUp, CalendarDays, Mountain, Tags, Hourglass, Image as ImageIcon, X, Save, Trash2, Settings, ChevronDown, ChevronUp, Eye, EyeOff, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { APP_LOGO, CategoryData, EventProject, LogEntry } from '../../types';
import { formatDate, formatTime } from '../../utils/time';
import { compressImage } from '../../utils/media';
import DatePicker from '../DatePicker';

interface EventsBoardProps {
  eventProjects: EventProject[];
  setEventProjects: (projects: EventProject[] | ((prev: EventProject[]) => EventProject[])) => void;
  categories: CategoryData[];
  logs: LogEntry[];
  currentEventId?: string;
  darkMode: boolean;
}

type EventFormState = {
  name: string;
  description: string;
  category: string;
  startDate: string;
  expectedHours: string;
  expectedDays: string;
  images: string[];
  isRecurring: boolean;
  recurringPeriod: 'daily' | 'weekly' | 'custom';
  customPeriodDays: string;
  targetMinutesPerDay: string;
};

const EventsBoard: React.FC<EventsBoardProps> = ({
  eventProjects,
  setEventProjects,
  categories,
  logs,
  currentEventId,
  darkMode,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const eventColorTokens = [
    {
      light: 'bg-sky-50 text-sky-700 border-sky-200',
      dark: 'bg-sky-500/15 text-sky-200 border-sky-500/35',
      completed: '#0ea5e9',
      expected: '#6366f1',
    },
    {
      light: 'bg-pink-50 text-pink-700 border-pink-200',
      dark: 'bg-pink-500/15 text-pink-200 border-pink-500/35',
      completed: '#ec4899',
      expected: '#f43f5e',
    },
    {
      light: 'bg-violet-50 text-violet-700 border-violet-200',
      dark: 'bg-violet-500/15 text-violet-200 border-violet-500/35',
      completed: '#8b5cf6',
      expected: '#a855f7',
    },
    {
      light: 'bg-amber-50 text-amber-700 border-amber-200',
      dark: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
      completed: '#f59e0b',
      expected: '#f97316',
    },
    {
      light: 'bg-teal-50 text-teal-700 border-teal-200',
      dark: 'bg-teal-500/15 text-teal-200 border-teal-500/35',
      completed: '#14b8a6',
      expected: '#10b981',
    },
    {
      light: 'bg-rose-50 text-rose-700 border-rose-200',
      dark: 'bg-rose-500/15 text-rose-200 border-rose-500/35',
      completed: '#f43f5e',
      expected: '#ef4444',
    },
  ] as const;

  const publicPreviewImages = ['./timer-play.png', './timer-read.png', './timer-run.png', './timer-coding.png'];
  const getTodayDateInput = () => formatDate(Date.now());
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [chartView, setChartView] = useState<'trend' | 'recurring30'>('trend');
  const [showRecurringTasks, setShowRecurringTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('emerald-events-show-recurring-tasks');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [hideNotDueRecurringCards, setHideNotDueRecurringCards] = useState(() => {
    try {
      return localStorage.getItem('emerald-events-hide-not-due-recurring') === 'true';
    } catch {
      return false;
    }
  });
  const [hiddenEventIds, setHiddenEventIds] = useState<string[]>([]);
  const [eventForm, setEventForm] = useState<EventFormState>({
    name: '',
    description: '',
    category: '',
    startDate: getTodayDateInput(),
    expectedHours: '',
    expectedDays: '',
    images: [],
    isRecurring: false,
    recurringPeriod: 'daily',
    customPeriodDays: '1',
    targetMinutesPerDay: '30',
  });

  useEffect(() => {
    localStorage.setItem('emerald-events-show-recurring-tasks', String(showRecurringTasks));
  }, [showRecurringTasks]);

  useEffect(() => {
    localStorage.setItem('emerald-events-hide-not-due-recurring', String(hideNotDueRecurringCards));
  }, [hideNotDueRecurringCards]);

  const getFocusSeconds = (log: LogEntry) => {
    const duration = log.endTime && log.startTime
      ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000))
      : log.duration;
    const restDuration = log.phaseDurations ? (log.phaseDurations.rest || 0) : (log.category === 'Rest' ? duration : 0);
    return log.category === 'Rest' ? 0 : Math.max(0, duration - restDuration);
  };

  const todayKey = formatDate(Date.now());

  const isRecurringDueOnDay = (project: EventProject, dayTs: number) => {
    if (!project.isRecurring) return false;
    const dayMs = 24 * 60 * 60 * 1000;
    const startSource = typeof project.startAt === 'number' ? project.startAt : project.createdAt;
    const startDate = new Date(startSource);
    const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    if (dayTs < normalizedStart) return false;
    const diffDays = Math.floor((dayTs - normalizedStart) / dayMs);
    if (project.recurringPeriod === 'weekly') return diffDays % 7 === 0;
    if (project.recurringPeriod === 'custom') return diffDays % Math.max(1, project.customPeriodDays || 1) === 0;
    return true;
  };

  const projectStats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const computed = eventProjects.map(project => {
      const relatedLogs = logs.filter(log => log.eventId === project.id);
      const allRelatedLogs = logs.filter(log => log.eventId === project.id);
      const dailyTotals: Record<string, number> = {};
      relatedLogs.forEach(log => {
        const key = formatDate(log.startTime);
        dailyTotals[key] = (dailyTotals[key] || 0) + getFocusSeconds(log);
      });
      const allDailyTotals: Record<string, number> = {};
      allRelatedLogs.forEach(log => {
        const key = formatDate(log.startTime);
        allDailyTotals[key] = (allDailyTotals[key] || 0) + getFocusSeconds(log);
      });
      const dailyValues = Object.values(dailyTotals);
      const totalFocusSeconds = dailyValues.reduce((acc, v) => acc + v, 0);
      const todayFocusSeconds = dailyTotals[todayKey] || 0;
      const maxDailySeconds = dailyValues.length ? Math.max(...dailyValues) : 0;
      const startAt = typeof project.startAt === 'number' ? project.startAt : project.createdAt;
      const elapsedDays = Math.max(1, Math.ceil((now - startAt) / dayMs));

      const expectedTotalMinutes = project.expectedTotalMinutes ?? project.expectedMinutes;
      const expectedDays = (typeof project.expectedDays === 'number' && project.expectedDays > 0)
        ? project.expectedDays
        : elapsedDays;
      const avgDailySeconds = expectedDays > 0
        ? Math.round(totalFocusSeconds / expectedDays)
        : 0;
      const completionRate = expectedTotalMinutes && expectedTotalMinutes > 0
        ? Math.min(100, Math.round((totalFocusSeconds / (expectedTotalMinutes * 60)) * 100))
        : undefined;

      const getRecurringStatus = () => {
        if (!project.isRecurring) return { isToday: false, reached: false, progress: 0 };
        const dayMs = 24 * 60 * 60 * 1000;
        const targetSec = (project.targetMinutesPerDay || 30) * 60;
        const progress = Math.min(100, Math.round((todayFocusSeconds / targetSec) * 100));
        const reached = todayFocusSeconds >= targetSec;

        let isToday = false;
        const startTs = typeof project.startAt === 'number' ? project.startAt : project.createdAt;
        const diffDays = Math.floor((now - startTs) / dayMs);

        if (project.recurringPeriod === 'daily') {
          isToday = true;
        } else if (project.recurringPeriod === 'weekly') {
          // 这里的简化逻辑：每周的同一天。
          isToday = diffDays % 7 === 0;
        } else if (project.recurringPeriod === 'custom') {
          const N = project.customPeriodDays || 1;
          isToday = diffDays % N === 0;
        }

        return { isToday, reached, progress };
      };

      const recurringStatus = getRecurringStatus();

      const recurringCheckinSummary = (() => {
        if (!project.isRecurring) return { recurringDueDays: 0, recurringCompletedDays: 0 };
        const targetSeconds = Math.max(60, (project.targetMinutesPerDay || 30) * 60);
        const startSource = typeof project.startAt === 'number' ? project.startAt : project.createdAt;
        const startDate = new Date(startSource);
        const startTs = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        const nowDate = new Date(now);
        const todayTs = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
        let recurringDueDays = 0;
        let recurringCompletedDays = 0;
        for (let ts = startTs; ts <= todayTs; ts += dayMs) {
          if (!isRecurringDueOnDay(project, ts)) continue;
          recurringDueDays += 1;
          const key = formatDate(ts);
          if ((allDailyTotals[key] || 0) >= targetSeconds) {
            recurringCompletedDays += 1;
          }
        }
        return { recurringDueDays, recurringCompletedDays };
      })();

      return {
        ...project,
        startAt,
        expectedTotalMinutes,
        expectedDays,
        relatedLogs,
        dailyTotals,
        totalFocusSeconds,
        todayFocusSeconds,
        maxDailySeconds,
        avgDailySeconds,
        completionRate,
        recurringStatus,
        recurringDueDays: recurringCheckinSummary.recurringDueDays,
        recurringCompletedDays: recurringCheckinSummary.recurringCompletedDays,
      };
    });

    // 排序逻辑改进
    return computed.sort((a, b) => {
      // 1. 周期性事件且今天是目标日的排在最前（按今日进度排）
      const aIsToday = a.isRecurring && a.recurringStatus?.isToday;
      const bIsToday = b.isRecurring && b.recurringStatus?.isToday;
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      // 2. 今天不是目标日的周期事件排到最后
      const aRecurringNotDue = a.isRecurring && !a.recurringStatus?.isToday;
      const bRecurringNotDue = b.isRecurring && !b.recurringStatus?.isToday;
      if (aRecurringNotDue && !bRecurringNotDue) return 1;
      if (!aRecurringNotDue && bRecurringNotDue) return -1;

      // 3. 如果都是今日周期事件，则按今日进度排
      if (aIsToday && bIsToday) {
        return (b.recurringStatus?.progress || 0) - (a.recurringStatus?.progress || 0);
      }

      // 4. 其他按常规排序
      return (b.todayFocusSeconds - a.todayFocusSeconds) || (b.totalFocusSeconds - a.totalFocusSeconds);
    });
  }, [eventProjects, logs, todayKey]);


  useEffect(() => {
    if (!currentEventId) return;
    const exists = projectStats.some(project => project.id === currentEventId);
    if (exists) {
      setHiddenEventIds(prev => prev.filter(id => id !== currentEventId));
    }
  }, [currentEventId, projectStats]);

  useEffect(() => {
    setHiddenEventIds(prev => prev.filter(id => projectStats.some(project => project.id === id)));
  }, [projectStats]);

  const isModalOpen = showNewEventModal || !!editingEventId;

  const visibleProjects = useMemo(
    () => projectStats.filter(project => !hiddenEventIds.includes(project.id)),
    [projectStats, hiddenEventIds],
  );

  const displayProjects = useMemo(
    () => visibleProjects.filter(project => {
      if (project.isRecurring && !showRecurringTasks) return false;
      if (hideNotDueRecurringCards && project.isRecurring && !project.recurringStatus?.isToday) return false;
      return true;
    }),
    [visibleProjects, hideNotDueRecurringCards, showRecurringTasks],
  );

  const hasRecurringProjects = useMemo(
    () => projectStats.some(project => project.isRecurring),
    [projectStats],
  );

  const trendVisibleProjects = useMemo(
    () => visibleProjects.filter(project => {
      if (!project.isRecurring) return true;
      if (!showRecurringTasks) return false;
      if (hideNotDueRecurringCards && !project.recurringStatus?.isToday) return false;
      return true;
    }),
    [visibleProjects, showRecurringTasks, hideNotDueRecurringCards],
  );

  const projectColorMap = useMemo(() => {
    const map: Record<string, { completed: string; expected: string; light: string; dark: string }> = {};
    projectStats.forEach((project, index) => {
      const token = eventColorTokens[index % eventColorTokens.length];
      map[project.id] = {
        completed: token.completed,
        expected: token.expected,
        light: token.light,
        dark: token.dark,
      };
    });
    return map;
  }, [projectStats]);

  const lineData = useMemo(() => {
    const now = new Date();
    const days: Array<Record<string, string | number>> = [];
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = -30; i <= 30; i += 1) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dateKey = formatDate(day.getTime());
      const date = `${String(day.getMonth() + 1).padStart(2, '0')}/${String(day.getDate()).padStart(2, '0')}`;
      days.push({ date, dateKey, dayTs: day.getTime() });
    }

    projectStats.forEach(project => {
      const completedKey = `completed_${project.id}`;
      const expectedKey = `expected_${project.id}`;
      const dailyCompletedHours = new Array(days.length).fill(0);
      logs.forEach(log => {
        if (log.eventId !== project.id) return;
        const key = formatDate(log.startTime);
        const dayIndex = days.findIndex(day => day.dateKey === key);
        if (dayIndex === -1) return;
        dailyCompletedHours[dayIndex] += getFocusSeconds(log) / 3600;
      });

      let completedRunning = 0;
      for (let idx = 0; idx < days.length; idx += 1) {
        completedRunning += dailyCompletedHours[idx];
        days[idx][completedKey] = Number(completedRunning.toFixed(2));
      }

      const totalExpectedHours = (project.expectedTotalMinutes ?? project.expectedMinutes)
        ? ((project.expectedTotalMinutes ?? project.expectedMinutes) as number) / 60
        : (project.expectedTotalHours || 0);
      const expectedDays = Math.max(1, project.expectedDays || 1);
      const expectedPerDay = totalExpectedHours > 0 ? totalExpectedHours / expectedDays : 0;
      const projectStartTs = (() => {
        const src = typeof project.startAt === 'number' ? project.startAt : project.createdAt;
        const d = new Date(src);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      })();

      let expectedRunning = 0;
      let expectedDayCounter = 0;
      for (let idx = 0; idx < days.length; idx += 1) {
        const dayTs = typeof days[idx].dayTs === 'number' ? (days[idx].dayTs as number) : 0;
        if (dayTs >= projectStartTs && expectedDayCounter < expectedDays) {
          expectedRunning += expectedPerDay;
          expectedDayCounter += 1;
        }
        days[idx][expectedKey] = Number(expectedRunning.toFixed(2));
      }

      for (let idx = 0; idx < days.length; idx += 1) {
        if (typeof days[idx][completedKey] !== 'number') days[idx][completedKey] = 0;
        if (typeof days[idx][expectedKey] !== 'number') days[idx][expectedKey] = 0;
      }
    });

    return days;
  }, [projectStats, logs]);

  const recurring30Data = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    const todayTs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const days = Array.from({ length: 30 }, (_, idx) => {
      const ts = todayTs - (29 - idx) * dayMs;
      return {
        ts,
        key: formatDate(ts),
        label: `${String(new Date(ts).getMonth() + 1).padStart(2, '0')}/${String(new Date(ts).getDate()).padStart(2, '0')}`,
      };
    });

    return projectStats
      .filter(project => project.isRecurring)
      .map(project => {
        const targetSeconds = Math.max(60, (project.targetMinutesPerDay || 30) * 60);
        const perDay = days.map(day => {
          const due = isRecurringDueOnDay(project, day.ts);
          const focusedSeconds = project.dailyTotals[day.key] || 0;
          const done = due && focusedSeconds >= targetSeconds;
          return { ...day, due, done, focusedSeconds };
        });
        const dueCount = perDay.filter(d => d.due).length;
        const doneCount = perDay.filter(d => d.done).length;
        const completionRate = dueCount > 0 ? Math.round((doneCount / dueCount) * 100) : 0;
        return {
          project,
          days: perDay,
          dueCount,
          doneCount,
          completionRate,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [projectStats]);

  const recurring30FilteredData = useMemo(
    () => hideNotDueRecurringCards
      ? recurring30Data.filter(item => item.project.recurringStatus?.isToday)
      : recurring30Data,
    [recurring30Data, hideNotDueRecurringCards],
  );

  const toggleEventVisibility = (eventId: string) => {
    setHiddenEventIds(prev => prev.includes(eventId)
      ? prev.filter(id => id !== eventId)
      : [...prev, eventId]);
  };

  const resetForm = () => {
    setEventForm({
      name: '',
      description: '',
      category: '',
      startDate: getTodayDateInput(),
      expectedHours: '',
      expectedDays: '',
      images: [],
      isRecurring: false,
      recurringPeriod: 'daily',
      customPeriodDays: '1',
      targetMinutesPerDay: '30',
    });
  };

  const openNewEventModal = () => {
    resetForm();
    setEditingEventId(null);
    setShowNewEventModal(true);
  };

  const openEditEventModal = (project: typeof projectStats[number]) => {
    setEditingEventId(project.id);
    setShowNewEventModal(false);
    setEventForm({
      name: project.name || '',
      description: project.description || '',
      category: (project.tags || [])[0] || '',
      startDate: formatDate(typeof project.startAt === 'number' ? project.startAt : project.createdAt),
      expectedHours: typeof project.expectedTotalHours === 'number'
        ? String(project.expectedTotalHours)
        : (typeof project.expectedTotalMinutes === 'number' ? String(Math.round((project.expectedTotalMinutes / 60) * 10) / 10) : ''),
      expectedDays: typeof project.expectedDays === 'number' ? String(project.expectedDays) : '',
      images: Array.isArray(project.images) ? [...project.images] : [],
      isRecurring: !!project.isRecurring,
      recurringPeriod: project.recurringPeriod || 'daily',
      customPeriodDays: String(project.customPeriodDays || 1),
      targetMinutesPerDay: String(project.targetMinutesPerDay || 30),
    });
  };

  const closeAllModals = () => {
    setShowNewEventModal(false);
    setEditingEventId(null);
    setShowCategoryDropdown(false);
    setShowPeriodDropdown(false);
    resetForm();
  };

  const selectCategory = (catName: string) => {
    setEventForm(prev => ({ ...prev, category: catName }));
    setShowCategoryDropdown(false);
  };

  const upsertEventFromForm = () => {
    const name = eventForm.name.trim();
    if (!name) return;

    const alreadyExists = eventProjects.some(project => (
      project.name.trim().toLowerCase() === name.toLowerCase() && project.id !== editingEventId
    ));
    if (alreadyExists) return;

    const parsedHours = !eventForm.isRecurring && eventForm.expectedHours.trim() !== ''
      ? Math.max(0, parseFloat(eventForm.expectedHours) || 0)
      : undefined;
    const parsedDays = !eventForm.isRecurring && eventForm.expectedDays.trim() !== ''
      ? Math.max(1, parseInt(eventForm.expectedDays, 10) || 1)
      : undefined;
    const parsedTargetMins = eventForm.targetMinutesPerDay.trim() === '' ? 30 : Math.max(1, parseInt(eventForm.targetMinutesPerDay, 10) || 30);
    const parsedCustomDays = eventForm.customPeriodDays.trim() === '' ? 1 : Math.max(1, parseInt(eventForm.customPeriodDays, 10) || 1);

    const selectedCategory = eventForm.category.trim();
    const tags = selectedCategory ? [selectedCategory] : [];
    const parsedStartAt = (() => {
      if (!eventForm.startDate) return Date.now();
      const ts = new Date(`${eventForm.startDate}T00:00:00`).getTime();
      return Number.isNaN(ts) ? Date.now() : ts;
    })();

    if (editingEventId) {
      setEventProjects(prev => prev.map(project => project.id === editingEventId ? {
        ...project,
        name,
        startAt: parsedStartAt,
        description: eventForm.description.trim(),
        tags,
        expectedTotalHours: parsedHours,
        expectedTotalMinutes: typeof parsedHours === 'number' ? Math.round(parsedHours * 60) : undefined,
        expectedMinutes: undefined,
        expectedDays: parsedDays,
        images: [...eventForm.images],
        isRecurring: eventForm.isRecurring,
        recurringPeriod: eventForm.recurringPeriod,
        customPeriodDays: parsedCustomDays,
        targetMinutesPerDay: parsedTargetMins,
      } : project));
      closeAllModals();
      return;
    }

    const event: EventProject = {
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      name,
      startAt: parsedStartAt,
      description: eventForm.description.trim(),
      expectedTotalHours: parsedHours,
      expectedTotalMinutes: typeof parsedHours === 'number' ? Math.round(parsedHours * 60) : undefined,
      expectedDays: parsedDays,
      tags,
      images: [...eventForm.images],
      createdAt: Date.now(),
      isRecurring: eventForm.isRecurring,
      recurringPeriod: eventForm.recurringPeriod,
      customPeriodDays: parsedCustomDays,
      targetMinutesPerDay: parsedTargetMins,
    };

    setEventProjects(prev => [event, ...prev]);
    closeAllModals();
  };

  const deleteEditingEvent = () => {
    if (!editingEventId) return;
    setEventProjects(prev => prev.filter(project => project.id !== editingEventId));
    closeAllModals();
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (!files.length) return;
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('file read failed'));
      reader.readAsDataURL(file);
    });
    const compressed = await Promise.all(
      files.map(async (file) => {
        try {
          const base64 = await toBase64(file);
          if (!base64) return null;
          return await compressImage(base64);
        } catch {
          return null;
        }
      }),
    );
    const valid = compressed.filter((img): img is string => !!img);
    if (!valid.length) return;
    setEventForm(prev => ({ ...prev, images: [...prev.images, ...valid] }));
    e.target.value = '';
  };

  return (
    <div className={`space-y-6 w-full pb-8 ${darkMode ? 'text-emerald-100' : 'text-emerald-900'} animate-in fade-in duration-200`}>
      <div className={`relative overflow-hidden rounded-[2rem] border px-5 py-5 md:px-7 md:py-6 ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-emerald-100 shadow-sm'}`}>
        <div className={`absolute -top-8 -right-10 w-44 h-44 rounded-full blur-3xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-200/70'}`} />
        <div className={`absolute -bottom-10 -left-8 w-40 h-40 rounded-full blur-3xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-100/80'}`} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <img src={APP_LOGO} alt="Events" className={`w-14 h-14 rounded-2xl object-cover border ${darkMode ? 'border-white/10 bg-black/40' : 'border-emerald-100 bg-white'} p-1`} />
          <div className="flex-1">
            <h2 className={`text-base md:text-lg font-black tracking-tight flex items-center gap-2 ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
              <Sparkles size={16} /> Event Analytics
            </h2>
            <p className={`text-xs mt-1 font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-500'}`}>
              Track long-term projects with daily focus accumulation and cumulative trend.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={openNewEventModal}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all ${darkMode ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
            >
              + New Event
            </button>

            <button
              type="button"
              onClick={() => setShowRecurringTasks(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${showRecurringTasks
                ? (darkMode ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                : (darkMode ? 'bg-zinc-800 text-zinc-300 border-white/10' : 'bg-white text-emerald-700 border-emerald-100')
              }`}
            >
              显示 Recurring 任务
            </button>

            {hasRecurringProjects && (
              <button
                type="button"
                onClick={() => setHideNotDueRecurringCards(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${hideNotDueRecurringCards
                  ? (darkMode ? 'bg-zinc-800 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                  : (darkMode ? 'bg-zinc-800 text-zinc-300 border-white/10' : 'bg-white text-emerald-700 border-emerald-100')
                }`}
              >
                隐藏非今日打卡任务
              </button>
            )}

            {publicPreviewImages.slice(0, 3).map((img, idx) => (
              <img key={idx} src={img} alt={`preview-${idx}`} className={`w-10 h-10 rounded-xl object-cover border ${darkMode ? 'border-white/10' : 'border-emerald-100'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-[2rem] border p-4 ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-emerald-100 shadow-sm'}`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="./timer-play.png" alt="chart" className={`w-10 h-10 rounded-xl object-cover border ${darkMode ? 'border-white/10' : 'border-emerald-100'}`} />
            <Target size={16} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
            <h4 className={`text-sm font-black tracking-wide truncate ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
              {chartView === 'trend' ? 'Centered 30-Day Window · Completed vs Expected' : 'Recurring Check-ins · Last 30 Days'}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border flex items-center gap-1 ${darkMode ? 'bg-zinc-800 border-white/10' : 'bg-emerald-50 border-emerald-100'}`}>
              <button
                type="button"
                onClick={() => setChartView('trend')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black ${chartView === 'trend' ? (darkMode ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white text-emerald-700 border border-emerald-200') : (darkMode ? 'text-zinc-400' : 'text-emerald-500')}`}
              >
                Trend
              </button>
              <button
                type="button"
                onClick={() => setChartView('recurring30')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black ${chartView === 'recurring30' ? (darkMode ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white text-emerald-700 border border-emerald-200') : (darkMode ? 'text-zinc-400' : 'text-emerald-500')}`}
              >
                Daily 30D
              </button>
            </div>
            <button
              onClick={() => setIsChartCollapsed(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-300 hover:text-emerald-200' : 'bg-white border-emerald-100 text-emerald-700 hover:border-emerald-300'}`}
              type="button"
              title={isChartCollapsed ? 'Expand chart' : 'Collapse chart'}
            >
              {isChartCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              {isChartCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>
        {!isChartCollapsed && chartView === 'trend' && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {trendVisibleProjects.length === 0 ? (
                <div className={`text-xs font-bold ${darkMode ? 'text-zinc-500' : 'text-emerald-500'}`}>
                  No events to plot.
                </div>
              ) : trendVisibleProjects.map((project) => {
                const hidden = hiddenEventIds.includes(project.id);
                const colorToken = projectColorMap[project.id];
                return (
                  <button
                    key={`visibility-${project.id}`}
                    onClick={() => toggleEventVisibility(project.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all ${hidden
                      ? (darkMode ? 'bg-zinc-800 text-zinc-500 border-white/10' : 'bg-zinc-100 text-zinc-500 border-zinc-200')
                      : (darkMode ? colorToken.dark : colorToken.light)
                    }`}
                    type="button"
                    title={hidden ? `Show ${project.name}` : `Hide ${project.name}`}
                  >
                    {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    {!hidden && (
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: colorToken.completed }} />
                    )}
                    <span className="truncate max-w-[120px]">{project.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#d1fae5'} />
                  <XAxis
                    dataKey="date"
                    scale="point"
                    tick={{ fill: darkMode ? '#a7f3d0' : '#065f46', fontSize: 11 }}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis tick={{ fill: darkMode ? '#a7f3d0' : '#065f46', fontSize: 11 }} unit="h" />
                  <Tooltip
                    allowEscapeViewBox={{ x: false, y: true }}
                    offset={6}
                    formatter={(value) => `${Number(value).toFixed(1)}h`}
                  />
                  {trendVisibleProjects.flatMap((project) => {
                    const colors = projectColorMap[project.id];
                    const expectedKey = `expected_${project.id}`;
                    const completedKey = `completed_${project.id}`;
                    if (project.isRecurring) {
                      return [
                        <Area
                          key={completedKey}
                          type="monotone"
                          dataKey={completedKey}
                          stroke={colors.completed}
                          fill={colors.completed}
                          fillOpacity={0.18}
                          strokeWidth={2.2}
                          name={`${project.name} · Daily Completed`}
                        />,
                      ];
                    }
                    return [
                      <Area
                        key={expectedKey}
                        type="monotone"
                        dataKey={expectedKey}
                        stroke={colors.expected}
                        fill={colors.expected}
                        fillOpacity={0.05}
                        strokeDasharray="5 4"
                        strokeWidth={1.8}
                        name={`${project.name} · Expected`}
                      />,
                      <Area
                        key={completedKey}
                        type="monotone"
                        dataKey={completedKey}
                        stroke={colors.completed}
                        fill={colors.completed}
                        fillOpacity={0.14}
                        strokeWidth={2.3}
                        name={`${project.name} · Completed`}
                      />,
                    ];
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {!isChartCollapsed && chartView === 'recurring30' && (
          <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
            <div className={`text-[11px] font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
              Recurring check-ins in last 30 days
            </div>
            {recurring30FilteredData.length === 0 ? (
              <div className={`rounded-xl border p-4 text-sm font-bold ${darkMode ? 'bg-zinc-800/50 border-white/10 text-zinc-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                {hideNotDueRecurringCards ? '今日没有需要打卡的周期任务。' : 'No recurring events yet.'}
              </div>
            ) : recurring30FilteredData.map(item => (
              <div key={item.project.id} className={`rounded-xl border p-2.5 ${darkMode ? 'bg-zinc-800/50 border-white/10' : 'bg-emerald-50/60 border-emerald-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-black truncate">{item.project.name}</div>
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-md ${darkMode ? 'bg-black/30 text-emerald-300' : 'bg-white text-emerald-700 border border-emerald-100'}`}>
                    {item.doneCount}/{item.dueCount} · {item.completionRate}%
                  </div>
                </div>
                <div className="grid grid-cols-10 md:grid-cols-15 gap-1">
                  {item.days.map(day => (
                    <div
                      key={`${item.project.id}-${day.key}`}
                      title={`${day.label} · ${day.due ? (day.done ? 'Done' : 'Missed') : 'Not due'}`}
                      className={`h-3 rounded-sm border ${
                        !day.due
                          ? (darkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-zinc-200')
                          : day.done
                            ? (darkMode ? 'bg-emerald-500/70 border-emerald-400/50' : 'bg-emerald-500 border-emerald-500')
                            : (darkMode ? 'bg-orange-500/60 border-orange-400/40' : 'bg-orange-400 border-orange-400')
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayProjects.length === 0 ? (
          <div className={`col-span-full rounded-[2rem] border p-10 text-center ${darkMode ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-emerald-100 text-emerald-400'}`}>
            No event projects to display.
          </div>
        ) : displayProjects.map(project => {
          const isRecurringToday = project.isRecurring && project.recurringStatus?.isToday;
          const isRecurringInactive = project.isRecurring && !project.recurringStatus?.isToday;

          const preview = (project.images && project.images.length > 0)
            ? project.images[0]
            : publicPreviewImages[Math.abs(project.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % publicPreviewImages.length];
          const expectedLabel = project.expectedTotalMinutes
            ? `${formatTime(project.expectedTotalMinutes * 60)}${project.expectedDays ? ` / ${project.expectedDays} days` : ''}`
            : 'Not set';

          return (
            <button
              key={project.id}
              type="button"
              className={`w-full text-left rounded-[1.4rem] border p-4 transition-all relative overflow-hidden ${
                isRecurringInactive 
                  ? (darkMode ? 'bg-zinc-900/50 border-white/5 opacity-50 grayscale' : 'bg-gray-50 border-gray-100 opacity-60 grayscale')
                  : (darkMode ? 'bg-zinc-900 border-white/5 hover:border-emerald-500/30' : 'bg-white border-emerald-100 hover:border-emerald-300')
              } ${isRecurringToday ? (darkMode ? 'ring-1 ring-emerald-500/40' : 'ring-2 ring-emerald-500/20 shadow-emerald-500/10 shadow-lg') : ''}`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    <img src={preview} alt={project.name} className={`w-11 h-11 rounded-xl object-cover border ${darkMode ? 'border-white/10' : 'border-emerald-100'}`} />
                    {project.isRecurring && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 ${isRecurringToday ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                        <Clock size={10} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col">
                      <div className={`w-full text-sm font-black truncate ${darkMode ? 'text-zinc-50' : 'text-emerald-950'}`}>{project.name}</div>
                      {project.isRecurring && (
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isRecurringToday ? 'text-emerald-500' : 'text-gray-500'}`}>
                          {project.recurringPeriod === 'custom' ? `Every ${project.customPeriodDays}d` : project.recurringPeriod}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${darkMode ? 'text-zinc-500' : 'text-emerald-500'}`}>
                      <Tags size={11} /> {(project.tags && project.tags.length > 0) ? project.tags.slice(0, 3).join(' · ') : 'No tags'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    isRecurringToday && project.recurringStatus?.reached ? (darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-black/30 text-zinc-400' : 'bg-gray-100 text-gray-600')
                  }`}>
                    Today {formatTime(project.todayFocusSeconds)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEventModal(project);
                    }}
                    className={`p-2 rounded-lg border transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-emerald-300 hover:border-emerald-500/40' : 'bg-white border-emerald-100 text-emerald-500 hover:text-emerald-700 hover:border-emerald-300'}`}
                    title="Edit Event"
                  >
                    <Settings size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {project.isRecurring ? (
                  <>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><CalendarDays size={11} />累计打卡天数</div>{project.recurringCompletedDays}/{project.recurringDueDays}</div>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><TrendingUp size={11} />累计投入时间</div>{formatTime(project.totalFocusSeconds)}</div>
                   <div className={`${isRecurringToday ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200 shadow-inner') : (darkMode ? 'bg-black/30 border-white/5' : 'bg-gray-100 border-gray-200')} col-span-2 rounded-lg p-2 border`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`flex items-center gap-1.5 ${isRecurringToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                          <Target size={11} /> 
                          {isRecurringToday ? '今日目标' : '今日休息'}
                          {isRecurringToday && (
                            <span className="opacity-70 font-black">
                              (目标: {project.targetMinutesPerDay} Min)
                            </span>
                          )}
                        </div>
                        {isRecurringToday && (
                           <span className={`${project.recurringStatus?.reached ? 'text-emerald-600' : 'text-orange-500'}`}>
                            {project.recurringStatus?.progress}%
                           </span>
                        )}
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-gray-200/50'}`}>
                        <div
                          className={`${project.recurringStatus?.reached ? 'bg-emerald-500' : 'bg-orange-500'} h-full rounded-full transition-all duration-500 shadow-sm`}
                          style={{ width: `${isRecurringToday ? project.recurringStatus?.progress : 0}%` }}
                        />
                      </div>
                   </div>
                  </>
                ) : (
                  <>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><TrendingUp size={11} />累计投入</div>{formatTime(project.totalFocusSeconds)}</div>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><Hourglass size={11} />预期投入</div>{expectedLabel}</div>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><Mountain size={11} />最大日投入</div>{formatTime(project.maxDailySeconds)}</div>
                    <div className={`${darkMode ? 'bg-black/30 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-lg p-2 border`}><div className="flex items-center gap-1 mb-0.5"><CalendarDays size={11} />平均日投入</div>{formatTime(project.avgDailySeconds)}</div>
                  </>
                )}
              </div>
              {!project.isRecurring && typeof project.completionRate === 'number' && (
                <div className="mt-2">
                  <div className={`flex items-center justify-between text-[10px] font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
                    <span>完成进度</span>
                    <span>{project.completionRate}%</span>
                  </div>
                  <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-emerald-100'}`}>
                    <div
                      className={`${darkMode ? 'bg-emerald-400' : 'bg-emerald-600'} h-full rounded-full transition-all`}
                      style={{ width: `${project.completionRate}%` }}
                    />
                  </div>
                </div>
              )}
              <div className={`mt-2 flex items-center gap-2 text-[10px] ${darkMode ? 'text-zinc-500' : 'text-emerald-500'}`}>
                <ImageIcon size={11} /> {project.isRecurring ? 'Recurrence project' : 'Milestone project'}
              </div>
            </button>
          );
        })}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-6 bg-emerald-900/60 backdrop-blur-xl">
          <div className={`w-full max-w-xl rounded-[1.6rem] border p-4 relative ${darkMode ? 'bg-zinc-950 border-white/10' : 'bg-white border-emerald-100 shadow-2xl'}`}>
            <button
              onClick={closeAllModals}
              className={`absolute top-4 right-4 p-2 rounded-full ${darkMode ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-emerald-50 text-emerald-400 hover:text-emerald-700'} transition-all`}
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white text-emerald-700 border border-emerald-100'}`}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className={`text-base font-black tracking-tight ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {editingEventId ? 'Event Edit' : 'New Event'}
                  </h3>
                  <p className={`text-[10px] font-bold ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>
                    绑定分类、开始时间与预期计划
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Event Name</label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Event name"
                  className={`w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-50 placeholder:text-zinc-600' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-zinc-400'}`}
                />
              </div>
              <div>
                <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Category (fixed tag)</label>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold border outline-none text-left transition-all ${
                      darkMode 
                        ? 'bg-zinc-800 border-white/10 text-zinc-50 hover:bg-zinc-750 focus:border-emerald-500/50' 
                        : 'bg-white border-emerald-100 text-emerald-900 hover:border-emerald-200 focus:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <span className={!eventForm.category ? (darkMode ? 'text-zinc-500' : 'text-zinc-400') : ''}>
                      {eventForm.category || 'No category'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`} />
                  </button>

                  {showCategoryDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-[330]" 
                        onClick={() => setShowCategoryDropdown(false)} 
                      />
                      <div className={`absolute left-0 right-0 mt-1.5 z-[331] max-h-48 overflow-y-auto rounded-xl border p-1 shadow-2xl animate-in zoom-in-95 duration-150 ${
                        darkMode ? 'bg-zinc-900 border-white/10 shadow-black' : 'bg-white border-emerald-100 shadow-emerald-900/10'
                      }`}>
                        <button
                          key="none"
                          onClick={() => selectCategory('')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            !eventForm.category 
                              ? (darkMode ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700')
                              : (darkMode ? 'text-zinc-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-emerald-50/50')
                          }`}
                        >
                          No category
                        </button>
                        {categories.map(category => (
                          <button
                            key={category.name}
                            onClick={() => selectCategory(category.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                              eventForm.category === category.name
                                ? (darkMode ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700')
                                : (darkMode ? 'text-zinc-300 hover:bg-white/5' : 'text-emerald-600 hover:bg-emerald-50/50')
                            }`}
                          >
                            {category.name}
                            {eventForm.category === category.name && <Sparkles size={10} className="animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Start Date</label>
                <DatePicker
                  value={eventForm.startDate}
                  onChange={(val) => setEventForm(prev => ({ ...prev, startDate: val }))}
                  darkMode={darkMode}
                  popupSize="compact"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center gap-3">
                  <label className={`text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Is Recurring (Daily/Weekly)</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={eventForm.isRecurring}
                      onChange={(e) => setEventForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {eventForm.isRecurring ? (
                  <div className={`p-3 rounded-xl border animate-in slide-in-from-top-2 duration-200 ${darkMode ? 'bg-zinc-800/50 border-white/5' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Period</label>
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => setShowPeriodDropdown(prev => !prev)}
                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold border outline-none text-left transition-all ${
                              darkMode
                                ? 'bg-zinc-900 border-white/10 text-zinc-50 hover:bg-zinc-800'
                                : 'bg-white border-emerald-100 text-emerald-900 hover:border-emerald-200'
                            }`}
                          >
                            <span>
                              {eventForm.recurringPeriod === 'daily'
                                ? 'Daily'
                                : eventForm.recurringPeriod === 'weekly'
                                  ? 'Weekly'
                                  : 'Every N days'}
                            </span>
                            <ChevronDown size={13} className={`transition-transform duration-200 ${showPeriodDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`} />
                          </button>

                          {showPeriodDropdown && (
                            <>
                              <div className="fixed inset-0 z-[332]" onClick={() => setShowPeriodDropdown(false)} />
                              <div className={`absolute left-0 right-0 mt-1.5 z-[333] rounded-xl border p-1 shadow-2xl animate-in zoom-in-95 duration-150 ${
                                darkMode ? 'bg-zinc-900 border-white/10 shadow-black' : 'bg-white border-emerald-100 shadow-emerald-900/10'
                              }`}>
                                {[
                                  { label: 'Daily', value: 'daily' as const },
                                  { label: 'Weekly', value: 'weekly' as const },
                                  { label: 'Every N days', value: 'custom' as const },
                                ].map(option => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setEventForm(prev => ({ ...prev, recurringPeriod: option.value }));
                                      setShowPeriodDropdown(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                      eventForm.recurringPeriod === option.value
                                        ? (darkMode ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700')
                                        : (darkMode ? 'text-zinc-300 hover:bg-white/5' : 'text-emerald-600 hover:bg-emerald-50/50')
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {eventForm.recurringPeriod === 'custom' && (
                        <div>
                          <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Every N Days</label>
                          <input
                            type="number"
                            min="1"
                            value={eventForm.customPeriodDays}
                            onChange={(e) => setEventForm(prev => ({ ...prev, customPeriodDays: e.target.value }))}
                            className={`w-full rounded-lg px-2 py-1.5 text-xs font-bold border outline-none ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-50' : 'bg-white border-emerald-100 text-emerald-900'}`}
                          />
                        </div>
                      )}
                      <div className={eventForm.recurringPeriod === 'custom' ? 'md:col-span-2' : ''}>
                        <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Target Minutes Per Day</label>
                        <input
                          type="number"
                          min="1"
                          value={eventForm.targetMinutesPerDay}
                          onChange={(e) => setEventForm(prev => ({ ...prev, targetMinutesPerDay: e.target.value }))}
                          className={`w-full rounded-lg px-2 py-1.5 text-xs font-bold border outline-none ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-50' : 'bg-white border-emerald-100 text-emerald-900'}`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Expected Total Hours</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={eventForm.expectedHours}
                        onChange={(e) => setEventForm(prev => ({ ...prev, expectedHours: e.target.value }))}
                        placeholder="Expected total hours"
                        className={`w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-50 placeholder:text-zinc-600' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-zinc-400'}`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Expected Days</label>
                      <input
                        type="number"
                        min="1"
                        value={eventForm.expectedDays}
                        onChange={(e) => setEventForm(prev => ({ ...prev, expectedDays: e.target.value }))}
                        placeholder="Expected days"
                        className={`w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-50 placeholder:text-zinc-600' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-zinc-400'}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-2.5 rounded-xl border p-2.5 ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-emerald-50/40 border-emerald-100'}`}>
              <label className={`block mb-1 text-[10px] font-black ${darkMode ? 'text-zinc-400' : 'text-emerald-600'}`}>Description</label>
              <textarea
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                className={`w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none resize-none ${darkMode ? 'bg-zinc-800 border-white/10 text-zinc-50 placeholder:text-zinc-600' : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-zinc-400'}`}
              />
            </div>

            <div className="mt-2.5">
              <div className={`text-[10px] font-black mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-emerald-500'}`}>Images</div>
              <div className="flex flex-wrap gap-2">
                {eventForm.images.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setEventForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute top-0 right-0 p-1 bg-black/60 text-white rounded-bl-lg"
                      title="Remove image"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer ${darkMode ? 'border-white/15 text-zinc-500 hover:text-emerald-400' : 'border-emerald-200 text-emerald-400 hover:text-emerald-600'}`}>
                  <Plus size={16} />
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleEventImageUpload} />
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {editingEventId ? (
                <button
                  onClick={deleteEditingEvent}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all ${darkMode ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                >
                  <Trash2 size={13} className="inline mr-1" /> Delete
                </button>
              ) : <div />}
              <button
                onClick={upsertEventFromForm}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all ${darkMode ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
              >
                <Save size={13} className="inline mr-1" /> Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EventsBoard;
