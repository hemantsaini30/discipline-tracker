/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f11',
          secondary: '#16161a',
          card: '#1c1c22',
          hover: '#222228',
        },
        border: '#2a2a32',
        accent: {
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          blue: '#3b82f6',
          purple: '#8b5cf6',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#8888a0',
          muted: '#55556a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
