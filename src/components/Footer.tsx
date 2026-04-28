import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                小小<span className="text-teal-400">新聞通</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              為香港小學生設計的雙語新聞平台，讓孩子從不同角度理解世界，培養批判性思維。
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">新聞分類</h3>
            <ul className="space-y-2">
              <li><Link to="/category/hong_kong" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">香港新聞</Link></li>
              <li><Link to="/category/china" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">中國新聞</Link></li>
              <li><Link to="/category/international" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">國際新聞</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">關於我們</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-400">每日更新雙語新聞</span></li>
              <li><span className="text-sm text-gray-400">適合小學生閱讀程度</span></li>
              <li><span className="text-sm text-gray-400">多角度思考訓練</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2026 小小新聞通. 所有內容僅供教育用途。
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            以 <Heart className="w-3 h-3 text-rose-400" /> 為香港學生製作
          </p>
        </div>
      </div>
    </footer>
  );
}
