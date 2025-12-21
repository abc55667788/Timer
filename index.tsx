
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Play, Pause, RotateCcw, BarChart3, Clock, Settings, 
  X, Maximize2, Minimize2, ChevronRight, Image as ImageIcon,
  BookOpen, Briefcase, GraduationCap, Dumbbell, Coffee, Utensils, Tv, Save,
  RefreshCw, Download, Upload, Timer as TimerIcon, Trash2, CheckCircle2, 
  AlertCircle, Square, Edit3, FileText, Calendar as CalendarIcon, Plus, Share2, Filter as FilterIcon, Edit2, Search,
  ChevronLeft, ZoomIn, ZoomOut, PanelLeftClose, PanelLeftOpen, ChevronDown, CalendarDays, LayoutGrid, BarChart, ExternalLink,
  History, Palette, Minus
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip
} from 'recharts';

// --- Types ---
type Category = 'Work' | 'Read' | 'Study' | 'Exercise' | 'Rest' | 'Eat' | 'Entertainment';

interface LogEntry {
  id: string;
  category: Category;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  images: string[];
  isLive?: boolean;
}

type TimerPhase = 'work' | 'rest';
type StatsView = 'day' | 'week' | 'month' | 'year';
type ViewMode = 'charts' | 'grid';

// --- Constants ---
const DEFAULT_CATEGORY_DATA: Record<Category, { icon: any, color: string }> = {
  Work: { icon: Briefcase, color: '#3b82f6' },        // Blue
  Study: { icon: GraduationCap, color: '#10b981' },   // Green
  Exercise: { icon: Dumbbell, color: '#facc15' },     // Yellow
  Rest: { icon: Coffee, color: '#f472b6' },          // Pink
  Read: { icon: BookOpen, color: '#8b5cf6' },         // Purple
  Eat: { icon: Utensils, color: '#f97316' },          // Orange
  Entertainment: { icon: Tv, color: '#22d3ee' },      // Cyan
};

const CATEGORIES = Object.keys(DEFAULT_CATEGORY_DATA) as Category[];

// --- Utilities ---
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatClock = (timestamp: number, zoom: number = 1) => {
  const date = new Date(timestamp);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  // When zoom is very small, only show hour (no ":00"). Use 0.3 (30%) threshold per spec.
  return zoom < 0.3 ? `${h}` : `${h}:${m}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toISOString().split('T')[0];
};

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onerror = () => resolve(base64Str);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

// --- Sub-Components ---

function MiniCalendar({ logs, selectedDate, onSelectDate, viewType }: { 
  logs: LogEntry[], 
  selectedDate: string, 
  onSelectDate: (d: string) => void,
  viewType: StatsView
}) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const recordedDays = useMemo(() => new Set(logs.map(l => formatDate(l.startTime))), [logs]);
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  const calendarDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [currentYear, currentMonth, daysInMonth, firstDay]);

  const isDateInSelectedWeek = (dateStr: string) => {
    if (viewType !== 'week') return false;
    const target = new Date(dateStr);
    const selected = new Date(selectedDate);
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - selected.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    return target >= startOfWeek && target <= endOfWeek;
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-emerald-50 shadow-sm w-full max-w-[280px] animate-in slide-in-from-left duration-300">
      <div className="flex justify-between items-center mb-6 px-3 bg-emerald-50/50 rounded-2xl py-2">
        <select 
          value={currentMonth} 
          onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1))}
          className="bg-transparent text-xs font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none"
        >
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select 
          value={currentYear} 
          onChange={(e) => setViewDate(new Date(parseInt(e.target.value), currentMonth, 1))}
          className="bg-transparent text-xs font-black text-emerald-900 outline-none cursor-pointer hover:text-emerald-600 appearance-none"
        >
          {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-6">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-bold text-emerald-200">{d}</div>)}
        {calendarDays.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
          const isSelected = selectedDate === dateStr;
          const isInWeek = isDateInSelectedWeek(dateStr);
          const hasRecord = recordedDays.has(dateStr);
          
          return (
            <button 
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative h-8 w-8 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center
                ${isSelected ? 'bg-emerald-600 text-white shadow-lg' : 
                  isInWeek ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-emerald-800'}
              `}
            >
              {d}
              {hasRecord && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>
          );
        })}
      </div>
      <button 
        onClick={() => {
          const today = formatDate(Date.now());
          setViewDate(new Date());
          onSelectDate(today);
        }}
        className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
      >
        <CalendarDays size={14} /> Today
      </button>
    </div>
  );
}

