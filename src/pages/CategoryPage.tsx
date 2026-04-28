import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import AuthModal from '../components/AuthModal';
import type { Article, Category } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/types';
import { ArrowLeft, BookOpen, Globe, TrendingUp } from 'lucide-react';

const CATEGORY_ICONS: Record<Category, typeof BookOpen> = {
  hong_kong: TrendingUp,
  china: BookOpen,
  international: Globe,
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [langFilter, setLangFilter] = useState<'all' | 'zh' | 'en'>('all');

  const cat = category as Category;
  const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.hong_kong;
  const Icon = CATEGORY_ICONS[cat] || BookOpen;

  useEffect(() => {
    const fetchArticles = async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('category', cat)
        .order('published_at', { ascending: false })
        .limit(20);

      if (langFilter !== 'all') {
        query = query.eq('language', langFilter);
      }

      const { data } = await query;
      setArticles(data || []);
      setLoading(false);
    };
    if (cat) fetchArticles();
  }, [cat, langFilter]);

  const handleReadMore = () => {
    if (!user) setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className={`${colors.light} border-b ${colors.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回首頁
          </Link>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{CATEGORY_LABELS[cat] || '新聞'}</h1>
              <p className="text-sm text-gray-500 mt-1">每日精選，雙語呈現</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {[
              { key: 'all', label: '全部' },
              { key: 'zh', label: '中文' },
              { key: 'en', label: 'English' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setLangFilter(key as typeof langFilter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  langFilter === key
                    ? `${colors.bg} text-white shadow-sm`
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">暫無文章，請稍後再來！</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isLoggedIn={!!user}
                onReadMore={handleReadMore}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
