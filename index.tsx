
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './index.css';
import { 
  Play, BarChart3, Clock, BookOpen, 
  X, Maximize2, Minimize2, Minus, Settings, Square, Copy
} from 'lucide-react';
// Recharts moved to StatsBoard.tsx
import {
  Category,
  LogEntry,
  TimerPhase,
  PhasePromptKind,
  StatsView,
  ViewMode,
  NotificationStatus,
  CATEGORY_ICONS,
  DEFAULT_CATEGORIES,
  APP_LOGO,
  Goal,
  Inspiration,
  CategoryData
} from './src/types';
import { formatTime, formatClock, formatDate, formatDisplayDate, formatDisplayDateString, resolvePhaseTotals, pad2 } from './src/utils/time';
import { compressImage } from './src/utils/media';
import { playBeep, triggerSystemNotification } from './src/utils/notifications';
import MiniCalendar from './src/components/MiniCalendar';
import useStats from './src/hooks/useStats';
import TimerBoard from './src/components/boards/TimerBoard';
import StatsBoard from './src/components/boards/StatsBoard';
import LogsBoard from './src/components/boards/LogsBoard';
import JournalBoard from './src/components/boards/JournalBoard';
import SetupModal from './src/components/modals/SetupModal';
import LoggingModal from './src/components/modals/LoggingModal';
import ManualLogModal from './src/components/modals/ManualLogModal';
import ViewLogModal from './src/components/modals/ViewLogModal';
import InspirationModal from './src/components/modals/InspirationModal';
import ConfirmModal from './src/components/modals/ConfirmModal';
import PhasePromptModal from './src/components/modals/PhasePromptModal';
import PendingSettingsModal from './src/components/modals/PendingSettingsModal';
import LogContinuationModal from './src/components/modals/LogContinuationModal';
import MiniMode from './src/components/MiniMode';

const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    try { await Haptics.impact({ style }); } catch (e) { /* ignore */ }
  }
};

