import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ReadingHistoryItem, SavedVocabItem, Article } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/types';
import { ArrowRight, Trash2 } from 'lucide-react';

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

  const getStreakEmoji = (s: number) => {
    if (s >= 30) return '🏆';
    if (s >= 14) return '🔥';
    if (s >= 7) return '⚡';
    if (s >= 3) return '✨';
    return '🌱';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}
      >
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -right-8 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-yellow-300/15" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-white/20 backdrop-blur-sm"
              style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.15)' }}
            >
              👤
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{profile?.username || '我的帳戶'}</h1>
              <p className="text-blue-200 text-sm font-medium">{user.email}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: getStreakEmoji(streak),
                label: '連續閱讀',
                value: `${streak}天`,
                bg: 'bg-white/15',
              },
              {
                icon: '⭐',
                label: '總積分',
                value: `${points}分`,
                bg: 'bg-white/15',
              },
              {
                icon: '📖',
                label: '今日閱讀',
                value: `${todayCount}篇`,
                bg: 'bg-white/15',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} backdrop-blur-sm rounded-2xl p-4 text-center`}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xs text-blue-200 font-medium mb-0.5">{stat.label}</div>
                <div className="text-xl font-black text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Encouragement Banner */}
          {todayCount > 0 && (
            <div
              className="mt-4 rounded-2xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(251, 191, 36, 0.2)', border: '2px solid rgba(251, 191, 36, 0.3)' }}
            >
              <span className="text-2xl">🎉</span>
              <p className="text-sm text-yellow-100 font-bold">
                {todayCount >= 5
                  ? `太棒了！你今天已閱讀了 ${todayCount} 篇文章！繼續保持！`
                  : `你今天已閱讀了 ${todayCount} 篇文章！再讀多一點吧！`}
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ fill: '#FFF9F0' }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2">
          {[
            { key: 'history', icon: '📖', label: '閱讀紀錄' },
            { key: 'vocabulary', icon: '📚', label: '我的詞彙' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95"
              style={
                activeTab === tab.key
                  ? { background: 'linear-gradient(135deg, #EF4444, #3B82F6)', color: 'white', boxShadow: '0 4px 0 0 #5B21B6' }
                  : { background: 'white', color: '#6B7280', border: '2px solid #E5E7EB' }
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-4 animate-bounce">📚</div>
            <div className="spinner-fun mb-3" />
            <p className="text-gray-500 font-bold">載入中...</p>
          </div>
        ) : activeTab === 'history' ? (
          readingHistory.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white" style={{ border: '2px dashed #E5E7EB' }}>
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 font-bold text-lg">還沒有閱讀紀錄</p>
              <p className="text-gray-400 text-sm mt-1">快去閱讀你的第一篇文章吧！</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 4px 0 0 #5B21B6' }}
              >
                🚀 開始閱讀
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {readingHistory.map((item) => {
                const article = item.articles as unknown as Article;
                if (!article) return null;
                const colors = CATEGORY_COLORS[article.category];
                const catEmojis: Record<string, string> = { hong_kong: '🦁', china: '🐉', international: '🌍' };
                return (
                  <Link
                    key={item.id}
                    to={`/article/${article.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl transition-all hover:scale-[1.01]"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid #F3F4F6' }}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl ${colors.light} flex items-center justify-center text-xl shrink-0`}
                    >
                      {catEmojis[article.category] || '📰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold ${colors.text}`}>{CATEGORY_LABELS[article.category]}</span>
                        <span className="text-xs text-gray-400">
                          {article.language === 'zh' ? '中文' : 'English'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(item.read_at).toLocaleDateString('zh-HK')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )
        ) : savedVocab.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white" style={{ border: '2px dashed #E5E7EB' }}>
            <div className="text-5xl mb-4">🔖</div>
            <p className="text-gray-500 font-bold text-lg">還沒有收藏的詞彙</p>
            <p className="text-gray-400 text-sm mt-1">閱讀文章時按書籤圖標即可收藏</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedVocab.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-white rounded-2xl"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid #F0FDF4' }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
                >
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-black text-teal-600">{item.word_zh}</span>
                    <span className="text-sm text-gray-500 font-medium">{item.word_en}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{item.explanation_zh}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.explanation_en}</p>
                  <p className="text-xs text-gray-300 mt-2 font-medium">
                    📰 來自：{item.articles?.title || '未知文章'}
                  </p>
                </div>
                <button
                  onClick={() => deleteVocab(item.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
