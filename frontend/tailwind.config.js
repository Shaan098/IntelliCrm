/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          300: '#b69eff',
          400: '#9b7fff',
          500: '#7c5cfc',
          600: '#5f3fdb',
          700: '#4a2fc7',
        },
        accent: {
          300: '#5eefd9',
          400: '#33dfbe',
          500: '#00d4aa',
          600: '#00aa88',
        },
        surface: {
          base:     '#0a0a0f',
          card:     '#111118',
          elevated: '#1a1a24',
          overlay:  '#22222f',
        },
        border: {
          DEFAULT: '#2a2a3a',
          hover:   '#3a3a50',
          focus:   '#7c5cfc',
        },
        text: {
          primary:   '#f0f0ff',
          secondary: '#9090b0',
          muted:     '#5a5a78',
        },
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #7c5cfc 0%, #5b8af5 100%)',
        'gradient-ai':     'linear-gradient(135deg, #00d4aa 0%, #7c5cfc 100%)',
        'gradient-glass':  'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'gradient-radial-brand': 'radial-gradient(ellipse at top, rgba(124,92,252,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'brand':    '0 0 24px rgba(124,92,252,0.2)',
        'brand-lg': '0 0 48px rgba(124,92,252,0.3)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)',
        'card-lg':  '0 4px 16px rgba(0,0,0,0.5)',
        'glow-sm':  '0 0 10px rgba(124,92,252,0.15)',
        'glow-accent': '0 0 20px rgba(0,212,170,0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