// --- Main App Component ---
function EmeraldTimer() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'logs' | 'settings'>('timer');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [isActive, setIsActive] = useState(false);
  const [isPausedBySettings, setIsPausedBySettings] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const sessionPhaseDurationsRef = useRef<{ work: number; rest: number }>({ work: 0, rest: 0 });
  const phaseRef = useRef<TimerPhase>(phase);
  const resetSessionPhaseDurations = () => { sessionPhaseDurationsRef.current = { work: 0, rest: 0 }; };
  
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

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    if ((window as any).electron) {
      (window as any).electron.windowControl(action);
    }
  };

  // --- Window Resize for Mini Mode ---
  useEffect(() => {
    if ((window as any).electron) {
      (window as any).electron.toggleMiniMode(isMiniMode);
    }
  }, [isMiniMode]);

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

  // When a modal is forced open from mini mode, hide the shell so only the prompt is visible
  const hideShellForMiniPrompt = wasMiniModeBeforeModal && showLogContinuationPrompt;

  const [tempWorkMin, setTempWorkMin] = useState('25');
  const [tempRestMin, setTempRestMin] = useState('5');

  // Dynamic Categories State
  const [categories, setCategories] = useState<CategoryData[]>(() => {
    const saved = localStorage.getItem('emerald-categories');
    if (saved) return JSON.parse(saved);
    return DEFAULT_CATEGORIES;
  });

  const getCategoryColor = (catName: Category) => {
    const cat = categories.find(c => c.name === catName);
    if (cat) return cat.color;
    // Fallback search in DEFAULT_CATEGORIES if not found in current ones
    const defCat = DEFAULT_CATEGORIES.find(c => c.name === catName);
    return defCat ? defCat.color : '#10b981';
  };

  const getCategoryIcon = (catName: Category) => {
    const cat = categories.find(c => c.name === catName);
    const iconKey = cat ? cat.icon : (DEFAULT_CATEGORIES.find(c => c.name === catName)?.icon || 'Briefcase');
    return CATEGORY_ICONS[iconKey as keyof typeof CATEGORY_ICONS];
  };

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

  const [inspirations, setInspirations] = useState<Inspiration[]>(() => {
    const saved = localStorage.getItem('emerald-inspirations');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newInspiration, setNewInspiration] = useState({ title: '', content: '', url: '', images: [] as string[] });

  const [gitlabConfig, setGitlabConfig] = useState(() => {
    const saved = localStorage.getItem('emerald-gitlab-config');
    return saved ? JSON.parse(saved) : { token: '', projectId: '', branch: 'main', filename: 'emerald-timer-data.json', url: 'https://gitlab.com' };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => localStorage.getItem('emerald-last-synced') || '');

  const [uiScale, setUiScale] = useState(() => {
    const saved = localStorage.getItem('emerald-ui-scale');
    if (saved) return parseFloat(saved);
    
    // PC version defaults to 130% (1.3), Mobile defaults to 100% (1.0)
    const isMobile = Capacitor.getPlatform() === 'android' || /Android/i.test(navigator.userAgent);
    return isMobile ? 1.0 : 1.3;
  });

  const [noticeMessage, setNoticeMessage] = useState('');
  const showNotice = (msg: string, duration = 2000) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(''), duration);
  };

  const isAndroid = useMemo(() => {
    return Capacitor.getPlatform() === 'android' || /Android/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    localStorage.setItem('emerald-ui-scale', uiScale.toString());
    // On Android, we should usually avoid global CSS zoom as it can mess with keyboard/touch events differently than Electron
    if (isAndroid) {
      if (document.body.style.zoom) (document.body.style as any).zoom = 1.0;
      // Prevent browser default touch behaviors on mobile that might zoom in/out
      document.documentElement.style.touchAction = 'pan-x pan-y';
    } else {
      (document.body.style as any).zoom = isMiniMode ? 1.0 : uiScale;
      // Force background to be transparent in Mini Mode to prevent corner bleed
      if (isMiniMode) {
        document.body.style.backgroundColor = 'transparent';
        if (document.getElementById('root')) (document.getElementById('root') as any).style.backgroundColor = 'transparent';
      }
    }
  }, [uiScale, isMiniMode, isAndroid]);

  // Handle global wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setUiScale(prev => {
          const next = Math.min(2.0, Math.max(0.5, prev + delta));
          return Math.round(next * 100) / 100;
        });
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const [phasePrompt, setPhasePrompt] = useState<{ phase: TimerPhase; kind: PhasePromptKind } | null>(null);
  const REMINDER_INTERVAL = 10 * 60;
  const [nextReminderAt, setNextReminderAt] = useState(REMINDER_INTERVAL);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [pendingSettingsChange, setPendingSettingsChange] = useState<{ workDuration: number; restDuration: number } | null>(null);

  // Exit mini mode when opening modals or editing, and restore it when done
  useEffect(() => {
    const isAnyModalOpen = !!(showLoggingModal || showManualModal || showConfirmModal || showLogContinuationPrompt || viewingLog || phasePrompt || showInspirationModal || pendingSettingsChange);
    if (isMiniMode && isAnyModalOpen) {
      setWasMiniModeBeforeModal(true);
      setIsMiniMode(false);
    } else if (!isAnyModalOpen && wasMiniModeBeforeModal) {
      setIsMiniMode(true);
      setWasMiniModeBeforeModal(false);
    }
  }, [showLoggingModal, showManualModal, showConfirmModal, showLogContinuationPrompt, viewingLog, phasePrompt, showInspirationModal, pendingSettingsChange, isMiniMode, wasMiniModeBeforeModal]);

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
    localStorage.setItem('emerald-categories', JSON.stringify(categories));
  }, [categories]);

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
      triggerAppNotification(title, body);
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

  const triggerAppNotification = (title: string, body: string) => {
    triggerSystemNotification(title, body, setNotificationPermission);
  };

  useEffect(() => {
    if (!phasePrompt || phasePrompt.kind !== 'reminder') return;
    const title = phasePrompt.phase === 'work' ? 'Work session reminder' : 'Rest session reminder';
    const body = 'Ten minutes have passed in overtime — continue, switch phases, or wrap up.';
    triggerAppNotification(title, body);
  }, [phasePrompt]);

  const handleStart = () => {
    triggerHaptic(ImpactStyle.Medium);
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

  const basePhaseDuration = phase === 'work' ? settings.workDuration : settings.restDuration;
  const displayTime = timeLeft > 0 ? timeLeft : basePhaseDuration + overtimeSeconds;
  const isCurrentlyRecording = isActive || isOvertime || (timeLeft < basePhaseDuration);

  useEffect(() => {
    if (!isAndroid) return;
    
    const updateNotification = async () => {
      try {
        if (isActive) {
          const body = `Emerald Timer: ${phase === 'work' ? 'Focus' : 'Rest'} — ${formatTime(displayTime)} ${isOvertime ? '+' + formatTime(overtimeSeconds) : ''}`;
          await LocalNotifications.schedule({
            notifications: [{
              id: 999,
              title: "Timer active",
              body: body,
              ongoing: true, // This keeps it there
              smallIcon: 'ic_stat_icon_config_sample'
            }]
          });
        } else {
          await LocalNotifications.cancel({ notifications: [{ id: 999 }] });
        }
      } catch (e) {
        console.warn("Failed to update ongoing notification", e);
      }
    };
    
    const interval = setInterval(updateNotification, 5000);
    updateNotification();
    
    return () => {
      clearInterval(interval);
      if (isAndroid) LocalNotifications.cancel({ notifications: [{ id: 999 }] }).catch(() => {});
    };
  }, [isActive, phase, displayTime, isOvertime, overtimeSeconds, isAndroid]);

  const handleStopClick = () => {
    triggerHaptic(ImpactStyle.Heavy);
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
    setActiveTab('settings');
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
    triggerHaptic(ImpactStyle.Medium);
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
    triggerHaptic(ImpactStyle.Light);
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
    
    if (activeTab === 'settings') {
      showNotice('Preferences Saved Successfully!', 1500);
    } else {
      setActiveTab('timer');
    }

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
    setActiveTab('timer');
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

  const handleSwapMainImage = useCallback((logId: string, imageUri: string) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId) {
        const index = log.images.indexOf(imageUri);
        if (index > 0) {
          const newImages = [...log.images];
          const temp = newImages[0];
          newImages[0] = newImages[index];
          newImages[index] = temp;
          return { ...log, images: newImages };
        }
      }
      return log;
    }));
  }, [setLogs]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'current' | 'manual' | 'edit' | 'inspiration') => {
    const files = Array.from(e.target.files || []) as File[];
    const promises = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve((ev.target?.result as string) || '');
      reader.readAsDataURL(file);
    }).then(base64 => compressImage(base64)));

    Promise.all(promises).then(compressedBase64s => {
      if (target === 'current') setCurrentTask(prev => ({ ...prev, images: [...prev.images, ...compressedBase64s] }));
      else if (target === 'manual') setManualLog(prev => ({ ...prev, images: [...prev.images, ...compressedBase64s] }));
      else if (target === 'edit') setViewingLog(prev => prev ? ({ ...prev, images: [...prev.images, ...compressedBase64s] }) : null);
      else if (target === 'inspiration') {
        if (selectedInspiration) setSelectedInspiration(prev => prev ? ({ ...prev, images: [...(prev.images || []), ...compressedBase64s] }) : null);
        else setNewInspiration(prev => ({ ...prev, images: [...(prev.images || []), ...compressedBase64s] }));
      }
    });
  };

  const handleClipboardImagePaste = (e: React.ClipboardEvent) => {
    const target = showInspirationModal ? 'inspiration' : (viewingLog && isEditMode ? 'edit' : null);
    if (!target) return;
    
    const items = Array.from((e as any).clipboardData?.items || []) as DataTransferItem[];
    const imageItems = items.filter(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItems.length === 0) return;
    
    e.preventDefault();
    const fileToBase64 = imageItems.map(item => new Promise<string>((resolve) => {
      const file = item.getAsFile();
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (loadEvent) => resolve((loadEvent.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }));

    Promise.all(fileToBase64)
      .then(base64List => base64List.filter(Boolean) as string[])
      .then(validBase64s => Promise.all(validBase64s.map(base64 => compressImage(base64))))
      .then(pastedImages => {
        if (!pastedImages.length) return;
        if (target === 'edit') setViewingLog(prev => prev ? ({ ...prev, images: [...prev.images, ...pastedImages] }) : null);
        else if (target === 'inspiration') {
          if (selectedInspiration) setSelectedInspiration(prev => prev ? ({ ...prev, images: [...(prev.images || []), ...pastedImages] }) : null);
          else setNewInspiration(prev => ({ ...prev, images: [...(prev.images || []), ...pastedImages] }));
        }
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
    const data = JSON.stringify({ logs, settings, categories, goals, inspirations });
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
        if (parsed.categories) {
          setCategories(parsed.categories);
        } else if (parsed.categoryColors) {
          // Compatibility: Migrate old categoryColors to new categories format
          const migrated = DEFAULT_CATEGORIES.map(def => ({
            ...def,
            color: parsed.categoryColors[def.name] || def.color
          }));
          setCategories(migrated);
        }
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
        categories, 
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
      if (parsed.categories) {
        setCategories(parsed.categories);
      } else if (parsed.categoryColors) {
        // Compatibility: Migrate old categoryColors to new categories format
        const migrated = DEFAULT_CATEGORIES.map(def => ({
          ...def,
          color: parsed.categoryColors[def.name] || def.color
        }));
        setCategories(migrated);
      }
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

  const {
    relevantLogs,
    statsData,
    weekHistory,
    monthHistory,
    yearHistory,
    yearMonthStats,
    calendarGridData,
    timelineRange,
    restTimeTotal
  } = useStats(logs, selectedStatsDate, statsView, categories);

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

  useEffect(() => {
    // Show splash briefly to mask OS window creation
    setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-[#f0f9f0] flex flex-col items-center justify-center z-[500] animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200/50 mb-8 scale-110 animate-pulse border-4 border-emerald-50">
          <img src={APP_LOGO} alt="Emerald Timer" className="w-14 h-14 object-contain" />
        </div>
        <div className="flex flex-col items-center gap-2">
           <h2 className="text-xl font-black text-emerald-800 tracking-tighter">Emerald Timer</h2>
           <div className="w-16 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full" style={{ animation: 'loading 1.2s infinite ease-in-out' }} />
           </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className={` ${(isMiniMode || wasMiniModeBeforeModal) ? 'bg-transparent' : 'bg-white'} text-emerald-900 flex flex-col overflow-hidden`}
      style={isMiniMode ? { 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0', // Full screen padding should be 0 for MiniMode to prevent background artifacts
        background: 'transparent'
      } : { 
        height: `${(1 / uiScale) * 100}vh`, 
        width: `${(1 / uiScale) * 100}vw`,
        transformOrigin: 'top left' 
      }}
    >
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
      {showLogContinuationPrompt && (
        <LogContinuationModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          handleCancelLogChoice={handleCancelLogChoice}
          continuationDescription={continuationDescription}
          handleContinueCurrentLog={handleContinueCurrentLog}
          continueButtonLabel={continueButtonLabel}
          handleStartNewLog={handleStartNewLog}
          startNewButtonLabel={startNewButtonLabel}
          continuationNote={continuationNote}
        />
      )}

      {!isMiniMode && !wasMiniModeBeforeModal && (
        <header className="w-full h-16 flex justify-between items-center px-6 flex-shrink-0 bg-[#f0f9f0]/40 backdrop-blur-sm border-b border-emerald-50/50 animate-in fade-in slide-in-from-top-12 duration-500 ease-out" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 overflow-hidden border border-emerald-50">
              <img src={APP_LOGO} alt="Emerald Timer Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-emerald-800 tracking-tight">Emerald Timer</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSetupClick} className="p-2 bg-white rounded-xl border border-emerald-100 hover:bg-emerald-50 text-emerald-600 shadow-sm transition-all active:scale-95" style={{ WebkitAppRegion: 'no-drag' } as any} title="Settings">
              <Settings size={18} />
            </button>
            <button onClick={() => setIsMiniMode(true)} className="p-2 bg-white rounded-xl border border-emerald-100 hover:bg-emerald-50 text-emerald-600 flex items-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <Minimize2 size={16} /> <span className="hidden sm:inline">Mini Mode</span>
            </button>

            {/* Window Controls Group - Hide on Android */}
            {!isAndroid && (
              <div className="flex items-center gap-0.5 ml-2 pl-4 border-l border-emerald-100/30">
                <button 
                  onClick={() => handleWindowControl('minimize')} 
                  className="p-2.5 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all rounded-xl" 
                  style={{ WebkitAppRegion: 'no-drag' } as any} 
                  title="Minimize"
                >
                  <Minus size={18} />
                </button>
                <button 
                  onClick={() => handleWindowControl('maximize')} 
                  className="p-2.5 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all rounded-xl" 
                  style={{ WebkitAppRegion: 'no-drag' } as any} 
                  title="Maximize"
                >
                  <Copy size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => handleWindowControl('close')} 
                  className="p-2.5 text-emerald-300 hover:bg-red-500 hover:text-white transition-all rounded-xl ml-1" 
                  style={{ WebkitAppRegion: 'no-drag' } as any} 
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {!hideShellForMiniPrompt && isMiniMode && (
        <MiniMode
          phase={phase}
          currentTask={currentTask}
          setIsMiniMode={setIsMiniMode}
          setIsJournalOpen={setIsJournalOpen}
          setActiveTab={setActiveTab}
          formatTime={formatTime}
          displayTime={displayTime}
          isOvertime={isOvertime}
          overtimeSeconds={overtimeSeconds}
          setShowLoggingModal={setShowLoggingModal}
          isCurrentlyRecording={isCurrentlyRecording}
          handleStopClick={handleStopClick}
          handleSkipToNextPhase={handleSkipToNextPhase}
          handleStart={handleStart}
          isActive={isActive}
          timeLeft={timeLeft}
          settings={settings}
        />
      )}

      {!hideShellForMiniPrompt && !isMiniMode && !wasMiniModeBeforeModal && (
        <main className="w-full bg-white flex flex-col flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-500 ease-out">
          <nav className="flex border-b border-emerald-50 bg-emerald-50/20 px-4 flex-shrink-0">
            {[
              { id: 'timer', icon: Play, label: 'Focus' },
              { id: 'stats', icon: BarChart3, label: 'Analytics' },
              { id: 'logs', icon: Clock, label: 'History' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-tight relative transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-700' : 'text-emerald-300 hover:text-emerald-500'}`}
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-emerald-100 scale-110 shadow-sm' : ''}`}>
                  <tab.icon size={18} />
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-emerald-600 rounded-t-full shadow-[0_-4px_12px_rgba(5,150,105,0.4)] animate-in fade-in duration-300" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'timer' && (
              <div className="flex h-full w-full overflow-hidden relative animate-in fade-in duration-200">
                <div className={`flex-1 transition-all duration-500 ease-in-out ${isJournalOpen ? 'md:mr-[400px]' : 'mr-0'}`}>
                  <TimerBoard 
                    phase={phase}
                    isActive={isActive}
                    timeLeft={timeLeft}
                    settings={settings}
                    displayTime={displayTime}
                    isOvertime={isOvertime}
                    overtimeSeconds={overtimeSeconds}
                    currentTask={currentTask}
                    isCurrentlyRecording={isCurrentlyRecording}
                    handleStart={handleStart}
                    handleStopClick={handleStopClick}
                    handleSkipToNextPhase={handleSkipToNextPhase}
                    handleSetupClick={handleSetupClick}
                    setShowLoggingModal={setShowLoggingModal}
                    isJournalOpen={isJournalOpen}
                    setIsJournalOpen={setIsJournalOpen}
                  />
                </div>
                
                {/* Journal Sidebar Overlay for Timer View */}
                <div className={`absolute top-0 right-0 h-full z-40 transition-all duration-500 ease-in-out ${isJournalOpen ? 'translate-x-0 w-full sm:w-[400px] opacity-100' : 'translate-x-[100%] w-full sm:w-[400px] opacity-0 pointer-events-none'}`}>
                  <JournalBoard 
                    goals={goals}
                    setGoals={setGoals}
                    newGoalText={newGoalText}
                    setNewGoalText={setNewGoalText}
                    inspirations={inspirations}
                    setNewInspiration={setNewInspiration}
                    setSelectedInspiration={setSelectedInspiration}
                    setShowInspirationModal={setShowInspirationModal}
                    setPreviewImage={setPreviewImage}
                    onClose={() => setIsJournalOpen(false)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flex-1 p-4 md:p-6 h-full overflow-y-auto scrollbar-none animate-in fade-in duration-200">
                <StatsBoard 
                  logs={logs}
                  statsView={statsView}
                  viewMode={viewMode}
                  selectedStatsDate={selectedStatsDate}
                  isCalendarCollapsed={isCalendarCollapsed}
                  dayViewMode={dayViewMode}
                  timelineZoom={timelineZoom}
                  setSelectedStatsDate={setSelectedStatsDate}
                  setStatsView={setStatsView}
                  setIsCalendarCollapsed={setIsCalendarCollapsed}
                  setDayViewMode={setDayViewMode}
                  setTimelineZoom={setTimelineZoom}
                  setViewMode={setViewMode}
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  handleTimelineWheel={handleTimelineWheel}
                  handleTimelineMouseDown={handleTimelineMouseDown}
                  handleTimelineMouseMove={handleTimelineMouseMove}
                  handleTimelineMouseUpLeave={handleTimelineMouseUpLeave}
                  handleViewLog={handleViewLog}
                  getCategoryColor={getCategoryColor}
                  getCategoryIcon={getCategoryIcon}
                  setPreviewImage={setPreviewImage}
                  setActiveTab={setActiveTab}
                  handleSwapMainImage={handleSwapMainImage}
                  statsData={statsData}
                  weekHistory={weekHistory}
                  monthHistory={monthHistory}
                  yearHistory={yearHistory}
                  yearMonthStats={yearMonthStats}
                  calendarGridData={calendarGridData}
                  timelineRange={timelineRange}
                  selectedDayLogs={selectedDayLogs}
                  relevantLogs={relevantLogs}
                  timelineRef={timelineRef}
                  MIN_ZOOM={MIN_ZOOM}
                  MAX_ZOOM={MAX_ZOOM}
                  restTimeTotal={restTimeTotal}
                />
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex-1 p-4 md:p-6 h-full overflow-y-auto scrollbar-none animate-in fade-in duration-200">
                <LogsBoard 
                  filteredLogs={filteredLogs}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStartDate={filterStartDate}
                  setFilterStartDate={setFilterStartDate}
                  filterEndDate={filterEndDate}
                  setFilterEndDate={setFilterEndDate}
                  setShowManualModal={setShowManualModal}
                  handleViewLog={handleViewLog}
                  getCategoryColor={getCategoryColor}
                  getCategoryIcon={getCategoryIcon}
                  setPreviewImage={setPreviewImage}
                  categories={categories}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex-1 h-full animate-in fade-in duration-200">
                <SetupModal 
                  wasMiniModeBeforeModal={false}
                  isMiniMode={false}
                  tempWorkMin={tempWorkMin}
                  tempRestMin={tempRestMin}
                  setTempWorkMin={setTempWorkMin}
                  setTempRestMin={setTempRestMin}
                  categories={categories}
                  setCategories={setCategories}
                  notificationPermission={notificationPermission}
                  requestNotificationPermission={requestNotificationPermission}
                  gitlabConfig={gitlabConfig}
                  setGitlabConfig={setGitlabConfig}
                  isSyncing={isSyncing}
                  syncFromGitLab={syncFromGitLab}
                  syncToGitLab={syncToGitLab}
                  lastSyncedAt={lastSyncedAt}
                  exportData={exportData}
                  importData={importData}
                  handleApplySettings={handleApplySettings}
                  closeSettingsWithoutSaving={() => setActiveTab('timer')}
                  uiScale={uiScale}
                  setUiScale={setUiScale}
                  isPage={true}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* --- Modals --- */}
      {viewingLog && (
        <ViewLogModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          viewingLog={viewingLog}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          handleClipboardImagePaste={handleClipboardImagePaste}
          getCategoryColor={getCategoryColor}
          formatDisplayDate={formatDisplayDate}
          setViewingLog={setViewingLog}
          formatTime={formatTime}
          formatClock={formatClock}
          setPreviewImage={setPreviewImage}
          handleDeleteLog={handleDeleteLog}
          handleImageUpload={handleImageUpload}
          editStartDate={editStartDate}
          setEditStartDate={setEditStartDate}
          editStartTime={editStartTime}
          setEditStartTime={setEditStartTime}
          editEndDate={editEndDate}
          setEditEndDate={setEditEndDate}
          editEndTime={editEndTime}
          setEditEndTime={setEditEndTime}
          editTimeError={editTimeError}
          editWorkMinutes={editWorkMinutes}
          handleWorkMinutesChange={handleWorkMinutesChange}
          editRestMinutes={editRestMinutes}
          handleRestMinutesChange={handleRestMinutesChange}
          isEditValid={isEditValid}
          handleSaveEdit={handleSaveEdit}
          setPhaseEditTouched={setPhaseEditTouched}
          viewingLogMetadata={viewingLogMetadata}
          categories={categories}
        />
      )}

      {phasePrompt && (
        <PhasePromptModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          phasePrompt={phasePrompt}
          setPhasePrompt={setPhasePrompt}
          handleContinuePhase={handleContinuePhase}
          handleNextPhaseFromPrompt={handleNextPhaseFromPrompt}
          handleExitAndSave={handleExitAndSave}
        />
      )}

      {showManualModal && (
        <ManualLogModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          manualLog={manualLog}
          setManualLog={setManualLog}
          manualLogError={manualLogError}
          categories={categories}
          handleImageUpload={handleImageUpload}
          saveManualLog={saveManualLog}
          setShowManualModal={setShowManualModal}
          isManualLogValid={isManualLogValid}
          setPreviewImage={setPreviewImage}
        />
      )}

      {showLoggingModal && (
        <LoggingModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          loggingData={currentTask}
          setLoggingData={setCurrentTask}
          tempWorkMin={tempWorkMin}
          tempRestMin={tempRestMin}
          setTempWorkMin={setTempWorkMin}
          setTempRestMin={setTempRestMin}
          categories={categories}
          handleImageUpload={handleImageUpload}
          setShowLoggingModal={setShowLoggingModal}
          handleApplySettings={handleApplySettings}
        />
      )}

      {pendingSettingsChange && (
        <PendingSettingsModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          pendingSettingsChange={pendingSettingsChange}
          handleSettingsSaveDecision={handleSettingsSaveDecision}
        />
      )}

      {showInspirationModal && (
        <InspirationModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          selectedInspiration={selectedInspiration}
          newInspiration={newInspiration}
          setNewInspiration={setNewInspiration}
          setSelectedInspiration={setSelectedInspiration}
          setShowInspirationModal={setShowInspirationModal}
          setInspirations={setInspirations}
          handleImageUpload={handleImageUpload}
          handleClipboardImagePaste={handleClipboardImagePaste}
          setPreviewImage={setPreviewImage}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          wasMiniModeBeforeModal={wasMiniModeBeforeModal}
          isMiniMode={isMiniMode}
          setShowConfirmModal={setShowConfirmModal}
          confirmAction={confirmAction}
        />
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-xl" style={{ WebkitAppRegion: 'no-drag' } as any}><X size={32}/></button>
          <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10" />
        </div>
      )}

      {noticeMessage && (
        <div className={`fixed ${isMiniMode ? 'bottom-4 scale-90' : 'bottom-8'} left-1/2 -translate-x-1/2 z-[320] bg-emerald-900 text-white px-5 py-2.5 rounded-full shadow-lg text-[11px] font-bold tracking-tight animate-in fade-in duration-200 whitespace-nowrap`}>
          {noticeMessage}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<EmeraldTimer />);
