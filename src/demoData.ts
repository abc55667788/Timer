import { LogEntry, Goal, Inspiration, CategoryData, DEFAULT_CATEGORIES } from './types';

export const applyDemoData = () => {
  // Check if we've already applied demo data to prevent infinite loops or overwriting fresh work
  if (localStorage.getItem('emerald-demo-applied-v3') === 'true') return;

  const dayMs = 24 * 60 * 60 * 1000;
  
  // 1. Categories
  const categories: CategoryData[] = [
    ...DEFAULT_CATEGORIES,
    { name: 'Creative', icon: 'Pencil', color: '#ec4899' },
    { name: 'Plan', icon: 'Map', color: '#06b6d4' },
    { name: 'Health', icon: 'Heart', color: '#f87171' },
    { name: 'Social', icon: 'MessageSquare', color: '#8b5cf6' },
  ];

  // 2. Goals
  const goals: Goal[] = [
    { id: 'g1', text: '完成 2025 全年数据回顾', completed: true },
    { id: 'g2', text: '养成每天喝 2 升水的习惯', completed: true },
    { id: 'g3', text: '学习并掌握一门新语言', completed: false },
    { id: 'g4', text: '每周至少运动三次', completed: true },
    { id: 'g5', text: '整理完家里乱糟糟的书架', completed: false },
  ];

  // 3. Inspirations (Muse)
  const inspirations: Inspiration[] = [
    {
      id: 'i1',
      title: '午后的一缕阳光',
      content: '看着阳光洒在乱糟糟的桌面上，突然觉得这种忙碌感也挺真实。',
      date: new Date('2025-05-15').getTime(),
      images: ['https://images.unsplash.com/photo-1505673539012-ee716fddb462?w=800']
    },
    {
      id: 'i2',
      title: '整理桌面',
      content: '清理了三个月没动的杂物，感觉大脑也跟着清爽了许多。不需要太整齐，只要看得过去就行。',
      date: new Date('2025-08-20').getTime(),
      images: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800']
    },
    {
      id: 'i3',
      title: '雨天的阅读',
      content: '外面下大雨，屋里开灯看书，杯里的红茶还冒着热气，这是今年最舒服的一刻。',
      date: new Date('2025-11-05').getTime(),
      images: ['https://images.unsplash.com/photo-1474366521946-c3d4b507ad92?w=800']
    }
  ];

  // 4. Logs
  const logs: LogEntry[] = [];
  const logPrompts = [
    { category: 'Work', desc: '回复邮件和处理日常琐事', images: ['https://images.unsplash.com/photo-1542435503-956c469947f6?w=800'] },
    { category: 'Work', desc: '专注处理工作文档和报表', images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800'] },
    { category: 'Read', desc: '睡前翻了几页小说', images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800'] },
    { category: 'Read', desc: '午休时间看看杂志', images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800'] },
    { category: 'Exercise', desc: '在家做了一些简单的伸展运动', images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'] },
    { category: 'Exercise', desc: '去附近公园散了个长步', images: ['https://images.unsplash.com/photo-1502129100147-1b8d097ed346?w=800'] },
    { category: 'Study', desc: '复习今天学习的内容', images: ['https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=800'] },
    { category: 'Rest', desc: '发呆，什么也不想', images: ['https://images.unsplash.com/photo-1499209974431-9dac36a3930e?w=800'] },
    { category: 'Rest', desc: '在厨房泡杯茶休息一下', images: ['https://images.unsplash.com/photo-1544787210-282aa9bc119a?w=800'] },
    { category: 'Entertainment', desc: '玩了一会儿手机，不知不觉时间就过了', images: ['https://images.unsplash.com/photo-1512428559083-a401c337e452?w=800'] },
    { category: 'Entertainment', desc: '看了一场搞笑的综艺节目', images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800'] },
    { category: 'Eat', desc: '吃了个简单的午餐', images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'] },
    { category: 'Creative', desc: '随手在纸上涂鸦了一些乱七八糟的东西', images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'] },
    { category: 'Plan', desc: '规划下周的日程和购物清单', images: ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800'] },
    { category: 'Social', desc: '和朋友打了个很长的电话', images: ['https://images.unsplash.com/photo-1520923179273-042872ee319b?w=800'] },
  ];

  // Full Year 2025: Jan 1 to Dec 31
  const startYear = new Date('2025-01-01T00:00:00');
  const totalDays = 365;

  for (let i = 0; i < totalDays; i++) {
    const currentTs = startYear.getTime() + (i * dayMs);
    const dateObj = new Date(currentTs);
    
    // Realism: Skip ~10% of days
    if (Math.random() < 0.9) {
      const numLogs = 2 + Math.floor(Math.random() * 5);
      let currentDayTime = new Date(currentTs).setHours(7 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      for (let j = 0; j < numLogs; j++) {
        const prompt = logPrompts[Math.floor(Math.random() * logPrompts.length)];
        const durationSeconds = (15 + Math.floor(Math.random() * 150)) * 60; 
        const startTime = currentDayTime;
        const endTime = startTime + durationSeconds * 1000;
        
        logs.push({
          id: `demo-log-2025-${i}-${j}`,
          category: prompt.category,
          description: prompt.desc,
          startTime,
          endTime,
          duration: durationSeconds,
          images: prompt.images,
          phaseDurations: {
            work: Math.floor(durationSeconds * 0.8),
            rest: Math.floor(durationSeconds * 0.2)
          }
        });

        currentDayTime = endTime + (15 + Math.floor(Math.random() * 95)) * 60 * 1000;
        if (new Date(currentDayTime).getDate() !== dateObj.getDate()) break;
      }
    }
  }

  // 5. Save to LocalStorage
  localStorage.setItem('emerald-categories', JSON.stringify(categories));
  localStorage.setItem('emerald-goals', JSON.stringify(goals));
  localStorage.setItem('emerald-inspirations', JSON.stringify(inspirations));
  localStorage.setItem('emerald-logs', JSON.stringify(logs));
  localStorage.setItem('emerald-settings', JSON.stringify({ workDuration: 25 * 60, restDuration: 5 * 60 }));
  
  localStorage.setItem('emerald-demo-applied-v3', 'true');
  
  console.log('Demo data (Full Year 2025) applied successfully!');
};
