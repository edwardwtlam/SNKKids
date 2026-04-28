import { Link } from 'react-router-dom';
import { Lock, TrendingUp } from 'lucide-react';
import type { Article } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, TOPIC_AREA_LABELS } from '../lib/types';

interface ArticleCardProps {
  article: Article;
  onReadMore?: () => void;
  isLoggedIn: boolean;
  variant?: 'hero' | 'grid' | 'sidebar';
}

export default function ArticleCard({ article, onReadMore, isLoggedIn, variant = 'grid' }: ArticleCardProps) {
  const colors = CATEGORY_COLORS[article.category];
  const topicLabel = TOPIC_AREA_LABELS[article.topic_area] || article.topic_area;

  if (variant === 'hero') {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                {CATEGORY_LABELS[article.category]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                {article.language === 'zh' ? '中文' : 'English'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h2>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              {article.preview_text}
            </p>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  to={`/article/${article.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                >
                  閱讀更多
                </Link>
              ) : (
                <button
                  onClick={onReadMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  閱讀更多
                </button>
              )}
            </div>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-medium text-teal-600">{topicLabel}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.perspective_a_title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-3">{article.perspective_a_content}</p>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.perspective_b_title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3">{article.perspective_b_content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className={`w-1 rounded-full ${colors.bg} shrink-0`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${colors.text}`}>{CATEGORY_LABELS[article.category]}</span>
            <span className="text-xs text-gray-400">
              {article.language === 'zh' ? '中文' : 'EN'}
            </span>
          </div>
          {isLoggedIn ? (
            <Link to={`/article/${article.id}`} className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors line-clamp-2">
              {article.title}
            </Link>
          ) : (
            <button onClick={onReadMore} className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors line-clamp-2 text-left">
              {article.title}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.light} ${colors.text}`}>
            {CATEGORY_LABELS[article.category]}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {article.language === 'zh' ? '中文' : 'English'}
          </span>
          {topicLabel && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-600">
              {topicLabel}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-teal-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {article.preview_text}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{article.published_at}</span>
          {isLoggedIn ? (
            <Link
              to={`/article/${article.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              閱讀更多
            </Link>
          ) : (
            <button
              onClick={onReadMore}
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              閱讀更多
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
