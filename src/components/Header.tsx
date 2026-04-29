import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: '🏠 首頁', emoji: '🏠' },
    { to: '/category/hong_kong', label: '🦁 香港新聞', emoji: '🦁' },
    { to: '/category/china', label: '🐉 中國新聞', emoji: '🐉' },
    { to: '/category/international', label: '🌍 國際新聞', emoji: '🌍' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md" style={{ borderBottom: '3px solid #7C3AED' }}>
      {/* Top rainbow stripe */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #EF4444, #3B82F6, #F97316, #F59E0B, #10B981, #8B5CF6)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="SNK Kids 小小新聞通 首頁">
            <img
              src="/SNKKids.png"
              alt="SNK Kids Logo"
              className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
            />
            <div className="leading-tight">
              <span className="block text-lg font-black" style={{ color: '#EF4444', fontFamily: 'Nunito, sans-serif' }}>
                SNK Kids
              </span>
              <span className="block text-xs font-bold text-gray-400 -mt-0.5">小小新聞通</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="主要導航">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
                style={isActive(link.to) ? { background: 'linear-gradient(135deg, #EF4444, #3B82F6)' } : {}}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{profile?.username || '我的帳戶'}</span>
                  {profile && profile.articles_read_today > 0 && (
                    <span className="text-white text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #F97316, #F59E0B)' }}>
                      {profile.articles_read_today}
                    </span>
                  )}
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-3 py-2 rounded-2xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-red-700 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  登入
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-2xl text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 4px 0 0 #B91C1C' }}
                >
                  免費註冊 🎉
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-2xl text-red-600 hover:bg-red-50 transition-colors"
            aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-red-100 bg-white">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive(link.to)
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
                style={isActive(link.to) ? { background: 'linear-gradient(135deg, #EF4444, #3B82F6)' } : {}}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t-2 border-gray-100 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-bold text-red-700 bg-red-50"
                  >
                    👤 我的帳戶
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-bold text-red-700 border-2 border-red-200 text-center"
                  >
                    登入
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-black text-white text-center"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}
                  >
                    免費註冊 🎉
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
