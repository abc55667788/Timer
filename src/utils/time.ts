export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatClock = (timestamp: number, zoom: number = 1) => {
  const date = new Date(timestamp);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  // When zoom is very small, only show hour (no ":00"). Use 0.3 (30%) threshold per spec.
  return zoom < 0.3 ? `${h}` : `${h}:${m}`;
};

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

export const formatDisplayDateString = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  return `${parts[0]}.${parseInt(parts[1])}.${parseInt(parts[2])}`;
};

export const resolvePhaseTotals = (log: { duration: number; startTime: number; endTime?: number; phaseDurations?: { work: number; rest: number } }) => {
  const hasPhase = Boolean(log.phaseDurations);
  let work = log.phaseDurations?.work ?? (hasPhase ? 0 : log.duration);
  let rest = log.phaseDurations?.rest ?? 0;
  
  // Robustness check: if duration seems like minutes but endTime/startTime shows seconds
  if (log.endTime && log.startTime) {
    const diffSeconds = Math.round((log.endTime - log.startTime) / 1000);
    // If the difference is roughly 60 times larger than the stored duration,
    // it's highly likely duration was stored in minutes incorrectly.
    if (diffSeconds > log.duration * 50 && diffSeconds < log.duration * 70) {
      work = diffSeconds;
      rest = 0;
    } else if (diffSeconds > (work + rest) * 1.5) {
      // General case: if the gap is significantly larger, trust the timestamps
      work = diffSeconds - rest; 
    }
  }

  const total = work + rest;
  return {
    work,
    rest,
    total: total > 0 ? total : log.duration,
  };
};

export const pad2 = (n: number) => n.toString().padStart(2, '0');
