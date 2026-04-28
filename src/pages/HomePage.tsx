import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import AuthModal from '../components/AuthModal';
import type { Article } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/types';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Globe, BookOpen, TrendingUp } from 'lucide-react';

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
        .limit(20);
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

  const hkArticles = articles.filter((a) => a.category === 'hong_kong').slice(0, 2);
  const cnArticles = articles.filter((a) => a.category === 'china').slice(0, 2);
  const intlArticles = articles.filter((a) => a.category === 'international').slice(0, 2);

  const loggedIn = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <ArticleCard
            article={featured}
            isLoggedIn={loggedIn}
            onReadMore={handleReadMore}
            variant="hero"
          />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-800 mb-1">每日新鮮出爐！</h2>
              <p className="text-sm text-amber-700 leading-relaxed">
                每天為你精選香港、中國和國際新聞，用簡單的文字，從不同角度了解世界。中英雙語，培養你的閱讀和思考能力！
              </p>
            </div>
          </div>
        </div>
      </section>

      {[
        { key: 'hong_kong' as const, items: hkArticles, icon: TrendingUp },
        { key: 'china' as const, items: cnArticles, icon: BookOpen },
        { key: 'international' as const, items: intlArticles, icon: Globe },
      ].map(({ key, items, icon: Icon }) => {
        const colors = CATEGORY_COLORS[key];
        return (
          <section key={key} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.light} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{CATEGORY_LABELS[key]}</h2>
              </div>
              <Link
                to={`/category/${key}`}
                className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isLoggedIn={loggedIn}
                  onReadMore={handleReadMore}
                />
              ))}
              {items.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                  暫無文章，請稍後再來！
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
