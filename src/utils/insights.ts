
import { LogEntry, Inspiration, CategoryData } from '../types';
import { formatDate } from './time';

export interface Insight {
  id: string;
  type: 'stat' | 'greeting' | 'inspiration' | 'holiday';
  text: string;
  icon?: string;
}

const HOLIDAYS = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 1, day: 14, name: "Valentine's Day" },
  { month: 4, day: 1, name: "Labor Day" },
  { month: 11, day: 25, name: "Christmas" },
  { month: 11, day: 31, name: "New Year's Eve" },
];

export const generateInsights = (
  logs: LogEntry[],
  inspirations: Inspiration[],
  categories: CategoryData[]
): Insight[] => {
  const insights: Insight[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  // 1. Greeting
  const greeting = 
    currentHour < 5 ? "Early bird or late owl? Take care of your rest." :
    currentHour < 12 ? "Good morning! Ready for a productive session?" :
    currentHour < 14 ? "Mid-day check-in. How's your energy level?" :
    currentHour < 18 ? "Keep up the good work this afternoon!" :
    currentHour < 22 ? "Evening focus. Slow down before bed." :
    "Winding down for the day. Rest is part of the work.";
  
  insights.push({ id: 'greeting', type: 'greeting', text: greeting });

  // 2. Holiday
  const currentHoliday = HOLIDAYS.find(h => h.month === now.getMonth() && h.day === now.getDate());
  if (currentHoliday) {
    insights.push({ 
      id: 'holiday', 
      type: 'holiday', 
      text: `Happy ${currentHoliday.name}! Don't forget to enjoy the moment.` 
    });
  }

  // 3. Stats - Peak Productivity
  if (logs.length > 5) {
    const hourCounts: Record<number, number> = {};
    logs.forEach(log => {
      const hour = new Date(log.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      const h = parseInt(peakHour[0]);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      insights.push({ 
        id: 'peak-hour', 
        type: 'stat', 
        text: `You seem most active around ${displayHour} ${ampm}. Leverage your peak energy!` 
      });
    }
  }

  // 4. Stats - Weekly Average
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const lastWeekLogs = logs.filter(l => new Date(l.startTime) >= sevenDaysAgo);
  if (lastWeekLogs.length > 0) {
    const totalMinutes = lastWeekLogs.reduce((acc, log) => {
        const duration = log.endTime && log.startTime ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000)) : log.duration;
        const rest = log.phaseDurations ? (log.phaseDurations.rest || 0) : (log.category === 'Rest' ? duration : 0);
        return acc + (duration - rest);
    }, 0) / 60;
    const avgDailyHour = (totalMinutes / 60 / 7).toFixed(1);
    if (parseFloat(avgDailyHour) > 0.5) {
      insights.push({
        id: 'weekly-avg',
        type: 'stat',
        text: `Last week, you spent an average of ${avgDailyHour} hours focusing each day. Great consistency!`
      });
    }
  }

  // 5. Category Streak / Focus
  const categoryFocus: Record<string, number> = {};
  lastWeekLogs.forEach(l => {
    if (l.category !== 'Rest') {
      const duration = l.endTime && l.startTime ? Math.max(l.duration, Math.round((l.endTime - l.startTime) / 1000)) : l.duration;
      const rest = l.phaseDurations ? (l.phaseDurations.rest || 0) : 0;
      categoryFocus[l.category] = (categoryFocus[l.category] || 0) + (duration - rest);
    }
  });
  const topCat = Object.entries(categoryFocus).sort((a,b) => b[1] - a[1])[0];
  if (topCat) {
    insights.push({
        id: 'top-category',
        type: 'stat',
        text: `You've been deeply invested in "${topCat[0]}" lately. Keep pushing those limits!`
    });
  }

  // 6. Inspiration recall
  if (inspirations.length > 0) {
    const randomInsp = inspirations[Math.floor(Math.random() * inspirations.length)];
    const snippet = randomInsp.content.length > 60 ? randomInsp.content.substring(0, 57) + '...' : randomInsp.content;
    insights.push({
      id: 'inspiration-recall',
      type: 'inspiration',
      text: `Reflecting on your muse: "${snippet}"`
    });
  }

  // 7. Mood / Keyword Analysis (Heuristic)
  const keywords = {
    'tire': 'You mentioned feeling tired. Maybe a short 5-min walk would help?',
    'stress': 'When things get stressful, remember to breathe. You got this.',
    'finish': 'Closing in on a milestone? Finish strong!',
    'start': 'A fresh start is the perfect time for focus.',
    'learn': 'Learning is a journey. Every minute counts!',
  };
  
  for (const log of logs.slice(-5)) { // Check last 5 logs
    const desc = log.description.toLowerCase();
    for (const [key, msg] of Object.entries(keywords)) {
        if (desc.includes(key)) {
            insights.push({ id: `mood-${key}`, type: 'stat', text: msg });
            break;
        }
    }
  }

  return insights;
};
