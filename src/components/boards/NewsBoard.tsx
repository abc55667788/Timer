import React from 'react';
import { RefreshCw, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { NewsDay } from '../../types';

interface NewsBoardProps {
  darkMode: boolean;
  newsItems: NewsDay[];
  loading: boolean;
  error?: string;
  lastFetched?: string;
  onRefresh: () => void;
}

const NewsBoard: React.FC<NewsBoardProps> = ({ darkMode, newsItems, loading, error, lastFetched, onRefresh }) => {
  const panelClass = darkMode
    ? 'bg-zinc-900/80 border-white/10 text-emerald-50'
    : 'bg-white/90 border-emerald-100 text-emerald-900';

  const cards = React.useMemo(() => {
    const list: Array<{ key: string; date: string; dateLabel: string; title: string; summary?: string; url?: string }> = [];
    newsItems.forEach(day => {
      day.articles.forEach((article, idx) => {
        list.push({
          key: `${day.id}-${idx}`,
          date: day.id,
          dateLabel: day.dateLabel,
          title: article.title,
          summary: article.summary,
          url: article.url,
        });
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [newsItems]);

  return (
    <div className="w-full h-full flex items-start justify-center px-4 md:px-8 py-4 md:py-8">
      <div className={`w-full max-w-5xl rounded-3xl border shadow-lg backdrop-blur-xl p-6 md:p-8 ${panelClass}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">News & Updates</h2>
            <p className={`text-xs md:text-sm font-semibold ${darkMode ? 'text-emerald-200/80' : 'text-emerald-700/80'}`}>
              Pulling Markdown articles from your configured GitHub repository.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className={`text-[11px] font-bold flex items-center gap-1 ${darkMode ? 'text-emerald-300/80' : 'text-emerald-700/80'}`}>
                <Clock size={14} /> {lastFetched}
              </span>
            )}
            <button 
              onClick={onRefresh}
              disabled={loading}
              className={`${darkMode ? 'bg-zinc-800 text-white border border-white/10 hover:bg-emerald-500 hover:border-emerald-400' : 'bg-emerald-600 text-white shadow-md shadow-emerald-100/50 hover:bg-emerald-700'} px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2`}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className={`${darkMode ? 'bg-red-900/30 border-red-700/40 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} text-[12px] font-semibold px-3 py-2 rounded-xl border flex items-center gap-2 mb-4`}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading && !newsItems.length && (
          <div className={`flex items-center justify-center py-10 text-sm font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
            <RefreshCw size={16} className="animate-spin mr-2" /> Fetching news...
          </div>
        )}

        {!loading && !error && !newsItems.length && (
          <div className={`flex items-center justify-center py-10 text-sm font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
            No news items found.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map(card => (
            <div key={card.key} className={`${darkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-white/95 border-emerald-100'} rounded-2xl border shadow-sm p-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>{card.date}</span>
                <span className={`text-[11px] font-bold ${darkMode ? 'text-emerald-200/70' : 'text-emerald-700/80'}`}>{card.dateLabel}</span>
              </div>
              <div className={`${darkMode ? 'bg-zinc-950/60 border-white/5' : 'bg-emerald-50/60 border-emerald-100'} rounded-xl border p-3 flex flex-col gap-1`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-black leading-tight">{card.title}</span>
                  {card.url && (
                    <a href={card.url} target="_blank" rel="noreferrer" className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} hover:underline flex-shrink-0`}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                {card.summary && <p className={`text-[12px] leading-relaxed ${darkMode ? 'text-emerald-100/80' : 'text-emerald-800/80'}`}>{card.summary}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsBoard;
