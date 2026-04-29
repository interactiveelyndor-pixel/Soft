/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#991b1b',
        'primary-light': '#b91c1c',
        accent: '#c6a34f',
        'accent-dim': '#a0845a',
        surface: '#0c0c0e',
        'surface-raised': '#141417',
        'text-dim': '#71717a',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glow-primary': 'radial-gradient(circle at 50% 50%, rgba(153,27,27,0.08) 0%, transparent 70%)',
        'glow-accent': 'radial-gradient(circle at 50% 50%, rgba(198,163,79,0.06) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