// --- Main App Component ---
function EmeraldTimer() {
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'logs' | 'sync'>('timer');
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [isActive, setIsActive] = useState(false);
  const [isPausedBySettings, setIsPausedBySettings] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showLoggingModal, setShowLoggingModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<null | 'stop' | 'setup'>(null);
  
  const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [statsView, setStatsView] = useState<StatsView>('week');

  // --- Edit time fields for viewingLog ---
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTimeError, setEditTimeError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [selectedStatsDate, setSelectedStatsDate] = useState(formatDate(Date.now()));
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(0.4); 
  const [isZoomInputActive, setIsZoomInputActive] = useState(false);
  const [wasMiniModeBeforeModal, setWasMiniModeBeforeModal] = useState(false);

  // --- Window Resize for Mini Mode ---
  useEffect(() => {
    if ((window as any).electron) {
      (window as any).electron.toggleMiniMode(isMiniMode);
    }
  }, [isMiniMode]);

  // Exit mini mode when opening modals or editing, and restore it when done
  useEffect(() => {
    const isAnyModalOpen = !!(showSetupModal || showLoggingModal || showManualModal || showConfirmModal || viewingLog);
    if (isMiniMode && isAnyModalOpen) {
      setWasMiniModeBeforeModal(true);
      setIsMiniMode(false);
    } else if (!isAnyModalOpen && wasMiniModeBeforeModal) {
      setIsMiniMode(true);
      setWasMiniModeBeforeModal(false);
    }
  }, [showSetupModal, showLoggingModal, showManualModal, showConfirmModal, viewingLog, isMiniMode, wasMiniModeBeforeModal]);

  // Zoom configuration
  const ZOOM_STEP = 0.05;
  const MIN_ZOOM = 0.25; // 25%
  const MAX_ZOOM = 3;
  const zoomIn = () => setTimelineZoom(z => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 1000) / 1000));
  const zoomOut = () => setTimelineZoom(z => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 1000) / 1000));

  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [tempWorkMin, setTempWorkMin] = useState('25');
  const [tempRestMin, setTempRestMin] = useState('5');

  // Custom Category Colors State
  const [categoryColors, setCategoryColors] = useState<Record<Category, string>>(() => {
    const saved = localStorage.getItem('emerald-category-colors');
    if (saved) return JSON.parse(saved);
    const defaults: any = {};
    CATEGORIES.forEach(c => defaults[c] = DEFAULT_CATEGORY_DATA[c].color);
    return defaults;
  });

  const getCategoryColor = (cat: Category) => categoryColors[cat] || DEFAULT_CATEGORY_DATA[cat].color;

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('emerald-settings');
    return saved ? JSON.parse(saved) : { workDuration: 25 * 60, restDuration: 5 * 60 };
  });

  const [timeLeft, setTimeLeft] = useState(settings.workDuration);

  const [currentTask, setCurrentTask] = useState({
    category: 'Work' as Category,
    description: '',
    images: [] as string[],
    liveId: null as string | null
  });

  const [manualLog, setManualLog] = useState({
    category: 'Work' as Category,
    description: '',
    date: formatDate(Date.now()),
    startTime: '09:00',
    endTime: '10:00',
    images: [] as string[]
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('emerald-logs');
    const parsed = saved ? JSON.parse(saved) : [];
    const existing = parsed.filter((l: LogEntry) => !l.isLive);
    
    if (existing.length === 0) {
      // Generate full-year Demo Data (every day, 08:00 - 22:00 filled with sessions and short breaks)
      const demoLogs: LogEntry[] = [];
      const now = new Date();
      const categories: Category[] = ['Work', 'Study', 'Read', 'Exercise', 'Rest', 'Eat', 'Entertainment'];
      const demoImages = [
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
        'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
      ];

      const DAYS = 365; // full year

      for (let i = 0; i < DAYS; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);

        let sessionStart = new Date(date);
        sessionStart.setHours(8, 0, 0, 0); // 08:00
        const dayEnd = new Date(date);
        dayEnd.setHours(22, 0, 0, 0); // 22:00

        let j = 0;
        while (sessionStart.getTime() < dayEnd.getTime()) {
          // session length between 25 and 90 minutes
          const durationMinutes = 25 + Math.floor(Math.random() * 66);
          const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60000);
          if (sessionEnd.getTime() > dayEnd.getTime()) {
            // truncate the last session to dayEnd
            sessionEnd.setTime(dayEnd.getTime());
          }

          const category = categories[Math.floor(Math.random() * categories.length)];
          const images = Math.random() > 0.7 ? [demoImages[Math.floor(Math.random() * demoImages.length)]] : [];

          demoLogs.push({
            id: `demo-${i}-${j}`,
            category,
            description: `${category} - Demo session ${j + 1}`,
            startTime: sessionStart.getTime(),
            endTime: sessionEnd.getTime(),
            duration: Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000),
            images
          });

          // small break between 5 and 20 minutes
          const breakMinutes = 5 + Math.floor(Math.random() * 16);
          sessionStart = new Date(sessionEnd.getTime() + breakMinutes * 60000);
          j++;

          // safety cap to avoid infinite loops
          if (j > 30) break;
        }
      }

      return demoLogs;
    }
    return existing;
  });

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('emerald-logs', JSON.stringify(logs));
    } catch (e) {
      console.error("Storage full or error saving logs:", e);
    }
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('emerald-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('emerald-category-colors', JSON.stringify(categoryColors));
  }, [categoryColors]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      saveCurrentSession(true);
      setShowTransitionModal(true);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  useEffect(() => {
    let otInterval: number;
    if (isOvertime) {
      otInterval = window.setInterval(() => setOvertimeSeconds(prev => prev + 1), 1000);
    }
    return () => window.clearInterval(otInterval);
  }, [isOvertime]);

  const handleStart = () => {
    if (!isActive) {
      if (!sessionStartTime) setSessionStartTime(Date.now());
      setIsActive(true);
      setIsPausedBySettings(false);
    } else {
      setIsActive(false);
    }
  };

  const getElapsedSeconds = () => {
    const totalPossible = phase === 'work' ? settings.workDuration : settings.restDuration;
    return (totalPossible - timeLeft) + overtimeSeconds;
  };

  const saveCurrentSession = (isAuto = false) => {
    const duration = getElapsedSeconds();
    if (duration < 60 && !isAuto) return false;
    const finalLog: LogEntry = {
      id: currentTask.liveId || Math.random().toString(36).substr(2, 9),
      category: currentTask.category,
      description: currentTask.description || (phase === 'work' ? 'Focus Session' : 'Rest Break'),
      startTime: sessionStartTime || Date.now() - (duration * 1000),
      endTime: Date.now(),
      duration: duration,
      images: currentTask.images,
      isLive: false
    };
    setLogs(prev => [finalLog, ...prev.filter(l => l.id !== currentTask.liveId)]);
    setCurrentTask({ category: phase === 'work' ? 'Work' : 'Rest', description: '', images: [], liveId: null });
    setSessionStartTime(null);
    return true;
  };

  const forceReset = () => {
    setIsActive(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setTimeLeft(phase === 'work' ? settings.workDuration : settings.restDuration);
    setSessionStartTime(null);
    setShowConfirmModal(null);
    setIsPausedBySettings(false);
    setCurrentTask({ category: phase === 'work' ? 'Work' : 'Rest', description: '', images: [], liveId: null });
  };

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, timeout = 600) => {
    setNoticeMessage(msg);
    window.setTimeout(() => setNoticeMessage(null), timeout);
  };

  const handleStopClick = () => {
    setIsActive(false);
    const elapsed = getElapsedSeconds();
    // If the session is shorter than 1 minute, do not show confirm modal and do not allow saving
    if (elapsed < 60) {
      // Discard session silently but show a brief notice
      confirmAction(false);
      showNotice('Session shorter than 1 minute — not saved');
      return;
    }
    setShowConfirmModal('stop');
  };

  const handleSetupClick = () => {
    setTempWorkMin((settings.workDuration / 60).toString());
    setTempRestMin((settings.restDuration / 60).toString());
    if (isActive) {
      setIsActive(false);
      setIsPausedBySettings(true);
    }
    setShowSetupModal(true);
  };

  const confirmAction = (save: boolean) => {
    if (save) saveCurrentSession();
    forceReset();
  };

  const handleNextPhase = () => {
    const nextPhase = phase === 'work' ? 'rest' : 'work';
    setPhase(nextPhase);
    setTimeLeft(nextPhase === 'work' ? settings.workDuration : settings.restDuration);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setShowTransitionModal(false);
    setSessionStartTime(null);
    setCurrentTask(prev => ({ ...prev, category: nextPhase === 'rest' ? 'Rest' : 'Work', description: '' }));
  };

  const handleApplySettings = () => {
    const w = parseInt(tempWorkMin);
    const r = parseInt(tempRestMin);
    if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
      alert("Please enter valid positive numbers.");
      return;
    }
    const newSettings = { workDuration: w * 60, restDuration: r * 60 };
    setSettings(newSettings);
    setPhase('work');
    setIsActive(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setTimeLeft(newSettings.workDuration); 
    setSessionStartTime(null);
    setShowConfirmModal(null);
    setIsPausedBySettings(false);
    setCurrentTask({ category: 'Work', description: '', images: [], liveId: null });
    setShowSetupModal(false);
  };

  const closeSettingsWithoutSaving = () => {
    setShowSetupModal(false);
    if (isPausedBySettings) setIsActive(true);
  };

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  useEffect(() => {
    if (viewingLog && isEditMode) {
      const s = new Date(viewingLog.startTime);
      setEditStartDate(formatDate(viewingLog.startTime));
      setEditStartTime(`${pad2(s.getHours())}:${pad2(s.getMinutes())}`);

      if (viewingLog.endTime) {
        const e = new Date(viewingLog.endTime);
        setEditEndDate(formatDate(viewingLog.endTime));
        setEditEndTime(`${pad2(e.getHours())}:${pad2(e.getMinutes())}`);
      } else {
        const e = new Date(viewingLog.startTime + 60 * 1000);
        setEditEndDate(formatDate(e.getTime()));
        setEditEndTime(`${pad2(e.getHours())}:${pad2(e.getMinutes())}`);
      }
      setEditTimeError(null);
    }
  }, [viewingLog, isEditMode]);

  // Derived validation flags for edit times
  const editStartTs = new Date(`${editStartDate}T${editStartTime}`).getTime();
  const editEndTs = new Date(`${editEndDate}T${editEndTime}`).getTime();
  const editOrderValid = !isNaN(editStartTs) && !isNaN(editEndTs) && editEndTs > editStartTs;
  const editDurationValid = editOrderValid && (editEndTs - editStartTs) >= 60000;
  const isEditValid = editOrderValid && editDurationValid;

  useEffect(() => {
    // Live-validate edit time fields
    if (!editStartDate || !editStartTime || !editEndDate || !editEndTime) {
      setEditTimeError('Please provide start and end date/time.');
      return;
    }
    const s = new Date(`${editStartDate}T${editStartTime}`).getTime();
    const e = new Date(`${editEndDate}T${editEndTime}`).getTime();
    if (isNaN(s) || isNaN(e)) {
      setEditTimeError('Please provide valid date/time values.');
      return;
    }
    if (e <= s) {
      setEditTimeError('End time must be after start time.');
      return;
    }
    if (e - s < 60000) {
      setEditTimeError('Duration must be at least 1 minute.');
      return;
    }
    setEditTimeError(null);
  }, [editStartDate, editStartTime, editEndDate, editEndTime]);

  const handleSaveEdit = () => {
    if (!viewingLog) return;

    if (!isEditValid) {
      if (!editOrderValid) setEditTimeError('End time must be after start time.');
      else if (!editDurationValid) setEditTimeError('Duration must be at least 1 minute.');
      else setEditTimeError('Please provide valid start and end date/time.');
      return;
    }

    // Apply changes
    const duration = Math.floor((editEndTs - editStartTs) / 1000);
    const updatedLog: LogEntry = {
      ...viewingLog,
      startTime: editStartTs,
      endTime: editEndTs,
      duration,
    };

    setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    setIsEditMode(false);
    setViewingLog(null);
    setEditTimeError(null);
  };

  const getTimelineWidth = (zoom: number) => (((timelineRange.end - timelineRange.start) / 60000) * 1.5 * zoom + 100);

  const handleTimelineWheel = (e: React.WheelEvent) => {
    if (!timelineRef.current) return;
    const el = timelineRef.current;

    // If Shift is held, use wheel for zooming while keeping pointer anchored
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const pointerX = e.clientX - rect.left + el.scrollLeft;
      const proportion = pointerX / getTimelineWidth(timelineZoom);

      const newZoom = (e.deltaY < 0) ? Math.min(MAX_ZOOM, Math.round((timelineZoom + ZOOM_STEP) * 1000) / 1000) : Math.max(MIN_ZOOM, Math.round((timelineZoom - ZOOM_STEP) * 1000) / 1000);
      setTimelineZoom(newZoom);

      // Adjust scrollLeft so the point under cursor stays approximately the same
      const newWidth = getTimelineWidth(newZoom);
      const newScrollLeft = Math.max(0, proportion * newWidth - (e.clientX - rect.left));
      el.scrollLeft = newScrollLeft;
      return;
    }

    // Default behavior: horizontal scroll
    e.preventDefault();
    e.stopPropagation();
    el.scrollLeft += e.deltaY;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'current' | 'manual' | 'edit') => {
    const files = Array.from(e.target.files || []);
    const promises = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    }).then(base64 => compressImage(base64)));

    Promise.all(promises).then(compressedBase64s => {
      if (target === 'current') setCurrentTask(prev => ({ ...prev, images: [...prev.images, ...compressedBase64s] }));
      else if (target === 'manual') setManualLog(prev => ({ ...prev, images: [...prev.images, ...compressedBase64s] }));
      else if (target === 'edit') setViewingLog(prev => prev ? ({ ...prev, images: [...prev.images, ...compressedBase64s] }) : null);
    });
  };

  const saveManualLog = () => {
    const start = new Date(`${manualLog.date}T${manualLog.startTime}`);
    const end = new Date(`${manualLog.date}T${manualLog.endTime}`);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setManualLogError('Please provide valid start and end date/time.');
      return;
    }
    if (duration <= 0) {
      setManualLogError('End time must be after start time.');
      return;
    }
    if (duration < 60) {
      setManualLogError('Duration must be at least 1 minute.');
      return;
    }
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      category: manualLog.category,
      description: manualLog.description || 'Manual Entry',
      startTime: start.getTime(),
      endTime: end.getTime(),
      duration: duration,
      images: manualLog.images,
    };
    setLogs(prev => [newLog, ...prev].sort((a,b) => b.startTime - a.startTime));
    setShowManualModal(false);
    setManualLog({ category: 'Work', description: '', date: formatDate(Date.now()), startTime: '09:00', endTime: '10:00', images: [] });
    setManualLogError(null);
  };

  const exportData = () => {
    const data = JSON.stringify({ logs, settings, categoryColors });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emerald-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.categoryColors) setCategoryColors(parsed.categoryColors);
        alert('Data imported successfully!');
      } catch (err) { alert('Failed to import data. Invalid JSON.'); }
    };
    reader.readAsText(file);
  };

  const statsData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const relevantLogs = statsView === 'day' 
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

    relevantLogs.forEach(log => {
      categoryTotals[log.category] = (categoryTotals[log.category] || 0) + log.duration;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value: Math.round(value / 60) }))
      .sort((a,b) => b.value - a.value);
  }, [logs, selectedStatsDate, statsView]);

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
      if (history[day] !== undefined) history[day] += log.duration;
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
      if (history[d] !== undefined) history[d] += log.duration;
    });
    return Object.entries(history).map(([name, value]) => ({ name: name.split('-')[2], minutes: Math.round(value / 60) }));
  }, [logs, selectedStatsDate]);

  // Fix: Added missing yearHistory implementation to resolve the reference error.
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
        history[logDate.getMonth()] += log.duration;
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
        totals[l.category] = (totals[l.category] || 0) + l.duration;
        if (!sampleImage && l.images && l.images.length > 0) sampleImage = l.images[0];
      });
      const categories = Object.entries(totals).map(([name, value]) => ({ name, minutes: Math.round(value / 60) })).sort((a,b)=>b.minutes-a.minutes);
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
        const totalDuration = dayLogs.reduce((acc, l) => acc + l.duration, 0);
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
        const totalDuration = dayLogs.reduce((acc, l) => acc + l.duration, 0);
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

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesCategory = filterCategory === 'All' || log.category === filterCategory;
      const logDate = formatDate(log.startTime);
      const matchesStart = !filterStartDate || logDate >= filterStartDate;
      const matchesEnd = !filterEndDate || logDate <= filterEndDate;
      return matchesCategory && matchesStart && matchesEnd;
    });
  }, [logs, filterCategory, filterStartDate, filterEndDate]);

  const [manualLogError, setManualLogError] = useState<string | null>(null);

  const isManualLogValid = useMemo(() => {
    const start = new Date(`${manualLog.date}T${manualLog.startTime}`);
    const end = new Date(`${manualLog.date}T${manualLog.endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    const durSec = (end.getTime() - start.getTime()) / 1000;
    return durSec >= 60;
  }, [manualLog]);

  useEffect(() => {
    const start = new Date(`${manualLog.date}T${manualLog.startTime}`);
    const end = new Date(`${manualLog.date}T${manualLog.endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setManualLogError('Please provide valid start and end date/time.');
      return;
    }
    const dur = (end.getTime() - start.getTime()) / 1000;
    if (dur <= 0) {
      setManualLogError('End time must be after start time.');
      return;
    }
    if (dur < 60) {
      setManualLogError('Duration must be at least 1 minute.');
      return;
    }
    setManualLogError(null);
  }, [manualLog]);

  const isCurrentlyRecording = isActive || isOvertime || (timeLeft < settings.workDuration && phase === 'work');
  const selectedDayLogs = useMemo(() => {
    return logs.filter(l => formatDate(l.startTime) === selectedStatsDate).sort((a,b) => a.startTime - b.startTime);
  }, [logs, selectedStatsDate]);

  return (
    <div className={`h-screen w-full ${(isMiniMode || wasMiniModeBeforeModal) ? 'bg-transparent' : 'bg-[#f0f9f0]'} text-emerald-900 flex flex-col items-center overflow-hidden transition-all duration-300 ${(isMiniMode || wasMiniModeBeforeModal) ? '' : 'rounded-3xl border border-emerald-100/50 shadow-2xl'}`}>
      {/* Custom Title Bar for Normal Mode */}
      {!isMiniMode && !wasMiniModeBeforeModal && (
        <div className="w-full h-10 flex items-center justify-between px-4 bg-white/50 backdrop-blur-sm border-b border-emerald-50 flex-shrink-0 select-none" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Clock size={12} />
            </div>
            <span className="text-xs font-bold text-emerald-800 tracking-tight">Emerald Timer</span>
          </div>
          <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button 
              onClick={() => (window as any).electron?.windowControl('minimize')}
              className="p-1.5 hover:bg-emerald-100 rounded-md text-emerald-600 transition-all active:scale-90"
              title="Minimize"
            >
              <Minus size={16} />
            </button>
            <button 
              onClick={() => (window as any).electron?.windowControl('maximize')}
              className="p-1.5 hover:bg-emerald-100 rounded-md text-emerald-800 transition-all active:scale-90"
              title="Maximize"
            >
              <Maximize2 size={16} />
            </button>
            <button 
              onClick={() => (window as any).electron?.windowControl('close')}
              className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md text-emerald-600 transition-all active:scale-90"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {!isMiniMode && !wasMiniModeBeforeModal && (
        <header className="w-full max-w-6xl flex justify-between items-center p-4 md:p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
              <Clock size={24} />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-emerald-800 tracking-tight">Emerald Timer</h1>
              {import.meta.env.DEV && (
                <button onClick={() => { localStorage.removeItem('emerald-logs'); window.location.reload(); }} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all">Seed demo</button>
              )}
            </div>
          </div>
          <button onClick={() => setIsMiniMode(true)} className="p-2.5 bg-white rounded-2xl border border-emerald-100 hover:bg-emerald-50 text-emerald-600 flex items-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95">
            <Minimize2 size={16} /> <span>Mini Mode</span>
          </button>
        </header>
      )}

      {isMiniMode && (
        <div className="w-full h-full bg-white flex flex-col z-40 overflow-hidden select-none rounded-[2rem] border border-emerald-100 shadow-2xl" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex-1 flex items-center px-5" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${phase === 'work' ? 'text-emerald-600' : 'text-emerald-500'}`}>
                    {currentTask.category}
                  </span>
                  <button onClick={() => setIsMiniMode(false)} className="p-1.5 hover:bg-emerald-100 rounded-full text-emerald-800 transition-all duration-300 ease-in-out active:scale-90" title="Maximize">
                    <Maximize2 size={16} />
                  </button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-bold tabular-nums tracking-tighter leading-none">{formatTime(timeLeft)}</span>
                  {isOvertime && <span className="text-[10px] text-orange-500 font-bold">+{formatTime(overtimeSeconds)}</span>}
                </div>
              </div>
              <div className="flex gap-1.5">
                 <button onClick={() => setShowLoggingModal(true)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90"><Edit3 size={16}/></button>
                 {isCurrentlyRecording && (
                   <button onClick={handleStopClick} className="p-2 rounded-xl bg-white text-red-500 border border-red-50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-in-out active:scale-90"><Square size={16}/></button>
                 )}
                 <button onClick={handleStart} className={`p-2 rounded-xl shadow-md transition-all duration-300 ease-in-out active:scale-90 ${isActive ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-emerald-600 text-white shadow-emerald-200'}`}>
                    {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                 </button>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-emerald-50 flex-shrink-0">
            <div className="h-full transition-all duration-1000 bg-emerald-500" style={{ width: `${(timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 100}%` }} />
          </div>
        </div>
      )}

      {!isMiniMode && !wasMiniModeBeforeModal && (
        <main className="w-full max-w-6xl bg-white rounded-t-[3rem] shadow-2xl border border-emerald-50 overflow-hidden flex flex-col flex-1 mx-4">
          <nav className="flex border-b border-emerald-50 bg-emerald-50/20 px-6 flex-shrink-0">
            {[
              { id: 'timer', icon: Play, label: 'Focus' },
              { id: 'stats', icon: BarChart3, label: 'Analytics' },
              { id: 'logs', icon: Clock, label: 'History' },
              { id: 'sync', icon: RefreshCw, label: 'Sync' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-6 flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? 'text-emerald-700' : 'text-emerald-300 hover:text-emerald-500'}`}>
                <tab.icon size={18} /> <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-6 right-6 h-1 bg-emerald-600 rounded-t-full shadow-[0_-4px_10px_rgba(5,150,105,0.3)]" />}
              </button>
            ))}
          </nav>

          <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-thin">
            {activeTab === 'timer' && (
              <div className="flex flex-col items-center justify-center gap-10 py-10 max-w-xl mx-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100/50">
                  <div className={`w-2 h-2 rounded-full ${phase === 'work' ? 'bg-emerald-500' : 'bg-emerald-400'} ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">{isActive ? (phase === 'work' ? 'Focusing' : 'Resting') : 'Idle'}</span>
                </div>

                <div onClick={() => setShowLoggingModal(true)} className="relative group cursor-pointer active:scale-[0.98] transition-all">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
                  <svg className="w-80 h-80 -rotate-90" viewBox="0 0 300 300">
                    <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-50" />
                    <circle cx="150" cy="150" r={135} stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 135} strokeDashoffset={(2 * Math.PI * 135) - ((timeLeft / (phase === 'work' ? settings.workDuration : settings.restDuration)) * 2 * Math.PI * 135)}
                      className="text-emerald-500 transition-all duration-1000 ease-linear"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-5 shadow-2xl border border-emerald-50 overflow-hidden ring-1 ring-emerald-50/50">
                    <div className="absolute inset-0 rounded-full bg-emerald-50/0 group-hover:bg-emerald-50/90 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-[2px] z-20">
                      <Edit3 size={36} className="text-emerald-600 mb-3" />
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Edit Session</span>
                    </div>
                    
                    <span className="text-7xl font-mono font-bold tabular-nums z-10 tracking-tighter">{formatTime(timeLeft)}</span>
                    {isOvertime && <span className="text-orange-500 font-bold text-sm animate-pulse mt-2 font-mono z-10">+{formatTime(overtimeSeconds)}</span>}
                    <div className="mt-5 px-4 py-1.5 bg-emerald-50/50 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] truncate max-w-[180px] z-10">
                      {currentTask.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 h-28">
                  {isCurrentlyRecording && (
                    <button onClick={handleStopClick} className="p-6 rounded-[2.5rem] bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ease-in-out shadow-sm border border-emerald-100 group active:scale-90"><Square size={28} fill="currentColor" className="group-hover:scale-90 transition-transform"/></button>
                  )}
                  <button onClick={handleStart} className={`flex items-center justify-center transition-all duration-300 ease-in-out shadow-2xl active:scale-95 ${isActive ? 'w-32 h-32 rounded-[3.5rem] text-white bg-orange-500 shadow-orange-200' : 'p-6 rounded-[2.5rem] bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}>
                    {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                  </button>
                  <button onClick={handleSetupClick} className="p-6 rounded-[2.5rem] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out border border-emerald-100 active:scale-90"><Settings size={28} /></button>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flex flex-col lg:flex-row gap-10 items-start h-full animate-in fade-in slide-in-from-right-4 duration-500">
                {!isCalendarCollapsed && (
                  <div className="flex-shrink-0 sticky top-0">
                    <MiniCalendar logs={logs} selectedDate={selectedStatsDate} onSelectDate={setSelectedStatsDate} viewType={statsView} />
                  </div>
                )}
                <div className="flex-1 space-y-6 w-full h-full flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between bg-emerald-50/40 p-1.5 rounded-[2rem] flex-shrink-0 border border-emerald-100/50">
                     <div className="flex items-center gap-1.5">
                       <button onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)} className="p-2.5 text-emerald-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                         {isCalendarCollapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
                       </button>
                       {(['day', 'week', 'month', 'year'] as StatsView[]).map(v => (
                         <button key={v} onClick={() => setStatsView(v)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statsView === v ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-500 hover:bg-emerald-100'}`}>{v}</button>
                       ))}
                     </div>
                     <div className="flex items-center gap-3">
                        {(statsView === 'month' || statsView === 'week') && (
                          <div className="bg-white/80 p-1 rounded-2xl flex border border-emerald-100/50 shadow-sm">
                             <button onClick={() => setViewMode('charts')} className={`p-2 rounded-xl transition-all ${viewMode === 'charts' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Charts"><BarChart size={16}/></button>
                             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Life Grid"><LayoutGrid size={16}/></button>
                          </div>
                        )}
                        <div className="text-[10px] font-black text-emerald-800 pr-5 uppercase tracking-widest opacity-60">{selectedStatsDate}</div>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-none pb-20">
                    {statsView === 'day' && (
                      <div className="space-y-8 animate-in zoom-in-95 duration-500">
                         {/* Timeline Section */}
                         <div className="relative bg-white rounded-[3rem] border border-emerald-50 h-[360px] shadow-sm overflow-visible group">
                            {/* Zoom controls */}
                            <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-emerald-50 shadow-sm">
                              <button onClick={zoomOut} title="Zoom out" className={`p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition ${timelineZoom <= MIN_ZOOM ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={timelineZoom <= MIN_ZOOM}><ZoomOut size={16} /></button>
                              <div className="text-[12px] font-mono font-bold">{Math.round(timelineZoom * 100)}%</div>
                              <button onClick={zoomIn} title="Zoom in" className={`p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition ${timelineZoom >= MAX_ZOOM ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={timelineZoom >= MAX_ZOOM}><ZoomIn size={16} /></button>
                            </div>

                            <div ref={timelineRef} onWheel={handleTimelineWheel} onKeyDown={(e) => { if ((e as any).key === '+' || (e as any).key === '=' ) { e.preventDefault(); zoomIn(); } else if ((e as any).key === '-') { e.preventDefault(); zoomOut(); } }} tabIndex={0} title="Shift + Wheel to zoom, +/- to zoom" style={{ touchAction: 'pan-y' }} className="absolute inset-0 overflow-x-auto overscroll-contain scrollbar-thin scrollbar-thumb-emerald-100 focus:outline-none">
                              <div className="h-full relative py-14 px-10" style={{ width: `${getTimelineWidth(timelineZoom)}px` }}>
                                {Array.from({ length: Math.ceil((timelineRange.end - timelineRange.start) / 3600000) + 1 }).map((_, i) => {
                                  const hourDate = new Date(timelineRange.start + i * 3600000);
                                  return (
                                    <div key={i} className="absolute top-0 bottom-0 border-l border-emerald-100/30" style={{ left: `${i * 60 * 1.5 * timelineZoom + 40}px` }}>
                                      <span className="absolute bottom-4 -left-4 text-[10px] font-black text-emerald-200 tracking-tighter">{formatClock(hourDate.getTime(), timelineZoom)}</span>
                                    </div>
                                  );
                                })}
                                <div className="relative z-10 space-y-2 mt-2">
                                  {timelineRange.tracks.map((track, trackIdx) => (
                                    <div key={trackIdx} className="h-6 relative">
                                      {track.map(log => (
                                        <div key={log.id} onClick={() => {setViewingLog(log); setIsEditMode(false);}} className="absolute top-0 bottom-0 rounded-xl cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:z-50 border border-white/30 shadow-sm group/log z-10 overflow-visible" style={{ left: `${((log.startTime - timelineRange.start) / 60000) * 1.5 * timelineZoom + 40}px`, width: `${Math.max((log.duration / 60) * 1.2 * timelineZoom, 6)}px`, backgroundColor: getCategoryColor(log.category) }}>
                                          <div className="absolute hidden group-hover/log:flex flex-col items-center bg-emerald-900 text-white p-2 rounded-[1rem] text-[10px] top-full mt-2 left-1/2 -translate-x-1/2 z-[100] shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95">
                                            <div className="font-black uppercase tracking-widest mb-1">{log.category}</div>
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

                         {/* Restored Day Summary Metrics */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500 delay-150">
                            <div className="md:col-span-1 bg-emerald-600 text-white p-8 rounded-[3rem] shadow-xl shadow-emerald-200 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70 relative z-10">Total Tracked Today</span>
                              <div className="text-4xl font-black mt-3 tracking-tighter relative z-10">
                                {formatTime(selectedDayLogs.reduce((acc, l) => acc + l.duration, 0))}
                              </div>
                              <p className="text-[10px] font-bold mt-4 opacity-50 relative z-10">{selectedDayLogs.length} distinct sessions recorded</p>
                            </div>
                            
                            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                              {statsData.length > 0 ? statsData.map((item, idx) => (
                                <div key={item.name} className="bg-white p-4 rounded-xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${idx * 30}ms` }}>
                                  <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                                        {React.createElement(DEFAULT_CATEGORY_DATA[item.name as Category].icon, { size: 16 })}
                                      </div>
                                      <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest">{item.name}</span>
                                    </div>
                                    <div className="text-sm font-black text-emerald-900">{item.value}m</div>
                                  </div>
                                  <div className="w-full h-2 bg-emerald-50 rounded-full mt-2 overflow-hidden">
                                     <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                                  </div>
                                </div>
                              )) : (
                                <div className="flex-1 flex items-center justify-center bg-emerald-50/50 rounded-xl border border-dashed border-emerald-100 text-[10px] font-black uppercase text-emerald-300 tracking-[0.3em]">
                                  No Category Data
                                </div>
                              )}
                            </div>
                         </div>
                      </div>
                    )}

                    {(statsView === 'month' || statsView === 'week') && viewMode === 'grid' && (
                      <div className="pb-20 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                         {/* Visual Calendar Grid */}
                         <div className="bg-white rounded-[3.5rem] p-8 border border-emerald-50 shadow-sm overflow-hidden ring-1 ring-emerald-50/50">
                           <div className="grid grid-cols-7 gap-4">
                             {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                               <div key={d} className="text-center text-[10px] font-black text-emerald-200 uppercase py-2 tracking-[0.25em]">{d}</div>
                             ))}
                             {calendarGridData.map((item, idx) => {
                               if (item.empty) return <div key={idx} className="aspect-[4/5] opacity-[0.03] bg-emerald-900 rounded-[2rem]" />;
                               
                               const isSelected = selectedStatsDate === item.dateStr;
                               const isToday = formatDate(Date.now()) === item.dateStr;
                               const hasLogs = item.duration > 0;
                               const firstImage = item.images?.[0];

                               return (
                                 <div 
                                   key={idx} 
                                   onClick={() => setSelectedStatsDate(item.dateStr || '')}
                                   className={`aspect-[4/5] rounded-[2.25rem] p-3 flex flex-col justify-between border transition-all cursor-pointer group relative overflow-hidden active:scale-95
                                     ${isSelected ? 'bg-emerald-600 border-emerald-600 shadow-2xl scale-[1.04] z-10' : 
                                       hasLogs ? 'bg-white border-emerald-50 shadow-sm hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5' : 'bg-emerald-50/20 border-transparent'}
                                     ${isToday && !isSelected ? 'ring-2 ring-emerald-400 ring-offset-4' : ''}
                                   `}
                                 >
                                   {/* Day Thumbnail Background */}
                                   {firstImage && !isSelected && (
                                     <div className="absolute inset-0 z-0">
                                        <img src={firstImage} className="w-full h-full object-cover opacity-[0.15] group-hover:opacity-40 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                                     </div>
                                   )}

                                   <div className="flex justify-between items-start relative z-10">
                                     <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${isSelected ? 'text-white bg-emerald-500/50' : isToday ? 'text-emerald-600 underline underline-offset-4 decoration-2' : 'text-emerald-900/40'}`}>
                                       {item.day}
                                     </span>
                                     {hasLogs && (
                                       <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white shadow-[0_0_10px_white]' : 'bg-emerald-400'}`} />
                                     )}
                                   </div>

                                   <div className="flex-1 flex flex-col justify-center items-center relative z-10 pointer-events-none px-1">
                                      {hasLogs && (
                                        <div className="flex flex-col items-center">
                                           <span className={`text-[10px] font-black tracking-tighter ${isSelected ? 'text-white/90' : 'text-emerald-600'}`}>
                                             {item.duration > 60 ? `${Math.floor(item.duration/60)}h ${item.duration%60}m` : `${item.duration}m`}
                                           </span>
                                           <div className={`w-6 h-0.5 mt-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-emerald-100'}`}>
                                              <div className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} style={{width: `${Math.min((item.duration/480)*100, 100)}%`}} />
                                           </div>
                                        </div>
                                      )}
                                   </div>

                                   <div className="flex -space-x-2 mt-auto relative z-10 pointer-events-none justify-center group-hover:space-x-1 transition-all">
                                     {item.images && item.images.slice(0, 3).map((img, imgIdx) => (
                                       <div key={imgIdx} className={`w-6 h-6 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-emerald-900/5 ${isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'} transition-all`}>
                                         <img src={img} className="w-full h-full object-cover" />
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>

                         {/* Life Journal Section below Grid */}
                         {selectedStatsDate && (
                           <div className="space-y-12 pt-4">
                             <div className="flex items-center justify-between border-b border-emerald-50 pb-8">
                               <div className="flex items-center gap-5">
                                 <div className="p-4 bg-emerald-600 text-white rounded-[2.25rem] shadow-xl shadow-emerald-200">
                                   <History size={26}/>
                                 </div>
                                 <div>
                                   <h4 className="text-2xl font-black text-emerald-950 tracking-tight">Life Timeline</h4>
                                   <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-1">{selectedStatsDate}</p>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => setActiveTab('logs')} 
                                 className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                               >
                                 Historical Logs <ExternalLink size={14}/>
                               </button>
                             </div>

                             <div className="space-y-12 pl-8 border-l-4 border-emerald-50/50 ml-10">
                               {selectedDayLogs.map((log, idx) => (
                                 <div key={log.id} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                   {/* Timeline Connector */}
                                   <div className="absolute -left-[45px] top-4 w-7 h-7 rounded-full border-[4px] border-white shadow-lg flex items-center justify-center ring-8 ring-[#f0f9f0]" style={{ backgroundColor: getCategoryColor(log.category) }}>
                                      <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                                   </div>

                                   <div className="bg-white p-8 rounded-[3.5rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all group/card ring-1 ring-emerald-50/50">
                                      <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-5">
                                          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] ring-1 ring-emerald-100/50">
                                            {React.createElement(DEFAULT_CATEGORY_DATA[log.category].icon, {size: 22})}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase text-emerald-300 tracking-[0.15em]">{formatClock(log.startTime)} — {log.endTime ? formatClock(log.endTime) : 'NOW'}</span>
                                            <span className="text-[10px] font-bold text-emerald-500 mt-0.5">{formatTime(log.duration)} duration</span>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-black text-white px-5 py-2 rounded-full shadow-lg uppercase tracking-[0.15em]" style={{ backgroundColor: getCategoryColor(log.category), boxShadow: `0 8px 16px ${getCategoryColor(log.category)}44` }}>
                                          {log.category}
                                        </span>
                                      </div>

                                      <h5 className="text-xl font-bold text-emerald-950 mb-5 leading-snug">{log.description || 'Quick Focus Session'}</h5>
                                      
                                      {log.images.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-thin">
                                          {log.images.map((img, imgIdx) => (
                                            <div key={imgIdx} className="relative flex-shrink-0 group/img first:pl-0">
                                              <img 
                                                src={img} 
                                                onClick={() => setPreviewImage(img)} 
                                                className="h-56 w-56 rounded-[2.75rem] object-cover border-4 border-white shadow-xl cursor-zoom-in group-hover/img:scale-[1.04] transition-all duration-300 ring-1 ring-emerald-900/5" 
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-end gap-3 mt-4 pt-6 border-t border-emerald-50/50">
                                        <button onClick={() => setViewingLog(log)} className="px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                          <Edit2 size={14}/> Manage
                                        </button>
                                      </div>
                                   </div>
                                 </div>
                               ))}

                               {selectedDayLogs.length === 0 && (
                                 <div className="py-28 flex flex-col items-center justify-center gap-8 text-emerald-200 animate-in fade-in slide-in-from-bottom-8">
                                   <div className="p-12 rounded-[4rem] border-4 border-dashed border-emerald-50/50 bg-emerald-50/20">
                                     <History size={72} className="opacity-40" />
                                   </div>
                                   <p className="text-base font-black uppercase tracking-[0.5em] opacity-40">Quiet Day — No Logs Found</p>
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                      </div>
                    )}

                    {statsView === 'year' ? (
                      <div className="pb-20 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-emerald-50 overflow-hidden">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {yearMonthStats.map((m, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-[1.25rem] border border-emerald-50 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-black">{new Date(new Date(selectedStatsDate).getFullYear(), m.month).toLocaleString(undefined, { month: 'short' })}</div>
                                  <div className="text-xs text-emerald-400">{m.totalMinutes}m</div>
                                </div>
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="flex-1 space-y-1">
                                    {m.categories.slice(0,4).map(cat => (
                                      <div key={cat.name} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat.name as Category) }} />
                                        <div className="text-[11px] font-black truncate">{cat.name}</div>
                                        <div className="ml-auto text-xs text-emerald-400">{cat.minutes}m</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="w-20 h-14 bg-emerald-50 rounded-lg overflow-hidden border border-emerald-100 flex items-center justify-center">
                                    {m.sampleImage ? <img src={m.sampleImage} className="w-full h-full object-cover"/> : <div className="text-[10px] text-emerald-300">No Image</div>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 animate-in zoom-in-95 duration-500">
                         <div className="bg-white p-8 rounded-[3.5rem] border border-emerald-50 h-[400px] shadow-sm flex flex-col relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-emerald-50 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-700"/>
                           <h3 className="text-[11px] font-black mb-8 text-emerald-800 uppercase tracking-[0.3em] relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown</h3>
                           {statsData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie data={statsData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                                   {statsData.map(entry => <Cell key={entry.name} fill={getCategoryColor(entry.name as Category)} />)}
                                 </Pie>
                                 <RechartsTooltip contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)', padding:'12px 20px', fontWeight: 'bold'}} />
                                 <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '20px'}} />
                               </PieChart>
                             </ResponsiveContainer>
                           ) : <div className="h-full flex items-center justify-center text-emerald-200 uppercase font-black tracking-[0.3em]">No Activity</div>}
                         </div>
                         <div className="bg-white p-8 rounded-[3.5rem] border border-emerald-50 h-[400px] shadow-sm flex flex-col relative overflow-hidden group">
                           <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-emerald-50 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-700"/>
                           <h3 className="text-[11px] font-black mb-8 text-emerald-800 uppercase tracking-[0.3em] relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Time Spent (Min)</h3>
                           <ResponsiveContainer width="100%" height="100%">
                             <ReBarChart data={statsView === 'week' ? weekHistory : statsView === 'month' ? monthHistory : yearHistory}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                               <YAxis fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                               <RechartsTooltip cursor={{fill: '#f8fafc', radius: 12}} contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                               <Bar dataKey="minutes" fill="#10b981" radius={[10, 10, 10, 10]} barSize={24} />
                             </ReBarChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-8 max-w-4xl mx-auto pb-10">
                <div className="flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10 py-6 border-b border-emerald-50 px-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900 flex items-center gap-3"><Clock size={20} className="text-emerald-500" /> History Logs</h3>
                  <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"><Plus size={16} /> Add Entry</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredLogs.map((log) => (
                    <div key={log.id} onClick={() => { setViewingLog(log); setIsEditMode(false); }} className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-5 cursor-pointer relative overflow-hidden" style={{ borderLeft: `8px solid ${getCategoryColor(log.category)}` }}>
                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600">{React.createElement(DEFAULT_CATEGORY_DATA[log.category].icon, {size: 24})}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-emerald-900 truncate tracking-tight">{log.description || 'Session'}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold">{formatDate(log.startTime)} • {formatTime(log.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
               <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto pb-20">
                <div className="w-24 h-24 bg-emerald-50 rounded-[3rem] flex items-center justify-center text-emerald-600 mb-8 shadow-xl shadow-emerald-50"><Share2 size={44} /></div>
                <h2 className="text-3xl font-black text-emerald-900 mb-3 tracking-tight">Portable Library</h2>
                <div className="w-full space-y-5">
                  <button onClick={exportData} className="group flex items-center justify-between w-full p-6 bg-white border border-emerald-100 rounded-[2.5rem] hover:bg-emerald-50 shadow-sm transition-all hover:shadow-lg">
                    <div className="flex items-center gap-5 text-left"><div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-[1.5rem]"><Download size={24} /></div><div className="font-black text-emerald-900 uppercase text-xs tracking-widest">Backup Cloud</div></div>
                    <ChevronRight size={20} className="text-emerald-200" />
                  </button>
                  <label className="group flex items-center justify-between w-full p-6 bg-white border border-emerald-100 rounded-[2.5rem] hover:bg-emerald-50 shadow-sm cursor-pointer transition-all hover:shadow-lg">
                    <div className="flex items-center gap-5 text-left"><div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-[1.5rem]"><Upload size={24} /></div><div className="font-black text-emerald-900 uppercase text-xs tracking-widest">Restore Data</div></div>
                    <ChevronRight size={20} className="text-emerald-200" />
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* --- Modals --- */}
      {viewingLog && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[150] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={() => { setViewingLog(null); setIsEditMode(false); }} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 z-50 transition-all active:scale-90" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               {!isEditMode ? (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner">{React.createElement(DEFAULT_CATEGORY_DATA[viewingLog.category].icon, { size: 32 })}</div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black text-emerald-950 leading-tight pr-6 tracking-tight mb-1">{viewingLog.description || 'Focus Session'}</h2>
                        <span className="text-[9px] font-black text-white uppercase px-3 py-1 rounded-full shadow-md" style={{ backgroundColor: getCategoryColor(viewingLog.category) }}>{viewingLog.category}</span>
                      </div>
                   </div>

                   {viewingLog.images.length > 0 && (
                     <div className="mb-8">
                       <label className="text-[9px] font-black text-emerald-300 uppercase block mb-4 tracking-[0.2em]">Captured Moments</label>
                       <div className="grid grid-cols-2 gap-4">
                         {viewingLog.images.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md group">
                             <img src={img} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setPreviewImage(img)} />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   <button onClick={() => setIsEditMode(true)} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><Edit2 size={18} /> Update Entry</button>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-black text-emerald-950 tracking-tight">Edit Session Details</h2>
                    <div className="space-y-4">
                      <select value={viewingLog.category} onChange={(e) => setViewingLog({...viewingLog, category: e.target.value as any})} className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <textarea rows={2} value={viewingLog.description} onChange={(e) => setViewingLog({...viewingLog, description: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-4 text-sm outline-none resize-none shadow-sm" />
                      
                      <div>
                        <label className="text-[9px] font-black uppercase text-emerald-300 block mb-3 tracking-[0.2em]">Images ({viewingLog.images.length})</label>
                        <div className="flex flex-wrap gap-2">
                          {viewingLog.images.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border-2 border-white group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={() => setViewingLog({...viewingLog, images: viewingLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                            </div>
                          ))}
                          <label className="w-16 h-16 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 text-emerald-400">
                            <Plus size={20} />
                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} />
                          </label>
                        </div>
                      </div>

                      {/* Start/End Time Editing */}
                      <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-[9px] font-black uppercase text-emerald-400 block mb-1.5">Start</label>
                            <div className="flex gap-1.5">
                              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-xl p-1.5 text-xs" />
                              <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-xl p-1.5 text-xs" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] font-black uppercase text-emerald-400 block mb-1.5">End</label>
                            <div className="flex gap-1.5">
                              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-xl p-1.5 text-xs" />
                              <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-xl p-1.5 text-xs" />
                            </div>
                          </div>
                        </div>
                        {editTimeError && <div className="mt-2 text-[10px] text-red-500 font-black">{editTimeError}</div>}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button id="applyEditBtn" disabled={!isEditValid} onClick={handleSaveEdit} className={`flex-1 py-4 rounded-[1.2rem] font-black uppercase tracking-widest shadow-md ${isEditValid ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Apply</button>
                        <button onClick={() => setIsEditMode(false)} className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-[1.2rem] font-black uppercase tracking-widest">Cancel</button>
                      </div>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {showManualModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[160] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] scrollbar-none ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={() => setShowManualModal(false)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-2xl font-black text-emerald-950 mb-8 tracking-tight">Manual Log</h2>
               <div className="space-y-5">
                  <select value={manualLog.category} onChange={(e) => setManualLog({...manualLog, category: e.target.value as any})} className="w-full bg-emerald-50 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="date" value={manualLog.date} onChange={(e) => setManualLog({...manualLog, date: e.target.value})} className="w-full bg-emerald-50 border-none rounded-xl p-3 text-[10px] font-black" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase text-emerald-400 block mb-1.5 tracking-[0.2em]">Start Time</label>
                      <input type="time" value={manualLog.startTime} onChange={(e) => setManualLog({...manualLog, startTime: e.target.value})} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-emerald-400 block mb-1.5 tracking-[0.2em]">End Time</label>
                      <input type="time" value={manualLog.endTime} onChange={(e) => setManualLog({...manualLog, endTime: e.target.value})} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-xs" />
                    </div>
                  </div>

                  <textarea rows={2} placeholder="Notes..." value={manualLog.description} onChange={(e) => setManualLog({...manualLog, description: e.target.value})} className="w-full bg-emerald-50 border-none rounded-[1.5rem] p-4 text-xs" />
                  
                  <div>
                    <label className="text-[9px] font-black uppercase text-emerald-300 block mb-3 tracking-[0.2em]">Upload Images ({manualLog.images.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {manualLog.images.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm"><img src={img} className="w-full h-full object-cover" /><button onClick={() => setManualLog({...manualLog, images: manualLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"><X size={10} /></button></div>
                      ))}
                      <label className="w-14 h-14 flex items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors">
                        <Plus size={18} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'manual')} />
                      </label>
                    </div>
                  </div>

                  {manualLogError && <div className="mb-3 text-[10px] font-black text-red-500">{manualLogError}</div>}
                  <button disabled={!isManualLogValid} onClick={saveManualLog} className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl ${isManualLogValid ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Save Entry</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {showLoggingModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={() => setShowLoggingModal(false)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 z-50 transition-all active:scale-90" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-2xl font-black text-emerald-950 mb-8 tracking-tight">Focus Reflection</h2>
               <div className="space-y-5">
                  <select value={currentTask.category} onChange={(e) => setCurrentTask({...currentTask, category: e.target.value as any})} className="w-full bg-emerald-50 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea rows={3} placeholder="Reflect on this session..." value={currentTask.description} onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})} className="w-full bg-emerald-50 border-none rounded-[1.5rem] p-5 text-sm" />
                  
                  <div>
                    <label className="text-[9px] font-black uppercase text-emerald-300 block mb-4 tracking-[0.3em] pl-2">Session Photos ({currentTask.images.length})</label>
                    <div className="flex flex-wrap gap-3">
                      {currentTask.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-[1.2rem] overflow-hidden border-2 border-white shadow-md group"><img src={img} className="w-full h-full object-cover" /><button onClick={() => setCurrentTask({...currentTask, images: currentTask.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button></div>
                      ))}
                      <label className="w-16 h-16 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[1.2rem] cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                        <Plus size={24} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                      </label>
                    </div>
                  </div>

                  <button onClick={() => setShowLoggingModal(false)} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-100 mt-4 active:scale-95 transition-all">Update and Continue</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {showSetupModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={closeSettingsWithoutSaving} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-2xl font-black text-emerald-950 mb-6 tracking-tight flex items-center gap-3"><Settings size={24} className="text-emerald-500" /> Preferences</h2>
               <div className="space-y-6">
                  <section>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Clock size={14}/> Timer Intervals</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/30 p-4 rounded-[1.5rem] border border-emerald-50">
                          <label className="text-[8px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Focus (Min)</label>
                          <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-sm font-black text-emerald-900 outline-none" />
                        </div>
                        <div className="bg-emerald-50/30 p-4 rounded-[1.5rem] border border-emerald-50">
                          <label className="text-[8px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Rest (Min)</label>
                          <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-sm font-black text-emerald-900 outline-none" />
                        </div>
                     </div>
                  </section>
                  <section>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Palette size={14}/> Theme & Tag Colors</h3>
                     <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                        <div className="grid grid-cols-2 gap-3">
                           {CATEGORIES.map(cat => (
                             <div key={cat} className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-emerald-50 group">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg text-emerald-600 transition-colors" style={{ backgroundColor: `${categoryColors[cat]}15` }}>
                                    {React.createElement(DEFAULT_CATEGORY_DATA[cat].icon, {size: 14})}
                                  </div>
                                  <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">{cat}</span>
                                </div>
                                <input 
                                  type="color" 
                                  value={categoryColors[cat]} 
                                  onChange={(e) => setCategoryColors(prev => ({ ...prev, [cat]: e.target.value }))}
                                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none appearance-none overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg"
                                />
                             </div>
                           ))}
                        </div>
                     </div>
                  </section>
                  <button onClick={handleApplySettings} className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-95 transition-all text-xs">Save All Preferences</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
            <div style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 text-red-500 shadow-inner`}><AlertCircle size={40} /></div>
              <h2 className="text-2xl font-black mb-3 text-emerald-950 tracking-tight">End Session?</h2>
              <div className="flex flex-col gap-3">
                <button disabled={getElapsedSeconds() < 60} onClick={() => confirmAction(true)} className="w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-lg bg-emerald-600 text-white active:scale-95">Save Activity</button>
                <button onClick={() => confirmAction(false)} className="w-full py-4 bg-white text-red-500 border-2 border-red-50 rounded-[1.5rem] font-black uppercase tracking-[0.2em] active:scale-95">Discard</button>
                <button onClick={() => setShowConfirmModal(null)} className="py-3 text-emerald-300 font-black text-[9px] uppercase tracking-[0.4em] mt-1">Go Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-xl" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={32}/></button>
          <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10" />
        </div>
      )}

      {noticeMessage && (
        <div className={`fixed ${isMiniMode ? 'bottom-4 scale-90' : 'bottom-8'} left-1/2 -translate-x-1/2 z-[320] bg-emerald-900 text-white px-5 py-2.5 rounded-full shadow-lg text-[11px] font-black uppercase tracking-widest animate-in fade-in duration-200 whitespace-nowrap`}>
          {noticeMessage}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<EmeraldTimer />);
