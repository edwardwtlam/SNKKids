/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7C3AED',
          pink: '#EC4899',
          yellow: '#F59E0B',
          orange: '#F97316',
          teal: '#0D9488',
          cyan: '#06B6D4',
          green: '#10B981',
          red: '#EF4444',
        },
        fun: {
          bg: '#FFF9F0',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"Nunito"', '"Noto Sans TC"', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
        body: ['"Noto Sans TC"', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'fun': '0 4px 0 0 rgba(0,0,0,0.15)',
        'fun-lg': '0 6px 0 0 rgba(0,0,0,0.15)',
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
