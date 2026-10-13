/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: {
          50: '#ffffff',
          100: '#fafaf9',
          200: '#f5f5f4',
          300: '#e7e5e4',
          400: '#d6d3d1',
          500: '#a8a29e',
          600: '#78716c',
          700: '#57534e',
          800: '#292524',
          900: '#1c1917',
        },
        ink: {
          primary: '#18181b',
          secondary: '#3f3f46',
          muted: '#71717a',
          faint: '#a1a1aa',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

