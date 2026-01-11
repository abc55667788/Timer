
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Play, Pause, RotateCcw, BarChart3, Clock, Settings, 
  X, Maximize2, Minimize2, ChevronRight, Image as ImageIcon,
  BookOpen, Briefcase, GraduationCap, Dumbbell, Coffee, Utensils, Tv, Save,
  RefreshCw, Download, Upload, Timer as TimerIcon, Trash2, CheckCircle2, 
  AlertCircle, Square, Edit3, FileText, Calendar as CalendarIcon, Plus, Share2, Filter as FilterIcon, Edit2, Search,
  ChevronLeft, ZoomIn, ZoomOut, PanelLeftClose, PanelLeftOpen, ChevronDown, LayoutGrid, BarChart, ExternalLink,
  History, Palette, Minus, Target, Quote, Check, Link, Globe, Cloud, Key, Database
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip
} from 'recharts';
import {
  Category,
  LogEntry,
  TimerPhase,
  PhasePromptKind,
  StatsView,
  ViewMode,
  NotificationStatus,
  DEFAULT_CATEGORY_DATA,
  CATEGORIES,
  APP_LOGO,
} from './src/types';
import { formatTime, formatClock, formatDate, formatDisplayDate, formatDisplayDateString, resolvePhaseTotals, pad2 } from './src/utils/time';
import { compressImage } from './src/utils/media';
import MiniCalendar from './src/components/MiniCalendar';

