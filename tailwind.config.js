/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#21354F',
          light:   '#2d4a6e',
          dark:    '#172537',
          deeper:  '#0f1e2e',
        },
        gold: {
          DEFAULT: '#F0C419',
          light:   '#f5d45a',
          dark:    '#c9a30d',
          muted:   'rgba(240,196,25,0.12)',
        },
        surface: {
          50:  '#f8f9fb',
          100: '#f0f2f5',
          200: '#e2e6ec',
          700: '#5a6a7e',
          800: '#1e2d3d',
          900: '#141f2c',
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body:    ['"Instrument Sans"',     'sans-serif'],
        mono:    ['"JetBrains Mono"',      'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight:   '-0.03em',
      },
      boxShadow: {
        'gold':       '0 0 0 2px #F0C419',
        'card':       '0 1px 3px rgba(33,53,79,0.07), 0 4px 16px rgba(33,53,79,0.05)',
        'card-hover': '0 4px 12px rgba(33,53,79,0.1), 0 12px 32px rgba(33,53,79,0.08)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-dot':'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.4', transform: 'scale(0.8)' } },
      },
    },
  },
  plugins: [],
}
