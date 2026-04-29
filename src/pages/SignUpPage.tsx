import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const { user, signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
      setError('密碼至少需要6個字符');
      setLoading(false);
      return;
    }
    const { error: err } = await signUp(email, password, username);
    if (err) {
      if (err.includes('already registered')) setError('此電郵已經註冊');
      else setError(err);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF9F0' }}>
        <div className="text-center max-w-md">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', boxShadow: '0 6px 0 0 #065F46' }}
          >
            🎉
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-3">註冊成功！</h1>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            歡迎加入小小新聞通！<br />開始你的閱讀之旅，探索世界吧！🌍
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 4px 0 0 #5B21B6' }}
          >
            🚀 開始閱讀
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', transform: 'translate(-40%, 40%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 6px 0 0 #5B21B6' }}
          >
            🌟
          </div>
          <h1 className="text-3xl font-black text-gray-800">免費加入！</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">加入小小新聞通，探索世界 🌍</p>
        </div>

        {/* Perks row */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {['📰 無限閱讀', '🔖 收藏詞彙', '🏆 積分獎勵'].map((perk) => (
            <span
              key={perk}
              className="px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: '#F5F3FF', color: '#7C3AED', border: '2px solid #EDE9FE' }}
            >
              {perk}
            </span>
          ))}
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
              <label className="block text-sm font-black text-gray-700 mb-2">😊 用戶名稱</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium transition-all focus:outline-none"
                  style={{ border: '2px solid #EDE9FE', background: '#FAFAFA' }}
                  onFocus={(e) => { e.target.style.border = '2px solid #7C3AED'; e.target.style.background = 'white'; }}
                  onBlur={(e) => { e.target.style.border = '2px solid #EDE9FE'; e.target.style.background = '#FAFAFA'; }}
                  placeholder="你的暱稱"
                />
              </div>
            </div>

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
                  placeholder="至少6個字符"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 4px 0 0 #5B21B6' }}
            >
              {loading ? '註冊中...' : '🎉 免費註冊'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">
              已有帳戶？{' '}
              <Link to="/login" className="font-black hover:underline" style={{ color: '#7C3AED' }}>
                登入 →
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
