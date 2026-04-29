import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative mt-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B, #312E81)' }}>
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ fill: '#FFF9F0' }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Rainbow stripe */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #EF4444, #3B82F6, #F97316, #F59E0B, #10B981, #8B5CF6)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/SNKKids.png"
                alt="SNK Kids Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <span className="block text-xl font-black text-white">SNK Kids</span>

              </div>
            </div>
            <p className="text-sm text-purple-200 leading-relaxed">
              為香港小學生設計的雙語新聞平台，讓孩子從不同角度理解世界，培養批判性思維。🌟
            </p>
            <div className="flex gap-2 mt-4">
              {['📰', '🌍', '🧠', '💡'].map((emoji, i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-white/10 hover:bg-white/20 transition-colors cursor-default"
                  aria-hidden="true"
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)' }}>📂</span>
              新聞分類
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/hong_kong" className="flex items-center gap-2 text-sm text-purple-200 hover:text-yellow-300 transition-colors font-medium">
                  🦁 香港新聞
                </Link>
              </li>
              <li>
                <Link to="/category/china" className="flex items-center gap-2 text-sm text-purple-200 hover:text-yellow-300 transition-colors font-medium">
                  🐉 中國新聞
                </Link>
              </li>
              <li>
                <Link to="/category/international" className="flex items-center gap-2 text-sm text-purple-200 hover:text-yellow-300 transition-colors font-medium">
                  🌍 國際新聞
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #F97316, #F59E0B)' }}>ℹ️</span>
              關於 SNK Kids
            </h3>
            <ul className="space-y-2">
              {[
                { icon: '📅', text: '每日更新雙語新聞' },
                { icon: '📖', text: '適合小學生閱讀程度' },
                { icon: '🧠', text: '多角度思考訓練' },
                { icon: '🏆', text: '積分獎勵系統' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-sm text-purple-200 font-medium">
                  <span aria-hidden="true">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-purple-300 font-medium">
            © 2026 SNK Kids. 所有內容僅供教育用途。
          </p>
          <p className="text-xs text-purple-300 font-medium flex items-center gap-1">
            以 ❤️ 為香港學生製作
          </p>
        </div>
      </div>
    </footer>
  );
}
