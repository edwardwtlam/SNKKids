import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ReadingHistoryItem, SavedVocabItem, Article } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/types';
import {
  User, BookOpen, Bookmark, Flame, Star, ArrowRight,
  Trash2, Calendar, TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [savedVocab, setSavedVocab] = useState<SavedVocabItem[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'vocabulary'>('history');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [historyRes, vocabRes] = await Promise.all([
        supabase
          .from('reading_history')
          .select('id, article_id, read_at, articles(*)')
          .eq('user_id', user.id)
          .order('read_at', { ascending: false })
          .limit(20),
        supabase
          .from('saved_vocabulary')
          .select('id, article_id, word_zh, word_en, explanation_zh, explanation_en, saved_at, articles(title)')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })
          .limit(50),
      ]);
      setReadingHistory((historyRes.data as unknown as ReadingHistoryItem[]) || []);
      setSavedVocab((vocabRes.data as unknown as SavedVocabItem[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const deleteVocab = async (id: string) => {
    await supabase.from('saved_vocabulary').delete().eq('id', id);
    setSavedVocab((prev) => prev.filter((v) => v.id !== id));
  };

  if (!user) return <Navigate to="/login" replace />;

  const streak = profile?.reading_streak || 0;
  const points = profile?.total_points || 0;
  const todayCount = profile?.articles_read_today || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile?.username || '我的帳戶'}</h1>
              <p className="text-teal-100 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-amber-300" />
                <span className="text-xs text-teal-100">連續閱讀</span>
              </div>
              <p className="text-2xl font-bold text-white">{streak} <span className="text-sm font-normal text-teal-100">天</span></p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-amber-300" />
                <span className="text-xs text-teal-100">總積分</span>
              </div>
              <p className="text-2xl font-bold text-white">{points}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <span className="text-xs text-teal-100">今日閱讀</span>
              </div>
              <p className="text-2xl font-bold text-white">{todayCount} <span className="text-sm font-normal text-teal-100">篇</span></p>
            </div>
          </div>

          {todayCount > 0 && (
            <div className="mt-4 bg-amber-400/20 rounded-xl p-3 border border-amber-300/30">
              <p className="text-sm text-amber-100 font-medium">
                {todayCount >= 5
                  ? '太棒了！你今天已經閱讀了' + todayCount + '篇文章！繼續保持！'
                  : '你今天已經閱讀了' + todayCount + '篇文章！再讀多一點吧！'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 border-b border-gray-200 mt-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              閱讀紀錄
            </span>
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vocabulary'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              我的詞彙
            </span>
          </button>
        </div>

        <div className="py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'history' ? (
            readingHistory.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">還沒有閱讀紀錄</p>
                <Link to="/" className="text-sm text-teal-600 font-medium mt-2 inline-block">
                  開始閱讀
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {readingHistory.map((item) => {
                  const article = item.articles as unknown as Article;
                  if (!article) return null;
                  const colors = CATEGORY_COLORS[article.category];
                  return (
                    <Link
                      key={item.id}
                      to={`/article/${article.id}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className={`w-10 h-10 rounded-lg ${colors.light} flex items-center justify-center shrink-0`}>
                        <TrendingUp className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${colors.text}`}>{CATEGORY_LABELS[article.category]}</span>
                          <span className="text-xs text-gray-400">
                            {article.language === 'zh' ? '中文' : 'English'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(item.read_at).toLocaleDateString('zh-HK')}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  );
                })}
              </div>
            )
          ) : savedVocab.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">還沒有收藏的詞彙</p>
              <p className="text-xs text-gray-300 mt-1">閱讀文章時按書籤圖標即可收藏</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedVocab.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Bookmark className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-teal-600">{item.word_zh}</span>
                      <span className="text-sm text-gray-500">{item.word_en}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.explanation_zh}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.explanation_en}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      來自：{item.articles?.title || '未知文章'}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteVocab(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
