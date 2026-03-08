import { DailyDigest, DailyFeedConfig, DailyFeedItem, Inspiration, LogEntry } from '../types';
import { formatDate } from './time';

const toLower = (value: string) => value.toLowerCase();

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickDeterministic = <T,>(list: T[], seed: string): T | null => {
  if (!list.length) return null;
  const idx = hashString(seed) % list.length;
  return list[idx];
};

const toTopicList = (topicText: string) => {
  return topicText
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(toLower);
};

const matchesTopics = (text: string, tags: string[], topics: string[]) => {
  if (!topics.length) return true;
  const source = `${text} ${tags.join(' ')}`.toLowerCase();
  return topics.some(topic => source.includes(topic));
};

const normalizeFeedItem = (raw: any, kind: 'knowledge' | 'news'): DailyFeedItem | null => {
  if (raw == null) return null;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return {
      id: `${kind}-${hashString(trimmed)}`,
      kind,
      title: kind === 'knowledge' ? '知识卡片' : '今日新闻',
      content: trimmed,
    };
  }

  if (typeof raw !== 'object') return null;

  const title = String(raw.title || raw.headline || raw.name || raw.topic || '').trim();
  const content = String(raw.content || raw.summary || raw.description || raw.body || '').trim();
  const url = String(raw.url || raw.link || '').trim();
  const source = String(raw.source || raw.from || '').trim();
  const tags = Array.isArray(raw.tags) ? raw.tags.map((tag: any) => String(tag)) : [];

  if (!title && !content) return null;

  return {
    id: `${kind}-${hashString(`${title}|${content}|${url}`)}`,
    kind,
    title: title || (kind === 'knowledge' ? '知识卡片' : '今日新闻'),
    content: content || title,
    url: url || undefined,
    source: source || undefined,
    tags,
  } as DailyFeedItem & { tags?: string[] };
};

const extractArrayPayload = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const keys = ['items', 'list', 'data', 'news', 'articles', 'knowledge', 'entries'];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
};

const fetchJson = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
};

const parseJsonArrayFromText = (text: string) => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray((parsed as any).items)) return (parsed as any).items;
      if (Array.isArray((parsed as any).news)) return (parsed as any).news;
    }
  } catch (e) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      return JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  return [];
};

