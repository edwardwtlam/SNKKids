import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Article, VocabItem } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, TOPIC_AREA_LABELS } from '../lib/types';
import {
  ArrowLeft, Eye, BookOpen, Lightbulb, ExternalLink,
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Star
} from 'lucide-react';

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
        .then(() => {
          updateReadingStats();
        });

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">找不到文章</p>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[article.category];
  const topicLabel = TOPIC_AREA_LABELS[article.topic_area] || article.topic_area;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${colors.light} border-b ${colors.border}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={`/category/${article.category}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {CATEGORY_LABELS[article.category]}
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.light} ${colors.text}`}>
              {CATEGORY_LABELS[article.category]}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              {article.language === 'zh' ? '中文' : 'English'}
            </span>
            {topicLabel && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-600">
                {topicLabel}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{article.title}</h1>
          <p className="text-sm text-gray-500 mt-2">{article.published_at}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Perspective A */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">{article.perspective_a_title}</h2>
            </div>
            <p className="text-blue-100 text-xs mt-1">觀點 A — 從這個角度看事情</p>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {article.perspective_a_content}
            </div>
          </div>
        </div>

        {/* Perspective B */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">{article.perspective_b_title}</h2>
            </div>
            <p className="text-amber-100 text-xs mt-1">觀點 B — 換個角度想一想</p>
          </div>
          <div className="p-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {article.perspective_b_content}
            </div>
          </div>
        </div>

        {/* Vocabulary Box */}
        {article.vocabulary && article.vocabulary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">詞彙表 Vocabulary</h2>
              </div>
              <p className="text-teal-100 text-xs mt-1">點擊詞彙查看解釋，按書籤圖標收藏</p>
            </div>
            <div className="p-6 space-y-3">
              {article.vocabulary.map((vocab, idx) => {
                const isExpanded = expandedVocab.has(vocab.word_zh);
                const isSaved = savedVocab.has(vocab.word_zh);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 hover:border-teal-200 transition-colors overflow-hidden"
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
                        <span className="text-base font-bold text-teal-600">{vocab.word_zh}</span>
                        <span className="text-sm text-gray-500">{vocab.word_en}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleSaveVocab(vocab)}
                        className="p-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-teal-500" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-gray-50 pt-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium text-gray-800">中文：</span>
                          {vocab.explanation_zh}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-800">English:</span>{' '}
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
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">動腦筋 Think About It</h2>
              </div>
              <p className="text-amber-100 text-xs mt-1">思考這些問題，訓練你的批判性思維</p>
            </div>
            <div className="p-6 space-y-4">
              {article.questions.map((q, idx) => (
                <div key={idx} className="rounded-xl border border-amber-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Star className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">{q.question_zh}</p>
                      <p className="text-sm text-gray-500">{q.question_en}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        {article.source_url && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">資料來源 Source</h3>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors break-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {article.source_name || article.source_url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
