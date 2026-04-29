import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err === 'Invalid login credentials' ? '電郵或密碼不正確' : err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #F97316, #F59E0B)', transform: 'translate(40%, 40%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 6px 0 0 #B91C1C' }}
          >
            👋
          </div>
          <h1 className="text-3xl font-black text-gray-800">歡迎回來！</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">登入繼續你的閱讀之旅 📚</p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-3xl p-8"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)', border: '2px solid #EDE9FE' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-2xl text-sm font-bold" style={{ background: '#FEF2F2', border: '2px solid #FECACA', color: '#DC2626' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">📧 電郵地址</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
                  style={{ border: '2px solid #EDE9FE', background: '#FAFAFA' }}
                  onFocus={(e) => { e.target.style.border = '2px solid #7C3AED'; e.target.style.background = 'white'; }}
                  onBlur={(e) => { e.target.style.border = '2px solid #EDE9FE'; e.target.style.background = '#FAFAFA'; }}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">🔒 密碼</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
                  style={{ border: '2px solid #EDE9FE', background: '#FAFAFA' }}
                  onFocus={(e) => { e.target.style.border = '2px solid #7C3AED'; e.target.style.background = 'white'; }}
                  onBlur={(e) => { e.target.style.border = '2px solid #EDE9FE'; e.target.style.background = '#FAFAFA'; }}
                  placeholder="輸入密碼"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 4px 0 0 #5B21B6' }}
            >
              {loading ? '登入中...' : '🚀 登入'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              還沒有帳戶？{' '}
              <Link to="/signup" className="font-black hover:underline" style={{ color: '#7C3AED' }}>
                免費註冊 🎉
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
