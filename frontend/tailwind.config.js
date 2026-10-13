/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#040508',
          900: '#06080d',
          850: '#0a0d15',
          800: '#0f1422',
          700: '#171f33',
          600: '#222d47',
        },
        aurora: {
          emerald: '#10b981',
          mint: '#34d399',
          jade: '#059669',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'glow-indigo': '0 0 35px -5px rgba(99, 102, 241, 0.25)',
        'glow-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'soundwave-1': 'soundwave 1.2s ease-in-out infinite 0.1s',
        'soundwave-2': 'soundwave 1.2s ease-in-out infinite 0.3s',
        'soundwave-3': 'soundwave 1.2s ease-in-out infinite 0.2s',
        'soundwave-4': 'soundwave 1.2s ease-in-out infinite 0.4s',
        'aurora-glow': 'aurora 8s ease infinite alternate',
      },
      keyframes: {
        soundwave: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        aurora: {
          '0%': { opacity: '0.4', transform: 'scale(1) rotate(0deg)' },
          '100%': { opacity: '0.8', transform: 'scale(1.1) rotate(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
