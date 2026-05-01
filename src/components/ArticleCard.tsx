import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { Article } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, TOPIC_AREA_LABELS } from '../lib/types';
import FlagIcon from './FlagIcon';

interface ArticleCardProps {
  article: Article;
  onReadMore?: () => void;
  isLoggedIn: boolean;
  variant?: 'hero' | 'grid' | 'sidebar';
}

const CATEGORY_FUN: Record<string, { gradient: string; shadow: string; emoji: string; badge: string }> = {
  hong_kong: {
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
    shadow: '0 4px 0 0 #C2410C',
    emoji: '🦁',
    badge: 'bg-orange-100 text-orange-700',
  },
  china: {
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    shadow: '0 4px 0 0 #B45309',
    emoji: '🐉',
    badge: 'bg-amber-100 text-amber-700',
  },
  international: {
    gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    shadow: '0 4px 0 0 #6D28D9',
    emoji: '🌍',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const TOPIC_EMOJIS: Record<string, string> = {
  science: '🔬', environment: '🌿', society: '🏙️', health: '💪',
  growth: '🌱', animals: '🐾', space: '🚀', tech: '💻',
  history: '📜', conservation: '🌳', food: '🍎', transport: '🚂',
  education: '📚', charity: '❤️', sports: '⚽', culture: '🎭',
  arts: '🎨', finance: '💰', inspiring: '⭐', future: '🔮',
};

export default function ArticleCard({ article, onReadMore, isLoggedIn, variant = 'grid' }: ArticleCardProps) {
  const colors = CATEGORY_COLORS[article.category];
  const fun = CATEGORY_FUN[article.category] || CATEGORY_FUN.international;
  const topicLabel = TOPIC_AREA_LABELS[article.topic_area] || article.topic_area;
  const topicEmoji = TOPIC_EMOJIS[article.topic_area] || '📰';

  if (variant === 'hero') {
    return (
      <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <div className="grid md:grid-cols-2">
          {/* Left: colorful gradient panel */}
          <div
            className="p-8 md:p-10 flex flex-col justify-center relative overflow-hidden"
            style={{ background: fun.gradient }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
                  {fun.emoji} {CATEGORY_LABELS[article.category]}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
                  <span className="flex items-center gap-1">
                    <FlagIcon lang={article.language as 'zh' | 'en'} size={14} />
                    {article.language === 'zh' ? '中文' : 'English'}
                  </span>
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
                  ⭐ 精選
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                {article.title}
              </h2>
              <p className="text-white/85 text-sm mb-6 leading-relaxed line-clamp-3">
                {article.preview_text}
              </p>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <Link
                    to={`/article/${article.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white font-black text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ color: '#EF4444', boxShadow: '0 4px 0 0 rgba(0,0,0,0.15)' }}
                  >
                    閱讀更多 →
                  </Link>
                ) : (
                  <button
                    onClick={onReadMore}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white font-black text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ color: '#EF4444', boxShadow: '0 4px 0 0 rgba(0,0,0,0.15)' }}
                  >
                    <Lock className="w-4 h-4" />
                    閱讀更多
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: white content panel */}
          <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{topicEmoji}</span>
              <span className="text-sm font-bold text-gray-500">{topicLabel}</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border-l-4 border-blue-400">
                <h3 className="text-sm font-black text-blue-700 mb-1">👁️ {article.perspective_a_title}</h3>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{article.perspective_a_content}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-400">
                <h3 className="text-sm font-black text-amber-700 mb-1">💡 {article.perspective_b_title}</h3>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{article.perspective_b_content}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="flex gap-3 py-3 border-b-2 border-dashed border-gray-100 last:border-0">
        <div
          className="w-2 rounded-full shrink-0"
          style={{ background: fun.gradient }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">{fun.emoji}</span>
            <span className={`text-xs font-bold ${colors.text}`}>{CATEGORY_LABELS[article.category]}</span>
            <span className="text-xs text-gray-400">
              {article.language === 'zh' ? '中' : 'EN'}
            </span>
          </div>
          {isLoggedIn ? (
            <Link to={`/article/${article.id}`} className="text-sm font-bold text-gray-700 hover:text-purple-600 transition-colors line-clamp-2">
              {article.title}
            </Link>
          ) : (
            <button onClick={onReadMore} className="text-sm font-bold text-gray-700 hover:text-purple-600 transition-colors line-clamp-2 text-left">
              {article.title}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer group"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
    >
      {/* Colored top bar */}
      <div className="h-2 w-full" style={{ background: fun.gradient }} />

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${fun.badge}`}>
            {fun.emoji} {CATEGORY_LABELS[article.category]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            <span className="flex items-center gap-1">
              <FlagIcon lang={article.language as 'zh' | 'en'} size={14} />
              {article.language === 'zh' ? '中文' : 'English'}
            </span>
          </span>
          {topicLabel && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600">
              {topicEmoji} {topicLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
          {article.title}
        </h3>

        {/* Preview */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {article.preview_text}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-100">
          <span className="text-xs text-gray-400 font-medium">{article.published_at}</span>
          {isLoggedIn ? (
            <Link
              to={`/article/${article.id}`}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: fun.gradient, boxShadow: fun.shadow }}
            >
              閱讀 →
            </Link>
          ) : (
            <button
              onClick={onReadMore}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: fun.gradient, boxShadow: fun.shadow }}
            >
              <Lock className="w-3 h-3" />
              閱讀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
