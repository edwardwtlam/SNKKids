import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 6px 0 0 #5B21B6' }}
        >
          🔐
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          登入後才能閱讀！
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
          免費加入SNK Kids，解鎖所有文章，追蹤閱讀進度，收藏喜愛的詞彙！
        </p>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: '📰', text: '無限閱讀' },
            { icon: '📊', text: '追蹤進度' },
            { icon: '🔖', text: '收藏詞彙' },
            { icon: '🏆', text: '積分獎勵' },
          ].map((perk) => (
            <div
              key={perk.text}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-gray-600"
              style={{ background: '#F5F3FF', border: '2px solid #EDE9FE' }}
            >
              <span>{perk.icon}</span>
              {perk.text}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            to="/signup"
            onClick={onClose}
            className="block w-full py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EF4444, #3B82F6)', boxShadow: '0 4px 0 0 #5B21B6' }}
          >
            🎉 免費註冊
          </Link>
          <Link
            to="/login"
            onClick={onClose}
            className="block w-full py-3 rounded-2xl font-black text-red-700 text-sm transition-all hover:bg-purple-50"
            style={{ border: '2px solid #DDD6FE' }}
          >
            已有帳號？登入
          </Link>
        </div>
      </div>
    </div>
  );
}
