import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Article, VocabItem } from '../lib/types';
import { CATEGORY_LABELS, TOPIC_AREA_LABELS } from '../lib/types';
import {
  ArrowLeft, ExternalLink,
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import FlagIcon from '../components/FlagIcon';

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: string; shadow: string }> = {
  hong_kong: {
    emoji: '🦁',
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
    shadow: '0 4px 0 0 #C2410C',
  },
  china: {
    emoji: '🐉',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    shadow: '0 4px 0 0 #B45309',
  },
  international: {
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    shadow: '0 4px 0 0 #6D28D9',
  },
};

const TOPIC_EMOJIS: Record<string, string> = {
  science: '🔬', environment: '🌿', society: '🏙️', health: '💪',
  growth: '🌱', animals: '🐾', space: '🚀', tech: '💻',
  history: '📜', conservation: '🌳', food: '🍎', transport: '🚂',
  education: '📚', charity: '❤️', sports: '⚽', culture: '🎭',
  arts: '🎨', finance: '💰', inspiring: '⭐', future: '🔮',
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedVocab, setSavedVocab] = useState<Set<string>>(new Set());
  const [expandedVocab, setExpandedVocab] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setArticle(data);
      setLoading(false);
    };
    if (id) fetchArticle();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      supabase
        .from('reading_history')
        .upsert({ user_id: user.id, article_id: id }, { onConflict: 'user_id,article_id' })
        .then(() => { updateReadingStats(); });

      supabase
        .from('saved_vocabulary')
        .select('word_zh')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .then(({ data }) => {
          if (data) setSavedVocab(new Set(data.map((d) => d.word_zh)));
        });
    }
  }, [user, id]);

  const updateReadingStats = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileData) return;

    const isSameDay = profileData.last_read_date === today;
    const updates: Record<string, unknown> = {};

    if (!isSameDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      updates.articles_read_today = 1;
      updates.last_read_date = today;
      updates.total_points = (profileData.total_points || 0) + 10;
      updates.reading_streak = profileData.last_read_date === yesterdayStr
        ? (profileData.reading_streak || 0) + 1
        : 1;
    } else {
      updates.articles_read_today = (profileData.articles_read_today || 0) + 1;
      updates.total_points = (profileData.total_points || 0) + 5;
    }

    supabase.from('profiles').update(updates).eq('id', user.id).then(() => {});
  };

  const toggleSaveVocab = async (vocab: VocabItem) => {
    if (!user || !article) return;
    const isSaved = savedVocab.has(vocab.word_zh);

    if (isSaved) {
      await supabase
        .from('saved_vocabulary')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', article.id)
        .eq('word_zh', vocab.word_zh);
      setSavedVocab((prev) => {
        const next = new Set(prev);
        next.delete(vocab.word_zh);
        return next;
      });
    } else {
      await supabase.from('saved_vocabulary').insert({
        user_id: user.id,
        article_id: article.id,
        word_zh: vocab.word_zh,
        word_en: vocab.word_en,
        explanation_zh: vocab.explanation_zh,
        explanation_en: vocab.explanation_en,
      });
      setSavedVocab((prev) => new Set(prev).add(vocab.word_zh));
    }
  };

  if (!user) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📖</div>
          <div className="spinner-fun mx-auto mb-3" />
          <p className="text-purple-600 font-bold">載入文章中...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-500 font-bold text-lg">找不到文章</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-white" style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}>
            ← 返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const cfg = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.international;
  const seoTitle = `${article.title} | SNK Kids`;
  const seoDesc = article.preview_text ? article.preview_text.slice(0, 160) : 'SNK Kids 香港小學生雙語新聞平台';
  const topicLabel = TOPIC_AREA_LABELS[article.topic_area] || article.topic_area;
  const topicEmoji = TOPIC_EMOJIS[article.topic_area] || '📰';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F0' }}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={"https://www.snkkids.com/article/" + id} />
        <link rel="canonical" href={"https://www.snkkids.com/article/" + id} />
      </Helmet>
      {/* Article Header */}
      <div className="relative overflow-hidden py-10 px-4" style={{ background: cfg.gradient }}>
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -right-8 w-48 h-48 rounded-full bg-white/10" />

        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to={`/category/${article.category}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {CATEGORY_LABELS[article.category]}
          </Link>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
              {cfg.emoji} {CATEGORY_LABELS[article.category]}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm flex items-center gap-1">
              <FlagIcon lang={article.language as 'zh' | 'en'} size={14} />
              {article.language === 'zh' ? '中文' : 'English'}
            </span>
            {topicLabel && (
              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
                {topicEmoji} {topicLabel}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
            {article.title}
          </h1>
          <p className="text-white/70 text-sm font-medium">📅 {article.published_at}</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ fill: '#FFF9F0' }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Perspective A */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            <span className="text-2xl">👁️</span>
            <div>
              <h2 className="text-base font-black text-white">{article.perspective_a_title}</h2>
              <p className="text-blue-100 text-xs mt-0.5">觀點 A — 從這個角度看事情</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {article.perspective_a_content}
            </div>
          </div>
        </div>

        {/* Perspective B */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
            <span className="text-2xl">💡</span>
            <div>
              <h2 className="text-base font-black text-white">{article.perspective_b_title}</h2>
              <p className="text-amber-100 text-xs mt-0.5">觀點 B — 換個角度想一想</p>
            </div>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {article.perspective_b_content}
            </div>
          </div>
        </div>

        {/* Vocabulary Box */}
        {article.vocabulary && article.vocabulary.length > 0 && (
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}>
              <span className="text-2xl">📚</span>
              <div>
                <h2 className="text-base font-black text-white">詞彙表 Vocabulary</h2>
                <p className="text-teal-100 text-xs mt-0.5">點擊詞彙查看解釋，按書籤圖標收藏</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {article.vocabulary.map((vocab, idx) => {
                const isExpanded = expandedVocab.has(vocab.word_zh);
                const isSaved = savedVocab.has(vocab.word_zh);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{ border: isExpanded ? '2px solid #10B981' : '2px solid #F0FDF4', background: isExpanded ? '#F0FDF4' : '#FAFAFA' }}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        onClick={() => {
                          setExpandedVocab((prev) => {
                            const next = new Set(prev);
                            if (next.has(vocab.word_zh)) next.delete(vocab.word_zh);
                            else next.add(vocab.word_zh);
                            return next;
                          });
                        }}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <span className="text-base font-black text-teal-600">{vocab.word_zh}</span>
                        <span className="text-sm text-gray-500 font-medium">{vocab.word_en}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-teal-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleSaveVocab(vocab)}
                        className="p-1.5 rounded-xl hover:bg-teal-100 transition-colors"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-teal-500" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t-2 border-teal-100 pt-3">
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-black text-teal-700">中文：</span>
                          {vocab.explanation_zh}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-black text-blue-600">English:</span>{' '}
                          {vocab.explanation_en}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Think About It Questions */}
        {article.questions && article.questions.length > 0 && (
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
              <span className="text-2xl">🧠</span>
              <div>
                <h2 className="text-base font-black text-white">動腦筋 Think About It</h2>
                <p className="text-amber-100 text-xs mt-0.5">思考這些問題，訓練你的批判性思維</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {article.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '2px solid #FDE68A' }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 mb-1">{q.question_zh}</p>
                    <p className="text-xs text-gray-500">{q.question_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        {article.source_url && (
          <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #F3F4F6' }}>
            <h3 className="text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
              <span>🔗</span> 資料來源 Source
            </h3>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors break-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {article.source_name || article.source_url}
            </a>
          </div>
        )}

        {/* Back button */}
        <div className="flex justify-center pt-4">
          <Link
            to={`/category/${article.category}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回 {CATEGORY_LABELS[article.category]}
          </Link>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
