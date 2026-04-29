import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import AuthModal from '../components/AuthModal';
import type { Article, Category } from '../lib/types';
import { CATEGORY_LABELS } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

const CATEGORY_CONFIG: Record<string, {
  emoji: string;
  gradient: string;
  shadow: string;
  desc: string;
}> = {
  hong_kong: {
    emoji: '🦁',
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
    shadow: '0 4px 0 0 #C2410C',
    desc: '香港本地大小事，一起關心身邊的社區！',
  },
  china: {
    emoji: '🐉',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    shadow: '0 4px 0 0 #B45309',
    desc: '了解中國各地的最新動態和精彩故事！',
  },
  international: {
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    shadow: '0 4px 0 0 #6D28D9',
    desc: '環遊世界，探索地球每個角落的新鮮事！',
  },
};

type LangFilter = 'all' | 'zh' | 'en';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const cfg = CATEGORY_CONFIG[category || ''] || CATEGORY_CONFIG.international;
  const label = CATEGORY_LABELS[category as Category] || category;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      let query = supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(30);

      if (langFilter !== 'all') {
        query = query.eq('language', langFilter);
      }

      const { data } = await query;
      setArticles(data || []);
      setLoading(false);
    };
    fetchArticles();
  }, [category, langFilter]);

  const handleReadMore = () => {
    if (!user) setAuthModalOpen(true);
  };

  const loggedIn = !!user;

  const categoryTitle = CATEGORY_LABELS[category as string] || category;
  const categoryDesc: Record<string, string> = {
    hong_kong: '香港本地新聞，包括社會、教育、交通及社區大小事。專為香港小學生設計。',
    china: '中國各地最新動態和精彩故事，讓小朋友了解神州大地的多元文化。',
    international: '環遊世界，探索地球每個角落的新鮮事。國際新聞雙語版本。',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F0' }}>
      <Helmet>
        <title>{categoryTitle} | SNK Kids 小小新聞通</title>
        <meta name="description" content={categoryDesc[category as string] || `SNK Kids 小小新聞通 — ${categoryTitle}新聞，中英雙語，培養批判性思維。`} />
        <meta property="og:title" content={`${categoryTitle} | SNK Kids 小小新聞通`} />
        <meta property="og:description" content={categoryDesc[category as string] || `SNK Kids ${categoryTitle}新聞`} />
        <meta property="og:url" content={`https://www.snkkids.com/category/${category}`} />
        <link rel="canonical" href={`https://www.snkkids.com/category/${category}`} />
      </Helmet>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Hero Header */}
      <div className="relative overflow-hidden py-10 px-4" style={{ background: cfg.gradient }}>
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -right-8 w-48 h-48 rounded-full bg-white/10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-white/20 backdrop-blur-sm"
              style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.15)' }}
            >
              {cfg.emoji}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{label}</h1>
              <p className="text-white/80 text-sm font-medium mt-1">{cfg.desc}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ fill: '#FFF9F0' }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-black text-gray-600 mr-1">語言篩選：</span>
          {([
            { value: 'all', label: '🌐 全部' },
            { value: 'zh', label: '🇨🇳 中文' },
            { value: 'en', label: '🇬🇧 English' },
          ] as { value: LangFilter; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLangFilter(opt.value)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={
                langFilter === opt.value
                  ? { background: cfg.gradient, color: 'white', boxShadow: cfg.shadow }
                  : { background: 'white', color: '#6B7280', border: '2px solid #E5E7EB' }
              }
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 font-medium">
            共 {articles.length} 篇文章
          </span>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4 animate-bounce">{cfg.emoji}</div>
            <div className="spinner-fun mb-3" />
            <p className="text-gray-500 font-bold">載入文章中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white" style={{ border: '2px dashed #E5E7EB' }}>
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 font-bold text-lg">暫無文章</p>
            <p className="text-gray-400 text-sm mt-1">請稍後再來或選擇其他分類！</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-2xl font-black text-white transition-all hover:scale-105"
              style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
            >
              ← 返回首頁
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isLoggedIn={loggedIn}
                onReadMore={handleReadMore}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