// --- Main App Component ---
function EmeraldTimer() {
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'logs' | 'journal'>('timer');
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [isActive, setIsActive] = useState(false);
  const [isPausedBySettings, setIsPausedBySettings] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const sessionPhaseDurationsRef = useRef<{ work: number; rest: number }>({ work: 0, rest: 0 });
  const phaseRef = useRef<TimerPhase>(phase);
  const resetSessionPhaseDurations = () => { sessionPhaseDurationsRef.current = { work: 0, rest: 0 }; };
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showLoggingModal, setShowLoggingModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<null | 'stop' | 'setup'>(null);
  const [showLogContinuationPrompt, setShowLogContinuationPrompt] = useState(false);
  const [pendingNextPhase, setPendingNextPhase] = useState<TimerPhase | null>(null);
  const [pendingPromptBackup, setPendingPromptBackup] = useState<{ phase: TimerPhase; kind: PhasePromptKind } | null>(null);
  
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
  const [dayViewMode, setDayViewMode] = useState<'timeline' | 'stats'>('timeline');
  const [timelineZoom, setTimelineZoom] = useState(0.4); 
  const [isZoomInputActive, setIsZoomInputActive] = useState(false);
  const [wasMiniModeBeforeModal, setWasMiniModeBeforeModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationStatus>(() => {
    if (typeof window === 'undefined') return 'default';
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [hasShownPreview, setHasShownPreview] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('emerald-notify-preview-shown') === '1';
    } catch (err) {
      console.warn('Unable to read notification preview flag', err);
      return false;
    }
  });
  const requestNotificationPermission = useCallback((showPreview = false) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    const currentLevel = Notification.permission;
    setNotificationPermission(currentLevel);

    if (currentLevel === 'denied') {
      showNotice('Notifications are blocked. Please enable them in your system settings.');
      return;
    }

    if (currentLevel === 'granted') {
      if (showPreview) {
        try {
          new Notification('Emerald Timer', { 
            body: 'Notifications are enabled!',
            icon: APP_LOGO
          });
        } catch (err) {
          console.warn('Unable to display preview notification', err);
        }
      }
      return;
    }

    // Modern browsers use Promise, older ones use Callback
    const handlePermission = (permission: NotificationPermission) => {
      setNotificationPermission(permission);
      if (permission === 'granted' && showPreview) {
        try {
          new Notification('Emerald Timer', { 
            body: 'Notifications enabled!',
            icon: APP_LOGO 
          });
        } catch (err) {
          console.warn('Unable to show notification', err);
        }
      }
    };

    try {
      const promise = Notification.requestPermission();
      if (promise) {
        promise.then(handlePermission);
      } else {
        // Fallback for callback-based requestPermission
        (Notification as any).requestPermission(handlePermission);
      }
    } catch (e) {
      // Direct call for older styles
      (Notification as any).requestPermission(handlePermission);
    }
  }, [hasShownPreview]);

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
    return existing;
  });

  const [goals, setGoals] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('emerald-goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [inspirations, setInspirations] = useState<{ id: string; title: string; content: string; url?: string; date: number }[]>(() => {
    const saved = localStorage.getItem('emerald-inspirations');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedInspiration, setSelectedInspiration] = useState<{ id: string; title: string; content: string; url?: string; date: number } | null>(null);
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newInspiration, setNewInspiration] = useState({ title: '', content: '', url: '' });

  const [gitlabConfig, setGitlabConfig] = useState(() => {
    const saved = localStorage.getItem('emerald-gitlab-config');
    return saved ? JSON.parse(saved) : { token: '', projectId: '', branch: 'main', filename: 'emerald-timer-data.json', url: 'https://gitlab.com' };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => localStorage.getItem('emerald-last-synced') || '');

  const [phasePrompt, setPhasePrompt] = useState<{ phase: TimerPhase; kind: PhasePromptKind } | null>(null);
  const REMINDER_INTERVAL = 10 * 60;
  const [nextReminderAt, setNextReminderAt] = useState(REMINDER_INTERVAL);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [pendingSettingsChange, setPendingSettingsChange] = useState<{ workDuration: number; restDuration: number } | null>(null);

  const timerRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [isTimelineDragging, setIsTimelineDragging] = useState(false);
  const [timelineDragMoved, setTimelineDragMoved] = useState(false);
  const [timelineStartX, setTimelineStartX] = useState(0);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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
    localStorage.setItem('emerald-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('emerald-inspirations', JSON.stringify(inspirations));
  }, [inspirations]);

  useEffect(() => {
    localStorage.setItem('emerald-gitlab-config', JSON.stringify(gitlabConfig));
  }, [gitlabConfig]);

  useEffect(() => {
    const handleGlobalScroll = (e: Event) => {
      let target = e.target as any;
      if (target === document) target = document.documentElement;
      
      if (target && target.classList) {
        target.classList.add('is-scrolling');
        const timeoutId = target._scrollTimeout;
        if (timeoutId) clearTimeout(timeoutId);
        target._scrollTimeout = setTimeout(() => {
          if (target && target.classList) {
            target.classList.remove('is-scrolling');
          }
        }, 1500);
      }
    };
    window.addEventListener('scroll', handleGlobalScroll, true);
    return () => window.removeEventListener('scroll', handleGlobalScroll, true);
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        sessionPhaseDurationsRef.current[phaseRef.current] += 1;
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (!isOvertime && timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsOvertime(false);
      setOvertimeSeconds(0);
      setNextReminderAt(REMINDER_INTERVAL);
      const kind: PhasePromptKind = phase === 'rest' ? 'cycle-complete' : 'phase-end';
      const title = phase === 'work' ? 'Work session finished' : 'Rest session finished';
      const body = phase === 'work'
        ? 'Work block complete — start your break or keep going.'
        : 'Rest block complete — time to begin the next focus session.';
      triggerSystemNotification(title, body);
      setPhasePrompt({ phase, kind });
    }
    return () => { if (interval) window.clearInterval(interval); };
  }, [isActive, timeLeft, phase, isOvertime]);

  useEffect(() => {
    let otInterval: number | null = null;
    if (isOvertime && isActive) {
      otInterval = window.setInterval(() => {
        sessionPhaseDurationsRef.current[phaseRef.current] += 1;
        setOvertimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => { if (otInterval) window.clearInterval(otInterval); };
  }, [isOvertime, isActive]);

  useEffect(() => {
    if (isOvertime && overtimeSeconds >= nextReminderAt && !phasePrompt) {
      setPhasePrompt({ phase, kind: 'reminder' });
      setNextReminderAt(prev => prev + REMINDER_INTERVAL);
    }
  }, [isOvertime, overtimeSeconds, phasePrompt, phase, nextReminderAt]);

  const isCycleCompletePrompt = phasePrompt?.kind === 'cycle-complete';

  const playBeep = () => {
    if (typeof window === 'undefined') return;
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    try {
      const ctx = new AudioCtor();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = 880;
      oscillator.type = 'triangle';
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    } catch (err) {
      console.warn('Unable to play notification beep', err);
    }
  };

  function triggerSystemNotification(title: string, body: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const show = () => {
      try {
        new Notification(title, { 
          body,
          icon: APP_LOGO 
        });
        playBeep();
      } catch (err) {
        console.warn('Unable to display notification', err);
      }
    };

    const currentPermission = Notification.permission;
    if (currentPermission === 'granted') {
      show();
      return;
    }

    if (currentPermission === 'denied') {
      console.warn('Desktop notifications blocked by the user');
      setNotificationPermission('denied');
      return;
    }

    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        show();
      }
    }).catch(err => {
      console.warn('Notification permission request failed', err);
    });
  }

  useEffect(() => {
    if (!phasePrompt || phasePrompt.kind !== 'reminder') return;
    const title = phasePrompt.phase === 'work' ? 'Work session reminder' : 'Rest session reminder';
    const body = 'Ten minutes have passed in overtime — continue, switch phases, or wrap up.';
    triggerSystemNotification(title, body);
  }, [phasePrompt]);

  const handleStart = () => {
    if (!isActive) {
      if (!sessionStartTime) {
        resetSessionPhaseDurations();
        setSessionStartTime(Date.now());
      }
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

  const saveCurrentSession = (isAuto = false, upcomingPhase?: TimerPhase) => {
    const duration = getElapsedSeconds();
    if (duration < 60 && !isAuto) return false;
    const phaseDurations = { ...sessionPhaseDurationsRef.current };
    const finalLog: LogEntry = {
      id: currentTask.liveId || Math.random().toString(36).substr(2, 9),
      category: currentTask.category,
      description: currentTask.description || (phase === 'work' ? 'Focus Session' : 'Rest Break'),
      startTime: sessionStartTime || Date.now() - (duration * 1000),
      endTime: Date.now(),
      duration: duration,
      images: currentTask.images,
      isLive: false,
      phaseDurations
    };
    setLogs(prev => [finalLog, ...prev.filter(l => l.id !== currentTask.liveId)]);
    const targetPhase = upcomingPhase ?? phase;
    setCurrentTask({ category: targetPhase === 'work' ? 'Work' : 'Rest', description: '', images: [], liveId: null });
    setSessionStartTime(null);
    resetSessionPhaseDurations();
    return true;
  };

  const forceReset = () => {
    setPhase('work');
    setPhasePrompt(null);
    setShowLogContinuationPrompt(false);
    setPendingNextPhase(null);
    setPendingPromptBackup(null);
    setIsActive(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setNextReminderAt(REMINDER_INTERVAL);
    setTimeLeft(settings.workDuration);
    setSessionStartTime(null);
    setShowConfirmModal(null);
    setIsPausedBySettings(false);
    setCurrentTask({ category: 'Work', description: '', images: [], liveId: null });
    resetSessionPhaseDurations();
  };

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, timeout = 600) => {
    setNoticeMessage(msg);
    window.setTimeout(() => setNoticeMessage(null), timeout);
  };

  const basePhaseDuration = phase === 'work' ? settings.workDuration : settings.restDuration;
  const displayTime = timeLeft > 0 ? timeLeft : basePhaseDuration + overtimeSeconds;
  const isCurrentlyRecording = isActive || isOvertime || (timeLeft < basePhaseDuration);

  const handleStopClick = () => {
    setIsActive(false);
    setShowConfirmModal('stop');
  };

  const handleViewLog = (log: LogEntry) => {
    if (timelineDragMoved) return;
    setViewingLog(log);
    setIsEditMode(false);
    setPhaseEditTouched(false);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    setViewingLog(null);
    setIsEditMode(false);
    setPhaseEditTouched(false);
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
    if (save) {
      const workSeconds = sessionPhaseDurationsRef.current.work;
      if (workSeconds < 60) {
        showNotice('Work phase must reach 1 minute to save.');
        return;
      }
      saveCurrentSession(true, 'work');
    }
    forceReset();
  };

  const transitionToPhase = (targetPhase: TimerPhase, autoStart = true) => {
    setPhase(targetPhase);
    setTimeLeft(targetPhase === 'work' ? settings.workDuration : settings.restDuration);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setNextReminderAt(REMINDER_INTERVAL);
    setPhasePrompt(null);
    if (autoStart) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleContinuePhase = () => {
    setPhasePrompt(null);
    if (!isOvertime) {
      setIsOvertime(true);
      setOvertimeSeconds(0);
      setNextReminderAt(REMINDER_INTERVAL);
      showNotice(`Continuing ${phase === 'work' ? 'focus' : 'rest'} — first overtime reminder in 10 minutes.`);
    } else {
      setNextReminderAt(overtimeSeconds + REMINDER_INTERVAL);
      showNotice(`Continuing ${phase === 'work' ? 'focus' : 'rest'} — next reminder in 10 minutes.`);
    }
    setIsActive(true);
  };

  const handleNextPhaseFromPrompt = () => {
    if (!phasePrompt) return;
    const targetPhase = phasePrompt.phase === 'work' ? 'rest' : 'work';
    if (!isCurrentlyRecording) {
      setPhasePrompt(null);
      transitionToPhase(targetPhase);
      return;
    }
    setPendingPromptBackup(phasePrompt);
    setPendingNextPhase(targetPhase);
    setPhasePrompt(null);
    setShowLogContinuationPrompt(true);
  };

  const handleSkipToNextPhase = () => {
    const targetPhase = phase === 'work' ? 'rest' : 'work';
    if (!isCurrentlyRecording) {
      transitionToPhase(targetPhase);
      return;
    }
    setPendingPromptBackup(null);
    setPendingNextPhase(targetPhase);
    setShowLogContinuationPrompt(true);
  };

  const handleExitAndSave = () => {
    setPhasePrompt(null);
    setShowLogContinuationPrompt(false);
    setPendingNextPhase(null);
    setPendingPromptBackup(null);
    const saved = saveCurrentSession(true, 'work');
    if (!saved) {
      showNotice('Session shorter than 1 minute — not saved');
    }
    setPhase('work');
    setTimeLeft(settings.workDuration);
    setIsActive(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    setNextReminderAt(REMINDER_INTERVAL);
  };

  const handleContinueCurrentLog = () => {
    if (!pendingNextPhase) {
      setShowLogContinuationPrompt(false);
      return;
    }
    const label = pendingNextPhase === 'work' ? 'work block' : 'rest break';
    setShowLogContinuationPrompt(false);
    transitionToPhase(pendingNextPhase);
    setPendingNextPhase(null);
    setPendingPromptBackup(null);
    showNotice(`Continuing current log into the next ${label}.`);
  };

  const handleStartNewLog = () => {
    if (!pendingNextPhase) {
      setShowLogContinuationPrompt(false);
      return;
    }
    const label = pendingNextPhase === 'work' ? 'work block' : 'rest break';
    setShowLogContinuationPrompt(false);
    const saved = saveCurrentSession(true, pendingNextPhase);
    if (!saved) {
      showNotice('Session shorter than 1 minute — not saved');
      return;
    }
    transitionToPhase(pendingNextPhase);
    setPendingNextPhase(null);
    setPendingPromptBackup(null);
    showNotice(`Log saved — starting a fresh ${label}.`);
  };

  const handleCancelLogChoice = () => {
    setShowLogContinuationPrompt(false);
    if (pendingPromptBackup) {
      setPhasePrompt(pendingPromptBackup);
    }
    setPendingNextPhase(null);
    setPendingPromptBackup(null);
  };

  const applySettingsChange = (newSettings: { workDuration: number; restDuration: number }) => {
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
    setTempWorkMin((newSettings.workDuration / 60).toString());
    setTempRestMin((newSettings.restDuration / 60).toString());
    setPendingSettingsChange(null);
    resetSessionPhaseDurations();
  };

  const handleApplySettings = () => {
    const w = parseInt(tempWorkMin, 10);
    const r = parseInt(tempRestMin, 10);
    if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
      showNotice('Please enter valid positive numbers.');
      return;
    }
    if (w < 1 || r < 1) {
      showNotice('Intervals must be at least one minute.');
      return;
    }
    const newSettings = { workDuration: w * 60, restDuration: r * 60 };
    if (isCurrentlyRecording) {
      setPendingSettingsChange(newSettings);
      return;
    }
    applySettingsChange(newSettings);
  };

  const handleSettingsSaveDecision = (shouldSave: boolean) => {
    if (shouldSave && pendingSettingsChange) {
      applySettingsChange(pendingSettingsChange);
      return;
    }
    setPendingSettingsChange(null);
    setTempWorkMin((settings.workDuration / 60).toString());
    setTempRestMin((settings.restDuration / 60).toString());
  };

  const closeSettingsWithoutSaving = () => {
    setShowSetupModal(false);
    if (isPausedBySettings) setIsActive(true);
  };

  const [phaseEditTouched, setPhaseEditTouched] = useState(false);
  const [phaseDurationsEdit, setPhaseDurationsEdit] = useState<{ work: number; rest: number }>({ work: 0, rest: 0 });
  const [editWorkMinutes, setEditWorkMinutes] = useState('0');
  const [editRestMinutes, setEditRestMinutes] = useState('0');
  const [activePhaseField, setActivePhaseField] = useState<{ phase: TimerPhase; unit: 'minutes' | 'seconds' } | null>(null);
  const [phaseFieldDraft, setPhaseFieldDraft] = useState('');
  const phaseFieldInputRef = useRef<HTMLInputElement | null>(null);

  const formatMinutesInput = (seconds: number) => {
    const minutes = seconds / 60;
    if (Number.isInteger(minutes)) return minutes.toString();
    return minutes.toFixed(1).replace(/\.0$/, '');
  };

  const sanitizeMinutesValue = (value: string) => value.replace(/[^0-9.]/g, '');

  const handleWorkMinutesChange = (value: string) => {
    const sanitized = sanitizeMinutesValue(value);
    setEditWorkMinutes(sanitized);
    const parsed = parseFloat(sanitized);
    const seconds = isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed * 60));
    setPhaseDurationsEdit(prev => {
      const updated = { ...prev, work: seconds };
      updateEndTimeFromPhaseDurations(updated);
      return updated;
    });
    setPhaseEditTouched(true);
  };

  const handleRestMinutesChange = (value: string) => {
    const sanitized = sanitizeMinutesValue(value);
    setEditRestMinutes(sanitized);
    const parsed = parseFloat(sanitized);
    const seconds = isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed * 60));
    setPhaseDurationsEdit(prev => {
      const updated = { ...prev, rest: seconds };
      updateEndTimeFromPhaseDurations(updated);
      return updated;
    });
    setPhaseEditTouched(true);
  };

  const updateEndTimeFromPhaseDurations = (durations = phaseDurationsEdit) => {
    if (!editStartDate || !editStartTime) return;
    const startMs = new Date(`${editStartDate}T${editStartTime}`).getTime();
    if (isNaN(startMs)) return;
    const totalSeconds = durations.work + durations.rest;
    const endDate = new Date(startMs + totalSeconds * 1000);
    setEditEndDate(formatDate(endDate.getTime()));
    setEditEndTime(`${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`);
  };

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
      const workSeconds = viewingLog.phaseDurations?.work ?? viewingLog.duration;
      const restSeconds = viewingLog.phaseDurations?.rest ?? 0;
      setPhaseDurationsEdit({ work: workSeconds, rest: restSeconds });
      setEditWorkMinutes(formatMinutesInput(workSeconds));
      setEditRestMinutes(formatMinutesInput(restSeconds));
      setPhaseEditTouched(false);
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

  const commitPhaseFieldValue = () => {
    if (!activePhaseField) return;
    const { phase, unit } = activePhaseField;
    const parsed = parseInt(phaseFieldDraft, 10);
    const rawValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setPhaseDurationsEdit(prev => {
      const current = prev[phase];
      const minutes = Math.floor(current / 60);
      const seconds = current % 60;
      let newTotal = current;
      if (unit === 'minutes') {
        newTotal = rawValue * 60 + seconds;
      } else {
        const cappedSeconds = Math.min(59, rawValue);
        newTotal = minutes * 60 + cappedSeconds;
      }
      const updated = { ...prev, [phase]: newTotal };
      updateEndTimeFromPhaseDurations(updated);
      return updated;
    });
    setPhaseEditTouched(true);
    setActivePhaseField(null);
    setPhaseFieldDraft('');
  };

  const startPhaseFieldEditing = (phase: TimerPhase, unit: 'minutes' | 'seconds') => {
    if (!isEditMode) return;
    const total = phaseDurationsEdit[phase];
    const value = unit === 'minutes' ? Math.floor(total / 60).toString() : (total % 60).toString();
    setPhaseFieldDraft(value);
    setActivePhaseField({ phase, unit });
  };

  const handlePhaseFieldInputChange = (value: string) => {
    setPhaseFieldDraft(value.replace(/[^0-9]/g, ''));
  };

  const handlePhaseFieldInputBlur = () => {
    commitPhaseFieldValue();
  };

  const handlePhaseFieldInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitPhaseFieldValue();
    }
  };

  useEffect(() => {
    if (phaseFieldInputRef.current && activePhaseField) {
      phaseFieldInputRef.current.focus();
      phaseFieldInputRef.current.select();
    }
  }, [activePhaseField]);

  useEffect(() => {
    if (phaseEditTouched) {
      updateEndTimeFromPhaseDurations();
    }
  }, [phaseDurationsEdit, editStartDate, editStartTime, phaseEditTouched]);

  const handleSaveEdit = () => {
    if (!viewingLog) return;

    if (!isEditValid) {
      if (!editOrderValid) setEditTimeError('End time must be after start time.');
      else if (!editDurationValid) setEditTimeError('Duration must be at least 1 minute.');
      else setEditTimeError('Please provide valid start and end date/time.');
      return;
    }

    let finalDuration = Math.floor((editEndTs - editStartTs) / 1000);
    let finalEndTimestamp = editEndTs;

    if (phaseEditTouched && !isNaN(editStartTs)) {
      finalDuration = phaseDurationsEdit.work + phaseDurationsEdit.rest;
      finalEndTimestamp = editStartTs + finalDuration * 1000;
    }

    if (finalDuration < 60) {
      setEditTimeError('Duration must be at least 1 minute.');
      return;
    }

    const existingPhaseDurations = viewingLog.phaseDurations ?? { work: finalDuration, rest: 0 };
    const phaseDurationsToSave = phaseEditTouched
      ? { ...phaseDurationsEdit }
      : existingPhaseDurations;

    const updatedLog: LogEntry = {
      ...viewingLog,
      startTime: editStartTs,
      endTime: finalEndTimestamp,
      duration: finalDuration,
      phaseDurations: phaseDurationsToSave,
    };

    setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    setIsEditMode(false);
    setPhaseEditTouched(false);
    setViewingLog(null);
    setEditTimeError(null);
  };

  const viewingLogMetadata = useMemo(() => {
    if (!viewingLog) return null;
    const totals = resolvePhaseTotals(viewingLog);
    const phaseDetails = { work: totals.work, rest: totals.rest };
    return {
      startLabel: `${formatDisplayDate(viewingLog.startTime)} ${formatClock(viewingLog.startTime)}`,
      endLabel: viewingLog.endTime
        ? `${formatDisplayDate(viewingLog.endTime)} ${formatClock(viewingLog.endTime)}`
        : 'In progress',
      durationLabel: formatTime(totals.total),
      phaseDetails,
    };
  }, [viewingLog]);

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

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    setIsTimelineDragging(true);
    setTimelineDragMoved(false);
    setTimelineStartX(e.pageX - timelineRef.current.offsetLeft);
    setTimelineScrollLeft(timelineRef.current.scrollLeft);
    timelineRef.current.style.cursor = 'grabbing';
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!isTimelineDragging || !timelineRef.current) return;
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - timelineStartX);
    if (Math.abs(walk) > 5) setTimelineDragMoved(true);
    timelineRef.current.scrollLeft = timelineScrollLeft - walk;
  };

  const handleTimelineMouseUpLeave = () => {
    if (isTimelineDragging && timelineRef.current) {
      setIsTimelineDragging(false);
      timelineRef.current.style.cursor = 'grab';
    }
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

  const handleClipboardImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isEditMode || !viewingLog) return;
    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItems.length === 0) return;
    e.preventDefault();
    const fileToBase64 = imageItems.map(item => new Promise<string>((resolve) => {
      const file = item.getAsFile();
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (loadEvent) => resolve(loadEvent.target?.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }));
    Promise.all(fileToBase64)
      .then(base64List => base64List.filter(Boolean) as string[])
      .then(validBase64s => Promise.all(validBase64s.map(base64 => compressImage(base64))))
      .then(pastedImages => {
        if (!pastedImages.length) return;
        setViewingLog(prev => prev ? ({ ...prev, images: [...prev.images, ...pastedImages] }) : null);
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
      phaseDurations: { work: duration, rest: 0 },
      images: manualLog.images,
    };
    setLogs(prev => [newLog, ...prev].sort((a,b) => b.startTime - a.startTime));
    setShowManualModal(false);
    setManualLog({ category: 'Work', description: '', date: formatDate(Date.now()), startTime: '09:00', endTime: '10:00', images: [] });
    setManualLogError(null);
  };

  const exportData = () => {
    const data = JSON.stringify({ logs, settings, categoryColors, goals, inspirations });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emerald-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement> | any, directContent?: string) => {
    const processContent = (content: string) => {
      try {
        const parsed = JSON.parse(content);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.categoryColors) setCategoryColors(parsed.categoryColors);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.inspirations) setInspirations(parsed.inspirations);
        return true;
      } catch (err) {
        return false;
      }
    };

    if (directContent) {
      if (processContent(directContent)) {
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Invalid JSON.');
      }
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (processContent(event.target?.result as string)) {
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const syncToGitLab = async () => {
    if (!gitlabConfig.token || !gitlabConfig.projectId) {
      alert('Please configure GitLab settings first.');
      return;
    }
    setIsSyncing(true);
    try {
      const data = JSON.stringify({ 
        logs, 
        settings, 
        categoryColors, 
        goals, 
        inspirations,
        lastSynced: new Date().toISOString()
      }, null, 2);
      
      const baseUrl = gitlabConfig.url.endsWith('/') ? gitlabConfig.url : `${gitlabConfig.url}/`;
      const apiUrl = `${baseUrl}api/v4/projects/${encodeURIComponent(gitlabConfig.projectId)}/repository/files/${encodeURIComponent(gitlabConfig.filename)}`;
      
      const checkRes = await fetch(`${apiUrl}?ref=${gitlabConfig.branch}`, {
        headers: { 'PRIVATE-TOKEN': gitlabConfig.token }
      });

      const method = checkRes.ok ? 'PUT' : 'POST';

      const res = await fetch(apiUrl, {
        method,
        headers: {
          'PRIVATE-TOKEN': gitlabConfig.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: gitlabConfig.branch,
          content: data,
          commit_message: `Sync emerald-timer data: ${new Date().toLocaleString()}`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to push to GitLab');
      }

      const now = new Date().toLocaleString();
      setLastSyncedAt(now);
      localStorage.setItem('emerald-last-synced', now);
      alert('Synced to GitLab successfully!');
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromGitLab = async () => {
    if (!gitlabConfig.token || !gitlabConfig.projectId) {
      alert('Please configure GitLab settings first.');
      return;
    }
    setIsSyncing(true);
    try {
      const baseUrl = gitlabConfig.url.endsWith('/') ? gitlabConfig.url : `${gitlabConfig.url}/`;
      const apiUrl = `${baseUrl}api/v4/projects/${encodeURIComponent(gitlabConfig.projectId)}/repository/files/${encodeURIComponent(gitlabConfig.filename)}/raw?ref=${gitlabConfig.branch}`;
      
      const res = await fetch(apiUrl, {
        headers: { 'PRIVATE-TOKEN': gitlabConfig.token }
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error('Sync file not found in repository.');
        throw new Error('Failed to fetch from GitLab');
      }

      const text = await res.text();
      const parsed = JSON.parse(text);
      
      if (parsed.logs) setLogs(parsed.logs);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.categoryColors) setCategoryColors(parsed.categoryColors);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.inspirations) setInspirations(parsed.inspirations);
      
      const now = new Date().toLocaleString();
      setLastSyncedAt(now);
      localStorage.setItem('emerald-last-synced', now);
      alert('Data restored from GitLab successfully!');
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

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
    relevantLogs.forEach(log => {
      categoryTotals[log.category] = (categoryTotals[log.category] || 0) + log.duration;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value: Math.round(value / 60) }))
      .sort((a,b) => b.value - a.value);
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

  const selectedDayLogs = useMemo(() => {
    return logs.filter(l => formatDate(l.startTime) === selectedStatsDate).sort((a,b) => a.startTime - b.startTime);
  }, [logs, selectedStatsDate]);

  const continueButtonLabel = pendingNextPhase === 'work' ? 'Continue for work' : pendingNextPhase === 'rest' ? 'Continue for rest' : 'Continue current log';
  const startNewButtonLabel = pendingNextPhase === 'work' ? 'Save & start new work log' : pendingNextPhase === 'rest' ? 'Save & start new rest log' : 'Save & start new log';
  const continuationDescription = pendingNextPhase === 'work'
    ? 'Continue adding time to the current log as you begin the next work session, or save it now and start fresh before focusing again.'
    : pendingNextPhase === 'rest'
      ? 'Carry this log into the upcoming rest break, or save it now and create a fresh entry for your downtime.'
      : 'Continue the current log or save it now before moving into the next phase.';
  const continuationNote = pendingNextPhase === 'work'
    ? 'Starting a new log resets the accumulated focus time before the upcoming work session.'
    : pendingNextPhase === 'rest'
      ? 'Starting a new log resets the accumulated totals before the upcoming rest break.'
      : 'Starting a new log resets the accumulated work/rest totals for the next block.';

  return (
    <div className={`h-screen w-full ${(isMiniMode || wasMiniModeBeforeModal) ? 'bg-transparent' : 'bg-[#f0f9f0]'} text-emerald-900 flex flex-col items-center overflow-hidden transition-all duration-300 ${(isMiniMode || wasMiniModeBeforeModal) ? '' : 'rounded-3xl border border-emerald-100/50 shadow-2xl'}`}>
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .scrollbar-none {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
      {/* Custom Title Bar for Normal Mode */}
      {!isMiniMode && !wasMiniModeBeforeModal && (
        <div className="w-full h-10 flex items-center justify-between px-4 bg-white/50 backdrop-blur-sm border-b border-emerald-50 flex-shrink-0 select-none" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              <img src={APP_LOGO} alt="Logo" className="w-full h-full object-cover" />
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

      {showLogContinuationPrompt && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative space-y-5 ring-1 ring-emerald-100/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <FileText size={20} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Log Decision</p>
                <h3 className="text-xl font-black text-emerald-950 leading-tight">Carry over this log?</h3>
              </div>
              <p className="text-xs text-emerald-500/80 text-center leading-relaxed px-2">
                {continuationDescription}
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <button 
                onClick={handleContinueCurrentLog} 
                className="w-full py-3.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.97]"
              >
                {continueButtonLabel}
              </button>
              <button 
                onClick={handleStartNewLog} 
                className="w-full py-3.5 bg-white border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
              >
                {startNewButtonLabel}
              </button>
              <button 
                onClick={handleCancelLogChoice} 
                className="w-full py-3.5 bg-emerald-50 text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-[0.97]"
              >
                Back to options
              </button>
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-400/80 text-center px-4 leading-normal italic">
              {continuationNote}
            </div>
          </div>
        </div>
      )}

      {!isMiniMode && !wasMiniModeBeforeModal && (
        <header className="w-full max-w-6xl flex justify-between items-center p-4 md:p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 overflow-hidden border border-emerald-50">
              <img src={APP_LOGO} alt="Emerald Timer Logo" className="w-full h-full object-cover p-1" />
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
                  <span className="text-3xl font-mono font-bold tabular-nums tracking-tighter leading-none">{formatTime(displayTime)}</span>
                  {isOvertime && <span className="text-[10px] text-orange-500 font-bold">+{formatTime(overtimeSeconds)}</span>}
                </div>
              </div>
              <div className="flex gap-1.5">
                 <button onClick={() => setShowLoggingModal(true)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90"><Edit3 size={14}/></button>
                 {isCurrentlyRecording && (
                   <button onClick={handleStopClick} className="p-2 rounded-xl bg-white text-red-500 border border-red-50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-in-out active:scale-90"><Square size={14}/></button>
                 )}
                 {!isOvertime && isCurrentlyRecording && (
                   <button onClick={handleSkipToNextPhase} className="p-2 rounded-xl bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90" title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
                     {phase === 'work' ? <Coffee size={14} /> : <Briefcase size={14} />}
                   </button>
                 )}
                 {isOvertime && (
                   <button onClick={handleSkipToNextPhase} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90" title="Next Phase">
                     <RotateCcw size={14} />
                   </button>
                 )}
                 <button onClick={handleStart} className={`p-2 rounded-xl shadow-md transition-all duration-300 ease-in-out active:scale-90 ${isActive ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}>
                    {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
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
              { id: 'journal', icon: BookOpen, label: 'Journal' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-6 flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? 'text-emerald-700' : 'text-emerald-300 hover:text-emerald-500'}`}>
                <tab.icon size={18} /> <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-6 right-6 h-1 bg-emerald-600 rounded-t-full shadow-[0_-4px_10px_rgba(5,150,105,0.3)]" />}
              </button>
            ))}
          </nav>

          <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-none">
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
                    
                    <span className="text-6xl font-mono font-bold tabular-nums z-10 tracking-tighter">{formatTime(displayTime)}</span>
                    {isOvertime && <span className="text-orange-500 font-bold text-xs animate-pulse mt-1 font-mono z-10">+{formatTime(overtimeSeconds)}</span>}
                    <div className="mt-4 px-3 py-1 bg-emerald-50/50 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] truncate max-w-[160px] z-10">
                      {currentTask.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 h-24">
                  {isCurrentlyRecording && (
                    <button onClick={handleStopClick} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ease-in-out shadow-sm border border-emerald-100 flex items-center justify-center group active:scale-90">
                      <Square size={20} fill="currentColor" className="group-hover:scale-90 transition-transform"/>
                    </button>
                  )}
                  {!isOvertime && isCurrentlyRecording && (
                    <button onClick={handleSkipToNextPhase} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center" title={phase === 'work' ? 'Start Rest' : 'Start Work'}>
                      {phase === 'work' ? <Coffee size={20} /> : <Briefcase size={20} />}
                    </button>
                  )}
                  {isOvertime && (
                    <button onClick={handleSkipToNextPhase} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all duration-300 ease-in-out active:scale-90 flex items-center justify-center" title="Next Phase">
                      <RotateCcw size={20} />
                    </button>
                  )}
                  <button onClick={handleStart} className={`flex items-center justify-center transition-all duration-300 ease-in-out shadow-xl active:scale-95 ${isActive ? 'w-20 h-20 rounded-3xl text-white bg-orange-500 shadow-orange-100' : 'w-16 h-16 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}>
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={handleSetupClick} className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-300 ease-in-out border border-emerald-100 flex items-center justify-center active:scale-90">
                    <Settings size={20} />
                  </button>
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
                       {([
                         { id: 'day', label: 'Day' },
                         { id: 'week', label: 'Week' },
                         { id: 'month', label: 'Month' },
                         { id: 'year', label: 'Year' }
                       ] as { id: StatsView, label: string }[]).map(v => (
                         <button key={v.id} onClick={() => setStatsView(v.id)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statsView === v.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-500 hover:bg-emerald-100'}`}>{v.label}</button>
                       ))}
                     </div>
                     <div className="flex items-center gap-3">
                        {statsView === 'day' && (
                          <div className="bg-white/80 p-1 rounded-2xl flex border border-emerald-100/50 shadow-sm">
                             <button onClick={() => setDayViewMode('timeline')} className={`p-2 rounded-xl transition-all ${dayViewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Timeline View"><LayoutGrid size={16}/></button>
                             <button onClick={() => setDayViewMode('stats')} className={`p-2 rounded-xl transition-all ${dayViewMode === 'stats' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`} title="Stats View"><BarChart size={16}/></button>
                          </div>
                        )}
                        <div className="text-[10px] font-black text-emerald-800 pr-5 uppercase tracking-widest opacity-60">{formatDisplayDateString(selectedStatsDate)}</div>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-none pb-20">
                    {statsView === 'day' && (
                      <div className="space-y-8 animate-in zoom-in-95 duration-500">
                         {dayViewMode === 'timeline' ? (
                           <>
                             {/* Timeline Section */}
                             <div className="relative bg-white rounded-[3rem] border border-emerald-50 h-[360px] shadow-sm overflow-visible group flex-shrink-0">
                                {/* Zoom controls */}
                                <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-emerald-50 shadow-sm">
                                  <button onClick={zoomOut} title="Zoom out" className={`p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition ${timelineZoom <= MIN_ZOOM ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={timelineZoom <= MIN_ZOOM}><ZoomOut size={16} /></button>
                                  <div className="text-[12px] font-mono font-bold">{Math.round(timelineZoom * 100)}%</div>
                                  <button onClick={zoomIn} title="Zoom in" className={`p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition ${timelineZoom >= MAX_ZOOM ? 'opacity-40 cursor-not-allowed' : ''}`} disabled={timelineZoom >= MAX_ZOOM}><ZoomIn size={16} /></button>
                                </div>

                                <div 
                                  ref={timelineRef} 
                                  onWheel={handleTimelineWheel} 
                                  onMouseDown={handleTimelineMouseDown}
                                  onMouseMove={handleTimelineMouseMove}
                                  onMouseUp={handleTimelineMouseUpLeave}
                                  onMouseLeave={handleTimelineMouseUpLeave}
                                  onKeyDown={(e) => { if ((e as any).key === '+' || (e as any).key === '=' ) { e.preventDefault(); zoomIn(); } else if ((e as any).key === '-') { e.preventDefault(); zoomOut(); } }} 
                                  tabIndex={0} 
                                  title="Drag to scroll | Shift + Wheel to zoom, +/- to zoom" 
                                  style={{ touchAction: 'pan-y' }} 
                                  className="absolute inset-0 overflow-x-auto overscroll-contain scrollbar-none focus:outline-none cursor-grab"
                                >
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
                                            <div key={log.id} onClick={() => handleViewLog(log)} className="absolute top-0 bottom-0 rounded-xl cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:z-50 border border-white/30 shadow-sm group/log z-10 overflow-visible" style={{ left: `${((log.startTime - timelineRange.start) / 60000) * 1.5 * timelineZoom + 40}px`, width: `${Math.max((log.duration / 60) * 1.2 * timelineZoom, 6)}px`, backgroundColor: getCategoryColor(log.category) }}>
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

                             {/* Life Journal Section (Moved here from Month View) */}
                             <div className="space-y-12 pt-4">
                               <div className="flex items-center justify-between border-b border-emerald-50 pb-8">
                                 <div className="flex items-center gap-5">
                                   <div className="p-4 bg-emerald-600 text-white rounded-[2.25rem] shadow-xl shadow-emerald-200">
                                     <History size={26}/>
                                   </div>
                                   <div>
                                     <h4 className="text-xl font-black text-emerald-950 tracking-tight">Life Timeline</h4>
                                     <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-1">{formatDisplayDateString(selectedStatsDate)}</p>
                                   </div>
                                 </div>
                                 <button 
                                   onClick={() => setActiveTab('logs')} 
                                   className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                                 >
                                   Historical Logs <ExternalLink size={14}/>
                                 </button>
                               </div>

                               <div className="space-y-4 pl-6 border-l-2 border-emerald-50/60 ml-6 mr-4 flex-1 min-w-0">
                                 {selectedDayLogs.map((log, idx) => (
                                   <div key={log.id} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 80}ms` }}>
                                     {/* Timeline Connector */}
                                     <div className="absolute -left-[31px] top-3 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-[#f0f9f0] z-10" style={{ backgroundColor: getCategoryColor(log.category) }}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                                     </div>

                                     <div
                                       role="button"
                                       tabIndex={0}
                                       onClick={() => handleViewLog(log)}
                                       className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 cursor-pointer group ring-1 ring-emerald-50/50"
                                     >
                                        <div className="flex justify-between items-start mb-1.5">
                                          <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl ring-1 ring-emerald-100/50">
                                              {React.createElement(DEFAULT_CATEGORY_DATA[log.category].icon, {size: 16})}
                                            </div>
                                            <div>
                                              <div className="text-[9px] font-black uppercase text-emerald-300 tracking-[0.2em] leading-none mb-0.5">{formatClock(log.startTime)} — {log.endTime ? formatClock(log.endTime) : 'NOW'}</div>
                                              <div className="text-[9px] font-bold text-emerald-500 leading-none">
                                                {formatTime(resolvePhaseTotals(log).total)}
                                              </div>
                                            </div>
                                          </div>
                                          <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider" style={{ backgroundColor: getCategoryColor(log.category) }}>
                                            {log.category}
                                          </span>
                                        </div>

                                        {log.description && (
                                           <h5 className="text-xs font-bold text-emerald-950 mb-2 leading-relaxed pl-1 tracking-tight line-clamp-2">{log.description}</h5>
                                        )}
                                        
                                        {log.images.length > 0 && (
                                          <div className="pt-0.5 pb-1">
                                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                              {log.images.map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-emerald-50 shadow-sm transition-all duration-200 group-hover:shadow-md">
                                                  <img 
                                                    src={img} 
                                                    onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }} 
                                                    className="w-full h-full object-cover cursor-zoom-in"
                                                  />
                                                </div>
                                              ))}
                                            </div>
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
                                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">No Logs Recorded</p>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </>
                         ) : (
                           <div className="space-y-8">
                             {/* Stats View Mode (previously Day Summary Metrics) */}
                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom duration-500">
                                <div className="lg:col-span-4 bg-emerald-600 text-white p-8 rounded-[3rem] shadow-xl shadow-emerald-200 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70 relative z-10">Total Tracked Today</span>
                                  <div className="text-3xl font-black mt-3 tracking-tighter relative z-10">
                                    {formatTime(selectedDayLogs.reduce((acc, l) => acc + l.duration, 0))}
                                  </div>
                                  <p className="text-[10px] font-bold mt-4 opacity-50 relative z-10">{selectedDayLogs.length} distinct sessions recorded</p>
                                </div>
                                
                                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                                  {statsData.length > 0 ? statsData.map((item, idx) => (
                                    <div key={item.name} className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1" style={{ animationDelay: `${idx * 30}ms` }}>
                                      <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                                            {React.createElement(DEFAULT_CATEGORY_DATA[item.name as Category].icon, { size: 20 })}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase text-emerald-900/40 tracking-widest leading-none mb-1">{item.name}</span>
                                            <div className="text-sm font-black text-emerald-950">{item.value}m</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                                         <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="col-span-full flex items-center justify-center bg-emerald-50/50 rounded-[2rem] border border-dashed border-emerald-100 py-10 text-[10px] font-black uppercase text-emerald-300 tracking-[0.3em]">
                                      No Category Data
                                    </div>
                                  )}
                                </div>
                             </div>
                             {/* You can add more detailed charts here for the 'stats' mode of the day view */}
                           </div>
                         )}
                      </div>
                    )}

                    {(statsView === 'month' || statsView === 'week') && (
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
                                   onClick={() => {
                                     setSelectedStatsDate(item.dateStr || '');
                                     setStatsView('day');
                                   }}
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

                         {/* Aggregate Stats Metrics below Grid */}
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom duration-500 delay-150">
                            <div className="lg:col-span-4 bg-emerald-600 text-white p-8 rounded-[3rem] shadow-xl shadow-emerald-200 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70 relative z-10">Total Period Tracked</span>
                              <div className="text-3xl font-black mt-3 tracking-tighter relative z-10">
                                {formatTime(relevantLogs.reduce((acc, l) => acc + l.duration, 0))}
                              </div>
                              <p className="text-[10px] font-bold mt-4 opacity-50 relative z-10">{relevantLogs.length} sessions in this period</p>
                            </div>
                            
                            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                              {statsData.length > 0 ? statsData.map((item, idx) => (
                                <div key={item.name} className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1" style={{ animationDelay: `${idx * 30}ms` }}>
                                  <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ backgroundColor: `${getCategoryColor(item.name as Category)}15`, color: getCategoryColor(item.name as Category) }}>
                                        {React.createElement(DEFAULT_CATEGORY_DATA[item.name as Category].icon, { size: 20 })}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase text-emerald-900/40 tracking-widest leading-none mb-1">{item.name}</span>
                                        <div className="text-sm font-black text-emerald-950">{item.value}m</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                                     <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / Math.max(1, statsData.reduce((a,b)=>a+b.value,0)))*100}%`, backgroundColor: getCategoryColor(item.name as Category) }} />
                                  </div>
                                </div>
                              )) : (
                                <div className="col-span-full flex items-center justify-center bg-emerald-50/50 rounded-[2rem] border border-dashed border-emerald-100 py-10 text-[10px] font-black uppercase text-emerald-300 tracking-[0.3em]">
                                  No Category Data
                                </div>
                              )}
                            </div>
                         </div>
                      </div>
                    )}

                    {statsView === 'year' && (
                      <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white rounded-[3.5rem] p-10 border border-emerald-50 shadow-sm overflow-hidden ring-1 ring-emerald-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                                className="bg-white p-5 rounded-[2.5rem] border border-emerald-50 shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between mb-4 px-1">
                                  <div className="text-base font-black text-emerald-900 uppercase tracking-widest">{new Date(new Date(selectedStatsDate).getFullYear(), m.month).toLocaleString(undefined, { month: 'long' })}</div>
                                  <div className="text-xs font-black text-emerald-400 bg-emerald-50 px-3 py-1 rounded-full">{m.totalMinutes}m</div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                  <div className="w-full h-32 bg-emerald-50/50 rounded-[1.5rem] overflow-hidden border border-emerald-100/50 flex items-center justify-center relative">
                                    {m.sampleImage ? (
                                      <img src={m.sampleImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2 opacity-20">
                                        <ImageIcon size={24} className="text-emerald-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No Moments</span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="space-y-2 px-1">
                                    {m.categories.slice(0,3).map(cat => (
                                      <div key={cat.name} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat.name as Category) }} />
                                        <div className="text-[10px] font-black text-emerald-800/60 truncate uppercase tracking-tighter">{cat.name}</div>
                                        <div className="ml-auto text-[10px] font-bold text-emerald-400">{cat.minutes}m</div>
                                      </div>
                                    ))}
                                    {m.categories.length > 3 && (
                                      <div className="text-[9px] font-black text-emerald-200 uppercase tracking-widest pt-1">+{m.categories.length - 3} more</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Year Charts Integration */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                           <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 h-[450px] shadow-sm flex flex-col relative overflow-hidden group ring-1 ring-emerald-50/50">
                             <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-emerald-50 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-700"/>
                             <h3 className="text-[11px] font-black mb-10 text-emerald-800 uppercase tracking-[0.3em] relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Category Breakdown</h3>
                             {statsData.length > 0 ? (
                               <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                   <Pie data={statsData} innerRadius={90} outerRadius={130} paddingAngle={8} dataKey="value" stroke="none">
                                     {statsData.map(entry => <Cell key={entry.name} fill={getCategoryColor(entry.name as Category)} />)}
                                   </Pie>
                                   <RechartsTooltip contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', padding:'15px 25px', fontWeight: 'bold'}} />
                                   <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '30px'}} />
                                 </PieChart>
                               </ResponsiveContainer>
                             ) : <div className="h-full flex items-center justify-center text-emerald-200 uppercase font-black tracking-[0.3em]">No Activity</div>}
                           </div>
                           <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 h-[450px] shadow-sm flex flex-col relative overflow-hidden group ring-1 ring-emerald-50/50">
                             <div className="absolute bottom-0 left-0 p-12 -ml-16 -mb-16 bg-emerald-50 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-700"/>
                             <h3 className="text-[11px] font-black mb-10 text-emerald-800 uppercase tracking-[0.3em] relative z-10 flex items-center gap-2"><div className="w-1.5 h-4 bg-emerald-600 rounded-full"/> Time Spent (Min)</h3>
                             <ResponsiveContainer width="100%" height="100%">
                               <ReBarChart data={yearHistory}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                 <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                 <RechartsTooltip cursor={{fill: '#f8fafc', radius: 15}} contentStyle={{borderRadius:'24px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.1)'}} />
                                 <Bar dataKey="minutes" fill="#10b981" radius={[12, 12, 12, 12]} barSize={32} />
                               </ReBarChart>
                             </ResponsiveContainer>
                           </div>
                        </div>
                      </div>
                    )}

                    {(statsView === 'month' || statsView === 'week') && viewMode === 'charts' && (
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
                             <ReBarChart data={statsView === 'week' ? weekHistory : monthHistory}>
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
                <div className="flex justify-between items-center py-6 border-b border-emerald-50 px-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900 flex items-center gap-3"><Clock size={20} className="text-emerald-500" /> History Logs</h3>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${showFilters ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                      <FilterIcon size={14}/> Filters
                    </button>
                  </div>
                  <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"><Plus size={16} /> Add Entry</button>
                </div>

                {showFilters && (
                  <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">Category</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <option value="All">All Categories</option>
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">From Date</label>
                        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest ml-1">To Date</label>
                        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button onClick={() => { setFilterCategory('All'); setFilterStartDate(''); setFilterEndDate(''); }} className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-600 tracking-widest transition-colors">Reset Filters</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredLogs.map((log) => (
                    <div key={log.id} onClick={() => handleViewLog(log)} className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-5 cursor-pointer relative overflow-hidden" style={{ borderLeft: `8px solid ${getCategoryColor(log.category)}` }}>
                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600">{React.createElement(DEFAULT_CATEGORY_DATA[log.category].icon, {size: 24})}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-emerald-900 truncate tracking-tight">{log.description || 'Session'}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold">{formatDisplayDate(log.startTime)} • {formatTime(log.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="flex-1 flex gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                {/* Left Side: Goals (Todo List) */}
                <div className="flex-1 flex flex-col bg-emerald-50/20 rounded-[3rem] p-8 border border-emerald-50 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Target size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-emerald-950 tracking-tight">Goals</h2>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Focus & Persistence</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-none space-y-4">
                    <div className="flex gap-3 mb-6 sticky top-0 bg-transparent z-10 backdrop-blur-sm py-1">
                      <input 
                        type="text" 
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { 
                          if (newGoalText.trim()) {
                            setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                            setNewGoalText('');
                          }
                        }}}
                        placeholder="Define your next target..." 
                        className="flex-1 bg-white border border-emerald-100 rounded-2xl px-5 py-3.5 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                      />
                      <button 
                        onClick={() => {
                          if (newGoalText.trim()) {
                            setGoals(prev => [{ id: Date.now().toString(), text: newGoalText.trim(), completed: false }, ...prev]);
                            setNewGoalText('');
                          }
                        }}
                        className="bg-emerald-600 text-white p-3.5 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    {goals.length > 0 ? goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-4 group p-1 slide-in-from-left duration-300">
                        <button 
                          onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-100 text-transparent hover:border-emerald-300'}`}
                        >
                          <Check size={16} strokeWidth={4} />
                        </button>
                        <span className={`flex-1 text-sm font-bold transition-all ${goal.completed ? 'text-emerald-300 line-through' : 'text-emerald-900 font-black'}`}>
                          {goal.text}
                        </span>
                        <button 
                          onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                          className="opacity-0 group-hover:opacity-100 p-2 text-emerald-200 hover:text-red-400 transition-all hover:scale-110"
                        >
                          <Minus size={18} />
                        </button>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                         <Target size={48} className="text-emerald-200" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">No goals set yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Inspirations (Musing Cards) */}
                <div className="flex-1 flex flex-col bg-white rounded-[3.5rem] p-8 border border-emerald-50 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Quote size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-emerald-950 tracking-tight">Musing</h2>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Insights & Echoes</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setNewInspiration({ title: '', content: '', url: '' }); setSelectedInspiration(null); setShowInspirationModal(true); }}
                      className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
                    >
                      New Insight
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-none space-y-5">
                    {inspirations.length > 0 ? inspirations.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedInspiration(item); setShowInspirationModal(true); }}
                        className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-50 hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative"
                      >
                        <Quote size={14} className="absolute top-4 right-4 text-emerald-100 group-hover:text-emerald-200 transition-colors" />
                        <h4 className="text-sm font-black text-emerald-900 mb-2 truncate pr-6">{item.title || 'Untitled Thought'}</h4>
                        <p className="text-xs text-emerald-600/70 leading-relaxed font-bold line-clamp-3 mb-4">{item.content}</p>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                           {item.url && <div className="text-emerald-400 p-1.5 bg-white rounded-lg shadow-sm border border-emerald-100"><Link size={12} /></div>}
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                         <Quote size={48} className="text-emerald-200" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Silence of thoughts</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* --- Modals --- */}
      {viewingLog && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[150] animate-in fade-in duration-300`}>
          <div className={`bg-white rounded-[2rem] p-7 w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none ring-1 ring-emerald-100/50 transition-all duration-300 ${isEditMode ? 'max-w-lg' : 'max-w-sm'}`} style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any} onPaste={handleClipboardImagePaste}>
               {!isEditMode ? (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">{React.createElement(DEFAULT_CATEGORY_DATA[viewingLog.category].icon, { size: 28 })}</div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-emerald-950 leading-tight pr-2 tracking-tight mb-0.5 truncate">{viewingLog.description || 'Focus Session'}</h2>
                        <div className="text-[10px] font-bold text-emerald-400 mb-2">{formatDisplayDate(viewingLog.startTime)}{viewingLog.endTime && formatDisplayDate(viewingLog.startTime) !== formatDisplayDate(viewingLog.endTime) ? ` - ${formatDisplayDate(viewingLog.endTime)}` : ''}</div>
                        <span className="text-[9px] font-black text-white uppercase px-2.5 py-1 rounded-lg shadow-md tracking-wider" style={{ backgroundColor: getCategoryColor(viewingLog.category) }}>{viewingLog.category}</span>
                      </div>
                   </div>

                   {viewingLogMetadata && (
                     <div className="space-y-2.5 mb-6">
                       <div className="grid grid-cols-3 gap-2.5 text-[9px] uppercase tracking-[0.35em] text-emerald-500">
                         <div className="rounded-2xl border border-emerald-50 bg-emerald-50/70 p-3 flex flex-col items-center justify-center gap-1">
                           <div className="text-[8px] font-black tracking-[0.2em] opacity-60">Start</div>
                           <div className="text-sm font-black text-emerald-900">{formatClock(viewingLog.startTime)}</div>
                         </div>
                         <div className="rounded-2xl border border-emerald-50 bg-white/80 p-3 flex flex-col items-center justify-center gap-1">
                           <div className="text-[8px] font-black tracking-[0.2em] opacity-60">End</div>
                           <div className="text-sm font-black text-emerald-900">{viewingLog.endTime ? formatClock(viewingLog.endTime) : 'NOW'}</div>
                         </div>
                         <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 p-3 flex flex-col items-center justify-center gap-1">
                           <div className="text-[8px] font-black tracking-[0.2em] opacity-60">Time</div>
                           <div className="text-sm font-black text-emerald-900">{viewingLogMetadata.durationLabel}</div>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-2.5 text-[9px] uppercase tracking-[0.4em] text-emerald-500">
                         <div className="rounded-2xl border border-emerald-50 bg-white p-2.5 flex items-center justify-between px-4">
                           <span className="text-[8px] font-black tracking-[0.2em] text-emerald-400">Work</span>
                           <span className="text-xs font-black text-emerald-900">{formatTime(viewingLogMetadata.phaseDetails.work)}</span>
                         </div>
                         <div className="rounded-2xl border border-emerald-50 bg-white p-2.5 flex items-center justify-between px-4">
                           <span className="text-[8px] font-black tracking-[0.2em] text-emerald-400">Rest</span>
                           <span className="text-xs font-black text-emerald-900">{formatTime(viewingLogMetadata.phaseDetails.rest)}</span>
                         </div>
                       </div>
                     </div>
                   )}

                   {viewingLog.images.length > 0 && (
                     <div className="mb-6">
                       <label className="text-[8px] font-black text-emerald-300 uppercase block mb-3 tracking-[0.2em] pl-1">Photos ({viewingLog.images.length})</label>
                       <div className="grid grid-cols-3 gap-2">
                         {viewingLog.images.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm group">
                             <img src={img} className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500" onClick={() => setPreviewImage(img)} />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   <div className="flex flex-col gap-2.5">
                     <button onClick={() => setIsEditMode(true)} className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-xs"><Edit2 size={16} /> Update Entry</button>
                     <div className="grid grid-cols-2 gap-2.5">
                       <button onClick={() => { setViewingLog(null); setIsEditMode(false); setPhaseEditTouched(false); }} className="w-full py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-[0.2em] border border-emerald-100 active:scale-[0.97] transition-all text-xs">Close</button>
                       <button onClick={() => handleDeleteLog(viewingLog.id)} className="w-full py-3.5 bg-white text-red-500 border border-red-50 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-red-50 active:scale-[0.97] transition-all text-xs">Delete</button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-emerald-950 tracking-tight">Edit Session</h2>
                    </div>
                    {viewingLogMetadata && (
                      <div className="mb-4 rounded-2xl border border-emerald-50 bg-emerald-50/40 p-2.5 space-y-2 text-[9px] uppercase tracking-[0.3em] text-emerald-500">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-emerald-100 bg-white/80 px-2.5 py-2 text-[10px] font-black text-emerald-900">
                            <div className="text-[8px] font-black text-emerald-400">Work</div>
                            <div>{formatTime(viewingLogMetadata.phaseDetails.work)}</div>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-white/80 px-2.5 py-2 text-[10px] font-black text-emerald-900">
                            <div className="text-[8px] font-black text-emerald-400">Rest</div>
                            <div>{formatTime(viewingLogMetadata.phaseDetails.rest)}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <div className="text-[9px] font-black text-emerald-900">Duration {viewingLogMetadata.durationLabel}</div>
                          <div className="text-[8px] text-emerald-500 opacity-70 tracking-widest">{viewingLogMetadata.startLabel} - {viewingLogMetadata.endLabel}</div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <select value={viewingLog.category} onChange={(e) => setViewingLog({...viewingLog, category: e.target.value as any})} className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm h-10">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <textarea rows={2} value={viewingLog.description} onChange={(e) => setViewingLog({...viewingLog, description: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs outline-none resize-none shadow-sm" />
                      
                      <div>
                        <label className="text-[8px] font-black uppercase text-emerald-400 block mb-2 tracking-[0.2em] pl-1">Photos ({viewingLog.images.length})</label>
                        <div className="flex flex-wrap gap-2">
                          {viewingLog.images.map((img, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border-2 border-white group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={() => setViewingLog({...viewingLog, images: viewingLog.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={8} /></button>
                            </div>
                          ))}
                          <label className="w-12 h-12 flex flex-col items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 text-emerald-400">
                            <Plus size={16} />
                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'edit')} />
                          </label>
                        </div>
                      </div>

                      {/* Start/End Time Editing */}
                      <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-50">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[8px] font-black uppercase text-emerald-400 block mb-1">Start</label>
                            <div className="flex gap-1">
                              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-lg p-1.5 text-[10px]" />
                              <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-lg p-1.5 text-[10px]" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] font-black uppercase text-emerald-400 block mb-1">End</label>
                            <div className="flex gap-1">
                              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-lg p-1.5 text-[10px]" />
                              <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-1/2 bg-white border border-emerald-100 rounded-lg p-1.5 text-[10px]" />
                            </div>
                          </div>
                        </div>
                        {editTimeError && <div className="mt-2 text-[9px] text-red-500 font-black">{editTimeError}</div>}
                      </div>

                      <div className="bg-white rounded-2xl border border-emerald-50 p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-black uppercase text-emerald-400 block mb-1">Work (Min)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editWorkMinutes}
                              onChange={(e) => handleWorkMinutesChange(e.target.value)}
                              className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-xs font-black text-emerald-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-emerald-400 block mb-1">Rest (Min)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editRestMinutes}
                              onChange={(e) => handleRestMinutesChange(e.target.value)}
                              className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-xs font-black text-emerald-900 focus:outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[8px] text-emerald-500 uppercase tracking-[0.2em] font-black opacity-60">Updating these automatically adjusts the end time.</p>
                      </div>


                      <div className="flex gap-3 pt-4">
                        <button id="applyEditBtn" disabled={!isEditValid} onClick={handleSaveEdit} className={`flex-1 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-wider shadow-md ${isEditValid ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Apply</button>
                        <button onClick={() => { setIsEditMode(false); setPhaseEditTouched(false); }} className="flex-1 py-3.5 bg-emerald-50 text-emerald-600 rounded-[1.2rem] text-xs font-black uppercase tracking-wider">Cancel</button>
                      </div>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {phasePrompt && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[175] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative space-y-5 ring-1 ring-emerald-100/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <Clock size={20} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Phase Complete</p>
                <h3 className="text-xl font-black text-emerald-950 leading-tight">
                  {phasePrompt.kind === 'cycle-complete' ? 'Cycle Complete' : (phasePrompt.phase === 'work' ? 'Work phase finished' : 'Rest phase finished')}
                </h3>
              </div>
              <p className="text-xs text-emerald-500/80 text-center leading-relaxed px-2">
                {phasePrompt.kind === 'cycle-complete'
                  ? 'Work and rest are done. Save this log, continue it into another cycle, or roll straight into a fresh one.'
                  : phasePrompt.kind === 'reminder'
                    ? 'Ten minutes of overtime have passed. Decide whether to keep stretching this phase, move on, or wrap up.'
                    : 'The scheduled duration ended. Continue counting up, enter the next phase, or stop and save.'}
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <button 
                onClick={handleContinuePhase} 
                className="w-full py-3.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.97]"
              >
                Continue current phase
              </button>
              <button 
                onClick={handleNextPhaseFromPrompt} 
                className="w-full py-3.5 bg-white border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
              >
                {phasePrompt.phase === 'work' ? 'Go to rest' : 'Go to work'}
              </button>
              <button 
                onClick={handleExitAndSave} 
                className="w-full py-3.5 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-[0.97]"
              >
                Save & exit
              </button>
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-400/80 text-center px-4 leading-normal italic">
              {phasePrompt.kind === 'cycle-complete'
                ? 'Choose “Go to work” to set up the next block. We will ask if you want to keep this log rolling or start a new one.'
                : 'We will remind you again every 10 minutes while overtime stays active.'}
            </div>
          </div>
        </div>
      )}

      {showManualModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[160] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] scrollbar-none ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={() => setShowManualModal(false)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-xl font-black text-emerald-950 mb-7 tracking-tight">Add Session</h2>
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
                  <button disabled={!isManualLogValid} onClick={saveManualLog} className={`w-full py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl ${isManualLogValid ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-300 cursor-not-allowed'}`}>Save Entry</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {showLoggingModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button onClick={() => setShowLoggingModal(false)} className="absolute top-4 right-4 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-xl font-black text-emerald-950 mb-7 tracking-tight">Session Detail</h2>
               <div className="space-y-4">
                  <select value={currentTask.category} onChange={(e) => setCurrentTask({...currentTask, category: e.target.value as any})} className="w-full bg-emerald-50 border-none rounded-xl p-3 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea rows={3} placeholder="Reflect on this session..." value={currentTask.description} onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})} className="w-full bg-emerald-50 border-none rounded-2xl p-4 text-xs" />
                  
                  <div>
                    <label className="text-[9px] font-black uppercase text-emerald-400 block mb-3 tracking-[0.2em] pl-1">Photos ({currentTask.images.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {currentTask.images.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setCurrentTask({...currentTask, images: currentTask.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                        </div>
                      ))}
                      <label className="w-14 h-14 flex items-center justify-center bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 text-emerald-400 transition-colors shadow-inner">
                        <Plus size={20} />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                      </label>
                    </div>
                  </div>

                  <button onClick={() => setShowLoggingModal(false)} className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 mt-2 active:scale-[0.97] transition-all">Update Session</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {showSetupModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[170] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
             <div style={{ WebkitAppRegion: 'no-drag' } as any} className="scrollbar-none overflow-y-auto max-h-[80vh]">
               <button onClick={closeSettingsWithoutSaving} className="absolute top-0 right-0 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={18} /></button>
               <h2 className="text-xl font-black text-emerald-950 mb-7 tracking-tight flex items-center gap-3"><Settings size={22} className="text-emerald-500" /> Preferences</h2>
               <div className="space-y-6">
                  <section>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Clock size={14}/> Timer Intervals</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/30 p-4 rounded-[1.5rem] border border-emerald-50">
                          <label className="text-[8px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Focus (Min)</label>
                          <input type="text" value={tempWorkMin} onChange={(e) => setTempWorkMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-xs font-black text-emerald-900 outline-none" />
                        </div>
                        <div className="bg-emerald-50/30 p-4 rounded-[1.5rem] border border-emerald-50">
                          <label className="text-[8px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Rest (Min)</label>
                          <input type="text" value={tempRestMin} onChange={(e) => setTempRestMin(e.target.value.replace(/\D/g,''))} className="w-full bg-white border border-emerald-100 rounded-xl p-2.5 text-xs font-black text-emerald-900 outline-none" />
                        </div>
                     </div>
                  </section>
                  <section>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Palette size={14}/> Tag Colors</h3>
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
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><TimerIcon size={14}/> Notifications</h3>
                    <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                       <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${notificationPermission === 'granted' ? 'bg-emerald-50 text-emerald-600' : notificationPermission === 'denied' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                {notificationPermission === 'granted' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                                   {notificationPermission}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-tighter ${notificationPermission === 'denied' ? 'text-red-400' : 'text-emerald-400'}`}>
                                   {notificationPermission === 'granted' ? 'Active' : notificationPermission === 'denied' ? 'Blocked' : 'Request'}
                                </span>
                             </div>
                          </div>
                          <button 
                            onClick={() => requestNotificationPermission(true)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all ${notificationPermission === 'denied' ? 'bg-white border border-red-100 text-red-500' : 'bg-emerald-600 text-white'}`}
                          >
                             {notificationPermission === 'denied' ? 'Refresh' : notificationPermission === 'granted' ? 'Test' : 'Enable'}
                          </button>
                       </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Cloud size={14}/> GitLab Cloud Sync</h3>
                    <div className="bg-emerald-50/30 p-5 rounded-[2rem] border border-emerald-50 space-y-4">
                       <div className="space-y-3">
                          <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Globe size={12} /></div>
                             <input 
                                type="text" 
                                placeholder="GitLab URL (e.g. https://gitlab.com)"
                                value={gitlabConfig.url}
                                onChange={(e) => setGitlabConfig({...gitlabConfig, url: e.target.value})}
                                className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                             />
                          </div>
                          <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Key size={12} /></div>
                             <input 
                                type="password" 
                                placeholder="Personal Access Token"
                                value={gitlabConfig.token}
                                onChange={(e) => setGitlabConfig({...gitlabConfig, token: e.target.value})}
                                className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                             />
                          </div>
                          <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300"><Database size={12} /></div>
                             <input 
                                type="text" 
                                placeholder="Project Path or ID (e.g. username/repo)"
                                value={gitlabConfig.projectId}
                                onChange={(e) => setGitlabConfig({...gitlabConfig, projectId: e.target.value})}
                                className="w-full bg-white border border-emerald-100 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <input 
                                type="text" 
                                placeholder="Branch (main)"
                                value={gitlabConfig.branch}
                                onChange={(e) => setGitlabConfig({...gitlabConfig, branch: e.target.value})}
                                className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-[10px] font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                             />
                             <input 
                                type="text" 
                                placeholder="File (data.json)"
                                value={gitlabConfig.filename}
                                onChange={(e) => setGitlabConfig({...gitlabConfig, filename: e.target.value})}
                                className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-[10px] font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200"
                             />
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            disabled={isSyncing}
                            onClick={syncFromGitLab}
                            className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group disabled:opacity-50"
                          >
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14}/>}
                             </div>
                             <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Pull Restored</span>
                          </button>
                          <button 
                            disabled={isSyncing}
                            onClick={syncToGitLab}
                            className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group disabled:opacity-50"
                          >
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14}/>}
                             </div>
                             <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Push Sync</span>
                          </button>
                       </div>
                       
                       {lastSyncedAt && (
                         <p className="text-[7px] font-black uppercase text-emerald-400 tracking-widest text-center mt-2">
                           Last Cloud Sync: {lastSyncedAt}
                         </p>
                       )}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2"><Download size={14}/> Data Persistence</h3>
                    <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-50">
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={exportData}
                            className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 group"
                          >
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100"><Download size={14}/></div>
                             <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Backup</span>
                          </button>
                          <label 
                            className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 flex flex-col items-center gap-2 cursor-pointer hover:bg-emerald-50 transition-all active:scale-95 group"
                          >
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100"><Upload size={14}/></div>
                             <span className="text-[8px] font-black uppercase text-emerald-900 tracking-widest">Restore</span>
                             <input type="file" accept=".json" onChange={importData} className="hidden" />
                          </label>
                       </div>
                    </div>
                  </section>
                  <button onClick={handleApplySettings} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.97] transition-all text-[11px]">Save Preferences</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {pendingSettingsChange && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[210] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-7 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50 text-center" style={{ WebkitAppRegion: 'drag' } as any}>
            <div style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-4">
                <Clock size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-emerald-950 mb-2 tracking-tight">Update Timer?</h2>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500 mb-3">Session in progress</p>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6">
                {pendingSettingsChange.workDuration / 60}m · {pendingSettingsChange.restDuration / 60}m
              </p>
              <div className="space-y-3">
                <button onClick={() => handleSettingsSaveDecision(true)} className="w-full py-3.5 bg-emerald-600 text-white font-black uppercase tracking-[0.15em] rounded-2xl shadow-lg active:scale-[0.97] transition-all text-xs">Save & Restart</button>
                <button onClick={() => handleSettingsSaveDecision(false)} className="w-full py-3.5 bg-white border border-emerald-100 text-emerald-700 font-black uppercase tracking-[0.15em] rounded-2xl shadow-sm active:scale-[0.97] transition-all text-xs">Keep current</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInspirationModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/60 backdrop-blur-xl'} flex items-center justify-center p-6 z-[190] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
            <div style={{ WebkitAppRegion: 'no-drag' } as any} className="scrollbar-none overflow-y-auto max-h-[85vh]">
              <button 
                onClick={() => setShowInspirationModal(false)} 
                className="absolute top-0 right-0 p-2 bg-emerald-50 rounded-full text-emerald-300 hover:text-emerald-600 transition-all active:scale-90 z-50"
              ><X size={18} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-sm">
                  <Quote size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-emerald-950 tracking-tight">
                    {selectedInspiration ? 'Edit Insight' : 'New Musing'}
                  </h2>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Eternal Wisdom</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Title or Source</label>
                  <input 
                    type="text" 
                    value={selectedInspiration ? selectedInspiration.title : newInspiration.title}
                    onChange={(e) => {
                      if (selectedInspiration) {
                        setSelectedInspiration({ ...selectedInspiration, title: e.target.value });
                      } else {
                        setNewInspiration({ ...newInspiration, title: e.target.value });
                      }
                    }}
                    placeholder="Marcus Aurelius, Meditations..." 
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200" 
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Reflection</label>
                  <textarea 
                    value={selectedInspiration ? selectedInspiration.content : newInspiration.content}
                    onChange={(e) => {
                      if (selectedInspiration) {
                        setSelectedInspiration({ ...selectedInspiration, content: e.target.value });
                      } else {
                        setNewInspiration({ ...newInspiration, content: e.target.value });
                      }
                    }}
                    placeholder="What echoes in your mind today?" 
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/10 h-40 resize-none leading-relaxed placeholder:text-emerald-200"
                  />
                </div>

                <div>
                   <label className="text-[9px] font-black uppercase text-emerald-400 block mb-2 tracking-widest pl-1">Reference Link (Optional)</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300"><Link size={14} /></div>
                      <input 
                        type="text" 
                        value={selectedInspiration ? selectedInspiration.url : newInspiration.url}
                        onChange={(e) => {
                          if (selectedInspiration) {
                            setSelectedInspiration({ ...selectedInspiration, url: e.target.value });
                          } else {
                            setNewInspiration({ ...newInspiration, url: e.target.value });
                          }
                        }}
                        placeholder="https://..." 
                        className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-emerald-200" 
                      />
                   </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedInspiration && (
                    <button 
                      onClick={() => {
                        setInspirations(prev => prev.filter(i => i.id !== selectedInspiration.id));
                        setShowInspirationModal(false);
                      }}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (selectedInspiration) {
                        setInspirations(prev => prev.map(i => i.id === selectedInspiration.id ? selectedInspiration : i));
                      } else {
                        if (!newInspiration.content.trim()) return;
                        setInspirations(prev => [{ 
                          id: Date.now().toString(), 
                          title: newInspiration.title.trim(), 
                          content: newInspiration.content.trim(),
                          url: newInspiration.url.trim(),
                          date: Date.now()
                        }, ...prev]);
                      }
                      setShowInspirationModal(false);
                    }}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all text-xs"
                  >
                    {selectedInspiration ? 'Update Insight' : 'Preserve Idea'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className={`fixed inset-0 ${(wasMiniModeBeforeModal || isMiniMode) ? 'bg-transparent' : 'bg-emerald-900/70 backdrop-blur-xl'} flex items-center justify-center p-6 z-[180] animate-in fade-in duration-300`}>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl ring-1 ring-emerald-100/50" style={{ WebkitAppRegion: 'drag' } as any}>
            <div style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 text-red-500 shadow-inner`}><AlertCircle size={32} /></div>
              <h2 className="text-xl font-black mb-1 text-emerald-950 tracking-tight">End Session?</h2>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-7">Save or discard your progress</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => confirmAction(true)} className="w-full py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-lg bg-emerald-600 text-white active:scale-[0.97] text-xs">Save Activity</button>
                <button onClick={() => confirmAction(false)} className="w-full py-3.5 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-[0.97] text-xs">Discard</button>
                <button onClick={() => setShowConfirmModal(null)} className="py-2 text-emerald-300 font-black text-[9px] uppercase tracking-[0.4em] mt-1 hover:text-emerald-500 transition-colors">Go Back</button>
              </div>
              <p className="text-[9px] text-emerald-400/60 font-medium px-4 mt-6">Work time under 1 minute will be automatically discarded.</p>
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
