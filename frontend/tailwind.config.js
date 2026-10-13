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
        lenny: {
          dark: '#0b0f19',
          card: '#131b2e',
          elevated: '#1a233a',
          border: 'rgba(255, 255, 255, 0.08)',
          mint: '#10b981',
          accent: '#6366f1',
          cyan: '#38bdf8',
        }
      }
    },
  },
  plugins: [],
}
