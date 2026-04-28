import { X, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">繼續閱讀全文</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            免費註冊或登入以閱讀全文，還可以收藏詞彙、記錄閱讀進度！
          </p>

          <div className="space-y-3">
            <Link
              to="/signup"
              onClick={onClose}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-center shadow-md hover:shadow-lg transition-shadow"
            >
              免費註冊
            </Link>
            <Link
              to="/login"
              onClick={onClose}
              className="block w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50 transition-colors"
            >
              登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
