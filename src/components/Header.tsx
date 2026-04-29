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
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #7C3AED, #EC4899, #F97316, #F59E0B, #10B981, #06B6D4)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
            >
              📰
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-black" style={{ color: '#7C3AED', fontFamily: 'Nunito, sans-serif' }}>
                小小新聞通
              </span>
              <span className="block text-xs font-bold text-gray-400 -mt-0.5">SNK Kids News</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
                style={isActive(link.to) ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)' } : {}}
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
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
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
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  登入
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-2xl text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 4px 0 0 #5B21B6' }}
                >
                  免費註冊 🎉
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-2xl text-purple-700 hover:bg-purple-50 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-purple-100 bg-white animate-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive(link.to)
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
                style={isActive(link.to) ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)' } : {}}
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
                    className="block px-4 py-3 rounded-2xl text-sm font-bold text-purple-700 bg-purple-50"
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
                    className="block px-4 py-3 rounded-2xl text-sm font-bold text-purple-700 border-2 border-purple-200 text-center"
                  >
                    登入
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-black text-white text-center"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
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
