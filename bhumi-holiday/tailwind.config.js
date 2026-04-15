/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#daeaff',
          200: '#bdd7ff',
          300: '#90bcff',
          400: '#5c96ff',
          500: '#3370f5',
          600: '#1a4feb',
          700: '#1340d8',
          800: '#1636af',
          900: '#183089',
          950: '#131e54',
        },
        sky: {
          gradient: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1340d8 0%, #0ea5e9 50%, #38bdf8 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
      },
      animation: {
        'float':       'float 8s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 1.6s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-up':     'fadeSlideUp 0.5s ease forwards',
        'pulse-ring':  'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)'   },
          '33%':      { transform: 'translateY(-10px) rotate(1deg)'  },
          '66%':      { transform: 'translateY(-5px) rotate(-1deg)'  },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(99,102,241,0.5)' },
          '70%':  { transform: 'scale(1)',    boxShadow: '0 0 0 10px rgba(99,102,241,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(99,102,241,0)'   },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 30px rgba(51, 112, 245, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
