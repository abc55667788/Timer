import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ExternalLink, BookOpen, BarChart3, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyDigest } from '../../types';
import { formatDisplayDateString } from '../../utils/time';

interface DailyBoardProps {
  digest: DailyDigest | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  darkMode: boolean;
  selectedStatsDate: string;
  onJumpStats: () => void;
  notifyEnabled: boolean;
}

const iconMap = {
  stats: BarChart3,
  knowledge: BookOpen,
  news: Newspaper,
};

const titleMap = {
  stats: '统计快照',
  knowledge: '知识卡片',
  news: '兴趣 News',
} as const;

const DEMO_POOL = [
  {
    id: 'demo-k1',
    kind: 'knowledge' as const,
    title: '演示 · 今日知识',
    content: '番茄钟中的“休息”不是中断专注，而是为了让下一轮专注质量更稳定。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-k2',
    kind: 'knowledge' as const,
    title: '演示 · 小技巧',
    content: '把任务拆成 25 分钟可完成的子步骤，启动阻力会明显降低。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-s1',
    kind: 'stats' as const,
    title: '演示 · 今日统计',
    content: '你今天已经完成 3 次专注段，连续记录的习惯正在形成。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-s2',
    kind: 'stats' as const,
    title: '演示 · 节奏提醒',
    content: '本周最佳状态通常出现在上午，建议把高价值任务优先放到早段。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-n1',
    kind: 'news' as const,
    title: '演示 · 兴趣新闻',
    content: 'AI 工具正在强化个人工作流：从信息收集到行动建议，闭环速度更快。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-n2',
    kind: 'news' as const,
    title: '演示 · 行业动态',
    content: '越来越多产品把“总结 + 下一步建议”作为默认输出形态。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-k3',
    kind: 'knowledge' as const,
    title: '演示 · 思维模型',
    content: '先做最小可验证动作，再根据反馈迭代，比追求一次完美更有效。',
    source: 'Demo Feed',
  },
  {
    id: 'demo-n3',
    kind: 'news' as const,
    title: '演示 · 关注点',
    content: '在信息流中加入“与你目标相关”的过滤关键词，能显著减少噪音。',
    source: 'Demo Feed',
  },
];

const hash = (value: string) => {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result << 5) - result + value.charCodeAt(i);
    result |= 0;
  }
  return Math.abs(result);
};

const shuffleBySeed = <T,>(items: T[], seed: number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (seed + i * 31) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const DailyBoard: React.FC<DailyBoardProps> = ({
  digest,
  isRefreshing,
  onRefresh,
  darkMode,
  selectedStatsDate,
  onJumpStats,
  notifyEnabled,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openSeed] = useState(() => Date.now());
  const touchStartXRef = useRef<number | null>(null);

  const cards = useMemo(() => {
    const liveItems = digest?.items || [];
    const liveSeed = hash(`${openSeed}-${digest?.generatedAt || 0}-${liveItems.length}`);
    const shuffledLive = shuffleBySeed(liveItems, liveSeed);

    const picked = shuffledLive.slice(0, 5);
    if (picked.length >= 5) return picked;

    const demoSeed = hash(`${openSeed}-demo-${digest?.generatedAt || 0}`);
    const shuffledDemo = shuffleBySeed(DEMO_POOL, demoSeed).map((item, index) => ({
      ...item,
      id: `${item.id}-${index}`,
    }));

    return [...picked, ...shuffledDemo.slice(0, 5 - picked.length)];
  }, [digest, openSeed]);

  useEffect(() => {
    if (currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards.length, currentIndex]);

  const goPrev = () => {
    if (!cards.length) return;
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const goNext = () => {
    if (!cards.length) return;
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartXRef.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (start == null || end == null) return;

    const delta = end - start;
    if (Math.abs(delta) < 45) return;

    if (delta < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const activeCard = cards[currentIndex];
  const ActiveIcon = activeCard ? iconMap[activeCard.kind] : Sparkles;
  const digestDateText = formatDisplayDateString(digest?.date || selectedStatsDate);

  return (
    <div className="flex-1 p-4 md:p-6 animate-in fade-in duration-300 flex flex-col">
      <div className="flex-1 flex items-center justify-center min-h-[72vh] md:min-h-[78vh] relative">
        {activeCard && (
          <div className="w-full relative md:px-16 lg:px-20">
            <button
              onClick={goPrev}
              className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center border transition-all z-10 ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800' : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50 shadow-sm'}`}
              aria-label="Previous card"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={goNext}
              className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center border transition-all z-10 ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800' : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50 shadow-sm'}`}
              aria-label="Next card"
            >
              <ChevronRight size={20} />
            </button>

            <article
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className={`w-full max-w-4xl mx-auto rounded-[2rem] border p-6 md:p-8 shadow-[0_25px_80px_-25px_rgba(0,0,0,0.45)] min-h-[68vh] md:min-h-[74vh] flex flex-col justify-between ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-100' : 'bg-white border-emerald-100 text-emerald-900'}`}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-zinc-950 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ActiveIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black tracking-tight truncate">{activeCard.title}</h3>
                    <p className={`text-[11px] font-black uppercase tracking-widest mt-1 ${darkMode ? 'text-emerald-300/70' : 'text-emerald-500/90'}`}>
                      {titleMap[activeCard.kind]} · {activeCard.source || 'Daily'}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0 ${darkMode ? 'bg-zinc-950 text-zinc-300 border border-white/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {currentIndex + 1}/{cards.length}
                </span>
              </div>

                <p className={`text-base md:text-lg leading-relaxed md:min-h-[220px] ${darkMode ? 'text-zinc-200' : 'text-emerald-800'}`}>
                  {activeCard.content}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>
                  {digestDateText}
                </span>
                {activeCard.url ? (
                  <a
                    href={activeCard.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1 ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    Source <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-600' : 'text-emerald-300'}`}>
                    {digest ? 'No source link' : 'Demo content'}
                  </span>
                )}
              </div>

              <div className="md:hidden text-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-emerald-400'}`}>
                  左右滑动切换卡片
                </span>
              </div>
            </article>
          </div>
        )}
      </div>

      {!digest && (
        <div className={`rounded-[1.3rem] border px-4 py-3 text-center text-[12px] font-semibold ${darkMode ? 'bg-zinc-900 border-white/10 text-zinc-400' : 'bg-white border-emerald-100 text-emerald-600'}`}>
          当前为演示卡片内容，点击 Refresh 后会替换为真实推送信息。
        </div>
      )}
    </div>
  );
};

export default DailyBoard;