const fetchAiNewsItems = async (params: {
  date: string;
  config: DailyFeedConfig;
  topics: string[];
  statsItem: DailyFeedItem;
  inspirations: Inspiration[];
}) => {
  const apiKey = params.config.aiApiKey.trim();
  if (!apiKey) return [] as DailyFeedItem[];

  const endpoint = params.config.aiBaseUrl.trim() || 'https://api.openai.com/v1/chat/completions';
  const model = params.config.aiModel.trim() || 'gpt-4o-mini';
  const topicLine = params.topics.length ? params.topics.join(', ') : 'AI, 学习, 效率, 产品';
  const inspirationLine = params.inspirations
    .slice(0, 4)
    .map(item => `${item.title || '灵感'}: ${item.content || ''}`)
    .filter(Boolean)
    .join('\n');

  const prompt = [
    `今天日期：${params.date}`,
    `兴趣关键词：${topicLine}`,
    `我的统计快照：${params.statsItem.content}`,
    `我的知识库片段：`,
    inspirationLine || '暂无',
    '',
    '请基于上面信息生成 5 条我可能感兴趣的 news。',
    '每条包含 title、content、source（可选）、url（可选）、tags（可选）。',
    '仅返回 JSON 数组，不要输出额外解释。',
    'content 请用中文、简洁可读。',
  ].join('\n');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful news assistant that returns strict JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI news HTTP ${res.status}`);
  }

  const payload = await res.json();
  const content = String(
    payload?.choices?.[0]?.message?.content
      || payload?.output_text
      || payload?.text
      || ''
  ).trim();

  if (!content) return [] as DailyFeedItem[];

  const arr = parseJsonArrayFromText(content);
  const normalized = arr
    .map((item: any) => normalizeFeedItem(item, 'news'))
    .filter(Boolean) as (DailyFeedItem & { tags?: string[] })[];

  return normalized.map(item => ({
    ...item,
    source: item.source || 'AI Daily News',
  }));
};

const buildStatsItem = (logs: LogEntry[], date: string): DailyFeedItem => {
  const dayStart = new Date(`${date}T00:00:00`).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const weekStart = dayStart - 6 * 24 * 60 * 60 * 1000;

  const logsToday = logs.filter(l => l.startTime >= dayStart && l.startTime < dayEnd);
  const logsWeek = logs.filter(l => l.startTime >= weekStart && l.startTime < dayEnd);

  const durationOf = (log: LogEntry) => {
    const fullDuration = log.endTime && log.startTime
      ? Math.max(log.duration, Math.round((log.endTime - log.startTime) / 1000))
      : log.duration;
    const restDuration = log.phaseDurations ? (log.phaseDurations.rest || 0) : (log.category === 'Rest' ? fullDuration : 0);
    return Math.max(0, fullDuration - restDuration);
  };

  const todayFocusMinutes = Math.round(logsToday.reduce((acc, log) => acc + durationOf(log), 0) / 60);
  const weekFocusMinutes = Math.round(logsWeek.reduce((acc, log) => acc + durationOf(log), 0) / 60);

  const categoryTotals: Record<string, number> = {};
  logsWeek.forEach(log => {
    if (log.category === 'Rest') return;
    categoryTotals[log.category] = (categoryTotals[log.category] || 0) + durationOf(log);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const lines = [
    `今日专注：${todayFocusMinutes} 分钟`,
    `近7日专注：${weekFocusMinutes} 分钟`,
    topCategory ? `本周主线：${topCategory[0]}（${Math.round(topCategory[1] / 60)} 分钟）` : '本周主线：暂无数据'
  ];

  return {
    id: `stats-${date}`,
    kind: 'stats',
    title: '你的统计快照',
    content: lines.join(' · '),
    source: 'Emerald Timer',
  };
};

const toKnowledgeItems = (inspirations: Inspiration[]) => {
  return inspirations
    .map(item => ({
      id: `local-knowledge-${item.id}`,
      kind: 'knowledge' as const,
      title: item.title?.trim() || '知识卡片',
      content: item.content?.trim() || '',
      url: item.url,
      source: '你的知识库',
      tags: [],
    }))
    .filter(item => !!item.content || !!item.title);
};

export async function buildDailyDigest(params: {
  date?: string;
  logs: LogEntry[];
  inspirations: Inspiration[];
  config: DailyFeedConfig;
}): Promise<DailyDigest> {
  const date = params.date || formatDate(Date.now());
  const topics = toTopicList(params.config.interestTopics);

  const statsItem = buildStatsItem(params.logs, date);
  const localKnowledge = toKnowledgeItems(params.inspirations);

  let remoteKnowledge: DailyFeedItem[] = [];
  let remoteNews: DailyFeedItem[] = [];
  let aiNews: DailyFeedItem[] = [];
  const notes: string[] = [];

  if (params.config.knowledgeUrl.trim()) {
    try {
      const payload = await fetchJson(params.config.knowledgeUrl.trim());
      const data = extractArrayPayload(payload)
        .map(item => normalizeFeedItem(item, 'knowledge'))
        .filter(Boolean) as (DailyFeedItem & { tags?: string[] })[];
      remoteKnowledge = data.map(item => ({ ...item, source: item.source || '远端知识库' }));
    } catch (error: any) {
      notes.push(`知识库拉取失败：${error?.message || 'unknown'}`);
    }
  }

  if (params.config.newsUrl.trim()) {
    try {
      const payload = await fetchJson(params.config.newsUrl.trim());
      const data = extractArrayPayload(payload)
        .map(item => normalizeFeedItem(item, 'news'))
        .filter(Boolean) as (DailyFeedItem & { tags?: string[] })[];
      remoteNews = data.map(item => ({ ...item, source: item.source || '外部 News Feed' }));
    } catch (error: any) {
      notes.push(`新闻拉取失败：${error?.message || 'unknown'}`);
    }
  }

  if (params.config.aiApiKey.trim()) {
    try {
      aiNews = await fetchAiNewsItems({
        date,
        config: params.config,
        topics,
        statsItem,
        inspirations: params.inspirations,
      });
      if (!aiNews.length) {
        notes.push('AI News 未返回可解析内容');
      }
    } catch (error: any) {
      notes.push(`AI News 生成失败：${error?.message || 'unknown'}`);
    }
  }

  const knowledgeCandidates = [...localKnowledge, ...remoteKnowledge]
    .filter(item => matchesTopics(`${item.title} ${item.content}`, (item as any).tags || [], topics));
  const newsCandidates = [...remoteNews, ...aiNews]
    .filter(item => matchesTopics(`${item.title} ${item.content}`, (item as any).tags || [], topics));

  const knowledgePick = pickDeterministic(knowledgeCandidates, `${date}-knowledge`);
  const newsPick = pickDeterministic(newsCandidates, `${date}-news`);

  const items: DailyFeedItem[] = [statsItem];
  if (knowledgePick) items.push({ ...knowledgePick, kind: 'knowledge' });
  if (newsPick) items.push({ ...newsPick, kind: 'news' });

  if (!knowledgePick && !newsPick && !params.logs.length && !params.inspirations.length) {
    items.push({
      id: `starter-${date}`,
      kind: 'knowledge',
      title: '先记录一点今天的新知',
      content: '你可以在 Journal 里写下灵感，或在设置里配置外部知识库/News 源。',
      source: '系统提示',
    });
  }

  return {
    date,
    items,
    generatedAt: Date.now(),
    note: notes.length ? notes.join('；') : undefined,
  };
}
