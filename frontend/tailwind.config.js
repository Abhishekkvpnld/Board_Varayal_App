/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          gold: '#f59e0b',
          crimson: '#e11d48',
          emerald: '#10b981',
          indigo: '#6366f1'
        },
        dark: {
          900: '#0b0f19',
          850: '#111827',
          800: '#1e293b',
          700: '#334155',
          600: '#475569'
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)' },
          '100%': { boxShadow: '0 0 25px rgba(249, 115, 22, 0.9), 0 0 45px rgba(234, 88, 12, 0.6)' }
        }
      }
    },
  },
  plugins: [],
};

