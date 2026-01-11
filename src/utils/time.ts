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
  return new Date(timestamp).toISOString().split('T')[0];
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

export const resolvePhaseTotals = (log: { duration: number; phaseDurations?: { work: number; rest: number } }) => {
  const hasPhase = Boolean(log.phaseDurations);
  const work = log.phaseDurations?.work ?? (hasPhase ? 0 : log.duration);
  const rest = log.phaseDurations?.rest ?? 0;
  const total = work + rest;
  return {
    work,
    rest,
    total: total > 0 ? total : log.duration,
  };
};

export const pad2 = (n: number) => n.toString().padStart(2, '0');
