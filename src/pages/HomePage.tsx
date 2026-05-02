import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import AuthModal from '../components/AuthModal';
import type { Article } from '../lib/types';
import { CATEGORY_LABELS } from '../lib/types';
import { Link } from 'react-router-dom';

const CATEGORY_CONFIG = {
  hong_kong: {
    emoji: '🦁',
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
    shadow: '0 4px 0 0 #C2410C',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    lightBg: '#FFF7ED',
    desc: '香港本地大小事，一起關心身邊的社區！',
  },
  china: {
    emoji: '🐉',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    shadow: '0 4px 0 0 #B45309',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    lightBg: '#FFFBEB',
    desc: '了解中國各地的最新動態和精彩故事！',
  },
  international: {
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    shadow: '0 4px 0 0 #6D28D9',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    lightBg: '#F5F3FF',
    desc: '環遊世界，探索地球每個角落的新鮮事！',
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60);
      if (data && data.length > 0) {
        const feat = data.find((a: Article) => a.is_featured) || data[0];
        setFeatured(feat);
        setArticles(data.filter((a: Article) => a.id !== feat.id));
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const handleReadMore = () => {
    if (!user) setAuthModalOpen(true);
  };

  const hkArticles = articles.filter((a) => a.category === 'hong_kong').slice(0, 4);
  const cnArticles = articles.filter((a) => a.category === 'china').slice(0, 4);
  const intlArticles = articles.filter((a) => a.category === 'international').slice(0, 4);

  const loggedIn = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fun-dots" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📰</div>
          <div className="spinner-fun mx-auto mb-3" />
          <p className="text-purple-600 font-bold">載入中，請稍候...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F0' }}>
      <Helmet>
        <title>SNK Kids | 香港小學生雙語新聞平台</title>
        <meta name="description" content="SNK Kids 每日精選香港、中國及國際新聞，中英雙語，培養批判性思維。專為8至14歲香港小學生設計。" />
        <meta property="og:title" content="SNK Kids | 香港小學生雙語新聞平台" />
        <meta property="og:description" content="每日精選香港、中國及國際新聞，中英雙語，培養批判性思維。" />
        <meta property="og:url" content="https://www.snkkids.com/" />
        <link rel="canonical" href="https://www.snkkids.com/" />
      </Helmet>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #3B82F6 50%, #8B5CF6 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-yellow-300/20" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-bold mb-4 backdrop-blur-sm">
              ✨ 每日更新 · 雙語新聞 · 培養思維
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
              歡迎來到<br />
              <span className="text-yellow-300">SNK Kids！</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg font-medium max-w-xl mx-auto">
              用簡單有趣的方式，帶你了解香港、中國和世界各地的最新消息 🌟
            </p>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { icon: '📰', label: '每日新聞', value: '3+篇' },
              { icon: '🌐', label: '中英雙語', value: '雙語學習' },
              { icon: '🧠', label: '批判思維', value: '多角度' },
              { icon: '🎯', label: '適合年齡', value: '8-14歲' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center text-white min-w-[90px]">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xs font-bold opacity-80">{stat.label}</div>
                <div className="text-sm font-black">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ fill: '#FFF9F0' }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-black text-gray-800">今日精選</h2>
            <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}>
              HOT
            </span>
          </div>
          <ArticleCard
            article={featured}
            isLoggedIn={loggedIn}
            onReadMore={handleReadMore}
            variant="hero"
          />
        </section>
      )}

      {/* Daily Tip Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div
          className="rounded-3xl p-5 flex items-start gap-4"
          style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '2px dashed #F97316' }}
        >
          <div className="text-3xl animate-wiggle shrink-0">💡</div>
          <div>
            <h3 className="text-base font-black text-orange-800 mb-1">每日新鮮出爐！</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              每天為你精選香港、中國和國際新聞，用簡單的文字，從不同角度了解世界。中英雙語，培養你的閱讀和思考能力！
            </p>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {(
        [
          { key: 'hong_kong' as const, items: hkArticles },
          { key: 'china' as const, items: cnArticles },
          { key: 'international' as const, items: intlArticles },
        ] as const
      ).map(({ key, items }) => {
        const cfg = CATEGORY_CONFIG[key];
        return (
          <section key={key} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Section Header */}
            <div
              className="rounded-3xl p-5 mb-5 flex items-center justify-between"
              style={{ background: cfg.lightBg, border: `2px solid`, borderColor: cfg.border.replace('border-', '') }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md"
                  style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
                >
                  {cfg.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800">{CATEGORY_LABELS[key]}</h2>
                  <p className="text-xs text-gray-500 font-medium">{cfg.desc}</p>
                </div>
              </div>
              <Link
                to={`/category/${key}`}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shrink-0"
                style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
              >
                查看全部 →
              </Link>
            </div>

            {/* Article Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isLoggedIn={loggedIn}
                  onReadMore={handleReadMore}
                />
              ))}
              {items.length === 0 && (
                <div className="col-span-4 text-center py-12 rounded-3xl bg-white" style={{ border: '2px dashed #E5E7EB' }}>
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400 font-bold">暫無文章，請稍後再來！</p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* CTA Section for non-logged-in users */}
      {!loggedIn && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div
            className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                立即免費加入，開始閱讀！
              </h2>
              <p className="text-white/85 text-base mb-6 max-w-md mx-auto font-medium">
                免費註冊，解鎖所有文章，追蹤你的閱讀進度，收藏喜愛的詞彙！
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  to="/signup"
                  className="px-8 py-3 rounded-2xl font-black text-purple-700 bg-white transition-all hover:scale-105 active:scale-95"
                  style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.2)' }}
                >
                  🎉 免費註冊
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-2xl font-black text-white border-2 border-white/50 hover:bg-white/10 transition-all"
                >
                  已有帳號？登入
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
