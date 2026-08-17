/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── TEMA BÍBLICO ───
        gold: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#D4A843',
          600: '#B8922A',
          700: '#8B6914',
          800: '#5E4A0F',
          900: '#3A2E08',
        },
        navy: {
          50: '#E8EAF0',
          100: '#C5C9D9',
          200: '#9EA5BF',
          300: '#7781A5',
          400: '#596693',
          500: '#3B4B81',
          600: '#354479',
          700: '#2D3B6E',
          800: '#253263',
          900: '#172151',
          950: '#0D1333',
        },
        parchment: {
          50: '#FEFCF7',
          100: '#FDF8EE',
          200: '#FAF0D9',
          300: '#F5E4BE',
          400: '#EDD49A',
          500: '#E5C476',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 168, 67, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 168, 67, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
